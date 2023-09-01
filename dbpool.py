from mysql.connector import pooling
import mysql.connector.pooling
import os
from dotenv import load_dotenv

load_dotenv()
mydb_password = os.getenv("DB_PASSWORD")

mydb = {
    "host": "localhost",
    "user": "chien",
    "password": mydb_password,
    "database": "mydatabase",
}

pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool", pool_size=5, pool_reset_session=True, **mydb
)
