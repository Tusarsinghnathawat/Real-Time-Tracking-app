const express = require('express');
const app = express();
const path = require('path');

require('dotenv').config();
const PORT = process.env.PORT || 3000;


//socketio setup
//socket.io runs on http server, so we need to create an HTTP server
const http = require('http')
const socketio = require("socket.io");

const server = http.createServer(app);
//call socket.io on the server
const io = socketio(server);

//ejs
app.set('view engine', 'ejs');
//static files setup
//this will serve files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

//hendeling connection request
io.on('connection',function(socket){
    let currentRoom = null;
    socket.on("join-room", (roomName) => {
        if(currentRoom){
            socket.leave(currentRoom); // Leave the previous room if any
        }
        currentRoom = roomName;
        socket.join(roomName);
    });

    //backend mai location accept kerna hai
    socket.on("send-location", (data) => {
        //wapis location emit kerna hai frontend mai sab ko
        if(data.room){
            io.to(data.room).emit("receive-location",{ id: socket.id, ...data}); //jo jo connected hai sab ko location jayege
        }
    });

    //on dissconnect - release the marker
    socket.on('disconnect', ()=> {
        if(currentRoom){
            io.to(currentRoom).emit("user-disconnected", socket.id); //emit to all users that this user has disconnected
        }
    })
    console.log("New connection established");
})

app.get('/', function(req, res){
    res.render("index");
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});