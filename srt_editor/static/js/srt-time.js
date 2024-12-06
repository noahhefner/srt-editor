class SrtTime {
    constructor (srtTimeString) {
        this._str = srtTimeString;
        this._totalMilliseconds = this._parseSrtTimeToMilliseconds(this._str);
    }

    _parseSrtTimeToMilliseconds (srtTimeString) {
        const [hours, minutes, secondsMilliseconds] = srtTimeString.split(':');
        const [seconds, milliseconds] = secondsMilliseconds.split(',');
        const totalMilliseconds = (parseInt(hours) * 3600 * 1000) +
                                  (parseInt(minutes) * 60 * 1000) +
                                  (parseInt(seconds) * 1000) +
                                  parseInt(milliseconds);    
        return totalMilliseconds;
    }

    addTime (milliseconds) {
        this._totalMilliseconds += milliseconds;
        this._formatToSRT();
    }

    subtractTime (milliseconds) {
        this._totalMilliseconds -= milliseconds;
        this._formatToSRT();
    }

    getTime () {
        return this._str;
    }

    setTime (newTime) {
        this._str = newTime;
        this._totalMilliseconds = this._parseSrtTimeToMilliseconds(this._str);
    }

    _formatToSRT() {

        var ms = this._totalMilliseconds;

        const hours = Math.floor(ms / (3600 * 1000));
        ms %= (3600 * 1000);
        
        const minutes = Math.floor(ms / (60 * 1000));
        ms %= (60 * 1000);
        
        const seconds = Math.floor(ms / 1000);
        ms %= 1000;
    
        const formattedTime = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
        
        this._str = formattedTime;
    }
}