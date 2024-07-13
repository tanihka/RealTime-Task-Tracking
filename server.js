// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
// const taskRoutes = require('./routes/taskRoutes');
// const teamRoutes = require('./routes/teamRoutes');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// // Connect Database
// connectDB();

// // Middleware
// app.use(express.json({ extended: false }));

// // Define Routes and pass io instance
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });
// app.get('/', (req,res)=>{
//   res.send("tanishka chutiya hai")
//   }); // Update task status (accept/decline)
  
// app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/teams', teamRoutes);

// // Socket.io events
// io.on('connection', (socket) => {
//   console.log('Socket connected:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('Socket disconnected:', socket.id);
//   });

//   // Example event handling
//   socket.on('example', (data) => {
//     console.log('Received:', data);
//     socket.emit('response', 'Data received');
//   });
// });

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });
// process.on('SIGINT', function () {
//   console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
//   // some other closing procedures go here
//   process.exit(1);
// });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect Database
connectDB();

// Middleware
app.use(express.json());

// Define Routes and pass io instance
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Define Routes
app.get('/', (req, res) => {
  res.send("Hello World");
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);

// Socket.io events
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });

  // Example event handling
  socket.on('example', (data) => {
    console.log('Received:', data);
    socket.emit('response', 'Data received');
  });

  // Task-related events
  socket.on('newTask', async (task) => {
    console.log('New task added:', task);
    // Save the task to the database
    const savedTask = await saveTaskToDB(task); // Implement this function to save the task to the database
    io.emit('taskAdded', savedTask); // Broadcast to all clients
  });

  socket.on('getTasks', async () => {
    console.log('Get tasks request received');
    // Fetch tasks from the database
    const tasks = await fetchTasksFromDB(); // Implement this function to fetch tasks from the database
    socket.emit('tasks', tasks); // Send tasks back to the client
  });

  socket.on('updateTask', async (task) => {
    console.log('Task updated:', task);
    // Update the task in the database
    const updatedTask = await updateTaskInDB(task); // Implement this function to update the task in the database
    io.emit('taskUpdated', updatedTask); // Broadcast to all clients
  });

  socket.on('deleteTask', async (taskId) => {
    console.log('Task deleted:', taskId);
    // Delete the task from the database
    await deleteTaskFromDB(taskId); // Implement this function to delete the task from the database
    io.emit('taskDeleted', taskId); // Broadcast to all clients
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

process.on('SIGINT', function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  process.exit(1);
});