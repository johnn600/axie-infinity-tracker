import eel
import json
import shortuuid


#QUOTA html-------------------------------------
@eel.expose
def quota_info():
    data = cursor.execute('Select * from quota_details').fetchall()
    return json.dumps(data)

@eel.expose
def quota_scholarRecord():
    data = cursor.execute('Select * from quota_scholarRecords').fetchall()
    return json.dumps(data)

@eel.expose
def quota_addEntry(data):
    try:
        cursor.execute('''Insert into Quota (quotaID, date, scholarID, accountID, SLP) 
                            values ("{id}", "{date}", "{scholarID}", "{accountID}", "{slp}")'''
                            .format(id=shortuuid.uuid(), date=data[0], scholarID=data[1], accountID=data[2], slp=data[3]))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False

@eel.expose
def quota_deleteEntry(data):
    try:
        for i in data:
            cursor.execute(''' Delete from Quota where quotaID = '{id}'; '''.format(id=i))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False 
