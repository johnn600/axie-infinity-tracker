# Axie Tracker System
# Created by John Rey Vilbar (in compliance for ITE152)
# This is a refactored version of the original system


import eel
import bottle
import platform

import backend.database as db
import backend.hide_console as hide_console
import backend.logger as logger
import backend.server.eel_expose as expose


# Initialize python eel
eel.init('web')

# Set logger
logger.set_logging()

# Initialize and test database connection
db.initialize()
test_db = db.test_connection()

if not test_db:
    raise Exception("Database connection failed.")


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
expose.register_exposed_functions()


if __name__ == '__main__':
    try:
        
        logger.logging.info("Eel session running.")

        eel.start('login.html', 
                  mode='chrome', 
                  host='localhost', 
                  port=8000, 
                  cmdline_args=['--start-maximized'], 
                  shutdown_delay=3,
                  disable_cache=True,
        )
        
    except OSError:
        logger.logging.error(f"Error: {OSError}")

