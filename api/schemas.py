from typing import Optional, List
from pydantic import BaseModel, UUID4
from fastapi import File, UploadFile


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    username: str
    password: str


class LoginUser(BaseModel):
    username: str
    password: str


class UpdateUser(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    username: str
    password: str


class SantaPar(BaseModel):
    first_username: str
    second_username: str


class AddShuffleMembers(BaseModel):
    santaList: list[SantaPar]
    shuffleID: str
