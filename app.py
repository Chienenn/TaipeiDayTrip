from flask import jsonify, render_template, Flask, request,redirect
import json
import jwt
import datetime
from dbpool import pool
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import requests
import boto3
load_dotenv()


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.json.ensure_ascii = False  # 解碼
app.config["TEMPLATES_AUTO_RELOAD"] = True
secret_key = "secret_key"
client = boto3.client('s3', region_name='ap-southeast-2')
partney_key_secret_name = "partney_key"
merchant_id_secret_name = "merchant_id"
x_api_key_secret_name = "x_api_key"

partney_key_response = client.get_secret_value(SecretId=partney_key_secret_name)
merchant_id_response = client.get_secret_value(SecretId=merchant_id_secret_name)
x_api_key_response = client.get_secret_value(SecretId=x_api_key_secret_name)

partney_key = partney_key_response['SecretString']
merchant_id = merchant_id_response['SecretString']
x_api_key = x_api_key_response['SecretString']


# Pages
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


@app.route("/api/attractions")
def get_attractions():
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        page = int(request.args.get("page", 0))
        keyword = request.args.get("keyword", "")

        if not keyword:
            query = "SELECT id, name, category, description, address, mrt, transport, latitude, longitude, images FROM travel LIMIT %s, %s"
            query_params = (page * 12, 12)
        else:
            query = "SELECT id, name, category, description, address, mrt, transport, latitude, longitude, images FROM travel WHERE (name LIKE %s OR category LIKE %s OR mrt = %s) ORDER BY id LIMIT %s OFFSET %s "
            query_params = (f"%{keyword}%", keyword, keyword, 12, page * 12)

        cursor.execute(query, query_params)
        attractions = cursor.fetchall()

        data_len = 12
        next_page = page + 1 if len(attractions) == data_len else None

        for attraction in attractions:
            attraction["images"] = attraction["images"].split(",")

        response_data = {"nextPage": next_page, "data": attractions}
        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": True, "message": "伺服器錯誤"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/attraction/<attractionId>")
def get_attraction_id(attractionId):
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT id, name, category, description, address, mrt, transport, latitude, longitude, images FROM travel WHERE id = %s"
        cursor.execute(query, (attractionId,))
        attraction_data = cursor.fetchone()

        if not attraction_data:
            return jsonify({"error": True, "message": "輸入錯誤，無此 id 編號"}), 400

        attraction_data["images"] = attraction_data["images"].split(",")
        return jsonify({"data": attraction_data})

    except:
        return jsonify({"error": True, "message": "伺服器錯誤"}), 500
    finally:
        conn.close()
        cursor.close()


@app.route("/api/mrts")
def get_mrts():
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT mrt, COUNT(*) AS num_attractions
            FROM travel
            WHERE mrt IS NOT NULL
            GROUP BY mrt
            ORDER BY num_attractions DESC
        """

        cursor.execute(query)
        mrts = [row["mrt"] for row in cursor.fetchall()]

        return jsonify({"data": mrts})
    except Exception as e:
        return jsonify({"error": True, "message": "伺服器錯誤"}), 500
    finally:
        cursor.close()
        conn.close()


# Register

@app.route("/api/user", methods=["POST"])
def register():
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        user = request.get_json()
        name = user["name"]
        email = user["email"]
        password = user["password"]

        if not name.strip() or not email.strip() or not password.strip():
            return jsonify({"message": "註冊失敗：欄位不可為空白！"}), 400

        if len(password) < 5 :
            return jsonify({"message": "註冊失敗：密碼需有 5 位數以上"}), 400

        cursor.execute("SELECT * FROM member WHERE email=%s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"message": "註冊失敗：該 Email 已被註冊！"}), 400

        cursor.execute(
            "INSERT INTO member (name,email,password) VALUES (%s, %s , %s)",
            (name, email, password),
        )
        conn.commit()
        return jsonify({"ok": True}), 200

    except:
        return jsonify({"error": True, "message": "伺服器錯誤"}), 500

    finally:
        cursor.close()
        conn.close()

    
@app.route("/api/user/auth", methods=["PUT","GET","DELETE"])
def auth():
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        if request.method == "GET":
            authorization_header = request.headers.get('Authorization')
            # print(authorization_header)
            if authorization_header:
                token = authorization_header.split("Bearer ")[1]
                data = jwt.decode(token, secret_key, algorithms=['HS256'])

                return jsonify({'data':data})
            else:
                return jsonify({"data":None})
        
        elif request.method == "PUT":
            
            user = request.get_json()
            email = user.get("email")
            password = user.get("password")

            if not email or not password:
                return jsonify({"error": True, "message": "帳號或密碼不可為空"}),400
        
            cursor.execute('SELECT * FROM member WHERE email = %s AND password = %s' , (email,password))
            checking = cursor.fetchall()

            if len(checking) > 0:
                name = checking[0]['name']
                user_id = checking[0]['id']
                user_info = {"data": {'id':user_id,'name':name,'email':email}}

                expiration_time = datetime.utcnow() + timedelta(days=7)
                user_info["exp"] = expiration_time

                token=jwt.encode(user_info,secret_key,algorithm='HS256')
                print(token)
                response = jsonify({'token':token,'ok':True})
                return response
            else:
                return jsonify ({'error':True,'message':'帳號或密碼輸入錯誤！'}),400

        
        elif request.method == "DELETE":
            response = jsonify({'ok':True})
            return response
    except:
        return jsonify({"error":True,"message":"伺服器錯誤"}),500
    
    finally:
        conn.close()
        cursor.close()

# Booking 

@app.route("/api/booking" , methods=["GET","POST","DELETE"])
def resveration():
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        auth_header = request.headers.get('Authorization')
        # print("booking,",auth_header)

        if request.method == "GET":
            if auth_header:
                try:
                    token = auth_header.split("Bearer ")[1]
                    data = jwt.decode(token, secret_key, algorithms=['HS256'])
                    user_id = data["data"]["id"]
                except:
                    return jsonify({"error":"令牌失效"}),403

                cursor.execute("SELECT id FROM member WHERE id = %s" , (user_id,))
                member_id = cursor.fetchone()["id"]

                cursor.execute("SELECT attractionID,date,time,price FROM reservation WHERE memberID=%s",(member_id,))
                reservation = cursor.fetchone()

                if reservation is not None :
                    attraction_id = reservation["attractionID"]
                    date = reservation["date"]
                    date_str = date.strftime("%Y-%m-%d")
                    time = reservation["time"]
                    price = reservation["price"]

                    cursor.execute("SELECT name , address , images FROM travel WHERE id = %s",(attraction_id ,))
                    travel = cursor.fetchone()
                    name = travel["name"]
                    address = travel["address"]
                    images = travel["images"]
                    image = images.split(",")[0]
                    

                    return ({ "data" :{ "attraction" :{"id":attraction_id,"name":name,"address":address,"images":image}},"date":date_str,"time":time,"price":price})
                else:
                    return ({"data":None})
            else:
                return ({"error":True,"message":"未登入系統！！"}),403
            
        elif request.method == "POST" :
            auth_header = request.headers.get('Authorization')
            print(auth_header)
            reservation=request.get_json()
            print(reservation)
            attractionId=reservation["attractionId"]
            date=reservation["date"]
            time=reservation["time"]
            price=reservation["price"]


            if not auth_header:
                return jsonify({"error":True,"message":"未登入系統"}),403
            elif not date:
                return jsonify({"error":True,"message":"日期不可為空"}),400
            
            
            token = auth_header.split("Bearer ")[1]
            decoded = jwt.decode(token,secret_key,algorithms=["HS256"])
            user_id=decoded["data"]["id"]

            cursor.execute('SELECT id FROM member WHERE id = %s' , (user_id ,))
            member_id = cursor.fetchone()["id"]

            cursor.execute("SELECT * FROM reservation WHERE memberID = %s ", (member_id, ))
            existing_reservation = cursor.fetchone()
            print("existing",existing_reservation)
            cursor.close()

            cursor = conn.cursor(dictionary=True)
            if existing_reservation: 
                    cursor.execute("UPDATE reservation SET date=%s, time=%s, price=%s,attractionID=%s WHERE id = %s",
                    (date, time, price,attractionId, existing_reservation["id"]))
            else:
                    cursor.execute("INSERT INTO reservation (date, time, price,attractionID, memberID) VALUES (%s, %s, %s, %s, %s)",(date, time, price,attractionId,member_id))

            conn.commit()
            print(cursor.rowcount,"was update")
            return{"ok":True}
            

        elif request.method =="DELETE":
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"error": True, "message": "未登入系統"}), 403
            try:
                token = auth_header.split("Bearer ")[1]
                decoded = jwt.decode(token,secret_key,algorithms=["HS256"])
                user_id = decoded["data"]["id"]
                print("User ID:", user_id)
            
                try:
                    cursor.execute("DELETE FROM reservation WHERE memberID = %s",(user_id,))
                    conn.commit()
                    return{"ok":True}
                except Exception as e:
                    print(e) 
                    return jsonify({"error": True, "message": "伺服器錯誤"}), 500
            except:
                return jsonify({"error": "令牌失效"}),403

    finally:
        conn.close()
        cursor.close()

@app.route("/api/orders",methods=["POST"])
def orders():
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        auth_header = request.headers.get('Authorization')
        order = request.get_json()

        name = order["order"]["contact"]["name"]
        email = order["order"]["contact"]["email"]
        phone = order["order"]["contact"]["phone"]
        prime = order["prime"]
        
        attractionId=order["order"]["trip"]["attraction"]["id"]

        date = order["order"]["trip"]["date"]
        time = order["order"]["trip"]["time"]
        price = order["order"]["price"]
        datetime = datetime.now()
        #訂單編號 20231003021000
        order_number = datetime.strftime("%Y%m%d%H%M%S")
     
        token = auth_header.split("Bearer ")[1]
        decoded = jwt.decode(token,secret_key,algorithms=["HS256"])
        user_id = decoded["data"]["id"]
        # print("user",user_id)

        cursor.execute("INSERT INTO orders (order_number,status,member_id ,contact_name,contact_email,contact_phone) VALUES(%s,%s,%s, %s,%s,%s)",(order_number , "未付款" , user_id , name , email , phone))
        conn.commit()

        cursor.execute("INSERT INTO order_trip (order_number,member_id,attractionId,date,time,price) VALUES (%s,%s,%s,%s,%s,%s)",(order_number,user_id, attractionId, date, time, price))
        conn.commit()

        #tappay
        
        tap_pay = {
            "prime":prime,
            "partner_key":partney_key,
            "merchant_id":merchant_id,
            "details":"TapPay Test",
            "amount":order["order"]["price"],
            "cardholder":{
                "phone_number":order["order"]["contact"]["phone"],
                "name":order["order"]["contact"]["name"],
                "email":order["order"]["contact"]["email"],
                },
                "remember":True
            
            }
        test_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        headers = {
                "Content-Type": "application/json",
                "x-api-key": x_api_key
                }
        response = requests.post(test_url, json=tap_pay , headers=headers)

        if response.status_code == 200:
			# 交易成功
            cursor.execute("UPDATE orders SET status = '已付款' WHERE member_id = %s" , (user_id ,))
            conn.commit()
            cursor.execute("DELETE FROM reservation WHERE memberID = %s",(user_id,))
            conn.commit()
   
            return ({
					"data": {
							"number": order_number,
							"payment": {
								"status": 0,
								"message": "付款成功"
							}
						    }
					})
        elif response.status_code == 400 :
            return ({
					"error": True,
					"message": "付款未成功，訂單建立失敗。",
					"number": order_number
					}) , 400
        else:
            return	({
					"error": True,
					"message": "未登入系統，拒絕存取"
					}) , 403
       

    except Exception as e:
        print(str(e))
        return jsonify({"error":True,"message":"伺服器錯誤"}),500
    
    finally:
        conn.close()
        cursor.close()


@app.route("/api/order/<orderNumber>")
def orderNumber(orderNumber):
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        auth_header = request.headers.get('Authorization')
        print(auth_header)
        if auth_header:
            cursor.execute("SELECT * FROM orders WHERE order_number=%s",(orderNumber,))
            orders=cursor.fetchall()
            member_id=orders[0]["member_id"]
            cursor.execute("SELECT * FROM order_trip WHERE member_id=%s",(member_id,))
            order_trip=cursor.fetchone()
            attractionId=order_trip["attractionId"]
            cursor.execute("SELECT * FROM travel WHERE id=%s",(attractionId,))
            data=cursor.fetchall()
            data[0]["images"] = data[0]["images"].split(",")


            return jsonify({"data": {
								"number": orderNumber,
								"price": order_trip["price"],
								"trip": {
									"attraction": {
									"id": attractionId,
									"name": data[0]["name"],
									"address": data[0]["address"],
									"image": data[0]["images"][0]
								},
									"date": order_trip["date"],
									"time": order_trip["time"]
								},
								"contact": {
									"name": orders[0]["contact_name"],
									"email": orders[0]["contact_email"],
									"phone": orders[0]["contact_phone"]
								},
								"status": 1
							}
							})
        else:
            return	({
                        "error": True,
                        "message": "未登入系統"
                        }) , 403

    except:
        return jsonify({"error":True,"message":"伺服器錯誤"}),500
    
    finally:
        conn.close()
        cursor.close()
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)

