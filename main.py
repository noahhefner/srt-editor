from flask import Flask, render_template, request
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

    return render_template('index.html', srt_files = srt_files)

@app.route('/editor', methods=['GET'])
def get_editor_page():

    filename = os.path.basename(request.args.get('path'))

    with open(request.args.get('path')) as f:

        content = f.read()
        srt = SRT(content)

    return render_template('editor.html', srt = srt, filename = filename)

if __name__ == '__main__':
    app.run(debug=True)
