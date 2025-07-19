import SearchBar from "./search_bar";
import ChatCard from "./chat_card";

const FriendChats = () => {
  return (
    <div className="bg-base-300 h-screen w-1/4 flex flex-col text-white">
      <h1 className="text-xl font-bold p-2">Friend Chats</h1>
      <div className="p-2">
        <SearchBar />
      </div>
      <div className="flex-1 overflow-auto p-2">
        <ChatCard />
        <ChatCard />
        <ChatCard />
        <ChatCard />
        <ChatCard />
        <ChatCard />
        <ChatCard />
        <ChatCard />
        <ChatCard />
        <ChatCard />
      </div>
    </div>
  );
};

export default FriendChats;
