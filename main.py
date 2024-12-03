from flask import Flask, render_template, request
from srt import SRT


app = Flask(__name__, static_url_path='/static')

@app.route('/')
def home():

    return render_template('index.html')

@app.route('/srt', methods=['POST'])
def get_srt_data():

    with open(request.form['filename']) as f:

        content = f.read()
        srt = SRT(content)

    return srt.to_json()

if __name__ == '__main__':
    app.run(debug=True)
