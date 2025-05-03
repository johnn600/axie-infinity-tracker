import backend.database as db


def login_scholar(id: str) -> bool:
    '''
    Check if the scholarID exists in the SQLite database.
    
    :param id: Scholar ID to check
    :return: True if the scholarID exists, False otherwise
    '''
    cursor = db.get_cursor()

    if cursor:
        data = cursor.execute("select * from Scholar where scholarID = '{id}' "
                            .format(id=id)).fetchall()
        
        if len(data) == 0:
            return False
        
        else:
            return True


def login_manager(id: str, name: str) -> bool:
    '''
    Check if the managerID and name exist in the database.

    :param id: Manager ID to check
    :param name: Name to check
    :return: True if the managerID and name exist, False if they do not exist
    '''
    cursor = db.get_cursor()

    if cursor:
        name = cursor.execute('''select name from Person P, Manager M where M.personID = P.personID
                                and M.managerID = '{id}'    '''
                                .format(id = id)).fetchall()
        if len(name) == 0:
            return False
        
        else:
            id = cursor.execute('''select M.managerID from Person P, Manager M where M.personID = P.personID
                                and P.name = '{name}'   '''
                                .format(name=name)).fetchall()
            
            try:
                if id[0][0] == id:
                    return True
                
            except IndexError:
                return False
