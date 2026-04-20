from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

from openpyxl import load_workbook


DEFAULT_SUGGESTIONS = {
    "comprehension": "你已经具备不错的文本感知基础，继续巩固事实提取、人物关系和段落信息定位，会更稳定。",
    "analysis": "你对故事内容有一定把握，继续练习情节梳理、结构拆解和线索归纳，分析会更细致。",
    "expression": "你在概括和表达上有潜力，继续加强主旨概括、复述和观点表达，输出会更清晰。",
    "critical_thinking": "你在判断和思考上表现不错，继续练习因果判断、推理选择和观点辨析，思路会更敏锐。",
    "creativity": "你已经开始形成迁移意识，继续做联想迁移、改写应用和开放延展练习，会更灵活。",
    "memory": "你对信息的记忆基础不错，继续强化细节记忆、关键信息回忆和快速复盘，表现会更稳。",
}


TAG_SPLIT_PATTERN = re.compile(r"[;,|/、\n]+")


@dataclass
class ParsedQuestion:
    exam_id: str
    book_title: str
    submit_date: str
    question_no: int
    question_id: str
    tags: list[str]
    is_correct: bool
    question_score: float


def normalize_key(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip().lower().replace(" ", "_")


def coerce_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    text = str(value).strip().lower()
    return text in {"1", "true", "yes", "y", "是", "对", "正确"}


def coerce_float(value: Any, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Invalid numeric value: {value!r}") from exc


def coerce_int(value: Any, default: int = 0) -> int:
    if value is None or value == "":
        return default
    try:
        return int(float(value))
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Invalid integer value: {value!r}") from exc


def split_tags(value: Any) -> list[str]:
    if value is None:
        return []
    text = str(value).strip()
    if not text:
        return []
    return [item.strip() for item in TAG_SPLIT_PATTERN.split(text) if item.strip()]


def sheet_rows_to_dicts(sheet) -> list[dict[str, Any]]:
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    headers = [normalize_key(cell) for cell in rows[0]]
    items: list[dict[str, Any]] = []
    for row in rows[1:]:
        if all(cell is None or str(cell).strip() == "" for cell in row):
            continue
        item: dict[str, Any] = {}
        for index, header in enumerate(headers):
            if not header:
                continue
            item[header] = row[index] if index < len(row) else None
        items.append(item)
    return items


def find_sheet(workbook, candidates: Iterable[str]):
    normalized = {name.lower(): name for name in workbook.sheetnames}
    for candidate in candidates:
        if candidate.lower() in normalized:
            return workbook[normalized[candidate.lower()]]
    raise ValueError(f"Missing required sheet. Expected one of: {', '.join(candidates)}")


def load_input_from_excel(path: str | Path) -> dict[str, Any]:
    workbook = load_workbook(path, data_only=True)

    student_sheet = find_sheet(workbook, ["student", "students"])
    ability_sheet = find_sheet(workbook, ["ability_catalog", "abilities"])
    tag_map_sheet = find_sheet(workbook, ["tag_ability_map", "mapping"])
    question_sheet = find_sheet(workbook, ["questions", "question_details", "question_records"])

    student_rows = sheet_rows_to_dicts(student_sheet)
    if not student_rows:
        raise ValueError("Student sheet is empty.")
    student_row = student_rows[0]

    ability_catalog = []
    for row in sheet_rows_to_dicts(ability_sheet):
        ability_id = str(row.get("ability_id", "")).strip()
        ability_name = str(row.get("ability_name", "")).strip()
        if ability_id:
            ability_catalog.append({"ability_id": ability_id, "ability_name": ability_name})

    tag_ability_map = []
    for row in sheet_rows_to_dicts(tag_map_sheet):
        tag_name = str(row.get("tag_name", "")).strip()
        ability_id = str(row.get("ability_id", "")).strip()
        if tag_name and ability_id:
            tag_ability_map.append({"tag_name": tag_name, "ability_id": ability_id})

    questions: list[dict[str, Any]] = []
    for row in sheet_rows_to_dicts(question_sheet):
        tags = split_tags(row.get("tag_name"))
        questions.append(
            {
                "exam_id": str(row.get("exam_id", "")).strip(),
                "book_title": str(row.get("book_title", "")).strip(),
                "submit_date": str(row.get("submit_date", "")).strip(),
                "question_no": coerce_int(row.get("question_no")),
                "question_id": str(row.get("question_id", "")).strip(),
                "tags": tags,
                "is_correct": coerce_bool(row.get("is_correct")),
                "question_score": coerce_float(row.get("question_score"), 1.0),
            }
        )

    if not questions:
        raise ValueError("Questions sheet is empty.")

    return {
        "student": {
            "student_id": str(student_row.get("student_id", "")).strip(),
            "student_name": str(student_row.get("student_name", "")).strip(),
        },
        "ability_catalog": ability_catalog,
        "tag_ability_map": tag_ability_map,
        "questions": questions,
    }


def load_input_from_json(path: str | Path) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)

    student = payload.get("student", {})
    ability_catalog = payload.get("ability_catalog", [])
    tag_ability_map = payload.get("tag_ability_map", [])
    assessments = payload.get("assessments", [])

    questions: list[dict[str, Any]] = []
    for assessment in assessments:
        exam_id = str(assessment.get("exam_id", "")).strip()
        book_title = str(assessment.get("book_title", "")).strip()
        submit_date = str(assessment.get("submit_date", "")).strip()
        for question in assessment.get("questions", []):
            questions.append(
                {
                    "exam_id": exam_id,
                    "book_title": book_title,
                    "submit_date": submit_date,
                    "question_no": coerce_int(question.get("question_no")),
                    "question_id": str(question.get("question_id", "")).strip(),
                    "tags": split_tags(question.get("tag_name")),
                    "is_correct": coerce_bool(question.get("is_correct")),
                    "question_score": coerce_float(question.get("question_score"), 1.0),
                }
            )

    if not questions:
        raise ValueError("No questions found in JSON input.")

    return {
        "student": {
            "student_id": str(student.get("student_id", "")).strip(),
            "student_name": str(student.get("student_name", "")).strip(),
        },
        "ability_catalog": ability_catalog,
        "tag_ability_map": tag_ability_map,
        "questions": questions,
    }


def load_input(path: str | Path) -> dict[str, Any]:
    suffix = Path(path).suffix.lower()
    if suffix in {".xlsx", ".xlsm", ".xltx", ".xltm"}:
        return load_input_from_excel(path)
    if suffix == ".json":
        return load_input_from_json(path)
    raise ValueError(f"Unsupported input type: {suffix}")


def compute_graph_result(payload: dict[str, Any]) -> dict[str, Any]:
    student = payload["student"]
    ability_catalog = payload["ability_catalog"]
    tag_map_rows = payload["tag_ability_map"]
    questions = payload["questions"]

    tag_to_ability = {str(row["tag_name"]).strip(): str(row["ability_id"]).strip() for row in tag_map_rows}
    ability_order = [str(row["ability_id"]).strip() for row in ability_catalog]
    ability_names = {str(row["ability_id"]).strip(): str(row.get("ability_name", "")).strip() for row in ability_catalog}

    ability_buckets: dict[str, dict[str, float]] = {
        ability_id: {
            "total_weight": 0.0,
            "correct_weight": 0.0,
            "question_count": 0,
            "correct_count": 0,
        }
        for ability_id in ability_order
    }

    mapped_question_count = 0
    total_weight = 0.0
    correct_weight = 0.0
    unmapped_tags: set[str] = set()
    assessment_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for question in questions:
        exam_id = question["exam_id"]
        assessment_groups[exam_id].append(question)

        tags = [tag for tag in question["tags"] if tag]
        if not tags:
            continue

        mapped_tags = []
        for tag in tags:
            ability_id = tag_to_ability.get(tag)
            if ability_id:
                mapped_tags.append((tag, ability_id))
            else:
                unmapped_tags.add(tag)

        if not mapped_tags:
            continue

        mapped_question_count += 1
        weight_per_tag = question["question_score"] / len(tags)

        for _, ability_id in mapped_tags:
            if ability_id not in ability_buckets:
                ability_buckets[ability_id] = {
                    "total_weight": 0.0,
                    "correct_weight": 0.0,
                    "question_count": 0,
                    "correct_count": 0,
                }
                ability_names.setdefault(ability_id, ability_id)
                ability_order.append(ability_id)

            bucket = ability_buckets[ability_id]
            bucket["total_weight"] += weight_per_tag
            bucket["question_count"] += 1
            total_weight += weight_per_tag
            if question["is_correct"]:
                bucket["correct_weight"] += weight_per_tag
                bucket["correct_count"] += 1
                correct_weight += weight_per_tag

    abilities = []
    for ability_id in ability_order:
        bucket = ability_buckets.get(ability_id, {})
        total = float(bucket.get("total_weight", 0.0))
        correct = float(bucket.get("correct_weight", 0.0))
        score = round((correct / total) * 100) if total > 0 else 0
        accuracy = round((correct / total), 4) if total > 0 else 0.0
        abilities.append(
            {
                "ability_id": ability_id,
                "ability_name": ability_names.get(ability_id, ability_id),
                "score": score,
                "question_count": int(bucket.get("question_count", 0)),
                "correct_count": int(bucket.get("correct_count", 0)),
                "accuracy": accuracy,
            }
        )

    overall_score = round((correct_weight / total_weight) * 100) if total_weight > 0 else 0
    radar_values = [item["score"] for item in abilities]

    sorted_for_suggestion = sorted(
        abilities,
        key=lambda item: (item["score"], ability_order.index(item["ability_id"])),
    )
    suggestions = []
    for item in sorted_for_suggestion[:2]:
        template = DEFAULT_SUGGESTIONS.get(item["ability_id"], f"重点补强{item['ability_name']}。")
        suggestions.append(f"{item['ability_name']}：{template}")

    trend = []
    for exam_id, group in sorted(assessment_groups.items(), key=lambda kv: _assessment_sort_key(kv[1][0])):
        exam_total = 0.0
        exam_correct = 0.0
        for question in group:
            tags = [tag for tag in question["tags"] if tag]
            if not tags:
                continue
            mapped_tags = [tag for tag in tags if tag in tag_to_ability]
            if not mapped_tags:
                continue
            weight_per_tag = question["question_score"] / len(tags)
            mapped_weight = weight_per_tag * len(mapped_tags)
            exam_total += mapped_weight
            if question["is_correct"]:
                exam_correct += mapped_weight

        trend.append(
            {
                "period": group[0]["submit_date"],
                "book_title": group[0]["book_title"],
                "score": round((exam_correct / exam_total) * 100) if exam_total > 0 else 0,
            }
        )

    assessment_count = len(trend)
    confidence_level = _confidence_level(mapped_question_count, assessment_count)

    result = {
        "student": student,
        "overall_score": overall_score,
        "sample_count": mapped_question_count,
        "assessment_count": assessment_count,
        "confidence_level": confidence_level,
        "abilities": abilities,
        "radar_values": radar_values,
        "suggestions": suggestions,
        "trend": trend,
        "unmapped_tags": sorted(unmapped_tags),
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    return result


def _assessment_sort_key(question: dict[str, Any]) -> tuple[str, int]:
    return (str(question.get("submit_date", "")), coerce_int(question.get("question_no")))


def _confidence_level(sample_count: int, assessment_count: int) -> str:
    if sample_count >= 80 and assessment_count >= 5:
        return "high"
    if sample_count >= 40 and assessment_count >= 3:
        return "medium"
    return "low"


def markdown_table(headers: list[str], rows: list[list[Any]]) -> str:
    header_line = "| " + " | ".join(headers) + " |"
    separator = "| " + " | ".join(["---"] * len(headers)) + " |"
    data_lines = ["| " + " | ".join(str(cell) for cell in row) + " |" for row in rows]
    return "\n".join([header_line, separator, *data_lines])


def generate_report_markdown(result: dict[str, Any]) -> str:
    student = result["student"]
    abilities = result["abilities"]
    trend = result["trend"]
    unmapped_tags = result.get("unmapped_tags", [])

    lines = [
        "# 学生阅读能力图谱报告",
        "",
        f"**学生**：{student.get('student_name', '')}",
        f"**学生ID**：{student.get('student_id', '')}",
        "",
        "## 1. 综合阅读能力分",
        "",
        f"**{result['overall_score']} 分**",
        "",
        "说明：基于测评作答结果统计得出。",
        "",
        "## 2. 6 个能力维度得分",
        "",
    ]

    ability_rows = [
        [
            item["ability_name"],
            item["score"],
            item["question_count"],
            item["correct_count"],
            f"{item['accuracy'] * 100:.1f}%",
        ]
        for item in abilities
    ]
    lines.append(markdown_table(["能力维度", "得分", "题量", "正确数", "正确率"], ability_rows))

    lines.extend(
        [
            "",
            "## 3. 雷达图数据",
            "",
            "按 `ability_catalog` 顺序输出：",
            "",
            "```json",
            json.dumps(result["radar_values"], ensure_ascii=False),
            "```",
            "",
            "## 4. 薄弱项分析",
            "",
        ]
    )

    weakest = sorted(abilities, key=lambda item: item["score"])[:3]
    for index, item in enumerate(weakest, start=1):
        lines.extend(
            [
                f"{index}. **{item['ability_name']}**",
                f"   - 得分 {item['score']} 分。",
                f"   - 当前表现相对弱于其他维度。",
            ]
        )
        if item["ability_id"] == "comprehension":
            lines.append("   - 主要关注事实提取、人物关系和显性信息定位。")
        elif item["ability_id"] == "analysis":
            lines.append("   - 主要关注情节梳理、结构拆解和线索归纳。")
        elif item["ability_id"] == "expression":
            lines.append("   - 主要关注主旨概括、复述和观点表达。")
        elif item["ability_id"] == "critical_thinking":
            lines.append("   - 主要关注因果判断、推理选择和观点辨析。")
        elif item["ability_id"] == "creativity":
            lines.append("   - 主要关注联想迁移、改写应用和开放延展。")
        elif item["ability_id"] == "memory":
            lines.append("   - 主要关注细节记忆、关键信息回忆和快速复盘。")
        lines.append("")

    lines.extend(
        [
            "## 5. 提升建议",
            "",
        ]
    )

    for suggestion in result["suggestions"]:
        lines.append(f"- {suggestion}")

    lines.extend(
        [
            "",
            "## 6. 成长趋势",
            "",
            markdown_table(
                ["测评日期", "测评书目", "测评分"],
                [[item["period"], item["book_title"], item["score"]] for item in trend],
            ),
            "",
            "趋势判断：",
            "- 最近测评分数可用于观察阶段性变化。",
            "- 分数波动说明能力还需要持续巩固。",
            "",
            "## 7. 数据说明",
            "",
            markdown_table(
                ["项目", "值"],
                [
                    ["测评套数", result.get("assessment_count", 0)],
                    ["统计样本数", result.get("sample_count", 0)],
                    ["置信度", result.get("confidence_level", "")],
                    ["最新更新时间", result.get("updated_at", "")],
                ],
            ),
        ]
    )

    if unmapped_tags:
        lines.extend(
            [
                "",
                "## 8. 未映射标签",
                "",
                "- " + "、".join(unmapped_tags),
            ]
        )

    return "\n".join(lines).rstrip() + "\n"


def run(input_path: str | Path, output_md: str | Path | None = None, output_json: str | Path | None = None) -> dict[str, Any]:
    payload = load_input(input_path)
    result = compute_graph_result(payload)
    markdown = generate_report_markdown(result)

    if output_md:
        Path(output_md).write_text(markdown, encoding="utf-8")
    if output_json:
        Path(output_json).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate reading ability graph report from Excel or JSON input.")
    parser.add_argument("--input", required=True, help="Input Excel or JSON file.")
    parser.add_argument("--output-md", help="Write Markdown report to this file.")
    parser.add_argument("--output-json", help="Write computed result JSON to this file.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    result = run(args.input, args.output_md, args.output_json)
    if not args.output_md:
        print(generate_report_markdown(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
