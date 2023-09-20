from flask import jsonify, render_template, Flask, request
import json
import jwt
from dbpool import pool
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.json.ensure_ascii = False  # 解碼
app.config["TEMPLATES_AUTO_RELOAD"] = True
secret_key = "secret_key"


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


# auth

def verify_token():
    cookie_token = request.cookies.get('token')
    if not cookie_token:
        return None
    
    try:
        payload=jwt.decode(cookie_token,secret_key,algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route("/api/user/auth", methods=["PUT","GET","DELETE"])
def auth():
    try:
        conn = pool.get_connection()
        cursor = conn.cursor(dictionary=True)

        if request.method == "GET":
            cookie_token=request.cookies.get('token')
            if cookie_token:
                decoded = verify_token()
                if decoded:
                    return jsonify(decoded)
                
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

                # token = create_jwt_token(user_info)
                token=jwt.encode(user_info,secret_key,algorithm='HS256')
                print(token)
                response = jsonify({'token':token,'ok':True})
                response.set_cookie('token',token,max_age = 7 *24 * 60 * 60, httponly = True )
                return response
            else:
                return jsonify ({'error':True,'message':'帳號密碼輸入錯誤！'}),400

        
        elif request.method == "DELETE":
            response = jsonify({'ok':True})
            response.set_cookie("token","",max_age = -1)
            return response
    except:
        return jsonify({"error":True,"message":"伺服器錯誤"}),500
    
    finally:
        conn.close()
        cursor.close()
    



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
