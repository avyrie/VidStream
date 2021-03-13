// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
const express = require("express");
const fs = require("fs");
// file system, allows us to stream our video by making a file stream and returning it back to the client
const app = express();
const PORT = 8000;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", function (req, res) {
    // /video endpoint
    const range = req.headers.range;
    // what part of the video we want to send back
    if (!range) {
        res.status(400).send("Requires Range Header");
    };
    const videoPath = "mapVideo.mp4";
    const videoSize = fs.statSync("mapVideo.mp4").size;
    // find the size of the video, tells client how big video is
    const CHUNK_SIZE = 10 ** 6; // 1 MB
    const start = Number(range.replace(/\D/g, ""));
    // parse range, replaces all NON-DIGIT characters with empty string, convert to number
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    // calculate ending byte that we are sending back. CHUNK_SIZE + start could end up being bigger than what the video is so Math.min will take the smallest of the two (start + CHUNK_SIZE and videoSize - 1)
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        // video player can tell how far along the video is based of the video size
        "Accept-Ranges": "bytes",
        // says what tye of data is being sent back
        "Content-Length": contentLength,
        // how many bytes being sent back
        "Content-Type": "video/mp4"
    };
    // headers we are going to return

    res.writeHead(206, headers); // tells browser we're sending back partial content

    const videoStream = fs.createReadStream(videoPath, { start, end });

    videoStream.pipe(res);
});


app.listen(PORT, function () {
    console.log(`Listening on port: ${PORT}`)
});