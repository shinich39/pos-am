# pos-itunes

Add tags to audio files.

## Installation

- Install [nodejs](https://nodejs.org/en/download/package-manager/current)
- Install [ffmpeg](https://ffmpeg.org/download.html) and set environment variable.

```console
git clone https://github.com/shinich39/pos-itunes.git
cd pos-itunes
npm install
```

## Usage

1. Add Audio files or Directories to "/pos-itunes/input" directory.
	- /Title.mp3
	- /Artist - Title.mp3
	- /Artist/Title.mp3
	- /Artist/Album/Title.mp3
	- /Artist - Album/Title.mp3
	- /Artist/01. Title.mp3
	- /Artist/01. Title.mp3
	- /Artist/Album/01. Title.mp3
	- /Artist - Album/01. Title.mp3

2. Enter command to terminal.

- If audio file has title and artist, keep old tags.

	```console
	npm test
	```

- Always overwrite tags.

	```console
	npm start
	```

3. Check "/pos-itunes/output" directory.