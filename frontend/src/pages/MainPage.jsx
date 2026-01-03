import FriendChats from "../components/friend_chats";
import RightPanel from "../components/Right_panel";
import Sidebar from "../components/sidebar";
import Chat from "../components/chat";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { socket } from "../socket";

const MainPage = () => {
  const [friendChats, setFriendChats] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [curUser, setCurUser] = useState(null);
  const [lastMessageMap, setLastMessageMap] = useState({});
  const [socketReady, setSocketReady] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const socketRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    socketRef.current = socket;

    socket.on("connect", async () => {
      console.log("✅ Socket connected!");
      try {
        const res = await axios.get("/api/chats", { withCredentials: true });
        res.data.forEach((chat) => socket.emit("join_chat", chat._id));
        setSocketReady(true);
      } catch (err) {
        console.error("Error joining chats:", err);
      }
    });

    // ✅ ฟัง chat:created
    socket.on("chat:created", async ({ chatId }) => {
      console.log("💬 New chat created:", chatId);
      socket.emit("join_chat", chatId);

      // Refresh chat list
      const res = await axios.get("/api/chats", { withCredentials: true });
      setFriendChats(res.data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setSocketReady(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat:created");
    };
  }, []);

  // Listen for new messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleReceiveMessage = (message) => {
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
      <Sidebar />
      <FriendChats
        friendChats={friendChats}
        onSelectFriend={handleSelectFriend}
        curUser={curUser}
        lastMessageMap={lastMessageMap}
        setLastMessageMap={setLastMessageMap}
        socket={socketRef.current}
        setFriendChats={setFriendChats}
      />
      <Chat
        friendChat={selectedFriend}
        user={curUser}
        socket={socketRef.current}
        socketReady={socketReady}
      />
      <RightPanel
        showAddFriend={showAddFriend}
        setShowAddFriend={setShowAddFriend}
        socket={socketRef.current}
      />
    </div>
  );
};

export default MainPage;
