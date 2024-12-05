from flask import Flask, render_template, request, jsonify
from srt import SRT
import os
from pathlib import Path

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def home():

    srt_files = list()

    for root, dirs, files in os.walk('srts'):

        for file in files:

            if file.endswith(".srt"):
    
                srt_files.append(os.path.join(root, file))

    return render_template('home.html', srt_files = srt_files)

@app.route('/srt/save', methods=['POST'])
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
        return "Bad Request. Request header is not application/json or application/*+json", 400
    request_json = request.get_json()
    if request_json is None:
        return "Bad Request. Request does not contain json.", 400

    # Get file path from json
    path = request_json.get('path')
    if path is None:
        return "Bad Request. Request json does not contain file path.", 400

    # Get file contents from json
    file_contents = request_json.get('text')
    if file_contents is None:
        return "Bad Request. Request json does not contain file contents.", 400

    # Ensure file exists
    file = Path(path)
    if not file.is_file():
        return f'Not found. File not found: {path}', 404

    # Write contents to file
    with open(path, 'w') as f:
        f.write(file_contents)

    return f'Success. Contents saved to: {path}', 200

@app.route('/editor', methods=['GET'])
def get_editor_page():

    path = request.args.get('path')
    if path is None:
        return "Bad Request. Request does not contain file path.", 400

    filename = os.path.basename(path)

    with open(path) as f:

        content = f.read()
        srt = SRT(path, content)

    return render_template('editor.html', srt = srt, path = path, filename = filename)

if __name__ == '__main__':
    app.run(debug=True)
