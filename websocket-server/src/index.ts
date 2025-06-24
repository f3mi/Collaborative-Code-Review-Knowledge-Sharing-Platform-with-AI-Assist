import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils';
import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Redis client for pub/sub
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

// Store active sessions and their participants
const activeSessions = new Map<string, Set<string>>();
const userSessions = new Map<string, string>();

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'websocket' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a review session
  socket.on('join-session', (data: { sessionId: string; userId: string; username: string }) => {
    const { sessionId, userId, username } = data;
    
    // Leave previous session if any
    if (userSessions.has(socket.id)) {
      const previousSession = userSessions.get(socket.id);
      if (previousSession) {
        socket.leave(previousSession);
        const sessionParticipants = activeSessions.get(previousSession);
        if (sessionParticipants) {
          sessionParticipants.delete(socket.id);
          if (sessionParticipants.size === 0) {
            activeSessions.delete(previousSession);
          }
        }
      }
    }

    // Join new session
    socket.join(sessionId);
    userSessions.set(socket.id, sessionId);
    
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, new Set());
    }
    activeSessions.get(sessionId)!.add(socket.id);

    // Notify other participants
    socket.to(sessionId).emit('user-joined', {
      userId,
      username,
      socketId: socket.id
    });

    // Send current participants to the new user
    const participants = Array.from(activeSessions.get(sessionId) || []);
    socket.emit('session-participants', participants);

    console.log(`User ${username} joined session ${sessionId}`);
  });

  // Handle code changes
  socket.on('code-change', (data: { sessionId: string; code: string; userId: string }) => {
    socket.to(data.sessionId).emit('code-updated', {
      code: data.code,
      userId: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle cursor position updates
  socket.on('cursor-move', (data: { sessionId: string; position: any; userId: string }) => {
    socket.to(data.sessionId).emit('cursor-updated', {
      position: data.position,
      userId: data.userId,
      socketId: socket.id
    });
  });

  // Handle comments
  socket.on('add-comment', (data: { sessionId: string; comment: any; userId: string }) => {
    io.to(data.sessionId).emit('comment-added', {
      comment: data.comment,
      userId: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle AI suggestions
  socket.on('ai-suggestion', (data: { sessionId: string; suggestion: string; userId: string }) => {
    io.to(data.sessionId).emit('ai-suggestion-received', {
      suggestion: data.suggestion,
      userId: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle typing indicators
  socket.on('typing-start', (data: { sessionId: string; userId: string }) => {
    socket.to(data.sessionId).emit('user-typing', {
      userId: data.userId,
      typing: true
    });
  });

  socket.on('typing-stop', (data: { sessionId: string; userId: string }) => {
    socket.to(data.sessionId).emit('user-typing', {
      userId: data.userId,
      typing: false
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const sessionId = userSessions.get(socket.id);
    if (sessionId) {
      const sessionParticipants = activeSessions.get(sessionId);
      if (sessionParticipants) {
        sessionParticipants.delete(socket.id);
        if (sessionParticipants.size === 0) {
          activeSessions.delete(sessionId);
        }
      }
      
      socket.to(sessionId).emit('user-left', {
        socketId: socket.id
      });
      
      userSessions.delete(socket.id);
    }
    
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Yjs WebSocket integration
const yjsWebSocketHandler = (ws: any, req: any) => {
  setupWSConnection(ws, req);
};

// Add Yjs WebSocket handler
app.use('/yjs', (req, res, next) => {
  if (req.headers.upgrade === 'websocket') {
    // Handle Yjs WebSocket connections
    const { WebSocketServer } = require('ws');
    const wss = new WebSocketServer({ noServer: true });
    
    wss.on('connection', yjsWebSocketHandler);
    
    req.socket.server.ws = wss;
    next();
  } else {
    next();
  }
});

// Redis pub/sub for cross-server communication
const subscriber = redisClient.duplicate();
subscriber.connect().catch(console.error);

subscriber.subscribe('code-review-events', (message) => {
  try {
    const event = JSON.parse(message);
    const { sessionId, type, data } = event;
    
    // Broadcast to all connected clients in the session
    io.to(sessionId).emit(type, data);
  } catch (error) {
    console.error('Error processing Redis message:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    redisClient.quit();
    process.exit(0);
  });
});

const PORT = process.env.PORT || 4001;

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 Yjs WebSocket endpoint: ws://localhost:${PORT}/yjs`);
}); 