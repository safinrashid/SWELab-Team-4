import Flask, request, jsonify
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from pymongo import MongoClient

app = Flask(__name__)

# MongoDB connection setup
client = MongoClient("mongodb+srv://valinsky:lF4rTL8YTLpYXhXF@cluster0.xfvk0tz.mongodb.net/")
db = client["UserInfo"]
users_collection = db["Users"]

# AES encryption setup
def encrypt(data, key):
    cipher = AES.new(key, AES.MODE_CBC)
    ciphertext = cipher.encrypt(data)
    return ciphertext

def decrypt(data, key):
    cipher = AES.new(key, AES.MODE_CBC)
    plaintext = cipher.decrypt(data)
    return plaintext.rstrip(b"\0")

# Generate a random AES encryption key
encryption_key = get_random_bytes(16)

@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    print("backend")
    password = data.get('password')

    # Encrypt the password before storing it
    encrypted_password = encrypt(password.encode('utf-8'), encryption_key)

    # Check if the user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 400

    user_data = {
        "username": username,
        "password": encrypted_password.hex()  # Store the hex representation of the encrypted password
    }

    # Insert the user data into MongoDB
    users_collection.insert_one(user_data)

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({"username": username})

    if user:
        stored_password = bytes.fromhex(user['password'])
        decrypted_password = decrypt(stored_password, encryption_key).decode('utf-8')
        
        if password == decrypted_password:
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"message": "Invalid password"}), 401

    return jsonify({"message": "User not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)