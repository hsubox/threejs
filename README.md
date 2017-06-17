# Three JS

## Talking Heads

- __micInVoiceChangeDelay__: uses microphone input, deepens voice, and outputs audio
- __audioInNoOut__: If you mute, this can't capture the audio, and it will not appear to talk. A work-around is to capture the audio out of the computer. Follow instructions on [https://github.com/mattingalls/Soundflower/releases/tag/2.0b2](https://github.com/mattingalls/Soundflower/releases/tag/2.0b2) to install Soundflower. Use "multi-output" as output mode and select "Built-in Output" and "Soundflower (2ch)." Use "Soundflower (2ch)" as input. Use with built-in text to speech.

## Starting the server
In this directory, run `python3 -m http.server`. Go to `localhost:8000` in your browser. The port number may be different depending on your python configurations.

## Built with

- ThreeJS - wraps webGL
- Batman (.obj and .mtl)

## To do

Fix shadows on lips
