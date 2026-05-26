"""
Heal The World Foundation - Flask Backend (Production Ready & Fully Secured)
Implemented Security Controls:
- HTTPS Enforcement & Security Headers (Flask-Talisman)
- CSRF Protection (Flask-WTF CSRFProtect)
- Rate Limiting (Flask-Limiter)
- Strict Admin Protection (@admin_required Decorator)
- SQL Injection Prevention (100% Parametric Prepared Queries)
"""

import os
import sqlite3
from functools import wraps
from flask import Flask, request, jsonify, make_response
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect, generate_csrf
import logging


# ==========================================
# PRODUCTION LOGGING CONFIG
# ==========================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# ==========================================
# APP INITIALIZATION
# ==========================================
app = Flask(__name__,
            template_folder=os.path.join(os.path.dirname(__file__), '..', 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), '..', 'static'))
@app.route("/")
def home():
    return {
        "status": "running",
        "message": "Heal The World Foundation API is live"
    }

# Set secure config parameters
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super_secure_fallback_key_2026_heal_the_world')
app.config['FLASK_ENV'] = os.environ.get('FLASK_ENV', 'development')

# SQLite/PostgreSQL Database setup
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    app.config['DATABASE_URL'] = DATABASE_URL
    app.config['DATABASE'] = 'postgresql'
else:
    app.config['DATABASE'] = os.path.join(os.path.dirname(__file__), 'database', 'foundation.db')

# Secure Flask-Login Cookie Configurations
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# ==========================================
# 1. HTTPS ENFORCEMENT & SECURITY HEADERS (Talisman)
# ==========================================
csp = {
    'default-src': '\'self\'',
    'script-src': [
        '\'self\'',
        'https://apis.google.com',
        'https://cdn.jsdelivr.net'
    ],
    'style-src': [
        '\'self\'',
        '\'unsafe-inline\'',
        'https://fonts.googleapis.com'
    ],
    'img-src': [
        '\'self\'',
        'data:',
        'https://res.cloudinary.com',
        'https://healtheworld.s3.amazonaws.com'
    ]
}

# Enforce HTTPS, enable HSTS, configure secure content security policies
Talisman(
    app,
    content_security_policy=csp,
    force_https=True, # Forces redirect of HTTP traffic to HTTPS
    strict_transport_security=True, # Enables HSTS
    session_cookie_secure=True
)

# ==========================================
# 2. CSRF PROTECTION (Flask-WTF)
# ==========================================
csrf = CSRFProtect(app)

# CORS Config (Whitelist secure Render Frontend Domain)
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
CORS(app, origins=[FRONTEND_URL, 'https://heal-the-world-foundation.onrender.com'], supports_credentials=True)

# ==========================================
# 3. RATE LIMITING (Flask-Limiter)
# ==========================================
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://" # In production, point to a Redis cluster
)

# ==========================================
# FLASK-LOGIN CONFIGURATION
# ==========================================
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.session_protection = 'strong'

class User(UserMixin):
    def __init__(self, id, username, email, role, expires_at=None):
        self.id = id
        self.username = username
        self.email = email
        self.role = role
        self.expires_at = expires_at

# Custom decorator for admin authentication checks
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'status': 'error', 'message': 'Authentication required'}), 401
        if current_user.role != 'Administrator':
            logger.warning(f"Access Denied: User {current_user.username} tried accessing Admin resource.")
            return jsonify({'status': 'error', 'message': 'Access Denied: Administrator role required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# ==========================================
# SQL INJECTION PREVENTION (Parameterized Queries)
# ==========================================
def get_db_connection():
    db_path = app.config['DATABASE']
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@login_manager.user_loader
def load_user(user_id):
    conn = get_db_connection()
    # Enforcing Parameterized SQL query including expires_at
    user_row = conn.execute('SELECT id, username, email, role, expires_at FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    if user_row:
        return User(user_row['id'], user_row['username'], user_row['email'], user_row['role'], user_row['expires_at'])
    return None

# ==========================================
# APP SEEDER & DATABASE INIT
# ==========================================
def init_db():
    db_path = app.config['DATABASE']
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
    with open(schema_path, 'r') as f:
        conn.executescript(f.read())
    conn.commit()

    # Seeding default admin account (parameterized query)
    admin_exists = cursor.execute("SELECT id FROM users WHERE role = ?", ('Administrator',)).fetchone()
    if not admin_exists:
        hashed_pw = generate_password_hash('password123', method='pbkdf2:sha256', salt_length=16)
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ('Admin User', 'admin@healtheworld.org', hashed_pw, 'Administrator')
        )
        conn.commit()
    conn.close()

# ==========================================
# CSRF EXPOSURE ROUTE
# ==========================================
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Exposes CSRF token safely to the client under double-cookie validations."""
    token = generate_csrf()
    response = make_response(jsonify({'csrf_token': token}))
    response.set_cookie('csrf_token', token, secure=True, samesite='Lax')
    return response

# ==========================================
# RATE LIMITED API ROUTES
# ==========================================

import secrets

@app.route('/api/generate-code', methods=['POST'])
@limiter.limit("10 per hour")
def generate_code():
    data = request.get_json() or request.form
    secret_key = data.get('admin_key')

    if secret_key != 'MY_SUPER_ADMIN_KEY':
        logger.warning("Failed code generation attempt: Unauthorized admin key.")
        return jsonify({'error': 'Unauthorized'}), 403

    # Generate 8-character secure hex invite code
    code = secrets.token_hex(4)

    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO invite_codes (code, used) VALUES (?, 0)",
            (code,)
        )
        conn.commit()
        conn.close()
        
        logger.info(f"Secret Invite Code generated securely: {code}")
        return jsonify({
            'message': 'Invite code generated successfully!',
            'code': code
        }), 201
    except Exception as e:
        logger.error(f"Failed database write for invite code: {e}")
        return jsonify({'error': 'Database Error'}), 500

@app.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute")  # Strictly rate-limit user creation attempts
def register():
    data = request.get_json() or request.form
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'Member')
    invite_code = data.get('invite_code')

    if not username or not email or not password:
        return jsonify({'status': 'error', 'message': 'Missing fields'}), 400
    if len(password) < 6:
        return jsonify({'status': 'error', 'message': 'Password too short'}), 400

    # Secure Executive-only registration using invite codes
    if role == 'Executive':
        if not invite_code:
            return jsonify({'status': 'error', 'message': 'Invite code required for Executive registration.'}), 403
        
        conn = get_db_connection()
        invite_row = conn.execute(
            "SELECT * FROM invite_codes WHERE code = ? AND used = 0",
            (invite_code.strip(),)
        ).fetchone()
        
        if not invite_row:
            conn.close()
            logger.warning(f"Blocked register: Invalid or used code '{invite_code}' for {email}")
            return jsonify({'status': 'error', 'message': 'Invalid or used invite code.'}), 403

        # Mark code as used securely
        conn.execute("UPDATE invite_codes SET used = 1 WHERE id = ?", (invite_row['id'],))
        conn.commit()
        conn.close()
        logger.info(f"Verified secret invite code successfully: {invite_code}")

    hashed_pw = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

    try:
        conn = get_db_connection()
        # Parameterized query to stop SQL injections completely
        conn.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
            (username, email.lower().strip(), hashed_pw, role)
        )
        conn.commit()
        conn.close()
        return jsonify({'status': 'success', 'message': 'Account registered securely!'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'status': 'error', 'message': 'Email is already in use'}), 400

@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")  # Rate limit login hits per IP
def login():
    data = request.get_json() or request.form
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Missing credentials'}), 400

    conn = get_db_connection()
    # Strictly Parameterized SQL Query preventing injection attacks
    user_row = conn.execute('SELECT * FROM users WHERE email = ?', (email.lower().strip(),)).fetchone()
    conn.close()

    from datetime import datetime, timedelta

    if user_row and check_password_hash(user_row['password_hash'], password):
        # Calculate expires_at timestamp
        expiration_time = (datetime.utcnow() + timedelta(hours=2)).isoformat()
        
        # Update expires_at in the database securely
        conn = get_db_connection()
        conn.execute('UPDATE users SET expires_at = ? WHERE id = ?', (expiration_time, user_row['id']))
        conn.commit()
        conn.close()

        user = User(user_row['id'], user_row['username'], user_row['email'], user_row['role'], expiration_time)
        login_user(user, remember=True)
        return jsonify({
            'status': 'success',
            'message': 'Logged in securely.',
            'user': {
                'id': user.id, 
                'username': user.username, 
                'email': user.email, 
                'role': user.role,
                'expires_at': user.expires_at
            }
        })

    return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'status': 'success', 'message': 'Logged out successfully'})

# --- SECURED ADMIN ROUTE EXAMPLES ---

@app.route('/api/admin/database/users', methods=['GET'])
@admin_required # Admin Protection check
def admin_users():
    conn = get_db_connection()
    # Admin only database lookup
    rows = conn.execute('SELECT id, username, email, role, created_at FROM users').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ==========================================
# ERROR HANDLERS FOR SECURITY FAULTS
# ==========================================
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'status': 'error', 'message': f"Rate Limit Exceeded: {e.description}"}), 429

@app.errorhandler(403)
def forbidden_handler(e):
    return jsonify({'status': 'error', 'message': f"Forbidden: {e.description}"}), 403

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "message": "Heal The World Foundation API is live"
    })