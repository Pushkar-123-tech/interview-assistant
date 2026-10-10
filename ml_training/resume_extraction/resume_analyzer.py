import argparse
import csv
import json
import re
import unicodedata
from functools import lru_cache
from pathlib import Path

import torch
from transformers import AutoModelForTokenClassification, AutoTokenizer

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT / "ml_models" / "skill_ner_model"
VOCABULARY_PATH = ROOT / "ml_training" / "resume_extraction" / "final_training_data" / "master_skill_vocabulary.csv"
SECTION_NAMES = ("experience", "education", "skills", "projects", "summary", "certifications", "achievements")
REPORT_SECTIONS = (
    ("profile", "Profile", re.compile(r"(?:profile|professional summary|summary|objective|about me)", re.I)),
    ("skills", "Skills", re.compile(r"(?:technical skills|skills|technologies)", re.I)),
    ("education", "Education", re.compile(r"(?:education|academic background)", re.I)),
    ("projects", "Projects", re.compile(r"(?:projects|personal projects|selected projects)", re.I)),
    ("experience", "Experience", re.compile(r"(?:experience|work experience|professional experience|employment history)", re.I)),
    ("certifications", "Certifications", re.compile(r"(?:certifications|certificates|licenses)", re.I)),
    ("achievements", "Achievements", re.compile(r"(?:achievements|accomplishments)", re.I)),
)
LEGACY_SECTION_NAMES = {
    "profile": "summary",
    "skills": "skills",
    "projects": "projects",
    "education": "education",
    "experience": "experience",
    "certifications": "certifications",
    "achievements": "achievements",
}
EDUCATION_AREAS = (
    ("Computer Science", re.compile(r"\bcomputer science\b", re.I)),
    ("Computer Engineering", re.compile(r"\bcomputer engineering\b", re.I)),
    ("Information Technology", re.compile(r"\binformation technology\b", re.I)),
)
EDUCATION_CONTEXT = r"(?:degree|bachelor(?:'s)?|b\.?s\.?|b\.?sc\.?|b\.?e\.?|b\.?tech|major|education)"
EDUCATION_ABBREVIATIONS = {
    "Computer Science": "CS",
    "Computer Engineering": "CE",
    "Information Technology": "IT",
}
EDUCATION_MATCH_GROUP = {
    "Computer Science", "Computer Engineering", "Information Technology"
}
EDUCATION_SKILL_KEYS = {
    "computer science", "computer engineering", "information technology", "cs", "ce", "it"
}
SKILL_CATEGORY_NAMES = ("Frontend", "Backend", "Database", "Programming/Data")
SKILL_CATEGORIES = {
    "Frontend": {"react.js", "html5", "css3", "javascript", "typescript", "angular", "vue.js", "next.js", "svelte", "tailwind css"},
    "Backend": {"node.js", "express.js", "django", "flask", "fastapi", "spring", "asp.net", "rest apis", "graphql"},
    "Database": {"sql", "postgresql", "mysql", "mongodb", "sqlite", "redis", "oracle database", "firebase"},
    "Programming/Data": {"python", "java", "c++", "c#", "go", "ruby", "php", "r", "scala", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "machine learning", "data analysis"},
}
ACTION_VERBS = re.compile(
    r"\b(achieved|automated|built|created|delivered|designed|developed|implemented|"
    r"improved|increased|launched|led|managed|optimized|reduced|resolved|streamlined)\b",
    re.I,
)
QUANTIFIED_RESULT = re.compile(
    r"(?<!\w)(?:[$€£]\s?\d[\d,.]*(?:\s?[kmb])?|"
    r"\d+(?:\.\d+)?\s?(?:%|\+|x|years?|months?|million|users?|customers?|projects?|records?))(?!\w)",
    re.I,
)
EMAIL = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
PHONE = re.compile(r"(?:\+?\d[\d ()-]{7,}\d)")
LINKEDIN = re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+", re.I)
EDGE_PUNCTUATION = ".,;:!?()[]{}\"'`"
NON_SKILL_TERMS = {
    "clean", "detect", "logic", "troubleshoot", "sing", "design", "designs",
    "development", "developments", "technology", "technologies"
}
MAX_SKILL_WORDS = 5
REQUIRED_SKILL_WEIGHT = 2
SKILL_ALIASES = {
    "react": "React.js",
    "reactjs": "React.js",
    "react.js": "React.js",
    "react/reactjs": "React.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node/nodejs": "Node.js",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "rest api/rest apis": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    "data structures and algorithms": "Data Structures and Algorithms",
    "data structures & algorithms": "Data Structures and Algorithms",
    "dsa/algorithms": "Data Structures and Algorithms",
    "dsa": "Data Structures and Algorithms",
    "algorithm": "Data Structures and Algorithms",
    "algorithms": "Data Structures and Algorithms",
    "express": "Express.js",
    "expressjs": "Express.js",
    "express.js": "Express.js",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "sklearn": "Scikit-learn",
    "scikit learn": "Scikit-learn",
    "scikit-learn": "Scikit-learn",
}
PREFERRED_TERMS = re.compile(
    r"\b(preferred|preferably|nice to have|bonus|desirable|ideally|a plus|optional)\b",
    re.I,
)
REQUIRED_TERMS = re.compile(
    r"\b(required|requirements|must[- ]have|essential|minimum qualifications)\b",
    re.I,
)


def normalize_skill_phrase(value: str) -> str:
    """Normalize case and punctuation without changing skill phrases such as React.js."""
    value = re.sub(r"\s*/\s*", "/", value)
    words = []
    for word in value.casefold().split():
        word = word.strip(EDGE_PUNCTUATION)
        if word:
            words.append(word)
    return " ".join(words)


def clean_resume_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\u00ad", "")
    text = re.sub(r"[\u200b-\u200f\ufeff]", "", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"(?<=\w)-[ \t]*\n[ \t]*(?=\w)", "", text)
    cleaned_lines = []
    for line in text.split("\n"):
        line = re.sub(r"^[ \t]*[\u2022\u25cf\u25cb\u25aa\uf0b7][ \t]*", "- ", line)
        line = re.sub(r"[ \t]+", " ", line).strip()
        if line or (cleaned_lines and cleaned_lines[-1]):
            cleaned_lines.append(line)
    return "\n".join(cleaned_lines).strip()


def detect_resume_sections(text: str):
    found = set()
    contents = {key: [] for key, _, _ in REPORT_SECTIONS}
    active_section = None

    for line in text.splitlines():
        heading = re.sub(r"^[\s#>*\u2022-]+", "", line).strip()
        heading, separator, inline_content = heading.partition(":")
        heading = heading.strip()
        section = next(
            (key for key, _, pattern in REPORT_SECTIONS if pattern.fullmatch(heading)),
            None,
        )
        if section:
            found.add(section)
            active_section = section
            if separator and inline_content.strip():
                contents[section].append(inline_content.strip())
        elif active_section:
            contents[active_section].append(line)

    legacy_sections = [
        name for name in SECTION_NAMES
        if name in {LEGACY_SECTION_NAMES[section] for section in found}
    ]
    section_contents = {
        key: "\n".join(lines).strip() for key, lines in contents.items()
    }
    return legacy_sections, found, section_contents


def extract_education_areas(text: str):
    matches = []
    for area, pattern in EDUCATION_AREAS:
        if pattern.search(text):
            matches.append(area)

    for area, abbreviation in EDUCATION_ABBREVIATIONS.items():
        context = rf"\b{EDUCATION_CONTEXT}\b[^\n.;]{{0,50}}\b{abbreviation}\b|\b{abbreviation}\b[^\n.;]{{0,50}}\b{EDUCATION_CONTEXT}\b"
        if area not in matches and re.search(context, text, re.I):
            matches.append(area)
    return matches


@lru_cache(maxsize=1)
def load_skill_vocabulary():
    vocabulary = []
    with VOCABULARY_PATH.open("r", encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            canonical = row["canonical_skill"].strip()
            normalized = normalize_skill_phrase(row["normalized_skill"] or canonical)
            if canonical and normalized:
                vocabulary.append((canonical, normalized))
    return vocabulary


@lru_cache(maxsize=1)
def load_skill_aliases():
    aliases = {}
    for canonical, normalized in load_skill_vocabulary():
        if normalized not in NON_SKILL_TERMS and len(normalized.split()) <= MAX_SKILL_WORDS:
            aliases[normalized] = SKILL_ALIASES.get(
                normalize_skill_phrase(canonical), canonical
            )
        canonical_key = normalize_skill_phrase(canonical)
        if canonical_key not in NON_SKILL_TERMS and len(canonical_key.split()) <= MAX_SKILL_WORDS:
            aliases[canonical_key] = SKILL_ALIASES.get(canonical_key, canonical)
    aliases.update(SKILL_ALIASES)
    return aliases


def canonicalize_skill(value: str):
    normalized = normalize_skill_phrase(value)
    if normalized in NON_SKILL_TERMS or normalized in EDUCATION_SKILL_KEYS:
        return None
    return load_skill_aliases().get(normalized)


def extract_jd_skills(job_description: str):
    aliases = load_skill_aliases()
    mentions = []
    current_level = "required"
    offset = 0

    for line in job_description.splitlines() or [job_description]:
        if PREFERRED_TERMS.search(line):
            current_level = "preferred"
        elif REQUIRED_TERMS.search(line):
            current_level = "required"

        level = "preferred" if PREFERRED_TERMS.search(line) else current_level
        normalized_line = normalize_skill_phrase(line)
        words = normalized_line.split()
        for start in range(len(words)):
            for end in range(start + 1, min(start + MAX_SKILL_WORDS, len(words)) + 1):
                skill = aliases.get(" ".join(words[start:end]))
                if skill and normalize_skill_phrase(skill) not in EDUCATION_SKILL_KEYS:
                    mentions.append((offset + start, skill, level))
        offset += len(line) + 1

    mentions.sort(key=lambda item: item[0])
    levels = {}
    canonical_skills = {}
    for _, skill, level in mentions:
        key = normalize_skill_phrase(skill)
        if key in levels:
            if level == "required":
                levels[key] = "required"
            continue
        levels[key] = level
        canonical_skills[key] = skill

    required = [canonical_skills[key] for key, level in levels.items() if level == "required"]
    preferred = [canonical_skills[key] for key, level in levels.items() if level == "preferred"]
    return required, preferred


def extract_vocabulary_skills(text: str):
    aliases = load_skill_aliases()
    found = {}
    for line in text.splitlines() or [text]:
        words = normalize_skill_phrase(line).split()
        start = 0
        while start < len(words):
            match = None
            match_end = start + 1
            for end in range(min(len(words), start + MAX_SKILL_WORDS), start, -1):
                alias = " ".join(words[start:end])
                candidate = aliases.get(alias)
                canonical = canonicalize_skill(candidate) if candidate else None
                if canonical:
                    match = canonical
                    match_end = end
                    break
            if match:
                key = normalize_skill_phrase(match)
                found.setdefault(key, {
                    "skill": match,
                    "label": "SKILL",
                    "confidence": None,
                    "source": "Master vocabulary",
                })
                start = match_end
            else:
                start += 1
    return list(found.values())


def extract_text(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        from pypdf import PdfReader
        text = "\n\n".join(page.extract_text() or "" for page in PdfReader(str(file_path)).pages)
        return clean_resume_text(text)
    if suffix == ".docx":
        from docx import Document
        from docx.table import Table
        from docx.text.paragraph import Paragraph

        document = Document(str(file_path))
        parts = []
        for child in document.element.body.iterchildren():
            if child.tag.endswith("}p"):
                paragraph = Paragraph(child, document)
                paragraph_text = paragraph.text
                style_name = getattr(paragraph.style, "name", "").casefold()
                properties = paragraph._p.pPr
                is_list_item = (
                    "bullet" in style_name or "number" in style_name
                    or (properties is not None and properties.numPr is not None)
                )
                if paragraph_text.strip() and is_list_item:
                    paragraph_text = "- " + paragraph_text
                parts.append(paragraph_text)
            elif child.tag.endswith("}tbl"):
                table = Table(child, document)
                for row in table.rows:
                    cells = [re.sub(r"\s+", " ", cell.text).strip() for cell in row.cells]
                    parts.append(" | ".join(cell for cell in cells if cell))
        return clean_resume_text("\n".join(parts))
    raise ValueError("Legacy .doc files are not supported; save the resume as PDF or DOCX.")


def predict_skills(text: str):
    tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH), use_fast=True)
    model = AutoModelForTokenClassification.from_pretrained(str(MODEL_PATH))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device).eval()

    encoded = tokenizer(
        text,
        add_special_tokens=False,
        truncation=False,
        return_offsets_mapping=True,
        verbose=False,
    )
    token_ids = encoded["input_ids"]
    token_offsets = encoded["offset_mapping"]
    special_token_count = tokenizer.num_special_tokens_to_add(pair=False)
    model_limit = min(512, int(getattr(model.config, "max_position_embeddings", 512)))
    chunk_size = model_limit - special_token_count
    if tokenizer.cls_token_id is None or tokenizer.sep_token_id is None:
        raise ValueError("The skill tokenizer must define CLS and SEP tokens for chunked inference.")
    overlap = min(64, max(0, chunk_size // 4))
    chunk_step = max(1, chunk_size - overlap)
    id2label = {int(key): value for key, value in model.config.id2label.items()}

    entities = []
    for chunk_start in range(0, len(token_ids), chunk_step):
        chunk_ids = token_ids[chunk_start:chunk_start + chunk_size]
        if not chunk_ids:
            continue
        input_ids = [tokenizer.cls_token_id, *chunk_ids, tokenizer.sep_token_id]
        offsets = [
            (0, 0),
            *token_offsets[chunk_start:chunk_start + len(chunk_ids)],
            (0, 0),
        ]

        model_inputs = {
            "input_ids": torch.tensor([input_ids], dtype=torch.long, device=device),
            "attention_mask": torch.ones((1, len(input_ids)), dtype=torch.long, device=device),
        }
        if "token_type_ids" in tokenizer.model_input_names:
            token_type_ids = [0] * len(input_ids)
            model_inputs["token_type_ids"] = torch.tensor(
                [token_type_ids], dtype=torch.long, device=device
            )

        with torch.inference_mode():
            probabilities = torch.softmax(model(**model_inputs).logits[0], dim=-1)
        predictions = probabilities.argmax(dim=-1).cpu().tolist()

        current = None
        for index, label_id in enumerate(predictions):
            start, end = offsets[index]
            if start == end:
                continue
            label = id2label.get(label_id, "O")
            confidence = float(probabilities[index, label_id].cpu())
            if label.startswith("B-") or (label.startswith("I-") and current is None):
                if current:
                    entities.append(current)
                current = {"start": start, "end": end, "label": label[2:], "confidence": confidence}
            elif label.startswith("I-") and current:
                current["end"] = end
                current["confidence"] = min(current["confidence"], confidence)
            elif current:
                entities.append(current)
                current = None
        if current:
            entities.append(current)

    results_by_skill = {}
    for entity in entities:
        skill = re.sub(r"\s+", " ", text[entity["start"]:entity["end"]]).strip(" ,.;:-")
        canonical = canonicalize_skill(skill)
        key = normalize_skill_phrase(canonical) if canonical else ""
        if canonical:
            candidate = {
                "skill": canonical,
                "label": entity["label"],
                "confidence": round(entity["confidence"], 3),
                "source": "NER model",
            }
            previous = results_by_skill.get(key)
            if previous is None or candidate["confidence"] > previous["confidence"]:
                results_by_skill[key] = candidate
    return list(results_by_skill.values())


def skill_category(skill: str) -> str:
    normalized = normalize_skill_phrase(skill)
    return next(
        (category for category, names in SKILL_CATEGORIES.items() if normalized in names),
        "Programming/Data",
    )


def build_skill_analysis(skills, required_skills, preferred_skills, has_job_description):
    resume_by_key = {
        normalize_skill_phrase(item["skill"]): item for item in skills
    }
    required_keys = {normalize_skill_phrase(skill) for skill in required_skills}
    preferred_keys = {normalize_skill_phrase(skill) for skill in preferred_skills}
    jd_keys = required_keys | preferred_keys
    rows = {}

    for key, item in resume_by_key.items():
        jd_level = "Required" if key in required_keys else "Preferred" if key in preferred_keys else None
        rows[key] = {
            "skill": item["skill"],
            "confidence": item.get("confidence"),
            "source": item.get("source", "NER model"),
            "category": skill_category(item["skill"]),
            "jdLevel": jd_level,
            "matchStatus": (
                "Matched" if key in jd_keys else "Not listed in JD"
            ) if has_job_description else "N/A",
        }

    groups = {category: [] for category in SKILL_CATEGORY_NAMES}
    for item in rows.values():
        groups[item["category"]].append(item)
    return groups


def build_recommendations(missing_required, missing_preferred, missing_education,
                          has_email, has_phone, quantified_count, missing_sections,
                          low_confidence_skills, matched_skills, has_job_description,
                          detected_skills):
    recommendations = []
    for skill in missing_required[:2]:
        recommendations.append(f"If you have experience with {skill}, add evidence of it.")
    for skill in missing_preferred[:1]:
        recommendations.append(f"If you have experience with {skill}, add evidence of it.")
    if missing_education:
        recommendations.append(
            "If you hold a qualification in " + ", ".join(missing_education[:2])
            + ", list it in the Education section."
        )
    if not has_email:
        recommendations.append("Add a professional email address to the resume contact section.")
    if not has_phone:
        recommendations.append("Add a phone number to the resume contact section.")
    if quantified_count == 0:
        recommendations.append(
            "Where the source facts support it, add measurable outcomes to existing experience or project bullets."
        )
    if missing_sections:
        recommendations.append(
            "Use standalone headings for existing resume content in: "
            + ", ".join(missing_sections[:3]) + "."
        )
    if low_confidence_skills:
        recommendations.append(
            "Verify the extracted skill wording against the resume: "
            + ", ".join(low_confidence_skills[:4]) + "."
        )
    if has_job_description and matched_skills:
        recommendations.append(
            "Keep matched skills already detected in the resume easy to find: "
            + ", ".join(matched_skills[:4]) + "."
        )
    if not has_job_description:
        recommendations.append("Add a target job description for role-specific skill and education matching.")

    if detected_skills:
        recommendations.append("Verify that each detected canonical skill is accurately represented in the resume.")
    else:
        recommendations.append("Review the extracted resume text for completeness before relying on this report.")
    if quantified_count:
        recommendations.append("Keep the detected quantified outcomes connected to the roles or projects where they occurred.")

    unique = list(dict.fromkeys(recommendations))
    for fallback in (
        "Check the extracted resume text against the uploaded file, especially section headings and bullet order.",
        "Confirm the contact details shown in the source resume are current and easy to find.",
        "Keep skill claims limited to names supported by the resume text.",
    ):
        if len(unique) >= 3:
            break
        unique.append(fallback)
    return unique[:5]


def build_resume_summary(word_count, skills, present_labels, quantified_count):
    skill_names = [item["skill"] for item in skills[:5]]
    sentences = [f"The resume contains {word_count} words."]
    if skill_names:
        sentences.append("Validated skills include " + ", ".join(skill_names) + ".")
    else:
        sentences.append("No technical skills were validated from the resume text.")
    if present_labels:
        sentences.append("Detected sections: " + ", ".join(present_labels) + ".")
    if quantified_count:
        sentences.append(f"It contains {quantified_count} quantified result signal(s).")
    else:
        sentences.append("No quantified result signals were detected.")
    return " ".join(sentences)


def build_quality_report(text, skills, section_data, details):
    word_count = len(text.split())
    bullet_count = len(re.findall(r"(?m)^\s*[\u2022\u25cf\-*]\s+", text))
    confidence_values = [
        skill["confidence"] for skill in skills if skill.get("confidence") is not None
    ]
    average_confidence = round(sum(confidence_values) / len(confidence_values), 3) if confidence_values else 0
    sections, found_sections, section_contents = section_data
    missing_sections = [section for section in SECTION_NAMES if section not in sections]
    contact_items = {
        "email": details["hasEmail"],
        "phone": details["hasPhone"],
        "linkedin": bool(LINKEDIN.search(text)),
    }
    present_labels = [label for key, label, _ in REPORT_SECTIONS if key in found_sections]
    section_details = [
        {"name": label, "detected": key in found_sections,
         "status": "present" if key in found_sections else "missing"}
        for key, label, _ in REPORT_SECTIONS
    ]
    required_skills = details["requiredSkills"]
    preferred_skills = details["preferredSkills"]
    matched_required = details["matchedRequiredSkills"]
    matched_preferred = details["matchedPreferredSkills"]
    missing_required = details["missingRequiredSkills"]
    missing_preferred = details["missingPreferredSkills"]
    matched = matched_required + matched_preferred
    missing = missing_required + missing_preferred
    jd_total = len(required_skills) + len(preferred_skills)
    jd_matched = len(matched)
    jd_match = f"{jd_matched}/{jd_total}" if jd_total else "N/A"
    education = details["education"]
    project_text = section_contents.get("projects", "")
    project_bullets = len(re.findall(r"(?m)^\s*[\u2022\u25cf\-*]\s+", project_text))
    quantified_examples = details["quantifiedExamples"]
    action_count = details["actionCount"]
    quantified_count = details["quantifiedCount"]
    skills_count = len(skills)
    technical_relevance = (
        round(jd_matched / skills_count * 100) if skills_count and jd_total else "N/A"
    )
    content_quality = [
        {"name": "Action verbs", "value": action_count,
         "meaning": "Count of selected action-oriented verbs found in the resume text."},
        {"name": "Quantified results", "value": quantified_count,
         "meaning": "Count of numeric, percentage, duration, or scale signals detected."},
        {"name": "JD keyword alignment", "value": jd_match,
         "meaning": "Unweighted count of canonical Required and Preferred JD skills found in validated resume skills."},
        {"name": "Contact information", "value": (
            f"Email {'present' if details['hasEmail'] else 'missing'}; "
            f"phone {'present' if details['hasPhone'] else 'missing'}"
        ), "meaning": "Checks whether an email address and phone number are present in the resume."},
    ]
    impact = [
        {"name": "Action-oriented writing", "value": action_count,
         "meaning": "Selected action verbs detected; this does not assess writing quality by itself."},
        {"name": "Quantified achievements", "value": quantified_count,
         "meaning": "Numeric outcome signals found; verify each value reflects the source resume."},
        {"name": "Technical relevance", "value": f"{technical_relevance}%" if technical_relevance != "N/A" else "N/A",
         "meaning": "Share of validated resume skills that match a supplied JD skill."},
        {"name": "Project evidence", "value": f"{project_bullets} bullets" if "projects" in found_sections else "Not detected",
         "meaning": "Bullet points found under a standalone Projects heading."},
        {"name": "Measurable outcomes", "value": quantified_examples or "None detected",
         "meaning": "Examples of numeric result signals found in the resume text."},
    ]
    ats_explanation = (
        "No job description was supplied, so role-specific ATS scoring is unavailable."
        if not jd_total else
        f"Required skills carry {REQUIRED_SKILL_WEIGHT}x weight and Preferred skills carry 1x. "
        f"{len(missing_required)} Required and {len(missing_preferred)} Preferred skill(s) are unmatched. "
        "Education match is reported separately and does not change the skill-weighted ATS score."
    )
    return {
        "document": {
            "wordCount": word_count,
            "characterCount": len(text),
            "bulletCount": bullet_count,
            "hasReadableText": bool(text.strip()),
        },
        "overview": {
            "wordCount": word_count,
            "bulletCount": bullet_count,
            "detectedSkillCount": skills_count,
            "sections": present_labels,
            "averageConfidence": average_confidence,
            "contact": contact_items,
            "summary": details["summary"],
        },
        "contact": contact_items,
        "sections": {
            "present": sections,
            "missing": missing_sections,
            "details": section_details,
        },
        "evidence": {
            "actionVerbCount": action_count,
            "quantifiedAchievementCount": quantified_count,
            "quantifiedExamples": quantified_examples,
            "projectBulletCount": project_bullets,
        },
        "model": {
            "detectedSkillCount": skills_count,
            "nerDetectedSkillCount": sum(skill.get("source") == "NER model" for skill in skills),
            "vocabularyRecoveredSkillCount": sum(skill.get("source") == "Master vocabulary" for skill in skills),
            "averageConfidence": average_confidence,
            "lowConfidenceSkills": [
                skill["skill"] for skill in skills
                if skill.get("confidence") is not None and skill["confidence"] < 0.7
            ],
            "lowConfidenceSkillDetails": [
                skill for skill in skills
                if skill.get("confidence") is not None and skill["confidence"] < 0.7
            ],
        },
        "ats": {
            "validJobKeywordCount": jd_total,
            "requiredSkillCount": len(required_skills),
            "preferredSkillCount": len(preferred_skills),
            "matchedKeywordCount": jd_matched,
            "missingKeywordCount": len(missing),
            "matchPercentage": details["atsScore"],
            "skillCoveragePercentage": details["skillCoverage"],
        },
        "skillAnalysis": build_skill_analysis(
            skills, required_skills, preferred_skills, details["hasJobDescription"]
        ),
        "jdAnalysis": {
            "provided": details["hasJobDescription"],
            "required": [
                {"skill": skill, "status": "Matched" if skill in matched_required else "Missing"}
                for skill in required_skills
            ],
            "preferred": [
                {"skill": skill, "status": "Matched" if skill in matched_preferred else "Missing"}
                for skill in preferred_skills
            ],
            "counts": {
                "required": f"{len(matched_required)}/{len(required_skills)}",
                "preferred": f"{len(matched_preferred)}/{len(preferred_skills)}",
                "overall": jd_match,
            },
        },
        "educationAnalysis": education,
        "skillGaps": {
            "required": missing_required,
            "preferred": missing_preferred,
        },
        "contentQuality": content_quality,
        "impactAnalysis": impact,
        "atsBreakdown": {
            "overall": details["atsScore"],
            "requiredMatch": f"{len(matched_required)}/{len(required_skills)}" if required_skills else "N/A",
            "preferredMatch": f"{len(matched_preferred)}/{len(preferred_skills)}" if preferred_skills else "N/A",
            "jdKeywordMatch": jd_match,
            "educationMatch": education["match"],
            "explanation": ats_explanation,
        },
        "recommendations": details["recommendations"],
    }


def analyze(text: str, job_description: str):
    text = clean_resume_text(text)
    skills = []
    skill_indexes = {}
    ner_skills = predict_skills(text)
    vocabulary_skills = extract_vocabulary_skills(text)
    for prediction in [*ner_skills, *vocabulary_skills]:
        canonical = canonicalize_skill(prediction.get("skill", ""))
        key = normalize_skill_phrase(canonical) if canonical else ""
        if not canonical:
            continue
        candidate = {**prediction, "skill": canonical}
        previous_index = skill_indexes.get(key)
        if previous_index is None:
            skill_indexes[key] = len(skills)
            skills.append(candidate)
            continue
        previous = skills[previous_index]
        candidate_confidence = candidate.get("confidence")
        previous_confidence = previous.get("confidence")
        if candidate_confidence is not None and (
            previous_confidence is None or candidate_confidence > previous_confidence
        ):
            skills[previous_index] = candidate
    required_skills, preferred_skills = extract_jd_skills(job_description)
    resume_skill_keys = {normalize_skill_phrase(skill["skill"]) for skill in skills}
    matched_required = [skill for skill in required_skills
                        if normalize_skill_phrase(skill) in resume_skill_keys]
    matched_preferred = [skill for skill in preferred_skills
                         if normalize_skill_phrase(skill) in resume_skill_keys]
    missing_required = [skill for skill in required_skills if skill not in matched_required]
    missing_preferred = [skill for skill in preferred_skills if skill not in matched_preferred]
    matched = matched_required + matched_preferred
    missing = missing_required + missing_preferred
    job_skill_count = len(required_skills) + len(preferred_skills)
    skill_coverage = round(len(matched) / job_skill_count * 100) if job_skill_count else "N/A"
    weighted_total = len(required_skills) * REQUIRED_SKILL_WEIGHT + len(preferred_skills)
    weighted_match = len(matched_required) * REQUIRED_SKILL_WEIGHT + len(matched_preferred)
    ats_score = round(weighted_match / weighted_total * 100) if weighted_total else "N/A"
    sections, found_sections, section_contents = detect_resume_sections(text)
    resume_education = extract_education_areas(section_contents.get("education", ""))
    required_education = extract_education_areas(job_description)
    matched_education = []
    matched_education_by = {}
    for required_area in required_education:
        match = next((area for area in resume_education if area == required_area), None)
        if match is None and required_area in EDUCATION_MATCH_GROUP:
            match = next((area for area in resume_education if area in EDUCATION_MATCH_GROUP), None)
        if match:
            matched_education.append(required_area)
            matched_education_by[required_area] = match
    missing_education = [area for area in required_education if area not in matched_education]
    education_analysis = {
        "required": required_education,
        "detected": resume_education,
        "matched": matched_education,
        "matchedBy": matched_education_by,
        "missing": missing_education,
        "match": f"{len(matched_education)}/{len(required_education)}" if required_education else "N/A",
    }
    has_email = bool(EMAIL.search(text))
    has_phone = bool(PHONE.search(text))
    has_contact = has_email and has_phone
    quantified_examples = list(dict.fromkeys(match.group(0).strip() for match in QUANTIFIED_RESULT.finditer(text)))[:5]
    quantified = len(QUANTIFIED_RESULT.findall(text))
    action_count = len(ACTION_VERBS.findall(text))
    low_confidence_skills = [
        skill["skill"] for skill in skills
        if skill.get("confidence") is not None and skill["confidence"] < 0.7
    ]
    present_labels = [label for key, label, _ in REPORT_SECTIONS if key in found_sections]
    missing_section_labels = [label for key, label, _ in REPORT_SECTIONS if key not in found_sections]
    recommendations = build_recommendations(
        missing_required, missing_preferred, missing_education, has_email, has_phone,
        quantified, missing_section_labels, low_confidence_skills, matched,
        bool(job_description.strip()), skills,
    )
    resume_summary = build_resume_summary(len(text.split()), skills, present_labels, quantified)

    strengths = []
    if skills: strengths.append(f"NER and master vocabulary matching identified {len(skills)} resume skills.")
    if has_contact: strengths.append("Email and phone contact details are present.")
    if quantified: strengths.append(f"Found {quantified} quantified achievement signal(s).")
    if action_count: strengths.append("Uses action-oriented language in experience content.")
    if not strengths: strengths.append("Resume text was extracted successfully for analysis.")

    opportunities = []
    if missing:
        opportunities.append(
            "If you have experience with " + ", ".join(missing[:8])
            + ", add evidence of it to your resume."
        )
    opportunities.extend(recommendations)

    report_details = {
        "requiredSkills": required_skills,
        "preferredSkills": preferred_skills,
        "matchedRequiredSkills": matched_required,
        "matchedPreferredSkills": matched_preferred,
        "missingRequiredSkills": missing_required,
        "missingPreferredSkills": missing_preferred,
        "atsScore": ats_score,
        "skillCoverage": skill_coverage,
        "hasEmail": has_email,
        "hasPhone": has_phone,
        "hasJobDescription": bool(job_description.strip()),
        "education": education_analysis,
        "actionCount": action_count,
        "quantifiedCount": quantified,
        "quantifiedExamples": quantified_examples,
        "summary": resume_summary,
        "recommendations": recommendations,
    }

    resume_detected_skills = [skill["skill"] for skill in skills]
    debug = {
        "resumeDetectedSkills": resume_detected_skills,
        "requiredSkills": required_skills,
        "preferredSkills": preferred_skills,
        "matchedRequired": matched_required,
        "missingRequired": missing_required,
        "matchedPreferred": matched_preferred,
        "missingPreferred": missing_preferred,
    }

    return {
        "textLength": len(text),
        "skills": skills,
        "resumeDetectedSkills": resume_detected_skills,
        "keywords": matched,
        "requiredSkills": required_skills,
        "preferredSkills": preferred_skills,
        "matchedRequiredSkills": matched_required,
        "matchedRequired": matched_required,
        "matchedPreferredSkills": matched_preferred,
        "matchedPreferred": matched_preferred,
        "missingRequiredSkills": missing_required,
        "missingRequired": missing_required,
        "missingPreferredSkills": missing_preferred,
        "missingPreferred": missing_preferred,
        "missingKeywords": missing,
        "sections": sections,
        "atsScore": ats_score,
        "skillCoverage": skill_coverage,
        "impactScore": round(min(100, min(action_count / 8, 1) * 50 + min(quantified / 4, 1) * 50)),
        "interviewReadiness": round(min(100, (skill_coverage if isinstance(skill_coverage, int) else 0) * 0.6 + (40 if has_contact else 20))),
        "summary": f"The resume contains {len(skills)} validated skills and {len(sections)} standard resume sections."
                    + (f" It matches {len(matched)} of {job_skill_count} supplied job-description skills." if job_skill_count else " Supply a job description for role-specific ATS matching."),
        "strengths": strengths,
        "opportunities": opportunities,
        "debug": debug,
        "report": build_quality_report(
            text, skills, (sections, found_sections, section_contents), report_details
        ),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--job-description", default="")
    args = parser.parse_args()
    text = extract_text(Path(args.file))
    if not text.strip():
        raise ValueError("No readable text was found in the uploaded resume.")
    print(json.dumps(analyze(text, args.job_description)))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        raise
