import Avartar from "./avartar";
import { Link } from "react-router-dom";

const ChatCard = ({ name, chatId, lastMessage, curUserName, chatType }) => {
  // console.log(chatType);
  // console.log("chatId: ", chatId, "chatType:", chatType);
  return (
    <Link to={`/messages/${chatId}`}>
      <div className="block card bg-base-100 shadow-sm mb-3 p-2 hover:bg-base-200 transition cursor-pointer">
        <div className="flex items-center gap-4">
          <Avartar />
          <div>
            <p className="font-semibold">
              {chatType === "private" ? name : "GroupName"}
            </p>
            <p className="text-sm text-gray-500">
              {lastMessage?.senderName
                ? lastMessage.senderName === curUserName
                  ? "You: "
                  : `${lastMessage.senderName}: `
                : ""}
              {lastMessage?.lastMessage || ""}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChatCard;
