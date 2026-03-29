import FriendChats from "../components/friend_chats";
import RightPanel from "../components/Right_panel";
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


  useEffect(() => {
    axios
      .get("/api/user/profile", { withCredentials: true })
      .then((res) => {
        console.log("user loaded", res.data);
        setCurUser(res.data);
      })
      .catch(() => {
        console.log("not authenticated");
        setCurUser(null);
      });
  }, []);


  useEffect(() => {
    if (!curUser) return;

    socketRef.current = socket;

    const handleConnect = () => {
      console.log("socket connected:", socket.id);
      setSocketReady(true);
    };

    const handleDisconnect = () => {
      console.log("socket disconnected");
      setSocketReady(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    connectSocket();

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [curUser]);


  useEffect(() => {
    if (!curUser) return;

    axios
      .get("/api/chats", { withCredentials: true })
      .then((res) => {
        console.log("chats loaded", res.data);
        setFriendChats(res.data);
      })
      .catch((err) => {
        console.error("load chats error", err);
      });
  }, [curUser]);


  useEffect(() => {
    if (!socketReady) return;
    if (friendChats.length === 0) return;

    friendChats.forEach((chat) => {
      console.log("joining chat:", chat._id);
      socket.emit("join_chat", chat._id);
    });
  }, [socketReady, friendChats]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleChatCreated = async ({ chatId }) => {
      console.log("🆕 chat created:", chatId);
      s.emit("join_chat", chatId);

      const res = await axios.get("/api/chats", {
        withCredentials: true,
      });
      setFriendChats(res.data);
    };

    const handleChatRemoved = ({ chatId }) => {
      console.log("🗑 chat removed:", chatId);

      setFriendChats((prev) => prev.filter((chat) => chat._id !== chatId));

      setSelectedFriend((current) => {
        if (current?._id === chatId) {
          setRemovedChatId(chatId);
          return null;
        }
        return current;
      });
    };

    s.on("chat:created", handleChatCreated);
    s.on("chat:removed", handleChatRemoved);

    return () => {
      s.off("chat:created", handleChatCreated);
      s.off("chat:removed", handleChatRemoved);
    };
  }, [socketReady]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleReceiveMessage = (message) => {
      setLastMessageMap((prev) => ({
        ...prev,
        [message.chatId]: {
          lastMessage: message.content,
          senderName: message.senderName,
        },
      }));
    };

    s.on("receive_message", handleReceiveMessage);

    return () => {
      s.off("receive_message", handleReceiveMessage);
    };
  }, []);

  const handleSelectFriend = (chat) => {
    setSelectedFriend(chat);
  };

  return (
    <div className="flex h-screen w-full">
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
