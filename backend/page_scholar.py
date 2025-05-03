import eel
import json
import shortuuid


#SCHOLAR HTML---------------------------------------------------------------------------
@eel.expose
def scholar_info():
    data = cursor.execute('Select * from scholar_details').fetchall()
    if data == None:
        return False
    else:
        return json.dumps(data)

@eel.expose
def scholar_plays():
    data = cursor.execute('Select * from scholar_plays').fetchall()
    if data == None:
        return False
    else:
        return json.dumps(data)

@eel.expose
def scholar_noAccount():
    data = cursor.execute('Select * from scholar_noaccount').fetchall()
    if data == None:
        return False
    else:
        return json.dumps(data)

@eel.expose
def scholar_spareAccount():
    data = cursor.execute('Select * from account_spare').fetchall()
    if data == None:
        return False
    else:
        return json.dumps(data)

@eel.expose
def unassigned_persons():
    data = cursor.execute('Select * from scholar_unassigned').fetchall()
    if data[0][0] == None:
        return False
    else:
        return json.dumps(data)

@eel.expose
def scholar_addEntry(data, defaults):
    try:
        counter = 0
        for i in data:           
            cursor.execute(''' Insert into Scholar (scholarID, personID, contract_percentage) 
                                values('{id}', '{personID}', '{defaults}')    '''
                                .format(id=shortuuid.uuid(), personID=data[counter], defaults=defaults[0]))
            counter += 1
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False

@eel.expose
def scholar_updateEntry(data):
    try:
        cursor.execute(''' Update Scholar 
                            set contract_percentage = '{contract}'
                            where scholarID = '{id}'  '''
                            .format(contract=data[2], id=data[0]))
        db.commit()
        return True
    except Exception:
        return False

@eel.expose
def scholar_deleteEntry(data):
    try:
        for i in data:
            print("personID: ", i)
            cursor.execute(''' Delete from Scholar where scholarID = '{id}'; '''.format(id=i))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False 

@eel.expose
def scholar_assignAccount(data):
    try:
        cursor.execute(''' Insert into Plays (scholarID, accountID) 
                        values('{scholarID}', '{accountID}')    '''
                        .format(scholarID=data[0], accountID=data[1]))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False

@eel.expose
def scholar_removeAccount(data):
    try:
        cursor.execute(''' Delete from Plays
                        where accountID = '{accountID}'    '''
                        .format(accountID=data))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False
