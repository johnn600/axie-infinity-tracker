import os
import logger
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_env(variable: str) -> str:
    """
    Fetch environment variable value to be used in Javascript.
    
    :param variable: The name of the environment variable to retrieve.
    :return: The value of the environment variable, or None if not found.
    """
    value = os.getenv(variable)
    if value is None:
        logger.logging.error(f"Environment variable '{variable}' not found.")

    return value