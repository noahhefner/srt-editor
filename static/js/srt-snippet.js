class SrtSnippet extends HTMLElement {
    
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._index = -1;
    this._startTime = "";
    this._endTime = "";
    this._subtitles = "";
  }

  connectedCallback() {

    this._index = this.getAttribute("index") || "";
    this._startTime = this.getAttribute("start-time") || "";
    this._endTime = this.getAttribute("end-time") || "";
    this._subtitles = this.getAttribute("subtitles") || "";

    this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            border: 1px solid #ccc;
            padding: 1em;
            margin: 1em 0;
            font-family: Arial, sans-serif;
          }
          p {
            margin: 0.5em 0;
          }
          textarea {
            width: 100%;
            height: 4em;
            font-family: Arial, sans-serif;
          }
        </style>
        <p>
          <strong>Index:</strong>
          <input id="index" type="number" value=${this._index} />
        </p>
        <p>
          <strong>Start Time:</strong>
          <input id="startTime" type="text" value="${this._startTime}" />
        </p>
        <p>
          <strong>End Time:</strong>
          <input id="endTime" type="text" value="${this._endTime}" />
        </p>
        <textarea>${this._subtitles}</textarea>
      `;

    const textarea = this.shadowRoot.querySelector("textarea");
    textarea.addEventListener("input", this._onSubtitleEdit.bind(this));

    const startTime = this.shadowRoot.querySelector("#startTime");
    startTime.addEventListener("input", this._onStartTimeEdit.bind(this));

    const endTime = this.shadowRoot.querySelector("#endTime");
    endTime.addEventListener("input", this._onEndTimeEdit.bind(this));

    const index = this.shadowRoot.querySelector("#index");
    index.addEventListener("input", this._onIndexEdit.bind(this));

  }

  _onSubtitleEdit(event) {
    this._subtitles = event.target.value;
  }

  _onStartTimeEdit(event) {
    this._startTime = event.target.value;
  }

  _onEndTimeEdit(event) {
    this._endTime = event.target.value;
  }

  _onIndexEdit(event) {
    this._index = event.target.value;
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

  toSRT() {
    const index = this._index || '1';
    const startTime = this._startTime || '0:00:00,000';
    const endTime = this._endTime || '0:00:00,000';
    const subtitles = this._subtitles || '';
    return `${index}\n${startTime} --> ${endTime}\n${subtitles.trim()}\n\n`;
  }
}

customElements.define("srt-snippet", SrtSnippet);
