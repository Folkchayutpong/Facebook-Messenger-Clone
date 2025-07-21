import Avartar from "./avartar";
import { Link } from "react-router-dom";

const ChatCard = () => {
  return (
    <Link>
      to={`/chat/${userId}`}
      <div className="block card bg-base-100 shadow-sm mb-3 p-2 hover:bg-base-200 transition cursor-pointer">
        <div className="flex items-center gap-4">
          <Avartar />
          <div>
            <p className="font-semibold">username</p>
            <p className="text-sm text-gray-500">last message</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChatCard;
