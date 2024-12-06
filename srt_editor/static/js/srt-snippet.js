class SrtSnippet extends HTMLElement {
  constructor() {
    super();
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

    this.innerHTML = `
      <div class="card" style="margin-bottom: 1rem;">
        <header class="card-header has-background-grey-lighter is-flex is-justify-content-space-between is-align-items-center">
          <p class="card-header-title">
            ${this._index}
          </p>
          <div style="margin-right: 0.75rem;">
            <button id="moveUp" class="button">▲</button>
            <button id="moveDown" class="button">▼</button>
          </div>
        </header>
        <div class="card-content fixed-grid">
          <div class="grid">
            <div class="cell">
              <div>
                <label for="startTime">Start Time</label>
                <input id="startTime" required="" type="text" class="input" value="${this._startTime.getTime()}">
              </div>
              <div style="margin-top: 1rem;">                
                <label for="endTime">End Time</label>
                <input id="endTime" required="" type="text" class="input" value="${this._endTime.getTime()}">
              </div>
            </div>
            <div class="cell">
              <label for="subtitleText">Subtitle Text</label>
              <textarea id="subtitleText" class="textarea has-fixed-size">${this._subtitles}</textarea>
            </div>
          </div>
        </div>
      </div>        
    `;

    const textarea = this.querySelector("textarea");
    textarea.addEventListener("input", this._onSubtitleEdit.bind(this));

    const startTime = this.querySelector("#startTime");
    startTime.addEventListener("input", this._onStartTimeEdit.bind(this));

    const endTime = this.querySelector("#endTime");
    endTime.addEventListener("input", this._onEndTimeEdit.bind(this));

    const moveUp = this.querySelector("#moveUp");
    moveUp.addEventListener("click", this._onMoveUpButtonPress.bind(this));

    const moveDown = this.querySelector("#moveDown");
    moveDown.addEventListener("click", this._onMoveDownButtonPress.bind(this));
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

  _onMoveUpButtonPress() {
    const prevSnippet = this.previousElementSibling;
    if (prevSnippet && prevSnippet.tagName.toLowerCase() === 'srt-snippet') {
      this.parentNode.insertBefore(this, prevSnippet);
    }
  }

  _onMoveDownButtonPress() {
    const nextSnippet = this.nextElementSibling;
    if (nextSnippet && nextSnippet.tagName.toLowerCase() === 'srt-snippet') {
      this.parentNode.insertBefore(nextSnippet, this);
    }
  }

  get subtitles() {
    return this._subtitles;
  }

  set subtitles(value) {
    this._subtitles = value;
    const textarea = this.querySelector("textarea");
    if (textarea) {
      textarea.value = value;
    }
  }

  shiftTimesForward(milliseconds) {
    this._startTime.addTime(milliseconds);
    this.querySelector("#startTime").value =
      this._startTime.getTime();
    this._endTime.addTime(milliseconds);
    this.querySelector("#endTime").value = this._endTime.getTime();
  }

  shiftTimesBackward(milliseconds) {
    this._startTime.subtractTime(milliseconds);
    this.querySelector("#startTime").value =
      this._startTime.getTime();
    this._endTime.subtractTime(milliseconds);
    this.querySelector("#endTime").value = this._endTime.getTime();
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
