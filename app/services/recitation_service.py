from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.recitation import Recitation
from app.schemas.recitation import RecitationCreate


def get_all_recitations(db: Session) -> list[Recitation]:
    return db.query(Recitation).order_by(Recitation.created_at.desc()).all()


def get_recitation_by_id(recitation_id: int, db: Session) -> Recitation:
    recitation = db.query(Recitation).filter(Recitation.id == recitation_id).first()
    if recitation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recitation with id {recitation_id} not found.",
        )
    return recitation


def create_recitation(data: RecitationCreate, db: Session) -> Recitation:
    recitation = Recitation(
        title=data.title,
        reciter_name=data.reciter_name,
        audio_url=data.audio_url,
        duration=data.duration,
    )
    db.add(recitation)
    db.commit()
    db.refresh(recitation)
    return recitation
