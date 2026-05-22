import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../layout/StudentSidebar';
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
   Search, Paperclip, Send,
  CheckCheck, Loader2, Users, GraduationCap,
} from 'lucide-react';

// ── Base URL ───────────────────────────────────────────────────────────────
const BASE       = 'http://localhost:3000/api/messages';
const SERVER_URL = 'http://localhost:3000';

// ── Auth header ────────────────────────────────────────────────────────────
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ── Generic request helper ─────────────────────────────────────────────────
const request = async (method, url, body = null) => {
  const options = { method, headers: authHeader() };
  if (body) options.body = JSON.stringify(body);
  const r    = await fetch(url, options);
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || 'Erreur serveur');
  return data;
};

// ── API calls ──────────────────────────────────────────────────────────────
const api = {
  fetchConversations: ()                 => request('GET',   `${BASE}/conversations`),
  fetchMessages:      (convId)           => request('GET',   `${BASE}/${convId}`),
  sendMessage:        (conv_id, content) => request('POST',  BASE, { conv_id, content }),
  markAsRead:         (convId)           => request('PATCH', `${BASE}/${convId}/read`),
};

// ── Helpers ────────────────────────────────────────────────────────────────
const formatTime = (str) => {
  if (!str) return '';
  return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('blob:')) return url;
  return url;
};

// ── Helper: dispatch total unread to sidebar ───────────────────────────────
const dispatchChatUnread = (convs) => {
  const total = convs.reduce((sum, c) => sum + (c.unread || 0), 0);
  window.dispatchEvent(new CustomEvent('chat-unread', { detail: total }));
};

// ── Sub-components ─────────────────────────────────────────────────────────
const Avatar = ({ name, size = 38 }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
    style={{
      width: size, height: size,
      fontSize: size * 0.4,
      background: 'linear-gradient(135deg, #18335E, #2D8FBF)',
    }}
  >
    {(name || '?').charAt(0).toUpperCase()}
  </div>
);

const GroupIcon = ({ groupType, size = 16 }) => (
  <div
    className="rounded-full flex items-center justify-center text-white shrink-0"
    style={{
      width: size * 2.2, height: size * 2.2,
      background: groupType === 'team_supervisor'
        ? 'linear-gradient(135deg, #1e5f3a, #2DBF7A)'
        : 'linear-gradient(135deg, #18335E, #2D8FBF)',
    }}
  >
    {groupType === 'team_supervisor' ? <GraduationCap size={size} /> : <Users size={size} />}
  </div>
);

const GroupBadge = ({ groupType, supervisorRole }) =>
  groupType === 'team_supervisor' ? (
    supervisorRole === 'entreprise' ? (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full">
        <GraduationCap size={9} /> External Supervisor
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
        <GraduationCap size={9} /> Supervisor included
      </span>
    )
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
      <Users size={9} /> team only
    </span>
  );

const MembersList = ({ members }) => (
  <div className="flex items-center gap-2">
    <div className="flex -space-x-2">
      {members.slice(0, 4).map((m) => (
        <div
          key={m.id}
          title={m.name}
          className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
          style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}
        >
          {(m.name || '?').charAt(0).toUpperCase()}
        </div>
      ))}
      {members.length > 4 && (
        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-500 text-[9px] font-bold">
          +{members.length - 4}
        </div>
      )}
    </div>
    <span className="text-xs text-gray-400">
      {members.length} participant{members.length > 1 ? 's' : ''}
    </span>
  </div>
);

// ── Message bubble content ─────────────────────────────────────────────────
const MessageContent = ({ msg, isMe }) => {
  if (msg._uploading) {
    return (
      <span className="flex items-center gap-2 opacity-60 text-sm">
        <Loader2 size={13} className="animate-spin" />
        Envoi en cours...
      </span>
    );
  }

  if (msg.file_type === 'image') {
    const url = resolveUrl(msg.content);
    return (
      <img
        src={url}
        alt={msg.file_name || 'image'}
        className="max-w-full rounded-md max-h-48 object-contain cursor-pointer"
        onClick={() => window.open(url, '_blank')}
      />
    );
  }

  if (msg.file_type === 'file') {
    const url = resolveUrl(msg.content);
    const ext = (msg.file_name || '').split('.').pop().toUpperCase();
    const downloadUrl = `http://localhost:3000/api/messages/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(msg.file_name || 'fichier')}`;

    return (
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-2 rounded-lg no-underline"
        style={{
          background: isMe ? 'rgba(255,255,255,0.15)' : '#F3F4F6',
          minWidth: 180,
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: ext === 'PDF' ? '#e53e3e' : ext === 'DOCX' || ext === 'DOC' ? '#2b6cb0' : '#718096' }}
        >
          {ext}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-medium truncate"
            style={{ color: isMe ? '#fff' : '#1F2937', maxWidth: 140 }}
          >
            {msg.file_name || 'Fichier'}
          </span>
          <span
            className="text-xs"
            style={{ color: isMe ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
          >
            Appuyer pour télécharger
          </span>
        </div>
      </a>
    );
  }

  return <span className="text-sm leading-relaxed">{msg.content}</span>;
};

// ── Main page ──────────────────────────────────────────────────────────────
const ChatPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [conversations, setConversations] = useState([]);
  const [messages,      setMessages]      = useState([]);
  const [activeId,      setActiveId]      = useState(null);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [input,         setInput]         = useState('');
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [error,         setError]         = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);
  const pollRef        = useRef(null);

  const activeConv = conversations.find((c) => c.id === activeId) || null;

  // ── Load conversations on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingConvs(true);

    api.fetchConversations()
      .then((data) => {
        if (cancelled) return;
        const convs = data.conversations || [];
        setConversations(convs);
        // ── dispatch unread count to sidebar ──
        dispatchChatUnread(convs);
        if (convs.length > 0) setActiveId(convs[0].id);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Impossible de charger les conversations.');
      })
      .finally(() => { if (!cancelled) setLoadingConvs(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Load messages + poll every 3 s ───────────────────────────────────────
  const loadMessages = useCallback((convId, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingMsgs(true);

    api.fetchMessages(convId)
      .then((data) => {
        setMessages(data.messages || []);
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === convId ? { ...c, unread: 0 } : c
          );
          // ── dispatch updated unread count to sidebar ──
          dispatchChatUnread(updated);
          return updated;
        });
      })
      .catch((err) => {
        if (!silent) setError(err.message || 'Impossible de charger les messages.');
      })
      .finally(() => { if (!silent) setLoadingMsgs(false); });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    pollRef.current = setInterval(() => loadMessages(activeId, true), 3000);
    return () => clearInterval(pollRef.current);
  }, [activeId, loadMessages]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChangePassword = (f) => console.log('pwd change', f);

  const handleSelectConv = (convId) => {
    if (convId === activeId) return;
    clearInterval(pollRef.current);
    setMessages([]);
    setActiveId(convId);
    api.markAsRead(convId).catch(() => {});
    // ── zero out this conv's badge immediately in sidebar ──
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === convId ? { ...c, unread: 0 } : c
      );
      dispatchChatUnread(updated);
      return updated;
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    setInput('');
    try {
      const data = await api.sendMessage(activeId, text);
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, lastMessage: text, time: data.message.created_at }
              : c
          )
        );
      }
    } catch (err) {
      setError(err.message || "Échec de l'envoi.");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── File upload handler ───────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const tempId  = `local-${Date.now()}-${Math.random()}`;
      const tempUrl = URL.createObjectURL(file);

      setMessages((prev) => [...prev, {
        id:          tempId,
        sender_id:   currentUser?.id,
        sender_name: `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
        content:     tempUrl,
        file_name:   file.name,
        file_type:   isImage ? 'image' : 'file',
        is_read:     0,
        created_at:  new Date().toISOString(),
        _uploading:  true,
      }]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conv_id', activeId);

        const r = await fetch(`${SERVER_URL}/api/messages/upload`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body:    formData,
        });

        const data = await r.json();
        if (!r.ok) throw new Error(data.message || "Échec de l'envoi du fichier.");

        setMessages((prev) =>
          prev.map((m) => m.id === tempId ? { ...data.message } : m)
        );

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessage: isImage ? '📷 Image' : `📎 ${file.name}`,
                  time: data.message.created_at,
                }
              : c
          )
        );

      } catch (err) {
        setError(err.message || "Échec de l'envoi du fichier.");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      <StudentSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        {/* ── Header ── */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 overflow-hidden p-2 sm:p-3 lg:p-4">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Internal Messaging</h2>

            {/* Error banner */}
            {error && (
              <div className="mb-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="ml-4 font-bold">✕</button>
              </div>
            )}

            <div className="flex flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

              {/* ── Conversation sidebar ── */}
              <div className="w-64 shrink-0 border-r border-gray-200 flex flex-col">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      placeholder="search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent flex-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {loadingConvs ? (
                    <div className="flex justify-center py-10">
                      <Loader2 size={22} className="animate-spin text-[#2D8FBF]" />
                    </div>
                  ) : filteredConvs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <Users size={32} className="text-gray-200 mb-2" />
                      <p className="text-xs text-gray-400">
                        Aucun groupe disponible.<br />
                        Les groupes sont créés automatiquement lors de l'assignation des projets.
                      </p>
                    </div>
                  ) : (
                    filteredConvs.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConv(conv.id)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50
                          ${activeId === conv.id ? 'border-l-2 border-[#2D8FBF] bg-blue-50/40' : ''}
                          ${conv.unread > 0 ? 'bg-blue-50' : ''}`}
                      >
                        <GroupIcon groupType={conv.group_type} size={15} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-semibold text-gray-900 truncate">{conv.name}</span>
                            <span className="text-xs text-gray-400 shrink-0 ml-1">{formatTime(conv.time)}</span>
                          </div>
                          <GroupBadge groupType={conv.group_type} supervisorRole={conv.supervisorRole} />
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {conv.lastMessage || 'No message'}
                          </p>
                        </div>
                        {conv.unread > 0 && (
                          <span className="shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium mt-1">
                            {conv.unread > 99 ? '99+' : conv.unread}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── Chat panel ── */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {!activeConv ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    {loadingConvs
                      ? <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
                      : (
                        <>
                          <Users size={48} className="mb-3" />
                          <p className="text-sm text-gray-400">Sélectionnez un groupe</p>
                        </>
                      )
                    }
                  </div>
                ) : (
                  <>
                    {/* Conv header */}
                    <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <GroupIcon groupType={activeConv.group_type} size={15} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{activeConv.name}</p>
                          <p className="text-xs text-gray-400">{activeConv.description}</p>
                        </div>
                      </div>
                      <MembersList members={activeConv.members || []} />
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-100 no-scrollbar">
                      {loadingMsgs ? (
                        <div className="flex justify-center h-full items-center">
                          <Loader2 size={24} className="animate-spin text-[#2D8FBF]" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300">
                          <Users size={40} className="mb-2" />
                          <p className="text-xs text-gray-400">Be the first to write in this group!</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = msg.sender_id === currentUser?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              {!isMe && <Avatar name={msg.sender_name} size={30} />}

                              <div className={`flex flex-col max-w-xs ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                  <span className="text-[10px] text-gray-500 font-medium mb-1 ml-1">
                                    {msg.sender_name}
                                  </span>
                                )}
                                <div
                                  className="px-4 py-2.5 rounded-2xl overflow-hidden"
                                  style={isMe
                                    ? { background: 'linear-gradient(135deg, #18335E, #2D8FBF)', color: '#fff', borderBottomRightRadius: 4 }
                                    : { backgroundColor: '#fff', color: '#1F2937', borderBottomLeftRadius: 4, border: '1px solid #E5E7EB' }
                                  }
                                >
                                  <MessageContent msg={msg} isMe={isMe} />
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                                  {isMe && msg.is_read === 1 && (
                                    <CheckCheck size={13} className="text-blue-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input bar */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-white shrink-0">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-gray-400 hover:text-gray-600 shrink-0"
                          title="Envoyer un fichier"
                        >
                          <Paperclip size={18} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        />
                        <input
                          type="text"
                          placeholder={`Write in "${activeConv.name}"...`}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={sending}
                          className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!input.trim() || sending}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-40"
                          style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}
                        >
                          {sending
                            ? <Loader2 size={15} className="animate-spin" />
                            : <Send size={15} />
                          }
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;