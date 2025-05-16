from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from flask_bcrypt import Bcrypt
import requests
from mysql.connector import Error
import pymysql


app = Flask(__name__)
CORS(app)
bcrypt=Bcrypt(app)
API_KEY=os.getenv("TMDB_API_KEY")
USER_DATA_FILE = os.path.join(os.path.dirname(__file__), "users.json")

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'Letterboxd',
    'port': 3306,
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db_connection():
    try:
        return pymysql.connect(**DB_CONFIG)
    except pymysql.Error as e:
        print(f"Database connection error: {e}")
        return None


def load_users():
    with open(USER_DATA_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USER_DATA_FILE, "w") as f:
        json.dump(users, f, indent=4)

@app.route('/api/register/page', methods=['POST'])
def register():
    data = request.json

    users = load_users()

    if any(user["username"] == data["username"] for user in users):
        return jsonify({"error": "Username already taken"}), 400
    
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
    password=hashed_password

    new_user = {
        "username": data["username"],
        "name": data["name"],
        "password": password
    }
    users.append(new_user)
    save_users(users)
    

    return jsonify({
        "message": "User registered successfully",
        "username": data["username"],
        "name": data["name"]
    }), 200

@app.route('/api/login/page', methods=['POST'])
def login():
    data = request.json
    users = load_users()
    for user in users:
        if user["username"] == data["username"] and bcrypt.check_password_hash(user["password"],data["password"]):
            return jsonify({
                "username": user["username"],
                "name": user["name"]
            }), 200
    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/users', methods=['GET'])
def get_users():
    users = load_users()
    safe_users = [{
        "username": user["username"],
        "name": user["name"]
    } 
    for user in users]
    return jsonify(safe_users)

@app.route('/api/profile/page', methods=['POST'])
def update():
    data = request.json
      
    if not all(key in data for key in ["username", "newname", "password", "newpassword"]):
        return jsonify({"error": "Missing required fields"}), 400

    users = load_users()
    
    current_user = None
    for user in users:
        if bcrypt.check_password_hash(user["password"],data["password"]):
            current_user = user
            break
    
    if not current_user:
        return jsonify({"error": "Current password is incorrect"}), 400
    
    if data["newusername"] != current_user["username"]:
        if any(user["username"] == data["newusername"] for user in users):
            return jsonify({"error": "Username already taken"}), 400
    
    users.remove(current_user)
    update_user = {
        "username": data["newusername"] or current_user["username"],
        "name": data["newname"] or current_user["name"],
        "password": data["newpassword"] or current_user["password"]
    }
    users.append(update_user)

    save_users(users)

    return jsonify({"message": "Profile updated successfully"}), 200

@app.route("/api/top-rated-movies", methods=["GET"])
def get_top_rated_movies():
    url = f"https://api.themoviedb.org/3/movie/top_rated?rg={API_KEY}&language=en-US&page=1"
    response = requests.get(url)
    response.raise_for_status()
    movies = response.json().get("results", [])
    formatted_movies = [
        {
            "id": movie["id"],
            "title": movie["title"],
            "poster_url": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
            if movie.get("poster_path") else None
        }
        for movie in movies
        ]
    return jsonify(formatted_movies)

@app.route("/search", methods=["GET"])
def search_movies():
    query = request.args.get('query', '')
    
    if not query:
        return jsonify({"error": "No search query provided"}), 400

    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        'api_key': API_KEY,
        'query': query,
        'language': 'en-US',
        'page': 1
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()

        movies = response.json().get("results", [])
        searched_movies = [
            {
                "id": movie["id"],
                "title": movie["title"],
                "poster_url": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
                if movie.get("poster_path") else None
            }
            for movie in movies
        ]
        return jsonify(searched_movies)
    except requests.RequestException as error:
        print(f"Error fetching search results: {error}")
        return jsonify({"error": "Failed to fetch data from TMDb"}), 500

@app.route("/api/watchlist/add", methods=["POST"])
def add_to_watchlist():
    data = request.json
    if not all(key in data for key in ["username", "movieId"]):
        return jsonify({"error": "Missing required fields"}), 400    
    username = data["username"]
    movie_id = data["movieId"]
    conn = get_db_connection() 
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM watchlists WHERE username = %s", 
            (username)
        )
        existing = cursor.fetchone()
        if existing:
            existing_movie_ids = json.loads(existing["movie_id"])
            if movie_id not in existing_movie_ids:
                existing_movie_ids.append(movie_id)
                updated_movie_ids_json = json.dumps(existing_movie_ids)
                cursor.execute(
                    "UPDATE watchlists SET movie_id = %s WHERE username = %s",
                    (updated_movie_ids_json, username)
                )
                conn.commit()
                return jsonify({"message": "Movie added to watchlist successfully"}), 200
            else:
                return jsonify({"message": "Movie already in watchlist"}), 200
        else:
            movie_id_json = json.dumps([movie_id])
            cursor.execute(
                "INSERT INTO watchlists (username, movie_id) VALUES (%s, %s)",
                (username, movie_id_json)
            )
            conn.commit()
            return jsonify({"message": "Movie added to watchlist successfully"}), 200
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/api/watchlist/remove", methods=["POST"])
def remove_from_watchlist():
    data = request.jsond
    if not all(key in data for key in ["username", "movieId"]):
        return jsonify({"error": "Missing required fields"}), 400
    username = data["username"]
    movie_id = data["movieId"]
    print(username,movie_id)
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
        "UPDATE watchlists SET movie_id = JSON_REMOVE(movie_id, JSON_UNQUOTE(JSON_SEARCH(movie_id, 'one', %s))) WHERE username = %s",
        (movie_id, username)
        )
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({"message": "Movie removed from watchlist successfully"}), 200
        else:
            return jsonify({"message": "Movie not found in watchlist"}), 404
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/api/watchlist/<username>", methods=["GET"])
def get_watchlist(username):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT movie_id FROM watchlists WHERE username = %s",
            (username,)
        )
        watchlist = cursor.fetchall()
        if watchlist:
            movie_ids = [row["movie_id"] for row in watchlist]
            return jsonify(movie_ids), 200
        else:
            return jsonify([]), 200
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/api/movie/<id>", methods=["GET"])
def movie_details(id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{id}?api_key={API_KEY}&language=en-US"
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error response: {response.text}")
            return jsonify({"error": "Movie not found", "status": response.status_code}), 404
        movies = response.json()
        movie_id = movies.get("id")
        movie_title = movies.get("title")
        movie_overview = movies.get("overview")
        poster_path = movies.get("poster_path")
        poster_url = f'https://image.tmdb.org/t/p/w500{poster_path}'
        return jsonify({
            "id": movie_id,
            "title": movie_title,
            "poster_url": poster_url,
            "overview": movie_overview
        })
    except Exception as e:
        print(f"Exception in movie_details: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/watchlist/check", methods=["POST"])
def check_in_watchlist():
    data = request.json
    if not all(key in data for key in ["username", "movieId"]):
        return jsonify({"error": "Missing required fields"}), 400   
    username = data["username"]
    movie_id = data["movieId"]
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM watchlists WHERE username = %s AND movie_id = %s", (username, movie_id))
        result = cursor.fetchone()
        return jsonify({"inWatchlist": result is not None}), 200   
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route("/api/reviews/add", methods=["POST"])
def add_to_review():
    data = request.json
    if not all(key in data for key in ["username", "movieId", "review"]):
        return jsonify({"error": "Missing required fields"}), 400
    username = data["username"]
    movie_id = data["movieId"]
    review = data["review"]
    conn = get_db_connection() 
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO reviews (movie_id, review) VALUES (%s, %s)",
            (movie_id, json.dumps({username: review}))
        )
        conn.commit()
        return jsonify({"message": "Review added successfully"}), 200
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/api/reviews/<id>", methods=["GET"])
def fetch_reviews(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT review FROM reviews WHERE movie_id = %s",
            (id,)
        )
        review_list = cursor.fetchall()
        if review_list:
            review_and_username = [row["review"] for row in review_list]
            return jsonify(review_and_username), 200
        else:
            print("Didn't find reviews")
            return jsonify([]), 200
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(debug=True)
