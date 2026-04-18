const request = require("request");
const fs = require("fs");
const path = require("path");

// get today's date
const today = new Date().toISOString().split("T")[0];

// API URL
const url = `https://v3.football.api-sports.io/fixtures?date=${today}`;

// file name - save to test-widgets/games folder where the widget reads from
const fileName = path.join(__dirname, '../test-widgets/games/v3_fixtures_by_date.json');

const options = {
    method: "GET",
    url: url,
    headers: {
        "x-apisports-key": "a88a07b7f2212e54b2cea37bcb8bcac6"
    }
};

request(options, function (error, response, body) {

    if (error) {
        console.log("Error downloading fixtures:", error);
        return;
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(fileName);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // save response to json
    fs.writeFile(fileName, body, function(err) {
        if (err) {
            console.log("Error saving file:", err);
        } else {
            console.log("✓ Saved fresh fixtures to " + fileName);
        }
    });

});
