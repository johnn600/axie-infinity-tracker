import sys
import sqlite3
import json

if __name__ == "__main__":
    # open database file
    with sqlite3.connect("D:\Revised IS\web\database\database.db") as conn:
        # builtin Row object is easy to convert to dict
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        # get the names of the tables
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [a["name"] for a in c.fetchall()]
        # get content from each table
        # TODO: make this into a dict comprehension (if possible)
        db_content = {}
        for table in tables:
            c.execute("SELECT * FROM {0}".format(table))
            db_content[table] = [dict(a) for a in c.fetchall()]
    # dump contents to json file
    with open('json.txt', "w") as f:
        json.dump(db_content, f, indent=4)