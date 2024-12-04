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
            border: 1px solid #ccc;
            padding: 1rem;
            margin: 1rem 0;
            font-family: Arial, sans-serif;
          }
          p {
            margin: 0.5em 0;
          }
          textarea {
            width: 100%;
            height: 4rem;
            font-family: Arial, sans-serif;
          }
        </style>
        <p>
          <strong>Index:</strong>
          ${this._index}
        </p>
        <p>
          <strong>Start Time:</strong>
          <input id="startTime" type="text" value="${this._startTime.getTime()}" />
        </p>
        <p>
          <strong>End Time:</strong>
          <input id="endTime" type="text" value="${this._endTime.getTime()}" />
        </p>
        <textarea>${this._subtitles}</textarea>
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

  shiftTimesForward (milliseconds) {
    this._startTime.addTime(milliseconds);
    this.shadowRoot.querySelector("#startTime").value = this._startTime.getTime();
    this._endTime.addTime(milliseconds);
    this.shadowRoot.querySelector("#endTime").value = this._endTime.getTime();
  }

  shiftTimesBackward (milliseconds) {
    this._startTime.subtractTime(milliseconds);
    this.shadowRoot.querySelector("#startTime").value = this._startTime.getTime();
    this._endTime.subtractTime(milliseconds);
    this.shadowRoot.querySelector("#endTime").value = this._endTime.getTime();
  }

  getSRTFormat() {
    const index = this._index || '1';
    const startTime = this._startTime.getTime() || '0:00:00,000';
    const endTime = this._endTime.getTime() || '0:00:00,000';
    const subtitles = this._subtitles || '';
    return `${index}\n${startTime} --> ${endTime}\n${subtitles.trim()}\n\n`;
  }
}

customElements.define("srt-snippet", SrtSnippet);
