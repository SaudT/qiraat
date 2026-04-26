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
                audio_url="https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/001.mp3",
                duration=95,
            ),
            Recitation(
                title="Surah Al-Baqarah (Ayat 1-5)",
                reciter_name="Abdul Basit Abdus Samad",
                audio_url="https://download.quranicaudio.com/qdc/abdul_basit/murattal/002.mp3",
                duration=180,
            ),
            Recitation(
                title="Surah Al-Ikhlas",
                reciter_name="Saad Al-Ghamdi",
                audio_url="https://download.quranicaudio.com/qdc/saad_al_ghamdi/murattal/112.mp3",
                duration=28,
            ),
            Recitation(
                title="Surah Ar-Rahman (Opening)",
                reciter_name="Maher Al-Muaiqly",
                audio_url="https://download.quranicaudio.com/qdc/maher_almuaiqly/murattal/055.mp3",
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
