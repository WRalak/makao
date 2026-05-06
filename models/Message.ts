import { query, queryOne, insert, update } from '../lib/database-helpers';

export interface MessageData {
  conversationId: string;
  senderId: number;
  receiverId: number;
  content: string;
  status?: 'sent' | 'delivered' | 'read' | 'flagged' | 'deleted';
}

interface Message {
  id: number;
  conversationId: string;
  senderId: number;
  receiverId: number;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageWithUsers extends Message {
  senderName?: string;
  senderEmail?: string;
  receiverName?: string;
  receiverEmail?: string;
}

class Message {
  static async findOne(query: any) {
    const { conversationId, senderId, receiverId } = query.$or[0];
    
    const sql = `
      SELECT m.*, u1.name as sender_name, u1.email as sender_email, 
             u2.name as receiver_name, u2.email as receiver_email
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.conversation_id = $1 
        AND m.sender_id = $2 
        AND m.receiver_id = $3
      LIMIT 1
    `;
    
    return await queryOne<MessageWithUsers>(sql, [conversationId, senderId, receiverId]);
  }

  static async find(query: any) {
    const { conversationId } = query;
    
    const sql = `
      SELECT m.*, u1.name as sender_name, u1.email as sender_email, 
             u2.name as receiver_name, u2.email as receiver_email
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `;
    
    return await query(sql, [conversationId]) as Promise<MessageWithUsers[]>;
  }

  static async create(data: MessageData) {
    const sql = `
      INSERT INTO messages (conversation_id, sender_id, receiver_id, content, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await query(sql, [
      data.conversationId,
      data.senderId,
      data.receiverId,
      data.content,
      data.status || 'sent'
    ]) as Message[];
    return result[0];
  }

  static async updateStatus(id: number, status: string) {
    const sql = `
      UPDATE messages 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [status, id]) as Message[];
    return result[0];
  }
}

export default Message;
