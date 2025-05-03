import eel
import json
import shortuuid

#PERSON HTML----------------------------------------------------------------------------
@eel.expose
def person_info():
    data = cursor.execute('Select personID, name, status, email, `mobile number`, city, `ronin address`, `facebook link` from Person ').fetchall()
    return json.dumps(data)

@eel.expose
def person_addEntry(data):
    try:
        print(data)
        cursor.execute('''Insert into Person (personID, status, name, email, `mobile number`, `facebook link`, city, `ronin address`) 
                            values ('{id}','{status}', '{name}', '{email}', '{mobile}', '{facebook}', '{city}', '{ronin}')  '''
                            .format(id=shortuuid.uuid(), status=data[6], name=data[0], email=data[1], mobile=data[3], facebook=data[4], city=data[2], ronin=data[5]))
        
        db.commit()
        return True
    except Exception:
        return False

@eel.expose
def person_editEntry(data):

    print(data)
    try:
        cursor.execute(''' Update Person 
                            set name = '{name}', status = '{status}', email = '{email}', city = '{city}', `mobile number` = '{mobile}', `facebook link` = '{facebook}', `ronin address` = '{ronin}'
                            where personID = '{id}'  '''
                            .format(id=data[0], name=data[1], status=data[2], email=data[3], city=data[4], mobile=data[5], facebook=data[6], ronin=data[7]))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False

@eel.expose
def person_deleteEntry(data):
    try:
        for i in data:
            print("personID: ", i)
            cursor.execute(''' Delete from Person where personID = '{id}'; '''.format(id=i))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False
