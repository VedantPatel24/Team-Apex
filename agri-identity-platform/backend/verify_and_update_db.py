
from app.db.session import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_db():
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='document' AND column_name='is_sensitive'"))
            if result.fetchone():
                logger.info("Column 'is_sensitive' already exists.")
            else:
                logger.info("Adding column 'is_sensitive' to 'document' table...")
                conn.execute(text("ALTER TABLE document ADD COLUMN is_sensitive BOOLEAN DEFAULT FALSE"))
                conn.commit()
                logger.info("Column added successfully.")
            
    except Exception as e:
        logger.error(f"Error updating DB: {e}")

if __name__ == "__main__":
    update_db()
