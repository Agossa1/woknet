import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import Logger from '../logger/winston';

export class SocketService {
    private static instance: SocketService;
    private io: Server | null = null;
    private readonly logger = new Logger();

    private onlineUsers = new Set<string>();

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public init(server: HttpServer): void {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        this.io.on('connection', (socket: Socket) => {
            const userId = socket.handshake.query.userId as string;

            if (userId) {
                // Join user room
                socket.join(`user:${userId}`);
                this.logger.instance.info(`[SocketService] User ${userId} joined room user:${userId}`);

                // Add to online users if not already present
                if (!this.onlineUsers.has(userId)) {
                    this.onlineUsers.add(userId);
                    // Broadcast to everyone that this user is now online
                    socket.broadcast.emit('user_status_change', { userId, isOnline: true });
                }

                // Send the current list of online users to the newly connected user
                socket.emit('online_users', Array.from(this.onlineUsers));
            }

            this.logger.instance.info(`[SocketService] New client connected: ${socket.id}`);

            socket.on('disconnect', () => {
                if (userId) {
                    // Check if there are other sockets for this user
                    const room = this.io?.sockets.adapter.rooms.get(`user:${userId}`);
                    if (!room || room.size === 0) {
                        this.onlineUsers.delete(userId);
                        // Broadcast that the user is offline
                        this.io?.emit('user_status_change', { userId, isOnline: false });
                    }
                }
                this.logger.instance.info(`[SocketService] Client disconnected: ${socket.id}`);
            });

            // Join a global feed room
            socket.join('feed');

            // Handle typing events
            socket.on('typing', (data: { conversationId: string, recipientId: string }) => {
                this.io?.to(`user:${data.recipientId}`).emit('typing', {
                    conversationId: data.conversationId,
                    userId: userId
                });
            });

            socket.on('stop_typing', (data: { conversationId: string, recipientId: string }) => {
                this.io?.to(`user:${data.recipientId}`).emit('stop_typing', {
                    conversationId: data.conversationId,
                    userId: userId
                });
            });
        });

        this.logger.instance.info('[SocketService] Socket.io initialized');
    }

    public emit(event: string, data: any, room?: string): void {
        if (!this.io) {
            this.logger.instance.warn('[SocketService] Cannot emit, Socket.io not initialized');
            return;
        }

        if (room) {
            this.io.to(room).emit(event, data);
        } else {
            this.io.emit(event, data);
        }
    }

    public emitToUser(userId: string, event: string, data: any): void {
        this.emit(event, data, `user:${userId}`);
    }
}

export const socketService = SocketService.getInstance();
