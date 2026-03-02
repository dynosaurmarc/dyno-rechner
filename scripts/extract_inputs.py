#!/usr/bin/env python3
"""Extract purple input cells from public/model.xlsx into app/inputs.schema.json."""

from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILE = ROOT / "public" / "model.xlsx"
OUTPUT_FILE = ROOT / "app" / "inputs.schema.json"
TARGET_RGB = "FF843DFF"
NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main", "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}


def col_to_index(col: str) -> int:
    total = 0
    for char in col:
        total = total * 26 + (ord(char) - 64)
    return total


def cell_sort_key(ref: str) -> tuple[int, int]:
    match = re.fullmatch(r"([A-Z]+)(\d+)", ref)
    if not match:
        return (10**9, 10**9)
    col, row = match.groups()
    return int(row), col_to_index(col)


def parse_shared_strings(zf: ZipFile) -> list[str]:
    path = "xl/sharedStrings.xml"
    if path not in zf.namelist():
        return []
    root = ET.fromstring(zf.read(path))
    values: list[str] = []
    for si in root.findall("x:si", NS):
        text_parts = [node.text or "" for node in si.findall(".//x:t", NS)]
        values.append("".join(text_parts))
    return values


def parse_fill_ids_with_target_color(zf: ZipFile) -> set[int]:
    styles = ET.fromstring(zf.read("xl/styles.xml"))
    matching_fill_ids: set[int] = set()
    fills = styles.find("x:fills", NS)
    if fills is None:
        return matching_fill_ids

    for fill_id, fill in enumerate(fills.findall("x:fill", NS)):
        pattern = fill.find("x:patternFill", NS)
        if pattern is None:
            continue
        fg = pattern.find("x:fgColor", NS)
        if fg is not None and fg.get("rgb") == TARGET_RGB:
            matching_fill_ids.add(fill_id)
    return matching_fill_ids


def parse_style_indexes_with_target_fill(zf: ZipFile, matching_fill_ids: set[int]) -> set[int]:
    styles = ET.fromstring(zf.read("xl/styles.xml"))
    xfs = styles.find("x:cellXfs", NS)
    if xfs is None:
        return set()

    indexes: set[int] = set()
    for idx, xf in enumerate(xfs.findall("x:xf", NS)):
        fill_id = int(xf.get("fillId", "0"))
        if fill_id in matching_fill_ids:
            indexes.add(idx)
    return indexes


def parse_sheet_names(zf: ZipFile) -> dict[str, str]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))

    rel_map = {rel.get("Id"): rel.get("Target") for rel in rels.findall("x:Relationship", {"x": "http://schemas.openxmlformats.org/package/2006/relationships"})}
    mapping: dict[str, str] = {}
    for sheet in workbook.findall("x:sheets/x:sheet", NS):
        name = sheet.get("name", "Sheet")
        rid = sheet.get(f"{{{NS['r']}}}id")
        target = rel_map.get(rid)
        if target:
            mapping[f"xl/{target}".replace("xl//", "xl/")] = name
    return mapping


def extract_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.get("t")
    value_node = cell.find("x:v", NS)
    if value_node is None or value_node.text is None:
        return ""

    raw_value = value_node.text
    if cell_type == "s":
        return shared_strings[int(raw_value)] if raw_value.isdigit() else ""
    return raw_value


def main() -> None:
    with ZipFile(SOURCE_FILE) as zf:
        shared_strings = parse_shared_strings(zf)
        matching_fill_ids = parse_fill_ids_with_target_color(zf)
        matching_style_indexes = parse_style_indexes_with_target_fill(zf, matching_fill_ids)
        sheet_name_map = parse_sheet_names(zf)

        inputs = []
        for sheet_path, sheet_name in sheet_name_map.items():
            root = ET.fromstring(zf.read(sheet_path))
            found = []
            for cell in root.findall(".//x:sheetData//x:c", NS):
                style_index = int(cell.get("s", "0"))
                if style_index not in matching_style_indexes:
                    continue
                ref = cell.get("r", "")
                found.append(
                    {
                        "id": f"{sheet_name}_{ref}",
                        "sheet": sheet_name,
                        "cell": ref,
                        "value": extract_cell_value(cell, shared_strings),
                    }
                )
            inputs.extend(sorted(found, key=lambda item: cell_sort_key(item["cell"])))

    schema = {
        "sourceFile": str(SOURCE_FILE.relative_to(ROOT)),
        "extractedAt": datetime.now(timezone.utc).isoformat(),
        "fillColor": TARGET_RGB,
        "inputs": inputs,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(schema, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(inputs)} input definitions to {OUTPUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
