import os
import json
import csv
from typing import List, Dict, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXPORTS_DIR = os.path.join(BASE_DIR, "data", "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

class FileManager:
    @staticmethod
    def write_json(filename: str, data: Any) -> str:
        filepath = os.path.join(EXPORTS_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, default=str)
        return filepath

    @staticmethod
    def read_json(filename: str) -> Any:
        filepath = os.path.join(EXPORTS_DIR, filename)
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def write_csv(filename: str, fieldnames: List[str], rows: List[Dict[str, Any]]) -> str:
        filepath = os.path.join(EXPORTS_DIR, filename)
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for row in rows:
                writer.writerow(row)
        return filepath

    @staticmethod
    def read_csv(filename: str) -> List[Dict[str, Any]]:
        filepath = os.path.join(EXPORTS_DIR, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return list(reader)

    @staticmethod
    def write_txt(filename: str, content: str) -> str:
        filepath = os.path.join(EXPORTS_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return filepath

    @staticmethod
    def read_txt(filename: str) -> str:
        filepath = os.path.join(EXPORTS_DIR, filename)
        if not os.path.exists(filepath):
            return ""
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
