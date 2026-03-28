import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import ProfileDropdown from "../ProfileDropDown.jsx";
import { Search, Paperclip, Send, Check, CheckCheck, X } from "lucide-react";

const Messaging = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(1);
  const messagesEndRef = useRef(null);

  // User actuel
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  // Conversations mockées
  const [conversations] = useState([
    {
      id: 1,
      user: {
        id: 2,
        name: "John willson",
        avatar: "J",
        status: "online",
      },
      lastMessage: "Thanks for the update",
      timestamp: "10:15",
      unread: 1,
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Hey, did you get the latest project files?",
          timestamp: "10:00",
          status: "read",
        },
        {
          id: 2,
          sender: "me",
          text: "Yes, I reviewed them this morning. Everything looks good!",
          timestamp: "10:03",
          status: "read",
        },
        {
          id: 3,
          sender: "them",
          text: "Thanks for the update",
          timestamp: "10:15",
          status: "read",
        },
      ],
    },
    {
      id: 2,
      user: {
        id: 3,
        name: "Mary smith",
        avatar: "M",
        status: "offline",
      },
      lastMessage: "tomorrow",
      timestamp: "09:15",
      unread: 1,
      messages: [
        {
          id: 1,
          sender: "them",
          text: "Can we meet tomorrow?",
          timestamp: "09:15",
          status: "read",
        },
      ],
    },
    {
      id: 3,
      user: {
        id: 4,
        name: "Sarah will",
        avatar: "S",
        status: "online",
      },
      lastMessage: "We will meet",
      timestamp: "10:15",
      unread: 0,
      messages: [
        {
          id: 1,
          sender: "them",
          text: "We will meet at 2pm",
          timestamp: "10:15",
          status: "read",
        },
      ],
    },
  ]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
      // Logique d'envoi de message à implémenter
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedConversation]);

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Communicate with your team
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Internal Messaging
              </h1>
            </div>

            {/* Profile Dropdown */}
            <div className="ml-4">
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* Messaging Container */}
        <main className="flex-1 p-6 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex overflow-hidden">
            {/* Left Sidebar - Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search conversation"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedConversation === conv.id ? "bg-blue-50" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#18335E] to-[#2D8FBF] flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {conv.user.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.user.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                        {conv.unread}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#18335E] to-[#2D8FBF] flex items-center justify-center text-white font-semibold">
                        {selectedConv.user.avatar}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {selectedConv.user.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedConv.user.status === "online"
                            ? "Active now"
                            : "Offline"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="space-y-4">
                      {selectedConv.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === "me"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-md px-4 py-2 rounded-2xl ${
                              msg.sender === "me"
                                ? "bg-blue-500 text-white rounded-br-md"
                                : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                msg.sender === "me"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <span
                                className={`text-xs ${
                                  msg.sender === "me"
                                    ? "text-blue-100"
                                    : "text-gray-400"
                                }`}
                              >
                                {msg.timestamp}
                              </span>
                              {msg.sender === "me" && (
                                <CheckCheck
                                  size={12}
                                  className={
                                    msg.status === "read"
                                      ? "text-blue-200"
                                      : "text-blue-300"
                                  }
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-[#1e3a5f] hover:bg-gray-100 rounded-lg transition-colors">
                        <Paperclip size={20} />
                      </button>
                      <div className="flex-1 relative">
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          rows={1}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:bg-white resize-none transition-colors"
                          style={{ minHeight: "48px", maxHeight: "120px" }}
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send size={40} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-2">
                      Choose a contact to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messaging;
