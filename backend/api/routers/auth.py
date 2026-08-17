from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database.session import get_db
from backend.models import User, UserSettings
from backend.schemas.all_schemas import UserRegister, UserLogin, TokenResponse
from backend.middleware.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    try:
        clean_email = user_in.email.strip().lower()
        clean_password = user_in.password.strip()

        existing = db.query(User).filter(func.lower(User.email) == clean_email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        hashed_pwd = get_password_hash(clean_password)
        new_user = User(
            email=clean_email,
            hashed_password=hashed_pwd,
            full_name=(user_in.full_name or clean_email.split("@")[0]).strip().title()
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Initialize User Settings
        user_settings = UserSettings(user_id=new_user.id)
        db.add(user_settings)
        db.commit()

        access_token = create_access_token({"sub": new_user.email, "user_id": new_user.id})
        refresh_token = create_refresh_token({"sub": new_user.email, "user_id": new_user.id})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Registration error: {str(e)}")

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    clean_password = user_in.password.strip()

    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user or not verify_password(clean_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token({"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token({"sub": user.email, "user_id": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "created_at": current_user.created_at
    }
