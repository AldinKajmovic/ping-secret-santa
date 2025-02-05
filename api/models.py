from sqlalchemy import Column, ForeignKey, Integer, String, Text, Float, Date, DateTime, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from .database import Base

from pydantic import BaseModel


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(32), unique=True, index=True)
    password = Column(String)
    first_name = Column(String(32))
    last_name = Column(String(64))
    user_role_id = Column(Integer, ForeignKey('user_roles.user_role_id'))

    user_roles = relationship("UserRole", back_populates="users")
    first_member = relationship("SantaPair",  back_populates="first_user",
                                primaryjoin="SantaPair.first_pair_member_username == User.username")


class UserRole(Base):
    __tablename__ = "user_roles"

    user_role_id = Column(Integer, primary_key=True)
    name = Column(String(32), unique=True)

    users = relationship("User", back_populates="user_roles")


class SantaPair(Base):
    __tablename__ = "santa_pairs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    shuffle_id = Column(UUID(as_uuid=True), ForeignKey('shuffles.shuffle_id'))
    first_pair_member_username = Column(String, ForeignKey('users.username'))
    second_pair_member_username = Column(String)

    first_user = relationship("User", back_populates="first_member",
                              primaryjoin="SantaPair.first_pair_member_username == User.username")
    shuffles = relationship("Shuffle", back_populates="santa_pairs")


class Shuffle(Base):
    __tablename__ = "shuffles"

    id = Column(Integer, autoincrement=True)
    shuffle_id = Column(UUID(as_uuid=True),
                        primary_key=True, default=uuid.uuid4)

    santa_pairs = relationship("SantaPair", back_populates="shuffles")
