import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export interface SocketServer extends NetServer {
  io: SocketIOServer;
}

// Extend the socket type with custom data
interface SocketWithUser extends Socket {
  userId: string;
}

interface MessageData {
  conversationId: string;
  content: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  type: 'text' | 'file' | 'image';
  fileName?: string;
  fileUrl?: string;
}

interface TypingData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

interface ReadReceiptData {
  messageId: string;
  userId: string;
  conversationId: string;
  readAt: Date;
}

class SocketService {
  private io: SocketIOServer;

  constructor(server: NetServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://yourdomain.com'] 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const socketWithUser = socket as SocketWithUser;
      console.log('User connected:', socket.id);

      // Set userId from authentication middleware
      socketWithUser.userId = socketWithUser.handshake.auth?.userId || 'anonymous';

      // Join user to their personal room for notifications
      socket.join(`user_${socketWithUser.userId}`);

      // Handle joining conversations
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conversation_${conversationId}`);
        socket.to(`conversation_${conversationId}`).emit('user_joined', {
          userId: socketWithUser.userId,
          conversationId
        });
      });

      // Handle leaving conversations
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation_${conversationId}`);
        socket.to(`conversation_${conversationId}`).emit('user_left', {
          userId: socketWithUser.userId,
          conversationId
        });
      });

      // Handle typing indicators
      socket.on('typing', (data: TypingData) => {
        socket.to(`conversation_${data.conversationId}`).emit('user_typing', data);
      });

      // Handle sending messages
      socket.on('send_message', async (data: MessageData) => {
        try {
          // Save message to database
          const message = await this.saveMessage(data);
          
          // Broadcast to conversation room
          this.io.to(`conversation_${data.conversationId}`).emit('new_message', {
            ...message,
            timestamp: new Date()
          });

          // Send read receipt to sender
          socket.emit('message_sent', { messageId: message._id });
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle read receipts
      socket.on('mark_read', (data: ReadReceiptData) => {
        socket.to(`conversation_${data.conversationId}`).emit('message_read', data);
      });

      // Handle online status
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Broadcast offline status to conversations
        socket.broadcast.emit('user_offline', { userId: socketWithUser.userId });
      });
    });
  }

  private async saveMessage(data: MessageData) {
    // This would save to your Message model
    // For now, return a mock message
    return {
      _id: Date.now().toString(),
      conversationId: data.conversationId,
      content: data.content,
      senderId: data.senderId,
      receiverId: data.receiverId,
      propertyId: data.propertyId,
      type: data.type,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Helper methods for broadcasting
  public broadcastToUser(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  public broadcastToConversation(conversationId: string, event: string, data: any) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  public getConnectedUsers() {
    return this.io.sockets.sockets.size;
  }
}

// Singleton instance
let socketService: SocketService | null = null;

export function initSocket(server: NetServer): SocketService {
  if (!socketService) {
    socketService = new SocketService(server);
  }
  return socketService;
}

export function getSocketService(): SocketService | null {
  return socketService;
}
