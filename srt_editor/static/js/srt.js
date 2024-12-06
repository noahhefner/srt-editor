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
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${ms
      .toString()
      .padStart(3, "0")}`;
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
    const subtitles = this.subtitles || "";
    return `${index}\n${startTime} --> ${endTime}\n${subtitles.trim()}\n\n`;
  }
}

class Srt {
  constructor(data) {
    this.path = data["path"];
    this.snippets = [];
    data["snippets"].forEach((snippet) => {
      this.snippets.push(new Snippet(snippet));
    });
  }

  buildFile() {
    let file = "";
    this.snippets.forEach((snippet) => {
      file = file + snippet.getSRTFormat();
    });
    return file;
  }

  shiftTimesForward(milliseconds) {
    this.snippets.forEach((snippet) => {
      snippet.startTime.timeMilliseconds += milliseconds;
      snippet.endTime.timeMilliseconds += milliseconds;
    });
  }

  shiftTimesBackward(milliseconds) {
    this.snippets.forEach((snippet) => {
      snippet.startTime.timeMilliseconds -= milliseconds;
      snippet.endTime.timeMilliseconds -= milliseconds;
    });
  }
}
