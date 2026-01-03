import FriendChats from "../components/friend_chats";
import RightPanel from "../components/Right_panel";
import Sidebar from "../components/sidebar";
import Chat from "../components/chat";
import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../socket";




const MainPage = () => {
  const [friendChats, setFriendChats] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [curUser, setCurUser] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
  socket.connect();

  return () => {
    socket.disconnect();
  };
}, []);

  // Connect websocket to all freindlist that user has
useEffect(() => {
  axios.get("/api/chats", { withCredentials: true }).then((res) => {
    res.data.forEach((chat) => {
      socket.emit("join_chat", chat._id);
      console.log(`Joined chat ${chat._id}`);
    });
  });
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
        selectedFriend={selectedFriend}
      />
      <Chat
        friendChat={selectedFriend}
        // messages={chatMessages}
        user={curUser}
        socket={socket}
      />
      <RightPanel
        showAddFriend={showAddFriend}
        setShowAddFriend={setShowAddFriend}
      />
    </div>
  );
};

export default MainPage;
