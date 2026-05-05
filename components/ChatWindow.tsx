'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Phone, Video } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  attachments?: {
    filename: string;
    url: string;
    size: number;
    type: string;
  }[];
  createdAt: string;
  readAt?: string;
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  isTyping?: boolean;
}

interface ChatWindowProps {
  currentUser: User;
  otherUser: User;
  propertyId?: string;
  className?: string;
}

export default function ChatWindow({ 
  currentUser, 
  otherUser, 
  propertyId,
  className = '' 
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      query: {
        userId: currentUser._id,
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Mark as read if we're the receiver
      if (message.receiverId === currentUser._id) {
        newSocket.emit('markAsRead', { messageId: message._id });
      }
    });

    newSocket.on('typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId === otherUser._id) {
        setOtherUserTyping(isTyping);
      }
    });

    newSocket.on('userStatus', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      if (userId === otherUser._id) {
        // Update other user's online status
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser._id, otherUser._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: otherUser._id,
      content: newMessage.trim(),
      propertyId,
      attachments: attachedFiles.map(file => ({
        filename: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
      })),
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
    setAttachedFiles([]);
    setIsTyping(false);
  };

  const handleTyping = (value: string) => {
    if (!socket) return;
    
    setIsTyping(value.length > 0);
    socket.emit('typing', {
      userId: currentUser._id,
      receiverId: otherUser._id,
      isTyping: value.length > 0,
    });

    // Stop typing indicator after 1 second of inactivity
    setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', {
        userId: currentUser._id,
        receiverId: otherUser._id,
        isTyping: false,
      });
    }, 1000);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg flex flex-col h-96 ${className}`}>
      {/* Chat Header */}
      <div className="btn-primary text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            {otherUser.avatar ? (
              <img
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {otherUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold">{otherUser.name}</h3>
            <div className="text-xs text-gray-300">
              {otherUser.isOnline ? 'Online' : 'Offline'}
              {otherUserTyping && (
                <span className="ml-2 text-yellow-300">
                  <span className="inline-block animate-pulse">typing...</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="text-white hover:text-gray-300 transition-colors">
            <Phone className="h-4 w-4" />
          </button>
          <button className="text-white hover:text-gray-300 transition-colors">
            <Video className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.senderId === currentUser._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`max-w-xs lg:max-w-md ${
              message.senderId === currentUser._id 
                ? 'btn-primary text-white' 
                : 'bg-gray-100 text-gray-900'
            } rounded-lg p-3`}
            >
              {/* Message Header */}
              <div className={`flex items-center justify-between mb-1 text-xs ${
                message.senderId === currentUser._id ? 'text-gray-300' : 'text-gray-500'
              }`}>
                <span>{formatTime(message.createdAt)}</span>
                {message.senderId !== currentUser._id && !message.isRead && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full">New</span>
                )}
              </div>

              {/* Message Content */}
              <p className="text-sm break-words">{message.content}</p>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
                    >
                      <div className="flex-shrink-0">
                        {attachment.type.startsWith('image/') ? (
                          <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                            <Paperclip className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{attachment.filename}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-gray-50 border-t p-4 rounded-b-lg">
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white border rounded-lg p-2 flex items-center space-x-2"
              >
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-8 w-8 object-cover rounded"
                    />
                  ) : (
                    <Paperclip className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                </div>
                <button
                  onClick={() => removeAttachedFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileAttach}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            disabled={!isConnected}
          />

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="btn-primary p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="text-center text-xs text-red-500">
            Connecting to chat...
          </div>
        )}
      </div>
    </div>
  );
}
