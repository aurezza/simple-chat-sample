var fs = require('fs');
var app = require('express')();
var https = require('https')
// var server = require('http').Server(app);
var server = https.createServer({
    key: fs.readFileSync('./key.pem', 'utf8'),
  cert: fs.readFileSync('./server.crt', 'utf8'),
    // key: fs.readFileSync('./csr.pem'),
    // cert: fs.readFileSync('./key.pem'),
    requestCert: false,
    rejectUnauthorized: false
}, app);

var io = require('socket.io')(server);
var serveStatic = require('serve-static');
var path = require('path')

app.use(function(req, res, next) {
    req.io = io;
    console.log('middleware firing...')
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});


server.listen(3000, function() {
    console.log('running server...at 8020 asdfasdff')
});

io.origins((origin, callback) => {
    console.log('origin', origin)
    if (origin !== 'https://localhost:3000/') {
        return callback('origin not allowed', false);
    }
    callback(null, true);
  });


app.use(serveStatic(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.on('join test room', (data) => {
        let rooms = Object.keys(socket.rooms);
        console.log("romms", rooms, rooms.includes('test room'));
        
        socket.join('test room', () => {
            console.log(data.id, " has joined test room");
            let joinText = {
                id: data.id,
                notice: 'has joined test room'
            }
           
            io.to("test room").emit("join room notice", joinText);
            
        });
    });

    socket.on('send message', (data) => {
        console.log('the data: ', data)
        io.emit("send public message", {
          id: data.id,
          message: data.message
        });
    });

    socket.on('send message test', (data) => {
        console.log('the data: ', data)
        let testRoomText = { id: data.id, message: data.message };
        io.to("test room").emit("send message test room", testRoomText);
    });
    
    socket.on("send private message", (data) => {
        console.log("private msg data", data, data.recipient);
        io.to(data.recipient).emit("private message", {
          message: data.message,
          sender: data.sender
        });
    });

    socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
            // the disconnection was initiated by the server, you need to reconnect manually
            socket.connect();
        }
        // else the socket will automatically try to reconnect
        console.log(socket.id, "disconnected")
    });
})