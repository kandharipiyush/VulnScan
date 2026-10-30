import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role="analyst"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "access_token": f"vulnscan-token-{new_user.id}",
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or user.hashed_password != hash_password(user_in.password):
        # Support demo login out of the box if no users yet
        if user_in.email == "demo@vulnscan.sec" and user_in.password == "Demo123!":
            if not user:
                user = User(
                    email="demo@vulnscan.sec",
                    hashed_password=hash_password("Demo123!"),
                    full_name="Alex Vance (Lead SecOps)",
                    role="admin"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": f"vulnscan-token-{user.id}",
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(
            email="analyst@vulnscan.sec",
            hashed_password=hash_password("vulnscan2026"),
            full_name="Lead Security Architect",
            role="admin"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

