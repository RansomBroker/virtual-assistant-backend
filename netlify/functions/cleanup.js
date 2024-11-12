// netlify/functions/cleanup.js
const findRemoveSync = require("find-remove");
const path = require("path");

exports.handler = async () => {
  const result = findRemoveSync(path.join(__dirname, "../../public"), {
    age: { seconds: 3600 },
    extensions: ".mp3",
  });
  console.log("Deleted files:", result);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
