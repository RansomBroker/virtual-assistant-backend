exports.handler = async (event, context) => {
  try {
    const { text, language } = JSON.parse(event.body);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Test successful", text, language }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error processing request",
        details: error.message,
      }),
    };
  }
};
