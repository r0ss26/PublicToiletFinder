import os
import re
import decimal
from flask import Flask, jsonify, render_template, request
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

# Configure application
app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

if not os.getenv("API_KEY"):
    raise RuntimeError("API_KEY is not set")

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/")
def index():

    """Render map"""
    return render_template("index.html", key=os.getenv('API_KEY'))


@app.route("/search")
def search():

    """Search for places that match query"""
    q = request.args.get("q")
    matches = db.execute("SELECT * FROM suburbs WHERE UPPER(suburb) LIKE UPPER(:q)", {"q": q + '%'}).fetchall()
    print(matches)

    # adapted from src: https://github.com/cs50/python-cs50/blob/develop/src/cs50/sql.py
    rows = [dict(row) for row in matches]
    for row in rows:
        for column in row:
            if isinstance(row[column], decimal.Decimal):
                row[column] = float(row[column])

    return jsonify(rows)