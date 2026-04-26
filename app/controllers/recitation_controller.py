from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.schemas.recitation import RecitationCreate
from app.services import recitation_service


def list_recitations(db: Session):
    try:
        return recitation_service.get_all_recitations(db)
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recitations.",
        ) from exc


def get_recitation(recitation_id: int, db: Session):
    try:
        return recitation_service.get_recitation_by_id(recitation_id, db)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recitation.",
        ) from exc


def create_new_recitation(data: RecitationCreate, db: Session):
    try:
        return recitation_service.create_recitation(data, db)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create recitation.",
        ) from exc
