// Dependencies
var express = require("express"),
    http = require('http'),
    path = require('path'),
    fs = require("fs"),
    app = express(),
    server = http.Server(app);

// server files are included here:
eval(fs.readFileSync('server_modules/fileUpload.js')+'');


// routes
app.use('/static', express.static(__dirname + '/static'));
app.use("/node_modules", express.static(__dirname + '/node_modules'));
app.use("/Productions", express.static(__dirname + '/Productions'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '/static/index.html'));
});


server.listen(port, function() {
  console.log('3DViewer server started at port:' + port);
});