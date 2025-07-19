import Avartar from "./avartar";

const ChatCard = () => {
  return (
    <div className="flex-1 overflow-auto p-2">
      <div className="card bg-base-100 shadow-sm mb-1 p-2">
        <div className="flex items-center gap-4">
          <Avartar />
          <div>
            <p className="font-semibold">username</p>
            <p className="text-sm text-gray-500">last message</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
