from flask import Flask
from waitress import serve

app = Flask(__name__, static_folder="./resources/data/service/SurvivalManager", static_url_path="/data")

if __name__ == '__main__':
    print("Starting Waitress server...")
    serve(app, host="0.0.0.0", port=5000, threads=10)