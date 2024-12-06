import json


class SRT:
    """
    Holds all information for an SRT file.
    """

    def __init__(self, path: str, content: str):
        """
        Create an SRT object.
        """

        self.path = path

        self.snippets = list()

        # remove any leading or trailing whitespaces
        self.content = content.strip()

        # standardize line endings to LF
        self.content = self.content.replace("\r\n", "\n")

        # parse the snippets
        lines = self.content.split("\n")
        while len(lines) > 0:
            if "" in lines:
                blank_line_index = lines.index("")
                snippet_lines = lines[:blank_line_index]
                snippet = Snippet(snippet_lines)
                self.snippets.append(snippet)
                lines = lines[blank_line_index + 1 :]
            else:
                snippet = Snippet(lines)
                self.snippets.append(snippet)
                break

    def data(self):
        """
        Returns the SRT data in dictionary format.
        """

        return {
            "path": self.path,
            "snippets": [snippet.data() for snippet in self.snippets],
        }


class Timestamp:
    """
    Holds time data for a single time stamp.
    """

    def __init__(self, hours: int, minutes: int, seconds: int, milliseconds: int):

        self.hours = hours
        self.minutes = minutes
        self.seconds = seconds
        self.milliseconds = milliseconds

    def __str__(self) -> str:
        """
        String representation of the timestamp in SRT format.
        """

        return f"{self.hours:02}:{self.minutes:02}:{self.seconds:02},{self.milliseconds:03}"


class Snippet:
    """
    Holds subtitle number, time range, and subtitle text.
    """

    def __init__(self, lines: list):
        """
        Create a new Snippet object.
        """

        # raw strings
        self.lines = lines
        self.index = lines[0]
        self.time_range = lines[1]
        self.subtitles = lines[2:]

        # parse start and end times
        start_time_str, end_time_str = self.time_range.split(" --> ")
        self.start_time = parse_timestamp(start_time_str)
        self.end_time = parse_timestamp(end_time_str)

    def subtitles_joined(self):
        """
        Join all the subtitle lines together for this snippet.
        """

        return "\n".join(self.subtitles)

    def data(self):
        """
        Return snippet data in dictionary format.
        """

        return {
            "index": self.index,
            "start_time": self.start_time.__str__(),
            "end_time": self.end_time.__str__(),
            "subtitles": self.subtitles,
        }


def parse_timestamp(timestamp: str) -> Timestamp:
    """
    Parse a time string in SRT format into a Timestamp object.
    """

    hours, minutes, seconds = timestamp.split(":")
    seconds, milliseconds = seconds.split(",")

    hours = int(hours)
    minutes = int(minutes)
    seconds = int(seconds)
    milliseconds = int(milliseconds)

    return Timestamp(hours, minutes, seconds, milliseconds)
