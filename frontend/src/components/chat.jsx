import { useState, useEffect, useRef } from "react";
import axios from "axios";
import logo from "../assets/select chat icon.png";

const Chat = ({ user, friendChat, socket, socketReady }) => {
  const [friendMap, setFriendMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const bottomRef = useRef(null);
  const previousChatIdRef = useRef(null);

  // Fetch messages and member profiles when chat changes
  useEffect(() => {
    if (!friendChat?._id) {
      setChatMessages([]);
      setFriendMap({});
      setLoading(true);
      previousChatIdRef.current = null;
      return;
    }

    if (previousChatIdRef.current === friendChat._id) {
      return;
    }

    previousChatIdRef.current = friendChat._id;
    setChatMessages([]);
    setLoading(true);

    const fetchData = async () => {
      try {
        const [messagesRes, memberIds] = await Promise.all([
          axios.get(`/api/messages/${friendChat._id}`, {
            withCredentials: true,
          }),
          Promise.resolve(friendChat?.members || []),
        ]);

        setChatMessages(messagesRes.data.messages);

        const memberResponses = await Promise.all(
          memberIds.map((id) =>
            axios.get(`/api/user/profile/${id}`, {
              withCredentials: true,
            })
          )
        );

        const memberProfiles = memberResponses.map((res) => res.data);
        const friendOnly = memberProfiles.filter(
          (profile) => profile._id !== user._id
        );

        const map = Object.fromEntries(
          friendOnly.map((profile) => [profile._id, profile.username])
        );

        setFriendMap(map);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [friendChat?._id, user?._id]);

  const onSubmit = () => {
    if (!newMessage.trim() || !friendChat || !user || !socketReady) return;

    const msg = {
      chatId: friendChat._id,
      content: newMessage,
    };

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      chatId: friendChat._id,
      content: newMessage,
      sender: user._id,
      senderName: user.username,
      messageType: "text",
      sentAt: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, tempMessage]);
    console.log("Sending message:", msg);
    socket.emit("send_message", msg);
    setNewMessage("");
  };

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (msg) => {
      if (msg.chatId === friendChat?._id) {
        setChatMessages((prev) => {
          const filteredPrev = prev.filter(
            (m) =>
              !(
                m._id.toString().startsWith("temp-") &&
                m.content === msg.content &&
                m.sender === msg.sender
              )
          );

          const exists = filteredPrev.some((m) => m._id === msg._id);
          if (exists) return filteredPrev;

          return [...filteredPrev, msg];
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, friendChat?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (chatMessages.length > 0 && !loading) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loading]);

  // Render
  if (loading || Object.keys(friendMap).length === 0) {
    return (
      <div className="flex flex-col h-screen w-2/3 justify-center items-center text-gray-400 text-lg">
        <img src={logo} alt="Select chat" className="w-50 h-auto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-2/3">
      <div className="p-4 font-bold border-b">
        {friendChat.type === "group"
          ? friendChat.name
          : Object.values(friendMap).join(", ")}
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {chatMessages.map((message, index) =>
          message.sender === user._id ? (
            <div key={message._id || `temp-${index}`} className="chat chat-end">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS chat bubble component"
                    src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                  />
                </div>
              </div>
              <div className="chat-header">
                {user.username}
                <time className="text-xs opacity-50">{message.sentAt}</time>
              </div>
              <div className="chat-bubble">{message.content}</div>
            </div>
          ) : (
            <div
              key={message._id || `temp-${index}`}
              className="chat chat-start"
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS chat bubble component"
                    src="https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                  />
                </div>
              </div>
              <div className="chat-header">
                {friendMap[message.sender] || "Unknown"}
                <time className="text-xs opacity-50">{message.sentAt}</time>
              </div>
              <div className="chat-bubble">{message.content}</div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-2 bg-base-100 border-t border-base-300">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input
            type="text"
            placeholder="Type your message..."
            className="input input-bordered w-full"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            disabled={!socketReady}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!socketReady || !newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
