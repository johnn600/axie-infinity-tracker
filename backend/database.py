import sqlite3 as sq
import backend.logger as logger
import os

from sqlite3 import Connection, Cursor
from typing import Optional
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

DATABASE_PATH = os.getenv('DATABASE_PATH')

_db: Optional[Connection] = None
_cursor: Optional[Cursor] = None
logger.set_logging()


def initialize():
    '''
    Start database connection.
    '''
    global _db, _cursor

    try: 
        if _db is not None:
            _db.close()

        _db = sq.connect(DATABASE_PATH, check_same_thread=False)
        _db.execute("PRAGMA foreign_keys = ON")  # Enable foreign key support
        _cursor = _db.cursor()
        logger.logging.info("Database connection set.")
    
    except sq.Error as e:
        logger.logging.error(f"Database connection failed: {e}")
        raise

def get_connection() -> Connection:
    if _db is None:
        logger.logging.info("No existing connection found, creating a new one.")
        initialize()

    return _db

def get_cursor() -> Cursor:
    '''
    Get the cursor for executing SQL commands.
    '''
    if _cursor is None:
        logger.logging.info("No existing cursor found, creating a new one.")
        initialize()

    return _cursor

def test_connection() -> bool:
    '''
    Performs some basic sanity checks.
    '''
    try:
        cur = get_cursor()
        cur.execute('SELECT 1 FROM Person WHERE status = "Active" LIMIT 1')
        cur.execute('SELECT 1 FROM Scholar WHERE contract_percentage <= 50 LIMIT 1')
        cur.execute('SELECT 1 FROM widgetIndex_slp_yesterday LIMIT 1')

        logger.logging.info("Database checks passed.")
        return True
    
    except sq.Error as e:
        logger.logging.error(f"Database check failed: {e}")
        return False

def close_connection() -> None:
    '''
    Close the database connection.
    '''
    try:
        global _db, _cursor
        if _cursor:
            _cursor.close()
            _cursor = None
        if _db:
            _db.close()
            _db = None
        logger.logging.info("Database connection closed.")

    except sq.Error as e:
        logger.logging.error(f"Error closing database connection: {e}")
