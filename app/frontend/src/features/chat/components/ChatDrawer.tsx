'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchConversationsThunk, fetchMessagesThunk, sendMessageThunk, markReadThunk } from '../services/chat-thunks';
import { setActiveConversation, toggleChatDrawer } from '../services/chat-slice';
import { Conversation, ChatParticipant, ChatMessage } from '../services/chat-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, ChevronLeft, Loader2, Search, MoreVertical, Phone, Video, Info, Check, CheckCheck, Image as ImageIcon, FileText, Smile, Link as LinkIcon, Download, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useChatRealtime } from '../hooks/useChatRealtime';

export const ChatDrawer: React.FC = () => {
    const dispatch = useAppDispatch();
    const { conversations, activeConversationId, messages, loading, isDrawerOpen } = useAppSelector((state) => state.chat);
    const { user } = useAppSelector((state) => state.auth);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showStickers, setShowStickers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const STICKERS = [
        { id: 'lgtm', url: 'https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif' },
        { id: 'rocket', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHlxMHF5YXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGpxP5eS0Yv60/giphy.gif' },
        { id: 'party', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxMHF5YXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKVUn7iM8FMEU24/giphy.gif' },
        { id: 'medal', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlxMHF5YXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4NXF4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGpxP5eS0Yv60/giphy.gif' },
    ];

    // Initialize realtime
    useChatRealtime();

    useEffect(() => {
        if (isDrawerOpen && conversations.length === 0) {
            dispatch(fetchConversationsThunk());
        }
    }, [isDrawerOpen, conversations.length, dispatch]);

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

        // Parse metadata if it's a string (defensive)
        let meta = msg.metadata;
        if (typeof meta === 'string') {
            try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
        }

        switch (msg.type) {
            case 'image':
                return (
                    <div className="space-y-2">
                        <img
                            src={meta?.url}
                            alt="Sent image"
                            className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition border border-gray-100 dark:border-white/10"
                            onClick={() => window.open(meta?.url, '_blank')}
                        />
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">{msg.content}</p>
                    </div>
                );
            case 'file':
                return (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'bg-white/10 border-white/20' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                        <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-white dark:bg-white/10'}`}>
                            <FileText size={20} className={isMe ? 'text-white' : 'text-gray-900 dark:text-white'} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{msg.content}</p>
                            <p className="text-[9px] font-bold opacity-50 uppercase">{(meta?.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <a
                            href={meta?.url}
                            download={msg.content}
                            className={`p-2 rounded-lg transition ${isMe ? 'hover:bg-white/20' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        >
                            <Download size={18} />
                        </a>
                    </div>
                );
            case 'sticker':
                return (
                    <img src={meta?.url} className="w-28 h-28 object-contain active:scale-110 transition-transform" alt="Sticker" />
                );
            case 'link':
                return (
                    <div className="flex flex-col gap-2 max-w-full">
                        <a
                            href={msg.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-[13px] font-bold hover:underline break-all ${isMe ? 'text-white' : 'text-black dark:text-white'}`}
                        >
                            <LinkIcon size={14} className="shrink-0" />
                            {msg.content}
                        </a>
                        {meta?.title && (
                            <div className={`rounded-xl overflow-hidden border p-3 space-y-2 ${isMe ? 'bg-white/10 border-white/20' : 'bg-white dark:bg-black/20 border-gray-200 dark:border-white/10'}`}>
                                {meta.image && (
                                    <img src={meta.image} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                                )}
                                <p className="text-[13px] font-black leading-tight line-clamp-2">{meta.title}</p>
                                {meta.description && (
                                    <p className="text-[11px] font-medium opacity-60 line-clamp-2 leading-relaxed">{meta.description}</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            default:
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                if (urlRegex.test(msg.content)) {
                    const parts = msg.content.split(urlRegex);
                    return (
                        <p className="leading-relaxed text-[14px]">
                            {parts.map((part, i) =>
                                urlRegex.test(part) ?
                                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={`font-bold underline decoration-2 underline-offset-4 ${isMe ? 'text-white' : 'text-black dark:text-white'}`}>{part}</a> :
                                    part
                            )}
                        </p>
                    );
                }
                return <p className="leading-relaxed text-[14px]">{msg.content}</p>;
        }
    };

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(toggleChatDrawer(false))}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-white dark:bg-[#0B0E11] z-[101] border-l border-gray-100 dark:border-white/5 flex flex-col overflow-hidden sm:rounded-l-[40px] shadow-2xl"
                    >
                        {/* Header View */}
                        {!activeConversationId ? (
                            <div className="p-8 border-b border-gray-50 dark:border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black italic tracking-tighter dark:text-white uppercase">Inbox</h2>
                                    <button
                                        onClick={() => dispatch(toggleChatDrawer(false))}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all"
                                    >
                                        <X size={24} strokeWidth={3} className="dark:text-white" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search network..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none dark:text-white"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 py-5 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-[#0B0E11]/80 backdrop-blur-xl sticky top-0 z-20">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => dispatch(setActiveConversation(null))}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all"
                                    >
                                        <ChevronLeft size={28} strokeWidth={2.5} className="dark:text-white" />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={otherParticipant?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.display_name}`}
                                            alt={otherParticipant?.display_name}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-white/10"
                                        />
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white leading-none mb-1 text-lg tracking-tight">
                                                {otherParticipant?.display_name}
                                            </h3>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active now</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-black dark:text-white"><MoreVertical size={22} /></button>
                                </div>
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-[#0B0E11]">
                            {!activeConversationId ? (
                                <div className="p-4 space-y-2">
                                    {loading && conversations.length === 0 ? (
                                        <div className="p-20 text-center flex flex-col items-center">
                                            <Loader2 className="animate-spin text-black dark:text-white mb-4" size={32} strokeWidth={3} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing...</p>
                                        </div>
                                    ) : filteredConversations.length === 0 ? (
                                        <div className="p-20 text-center space-y-4">
                                            <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-dashed border-gray-200 dark:border-white/10">
                                                <MessageSquare size={40} className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-tight text-xs">No chatter yet.</p>
                                        </div>
                                    ) : (
                                        filteredConversations.map((conv: Conversation) => {
                                            const other = conv?.participants?.find((p: ChatParticipant) => p.profile_id !== user?.id);
                                            const isUnread = !conv.last_message?.is_read && conv.last_message?.sender_id !== user?.id;

                                            return (
                                                <button
                                                    key={conv.id}
                                                    onClick={() => dispatch(setActiveConversation(conv.id))}
                                                    className="w-full p-5 flex gap-5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all rounded-[32px] group relative border border-transparent hover:border-gray-100 dark:hover:border-white/10"
                                                >
                                                    <div className="relative shrink-0">
                                                        <img
                                                            src={other?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.display_name}`}
                                                            alt={other?.display_name}
                                                            className="w-16 h-16 rounded-full object-cover group-hover:scale-95 transition-transform border border-gray-100 dark:border-white/10"
                                                        />
                                                        {isUnread && (
                                                            <div className="absolute top-0 right-0 w-5 h-5 bg-black dark:bg-white border-4 border-white dark:border-[#0B0E11] rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-2">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <h4 className={`font-black text-gray-900 dark:text-white truncate text-lg tracking-tight ${isUnread ? 'italic' : ''}`}>
                                                                {other?.display_name}
                                                            </h4>
                                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest whitespace-nowrap">
                                                                {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false, locale: fr })}
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm truncate font-medium ${isUnread ? 'text-black dark:text-white font-black' : 'text-gray-500'}`}>
                                                            {conv.last_message?.sender_id === user?.id ? "Me: " : ""}
                                                            {conv.last_message?.type !== 'text' ? `Sent ${conv.last_message?.type}` : conv.last_message?.content || "Tap to chat"}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 flex flex-col gap-8">
                                    <div className="text-center py-10 space-y-4">
                                        <img
                                            src={otherParticipant?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.display_name}`}
                                            alt={otherParticipant?.display_name}
                                            className="w-24 h-24 rounded-full mx-auto grayscale hover:grayscale-0 transition-all border-2 border-black dark:border-white p-1"
                                        />
                                        <div>
                                            <h4 className="font-black text-2xl dark:text-white tracking-tighter uppercase italic">{otherParticipant?.display_name}</h4>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-2">Professional Connection</p>
                                        </div>
                                    </div>

                                    {messages[activeConversationId]?.slice().reverse().map((msg: ChatMessage) => {
                                        const isMe = msg.sender_id === user?.id;
                                        const isSticker = msg.type === 'sticker';

                                        return (
                                            <div key={msg.id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={isSticker ? '' : `px-5 py-4 text-[14px] font-medium leading-relaxed transition-all ${isMe
                                                        ? 'bg-black dark:bg-white text-white dark:text-black rounded-[28px] rounded-br-[4px]'
                                                        : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 rounded-[28px] rounded-bl-[4px]'
                                                        }`}>
                                                        {renderMessageContent(msg)}
                                                    </div>
                                                    <div className={`flex items-center gap-2 mt-3 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && (
                                                            <div className={msg.is_read ? "text-black dark:text-white" : "text-gray-300 dark:text-white/20"}>
                                                                <Check size={14} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} className="h-4" />
                                </div>
                            )}
                        </div>

                        {/* Footer Input */}
                        {activeConversationId && (
                            <div className="p-6 bg-white dark:bg-[#0B0E11] border-t border-gray-100 dark:border-white/5">
                                <form
                                    onSubmit={(e) => handleSendMessage(e)}
                                    className="space-y-4"
                                >
                                    {/* Action Bar */}
                                    <div className="flex items-center gap-3">
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-2xl transition-all">
                                            <ImageIcon size={20} strokeWidth={2.5} />
                                        </button>
                                        <button type="button" onClick={() => setShowStickers(!showStickers)} className={`p-3 rounded-2xl transition-all ${showStickers ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-50 dark:bg-white/5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}>
                                            <Smile size={20} strokeWidth={2.5} />
                                        </button>

                                        <AnimatePresence>
                                            {showStickers && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    className="absolute bottom-32 left-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-[40px] p-6 shadow-2xl grid grid-cols-4 gap-4 z-50 ring-1 ring-black/5"
                                                >
                                                    {STICKERS.map(s => (
                                                        <button key={s.id} type="button" onClick={() => handleSendMessage(undefined, { content: 'sticker', type: 'sticker', metadata: { url: s.url } })} className="hover:scale-110 active:scale-95 transition-all">
                                                            <img src={s.url} alt={s.id} className="w-12 h-12 grayscale hover:grayscale-0 transition-all" />
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="relative flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="Write something..."
                                            className="flex-1 bg-gray-50 dark:bg-white/5 border-none rounded-[28px] py-5 px-8 text-[15px] font-bold dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!messageInput.trim()}
                                            className="p-5 bg-black dark:bg-white text-white dark:text-black rounded-full hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-20 transition-all shadow-xl shadow-black/10 dark:shadow-white/10"
                                        >
                                            <Send size={22} strokeWidth={3} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
