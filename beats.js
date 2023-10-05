const AudioContext = require("web-audio-api").AudioContext;
let TICK = 0;
context = new AudioContext();
const fs = require("fs");
const exec = require("child_process").exec;
const _ = require("underscore");
clearCursor();
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

let pcmdata = [];

let soundfile = "sounds/orchestra.mp3";
console.clear();
decodeSoundFile(soundfile);

/**
 * [decodeSoundFile Use web-audio-api to convert audio file to a buffer of pcm data]
 * @return {[type]} [description]
 */
function decodeSoundFile(soundfile) {
  // console.log("decoding mp3 file ", soundfile, " ..... ");
  fs.readFile(soundfile, function(err, buf) {
    if (err) throw err;
    context.decodeAudioData(buf, function(audioBuffer) {
      pcmdata = audioBuffer.getChannelData(0);
      samplerate = audioBuffer.sampleRate;
      maxvals = [];
      max = 0;
      playsound(soundfile);
      findPeaks(pcmdata, samplerate);
    }, function(err) {
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
  const interval = 0.05 * 1000;
  index = 0;
  const step = Math.round(samplerate * (interval / 1000));
  const numBars = 8;
  // let max = 0;
  // let prevmax = 0;
  // let prevdiffthreshold = 0.3;

  //loop through song in time with sample rate
  const samplesound = setInterval(
    function() {
      if (index >= pcmdata.length) {
        clearInterval(samplesound);
        console.log("finished sampling sound");
        return;
      }

      const barHeights = [];
      for (let j = 0; j < numBars; j++) {
        const maxAm = [];
        for (let i = index; i < index + step; i++) {
          maxAm.push(pcmdata[index]);
          // console.log(pcmdata.reduce((a, b) => Math.max(a, b), -Infinity));
        }
        const segAmp = maxAm.reduce((a, b) => Math.max(a, b), -Infinity);
        barHeights.push(segAmp);
        index += step;
      }
      if (TICK === 10) {
        //needs to be refactored, this is a hack solution to the problem of clearing
        TICK = 0;
        clearBars();
      }
      drawBars(barHeights);
      TICK++;
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

/**
 * Draws audio visualizer bars.
 */
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

function clearBars() {
  //you need to write the background with the default parameter "49"
  const BARHEIGHT = 50;
  const BARWIDTH = 10;
  let CURRENTWIDTH = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = CURRENTWIDTH; j < CURRENTWIDTH + BARWIDTH; j++) {
      drawColumn("49", BARHEIGHT, j);
    }
    CURRENTWIDTH += BARWIDTH + 5;
  }
}

function clearCursor() {
  console.log("\x1b[?25l\x1b");
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
  // let create_audio = exec("ffplay -nodisp -autoexit " + soundfile, {
  //   maxBuffer: 1024 * 500,
  // }, function (error, stdout, stderr) {
  //   if (error !== null) {
  //     console.log("exec error: " + error);
  //   } else {
  //     //console.log(" finshed ");
  //     //micInstance.resume();
  //   }
  // });
}
