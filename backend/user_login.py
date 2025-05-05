import backend.database as db
import backend.logger as logger
import sqlite3


def login_scholar(scholar_id: str) -> bool:
    """
    Check if the scholar ID exists in the SQLite database.

    :param scholar_id: Scholar ID to check
    :return: True if the scholar ID exists, False otherwise
    """

    cursor = db.get_cursor()
    if not cursor:
        return False

    try:
        query = "SELECT 1 FROM Scholar WHERE scholarID = ?"
        result = cursor.execute(query, (scholar_id,)).fetchone()
        return result is not None
    
    except sqlite3.Error as e:
        logger.logging.error(f"Database error: {e}")
        return False



def login_manager(manager_id: str, manager_name: str) -> bool:
    """
    Check if a manager with the given ID and name exists in the database.

    :param manager_id: Manager ID to check
    :param manager_name: Manager name to check
    :return: 
    """

    cursor = db.get_cursor()
    if not cursor:
        return False

    try:
        query = """
            SELECT 1
            FROM Person P
            JOIN Manager M ON M.personID = P.personID
            WHERE M.managerID = ? AND P.name = ?
        """
        result = cursor.execute(query, (manager_id, manager_name)).fetchone()
        return result is not None

    except sqlite3.Error as e:
        logger.logging.error(f"Database error: {e}")
        return False

