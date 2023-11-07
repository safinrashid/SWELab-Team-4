from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId
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
hwsets_collection = db["HWSets"]
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

    return jsonify({"message": "Project created successfully", "project": {
        "id": projectID,
        "name": name,
        "desc": desc,
        "users": [token],
        "hwSets": []
    }}), 201

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
    quantity = data.get("quantity")

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

    # user = [user for user in hwSet["users"] if user["userID"] == token]
    user = None
    for users in hwSet["users"]:
        if users["userID"] == token:
            user = users
            break

    if user == None:
        return jsonify({"message": "This user is not registered with this HWSet"}), 401
    
    if user["quantity"] < quantity:
        return jsonify({"message": "This user cannot checkin that amount"}), 400
    
    # hwsets_collection.update_one({"_id": ObjectId(hwSetID)}, {"$inc": {"availability": +quantity}})
    # hwsets_collection.update_one({"_id": ObjectId(hwSetID)}, {"$inc": {"users.$[elem].availability": -quantity}}, array_filters=[{"elem.userID": token}])
    hwsets_collection.find_one_and_update(
        {"_id": ObjectId(hwSetID), "users.userID": token},
        {"$inc": {"availability": +quantity, "users.$.quantity": -quantity}}
    )

    return jsonify({"message": "Updated", "status": 200})

@app.route('/projects/<projectID>/hwsets/<hwSetID>/checkout', methods=['POST'])
def update_hwSet_checkOut(projectID, hwSetID):

    data = request.get_json()

    headers = request.headers
    bearer = headers.get('Authorization')    # Bearer YourTokenHere
    token = bearer.split()[1]
    quantity = int(data.get("quantity"))

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
    
    user = [user for user in hwSet["users"] if user["userID"] == token]

    if user == None:
        return jsonify({"message": "This user is not registered with this HWSet"}), 401
    
    if hwSet["availability"] < quantity:
        return jsonify({"message": "Not enough availability"}), 400
    
    # hwsets_collection.update_one({"_id": ObjectId(hwSetID)}, {"$inc": {"availability": -quantity}})
    # hwsets_collection.update_one({"_id": ObjectId(hwSetID)}, {"$inc": {"users.$[elem].availability": +quantity}}, array_filters=[{"elem.userID": token}])
    hwsets_collection.find_one_and_update(
        {"_id": ObjectId(hwSetID), "users.userID": token},
        {"$inc": {"availability": -quantity, "users.$.quantity": +quantity}}
    )

    return jsonify({"message": "Updated", "status": 200})

if __name__ == '__main__':
    app.run(host="localhost", port=8000)
