import { useEffect, useState } from "react";
import axios from "axios";

const InboundRequestsPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/friend/inbound", { withCredentials: true })
      .then((res) => setRequests(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (userId) => {
    await axios.post(
      "/api/friend/accept",
      { requesterId: userId },
      { withCredentials: true }
    );

    setRequests((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleDecline = async (userId) => {
    await axios.post(
      "/api/friend/decline",
      { requesterId: userId },
      { withCredentials: true }
    );

    setRequests((prev) => prev.filter((u) => u._id !== userId));
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">Friend Requests</h2>

      {requests.length === 0 && (
        <div className="text-sm text-gray-500">No incoming requests</div>
      )}

      {requests.map((u) => (
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
