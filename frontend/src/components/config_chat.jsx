import Avatar from "./avartar";

const ConfigChat = () => {
  return (
    <div className="w-1/4 bg-base-300 h-screen flex justify-center p-10">
      <div className="flex flex-col items-center space-y-5">
        <Avatar width={30} />

        <span className="font-bold text-2xl">Username</span>

        <div className="flex flex-col items-center space-y-2">
          <span className="font-semibold text-xl">Setting</span>
          <span>Config Chat</span>
          <span>Pictures</span>
          <span>Files</span>
        </div>
      </div>
    </div>
  );
};

export default ConfigChat;
