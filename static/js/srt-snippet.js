class SrtSnippet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._index = -1;
    this._startTime = undefined;
    this._endTime = undefined;
    this._subtitles = "";
  }

  connectedCallback() {
    const startTimeSRTString = this.getAttribute("start-time");
    this._startTime = new SrtTime(startTimeSRTString);

    const endTimeSRTString = this.getAttribute("end-time");
    this._endTime = new SrtTime(endTimeSRTString);

    this._index = this.getAttribute("index") || "";
    this._subtitles = this.getAttribute("subtitles") || "";

    this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            border: 1px solid #e8e8e8;
            padding: 1rem;
            margin: 1rem 0;
            font-family: Arial, sans-serif;
            border-radius: var(--bulma-card-radius);
          }

          .d-flex {
            display: flex;
          }

          .group {
            position: relative;
            margin-top: 2rem;
            margin-bottom: 2rem;
          }

          .input {
            font-size: 16px;
            padding: 10px 10px 10px 5px;
            display: block;
            width: 200px;
            border: none;
            border-bottom: 1px solid #515151;
            background: transparent;
          }

          .input:focus {
            outline: none;
          }

          label {
            color: #999;
            font-size: 18px;
            font-weight: normal;
            position: absolute;
            pointer-events: none;
            left: 5px;
            top: 10px;
            transition: 0.2s ease all;
            -moz-transition: 0.2s ease all;
            -webkit-transition: 0.2s ease all;
          }

          .input:focus ~ label,
          .input:valid ~ label {
            top: -20px;
            font-size: 14px;
            color: #5264ae;
          }

          .bar {
            position: relative;
            display: block;
            width: 200px;
          }

          .bar:before,
          .bar:after {
            content: "";
            height: 2px;
            width: 0;
            bottom: 1px;
            position: absolute;
            background: #5264ae;
            transition: 0.2s ease all;
            -moz-transition: 0.2s ease all;
            -webkit-transition: 0.2s ease all;
          }

          .bar:before {
            left: 50%;
          }

          .bar:after {
            right: 50%;
          }

          .input:focus ~ .bar:before,
          .input:focus ~ .bar:after {
            width: 50%;
          }

          .highlight {
            position: absolute;
            height: 60%;
            width: 100px;
            top: 25%;
            left: 0;
            pointer-events: none;
            opacity: 0.5;
          }

          .input:focus ~ .highlight {
            animation: inputHighlighter 0.3s ease;
          }

          @keyframes inputHighlighter {
            from {
              background: #5264ae;
            }

            to {
              width: 0;
              background: transparent;
            }
          }
        </style>

        <div class="d-flex">
          <div>
            <p>
              <strong>Index:</strong>
              ${this._index}
            </p>
            <div class="group">
              <input id="startTime" required="" type="text" class="input" value="${this._startTime.getTime()}">
              <span class="highlight"></span>
              <span class="bar"></span>
              <label>Start Time</label>
            </div>
            <div class="group">
              <input id="endTime" required="" type="text" class="input" value="${this._endTime.getTime()}">
              <span class="highlight"></span>
              <span class="bar"></span>
              <label>End Time</label>
            </div>
          </div>
          <div>
            <textarea cols="64" rows="8">${this._subtitles}</textarea>
          </div>
        </div>        
      `;

    const textarea = this.shadowRoot.querySelector("textarea");
    textarea.addEventListener("input", this._onSubtitleEdit.bind(this));

    const startTime = this.shadowRoot.querySelector("#startTime");
    startTime.addEventListener("input", this._onStartTimeEdit.bind(this));

    const endTime = this.shadowRoot.querySelector("#endTime");
    endTime.addEventListener("input", this._onEndTimeEdit.bind(this));
  }

  _onSubtitleEdit(event) {
    this._subtitles = event.target.value;
  }

  _onStartTimeEdit(event) {
    this._startTime.setTime(event.target.value);
  }

  _onEndTimeEdit(event) {
    this._endTime.setTime(event.target.value);
  }

  get subtitles() {
    return this._subtitles;
  }

  set subtitles(value) {
    this._subtitles = value;
    const textarea = this.shadowRoot.querySelector("textarea");
    if (textarea) {
      textarea.value = value;
    }
  }

  shiftTimesForward(milliseconds) {
    this._startTime.addTime(milliseconds);
    this.shadowRoot.querySelector("#startTime").value =
      this._startTime.getTime();
    this._endTime.addTime(milliseconds);
    this.shadowRoot.querySelector("#endTime").value = this._endTime.getTime();
  }

  shiftTimesBackward(milliseconds) {
    this._startTime.subtractTime(milliseconds);
    this.shadowRoot.querySelector("#startTime").value =
      this._startTime.getTime();
    this._endTime.subtractTime(milliseconds);
    this.shadowRoot.querySelector("#endTime").value = this._endTime.getTime();
  }

  getSRTFormat() {
    const index = this._index || "1";
    const startTime = this._startTime.getTime() || "0:00:00,000";
    const endTime = this._endTime.getTime() || "0:00:00,000";
    const subtitles = this._subtitles || "";
    return `${index}\n${startTime} --> ${endTime}\n${subtitles.trim()}\n\n`;
  }
}

customElements.define("srt-snippet", SrtSnippet);
