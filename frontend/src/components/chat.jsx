import Avartar from "./avartar";
const Chat = () => {
  return (
    <div className="w-3/4 bg-base-200 h-screen flex flex-col">
      {/* Header */}
      <div className="bg-base-100 h-10 p-2">Friend Name</div>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Obione */}
        <div className="chat chat-start">
          <div className="chat-image">
            <Avartar src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp" />
          </div>
          <div className="chat-header">
            Obi-Wan Kenobi
            <time className="text-xs opacity-50">12:45</time>
          </div>
          <div className="chat-bubble">You were the Chosen One!</div>
          <div className="chat-footer opacity-50">Delivered</div>
        </div>
        {/* Anakin */}
        <div className="chat chat-end">
          <div className="chat-image">
            <Avartar src="https://img.daisyui.com/images/profile/demo/anakeen@192.webp" />
          </div>
          <div className="chat-header">
            Anakin
            <time className="text-xs opacity-50">12:46</time>
          </div>
          <div className="chat-bubble">I hate you!</div>
          <div className="chat-footer opacity-50">Seen at 12:46</div>
        </div>
        {/* Obione */}
        <div className="chat chat-start">
          <div className="chat-image">
            <Avartar src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp" />
          </div>
          <div className="chat-bubble">
            It was said that you would, destroy the Sith, not join them.
          </div>
        </div>
        <div className="chat chat-start">
          <div className="chat-image">
            <Avartar src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp" />
          </div>
          <div className="chat-bubble">
            It was you who would bring balance to the Force
          </div>
        </div>
        <div className="chat chat-start">
          <div className="chat-image">
            <Avartar src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp" />
          </div>
          <div className="chat-bubble">Not leave it in Darkness</div>
        </div>
      </div>
      {/* Message box */}
      <div className="p-2 bg-base-100 border-t border-base-300">
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="input input-bordered w-full"
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
