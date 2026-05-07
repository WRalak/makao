import { create } from 'zustand';

export interface Message {
  id: number;
  conversationId: string;
  senderId: number;
  receiverId: number;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'flagged' | 'deleted';
  createdAt: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  propertyId: number;
  propertyTitle: string;
  otherUserId: number;
  otherUserName: string;
  otherUserEmail: string;
  lastMessageTime: string;
  messageCount: number;
  unreadCount: number;
}

interface MessageState {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: number, status: Message['status']) => void;
  markConversationAsRead: (conversationId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getMessagesForConversation: (conversationId: string) => Message[];
  getUnreadCount: () => number;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (conversationId) => set({ currentConversation: conversationId }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      // Update conversation's last message time and message count
      conversations: state.conversations.map((conv) =>
        conv.id === message.conversationId
          ? {
              ...conv,
              lastMessageTime: message.createdAt,
              messageCount: conv.messageCount + 1,
              unreadCount: conv.unreadCount + 1,
            }
          : conv
      ),
    })),

  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, status } : message
      ),
    })),

  markConversationAsRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
      messages: state.messages.map((message) =>
        message.conversationId === conversationId
          ? { ...message, status: 'read' as const, readAt: new Date().toISOString() }
          : message
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  getMessagesForConversation: (conversationId) => {
    const { messages } = get();
    return messages
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  getUnreadCount: () => {
    const { conversations } = get();
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  },
}));
