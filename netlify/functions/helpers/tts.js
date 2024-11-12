require("dotenv").config();
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const blendShapeNames = require("./blendshapeNames");
const _ = require("lodash");

const key = "e77190fafa854380bc05aa3b6ebeb52a";
const region = "eastus2";

// Define SSML template with placeholder for dynamic language support
const createSSML = (text, lang) => {
  const voices = {
    "en-US": "en-US-JennyNeural",
    "ar-SA": "ar-SA-ZariyahNeural",
  };

  // Define available styles for each voice
  const voiceStyles = {
    "en-US-JennyNeural": ["general", "chat", "cheerful", "empathetic"],
    "ar-SA-ZariyahNeural": ["general", "chat", "cheerful", "empathetic"],
  };

  const selectedVoice = voices[lang];
  const availableStyles = voiceStyles[selectedVoice] || ["general"];
  const style = availableStyles.includes("chat") ? "chat" : "general";

  // Modify the text to add natural pauses and emphasis
  const modifiedText = text
    .replace(/, /g, ',<break time="300ms"/> ')
    .replace(/\.\s+/g, '.<break time="500ms"/> ')
    .replace(/! /g, '!<break time="500ms"/> ')
    .replace(/\?/g, '?<break time="500ms"/> ');

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
    xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${lang}">
    <voice name="${selectedVoice}">
      <mstts:express-as style="${style}">
        <prosody rate="0%" pitch="-2%">
          <mstts:viseme type="FacialExpression"/>
          ${modifiedText}
        </prosody>
      </mstts:express-as>
    </voice>
  </speak>`;
};

/**
 * Node.js server code to convert text to speech
 * @returns stream
 * @param {*} text text to convert to audio/speech
 * @param {*} lang language code for TTS (e.g., "en-US", "id-ID", "ar-SA")
 */
const textToSpeech = async (text, lang = "en-US") => {
  return new Promise((resolve, reject) => {
    let ssml = createSSML(text, lang);

    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

    let randomString = Math.random().toString(36).slice(2, 7);
    let filename = `./public/speech-${randomString}.mp3`;
    let audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);

    let blendData = [];
    let timeStep = 1 / 60;
    let timeStamp = 0;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Event for capturing viseme data
    synthesizer.visemeReceived = function (s, e) {
      const animation = JSON.parse(e.animation);

      _.each(animation.BlendShapes, (blendArray) => {
        let blend = {};
        _.each(blendShapeNames, (shapeName, i) => {
          blend[shapeName] = blendArray[i];
        });

        blendData.push({
          time: timeStamp,
          blendshapes: blend,
        });
        timeStamp += timeStep;
      });
    };

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();
        resolve({ blendData, filename: `/speech-${randomString}.mp3` });
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};

module.exports = textToSpeech;
