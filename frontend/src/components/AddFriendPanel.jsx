import { useState, useEffect } from "react";
import axios from "axios";

const AddFriendPanel = ({ onClose }) => {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!keyword.trim()) {
      setUsers([]);
      return;
    }

    const delay = setTimeout(() => {
      axios
        .get(`/api/user/search?username=${keyword}`, { withCredentials: true })
        .then((res) => setUsers(res.data));
    }, 300);

    return () => clearTimeout(delay);
  }, [keyword]);

  const handleAddFriend = async (userId) => {
    await axios.post("/api/friend/add", { targetId: userId }, { withCredentials: true });

    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, friendStatus: "pending" } : u
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Add Friend</span>
        <button onClick={onClose}>✖</button>
      </div>

      <input
        type="text"
        className="input input-bordered w-full"
        placeholder="Search username..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex justify-between items-center bg-base-200 p-2 rounded"
          >
            <span>{u.username}</span>

            {u.friendStatus === "none" && (
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleAddFriend(u._id)}
              >
                Add
              </button>
            )}

            {u.friendStatus === "pending" && (
              <span className="text-warning text-sm">Friend request sent</span>
            )}

            {u.friendStatus === "friend" && (
              <span className="text-success text-sm">Already friend</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddFriendPanel;
