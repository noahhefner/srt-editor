import json

class SRT:
    """
    Holds all information for an SRT file.
    """

    def __init__ (self, content: str):

        self.snippets = list()

        # remove any leading or trailing whitespaces
        self.content = content.strip()

        # standardize line endings to LF
        self.content = self.content.replace('\r\n', '\n')

        # parse the snippets
        lines = self.content.split('\n')
        while len(lines) > 0:
            if '' in lines:
                blank_line_index = lines.index('')
                snippet_lines = lines[:blank_line_index]
                snippet = Snippet(snippet_lines)
                self.snippets.append(snippet)
                lines = lines[blank_line_index+1:]
            else:
                snippet = Snippet(lines)
                self.snippets.append(snippet)
                break

class Timestamp:
    """
    Holds time data for a single time stamp.
    """

    def __init__ (self, hours: int, minutes: int, seconds: int, milliseconds: int):

        self.hours = hours
        self.minutes = minutes
        self.seconds = seconds
        self.milliseconds = milliseconds

    def __str__ (self) -> str:

        return f"{self.hours}:{self.minutes}:{self.seconds},{self.milliseconds}"

class Snippet:
    """
    Holds subtitle number, time range, and subtitle text.
    """

    def __init__ (self, lines: list):

        # raw strings
        self.lines = lines
        self.line_number = lines[0]
        self.line_time_range = lines[1]
        self.lines_subtitles = lines[2:]

        # parse start and end times
        start_time_str, end_time_str = self.line_time_range.split(" --> ")
        self.start_time = self.parse_timestamp(start_time_str)
   
        self.end_time = self.parse_timestamp(end_time_str)

    def parse_timestamp (self, timestamp: str) -> Timestamp:

        hours, minutes, seconds = timestamp.split(":")
        seconds, milliseconds = seconds.split(",")

        hours = int(hours)
        minutes = int(minutes)
        seconds = int(seconds)
        milliseconds = int(milliseconds)

        return Timestamp(hours, minutes, seconds, milliseconds)

    def __str__ (self):

        return ''.join(self.lines)

