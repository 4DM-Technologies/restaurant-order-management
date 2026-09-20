"""Seed CLI — run from backend/: python -m src.seed"""

from src.services.seed_service import seed_all


def main() -> None:
    summary = seed_all()
    print("Seed complete:")
    print(f"  menu: {summary['menu']}")
    print(f"  accounts: {summary['accounts']}")
    print(f"  demo orders created: {summary['orders_created']}")


if __name__ == "__main__":
    main()
