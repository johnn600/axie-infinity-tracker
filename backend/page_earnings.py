import eel
import json

#EARNINGS html-------------------------------------
@eel.expose
def earnings_currentMonth():
    data = cursor.execute('Select * from manager_currentMonth_profit').fetchall()
    return json.dumps(data)

@eel.expose
def earnings_today():
    data = cursor.execute('''Select profit from manager_7day_profit
                            where date = DATE('now')''').fetchall()
    return json.dumps(data)

@eel.expose
def earnings_weekly():
    data = cursor.execute('Select * from manager_7day_profit').fetchall()
    return json.dumps(data)

