// netlify/functions/talk.js
const textToSpeech = require("../../helpers/tts");

exports.handler = async (event, context) => {
  const { text, language } = JSON.parse(event.body);

  try {
    const result = await textToSpeech(text, language);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process text-to-speech request.",
      }),
    };
  }
};
