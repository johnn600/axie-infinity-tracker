import eel

#INDEX HTML (Dashboard) ------------------------------------------------------
@eel.expose
def slp_today():
    data = cursor.execute('select * from widgetIndex_slp_today').fetchall()
    data = [x for tup in data for x in tup]
    return data[0] 

@eel.expose
def slp_yesterday():
    data = cursor.execute('select * from widgetIndex_slp_yesterday').fetchall()
    data = [x for tup in data for x in tup]
    return data[0]

@eel.expose
def scholars_active():
    data = cursor.execute('SELECT * FROM widgetIndex_scholar_summary').fetchall()
    #convert from tuples into list
    data = [x for tup in data for x in tup]
    return json.dumps(data)

@eel.expose
def earnings_current_month():
    data = cursor.execute('SELECT * FROM widgetIndex_current_month_earnings').fetchall()
    if data[0][0] == None:
        return False
    else:
        return data

@eel.expose
def recent_quota():
    #check first if there are any recent quota
    count = cursor.execute('SELECT count(*) FROM recent_quota').fetchall()
    if count[0][0] == 0:
        return False
    else:
        data = cursor.execute('Select * from recent_quota').fetchall()
        return json.dumps(data)

@eel.expose
def slp_price():
    #fetch the price of SLP (in USD)
    value = requests.get('https://cryptoprices.cc/SLP')
    data = json.loads(value.text)
    return json.dumps(data)

@eel.expose
def graph_dailyEarnings():
    data = cursor.execute('SELECT * FROM quota_summary').fetchall()
    return json.dumps(data)
