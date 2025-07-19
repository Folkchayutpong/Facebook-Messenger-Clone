import FriendChats from "../components/friend_chats";
import ConfigChat from "../components/config_chat";
import Chat from "../components/chat";

const MainPage = () => {
  return (
    <div className="flex justify-center h-screen">
      <FriendChats />
      <Chat />
      <ConfigChat />
    </div>
  );
};

export default MainPage;
