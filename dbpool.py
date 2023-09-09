from mysql.connector import pooling
import mysql.connector.pooling
import os
from dotenv import load_dotenv

load_dotenv()
# mydb_password = os.getenv("DB_PASSWORD")

mydb = {
    "host": "localhost",
    # "user": "chien",
    # "password": "Password1-",
    # "database": "mydatabase",
    "password": "123123",
    "database": "attractions",
    "user": "root",
}

pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool", pool_size=5, pool_reset_session=True, **mydb
)
