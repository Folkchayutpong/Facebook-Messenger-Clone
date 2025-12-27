import SearchBar from "./search_bar";
import ChatCard from "./chat_card";
import Avartar from "./avartar";
import logo from "../assets/react.svg";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FriendChats = ({
  friendChats,
  onSelectFriend,
  curUser,
  lastMessageMap,
  setLastMessageMap,
  socket,
}) => {
  const [friendNameMap, setFriendNameMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Fetch friend names
  useEffect(() => {
    if (!friendChats?.length || !curUser?._id) return;

    const fetchFriends = async () => {
      try {
        const entries = await Promise.all(
          friendChats.map(async (chat) => {
            const friendId = chat.members.find((id) => id !== curUser._id);

            if (!friendId) return [chat._id, ""];

            const res = await axios.get(`/api/user/profile/${friendId}`, {
              withCredentials: true,
            });

            return [chat._id, res.data.username];
          })
        );

        setFriendNameMap(Object.fromEntries(entries));
      } catch (err) {
        console.error(err);
      }
    };

    fetchFriends();
  }, [friendChats, curUser]);

  // Fetch last messages initially
  useEffect(() => {
    if (!friendChats?.length) return;

    const fetchLastMessages = async () => {
      try {
        const entries = await Promise.all(
          friendChats.map(async (chat) => {
            const res = await axios.get(`/api/messages/${chat._id}`, {
              withCredentials: true,
            });

            const lastMessage =
              {
                lastMessage: res.data.messages?.at(-1)?.content,
                senderName: res.data.messages?.at(-1)?.senderName,
              } || null;

            return [chat._id, lastMessage];
          })
        );

        setLastMessageMap(Object.fromEntries(entries));
      } catch (err) {
        console.error("fetchLastMessages error:", err);
      }
    };

    fetchLastMessages();
  }, [friendChats, setLastMessageMap]);

  const filteredChats = friendChats.filter((chat) => {
    const friendName = friendNameMap[chat._id] || "";
    return friendName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  function handleLogout() {
    localStorage.removeItem("token");

    if (socket) {
      socket.disconnect();
    }

    navigate("/login");
  }

  return (
    <div className="bg-base-300 h-screen w-1/4 flex flex-col text-white">
      <div className="flex items-center p-2">
        <Avartar src={logo} />
        <h1 className="text-xl font-bold p-2">Friend Chats</h1>
      </div>

      <div className="p-2">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex-1 overflow-auto p-2">
        {filteredChats.map((friend) => (
          <div key={friend._id} onClick={() => onSelectFriend(friend)}>
            <ChatCard
              name={friendNameMap[friend._id] || "Loading..."}
              chatId={friend._id}
              lastMessage={lastMessageMap[friend._id] || ""}
              curUserName={curUser?.username}
              chatType={friend.type}
            />
          </div>
        ))}
      </div>

      <button className="btn btn-error m-4" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default FriendChats;
