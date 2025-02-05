from fastapi import Depends, HTTPException, status
from fastapi import FastAPI, Depends, Response
from .database import SessionLocal, engine
from .models import *
from .schemas import *
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from passlib.context import CryptContext
import os
import uuid
from fastapi import HTTPException, status, Response, Request
from typing import List
from fastapi.responses import JSONResponse
from urllib.parse import quote,unquote

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

origins = [
    "http://localhost:3000",
    "http://localhost:8000"
]

SECRET_KEY = os.getenv("SECRET_KLJUC")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def createUserTemp(user: UserCreate, db: Session = Depends(get_db)):

    check = db.query(User).filter(user.username == User.username).first()
    if not check:
        newUUID = uuid.uuid4()
        hashedPw = get_password_hash(user.password)
        newUser = User(user_id=newUUID, username=user.username, first_name=user.first_name,
                       last_name=user.last_name, password=hashedPw, user_role_id=2)
        db.add(newUser)
        db.commit()
        db.refresh(newUser)
    else:
        return False

import json
@app.post("/register")
def createUserMain(user: UserCreate, db: Session = Depends(get_db)):
    return createUserTemp(user, db)



def loginTemp(user: LoginUser, response: Response, db: Session = Depends(get_db)):
    check = db.query(User).filter(User.username == user.username).first()
    
    if check:
        checkPassword = verify_password(user.password, check.password)
        
        if checkPassword:
            role = "Administrator" if check.user_role_id == 1 else "Worker"
            user_info = {"username": user.username, "user_role": role}
            user_info_json = json.dumps(user_info)
            user_info_encoded = quote(user_info_json)
            content = {"message":"Cookie is created", "role":role, "username":user.username}
            response = JSONResponse(content)
            response.set_cookie(key="login-cookie", value=user_info_encoded) 

            return response
        else:
            return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response(status_code=status.HTTP_404_NOT_FOUND)

@app.post("/login")
def loginMain(user: LoginUser, response: Response, db: Session = Depends(get_db)):
    return loginTemp(user, response, db)


@app.get("/get_all_users")
def getAllUsers(db: Session = Depends(get_db)):
    res = db.query(User).filter(User.user_role_id == 2).all()
    return res


def createNewUser(obj: UpdateUser, db: Session = Depends(get_db)):
    hashedPw = get_password_hash(obj.password)
    newUser = User(user_id=obj.user_id, username=obj.username, first_name=obj.first_name,
                   last_name=obj.last_name, password=hashedPw, user_role_id=2)
    db.add(newUser)
    db.commit()
    db.refresh(newUser)


@app.put("/update_user")
def updateUser(obj: UpdateUser, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == obj.user_id).first()
    if not user:
        return createNewUser(obj, db)

    user.username = obj.username
    user.first_name = obj.first_name
    user.last_name = obj.last_name

    if not verify_password(obj.password, user.password):
        user.password = get_password_hash(obj.password)
    else:
        user.password = obj.password
    db.commit()
    db.refresh(user)


@app.delete("/delete_user/{id}")
def deleteUser(id: str, db: Session = Depends(get_db)):
    res = db.query(User).filter(id == User.user_id).first()
    if not res:
        return False
    else:
        db.delete(res)
        db.commit()


def createShuffleTemp(id: str, db: Session = Depends(get_db)):
    last_shuffle = db.query(Shuffle.id).order_by(Shuffle.id.desc()).first()

    if last_shuffle:
        new_id = last_shuffle.id + 1
    else:
        new_id = 0
    newShuffle = Shuffle(id=new_id, shuffle_id=id)

    db.add(newShuffle)
    db.commit()
    db.refresh(newShuffle)
    return newShuffle


@app.post("/create_shuffle/{id}")
def createShuffleMain(id: str, db: Session = Depends(get_db)):
    return createShuffleTemp(id, db)


def addShuffleMembersTemp(obj: AddShuffleMembers, db: Session = Depends(get_db)):
    listPairs = obj.santaList
    santa_pairs_data = []
    shuffleID = obj.shuffleID
    for pair in listPairs:
        first_person = pair.first_username
        second_person = pair.second_username

        santa_pair = SantaPair(
            shuffle_id=shuffleID,
            first_pair_member_username=first_person,
            second_pair_member_username=second_person
        )

        santa_pairs_data.append(santa_pair)

    db.bulk_save_objects(santa_pairs_data)
    db.commit()


@app.post("/add_shuffle_users")
def addShuffleMembersMain(obj: AddShuffleMembers, db: Session = Depends(get_db)):
    return addShuffleMembersTemp(obj, db)


def getLastShuffleMembersTemp(db: Session = Depends(get_db)):
    lastShuffle = db.query(Shuffle).order_by(Shuffle.id.desc()).first()

    if not lastShuffle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No shuffle found")

    resultQuery = db.query(SantaPair).filter(
        SantaPair.shuffle_id == lastShuffle.shuffle_id).all()

    return resultQuery


@app.get("/last_shuffle")
def getLastShuffleMembersMain(db: Session = Depends(get_db)):
    return getLastShuffleMembersTemp(db)

def getYourSantaTemp(user:str, db: Session = Depends(get_db)):
    lastShuffle = db.query(Shuffle).order_by(Shuffle.id.desc()).first()

    if not lastShuffle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No shuffle found")
    
    resultQuery = db.query(SantaPair).filter(
        SantaPair.shuffle_id == lastShuffle.shuffle_id, SantaPair.first_pair_member_username == user).first()

    return resultQuery.second_pair_member_username


@app.get("/get_santa/{user}")
def getYourSantaMain(user:str, db: Session = Depends(get_db)):
    return getYourSantaTemp(user,db)


