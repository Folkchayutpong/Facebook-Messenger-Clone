import FriendChats from "../components/friend_chats";
import ConfigChat from "../components/config_chat";
import Chat from "../components/chat";
import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

//innit socket
const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: true,
});

const MainPage = () => {
  const [friendChats, setFriendChats] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [curUser, setCurUser] = useState(null);
  const [lastMessageMap, setLastMessageMap] = useState({});

  // Connect websocket to all freindlist that user has
  useEffect(() => {
    socket.on("connect", () => {
      axios.get("/api/chats", { withCredentials: true }).then((res) => {
        res.data.forEach((chat) => {
          socket.emit("join_chat", chat._id);
          console.log(`Joined chat ${chat._id} successfully`);
        });
      });
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  // Listen for new messages and update lastMessageMap
  useEffect(() => {
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
  }, [socket]);

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
      />
      <Chat friendChat={selectedFriend} user={curUser} socket={socket} />
      <ConfigChat />
    </div>
  );
};

export default MainPage;
