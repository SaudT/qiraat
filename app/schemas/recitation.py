from datetime import datetime

from pydantic import BaseModel


class RecitationBase(BaseModel):
    title: str
    reciter_name: str
    audio_url: str
    duration: int


class RecitationCreate(RecitationBase):
    pass


class RecitationResponse(RecitationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
