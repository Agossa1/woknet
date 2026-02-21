"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const winston_1 = __importDefault(require("../logger/winston"));
class SocketService {
    constructor() {
        this.io = null;
        this.logger = new winston_1.default();
        this.onlineUsers = new Set();
    }
    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }
    init(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        this.io.on('connection', (socket) => {
            const userId = socket.handshake.query.userId;
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
            socket.on('typing', (data) => {
                this.io?.to(`user:${data.recipientId}`).emit('typing', {
                    conversationId: data.conversationId,
                    userId: userId
                });
            });
            socket.on('stop_typing', (data) => {
                this.io?.to(`user:${data.recipientId}`).emit('stop_typing', {
                    conversationId: data.conversationId,
                    userId: userId
                });
            });
        });
        this.logger.instance.info('[SocketService] Socket.io initialized');
    }
    emit(event, data, room) {
        if (!this.io) {
            this.logger.instance.warn('[SocketService] Cannot emit, Socket.io not initialized');
            return;
        }
        if (room) {
            this.io.to(room).emit(event, data);
        }
        else {
            this.io.emit(event, data);
        }
    }
    emitToUser(userId, event, data) {
        this.emit(event, data, `user:${userId}`);
    }
}
exports.SocketService = SocketService;
exports.socketService = SocketService.getInstance();
//# sourceMappingURL=socket.service.js.map