class SrtFile extends HTMLElement {
    
    constructor() {
      super();
      this._snippets = undefined;
    }

    connectedCallback() {
      setTimeout(() => {
        this._snippets = this.querySelectorAll("srt-snippet");
      }, 0);
    }

    buildFile() {
        let file = "";
        this._snippets.forEach((snippet) => {
            file = file + snippet.getSRTFormat();
        });
        return file
    }

    shiftTimesForward(milliseconds) {
      this._snippets.forEach((snippet) => {
        snippet.shiftTimesForward(milliseconds);
      });
    }
  
    shiftTimesBackward(milliseconds) {
      this._snippets.forEach((snippet) => {
        snippet.shiftTimesBackward(milliseconds);
      });
    }

  }
  
  customElements.define("srt-file", SrtFile);
  