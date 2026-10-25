
from fastapi import FastAPI, HTTPException

from sqlalchemy.orm import Session
from auth import create_access_token, verify_password, decode_access_token  
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from pwdlib import PasswordHash

from database import engine
from models import Base, User, QueryHistory , SavedQuery
from services.sql_generator import generate_sql
from utils.sql_validator import validate_sql



from sqlalchemy import text, create_engine, inspect
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from schemas import DatabaseConnectionRequest
from fastapi import Header


cloud_engine = None


password_hash = PasswordHash.recommended()

app = FastAPI(title="QueryPilot AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


class QueryRequest(BaseModel):
    question: str
    db_schema: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.get("/")
def home():
    return {"message": "QueryPilot AI backend is running!"}


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database()"))
        return {"database": result.scalar(), "status": "connected"}


@app.post("/generate-sql")
def generate_query(request: QueryRequest):
    sql = generate_sql(request.question, request.db_schema)

    if not validate_sql(sql):
        raise HTTPException(status_code=400, detail="Unsafe or invalid SQL")

    return {"sql": sql}


@app.post("/register")
def register_user(request: RegisterRequest):
    hashed_password = password_hash.hash(request.password)

    user = User(
        name=request.name,
        email=request.email,
        hashed_password=hashed_password,
    )

    with Session(engine) as session:
        session.add(user)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=409,
                detail="Email already registered",
            )

    return {"message": "Registration successful"}


@app.post("/login")
def login(request: LoginRequest):
    with Session(engine) as session:
        user = session.query(User).filter(
            User.email == request.email
        ).first()

        if not user or not verify_password(
            request.password, user.hashed_password
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        token = create_access_token(user.email)

        return {
            "access_token": token,
            "token_type": "bearer",
            "name": user.name,
            "email": user.email
        }

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@app.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    authorization: str = Header(...)
):
    payload = decode_access_token(authorization.replace("Bearer ", ""))

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    with Session(engine) as session:
        user = session.query(User).filter(
            User.email == payload["sub"]
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(request.current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        user.hashed_password = password_hash.hash(request.new_password)
        session.commit()

    return {"message": "Password changed successfully"}

class UpdateProfileRequest(BaseModel):
    name: str


@app.put("/update-profile")
def update_profile(
    request: UpdateProfileRequest,
    authorization: str = Header(...)
):
    payload = decode_access_token(authorization.replace("Bearer ", ""))

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not request.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    with Session(engine) as session:
        user = session.query(User).filter(
            User.email == payload["sub"]
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.name = request.name.strip()
        session.commit()

    return {"message": "Profile updated successfully"}
@app.delete("/delete-account")
def delete_account(authorization: str = Header(...)):
    payload = decode_access_token(authorization.replace("Bearer ", ""))

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    with Session(engine) as session:
        user = session.query(User).filter(
            User.email == payload["sub"]
        ).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        session.query(QueryHistory).filter(
            QueryHistory.user_id == user.id
        ).delete(synchronize_session=False)

        session.query(SavedQuery).filter(
            SavedQuery.user_id == user.id
        ).delete(synchronize_session=False)

        session.delete(user)
        session.commit()

    return {"message": "Account deleted successfully"}
@app.post("/execute-sql")
def execute_sql_endpoint(
    request: QueryRequest,
    authorization: str = Header(...)
):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    with Session(engine) as session:
        user = session.query(User).filter(
            User.email == payload["sub"]
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        sql = generate_sql(request.question, request.db_schema)

        if not validate_sql(sql):
            raise HTTPException(status_code=400, detail="Invalid SQL")

        if cloud_engine is None:
            raise HTTPException(status_code=400, detail="Connect a database first.")

        try:
            with cloud_engine.connect() as connection:
                result = connection.execute(text(sql))
                rows = [dict(row._mapping) for row in result]

            status = "Success"

        except SQLAlchemyError:
            rows = []
            status = "Failed"

            session.add(QueryHistory(
                user_id=user.id,
                question=request.question,
                sql_query=sql,
                status=status
            ))
            session.commit()

            raise HTTPException(status_code=400, detail="SQL execution failed")

        session.add(QueryHistory(
            user_id=user.id,
            question=request.question,
            sql_query=sql,
            status=status
        ))
        session.commit()

    return {"sql": sql, "results": rows}
@app.get("/query-history")
def get_query_history(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    with Session(engine) as session:
        user = session.query(User).filter(
            User.email == payload["sub"]
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        history = session.query(QueryHistory).filter(
            QueryHistory.user_id == user.id
        ).order_by(QueryHistory.created_at.desc()).all()

        return [
            {
                "question": item.question,
                "sql_query": item.sql_query,
                "status": item.status,
                "created_at": item.created_at
            }
            for item in history
        ]
@app.post("/save-query")
def save_query(request: QueryRequest, authorization: str = Header(...)):
    sql = generate_sql(request.question, request.db_schema)
    if not validate_sql(sql):
        raise HTTPException(status_code=400, detail="Invalid SQL")
    payload = decode_access_token(authorization.replace("Bearer ", ""))
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    with Session(engine) as session:
        user = session.query(User).filter(User.email == payload["sub"]).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        saved = SavedQuery(
            user_id=user.id,
            question=request.question,
            sql_query=sql
        )
        session.add(saved)
        session.commit()

    return {"message": "Query saved successfully"}
@app.get("/saved-queries")
def get_saved_queries(authorization: str = Header(...)):
    payload = decode_access_token(authorization.replace("Bearer ", ""))

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    with Session(engine) as session:
        user = session.query(User).filter(
            User.email == payload["sub"]
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        queries = session.query(SavedQuery).filter(
            SavedQuery.user_id == user.id
        ).order_by(SavedQuery.created_at.desc()).all()

        return [
            {
                "id": q.id,
                "question": q.question,
                "sql_query": q.sql_query,
                "created_at": q.created_at
            }
            for q in queries
        ]
@app.post("/connect-database")
def connect_database(request: DatabaseConnectionRequest):
    global cloud_engine
    url = request.connection_url.get_secret_value()

    if not url.startswith("postgresql://"):
        raise HTTPException(
            status_code=400,
            detail="Only PostgreSQL URLs are supported."
        )

    try:
        cloud_engine = create_engine(
            url,
            connect_args={"connect_timeout": 5},
            pool_pre_ping=True,
        )

        with cloud_engine.connect() as connection:
            inspector = inspect(connection)
            tables = inspector.get_table_names()

            schema = {
                table: [
                    column["name"]
                    for column in inspector.get_columns(table)
                ]
                for table in tables
            }

            database_name = connection.execute(
                text("SELECT current_database()")
            ).scalar()
        return {
            "status": "connected",
            "database": database_name,
            "schema": schema
        }

    except SQLAlchemyError as e:
        print("Database connection error:", repr(e))
        if cloud_engine is not None:
            cloud_engine.dispose()
            cloud_engine = None

        raise HTTPException(
            status_code=400,
            detail="Connection failed. Check credentials, URL, and database availability."
        )

@app.post("/disconnect-database")
def disconnect_database():
    global cloud_engine

    if cloud_engine is not None:
        cloud_engine.dispose()
        cloud_engine = None

    return {"message": "Database disconnected"}

