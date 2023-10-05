const AudioContext = require("web-audio-api").AudioContext;
context = new AudioContext();
const fs = require("fs");
const exec = require("child_process").exec;
const _ = require("underscore");
const colors = [
  "red",
  "orange",
  "yellow",
  "green",
  "purple",
  "white",
  "cyan",
  "green",
];
const colorMap = {};
colorMap["red"] = 41;
colorMap["orange"] = 41;
colorMap["yellow"] = 43;
colorMap["green"] = 42;
colorMap["purple"] = 45;
colorMap["white"] = 47;
colorMap["cyan"] = 46;

// "red": "41",
// "orange": "41",
// "yellow": "43",
// "green": "42",
// "purple": "45",
// "white": "47",
// "cyan": "46",

let pcmdata = [];

//Note: I have no rights to these sound files and they are not created by me.
//You may downlaod and use your own sound file to further test this.
//
let soundfile = "sounds/hellcat.wav";
console.clear();
decodeSoundFile(soundfile);

/**
 * [decodeSoundFile Use web-audio-api to convert audio file to a buffer of pcm data]
 * @return {[type]} [description]
 */
function decodeSoundFile(soundfile) {
  // console.log("decoding mp3 file ", soundfile, " ..... ");
  fs.readFile(soundfile, function (err, buf) {
    if (err) throw err;
    context.decodeAudioData(buf, function (audioBuffer) {
      // console.log(
      //   context,
      //   audioBuffer.numberOfChannels,
      //   audioBuffer.length,
      //   audioBuffer.sampleRate,
      //   audioBuffer.duration,
      // );
      pcmdata = audioBuffer.getChannelData(0);
      samplerate = audioBuffer.sampleRate;
      maxvals = [];
      max = 0;
      playsound(soundfile);
      findPeaks(pcmdata, samplerate);
    }, function (err) {
      throw err;
    });
  });
}

/**
 * [findPeaks Naive algo to identify peaks in the audio data, and wave]
 * @param  {[type]} pcmdata    [description]
 * @param  {[type]} samplerate [description]
 * @return {[type]}            [description]
 */
function findPeaks(pcmdata, samplerate) {
  let interval = 0.05 * 1000;
  index = 0;
  let step = Math.round(samplerate * (interval / 1000));
  const numBars = 8;
  const segSize = Math.floor(2400 / numBars);
  let max = 0;
  let prevmax = 0;
  let prevdiffthreshold = 0.3;

  //loop through song in time with sample rate
  const samplesound = setInterval(
    function () {
      if (index >= pcmdata.length) {
        clearInterval(samplesound);
        console.log("finished sampling sound");
        return;
      }

      // for (let i = index; i < index + step; i++) {
      const barHeights = [];
      for (let j = 0; j < numBars; j++) {
        const startIndex = j * segSize;
        const endIndex = (j + 1) * segSize;
        // console.log(pcmdata.reduce((a, b) => Math.max(a, b), -Infinity));
        const seg = pcmdata.slice(index, index + step).slice(
          startIndex,
          endIndex,
        );
        const segAmp = seg.reduce((a, b) => Math.max(a, b), -Infinity);
        barHeights.push(segAmp);
        // }
        index += step;
        // max = pcmdata[i] > max ? pcmdata[i].toFixed(1) : max;
      }
      // console.log(barHeights);
      drawBars(barHeights);
      // console.log();

      // Spot a significant increase? Potential peak
      // bars = getbars(max);
      // if (max - prevmax >= prevdiffthreshold) {
      //   bars = bars + " == peak == ";
      // }
      //
      // // Print out mini equalizer on commandline
      // // console.log(bars, max);
      // prevmax = max;
      // max = 0;
      // index += step;
    },
    interval,
    pcmdata,
  );
}

/**
 * TBD
 * @return {[type]} [description]
 */
function detectBeats() {
}

function drawBars(barArr) {
  const BARHEIGHT = 50;
  const BARWIDTH = 10;
  let CURRENTWIDTH = 0;
  for (let i = 0; i < barArr.length; i++) {
    for (let j = CURRENTWIDTH; j < CURRENTWIDTH + BARWIDTH; j++) {
      drawColumn(colorMap[colors[i]], barArr[i] * 20, j);
    }
    CURRENTWIDTH += BARWIDTH + 5;
  }
}
function drawColumn(color, barHeight, widthPos) {
  for (let i = 0; i < barHeight; i++) {
    // process.stdout.write(drawRainbowCharacter(color, widthPos, barHeight));
    // drawRainbowCharacter(color, widthPos, barHeight);
    process.stdout.write(drawRainbowCharacter(color, i, widthPos));
  }
}

function drawRainbowCharacter(color, row, col) {
  const position = `\x1b[${row};${col}H`;
  return position + "\x1b[" + color + "m" + " \x1b[0m";
}

/**
 * [getbars Visualize image sound using bars, from average pcmdata within a sample interval]
 * @param  {[Number]} val [the pcmdata point to be visualized ]
 * @return {[string]}     [a set of bars as string]
 */
function getbars(val) {
  bars = "";
  for (let i = 0; i < val * 50 + 2; i++) {
    bars = bars + "|";
  }
  return bars;
}

/**
 * [Plays a sound file]
 * @param  {[string]} soundfile [file to be played]
 * @return {[type]}           [void]
 */
function playsound(soundfile) {
  // linux or raspi
  // let create_audio = exec(
  //   "aplay" + soundfile,
  //   { maxBuffer: 1024 * 500 },
  // function (error, stdout, stderr) {
  let create_audio = exec("ffplay -nodisp -autoexit " + soundfile, {
    maxBuffer: 1024 * 500,
  }, function (error, stdout, stderr) {
    if (error !== null) {
      console.log("exec error: " + error);
    } else {
      //console.log(" finshed ");
      //micInstance.resume();
    }
  });
}
