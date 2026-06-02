import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL Connection URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:%40middle9028@localhost:5432/Flower_AI_Manager")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

alter_statements = [
    text("ALTER TABLE florists ADD COLUMN IF NOT EXISTS email VARCHAR;"),
    text("ALTER TABLE florists ADD COLUMN IF NOT EXISTS hashed_password VARCHAR;"),
    text("ALTER TABLE florists ADD COLUMN IF NOT EXISTS business_number VARCHAR;"),
    text("ALTER TABLE florists ADD COLUMN IF NOT EXISTS address VARCHAR;"),
    text("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS price INTEGER;")
]

with engine.begin() as conn:
    for stmt in alter_statements:
        try:
            conn.execute(stmt)
            print(f"Executed: {stmt}")
        except Exception as e:
            print(f"Failed to execute {stmt}: {e}")
