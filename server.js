const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
// const { Server } = require('http');
const app = express();

const botName =  'ChatCord Bot';
const formatMessage = require('./utils/messages');
const  {userJoin, getCurrentUser ,userLeave,getRoomUsers }= require('./utils/users');
const server = http.createServer(app);
const io = socketio(server);
// set static folder 

app.use(express.static(path.join(__dirname, 'public')));

//run when client connects

io.on('connection',socket=>{
    // console.log('New WS Connection...')  
    socket.on('joinRoom',({username,room}) =>{
        const user  = userJoin(socket.id,username,room);

        socket.join(user.room);

        
        //welcome current user
        socket.emit('message',formatMessage(botName,'Welcome to Chatcord!'));

        //broadcast when user connects 
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,` ${user.username} has joined the Chat`));
        
        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getRoomUsers(user.room) 
        });
    }); 
     
    

    //Runs when client disconnects
    socket.on('disconnect',()=>{
            const user = userLeave(socket.id);

            if(user)
            {
                io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

            };
              //send users and room info
        io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getRoomUsers(user.room) 
        });
    })

    // listen for chat-Message
    socket.on('chatMessage',(msg)=>{
        
        const user  = getCurrentUser(socket.id);

        // console.log(msg);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
         
    })  

})
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }
const PORT = 3000 ||    process.env.PORT;

server.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));
