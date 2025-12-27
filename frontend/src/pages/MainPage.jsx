import FriendChats from "../components/friend_chats";
import ConfigChat from "../components/config_chat";
import Chat from "../components/chat";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const MainPage = () => {
  const [friendChats, setFriendChats] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [curUser, setCurUser] = useState(null);
  const [lastMessageMap, setLastMessageMap] = useState({});
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", async () => {
      console.log("Socket connected");

      try {
        // Fetch chats
        const res = await axios.get("/api/chats", { withCredentials: true });

        // Join all chats
        res.data.forEach((chat) => {
          socket.emit("join_chat", chat._id);
        });

        setSocketReady(true);
        console.log("Socket ready and joined all chats");
      } catch (err) {
        console.error("Error joining chats:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketReady(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  // Listen for new messages and update lastMessageMap
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      console.log("Received message in MainPage:", message);

      // Update the last message for this chat
      setLastMessageMap((prev) => ({
        ...prev,
        [message.chatId]: {
          lastMessage: message.content,
          senderName: message.senderName,
        },
      }));
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  // Load friend chats
  useEffect(() => {
    axios.get("/api/chats", { withCredentials: true }).then((res) => {
      setFriendChats(res.data);
    });
  }, []);

  // Load user info
  useEffect(() => {
    axios.get("/api/user/profile", { withCredentials: true }).then((res) => {
      setCurUser(res.data);
    });
  }, []);

  // Handle chat selection
  const handleSelectFriend = async (chat) => {
    setSelectedFriend(chat);
  };

  return (
    <div className="flex justify-center h-screen">
      <FriendChats
        friendChats={friendChats}
        onSelectFriend={handleSelectFriend}
        curUser={curUser}
        lastMessageMap={lastMessageMap}
        setLastMessageMap={setLastMessageMap}
        socket={socketRef.current}
      />
      <Chat
        friendChat={selectedFriend}
        user={curUser}
        socket={socketRef.current}
        socketReady={socketReady}
      />
      <ConfigChat />
    </div>
  );
};

export default MainPage;
