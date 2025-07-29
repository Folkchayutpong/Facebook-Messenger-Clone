import { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chat = ({ user, friendChat, socket }) => {
  const [friendMap, setFriendMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const bottomRef = useRef(null);

  // Fetch messages
  useEffect(() => {
    if (!friendChat?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${friendChat._id}`, {
          withCredentials: true,
        });
        setChatMessages(res.data.messages);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
  }, [friendChat]);

  console.log("chatMessages", chatMessages);

  // Fetch member profiles
  useEffect(() => {
    setChatMessages([]);
    if (!friendChat?._id) return;
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const memberIds = friendChat?.members || [];

        const responses = await Promise.all(
          memberIds.map((id) =>
            axios.get(`/api/user/profile/${id}`, {
              withCredentials: true,
            })
          )
        );

        const memberProfiles = responses.map((res) => res.data);

        const friendOnly = memberProfiles.filter(
          (profile) => profile._id !== user._id
        );

        const map = Object.fromEntries(
          friendOnly.map((profile) => [profile._id, profile.username])
        );

        setFriendMap(map);
      } catch (err) {
        console.error("Error fetching members", err);
      } finally {
        setLoading(false);
      }
    };

    if (friendChat?.members?.length) {
      fetchMembers();
    }
  }, [friendChat, user]);

  // Send message
  const onSubmit = () => {
    if (!newMessage.trim() || !friendChat || !user) return;
    const msg = {
      chatId: friendChat._id,
      content: newMessage,
    };

    console.log("Sending message:", msg);
    socket.emit("send_message", msg);
    setNewMessage("");
  };

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  //auto bottom scroll when messages are updated
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Scroll to bottom when messages are loaded the first time
  useEffect(() => {
    if (chatMessages.length > 0 && !loading) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loading]);

  // Render
  if (loading || Object.keys(friendMap).length === 0) {
    return <div className="flex flex-col h-screen w-2/3">Loading...</div>;
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
                {/* TODO: fetch user avartar */}
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
                {/* TODO: fetch user avartar */}
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
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
