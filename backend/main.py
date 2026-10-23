
from fastapi import FastAPI, HTTPException

from sqlalchemy.orm import Session

from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from pwdlib import PasswordHash

from database import engine
from models import Base, User
from services.sql_generator import generate_sql
from utils.sql_validator import validate_sql
from auth import create_access_token, verify_password


from sqlalchemy import text, create_engine, inspect
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from schemas import DatabaseConnectionRequest



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
        }


@app.post("/execute-sql")
def execute_sql_endpoint(request: QueryRequest):
    sql = generate_sql(request.question, request.db_schema)

    if not validate_sql(sql):
        raise HTTPException(status_code=400, detail="Invalid SQL")

    if cloud_engine is None:
        raise HTTPException(status_code=400, detail="Connect a database first.")

    with cloud_engine.connect() as connection:
        result = connection.execute(text(sql))
        rows = [dict(row._mapping) for row in result]   

    return {"sql": sql, "results": rows}


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
        cloud_engine.dispose()

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