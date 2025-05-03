import eel


#QUICK CHECK HTML-------------------------------------------------------------
@eel.expose
def quick_check_name(id):
    name = cursor.execute('''select name from Person, Scholar
                            where Person.personID = Scholar.personID
                            and scholarID = "{id}" '''
                            .format(id=id)).fetchall()
    return name

@eel.expose
def quick_check_slp_today(id):
    data = cursor.execute('''	SELECT sum(SLP) as TotalSLP
	                        FROM Quota
	                        WHERE strftime('%Y-%m-%d', Quota.date) = strftime('%Y-%m-%d', DATETIME(CURRENT_TIMESTAMP, 'LOCALTIME'))
                            and scholarID = '{id}'  '''
                            .format(id=id)).fetchall()
    data = [x for tup in data for x in tup]
    return data

@eel.expose
def quick_check_slp_yesterday(id):
    data = cursor.execute('''	SELECT sum(SLP) as TotalSLP
	                        FROM Quota
	                        WHERE strftime('%Y-%m-%d', Quota.date) = strftime('%Y-%m-%d', DATETIME(CURRENT_TIMESTAMP, 'LOCALTIME', '-1 day'))
                            and scholarID = '{id}'  '''
                            .format(id=id)).fetchall()
    data = [x for tup in data for x in tup]
    return data

@eel.expose
def quick_check_status(id):
    data = cursor.execute('''select P.status from Person P, Scholar S
	                        where P.personID = S.personID
	                        and S.scholarID = '{id}'  '''
                            .format(id=id)).fetchall()
    data = [x for tup in data for x in tup]
    return data

@eel.expose
def quick_check_scholar_monthly(id):
    data = cursor.execute('''Select sum(SLP) from Quota Q
	                        where Q.scholarID = '{id}'
	                        and date >= DATE('now', 'start of month') AND date < 
                            DATE('now', 'start of month', '+1 month', '-1 day');  '''
                            .format(id=id)).fetchall()
    data = [x for tup in data for x in tup]
    return data

@eel.expose
def quick_check_earningsWeek(id):
    try:
        data = cursor.execute('''select date, SLP from Quota where scholarID = '{id}'
                                and date >= DATE('now', '-6 days')
                                order by date desc
                                limit 7'''
                                .format(id=id)).fetchall()
        #check if there is data retrieved
        if len(data) == 0:
            return 0
        else:
            return data
    except Exception as e:
        print("Error: ", e)

@eel.expose
def quick_check_recentQuota(id):
    try:
        data = cursor.execute('''select date, SLP from Quota where scholarID = '{id}'
                                order by date desc'''
                                .format(id=id)).fetchall()
        #check if there is data retrieved
        if len(data) == 0:
            return 0
        else:
            return data

    except Exception as e:
        print("Error: ", e)