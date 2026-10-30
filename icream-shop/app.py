import os
import sqlite3
import html
from fastapi import FastAPI, Request, Form, UploadFile, File, Response
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="iCream Shop - Artisan Ice Cream Boutique")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo Configuration: Mode can be toggled between "vulnerable" and "secure"
APP_MODE = os.getenv("ICREAM_MODE", "vulnerable") # "vulnerable" or "secure"

# Deliberate Hardcoded Secret in code for Secret Scanner detection
DEMO_STRIPE_API_KEY = "sk-live-icream998273618294719283749102"
JWT_SECRET_KEY = "super_secret_jwt_icream_key_123456"

DB_FILE = "icream.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            full_name TEXT,
            email TEXT,
            role TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            flavor TEXT,
            price REAL,
            image_url TEXT,
            description TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            rating INTEGER,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed data
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        products = [
            ("Velvet Vanilla Bean", "Madagascar Bourbon", 6.50, "🍦", "Rich creamy churned custard infused with aromatic whole vanilla pods."),
            ("Midnight Dark Chocolate", "72% Belgian Cocoa", 7.00, "🍫", "Intense bittersweet dark chocolate finished with organic sea salt flakes."),
            ("Wild Berry Swirl", "Summer Raspberry & Blueberry", 6.75, "🍓", "Tart sun-ripened berries folded into silky fresh farm cream."),
            ("Pistachio Crisp", "Sicilian Pistachio & Honey", 7.50, "🍨", "Slow-roasted bronte pistachios blended with organic wildflower honey.")
        ]
        cursor.executemany("INSERT INTO products (name, flavor, price, image_url, description) VALUES (?, ?, ?, ?, ?)", products)

        users = [
            ("admin", "admin123", "Chief Gelatiere", "admin@icream.shop", "admin"),
            ("alice", "password123", "Alice Smith", "alice@example.com", "customer"),
            ("bob", "secret456", "Bob Vance", "bob@example.com", "customer")
        ]
        cursor.executemany("INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)", users)

        reviews = [
            ("Alice Smith", 5, "The Bourbon Vanilla is phenomenal! The real vanilla seeds make all the difference."),
            ("Bob Vance", 5, "Best artisanal gelato in town. The dark chocolate hits the spot every single time.")
        ]
        cursor.executemany("INSERT INTO reviews (author, rating, comment) VALUES (?, ?, ?)", reviews)

    conn.commit()
    conn.close()

init_db()

@app.get("/api/mode")
def get_mode():
    return {"mode": APP_MODE}

@app.post("/api/mode/toggle")
def toggle_mode():
    global APP_MODE
    APP_MODE = "secure" if APP_MODE == "vulnerable" else "vulnerable"
    return {"mode": APP_MODE, "message": f"Switched iCream Shop mode to: {APP_MODE.upper()}"}

# Main E-Commerce Web Interface
@app.get("/", response_class=HTMLResponse)
def index_page():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, flavor, price, image_url, description FROM products")
    products = cursor.fetchall()

    cursor.execute("SELECT author, rating, comment, created_at FROM reviews ORDER BY id DESC LIMIT 5")
    reviews = cursor.fetchall()
    conn.close()

    product_cards = ""
    for p in products:
        product_cards += f"""
        <div class="card">
            <div class="product-icon">{p[4]}</div>
            <div class="product-info">
                <h3>{p[1]}</h3>
                <span class="flavor">{p[2]}</span>
                <p class="desc">{p[5]}</p>
                <div class="price-row">
                    <span class="price">${p[3]:.2f}</span>
                    <button class="order-btn" onclick="alert('Added {p[1]} to cart!')">Add to Cart</button>
                </div>
            </div>
        </div>
        """

    reviews_html = ""
    for r in reviews:
        # In vulnerable mode: Stored XSS! Comment rendered raw.
        # In secure mode: html.escape applied!
        comment_content = r[2] if APP_MODE == "vulnerable" else html.escape(r[2])
        reviews_html += f"""
        <div class="review-item">
            <div class="review-header">
                <strong>{html.escape(r[0])}</strong>
                <span class="stars">{'★' * r[1]}</span>
            </div>
            <div class="review-body">{comment_content}</div>
        </div>
        """

    mode_badge = f'<span class="badge {APP_MODE}">MODE: {APP_MODE.upper()}</span>'

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>iCream Shop - Handcrafted Artisanal Ice Cream</title>
        <meta charset="utf-8">
        <style>
            :root {{
                --bg: #fffbf5;
                --card-bg: #ffffff;
                --text: #2d1810;
                --accent: #d97706;
                --cream: #fef3c7;
                --border: #fde68a;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: var(--bg);
                color: var(--text);
                margin: 0;
                padding: 0;
            }}
            header {{
                background: linear-gradient(135deg, #78350f, #451a03);
                color: #fff;
                padding: 1.5rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            }}
            .logo-group {{
                display: flex;
                align-items: center;
                gap: 12px;
            }}
            .logo-icon {{ font-size: 2.2rem; }}
            h1 {{ margin: 0; font-size: 1.6rem; letter-spacing: -0.5px; }}
            nav a {{
                color: #fde68a;
                text-decoration: none;
                margin-left: 20px;
                font-weight: 500;
            }}
            nav a:hover {{ text-decoration: underline; }}
            .container {{
                max-width: 1100px;
                margin: 2rem auto;
                padding: 0 1rem;
            }}
            .mode-switch-bar {{
                background: #fef3c7;
                border: 1px solid #f59e0b;
                padding: 12px 20px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }}
            .badge.vulnerable {{ background: #dc2626; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; }}
            .badge.secure {{ background: #16a34a; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; }}
            .toggle-btn {{
                background: #b45309;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
            }}
            .search-box {{
                display: flex;
                margin-bottom: 2rem;
                gap: 10px;
            }}
            .search-box input {{
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #fed7aa;
                border-radius: 8px;
                font-size: 1rem;
            }}
            .search-box button {{
                background: #ea580c;
                color: white;
                border: none;
                padding: 0 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }}
            .grid {{
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 24px;
                margin-bottom: 3rem;
            }}
            .card {{
                background: white;
                border: 1px solid #fed7aa;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(180,83,9,0.08);
                display: flex;
                flex-direction: column;
            }}
            .product-icon {{
                font-size: 4rem;
                text-align: center;
                padding: 24px 0;
                background: #fff7ed;
            }}
            .product-info {{
                padding: 16px;
                display: flex;
                flex-direction: column;
                flex: 1;
            }}
            .product-info h3 {{ margin: 0 0 4px 0; font-size: 1.2rem; }}
            .flavor {{ color: #c2410c; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; }}
            .desc {{ font-size: 0.9rem; color: #57534e; flex: 1; margin: 0 0 16px 0; line-height: 1.4; }}
            .price-row {{ display: flex; justify-content: space-between; align-items: center; }}
            .price {{ font-size: 1.25rem; font-weight: 700; color: #78350f; }}
            .order-btn {{ background: #ea580c; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; }}
            .reviews-section {{ background: white; padding: 24px; border-radius: 12px; border: 1px solid #fed7aa; }}
            .review-item {{ border-bottom: 1px solid #f5f5f4; padding: 12px 0; }}
            .review-header {{ display: flex; justify-content: space-between; margin-bottom: 4px; }}
            .stars {{ color: #f59e0b; }}
            .add-review-form textarea {{ width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #fed7aa; border-radius: 6px; margin-top: 8px; }}
        </style>
    </head>
    <body>
        <header>
            <div class="logo-group">
                <span class="logo-icon">🍨</span>
                <div>
                    <h1>iCream Shop</h1>
                    <small style="color: #fef3c7;">Artisan Gelato & Ice Cream Laboratory</small>
                </div>
            </div>
            <nav>
                <a href="/">Menu</a>
                <a href="/login">Login</a>
                <a href="/profile?id=1">Profile</a>
                <a href="/admin">Admin</a>
            </nav>
        </header>

        <div class="container">
            <div class="mode-switch-bar">
                <div>
                    <strong>Demonstration Target Security Mode:</strong> {mode_badge}
                    <div style="font-size: 0.8rem; color: #78350f; margin-top: 4px;">
                        {'Vulnerable to SQLi in login, Reflected XSS in search, Stored XSS in reviews, IDOR in profile.' if APP_MODE == 'vulnerable' else 'Secure parameterization & escaping enabled. Immune to injection.'}
                    </div>
                </div>
                <form action="/api/mode/toggle" method="post">
                    <button class="toggle-btn" type="submit">Switch to {'SECURE' if APP_MODE == 'vulnerable' else 'VULNERABLE'} Mode</button>
                </form>
            </div>

            <form class="search-box" action="/search" method="get">
                <input type="text" name="q" placeholder="Search craft gelato flavors (e.g. Vanilla, Pistachio)..." />
                <button type="submit">Search</button>
            </form>

            <h2 style="margin-bottom: 1rem; color: #78350f;">Hand-Churned Signature Flavors</h2>
            <div class="grid">
                {product_cards}
            </div>

            <div class="reviews-section">
                <h2 style="margin-top: 0; color: #78350f;">Guest Reviews & Feedback</h2>
                <div class="review-list">
                    {reviews_html}
                </div>
                <div style="margin-top: 20px;">
                    <h3>Leave a Review</h3>
                    <form class="add-review-form" action="/api/reviews" method="post">
                        <input type="text" name="author" placeholder="Your Name" style="width: 250px; padding: 8px; border: 1px solid #fed7aa; border-radius: 4px;" required />
                        <textarea name="comment" rows="3" placeholder="Share your tasting notes..." required></textarea>
                        <button type="submit" class="order-btn" style="margin-top: 8px;">Post Review</button>
                    </form>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

# Search Endpoint: Reflected XSS
@app.get("/search", response_class=HTMLResponse)
def search_page(q: str = ""):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, flavor, price, description FROM products WHERE name LIKE ? OR flavor LIKE ?", (f"%{q}%", f"%{q}%"))
    results = cursor.fetchall()
    conn.close()

    # VULNERABLE: Direct reflection of parameter without escaping
    # SECURE: html.escape(q)
    displayed_query = q if APP_MODE == "vulnerable" else html.escape(q)

    results_html = ""
    for r in results:
        results_html += f"<li><strong>{r[1]}</strong> ({r[2]}) - ${r[3]:.2f}: {r[4]}</li>"

    return f"""
    <!DOCTYPE html>
    <html>
    <head><title>Search: {displayed_query}</title></head>
    <body style="font-family: sans-serif; padding: 2rem; background: #fffbf5;">
        <a href="/">&larr; Back to iCream Shop</a>
        <h2>Search Results for: {displayed_query}</h2>
        <ul>{results_html or '<li>No flavors matched your query.</li>'}</ul>
    </body>
    </html>
    """

# Login Endpoint: SQL Injection
@app.get("/login", response_class=HTMLResponse)
def login_page(error: str = ""):
    return f"""
    <!DOCTYPE html>
    <html>
    <head><title>iCream Shop - Login</title></head>
    <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fffbf5; margin: 0;">
        <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 320px; border: 1px solid #fed7aa;">
            <div style="text-align: center; font-size: 2.5rem;">🍨</div>
            <h2 style="text-align: center; margin: 0.5rem 0 1.5rem 0; color: #78350f;">Sign In to iCream</h2>
            {'<p style="color: red; font-size: 0.85rem;">' + error + '</p>' if error else ''}
            <form action="/api/login" method="post">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 4px;">Username</label>
                    <input type="text" name="username" style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #fed7aa; border-radius: 6px;" required />
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 4px;">Password</label>
                    <input type="password" name="password" style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #fed7aa; border-radius: 6px;" required />
                </div>
                <button type="submit" style="width: 100%; background: #ea580c; color: white; padding: 10px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Sign In</button>
            </form>
            <div style="margin-top: 1.5rem; font-size: 0.8rem; color: #78350f; background: #fef3c7; padding: 8px; border-radius: 4px;">
                <strong>Demo Accounts:</strong><br/>
                admin / admin123<br/>
                alice / password123
            </div>
            <div style="text-align: center; margin-top: 1rem;">
                <a href="/" style="color: #78350f; font-size: 0.85rem;">Return to Homepage</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.post("/api/login")
def api_login(username: str = Form(...), password: str = Form(...)):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    if APP_MODE == "vulnerable":
        # VULNERABLE: Direct raw SQL string formatting! Exploitable with ' OR '1'='1
        query = f"SELECT id, username, full_name, role FROM users WHERE username = '{username}' AND password = '{password}'"
        try:
            cursor.execute(query)
            user = cursor.fetchone()
        except sqlite3.OperationalError as e:
            # SQL error disclosure
            return JSONResponse(status_code=500, content={"error": f"sqlite3.OperationalError: {str(e)}", "query": query})
    else:
        # SECURE: Parameterized prepared statements!
        cursor.execute("SELECT id, username, full_name, role FROM users WHERE username = ? AND password = ?", (username, password))
        user = cursor.fetchone()

    conn.close()

    if user:
        return JSONResponse(content={
            "status": "success",
            "message": f"Welcome back, {user[2]}!",
            "user": {"id": user[0], "username": user[1], "role": user[3]}
        })
    else:
        return JSONResponse(status_code=401, content={"status": "error", "message": "Invalid credentials"})

# Profile Endpoint: IDOR
@app.get("/profile", response_class=HTMLResponse)
@app.get("/api/profile")
def get_profile(id: int = 1):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    if APP_MODE == "vulnerable":
        # VULNERABLE: Retrieves profile solely by client parameter `id` without verifying auth session
        cursor.execute("SELECT id, username, full_name, email, role FROM users WHERE id = ?", (id,))
        user = cursor.fetchone()
    else:
        # SECURE: Restricts to current session identity (simulated)
        cursor.execute("SELECT id, username, full_name, email, role FROM users WHERE id = 1", ())
        user = cursor.fetchone()

    conn.close()

    if not user:
        return JSONResponse(status_code=404, content={"error": "User profile not found"})

    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html>
    <head><title>Profile: {user[2]}</title></head>
    <body style="font-family: sans-serif; padding: 2rem; background: #fffbf5;">
        <a href="/">&larr; Return to Store</a>
        <h2>Customer Profile #{user[0]}</h2>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #fed7aa; max-width: 400px;">
            <p><strong>Username:</strong> {user[1]}</p>
            <p><strong>Full Name:</strong> {user[2]}</p>
            <p><strong>Email:</strong> {user[3]}</p>
            <p><strong>Account Role:</strong> <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">{user[4]}</span></p>
        </div>
        <p style="font-size: 0.85rem; color: #78350f;">Tip: Test IDOR by appending <code>?id=2</code> or <code>?id=3</code> to URL.</p>
    </body>
    </html>
    """)

# Reviews Endpoint: Stored XSS receiver
@app.post("/api/reviews")
def add_review(author: str = Form(...), comment: str = Form(...)):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO reviews (author, rating, comment) VALUES (?, 5, ?)", (author, comment))
    conn.commit()
    conn.close()
    return RedirectResponse(url="/", status_code=303)

# Admin Endpoint: Broken Access Control
@app.get("/admin", response_class=HTMLResponse)
def admin_page():
    if APP_MODE == "secure":
        return HTMLResponse("<h1>403 Forbidden: Administrator credentials required</h1>", status_code=403)

    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head><title>iCream Shop - Admin Console</title></head>
    <body style="font-family: sans-serif; padding: 2rem; background: #fffbf5;">
        <a href="/">&larr; Back to Store</a>
        <h1 style="color: #b91c1c;">⚠️ iCream Shop Internal Admin Console</h1>
        <p>Warning: Unrestricted administrative access (Broken Access Control).</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #fed7aa; max-width: 600px;">
            <h3>System Status</h3>
            <p><strong>Database:</strong> SQLite 3 (Operational)</p>
            <p><strong>Master Payment Gateway:</strong> Active</p>
            <p><strong>Simulated Sales Today:</strong> $1,429.50</p>
        </div>
    </body>
    </html>
    """)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)

