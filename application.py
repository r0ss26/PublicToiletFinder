import os
import re
from flask import Flask, jsonify, render_template, request

from cs50 import SQL

# Configure application
app = Flask(__name__)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///toilet_finder.db")


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
    if not os.environ.get("API_KEY"):
        raise RuntimeError("API_KEY not set")
    return render_template("index.html", key=os.environ.get("API_KEY"))


@app.route("/search")
def search():
    """Search for places that match query"""

    q = request.args.get("q") + "%"
    matches = db.execute("SELECT * FROM suburbs WHERE postcode LIKE :q OR suburb LIKE :q", q=q)

    return jsonify(matches)