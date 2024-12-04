from flask import Flask, render_template, request, jsonify
from srt import SRT
import os

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def home():

    srt_files = list()

    for root, dirs, files in os.walk('srts'):

        for file in files:

            if file.endswith(".srt"):
    
                srt_files.append(os.path.join(root, file))

    return render_template('home.html', srt_files = srt_files)

@app.route('/srt', methods=['GET'])
def get_srt():

    path = data.get('path')

    with open(path, 'r') as f:

        content = f.read()

        srt = SRT(path, content)

    return jsonify(srt.data())

@app.route('/srt/save', methods=['POST'])
def save():

    data = request.get_json()

    with open(data.get('path'), 'w') as f:

        f.write(data.get('text'))

    return "Success", 200

@app.route('/editor', methods=['GET'])
def get_editor_page():

    path = request.args.get('path')

    filename = os.path.basename(path)

    with open(path) as f:

        content = f.read()
        srt = SRT(path, content)

    return render_template('editor.html', srt = srt, path = path, filename = filename)

if __name__ == '__main__':
    app.run(debug=True)
