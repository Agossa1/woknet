'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchConversationsThunk, fetchMessagesThunk, sendMessageThunk, markReadThunk } from '@/src/features/chat/services/chat-thunks';
import { setActiveConversation } from '@/src/features/chat/services/chat-slice';
import { Conversation, ChatParticipant, ChatMessage } from '@/src/features/chat/services/chat-types';
import { useSocket } from '@/src/infra/realtime/socket-provider';

import { Search, Send, Plus, Phone, Video, ChevronLeft, Loader2, MessageSquare, CheckCheck, Info, Image as ImageIcon, FileText, Smile, Link as LinkIcon, Download, MoreVertical, X } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

const STICKERS = [
  { id: 'lgtm', url: 'https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif' },
  { id: 'rocket', url: 'https://media.giphy.com/media/3o7TKMGpxP5eS0Yv60/giphy.gif' },
  { id: 'party', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHlxMHF5YXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKVUn7iM8FMEU24/giphy.gif' },
  { id: 'medal', url: 'https://media.giphy.com/media/3o7TKMGpxP5eS0Yv60/giphy.gif' },
];

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const { conversations, activeConversationId, messages, loading, onlineUsers, typingUsers } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    dispatch(fetchConversationsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (activeConversationId) {
      dispatch(fetchMessagesThunk({ conversationId: activeConversationId }));
      dispatch(markReadThunk(activeConversationId));
    }
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  const handleSendMessage = (e?: React.FormEvent, customData?: { content: string, type: string, metadata?: any }) => {
    if (e) e.preventDefault();

    const content = customData?.content || messageInput.trim();
    const type = customData?.type || 'text';
    const metadata = customData?.metadata || {};

    if (!content || !activeConversationId) return;

    dispatch(sendMessageThunk({
      conversationId: activeConversationId,
      content,
      type: type as any,
      metadata
    }));

    if (!customData) setMessageInput("");
    if (showStickers) setShowStickers(false);
    if (showLinkInput) setShowLinkInput(false);

    // Stop typing immediately when message is sent
    if (activeConversationId && otherParticipant && socket) {
      socket.emit('stop_typing', { conversationId: activeConversationId, recipientId: otherParticipant.profile_id });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (activeConversationId && otherParticipant && socket) {
      socket.emit('typing', { conversationId: activeConversationId, recipientId: otherParticipant.profile_id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId: activeConversationId, recipientId: otherParticipant.profile_id });
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      handleSendMessage(undefined, {
        content: file.name,
        type: isImage ? 'image' : 'file',
        metadata: {
          url: reader.result as string,
          size: file.size,
          mimeType: file.type
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const activeConv = conversations.find((c: Conversation) => c.id === activeConversationId);
  const otherParticipant = activeConv?.participants?.find((p: ChatParticipant) => p.profile_id !== user?.id);

  const filteredConversations = conversations.filter(conv => {
    const other = conv.participants?.find(p => p.profile_id !== user?.id);
    return other?.display_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderMessageContent = (msg: ChatMessage) => {
    const isMe = msg.sender_id === user?.id;
    let meta = msg.metadata || {};
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
    }

    switch (msg.type) {
      case 'image':
        return (
          <div className="space-y-1">
            <img
              src={meta?.url}
              alt="Sent image"
              className="max-w-full rounded-lg cursor-pointer hover:opacity-95 transition"
              onClick={() => window.open(meta?.url, '_blank')}
            />
            <p className="text-[10px] opacity-70 italic mt-1">{msg.content}</p>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 bg-black/5 dark:bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <div className="p-2 bg-white/20 rounded-md">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{msg.content}</p>
              <p className="text-[10px] opacity-60">{(meta?.size / 1024).toFixed(1)} KB</p>
            </div>
            <a
              href={meta?.url}
              download={msg.content}
              className="p-2 hover:bg-white/10 rounded-md transition-all"
            >
              <Download size={16} />
            </a>
          </div>
        );
      case 'sticker':
        return (
          <img src={meta?.url} className="w-32 h-32 object-contain" alt="Sticker" />
        );
      case 'link':
        return (
          <div className="space-y-2">
            <a href={msg.content} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 font-medium underline decoration-1 underline-offset-4 hover:opacity-80 break-all ${isMe ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
              <LinkIcon size={14} className="shrink-0" /> {msg.content}
            </a>
            {meta?.title && (
              <div className={`rounded-lg overflow-hidden border p-3 space-y-2 ${isMe ? 'bg-white/10 border-white/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10'}`}>
                {meta.image && <img src={meta.image} alt="Preview" className="w-full h-32 object-cover rounded-md mb-2" />}
                <p className="text-sm font-bold leading-tight">{meta.title}</p>
                {meta.description && <p className="text-xs opacity-70 line-clamp-2">{meta.description}</p>}
              </div>
            )}
          </div>
        );
      default:
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (urlRegex.test(msg.content)) {
          const parts = msg.content.split(urlRegex);
          return (
            <p className="leading-relaxed whitespace-pre-wrap">
              {parts.map((part, i) =>
                urlRegex.test(part) ?
                  <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300 font-medium">{part}</a> :
                  part
              )}
            </p>
          );
        }
        return <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-[#0B0E11] text-gray-900 dark:text-gray-100 font-sans">

      {/* Sidebar - Liste des Conversations */}
      <div className={`w-full md:w-[360px] flex flex-col bg-white dark:bg-[#0B0E11] border-r border-gray-100 dark:border-white/5 ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold tracking-tight">Messages</h1>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500">
              <Plus size={20} />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto text-gray-400 mb-2" size={24} />
            </div>
          ) : filteredConversations.map((conv: Conversation) => {
            const other = conv?.participants?.find((p: ChatParticipant) => p.profile_id !== user?.id);
            const isSelected = activeConversationId === conv.id;
            const isUnread = !conv.last_message?.is_read && conv.last_message?.sender_id !== user?.id;

            return (
              <div
                key={conv.id}
                onClick={() => dispatch(setActiveConversation(conv.id))}
                className={`px-4 py-3 cursor-pointer flex gap-3 items-center transition-colors border-l-2 ${isSelected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={other?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.display_name}`}
                    alt={other?.display_name}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-800"
                  />
                  {/* Status Indicator could go here */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className={`text-sm truncate ${isSelected || isUnread ? 'font-semibold' : 'font-medium opacity-90'}`}>
                      {other?.display_name}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false, locale: fr })}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${isUnread ? 'font-semibold text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>
                    {conv.last_message?.sender_id === user?.id ? "Vous: " : ""}
                    {conv.last_message?.type === 'image' ? 'Image' :
                      conv.last_message?.type === 'file' ? 'Fichier' :
                        conv.last_message?.type === 'sticker' ? 'Sticker' :
                          conv.last_message?.content || "Nouvelle discussion"}
                  </p>
                </div>
                {isUnread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-[#0B0E11] ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>

        {activeConversationId ? (
          <>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#0B0E11]/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => dispatch(setActiveConversation(null))}
                  className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <img
                    src={otherParticipant?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.display_name}`}
                    alt={otherParticipant?.display_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-100">{otherParticipant?.display_name}</h2>
                    {activeConversationId && otherParticipant && typingUsers[activeConversationId]?.includes(otherParticipant.profile_id) ? (
                      <p className="text-[10px] text-blue-500 font-medium animate-pulse">En train d'écrire...</p>
                    ) : (
                      <p className={`text-[10px] font-medium ${onlineUsers?.includes(otherParticipant?.profile_id || '') ? 'text-green-500' : 'text-gray-400'}`}>
                        {onlineUsers?.includes(otherParticipant?.profile_id || '') ? 'En ligne' : 'Hors ligne'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors hover:text-blue-600"><Phone size={18} /></button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors hover:text-blue-600"><Video size={18} /></button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors hover:text-gray-600"><Info size={18} /></button>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

              <div className="flex flex-col items-center justify-center py-8 opacity-50 space-y-2">
                <img
                  src={otherParticipant?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.display_name}`}
                  alt={otherParticipant?.display_name}
                  className="w-16 h-16 rounded-full object-cover grayscale"
                />
                <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Début de la discussion avec {otherParticipant?.display_name}</p>
              </div>

              {messages[activeConversationId]?.slice().reverse().map((msg: ChatMessage) => {
                const isMe = msg.sender_id === user?.id;
                const isBubbleless = msg.type === 'sticker';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={otherParticipant?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.display_name}`}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full object-cover mt-auto"
                      />
                    )}
                    <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={isBubbleless ? '' : `px-4 py-2 text-[15px] shadow-sm ${isMe
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                        : 'bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm'
                        }`}>
                        {renderMessageContent(msg)}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <CheckCheck size={12} className={msg.is_read ? "text-blue-500" : "text-gray-300"} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#0B0E11] border-t border-gray-100 dark:border-white/5">
              <div className="max-w-4xl mx-auto flex items-end gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-[20px] transition-all focus-within:ring-1 focus-within:ring-blue-500/20">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf,text/*"
                />

                <div className="flex gap-1 pb-1 pl-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowLinkInput(!showLinkInput);
                        setShowStickers(false);
                      }}
                      className={`p-2 rounded-full transition-colors ${showLinkInput ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    >
                      <LinkIcon size={20} />
                    </button>
                    <AnimatePresence>
                      {showLinkInput && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-full left-0 mb-4 bg-white dark:bg-[#1A1D21] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-xl w-72 z-50"
                        >
                          <h3 className="text-sm font-bold mb-3 text-gray-900 dark:text-white">Partager un lien</h3>
                          <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full text-sm bg-gray-50 dark:bg-white/5 border-none rounded-lg p-3 mb-3 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && linkUrl.trim()) {
                                handleSendMessage(undefined, { content: linkUrl, type: 'link' });
                                setShowLinkInput(false);
                                setLinkUrl("");
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (linkUrl.trim()) {
                                handleSendMessage(undefined, { content: linkUrl, type: 'link' });
                                setShowLinkInput(false);
                                setLinkUrl("");
                              }
                            }}
                            className="w-full bg-blue-600 text-white rounded-lg p-2.5 text-sm font-bold hover:bg-blue-700 transition"
                          >
                            Envoyer
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowStickers(!showStickers);
                        setShowLinkInput(false);
                      }}
                      className={`p-2 rounded-full transition-colors ${showStickers ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    >
                      <Smile size={20} />
                    </button>
                    <AnimatePresence>
                      {showStickers && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-full left-0 mb-4 bg-white dark:bg-[#1A1D21] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-xl grid grid-cols-4 gap-2 w-64 z-50"
                        >
                          {STICKERS.map(s => (
                            <button
                              key={s.id}
                              onClick={() => handleSendMessage(undefined, { content: 'sticker', type: 'sticker', metadata: { url: s.url } })}
                              className="hover:scale-110 active:scale-95 transition-all p-1"
                            >
                              <img src={s.url} alt={s.id} className="w-10 h-10 object-contain" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <form onSubmit={(e) => handleSendMessage(e)} className="flex-1">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="Écrivez un message..."
                    className="w-full py-3 bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-400"
                  />
                </form>

                <button
                  onClick={(e) => handleSendMessage(e as any)}
                  disabled={!messageInput.trim()}
                  className="p-2 mr-1 mb-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
            <div className="w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <MessageSquare size={48} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vos Messages</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Sélectionnez une conversation dans la liste pour commencer à discuter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
