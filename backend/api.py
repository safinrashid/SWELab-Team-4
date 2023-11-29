from json import dumps
from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
from bson import ObjectId
from bson import json_util
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
from pymongo import MongoClient
import uuid
import json

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.debug = True

# MongoDB connection setup
client = MongoClient("mongodb+srv://admin:securepassword@cluster0.i1vtszj.mongodb.net/?retryWrites=true&w=majority")
db = client["UserInfo"]
users_collection = db["Users"]
projects_collection = db["Projects"]
hwsets_collection = db["HWSets"]
keys_collection = db["Keys"]
# client = MongoClient("mongodb+srv://srashid:4j7MYn0GiqTjY3R1@project.mvmtzkd.mongodb.net/")
# db = client.Users
# users_collection = db.UserInfo

# AES encryption setup
def encrypt(data, key):
    cipher = AES.new(key, AES.MODE_CBC)
    padded_data = pad(data, AES.block_size, style='pkcs7')
    ciphertext = cipher.iv + cipher.encrypt(padded_data)
    return ciphertext

def decrypt(data, key):
    iv = data[:16]
    ciphertext = data[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv=iv)
    plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size, style='pkcs7')
    return plaintext

# Generate a random AES encryption key
key_entry = keys_collection.find_one({"_id": "encryption_key"})
if key_entry:
    encryption_key = bytes.fromhex(key_entry["key"])
else:
    encryption_key = get_random_bytes(16)
    keys_collection.insert_one({"_id": "encryption_key", "key": encryption_key.hex()})

@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    userID = uuid.uuid4().hex

    # Encrypt the password before storing it
    encrypted_password = encrypt(password.encode('utf-8'), encryption_key)
    # Check if the user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 400

    user_data = {
        "username": username,
        "password": encrypted_password.hex(),  # Store the hex representation of the encrypted password
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
        stored_password = bytes.fromhex(user['password'])
        # decrypted_password = password
        decrypted_password = decrypt(stored_password, encryption_key).decode('utf-8')
       
        if password == decrypted_password:
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
    
    args = request.args
    absentProjects = args.get('absent')

    if absentProjects:
        # Find the project that the user is not a part of
        projects = projects_collection.find({"users": {"$nin": [token]}})
    else:
        # Find the project that the user is a part of
        projects = projects_collection.find({"users": {"$in": [token]}})

    project_list = []
    for project in projects:
        project_list.append({
            "id": project["id"],
            "name": project["name"],
            "desc": project["desc"],
        })

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

    if projects_collection.find_one({"id": projectID}):
        return jsonify({"message": "Project ID already taken"}), 400

    project_data = {
        "id": projectID,
        "name": name,
        "desc": desc,
        "users": [token],
        "hwSets": []
    }

    projects_collection.insert_one(project_data)
    
    # Create the two hardcoded HWSets
    HWSet1_data = {
        "projectID": projectID,
        "name": "HWSet1",
        "capacity": 100,
        "availability": 100,
        "users": [{"userID": token, "quantity": 0}]
    }
    HWSet2_data = {
        "projectID": projectID,
        "name": "HWSet2",
        "capacity": 100,
        "availability": 100,
        "users": [{"userID": token, "quantity": 0}]
    }

    HWSet1 = hwsets_collection.insert_one(HWSet1_data)
    HWSet2 = hwsets_collection.insert_one(HWSet2_data)
    
    HWSet1_id = HWSet1.inserted_id
    HWSet2_id = HWSet2.inserted_id

    projects_collection.update_one({"id": projectID}, {"$push": {"hwSets": HWSet1_id}})
    projects_collection.update_one({"id": projectID}, {"$push": {"hwSets": HWSet2_id}})

    return jsonify({"message": "Project created successfully", "project": {
        "id": projectID,
        "name": name,
        "desc": desc,
        "users": [token],
        "hwSets": []
    }}), 201

@app.route('/projects/join', methods=['POST'])
def join_projects():
    headers = request.headers
    bearer = headers.get('Authorization')    # Bearer YourTokenHere
    if bearer is None:
        return jsonify({"message": "Authorization header is missing"}), 400
    token = bearer.split()[1]  # YourTokenHere
    if token == None:
        return jsonify({"message": "No auth"}), 400
    project_id = request.json['id']
    project = projects_collection.find_one({"id": project_id})
    if project is None:
        return jsonify({"message": "Project not found"}), 404
    else:
        # Add the user to the project
        projects_collection.update_one({"id": project_id}, {"$push": {"users": token}})
        # Get the updated project
        project = projects_collection.find_one({"id": project_id})
        project_json = json.loads(json_util.dumps(project))  # Convert ObjectId to string
        return jsonify({"message": "Project found", "project": project_json}), 200

@app.route('/projects/<projectID>/hwsets', methods=['GET'])
def get_hwSets(projectID):
    headers = request.headers
    bearer = headers.get('Authorization')    # Bearer YourTokenHere
    token = bearer.split()[1]

    if (token == None):
        return jsonify({"message": "No auth"}), 401
    
    project = projects_collection.find_one({"id": projectID})

    if project == None:
        return jsonify({"message": "Project not found"}), 404

    if token not in project["users"]:
        return jsonify({"message": "Unauthorized"}), 401
    
    hwSets = []
    
    for hwSet in project["hwSets"]:

        hwSetData = hwsets_collection.find_one({"_id": hwSet})

        if (hwSetData == None):
            continue

        hwSets.append({
            "hwID": str(hwSetData["_id"]),
            "name": hwSetData["name"],
            "capacity": hwSetData["capacity"],
            "availability": hwSetData["availability"]
        })

    return jsonify({"message": "hwSets found", "hwSets": hwSets}), 200

@app.route('/projects/<projectID>/hwsets', methods=['POST'])
def new_hwSet(projectID):
    headers = request.headers
    bearer = headers.get('Authorization')    # Bearer YourTokenHere
    token = bearer.split()[1]

    if (token == None):
        return jsonify({"message": "No auth"}), 401
    
    project = projects_collection.find_one({"id": projectID})

    if project == None:
        return jsonify({"message": "Project not found"}), 404

    if token not in project["users"]:
        return jsonify({"message": "Unauthorized"}), 401
    
    data = request.get_json()

    name = data.get("name")
    capacity = data.get("capacity")
    availability = data.get("availability")

    hwSet_data = {
        "projectID": projectID,
        "name": name,
        "capacity": int(capacity),
        "availability": int(availability),
        "users": [{"userID": token, "quantity": 0}]
    }

    hwSet = hwsets_collection.insert_one(hwSet_data)
    hwSet_id = hwSet.inserted_id

    projects_collection.update_one({"id": projectID}, {"$push": {"hwSets": hwSet_id}})

    print(str(hwSet_id))

    return jsonify({"message": "HWSet created successfully", "hwSet": {
        "id": str(hwSet_id),
        "name": name,
        "capacity": capacity,
        "availability": availability,
    }}), 201

@app.route('/projects/<projectID>/hwsets/<hwSetID>/checkin', methods=['POST'])
def update_hwSet_checkIn(projectID, hwSetID):

    data = request.get_json()

    headers = request.headers
    bearer = headers.get('Authorization')    # Bearer YourTokenHere
    token = bearer.split()[1]
    try:
        quantity = int(data.get("quantity"))
    except:
        quantity = None
        return jsonify({"message": "Please specify a quantity"}), 400

    # handle if quantity is empty
    if not quantity:
        return jsonify({"message": "Please specify a quantity"}), 400
    # handle if quantity is negative
    if quantity < 0:
        return jsonify({"message": "Please specify a positive quantity"}), 400

    if (token == None):
        return jsonify({"message": "No auth"}), 401
    
    project = projects_collection.find_one({"id": projectID})

    if project == None:
        return jsonify({"message": "Project not found"}), 404

    if token not in project["users"]:
        return jsonify({"message": "Unauthorized"}), 401
    
    hwSet = hwsets_collection.find_one({"_id": ObjectId(hwSetID)})

    if hwSet == None:
        return jsonify({"message": "HWSet not found"}), 404
    

    # Check to make sure that the user does not checkin more than the capacity
    if hwSet["availability"] + quantity > hwSet["capacity"]:
        return jsonify({"message": "This user cannot checkin that amount"}), 400

    hwsets_collection.update_one({"_id": ObjectId(hwSetID)}, {"$inc": {"availability": +quantity}})

    return jsonify({"message": "Updated", "status": 200})

@app.route('/projects/<projectID>/hwsets/<hwSetID>/checkout', methods=['POST'])
def update_hwSet_checkOut(projectID, hwSetID):

    data = request.get_json()

    headers = request.headers
    bearer = headers.get('Authorization')    # Bearer YourTokenHere
    token = bearer.split()[1]
    try:
        quantity = int(data.get("quantity"))
    except:
        quantity = None
        return jsonify({"message": "Please specify a quantity"}), 400

    # handle if quantity is empty
    if not quantity:
        return jsonify({"message": "Please specify a quantity"}), 400
    # handle if quantity is negative
    if quantity < 0:
        return jsonify({"message": "Please specify a positive quantity"}), 400

    if (token == None):
        return jsonify({"message": "No auth"}), 401
    
    project = projects_collection.find_one({"id": projectID})

    if project == None:
        return jsonify({"message": "Project not found"}), 404

    if token not in project["users"]:
        return jsonify({"message": "Unauthorized"}), 401

    hwSet = hwsets_collection.find_one({"_id": ObjectId(hwSetID)})

    if hwSet == None:
        return jsonify({"message": "HWSet not found"}), 404
    
    # Check to make sure that the user does not checkout more than the availability
    if hwSet["availability"] - quantity < 0:
        return jsonify({"message": "This user cannot checkout that amount"}), 400
    
    hwsets_collection.update_one({"_id": ObjectId(hwSetID)}, {"$inc": {"availability": -quantity}})
    return jsonify({"message": "Updated", "status": 200})

if __name__ == '__main__':
    app.run(host="localhost", port=8000)
