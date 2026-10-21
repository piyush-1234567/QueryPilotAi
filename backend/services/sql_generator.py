import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_sql(question: str, schema: str) -> str:
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a Text-to-SQL assistant. "
                    "Generate only a PostgreSQL SELECT query. "
                    "Use only tables and columns from the provided schema. "
                    "Never generate INSERT, UPDATE, DELETE, or DROP statements."
                )
            },
            {
                "role": "user",
                "content": f"Database schema:\n{schema}\n\nQuestion: {question}"
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()