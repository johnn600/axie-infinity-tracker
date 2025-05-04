# Axie Tracker System
# Created by John Rey Vilbar (in compliance for ITE152)
# This is a refactored version of the original system


import eel
import bottle
import os
import platform

import backend.database as db
import backend.get_env as env
import backend.user_login as user_login
import backend.hide_console as hide_console
import backend.logger as logger


# Initialize python eel
eel.init('web')

# Set logger
logger.set_logging()

# Initialize and test database connection
db.initialize()
test_db = db.test_connection()

if not test_db:
    raise Exception("Database connection failed.")

# Fallback function to close the Eel session completely when the browser window is closed.
# Issue: after closing browser window, py script might still run in the background
def close_callback(route, websockets):
    if not websockets:
        print("No active Eel sessions. Exiting...")
        os._exit(0)

#smooth-love-potion = SLP
#axie-infinity = AXS
#more in https://docs.google.com/spreadsheets/d/1wTTuxXt8n9q7C4NDXqQpI3wpKu1_5bGVmP9Xz0XGSyU/edit?usp=sharing

# Hide the python console when clicking the app.py (in Windows only)
if platform.system() == 'Windows':
    hide_console.hide_console()

# Use Bottle to serve static files rather than Eel in order to load the files faster
@bottle.route('/static/<filepath:path>')
def server_static(filepath):
    return bottle.static_file(filepath, root='static')


# Expose python functions to JavaScript
@eel.expose
def get_env(variable: str) -> str:
    return env.get_env(variable)

@eel.expose
def login_scholar(id: str) -> bool:
    return user_login.login_scholar(id)

@eel.expose
def login_manager(inputID: str, inputName: str) -> int:
    return user_login.login_manager(inputID, inputName)



if __name__ == '__main__':
    try:
        logger.logging.info("Python eel app launching...")

        eel.start('login.html', 
                  mode='chrome', 
                  host='localhost', 
                  port=8000, 
                  cmdline_args=['--start-maximized', '--disable-web-security'], 
                  shutdown_delay=1,
                #   close_callback=close_callback
        )
        
    except OSError:
        logger.logging.error(f"Error: {OSError}")

