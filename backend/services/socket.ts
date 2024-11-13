import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';
import { Message } from '../models/message.model';
import { messages } from '../data/messages';

const connectedUsers = new Map();

export function initializeSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  });

  // Authenticate Socket.io connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token is missing'));
    }
    jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
        socket.data.user = decoded;
        next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const username = socket.data.user.username;
    connectedUsers.set(socket.id, username);
    socket.join(username);

    console.log('[+] User connected:', username);
    socket.emit('initialMessages', messages);
    
    // Handle incoming messages
    socket.on('sendMessage', (message: Message) => {
        if (!message.text) {
            socket.emit('error', 'Message text is required');
            return;
        }
        // Update message status to 'sent' and timestamp on the server
        message.status = 'sent';
        message.timestamp = new Date().toISOString();
        messages.push(message);

        // Send acknowledgment back to the sender, that the msg hit the server
        socket.emit('messageStatus', { id: message.id, status: 'sent' });

        // Broadcast the message to other clients with status 'received'
        socket.broadcast.emit('message', { ...message, status: 'received' });
    });

    // Handle typing events
    socket.on('typing', () => socket.broadcast.emit('userTyping', { username }));
    socket.on('stopTyping', () => socket.broadcast.emit('userStopTyping', { username }));

    // If the receiver got the message, notify the sender and update the messages list
    socket.on('messageReceived', (message: Message) => {
      if (!message.id || !message.status || !message.user) {
        socket.emit('error', 'Invalid message');
        return;
      };

      messages.forEach((msg: Message) => {
        if (msg.id === message.id) msg.status = message.status;
      });
      socket.to(message.user).emit('messageStatus', { id: message.id, status: message.status });
    });

    socket.on('botMessage', (message: Message) => {
        messages.push(message);
        socket.broadcast.emit('message', { ...message, status: 'received' });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      console.log('[x] User disconnected:', username);
    });
  });

  return io;
}