import eel
import backend.get_env as env
import backend.user_login as user_login

def register_exposed_functions() -> None:
    '''
    Registers backend functions for exposure to JavaScript via Eel.
    '''
    @eel.expose
    def get_env(variable: str) -> str:
        return env.get_env(variable)

    @eel.expose
    def login_scholar(id: str) -> bool:
        return user_login.login_scholar(id)

    @eel.expose
    def login_manager(inputID: str, inputName: str) -> int:
        return user_login.login_manager(inputID, inputName)
