import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, Plus, Trash2, MessageSquare, Loader2,
  Bot, User, Pencil, Check, X, Sparkles, ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
  sendMessage, getChats, getChatById,
  deleteChat, clearAllChats, renameChat,
} from '../utils/chat.service';

// ── Suggested prompts ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  '📄 Review my resume and suggest improvements',
  '💼 What skills should I learn for a Full Stack role?',
  '🎯 How do I prepare for a system design interview?',
  '💰 How to negotiate a higher salary offer?',
  '🔍 How to optimize my LinkedIn profile?',
  '📝 Write a cover letter for a React Developer role',
];

// ── Single message bubble ──────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 mb-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5
        ${isUser ? 'bg-sky-500' : 'bg-violet-600'}`}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-sky-500 text-white rounded-tr-sm'
          : 'bg-slate-800 border border-white/[0.07] text-slate-200 rounded-tl-sm'
        }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:my-1 prose-ul:my-1 prose-li:my-0.5
            prose-headings:text-white prose-strong:text-white
            prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-sky-200 text-right' : 'text-slate-500'}`}>
          {new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// ── Typing indicator ───────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-3 mb-5">
    <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
      <Bot size={15} className="text-white" />
    </div>
    <div className="bg-slate-800 border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1.5 items-center h-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════════
export default function ChatPage() {
  const { id: urlChatId } = useParams();
  const navigate          = useNavigate();

  const [chats, setChats]           = useState([]);
  const [activeChatId, setActiveChatId] = useState(urlChatId || null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [sending, setSending]       = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [editingId, setEditingId]   = useState(null);
  const [editTitle, setEditTitle]   = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Load chat list
  useEffect(() => {
    fetchChats();
  }, []);

  // Load chat when URL changes
  useEffect(() => {
    if (urlChatId) {
      setActiveChatId(urlChatId);
      loadChat(urlChatId);
    } else {
      setActiveChatId(null);
      setMessages([]);
    }
  }, [urlChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const fetchChats = async () => {
    try {
      setLoadingList(true);
      const { data } = await getChats();
      if (data.success) setChats(data.chats);
    } catch { /* silent */ }
    finally { setLoadingList(false); }
  };

  const loadChat = async (id) => {
    try {
      setLoadingChat(true);
      const { data } = await getChatById(id);
      if (data.success) setMessages(data.chat.messages);
    } catch { toast.error('Failed to load chat'); }
    finally { setLoadingChat(false); }
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');

    // Optimistic UI
    const tempUserMsg = { role: 'user', content: msg, createdAt: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const { data } = await sendMessage(msg, activeChatId);
      if (data.success) {
        const aiMsg = { role: 'assistant', content: data.reply, createdAt: new Date() };

        if (!activeChatId) {
          // New chat created
          setActiveChatId(data.chatId);
          navigate(`/chat/${data.chatId}`, { replace: true });
          setMessages([tempUserMsg, aiMsg]);
          await fetchChats();
        } else {
          setMessages(prev => [...prev.slice(0, -1), tempUserMsg, aiMsg]);
          // Update title in sidebar if changed
          setChats(prev => prev.map(c =>
            c._id === data.chatId ? { ...c, title: data.title, updatedAt: new Date() } : c
          ));
        }
      }
    } catch (err) {
      setMessages(prev => prev.slice(0, -1));
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    navigate('/chat', { replace: true });
    inputRef.current?.focus();
  };

  const handleSelectChat = (id) => {
    if (id === activeChatId) return;
    navigate(`/chat/${id}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteChat(id);
      setChats(prev => prev.filter(c => c._id !== id));
      if (activeChatId === id) handleNewChat();
      toast.success('Chat deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all chats?')) return;
    try {
      await clearAllChats();
      setChats([]);
      handleNewChat();
      toast.success('All chats cleared');
    } catch { toast.error('Failed'); }
  };

  const startRename = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
  };

  const saveRename = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await renameChat(id, editTitle.trim());
      setChats(prev => prev.map(c => c._id === id ? { ...c, title: editTitle.trim() } : c));
    } catch { toast.error('Rename failed'); }
    setEditingId(null);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#080d1a] text-slate-100 overflow-hidden">

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 transition-all duration-300 overflow-hidden
        bg-[#0d1424] border-r border-white/[0.07] flex flex-col`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">AI Assistant</span>
          </div>
          <button onClick={handleNewChat}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 transition-all"
            title="New Chat">
            <Plus size={15} />
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {loadingList ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-slate-600" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-600">No chats yet</p>
            </div>
          ) : (
            chats.map(chat => (
              <div key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                  ${activeChatId === chat._id
                    ? 'bg-sky-500/15 border border-sky-500/20'
                    : 'hover:bg-white/[0.05] border border-transparent'
                  }`}>
                <MessageSquare size={13} className={activeChatId === chat._id ? 'text-sky-400 shrink-0' : 'text-slate-600 shrink-0'} />

                {editingId === chat._id ? (
                  <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveRename(chat._id); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 bg-white/[0.08] border border-white/[0.1] rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveRename(chat._id)} className="text-emerald-400 hover:text-emerald-300"><Check size={12} /></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-400"><X size={12} /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${activeChatId === chat._id ? 'text-sky-300' : 'text-slate-300'}`}>
                        {chat.title}
                      </p>
                      <p className="text-[10px] text-slate-600 truncate mt-0.5">{chat.preview}</p>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button onClick={e => startRename(e, chat)}
                        className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-sky-400 transition-colors">
                        <Pencil size={11} />
                      </button>
                      <button onClick={e => handleDelete(e, chat._id)}
                        className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {chats.length > 0 && (
          <div className="px-3 pb-4 pt-2 border-t border-white/[0.07]">
            <button onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
              <Trash2 size={12} /> Clear All Chats
            </button>
          </div>
        )}
      </aside>

      {/* ══ MAIN CHAT AREA ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.07] bg-[#0d1424] shrink-0">
          <button onClick={() => setSidebarOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.07] text-slate-400 transition-all">
            <ChevronLeft size={16} className={`transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">ResumeAI Assistant</p>
              <p className="text-[10px] text-emerald-400">● Online — Career Expert</p>
            </div>
          </div>
          <div className="ml-auto">
            <button onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded-xl text-xs font-medium transition-all">
              <Plus size={13} /> New Chat
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-6">
          {loadingChat ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={28} className="animate-spin text-sky-400" />
            </div>
          ) : messages.length === 0 ? (
            /* Welcome screen */
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center mb-5 shadow-xl shadow-sky-500/20">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">ResumeAI Assistant</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Your personal career coach. Ask me anything about resumes, interviews, job search, or career growth.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)}
                    className="text-left px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-sky-500/30 rounded-xl text-sm text-slate-300 hover:text-white transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {sending && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 md:px-8 lg:px-16 pb-5 pt-3 bg-[#080d1a] border-t border-white/[0.05] shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-white/[0.04] border border-white/[0.09] hover:border-sky-500/30 focus-within:border-sky-500/50 rounded-2xl px-4 py-3 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything about your career, resume, or interviews…"
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none max-h-32 leading-relaxed"
                style={{ minHeight: '24px' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition-all shrink-0"
              >
                {sending
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Send size={16} />}
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-700 mt-2">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}