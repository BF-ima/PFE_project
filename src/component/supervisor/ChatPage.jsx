// src/component/supervisor/ChatPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { ProfileDropdown } from './HomePage';
import { Facebook, Linkedin, Search, Paperclip, Send, CheckCheck } from 'lucide-react';

// displays user avatar 
const Avatar = ({ name, size = 38, online = false }) => {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full flex items-center justify-center text-white font-semibold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          background: 'linear-gradient(135deg, #18335E, #2D8FBF)',
        }}
      >
        {letter}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white"
          style={{ width: 10, height: 10, backgroundColor: '#4CAF50' }}
        />
      )}
    </div>
  );
};

// Formats file size from bytes to human readable format (B, KB, MB)
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ==================== MOCK DATA ====================
const CONVERSATIONS = [
  {
    id: 1,
    name: 'Student A',
    time: '10:15',
    lastMessage: 'Thanks for the update',
    unread: 1,
    online: true,
    messages: [
      { id: 1, from: 'them', text: 'Hey, did you get the latest project files?', time: '10:00', read: true },
      { id: 2, from: 'me',   text: 'Yes, I reviewed them this morning. Everything looks good!', time: '10:03', read: true },
      { id: 3, from: 'them', text: 'Thanks for the update', time: '10:15', read: true },
    ],
  },
  {
    id: 2,
    name: 'Student B',
    time: '09:15',
    lastMessage: 'tomorrow',
    unread: 1,
    online: false,
    messages: [
      { id: 1, from: 'them', text: 'Are we meeting tomorrow?', time: '09:10', read: true },
      { id: 2, from: 'me',   text: 'tomorrow', time: '09:15', read: false },
    ],
  },
  {
    id: 3,
    name: 'Student C',
    time: '10:16',
    lastMessage: 'We will meet',
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: 'them', text: 'Can we schedule a call?', time: '10:14', read: true },
      { id: 2, from: 'me',   text: 'We will meet', time: '10:16', read: true },
    ],
  },
];

// ==================== MAIN CHAT COMPONENT ====================
const ChatPage = () => {
  const navigate = useNavigate();

  // Mock current user data (Supervisor)
  const [currentUser] = useState({
    id: 1,
    firstName: 'Supervisor',
    lastName: '',
    email: 'supervisor@esi-sba.dz',
    role: 'Supervisor',
  });

  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [activeId, setActiveId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, activeConv?.messages?.length]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleChangePassword = (formData) => {
    console.log('🔐 Password change:', formData);
  };

  const handleSelectConv = (id) => {
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, unread: 0 } : c)
    );
    setActiveId(id);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      from: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text }
          : c
      )
    );
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const fileURL = URL.createObjectURL(file);
      const isImage = file.type.startsWith('image/');
      const fileSize = formatFileSize(file.size);
      let messageText = '';
      let messageAttachment = null;

      if (isImage) {
        messageAttachment = { type: 'image', url: fileURL, name: file.name, size: fileSize };
        messageText = file.name;
      } else {
        messageAttachment = { type: 'file', url: fileURL, name: file.name, size: fileSize, mimeType: file.type };
        messageText = file.name;
      }

      const newMsg = {
        id: Date.now() + Math.random(),
        from: 'me',
        text: messageText,
        attachment: messageAttachment,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: messageText }
            : c
        )
      );
    });
    fileInputRef.current.value = '';
  };

  const filteredConvs = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <SupervisorSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a 
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={handleChangePassword} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-2 sm:p-3 lg:p-4">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Internal Messaging</h2>

            <div className="flex flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

              {/* Left panel: conversation list */}
              <div className="w-64 shrink-0 border-r border-gray-200 flex flex-col">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search conversation"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent flex-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredConvs.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                        activeId === conv.id ? 'border-l-2 border-[#2D8FBF]' : ''
                      } ${conv.unread > 0 ? 'bg-blue-50' : 'bg-white'}`}
                    >
                      <Avatar name={conv.name} size={38} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900 truncate">{conv.name}</span>
                          <span className="text-xs text-gray-400 shrink-0 ml-1">{conv.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#2D8FBF] text-white text-xs flex items-center justify-center font-medium">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel: active chat window */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeConv ? (
                  <>
                    <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3">
                      <Avatar name={activeConv.name} size={36} online={activeConv.online} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{activeConv.name}</p>
                        <p className="text-xs" style={{ color: activeConv.online ? '#4CAF50' : '#9E9E9E' }}>
                          {activeConv.online ? 'Active now' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-100 no-scrollbar">
                      {activeConv.messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${msg.from === 'me' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {msg.from !== 'me' && <Avatar name={activeConv.name} size={36} />}
                          <div className={`flex flex-col ${msg.from === 'me' ? 'items-end' : 'items-start'}`}>
                            <div
                              className="px-4 py-2.5 rounded-2xl max-w-xs text-sm leading-relaxed"
                              style={
                                msg.from === 'me'
                                  ? { background: 'linear-gradient(135deg, #18335E, #2D8FBF)', color: '#fff', borderBottomRightRadius: 4 }
                                  : { backgroundColor: '#FFFFFF', color: '#1F2937', borderBottomLeftRadius: 4, border: '1px solid #E5E7EB' }
                              }
                            >
                              {msg.attachment ? (
                                <div className="flex flex-col gap-1">
                                  {msg.attachment.type === 'image' ? (
                                    <img
                                      src={msg.attachment.url}
                                      alt={msg.attachment.name}
                                      className="max-w-full rounded-md max-h-48 object-contain cursor-pointer"
                                      onClick={() => window.open(msg.attachment.url, '_blank')}
                                    />
                                  ) : (
                                    <a
                                      href={msg.attachment.url}
                                      download={msg.attachment.name}
                                      className="flex items-center gap-2 text-blue-600 hover:underline"
                                    >
                                      <span className="text-sm">{msg.attachment.name}</span>
                                      {msg.attachment.size && (
                                        <span className="text-xs text-gray-400">({msg.attachment.size})</span>
                                      )}
                                    </a>
                                  )}
                                  {msg.text && <p className="mt-1">{msg.text}</p>}
                                </div>
                              ) : (
                                msg.text
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-400">{msg.time}</span>
                              {msg.from === 'me' && msg.read && (
                                <CheckCheck size={14} className="text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="px-4 py-3 border-t border-gray-200 bg-white">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                        <button
                          onClick={handleAttachmentClick}
                          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                        >
                          <Paperclip size={18} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          multiple
                        />
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!input.trim()}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-40"
                          style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    Select a conversation to start chatting
                  </div>
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