// src/app/messages/page.tsx

"use client";
import React, { useState } from 'react';
import { Layout } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Import ShadCN components here
// import {  } from "@/components/ui/";

export default function MessagesPage() {
  // Placeholder states and data structure
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('conv-1'); // Default to a selected conversation
  const [newMessage, setNewMessage] = useState('');

  // --- Conceptual Data Fetching and Real-time Updates ---
  // In a real application, you would fetch conversations and messages here.
  // Example: Using React Query, SWR, or a state management library like Zustand/Redux
  // Example: Setting up real-time listeners with Firebase or a similar backend

  // const { data: conversations, isLoading: isLoadingConversations } = useFetchConversations(); // Conceptual fetch hook
  // const { data: messages, isLoading: isLoadingMessages } = useFetchMessages(selectedConversationId); // Conceptual fetch hook
  // useEffect(() => { // Example real-time listener setup
  //   if (selectedConversationId) {
  //     const unsubscribe = subscribeToMessages(selectedConversationId, setMessages);
  //     return () => unsubscribe();
  //   }
  // }, [selectedConversationId]);

  const handleSendMessage = () => {
    // --- Conceptual Send Message Logic ---
    // In a real application, this would send the message to the backend
    if (!newMessage.trim() || !selectedConversationId) return;
    console.log(`Sending message to ${selectedConversationId}: ${newMessage}`);
    // Example: await sendMessageToBackend(selectedConversationId, newMessage);
    setNewMessage(''); // Clear input after attempting send
  };

  // Placeholder data for UI structure
  const placeholderConversations = [
    { id: 'conv-1', name: 'User Name 1', lastMessage: 'Last message preview...', timestamp: '10:30 AM', avatarUrl: 'https://placehold.co/40x40.png', unreadCount: 0 },
    { id: 'conv-2', name: 'Buyer Group', lastMessage: 'New message here!', timestamp: 'Yesterday', avatarUrl: 'https://placehold.co/40x40.png', unreadCount: 1 },
    { id: 'conv-3', name: 'Service Provider X', lastMessage: 'Okay, sounds good.', timestamp: '2 days ago', avatarUrl: 'https://placehold.co/40x40.png', unreadCount: 0 },
    { id: 'conv-4', name: 'Processor Co.', lastMessage: 'Regarding batch #12345...', timestamp: 'Last week', avatarUrl: 'https://placehold.co/40x40.png', unreadCount: 0 },
    // Add more placeholder conversations here
  ];

  const placeholderMessages = [
    { id: 'msg-1', conversationId: 'conv-1', sender: 'other', content: 'Hello! I saw your listing for organic mangoes on the marketplace. Are they still available?', timestamp: '10:28 AM' },
    { id: 'msg-2', conversationId: 'conv-1', sender: 'me', content: 'Hi! Yes, they are still available. We harvested them yesterday. Quantity is 500kg.', timestamp: '10:30 AM' },
    { id: 'msg-3', conversationId: 'conv-1', sender: 'other', content: 'Great! What is the price per kg and minimum order quantity?', timestamp: '10:35 AM' },
    { id: 'msg-4', conversationId: 'conv-1', sender: 'me', content: '$2.50/kg, minimum order 100kg.', timestamp: '10:37 AM' },
    // Add more placeholder messages for the selected conversation
  ];

  const selectedConversation = placeholderConversations.find(c => c.id === selectedConversationId);

  return (
    <Layout>
        {/* Conversation List Sidebar */}
      <Card className="w-1/3 flex flex-col rounded-l-lg rounded-r-none">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-xl">Conversations</CardTitle>
          {/* Placeholder for search/filter */}
          <Input placeholder="Search conversations..." className="mt-2" />
        </CardHeader>
        {/* Scrollable area for conversations */}
        <ScrollArea className="flex-grow">
          <CardContent className="p-0">
            {/* --- Conceptual Loading/Empty State for Conversations --- */}
            {/* {isLoadingConversations && <div className="p-4 text-center text-sm text-muted-foreground">Loading conversations...</div>} */}
            {/* {!isLoadingConversations && conversations.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet.</div>} */}

            {/* Map through actual conversations or placeholder data */}
            {placeholderConversations.map(conversation => (
              <ConversationItem
                key={conversation.id}
                {...conversation} // Spread placeholder data
                isSelected={selectedConversationId === conversation.id}
                onSelect={() => setSelectedConversationId(conversation.id)}
              />
            ))}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Message View Area */}
      <Card className="flex-1 flex flex-col rounded-r-lg rounded-l-none">
        {!selectedConversationId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation to start messaging</div>
        ) : (
          <>
            {/* Header for the selected conversation */}
            <CardHeader className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedConversation?.avatarUrl} alt={selectedConversation?.name} />
                  <AvatarFallback>{selectedConversation?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedConversation?.name}</CardTitle>
                  {/* Placeholder for role/status */}
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </CardHeader>

            {/* Scrollable Message History Area */}
            <ScrollArea className="flex-grow p-4">
              {/* --- Conceptual Loading/Empty State for Messages --- */}
              {/* {isLoadingMessages && <div className="text-center text-sm text-muted-foreground">Loading messages...</div>} */}
              {/* {!isLoadingMessages && messages.length === 0 && <div className="text-center text-sm text-muted-foreground">No messages yet.</div>} */}

              {/* Map through actual messages or placeholder data */}
              <div className="space-y-4">
                {placeholderMessages.filter(msg => msg.conversationId === selectedConversationId).map(message => (
                  <MessageItem
                    key={message.id}
                    {...message} // Spread placeholder data
                  />
                ))}
              </div>
            </ScrollArea>

            <Separator /> {/* Separator before the input area */}

            {/* Message Input Area */}
            <div className="p-4 flex items-center space-x-2">
              {/* Use Textarea for multi-line input */}
              <Textarea
                placeholder="Type your message..."
                className="flex-grow resize-none min-h-[40px]" // Adjust min-height as needed
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => { // Allow sending with Enter key
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Prevent newline
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>Send</Button>
            </div>
          </>
        )}
      </Card>
    </Layout>
  );
}

// --- Conceptual Static UI Components for Clarity ---
// These components are not fully functional React components yet,
// but serve as placeholders to structure the UI more clearly than just divs.

// Conceptual Conversation Item Component
const ConversationItem: React.FC<{
  id: string; // Conceptual ID for selection
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl?: string; // Optional avatar URL
  unreadCount?: number; // Optional unread count
  isSelected: boolean; // To indicate if this item is selected
  onSelect: () => void; // Conceptual handler for selection
}> = ({ id, name, lastMessage, timestamp, avatarUrl, unreadCount, isSelected, onSelect }) => (
  <div
    className={`flex items-center space-x-3 p-2 border-b hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-gray-100' : ''}`}
    onClick={onSelect} // Use the conceptual onSelect handler
  >
    <div className={`w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 ${avatarUrl ? '' : 'flex items-center justify-center text-xs'}`}>
      {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" /> : (name ? name.charAt(0) : '?')}
    </div>
    <div className="flex-1 overflow-hidden"> {/* Added overflow-hidden */}
      <p className="font-medium truncate">{name}</p> {/* Added truncate */}
      <p className={`text-sm text-muted-foreground truncate ${unreadCount && unreadCount > 0 ? 'font-bold text-foreground' : ''}`}>
        {lastMessage}
      </p> {/* Added truncate and bold for unread */}
    </div>
    <div className="flex flex-col items-end min-w-max"> {/* Use flex-col and min-w-max */}
      <span className="text-xs text-muted-foreground">{timestamp}</span>
      {unreadCount && unreadCount > 0 && (
        <span className="mt-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">{unreadCount}</span>
      )}
    </div>
  </div>
);

// Conceptual Message Component
const Message: React.FC<{ type: 'sent' | 'received'; content: string; timestamp: string }> = ({ type, content, timestamp }) => (
  <div className={`flex ${type === 'sent' ? 'justify-end' : 'justify-start'}`}>
    <div className={`p-3 rounded-lg max-w-[70%] ${type === 'sent' ? 'bg-primary text-primary-foreground message-sent' : 'bg-gray-200 text-gray-800 message-received'}`}>
      <p>{content}</p>
      <span className="block text-xs text-muted-foreground text-right mt-1">{timestamp}</span>
    </div>
  </div>
);