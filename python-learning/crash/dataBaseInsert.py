__author__ = 'yantianyu'

import mysql.connector
import datetime

username = 'root'
password = ''
host = 'localhost'
db = 'test'

connection = mysql.connector.connect(user=username, password=password, host=host, database=db, port=3307)
cursor = connection.cursor()

with open(r'1.txt') as f:
    s = f.read()
    b = s.split()
    for word in b:
        sql = "replace test_x (msg,date) values ('%s','%s');" % (word, datetime.date(year=2005,month=7,day=25))
        cursor.execute(sql)

# cursor.execute("insert into test_x (msg) values('YYYYUUUUUIIIIIOOOOO')")
connection.commit()
cursor.close()
connection.close()
# cursor.execute("select * from test_x")
# print(cursor.fetchall())
