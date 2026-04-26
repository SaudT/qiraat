import os


class Settings:
    """Simple app settings loaded from environment variables."""

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/qiraat_db",
    )


settings = Settings()
