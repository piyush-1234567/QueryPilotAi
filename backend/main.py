from fastapi import FastAPI
from sqlalchemy import  text
from database import engine
from models import Base ,User
from fastapi import HTTPException
from pydantic import BaseModel
from services.sql_generator import generate_sql
from utils.sql_validator import validate_sql
from fastapi.middleware.cors import CORSMiddleware
from pwdlib import PasswordHash
from pydantic import EmailStr
from sqlalchemy.exc import IntegrityError



password_hash = PasswordHash.recommended()

app = FastAPI(title = "QueryPilot AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class QueryRequest(BaseModel):
    question: str
    db_schema: str

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "QueryPilot AI backend is running!"}


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database()"))
        return {"database": result.scalar(), "status":"connected"}
@app.post("/generate-sql")
def generate_query(request: QueryRequest):
    sql = generate_sql(request.question, request.db_schema)

    if not validate_sql(sql):
        raise HTTPException(status_code=400, detail="Unsafe or invalid SQL")

    return {"sql": sql}
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
@app.post("/register")
def register_user(request: RegisterRequest):
    hashed_password = password_hash.hash(request.password)

    user = User(
        name=request.name,
        email=request.email,
        hashed_password=hashed_password
    )

    from sqlalchemy.orm import Session
    with Session(engine) as session:
        session.add(user)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=409, detail="Email already registered")

    return {"message": "Registration successful"}
@app.post("/execute-sql")
def execute_sql_endpoint(request: QueryRequest):
    sql = generate_sql(request.question, request.db_schema)

    if not validate_sql(sql):
        raise HTTPException(status_code=400, detail="Invalid SQL")

    with engine.connect() as connection:
        result = connection.execute(text(sql))
        rows = [dict(row._mapping) for row in result]

    return {"sql": sql, "results": rows}