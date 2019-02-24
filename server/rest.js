const express = require('express')
var exec = require('child_process').exec
var Transcoder = require('stream-transcoder');

var fs = require("fs");
var path = require("path");
var url = require("url");

const { ipcRenderer } = require('electron')

const router = express.Router()
let selectedPath = ''

function readRangeHeader(range, totalLength) {
  /*
   * Example of the method &apos;split&apos; with regular expression.
   * 
   * Input: bytes=100-200
   * Output: [null, 100, 200, null]
   * 
   * Input: bytes=-200
   * Output: [null, null, 200, null]
   */

  if (range == null || range.length == 0)
    return null;

  var array = range.split(/bytes=([0-9]*)-([0-9]*)/);
  var start = parseInt(array[1]);
  var end = parseInt(array[2]);
  var result = {
    Start: isNaN(start) ? 0 : start,
    End: isNaN(end) ? (totalLength - 1) : end
  };

  if (!isNaN(start) && isNaN(end)) {
    result.Start = start;
    result.End = totalLength - 1;
  }

  if (isNaN(start) && !isNaN(end)) {
    result.Start = totalLength - end;
    result.End = totalLength - 1;
  }

  return result;
}

ipcRenderer.on('selected-directory', (event, path) => {
  selectedPath = path
  console.log(selectedPath[0],'selected')
})
var mimeNames = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "application/javascript",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "application/ogg",
  ".ogv": "video/ogg",
  ".oga": "audio/ogg",
  ".txt": "text/plain",
  ".wav": "audio/x-wav",
  ".webm": "video/webm"
};

function getMimeNameFromExt(ext) {
  var result = mimeNames[ext.toLowerCase()];

  // 最好给一个默认值
  if (result == null)
    result = "application/octet-stream";

  return result;
}
router.get('/go', (req, res) => {
  res.send(selectedPath)
})
router.get('/shutdown', (req, res) => {
  exec(`shutdown -s -t 1`)
  // console.log(exec)
})
router.get('/test',
  (request, response) => {
    console.log(selectedPath, 99999, selectedPath[0])
    var stat = fs.statSync(selectedPath[0]);
    // console.log(stat, 'sssssssssss')
    let responseHeaders = {}
    var rangeRequest = readRangeHeader(request.headers['range'], stat.size);

    // If 'Range' header exists, we will parse it with Regular Expression.
    if (rangeRequest == null) {
      responseHeaders['Content-Type'] = getMimeNameFromExt(path.extname(selectedPath[0]));
      responseHeaders['Content-Length'] = stat.size; // File size.
      responseHeaders['Accept-Ranges'] = 'bytes';

      //  If not, will return file directly.
      sendResponse(response, 200, responseHeaders, fs.createReadStream(selectedPath[0]));
      return null;
    }

    var start = rangeRequest.Start;
    var end = rangeRequest.End;

    // If the range can't be fulfilled. 
    if (start >= stat.size || end >= stat.size) {
      // Indicate the acceptable range.
      responseHeaders['Content-Range'] = 'bytes */' + stat.size; // File size.

      // Return the 416 'Requested Range Not Satisfiable'.
      sendResponse(response, 416, responseHeaders, null);
      return null;
    }

    // Indicate the current range. 
    responseHeaders['Content-Range'] = 'bytes ' + start + '-' + end + '/' + stat.size;
    responseHeaders['Content-Length'] = start == end ? 0 : (end - start + 1);
    responseHeaders['Content-Type'] = getMimeNameFromExt(path.extname(selectedPath[0]));
    responseHeaders['Accept-Ranges'] = 'bytes';
    responseHeaders['Cache-Control'] = 'no-cache';

    // Return the 206 'Partial Content'.
    sendResponse(response, 206,
      responseHeaders, fs.createReadStream(selectedPath[0], {
        start: start,
        end: end
      }));
  }
)
// https://www.oschina.net/translate/http-partial-content-in-node-js?print
// 
function sendResponse(response, responseStatus, responseHeaders, readable) {
  response.writeHead(responseStatus, responseHeaders);

  if (readable == null)
    response.end();
  else
    readable.on("open", function () {
      readable.pipe(response);
    });

  return null;
}
app.get('/ss', function (req, res) {
  res.writeHead(200, { 'Content-Type': 'video/mp4' });
  var src = "D:\\test.avi";

  new Transcoder(src)
      .maxSize(320, 240)
      .videoCodec('h264')
      .videoBitrate(800 * 1000)
      .fps(25)
      .sampleRate(44100)
      .channels(2)
      .audioBitrate(128 * 1000)
      .format('mp4')
      .on('finish', function () {
          console.log("finished");
      })
      .stream().pipe(res);
});

module.exports = router