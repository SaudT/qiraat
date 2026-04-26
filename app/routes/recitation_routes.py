from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.controllers import recitation_controller
from app.core.database import get_db
from app.schemas.recitation import RecitationCreate, RecitationResponse

router = APIRouter(prefix="/recitations", tags=["Recitations"])


@router.get("", response_model=list[RecitationResponse])
def get_recitations(db: Session = Depends(get_db)):
    return recitation_controller.list_recitations(db)


@router.get("/{recitation_id}", response_model=RecitationResponse)
def get_recitation_by_id(recitation_id: int, db: Session = Depends(get_db)):
    return recitation_controller.get_recitation(recitation_id, db)


@router.post(
    "",
    response_model=RecitationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_recitation(payload: RecitationCreate, db: Session = Depends(get_db)):
    return recitation_controller.create_new_recitation(payload, db)
