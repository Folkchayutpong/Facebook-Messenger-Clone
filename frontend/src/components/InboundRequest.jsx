import axios from "axios";

const InboundRequestsPanel = ({ inbound, setInbound }) => {
  const handleAccept = async (userId) => {
    await axios.post(
      "/api/friend/accept",
      { requesterId: userId },
      { withCredentials: true }
    );
    
  };

  const handleDecline = async (userId) => {
    await axios.post(
      "/api/friend/decline",
      { requesterId: userId },
      { withCredentials: true }
    );
     setInbound((prev) => prev.filter((u) => u._id !== userId));
  };

  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">Friend Requests</h2>

      {inbound.length === 0 && (
        <div className="text-sm text-gray-500">No incoming requests</div>
      )}

      {inbound.map((u) => (
        <div
          key={u._id}
          className="flex justify-between items-center bg-base-200 p-2 rounded"
        >
          <span>{u.username}</span>

          <div className="space-x-2">
            <button
              className="btn btn-xs btn-success"
              onClick={() => handleAccept(u._id)}
            >
              Accept
            </button>

            <button
              className="btn btn-xs btn-error"
              onClick={() => handleDecline(u._id)}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InboundRequestsPanel;
