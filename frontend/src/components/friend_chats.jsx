import SearchBar from "./search_bar";
import ChatCard from "./chat_card";
import Avartar from "./avartar";
import logo from "../assets/react.svg";

const FriendChats = ({ friendChats, onSelectFriend, selectedFriend }) => {
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
              name={friend.name}
              isSelected={selectedFriend?._id === friend._id}
              chatId={friend._id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendChats;
