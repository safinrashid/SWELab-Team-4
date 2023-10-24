from flask import Flask, request, jsonify
from flask_cors import CORS
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad
from pymongo import MongoClient
import uuid

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB connection setup
client = MongoClient("mongodb+srv://admin:securepassword@cluster0.i1vtszj.mongodb.net/?retryWrites=true&w=majority")
db = client["UserInfo"]
users_collection = db["Users"]
projects_collection = db["Projects"]
# client = MongoClient("mongodb+srv://srashid:4j7MYn0GiqTjY3R1@project.mvmtzkd.mongodb.net/")
# db = client.Users
# users_collection = db.UserInfo

# AES encryption setup
# def encrypt(data, key):
#     cipher = AES.new(key, AES.MODE_CBC)
#     padded_data = pad(data, AES.block_size, style='pkcs7')
#     ciphertext = cipher.encrypt(padded_data)
#     return ciphertext

# def decrypt(data, key):
#     cipher = AES.new(key, AES.MODE_CBC)
#     plaintext = cipher.decrypt(data)
#     return plaintext.rstrip(b"\0")

# Generate a random AES encryption key
# encryption_key = get_random_bytes(16)

@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    userID = uuid.uuid4().hex

    # Encrypt the password before storing it
    # encrypted_password = encrypt(password.encode('utf-8'), encryption_key)

    # Check if the user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 400

    user_data = {
        "username": username,
        #encrypted_password.hex()
        "password": password,  # Store the hex representation of the encrypted password
        "userID": userID # used on client side for session management with cookies
    }

    # Insert the user data into MongoDB
    users_collection.insert_one(user_data)

    return jsonify({"message": "User registered successfully", "userID": userID}), 201

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({"username": username})

    if user:
        #stored_password = bytes.fromhex(user['password'])
        # decrypted_password = password
        #decrypted_password = decrypt(stored_password, encryption_key).decode('utf-8')
        
        if password == user['password']:
            return jsonify({"message": "Login successful", "userID": user["userID"]}), 200
        else:
            return jsonify({"message": "Invalid password"}), 401

    return jsonify({"message": "User not found"}), 404

@app.route('/projects', methods=['GET'])
def get_projects():
    headers = request.headers
    bearer = headers.get('Authorization')    # Bearer YourTokenHere
    token = bearer.split()[1]  # YourTokenHere

    if (token == None):
        return jsonify({"message": "No auth"}), 400

    # Find the project that the user is a part of
    projects = projects_collection.find({"users": {"$in": [token]}})

    project_list = []
    for project in projects:
        project_list.append({
            "id": project["id"],
            "name": project["name"],
            "desc": project["desc"],
        })

    print(project_list)

    if project_list:
        return jsonify({"message": "Projects found", "projects": project_list}), 200
    else:
        return jsonify({"message": "Projects not found"}), 400
    
@app.route('/projects', methods=['POST'])
def new_project():
    headers = request.headers
    bearer = headers.get('Authorization')    # Bearer YourTokenHere
    token = bearer.split()[1]  # YourTokenHere
    
    if (token == None):
        return jsonify({"message": "No auth"}), 400
    
    data = request.get_json()

    projectID = data.get("id")
    name = data.get("name")
    desc = data.get("desc")

    project_data = {
        "id": projectID,
        "name": name,
        "desc": desc,
        "users": [token],
        "hwSets": []
    }

    projects_collection.insert_one(project_data)

    return jsonify({"message": "Project created successfully", "project": {
        "id": projectID,
        "name": name,
        "desc": desc,
        "users": [token],
        "hwSets": []
    }}), 201

if __name__ == '__main__':
    app.run(host="localhost", port=5000)
