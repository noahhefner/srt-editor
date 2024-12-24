from flask import Flask, render_template, request, jsonify
from . import srt
import os
import sys
from pathlib import Path


def create_app(test_config=None):

    # SRT directory can be overriden with environment variable
    srt_directory = os.environ.get("SRT_DIR", "/data/srts")
    if not os.path.isdir(srt_directory):
        sys.exit(f"SRT path is not a directory: {srt_directory}")

    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route("/")
    def home():

        srt_files = list()

        for root, dirs, files in os.walk(srt_directory):

            for file in files:

                if file.endswith(".srt"):

                    srt_files.append(os.path.join(root, file))

        print(srt_files)

        return render_template("home.html", srt_files=srt_files)

    @app.route("/srt", methods=["POST"])
    def save():
        """
        Writes SRT contents to a file.

        Request format:

        {
            "path": "/path/to/file.srt",
            "text": "<srt file contents here>"
        }
        """

        # Check that request has json. By default a request is considered to include
        # JSON data if the mimetype is application/json or application/*+json.
        if not request.is_json:
            return (
                "Bad Request. Request header is not application/json or application/*+json",
                400,
            )
        request_json = request.get_json()
        if request_json is None:
            return "Bad Request. Request does not contain json.", 400

        # Get file path from json
        path = request_json.get("path")
        if path is None:
            return "Bad Request. Request json does not contain file path.", 400

        # Get file contents from json
        file_contents = request_json.get("text")
        if file_contents is None:
            return "Bad Request. Request json does not contain file contents.", 400

        # Ensure file exists
        file = Path(path)
        if not file.is_file():
            return f"Not found. File not found: {path}", 404

        # Write contents to file
        with open(path, "w") as f:
            f.write(file_contents)

        return f"Success. Contents saved to: {path}", 200

    @app.route("/srt", methods=["GET"])
    def get_srt():
        """
        Get an srt file in json format.
        """

        path = request.args.get("path")
        if path is None:
            return "Bad Request. Request does not contain file path.", 400

        filename = os.path.basename(path)

        with open(path) as f:

            content = f.read()
            srt_obj = srt.SRT(path, content)

            return jsonify(srt_obj.data())


    @app.route("/editor", methods=["GET"])
    def get_editor_page():

        path = request.args.get("path")
        if path is None:
            return "Bad Request. Request does not contain file path.", 400

        filename = os.path.basename(path)

        with open(path) as f:

            content = f.read()
            srt_obj = srt.SRT(path, content)

        return render_template("editor.html", srt=srt_obj, path=path, filename=filename)

    return app
