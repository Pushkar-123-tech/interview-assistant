import argparse
import csv
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VOCABULARY_PATH = ROOT / "ml_training" / "resume_extraction" / "final_training_data" / "master_skill_vocabulary.csv"
DEFAULT_OUTPUT = ROOT / "ml_training" / "resume_extraction" / "final_training_data" / "synthetic_skill_ner.csv"

TEMPLATES = (
    "Professional experience includes {skills}.",
    "Built and delivered solutions using {skills}.",
    "Technical skills: {skills}.",
    "Worked with {skills} to improve project outcomes.",
    "Hands-on experience in {skills}.",
)


def normalize(value):
    return re.sub(r"\s+", " ", value.casefold()).strip(" .,;:!?()[]{}\"'`")


def load_phrases():
    with VOCABULARY_PATH.open("r", encoding="utf-8", newline="") as file:
        rows = csv.DictReader(file)
        phrases = []
        seen = set()
        for row in rows:
            phrase = row["canonical_skill"].strip()
            normalized = normalize(row["normalized_skill"] or phrase)
            if phrase and normalized and normalized not in seen and 1 <= len(normalized.split()) <= 5:
                seen.add(normalized)
                phrases.append(phrase)
    return phrases


def make_example(index, phrases, rng):
    selected = rng.sample(phrases, min(rng.randint(2, 5), len(phrases)))
    text = rng.choice(TEMPLATES).format(skills=", ".join(selected))
    tokens = text.split()
    labels = [0] * len(tokens)
    cursor = 0
    for phrase in selected:
        phrase_tokens = phrase.split()
        for start in range(len(tokens) - len(phrase_tokens) + 1):
            candidate = [normalize(token) for token in tokens[start:start + len(phrase_tokens)]]
            if candidate == [normalize(token) for token in phrase_tokens] and all(label == 0 for label in labels[start:start + len(phrase_tokens)]):
                labels[start] = 1
                labels[start + 1:start + len(phrase_tokens)] = [2] * (len(phrase_tokens) - 1)
                break
    return {
        "resume_id": f"synthetic-{index:06d}",
        "resume_text": text,
        "tokens": repr(tokens),
        "ner_tags": repr(["O" if label == 0 else "B-SKILL" if label == 1 else "I-SKILL" for label in labels]),
        "skills": repr(selected),
        "num_skills": len(selected),
        "ner_ids": repr(labels),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=5000)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    phrases = load_phrases()
    if not phrases:
        raise ValueError("No usable skills were found in master_skill_vocabulary.csv")
    rng = random.Random(args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    fields = ["resume_id", "resume_text", "tokens", "ner_tags", "skills", "num_skills", "ner_ids"]
    with args.output.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for index in range(args.count):
            writer.writerow(make_example(index, phrases, rng))
    print(f"Wrote {args.count} synthetic examples to {args.output}")


if __name__ == "__main__":
    main()
