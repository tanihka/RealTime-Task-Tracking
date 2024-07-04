const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
// const taskRoutes = require('./routes/tasks');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


// MongoDB Connection
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
  


//middleware
app.use(express.json());
//routes
app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);

io.on('connection', socket => {
    console.log('New client connected');
    socket.on('taskUpdate', data => {
        console.log('Received task update:', data);
        // Broadcast task update to all connected clients
        socket.broadcast.emit('taskUpdated', data);
      });
    
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
} );



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));