import os
from flask import Flask, send_file

# Create the Flask application
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")

@app.route('/')
def index():
    """Main page route"""
    return send_file('index.html')

if __name__ == '__main__':
    # Run the application
    app.run(host='0.0.0.0', port=5000, debug=True)
