from flask import jsonify, render_template, Flask, request
import json
from dbpool import pool
import os
from dotenv import load_dotenv


load_dotenv()


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.json.ensure_ascii = False  # 解碼
app.config["TEMPLATES_AUTO_RELOAD"] = True


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
            query = "SELECT id, name, category, description, address, mrt, transport, latitude, longitude, images FROM travel WHERE name LIKE %s OR category = %s ORDER BY id LIMIT %s OFFSET %s"
            query_params = (f"%{keyword}%", keyword, 12, page * 12)

        cursor.execute(query, query_params)
        attractions = cursor.fetchall()

        data_len = 12
        next_page = page + 1 if len(attractions) == data_len else None

        for attraction in attractions:
            attraction["images"] = attraction["images"].split(" ")

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

        attraction_data["images"] = attraction_data["images"].strip().split(" ")
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
