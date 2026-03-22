from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_mail import Mail, Message
from authlib.integrations.flask_client import OAuth
from models import db, User
from dotenv import load_dotenv
import util
import os
import secrets
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Mail config
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.googlemail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')

# Enable CORS (allow credentials for session)
CORS(app, supports_credentials=True)

db.init_app(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
mail = Mail(app)

# Load artifacts once when the server starts
util.load_saved_artifacts()

# Create database tables
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user, remember=data.get('remember', False))
        return jsonify({"message": "Login successful", "user": {"email": user.email, "username": user.username}}), 200
    else:
        return jsonify({"message": "Login failed. Check email and password"}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"}), 200

@app.route('/check_auth', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({"is_authenticated": True, "user": {"email": current_user.email, "username": current_user.username}}), 200
    return jsonify({"is_authenticated": False}), 200

@app.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if user:
        # In a real app, generate a token and send email
        # For simplicity, just return success if user exists
        return jsonify({"message": "Reset link sent to your email"}), 200
    return jsonify({"message": "Email not found"}), 404

@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    return response

@app.route('/predict_home_price', methods=['POST'])
@login_required
def predict_home_price():
    try:
        # Check if it's JSON or Form data
        if request.is_json:
            data = request.get_json()
            total_sqft = float(data['total_sqft'])
            location = data['location']
            bhk = int(data['bhk'])
            bath = int(data['bath'])
        else:
            total_sqft = float(request.form['total_sqft'])
            location = request.form['location']
            bhk = int(request.form['bhk'])
            bath = int(request.form['bath'])

        response = jsonify({
            'estimated_price': util.get_estimated_price(location, total_sqft, bhk, bath)
        })
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    print("Starting Python Flask Server For Home Price Prediction...")
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
