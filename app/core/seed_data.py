from app.core.database import SessionLocal
from app.models.recitation import Recitation


def seed_recitations() -> None:
    """Insert starter recitations only when table is empty."""
    db = SessionLocal()
    try:
        existing_count = db.query(Recitation).count()
        if existing_count > 0:
            return

        starter_recitations = [
            Recitation(
                title="Surah Al-Fatiha",
                reciter_name="Mishary Rashid Alafasy",
                audio_url="https://everyayah.com/data/Alafasy_128kbps/001001.mp3",
                duration=95,
            ),
            Recitation(
                title="Surah Al-Baqarah (Ayat 1-5)",
                reciter_name="Abdul Basit Abdus Samad",
                audio_url="https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/002001.mp3",
                duration=180,
            ),
            Recitation(
                title="Surah Al-Ikhlas",
                reciter_name="Saad Al-Ghamdi",
                audio_url="https://everyayah.com/data/Ghamadi_40kbps/112001.mp3",
                duration=28,
            ),
            Recitation(
                title="Surah Ar-Rahman (Opening)",
                reciter_name="Maher Al-Muaiqly",
                audio_url="https://everyayah.com/data/MaherAlMuaiqly128kbps/055001.mp3",
                duration=210,
            ),
        ]

        db.add_all(starter_recitations)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
