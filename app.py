import sqlite3
import logging
import os
import sqlite3, uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__, static_folder="static", template_folder="templates")


def init_db():
    with sqlite3.connect("inscription.db") as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS inscription
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     nom TEXT,
                     prenom TEXT,
                     email TEXT UNIQUE,
                     hashed_pw TEXT,
                     metier TEXT,
                     localisation TEXT,
                     descriprion TEXT,
                     token TEXT,
                     verified INTEGER DEFAULT 0,
                     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
                     ''')
        conn.commit()
        
        def get_db():
            return sqlite3.connect("inscription.db")
        init_db
        
        
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() if request.is_json else request.form
    print(data)
    required_fields = ["nom", "prenom", "email", "telephone", "password"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "status" : "error",
                "message" : f"champ manquant: {field}"
               }), 400
    
    hashed_pw = generate_password_hash(data["password"])
    token = str(uuid.uuid4())
    
    conn = get_db()
    cur = conn.cursor()
                    
                    
                    
                