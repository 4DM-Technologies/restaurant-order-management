"""Centralized logging configuration (JSON in prod, readable in dev)."""

import logging
import sys
import time


class _DevFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        ts = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(record.created))
        return (
            f"{ts} {record.levelname:7s} "
            f"{record.name}:{record.filename}:{record.lineno} - {record.getMessage()}"
        )


def _build_logger() -> logging.Logger:
    root = logging.getLogger()
    if root.handlers:
        return root

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_DevFormatter())
    root.addHandler(handler)
    root.setLevel(logging.INFO)

    for noisy in ("botocore", "boto3", "urllib3", "s3transfer"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    return root


logger = _build_logger()