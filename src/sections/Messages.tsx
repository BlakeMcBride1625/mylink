import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, LogOut } from 'lucide-react';
import ConversationList from '../components/messages/ConversationList';
import ChatView from '../components/messages/ChatView';
import axios from 'axios';

const api = axios.create({
  baseURL: '/', // Use relative path to work with Cloudflare tunnel
  withCredentials: true,
});

interface Conversation {
  id: number;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  last_message: string | null;
  last_message_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Messages() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch conversations when authenticated
  useEffect(() => {
    if (user) {
      fetchConversations();
      // Poll for new conversations every 5 seconds
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/user');
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        // Redirect to Discord login
        window.location.href = '/auth/discord';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/auth/discord';
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/conversations');
      setConversations(response.data.conversations);
      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await api.delete(`/api/conversations/${conversationId}`);
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleCloseConversation = async (conversationId: number) => {
    try {
      await api.patch(`/api/conversations/${conversationId}/close`);
      fetchConversations();
    } catch (error) {
      console.error('Failed to close conversation:', error);
    }
  };

  const handleReopenConversation = async (conversationId: number) => {
    try {
      await api.patch(`/api/conversations/${conversationId}/reopen`);
      fetchConversations();
    } catch (error) {
      console.error('Failed to reopen conversation:', error);
    }
  };

  const handleCreateConversation = async () => {
    try {
      setIsCreatingConversation(true);
      const response = await api.post('/api/conversations');
      const newConversation = response.data.conversation;
      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to start a new conversation. Please try again.');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-quantum-glow animate-spin" />
          <p className="text-gray-400 font-mono">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24 pb-32">
      <div className="max-w-7xl mx-auto h-[calc(100vh-16rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-8 h-8 text-quantum-glow" />
              <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
                Messages
              </h1>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all flex items-center gap-2 text-gray-300 hover:text-white font-mono"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </motion.button>
          </div>
          <p className="text-xl text-gray-400 font-mono">
            {isAdmin ? 'Admin View - All Conversations' : 'Your Direct Messages'}
          </p>
        </motion.div>

        {/* Discord-like Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden h-full flex flex-col lg:flex-row"
        >
          {/* Conversation List Sidebar - Hidden on mobile when chat is open */}
          <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-auto h-full`}>
            {!isAdmin && conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-16 h-16 text-quantum-glow opacity-50 mb-4" />
                <h3 className="text-xl font-mono text-gray-300 mb-2">No conversations yet</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  Start a conversation with @epildev
                </p>
                <motion.button
                  onClick={handleCreateConversation}
                  disabled={isCreatingConversation}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl bg-quantum-glow text-dark-900 font-mono font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingConversation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      Start Conversation
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                isAdmin={isAdmin}
              />
            )}
          </div>

          {/* Chat View - Shows on mobile only when conversation selected */}
          <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-col flex-1 h-full`}>
            <ChatView
              conversation={selectedConversation}
              user={user}
              isAdmin={isAdmin}
              onDelete={handleDeleteConversation}
              onClose={handleCloseConversation}
              onReopen={handleReopenConversation}
              onBack={() => setSelectedConversation(null)}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

