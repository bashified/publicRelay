"""
This is a local hosted API to test the working and configurations of the tunnel.
I coded this for personal use and decided to just push it in a commit
"""

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/hi", methods=["GET"])
def hi():
    print("---- New Request ----")
    print("Headers:", dict(request.headers))
    print("Args:", request.args)
    print("Remote Address:", request.headers.get("X-Forwarded-For"))
    print("---------------------")
    return jsonify({"message": "Hello from Flask!", "your_ip": request.headers.get("X-Forwarded-For")}), 200

app.run(host="localhost", port=4545)