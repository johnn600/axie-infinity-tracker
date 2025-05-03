import eel
import shortuuid
import json


#ACCOUNT html-------------------------------------
@eel.expose
def account_info():
    data = cursor.execute('Select * from Account').fetchall()
    return json.dumps(data)

@eel.expose
def accountWidget_spare():
    data = cursor.execute('Select * from widgetAccounts_spare').fetchall()
    return json.dumps(data)

@eel.expose
def account_addEntry(data):
    try:
        cursor.execute('''Insert into Account (accountID, email, password, `ronin address`) 
                            values ("{id}", "{email}", "{password}", "{ronin}")'''
                            .format(id=shortuuid.uuid(), email=data[0], password=data[1], ronin=data[2]))
        db.commit()
        return True
    except Exception:
        return False

@eel.expose
def account_updateEntry(data):
    try:
        cursor.execute(''' Update Account
                            set email = '{email}', password = '{password}', `ronin address` = '{ronin}'
                            where accountID = '{id}'  '''
                            .format(id=data[0], email=data[1], password=data[2], ronin=data[3]))
        db.commit()
        return True
    except Exception:
        return False

@eel.expose
def account_deleteEntry(data):
    try:
        for i in data:
            cursor.execute(''' Delete from Account where accountID = '{id}'; '''.format(id=i))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False 
