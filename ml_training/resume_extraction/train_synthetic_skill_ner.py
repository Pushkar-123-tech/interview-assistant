import argparse
import ast
from pathlib import Path

import numpy as np
import pandas as pd
from datasets import Dataset
from transformers import (
    AutoModelForTokenClassification,
    AutoTokenizer,
    DataCollatorForTokenClassification,
    Trainer,
    TrainingArguments,
)

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA = ROOT / "ml_training" / "resume_extraction" / "final_training_data" / "synthetic_skill_ner.csv"
DEFAULT_BASE = ROOT / "ml_models" / "skill_ner_model"
DEFAULT_OUTPUT = ROOT / "ml_models" / "skill_ner_model_synthetic"


def load_dataset(path):
    frame = pd.read_csv(path)
    for column in ("tokens", "ner_ids"):
        frame[column] = frame[column].apply(ast.literal_eval)
    return Dataset.from_pandas(frame[["tokens", "ner_ids"]], preserve_index=False).train_test_split(test_size=0.1, seed=42)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--base-model", type=Path, default=DEFAULT_BASE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--epochs", type=int, default=3)
    args = parser.parse_args()

    tokenizer = AutoTokenizer.from_pretrained(str(args.base_model), use_fast=True)
    model = AutoModelForTokenClassification.from_pretrained(str(args.base_model))
    dataset = load_dataset(args.data)

    def tokenize_and_align(batch):
        encoded = tokenizer(batch["tokens"], truncation=True, max_length=256, is_split_into_words=True)
        labels = []
        for index, row_labels in enumerate(batch["ner_ids"]):
            word_ids = encoded.word_ids(batch_index=index)
            previous = None
            aligned = []
            for word_id in word_ids:
                if word_id is None:
                    aligned.append(-100)
                elif word_id != previous:
                    aligned.append(row_labels[word_id])
                else:
                    aligned.append(2 if row_labels[word_id] == 1 else row_labels[word_id])
                previous = word_id
            labels.append(aligned)
        encoded["labels"] = labels
        return encoded

    tokenized = dataset.map(tokenize_and_align, batched=True, remove_columns=dataset["train"].column_names)
    collator = DataCollatorForTokenClassification(tokenizer=tokenizer)

    def compute_metrics(result):
        predictions, labels = result
        predictions = np.argmax(predictions, axis=2)
        valid = labels != -100
        return {"token_accuracy": float((predictions[valid] == labels[valid]).mean())}

    training_args = TrainingArguments(
        output_dir=str(args.output),
        num_train_epochs=args.epochs,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        learning_rate=2e-5,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="token_accuracy",
        greater_is_better=True,
        report_to="none",
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["test"],
        tokenizer=tokenizer,
        data_collator=collator,
        compute_metrics=compute_metrics,
    )
    trainer.train()
    metrics = trainer.evaluate()
    trainer.save_model(str(args.output))
    tokenizer.save_pretrained(str(args.output))
    print(metrics)
    print(f"Saved candidate model to {args.output}")


if __name__ == "__main__":
    main()
