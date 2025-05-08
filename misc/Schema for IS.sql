-- created by John Rey Vilbar
-- schema for CCC151/ITE152
-- schema for web-based IS
-- thanks ChatGPT sa help 


CREATE TABLE 'Person' (
	"personID" TEXT NOT NULL CHECK(length(personID) = 22),
	"status" TEXT NOT NULL CHECK(status in ("active", "idle", "out")),
	"name" text NOT NULL CHECK(length(name) <= 255),
	"email" TEXT NOT NULL CHECK(email like '%@%.%'),
	"mobile number" TEXT NOT NULL check(length("mobile number") = 11),
	"facebook link"	text CHECK(length("facebook link") <= 150 OR "facebook link" LIKE '%facebook.com%'),
	"city" text not null CHECK(LENGTH(city) <= 255),
	"ronin address" text not null CHECK(length("ronin address") = 40), 
	
	PRIMARY key(personID)
);

CREATE TABLE 'Manager' (
	"managerID" TEXT NOT NULL CHECK(length(managerID) = 22),
	"personID" text not null,
	"profit_slp" int not null check(typeof("profit_slp") = 'integer') DEFAULT 0,

	PRIMARY KEY(managerID)
	UNIQUE(personID)
	FOREIGN key(personID) REFERENCES Person(personID) on DELETE CASCADE
);

CREATE TABLE 'Scholar' (	
	"scholarID" TEXT NOT NULL CHECK(length(scholarID) = 22),
	"personID" text not null,
	"contract_percentage" text not NULL DEFAULT 50,
	"share_slp" int not null check(typeof("share_slp") = 'integer') DEFAULT 0,

	PRIMARY key(scholarID)
	UNIQUE(personID)
	FOREIGN KEY(personID) REFERENCES Person(personID) on DELETE CASCADE
);

CREATE TABLE 'Account' (
	"accountID" TEXT NOT NULL CHECK(length(accountID) = 22),
	"email" TEXT NOT NULL CHECK(email like '%@%.%'),
	"password" text NOT NULL CHECK(LENGTH(password) <= 100),
	"ronin address" text not null,
	
	PRIMARY KEY(accountID)
);

CREATE TABLE 'Owns' (
	"managerID" text NOT NULL,
	"accountID" text NOT NULL,
	
	UNIQUE(accountID)
	FOREIGN KEY(managerID) REFERENCES Manager(managerID) ON DELETE CASCADE
	FOREIGN KEY(accountID) REFERENCES Account(accountID) ON DELETE CASCADE
);

CREATE TABLE 'Plays' (
	"scholarID" text not null,
	"accountID" text not null,
	
	FOREIGN key(scholarID) REFERENCES Scholar(scholarID) ON DELETE CASCADE,
	FOREIGN key(accountID) REFERENCES Account(accountID) ON DELETE CASCADE,
	UNIQUE(accountID)
);

CREATE TABLE 'Quota' (
	"quotaID" text not NULL check(LENGTH(quotaID) = 22),
	"date" text not NULL DEFAULT CURRENT_TIMESTAMP,
	"scholarID" text not NULL,
	"accountID" text not null,
	"SLP" integer NOT NULL check(typeof(SLP) = 'integer'),
	
	PRIMARY key (quotaID, 'date', scholarID, accountID)
	FOREIGN key(scholarID) REFERENCES Scholar(scholarID) ON DELETE CASCADE
	FOREIGN KEY(accountID) REFERENCES Account(accountID) on delete CASCADE
);




-- SQLite views

-- index.html
CREATE VIEW widgetIndex_slp_today AS
	SELECT sum(SLP) as TotalSLP
	FROM Quota
	WHERE strftime('%Y-%m-%d', Quota.date) = strftime('%Y-%m-%d', DATETIME(CURRENT_TIMESTAMP, 'LOCALTIME'));
	
CREATE VIEW widgetIndex_slp_yesterday AS
	SELECT sum(SLP) as TotalSLP
	FROM Quota
	WHERE strftime('%Y-%m-%d', Quota.date) = strftime('%Y-%m-%d', DATETIME(CURRENT_TIMESTAMP, 'LOCALTIME', '-1 day'));

CREATE VIEW widgetIndex_scholar_summary AS
SELECT 
    (SELECT COUNT(*) FROM Scholar WHERE personID IN (SELECT personID FROM Person WHERE status != "out")) AS total_registered,
    (SELECT COUNT(*) FROM Scholar WHERE personID IN (SELECT personID FROM Person WHERE status = "active")) AS total_active;

CREATE VIEW widgetIndex_current_month_earnings AS
	SELECT SUM(SLP) AS total_earnings
	FROM Quota
	WHERE date >= DATE('now', 'start of month') AND date < DATE('now', 'start of month', '+1 month', '-1 day');

CREATE VIEW recent_quota AS
	SELECT date, slp
	FROM Quota
	ORDER BY date DESC
	LIMIT 10;

CREATE VIEW manager_profit AS
	SELECT Manager.managerID, Person.name, SUM(Manager.profit) AS monthly_profit, strftime('%Y-%m', Quota.date) AS month
	FROM Manager
	JOIN Person ON Manager.personID = Person.personID
	JOIN Quota ON Manager.managerID = Quota.managerID
	GROUP BY Manager.managerID, month;

CREATE VIEW total_active_scholars AS
	SELECT COUNT(*) AS active_scholars
	FROM Person
	JOIN Scholar ON Person.personID = Scholar.personID
	WHERE Person.status = 'active';

CREATE VIEW scholar_earnings AS
	SELECT Scholar.scholarID, Person.name, SUM(Scholar.share) AS monthly_earnings, strftime('%Y-%m', Quota.date) AS month
	FROM Scholar
	JOIN Person ON Scholar.personID = Person.personID
	JOIN Quota ON Scholar.scholarID = Quota.scholarID
	GROUP BY Scholar.scholarID, month;
	
CREATE VIEW scholar_details AS
	SELECT s.scholarID, p.name, s."contract_percentage", s.share_slp
	FROM Scholar s
	JOIN Person p ON s.personID = p.personID;
	
CREATE VIEW scholar_unassigned AS
	SELECT personID, name
	FROM Person
	WHERE personID NOT IN (SELECT personID FROM Scholar)
	AND personID NOT IN (SELECT personID FROM Manager)
	AND personID NOT IN (SELECT personID FROM Scholar INTERSECT SELECT personID FROM Manager);
	
CREATE VIEW scholar_plays AS
	SELECT Person.name AS ScholarName, Account.accountID, Account.email
	FROM Scholar
	JOIN Person ON Scholar.personID = Person.personID
	JOIN Plays ON Scholar.scholarID = Plays.scholarID
	JOIN Account ON Plays.accountID = Account.accountID;

CREATE VIEW scholar_noaccount AS
    SELECT Scholar.scholarID, Person.name
    FROM Scholar
    JOIN Person ON Scholar.personID = Person.personID
    WHERE Scholar.scholarID NOT IN (SELECT Plays.scholarID FROM Plays);
	
CREATE VIEW account_spare AS
	SELECT Account.accountID, Account.email
	FROM Account
	WHERE Account.accountID NOT IN (SELECT Plays.accountID FROM Plays);

CREATE VIEW widgetAccounts_spare AS 
	SELECT COUNT(*) - COUNT(scholarID) AS not_found, COUNT(*) as total_accounts
	FROM Account 
	LEFT JOIN Plays 
	ON Account.accountID = Plays.accountID;

CREATE VIEW quota_scholarRecords AS
	SELECT Person.name, Scholar.scholarID, Account.accountID
	FROM Scholar
	JOIN Plays ON Scholar.scholarID = Plays.scholarID
	JOIN Account ON Plays.accountID = Account.accountID
	JOIN Person ON Scholar.personID = Person.personID;

CREATE VIEW quota_summary AS 
	SELECT date, SUM(SLP) AS total_SLP
	FROM Quota
	WHERE date >= DATE('now', '-6 days')
	GROUP BY date
	ORDER BY date DESC;

CREATE VIEW quota_details AS
	SELECT Quota.quotaID, Quota.date, Quota.scholarID, Quota.accountID, Quota.SLP, Person.name as ScholarName, Account.email as accountEmail
	FROM Quota
	JOIN Scholar on Quota.scholarID = Scholar.scholarID
	JOIN Person on Scholar.personID = Person.personID
	JOIN Account on Quota.accountID = Account.accountID;



CREATE VIEW daily_slp_summary AS
	SELECT date, SUM(SLP) AS total_slp
	FROM Quota
	WHERE date >= DATE('now', '-30 days')
	GROUP BY strftime('%Y-%m-%d', Quota.date);
	
CREATE VIEW current_month_earnings AS
	SELECT SUM(SLP) AS total_earnings
	FROM Quota
	WHERE date >= DATE('now', 'start of month') AND date < DATE('now', 'start of month', '+1 month', '-1 day');

Create view manager_7day_profit AS
	select date, SUM(Quota.SLP - (quota.SLP * (SELECT contract_percentage FROM Scholar 
		WHERE scholarID = Quota.scholarID) / 100)) as profit
	from quota
	where date >= DATE('now', '-6 days')
	GROUP by date;
	
CREATE VIEW manager_currentMonth_profit AS
	SELECT SUM(Quota.SLP - (quota.SLP * (SELECT contract_percentage FROM Scholar 
		WHERE scholarID = Quota.scholarID) / 100)) as total_slp
	FROM quota
	WHERE date >= DATE('now', 'start of month') AND date < DATE('now', 'start of month', '+1 month', '-1 day');






-- triggers
CREATE TRIGGER update_share_SLP_newQuota
	AFTER INSERT ON Quota
	FOR EACH ROW
	BEGIN
	UPDATE Scholar
	SET share_SLP = share_SLP + (NEW.SLP * (SELECT contract_percentage FROM Scholar WHERE scholarID = NEW.scholarID) / 100)
	WHERE scholarID = NEW.scholarID;
	END;

CREATE TRIGGER update_share_SLP_delQuota
	AFTER DELETE ON Quota
	FOR EACH ROW
	BEGIN
		UPDATE Scholar
		SET share_slp = share_slp - (OLD.SLP * (SELECT contract_percentage FROM Scholar WHERE scholarID = OLD.scholarID) / 100)
		WHERE scholarID = OLD.scholarID;
	END;
	
CREATE TRIGGER update_manager_profit_newQuota
	AFTER INSERT ON Quota
	FOR EACH ROW
	BEGIN
	UPDATE Manager
	SET profit_slp = profit_slp + (NEW.SLP - (NEW.SLP * (SELECT contract_percentage FROM Scholar 
		WHERE scholarID = NEW.scholarID) / 100))
	WHERE managerID = (SELECT managerID FROM Manager);
	END;
	
CREATE TRIGGER update_manager_profit_delQuota
	AFTER DELETE ON Quota
	FOR EACH ROW
	BEGIN
	UPDATE Manager
	SET profit_slp = profit_slp - (OLD.SLP - (OLD.SLP * (SELECT contract_percentage FROM Scholar 
		WHERE scholarID = OLD.scholarID) / 100))
	WHERE managerID = (SELECT managerID FROM Manager);
	END;





-- indices
CREATE INDEX person_personID_idx ON Person(personID);

CREATE INDEX scholar_scholarID_idx ON Scholar(scholarID);

CREATE INDEX manager_managerID_idx ON Manager(managerID);

CREATE INDEX account_accountID_idx ON Account(accountID);

CREATE INDEX quota_quotaID_idx ON Quota(quotaID);












