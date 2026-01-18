from app.db.session import engine
from sqlalchemy import text

def run_sql_file():
    with engine.connect() as connection:
        with open("init.sql", "r") as file:
            sql_script = file.read()
            # Split by statement to execute individually if needed, 
            # but SQLAlchemy executescript or execute(text) might handle it.
            # However, standard practice with SQLAlchemy for raw DDL script:
            connection.execute(text(sql_script))
            connection.commit()
            print("SQL script executed successfully.")

if __name__ == "__main__":
    run_sql_file()
