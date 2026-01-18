from app.db.session import engine
from sqlalchemy import text

def apply_update():
    try:
        with engine.connect() as connection:
            with open("update_db.sql", "r") as file:
                sql_script = file.read()
                print(f"Executing: {sql_script}")
                connection.execute(text(sql_script))
                connection.commit()
                print("Update applied successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    apply_update()
