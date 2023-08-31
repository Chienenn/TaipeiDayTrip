import mysql.connector
import json
import os
import re

json_file = os.path.abspath(
    "/Users/chienen/Desktop/TaipeiDayTrip/data/taipei-attractions.json"
)

with open(json_file, mode="r", encoding="utf-8") as f:
    data = json.load(f)


try:
    conn = mysql.connector.connect(
        user="root",
        password="123123",
        host="localhost",
        port=3306,
        database="attractions",
    )
    if conn.is_connected():
        print("connected")
except Exception as e:
    print("cannot connect")

cur = conn.cursor()


item_list = data["result"]["results"]
for idx in range(len(item_list)):
    print("--------")
    print(item_list[idx]["_id"])

    image_urls = re.findall(
        r"https?://[^\s]+?\.(?:jpg|png)", item_list[idx]["file"], re.IGNORECASE
    )
    image_urls_str = ",".join(image_urls)

    values = (
        item_list[idx]["_id"],
        item_list[idx]["name"],
        item_list[idx]["CAT"],
        item_list[idx]["description"],
        item_list[idx]["address"],
        item_list[idx]["MRT"],
        item_list[idx]["direction"],
        item_list[idx]["latitude"],
        item_list[idx]["longitude"],
        image_urls_str,
    )
    sql = "INSERT INTO travel (_id,name,category,description,address,mrt,transport,latitude,longitude,images) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"

    cur.execute(sql, values)
    conn.commit()
    print(cur.rowcount, "rows got inserted")


cur.close()
conn.close()
