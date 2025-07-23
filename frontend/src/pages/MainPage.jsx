import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000", {
  withCredentials: true, // ส่ง cookie token ไปด้วย
  transports: ['websocket', 'polling'], // Add explicit transports
  autoConnect: true
});

function MainPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Debug socket connection
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

useEffect(() => {
  if (!selectedChat?._id) return;
  axios
    .get(`/api/messages/${selectedChat._id}`, { withCredentials: true })
    .then((res) => {
      console.log("Fetched messages:", res.data);
      setMessages(Array.isArray(res.data) ? res.data : res.data.messages);
    })
    .catch((err) => {
      console.error("Error fetching messages:", err);
      setMessages([]);
    });
}, [selectedChat]);



  // Load current user info
  useEffect(() => {
    axios.get("/api/user/profile", { withCredentials: true })
      .then((res) => {
        console.log('✅ Current user loaded:', res.data);
        setCurrentUser(res.data);
      })
      .catch((err) => {
        console.error("Failed to load user profile:", err);
        // Fallback: create a temporary user object for testing
        setCurrentUser({
          _id: "temp_user_id", 
          name: "Current User"
        });
      });
  }, []);

  // Load chats
  useEffect(() => {
    axios.get("/api/chats", { withCredentials: true }).then((res) => {
      setChats(res.data);
    });
  }, []);

  // Select chat room
  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    const res = await axios.get(`/api/messages/${chat._id}/`, { withCredentials: true });
    setMessages(Array.isArray(res.data) ? res.data : []);

    if (socket.connected) {
      socket.emit("join_chat", chat._id);
    } else {
      socket.once("connect", () => {
        socket.emit("join_chat", chat._id);
      });
    }
  };

  // Receive messages
useEffect(() => {
  if (!socket) return;

  socket.on("receive_message", (msg) => {
    console.log("📥 Received message:", msg);
    setMessages((prev) => [...prev, msg]); // แสดงข้อความใน UI
  });

  return () => {
    socket.off("receive_message");
  };
}, [socket]);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return;
    
    const msg = {
      chatId: selectedChat._id,
      content: newMessage,
      messageType: "text",
    };

    console.log('📤 Sending message:', msg);
    
    // Send via socket
    socket.emit("send_message", msg);
    
    // Add to local state with proper sender structure
    const localMessage = {
      ...msg,
      sender: {
        _id: currentUser._id,
        name: currentUser.name
      },
      createdAt: new Date().toISOString(),
      _id: Date.now() // temporary ID
    };
    setNewMessage("");
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-page" style={{ display: "flex", height: "100vh" }}>
      {/* Connection status */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        padding: '5px 10px',
        background: socketConnected ? 'green' : 'red',
        color: 'white',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        {socketConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Left: Chat list */}
      <div style={{ width: "25%", borderRight: "1px solid #ccc", overflowY: "auto"}}>
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleSelectChat(chat)}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: selectedChat?._id === chat._id ? "#9bdb33ff" : "#050000ff",
              borderBottom: "1px solid #ddd"
            }}
          >
            {chat.name}
          </div>
        ))}
      </div>

      {/* Right: Chat messages */}
      <div style={{ width: "75%", display: "flex", flexDirection: "column" }}>
        {selectedChat ? (
          <>
            <div style={{ 
              padding: "10px", 
              borderBottom: "1px solid #ccc", 
              background: "#7ab0e7ff",
              fontWeight: "bold"
            }}>
              {selectedChat.name}
            </div>
            <div style={{ flexGrow: 1, overflowY: "auto", padding: "10px" }}>
              {messages.map((msg, idx) => (
                <div key={msg._id || idx} style={{ 
                  marginBottom: "10px",
                  padding: "8px",
                  background: msg.sender?._id === currentUser?._id ? "#8de24cff" : "#580000ff",
                  borderRadius: "8px",
                  maxWidth: "70%",
                  marginLeft: msg.sender?._id === currentUser?._id ? "auto" : "0",
                  marginRight: msg.sender?._id === currentUser?._id ? "0" : "auto"
                }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                    {msg.sender?.name || "Unknown"}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                style={{ 
                  flexGrow: 1, 
                  marginRight: "10px",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
              <button 
                onClick={sendMessage}
                disabled={!socketConnected}
                style={{
                  padding: "8px 16px",
                  background: socketConnected ? "#007bff" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: socketConnected ? "pointer" : "not-allowed"
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100%",
            color: "#666"
          }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;