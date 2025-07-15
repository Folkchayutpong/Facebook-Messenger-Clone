import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000", {
  withCredentials: true, // ส่ง cookie token ไปด้วย
});

function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
 //โหลดแชท
  useEffect(() => {
    axios.get("/api/chats", { withCredentials: true }).then((res) => {
      setChats(res.data); // res.data = รายชื่อแชท
    });
  }, []);

  //ไม่ชัว เลือกห้อง chat
  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    const res = await axios.get(`/api/chats/${chat._id}/messages`, {
      withCredentials: true,
    });
    setMessages(res.data);
    socket.emit("join_chat", chat._id); // เข้าห้อง
  };
  //รับ
   useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (msg.chatId === selectedChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("receive_message");
  }, [selectedChat]);
  // ส่ง
   const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      chatId: selectedChat._id,
      content: newMessage,
      messageType: "text",
    };
    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, { ...msg, sender: "me" }]);
    setNewMessage("");
  };

   return (
    <div className="chat-page" style={{ display: "flex", height: "100vh" }}>
      {/* ซ้าย: รายชื่อห้อง */}
      <div style={{ width: "25%", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleSelectChat(chat)}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: selectedChat?._id === chat._id ? "#eee" : "white",
            }}
          >
            {chat.name}
          </div>
        ))}
      </div>

      {/* ขวา: หน้าสนทนา */}
      <div style={{ width: "75%", display: "flex", flexDirection: "column" }}>
        <div style={{ flexGrow: 1, overflowY: "auto", padding: "10px" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <strong>{msg.sender?.name || "Me"}:</strong> {msg.content}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flexGrow: 1, marginRight: "10px" }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;