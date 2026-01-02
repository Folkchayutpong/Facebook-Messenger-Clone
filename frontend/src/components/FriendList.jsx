import axios from "axios";

const FriendListPanel = ({ friends }) => {

   const handleRemove = async (userId) => {
    await axios.post(
      "/api/friend/remove",
      { targetId: userId },
      { withCredentials: true }
    );
  };
  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">Friend List</h2>

      {friends.length === 0 && (
        <div className="text-sm text-gray-500">No friends yet</div>
      )}

      {friends.map((u) => (
        <div
          key={u._id}
          className="flex justify-between items-center bg-base-200 p-2 rounded"
        >
          <span>{u.username}</span>
           <button
            className="btn btn-xs btn-error"
            onClick={() => handleRemove(u._id)}
          >Remove Friend</button>
        </div>
      ))}
    </div>
  );
};

export default FriendListPanel;
