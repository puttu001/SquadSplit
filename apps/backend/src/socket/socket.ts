import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../shared/utils/jwt';

let io: SocketServer;

export function initSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Unauthorized'));

    const payload = verifyAccessToken(token);
    if (!payload) return next(new Error('Invalid token'));

    (socket as AuthenticatedSocket).userId = payload.userId;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const { userId } = socket as AuthenticatedSocket;
    socket.join(`user:${userId}`);
    console.log(`User ${userId} connected via WebSocket`);

    // Join group rooms the user belongs to
    socket.on('join:group', (groupId: string) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('leave:group', (groupId: string) => {
      socket.leave(`group:${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

// Emit helpers used by services
export const emitToUser  = (userId: string, event: string, data: unknown) =>
  getIO().to(`user:${userId}`).emit(event, data);

export const emitToGroup = (groupId: string, event: string, data: unknown) =>
  getIO().to(`group:${groupId}`).emit(event, data);

interface AuthenticatedSocket extends Socket {
  userId: string;
}
