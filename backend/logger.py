import logging

def set_logging() -> None:
    '''
    Set up logging configuration.
    '''
    logging.basicConfig(
        level=logging.INFO,
    )

    logging.getLogger(__name__)