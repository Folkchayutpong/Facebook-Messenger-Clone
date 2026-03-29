import FriendChats from "../components/friend_chats";
import RightPanel from "../components/Right_panel";
import Sidebar from "../components/sidebar";
import Chat from "../components/chat";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { socket, connectSocket } from "../socket";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const [friendChats, setFriendChats] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [curUser, setCurUser] = useState(null);
  const [lastMessageMap, setLastMessageMap] = useState({});
  const [socketReady, setSocketReady] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [removedChatId, setRemovedChatId] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (removedChatId) {
      navigate("/messages");
      setRemovedChatId(null);
    }
  }, [removedChatId]);

  // Initialize socket
  useEffect(() => {
    socketRef.current = socket;
    connectSocket();

    const handleConnect = async () => {
      try {
        const res = await axios.get("/api/chats", { withCredentials: true });
        setFriendChats(res.data);
        res.data.forEach((chat) => socket.emit("join_chat", chat._id));
        setSocketReady(true);
      } catch (err) {
        console.error("Error joining chats:", err);
      }
    };

    const handleChatCreated = async ({ chatId }) => {
      socket.emit("join_chat", chatId);
      const res = await axios.get("/api/chats", { withCredentials: true });
      setFriendChats(res.data);
    };

    const handleChatRemoved = ({ chatId }) => {
      setFriendChats((prev) => prev.filter((chat) => chat._id !== chatId));
      setSelectedFriend((current) => {
        if (current?._id === chatId) {
          setRemovedChatId(chatId);
          return null;
        }
        return current;
      });
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setSocketReady(false);
    };

    socket.on("connect", handleConnect);
    socket.on("chat:created", handleChatCreated);
    socket.on("chat:removed", handleChatRemoved);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("chat:created", handleChatCreated);
      socket.off("chat:removed", handleChatRemoved);
      socket.off("disconnect", handleDisconnect);
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
