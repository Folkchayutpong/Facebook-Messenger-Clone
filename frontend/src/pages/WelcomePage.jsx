import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-around items-center h-screen gap-8 px-4">
      {/* left content */}
      <div className="max-w-md">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <h2 className="text-xl mt-2">to our community</h2>
        <p className="mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit...
        </p>
        <button
          className="btn btn-primary mt-4"
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>
      </div>

      <div className="w-px h-[55%] bg-gray-300 opacity-50 rounded-2xl"></div>

      {/* right content */}
      <div className="bg-base-200 rounded-lg shadow-lg p-4 w-full max-w-md h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="chat chat-start ">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS chat bubble component"
                  src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                />
              </div>
            </div>
            <div className="chat-header">
              Obi-Wan Kenobi
              <time className="text-xs opacity-50">12:45</time>
            </div>
            <div className="chat-bubble">You were the Chosen One!</div>
            <div className="chat-footer opacity-50">Delivered</div>
          </div>
          <div className="chat chat-end">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS chat bubble component"
                  src="https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                />
              </div>
            </div>
            <div className="chat-header">
              Anakin
              <time className="text-xs opacity-50">12:46</time>
            </div>
            <div className="chat-bubble">I hate you!</div>
            <div className="chat-footer opacity-50">Seen at 12:46</div>
          </div>
        </div>

        {/* TODO: implement interactive chat box */}
        <div className="flex gap-2">
          <div className="border flex items-center flex-1 rounded-lg indent-2">
            <p className="opacity-50 text-sm">type something....</p>
          </div>
          <div className="btn btn-primary">Send</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
