from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserOut, TokenOut
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user:
    - Verifies @gmail.com suffix (validated by Pydantic schema)
    - Verifies password length >= 8 (validated by Pydantic schema)
    - Checks for duplicate Gmail in PostgreSQL
    - Checks for duplicate User ID
    - Hashes password with bcrypt
    - Persists user to PostgreSQL
    """
    # 1. Check duplicate Gmail
    existing_gmail = db.query(User).filter(User.gmail == user_in.gmail).first()
    if existing_gmail:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this Gmail already exists. Please log in or use a different Gmail."
        )

    # 2. Check duplicate User ID
    existing_uid = db.query(User).filter(User.user_id == user_in.user_id).first()
    if existing_uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is already taken. Please choose another username."
        )

    # 3. Hash password with bcrypt
    hashed = hash_password(user_in.password)

    # 4. Save to PostgreSQL database
    new_user = User(
        user_id=user_in.user_id,
        gmail=user_in.gmail,
        password_hash=hashed
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 5. Create JWT Token
    access_token = create_access_token({"sub": str(new_user.id), "user_id": new_user.user_id})

    return TokenOut(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(new_user)
    )


@router.post("/login", response_model=TokenOut)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user with Gmail or User ID + password
    """
    identifier = creds.gmail_or_user_id.strip()
    
    # Check if identifier matches gmail or user_id
    user = db.query(User).filter(
        (User.gmail == identifier.lower()) | (User.user_id == identifier)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. No user found with this Gmail or User ID."
        )

    if not verify_password(creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please check your credentials."
        )

    access_token = create_access_token({"sub": str(user.id), "user_id": user.user_id})

    return TokenOut(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns currently authenticated user profile."""
    return UserOut.model_validate(current_user)

