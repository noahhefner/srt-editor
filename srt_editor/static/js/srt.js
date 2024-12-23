class SrtTime {
  constructor(timeString) {
    this._timeString = timeString;
    this._timeMilliseconds = this._stringToMilliseconds(this._timeString);
  }

  get timeString() {
    return this._timeString;
  }

  set timeString(newTimeString) {
    this._timeString = newTimeString;
    this._timeMilliseconds = this._stringToMilliseconds(this._timeString);
  }

  get timeMilliseconds() {
    return this._timeMilliseconds;
  }

  set timeMilliseconds(newTimeMilliseconds) {
    this._timeMilliseconds = newTimeMilliseconds;
    this._timeString = this._millisecondsToString(this._timeMilliseconds);
  }

  _millisecondsToString(timeMilliseconds) {
    const hours = Math.floor(timeMilliseconds / (3600 * 1000));
    timeMilliseconds %= 3600 * 1000;
    const minutes = Math.floor(timeMilliseconds / (60 * 1000));
    timeMilliseconds %= 60 * 1000;
    const seconds = Math.floor(timeMilliseconds / 1000);
    timeMilliseconds %= 1000;
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")},${timeMilliseconds.toString().padStart(3, "0")}`;
    return formattedTime;
  }

  _stringToMilliseconds(timeString) {
    const [hours, minutes, secondsMilliseconds] = timeString.split(":");
    const [seconds, milliseconds] = secondsMilliseconds.split(",");
    const totalMilliseconds =
      parseInt(hours) * 3600 * 1000 +
      parseInt(minutes) * 60 * 1000 +
      parseInt(seconds) * 1000 +
      parseInt(milliseconds);
    return totalMilliseconds;
  }
}

class Snippet {
  constructor(data) {
    this.index = data["index"];
    this.startTime = new SrtTime(data["startTime"]);
    this.endTime = new SrtTime(data["endTime"]);
    this.subtitles = data["subtitles"];
  }
  getSRTFormat() {
    const index = this.index || "-1";
    const startTime = this.startTime.timeString || "0:00:00,000";
    const endTime = this.endTime.timeString || "0:00:00,000";
    const subtitles = this.subtitles.join("\n") || "";
    return `${index}\n${startTime} --> ${endTime}\n${subtitles}\n\n`;
  }
}

class SrtEditor {
  constructor(selector, data) {
    this.container = document.querySelector(selector);
    if (!this.container) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    this.path = data["path"];
    if (!this.path) {
      throw new Error("Data does not contain path.");
    }

    if (!data["snippets"]) {
      throw new Error("Data does not contain snippets.");
    }

    this.snippets = [];
    data["snippets"].forEach((snippet) => {
      this.snippets.push(new Snippet(snippet));
    });

    this.page = 0;
    this.snippetsPerPage = 10;
    this.pages = Math.ceil(this.snippets.length / this.snippetsPerPage);

    // Clear container
    this.container.innerHTML = "";
    // Setup static elements
    this.container.innerHTML = `
    <div class="level" style="margin-bottom: 1rem;">
      <div class="level-left">
        <div class="level-item">
          <input id="timeShift" type="number" class="input" placeholder="Time Shift (ms)"/>
        </div>
        <div class="level-item">
          <button class="button" id="addTime">Add Time</button>
        </div>
        <div class="level-item">
          <button class="button" id="subtractTime">Subtract Time</button>  
        </div>
      </div>
    </div>
    <hr>
    <div class="level" style="margin-bottom: 1rem;">
      <div class="level-left">
        <div class="level-item">
          <input id="newSnippetIndex" type="number" class="input" placeholder="Index"/>
        </div>
        <div class="level-item">
          <button class="button" id="newSnippetButton">Insert</button>
        </div>
      </div>
    </div>
    <hr>
    <div style="position: sticky; top: 0; padding-bottom: 1rem; z-index: 1; background-color: white;">
      <button id="previousPage" class="button">Previous Page</button>
      <button id="nextPage" class="button">Next Page</button>
      <label for="snippetNumber">Snippets per Page</label>
      <select id="snippetNumber" name="snippetNumber">
        <option value="5">5</option>
        <option value="10" selected>10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="200">200</option>
      </select>
    </div>
    <div id="snippet-wrapper">
    </div>
    `;

    // setup add/subtract time event listeners
    const addTimeButton = this.container.querySelector("#addTime");
    addTimeButton.addEventListener("click", () => {
      const timeShiftAmount = Number(
        this.container.querySelector("#timeShift").value
      );
      this._shiftTimesForward(timeShiftAmount);
    });
    const subtractTimeButton = this.container.querySelector("#subtractTime");
    subtractTimeButton.addEventListener("click", () => {
      const timeShiftAmount = Number(
        this.container.querySelector("#timeShift").value
      );
      this._shiftTimesBackward(timeShiftAmount);
    });

    // setup new snippet button
    const newSnippetButton = this.container.querySelector("#newSnippetButton");
    newSnippetButton.addEventListener("click", () => {
      const newSnippetIndex = Number(
        this.container.querySelector("#newSnippetIndex")
      );
      this._insertNewSnippet(newSnippetIndex);
    });

    // setup snippets per page dropdown event listener
    this.container
      .querySelector("#snippetNumber")
      .addEventListener("change", (event) => {
        this.snippetsPerPage = parseInt(event.target.value, 10);
        this.page = 0;
        this.pages = Math.ceil(this.snippets.length / this.snippetsPerPage);
        this.render();
      });

    // setup event listeners for next/previous page
    const nextPageButton = this.container.querySelector("#nextPage");
    nextPageButton.addEventListener("click", this._nextPage.bind(this));
    const previousPageButton = this.container.querySelector("#previousPage");
    previousPageButton.addEventListener("click", this._previousPage.bind(this));

    // initial render
    this.render();
  }

  render() {
    // clear out the snippets area
    this.container.querySelector("#snippet-wrapper").innerHTML = "";

    // Calculate the start and end indices for the current page
    const startIndex = this.page * this.snippetsPerPage;
    const endIndex = startIndex + this.snippetsPerPage;

    // Slice the snippets array to get only the snippets for the current page
    const snippetsToRender = this.snippets.slice(startIndex, endIndex);

    snippetsToRender.forEach((snippet, index) => {
      // NOTE:
      //
      // <div
      //   id="snippet-${snippet.index}" <- index from the srt file
      //   class="card"
      //   style="margin-bottom: 1rem;"
      //   data-index=${index}           <- index of snippet in this.snippets
      // >
      //
      this.container.querySelector("#snippet-wrapper").insertAdjacentHTML(
        "beforeend",
        `
      <div 
        id="snippet-${snippet.index}" 
        class="card" 
        style="margin-bottom: 1rem;"
        data-index=${index}
      >
        <header class="card-header has-background-grey-lighter is-flex is-justify-content-space-between is-align-items-center">
          <p class="card-header-title">
            ${snippet.index}
          </p>
          <div style="margin-right: 0.75rem;">
            <button id="delete" class="button">&#128465;</button>
          </div>
        </header>
        <div class="card-content fixed-grid">
          <div class="grid">
            <div class="cell">
              <div>
                <label for="startTime">Start Time</label>
                <input id="startTime" required="" type="text" class="input" value="${snippet.startTime.timeString}">
              </div>
              <div style="margin-top: 1rem;">                
                <label for="endTime">End Time</label>
                <input id="endTime" required="" type="text" class="input" value="${snippet.endTime.timeString}">
              </div>
            </div>
            <div class="cell">
              <label for="subtitleText">Subtitle Text</label>
              <textarea id="subtitleText" class="textarea has-fixed-size">${snippet.subtitles}</textarea>
            </div>
          </div>
        </div>
      </div>
      `
      );
      const s = this.container.querySelector(`#snippet-${snippet.index}`);
      // setup event listener for delete button
      s.querySelector("#delete").addEventListener("click", () =>
        this._deleteSnippet(Number(s.dataset.index))
      );
    });
  }

  _clearSnippets() {}

  _nextPage() {
    if (this.page < this.pages - 1) {
      this.page += 1;
      this.render();
    }
  }

  _previousPage() {
    if (this.page > 0) {
      this.page -= 1;
      this.render();
    }
  }

  _deleteSnippet(index) {
    if (confirm("Delete this snippet?") == true) {
      // delete the snippet
      this.snippets.splice(index, 1);
      // re-index the remaining snippets
      this.snippets.forEach((snippet, idx) => {
        snippet.index = idx + 1;
      });
      // re-render
      this.render();
    }
  }

  _insertNewSnippet(index) {
    // create and insert a new snippet at the given index
    const d = {
      "index": index,
      "startTime": "0:00:00,000",
      "endTime": "0:00:00,000",
      "subtitles": ["subtitle"]
    };
    const s = new Snippet(d);
    this.snippets.splice(index, 0, s);
    // re-index all snippets
    this.snippets.forEach((snippet, idx) => {
      snippet.index = idx + 1;
    });
    // re-render
    this.render();
  }

  _shiftTimesForward(milliseconds) {
    this.snippets.forEach((snippet) => {
      snippet.startTime.timeMilliseconds += milliseconds;
      snippet.endTime.timeMilliseconds += milliseconds;
    });
    this.render();
  }

  _shiftTimesBackward(milliseconds) {
    this.snippets.forEach((snippet) => {
      snippet.startTime.timeMilliseconds -= milliseconds;
      snippet.endTime.timeMilliseconds -= milliseconds;
    });
    this.render();
  }

  buildFile() {
    let file = "";
    this.snippets.forEach((snippet) => {
      file = file + snippet.getSRTFormat();
    });
    return file;
  }
}
