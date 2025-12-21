import SearchBar from "./search_bar";
import ChatCard from "./chat_card";
import Avartar from "./avartar";
import logo from "../assets/react.svg";
import { useState, useEffect } from "react";
import axios from "axios";

const FriendChats = ({ friendChats, onSelectFriend, curUser }) => {
  const [friendNameMap, setFriendNameMap] = useState({});
  const [lastMessageMap, setLastMessageMap] = useState({});

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
  }, [friendChats]);

  // console.log("friendNames: ", friendNames);
  // console.log("lastChatMessages: ", lastMessageMap["6947987663f5235a2c0db22f"]);

  return (
    <div className="bg-base-300 h-screen w-1/4 flex flex-col text-white">
      <div className="flex items-center p-2">
        <Avartar src={logo} />
        <h1 className="text-xl font-bold p-2">Friend Chats</h1>
      </div>

      <div className="p-2">
        <SearchBar />
      </div>

      <div className="flex-1 overflow-auto p-2">
        {friendChats.map((friend) => (
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
    </div>
  );
};

export default FriendChats;
