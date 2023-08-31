from mysql.connector import pooling
import mysql.connector.pooling
import os
from dotenv import load_dotenv

load_dotenv()
mydb_password = os.getenv("db_password")

mydb = {
    "host": "localhost",
    "user": "root",
    "password": mydb_password,
    "database": "attractions",
}

pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool", pool_size=5, pool_reset_session=True, **mydb
)
