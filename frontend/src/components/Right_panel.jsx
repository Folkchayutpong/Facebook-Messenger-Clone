import AddFriendPanel from "./AddFriendPanel";

const RightPanel = ({ showAddFriend, setShowAddFriend }) => {
  return (
    <div className="w-1/4 bg-base-300 h-screen p-5">
      {!showAddFriend ? (
        <button
          className="btn btn-primary w-full"
          onClick={() => setShowAddFriend(true)}
        >
          ➕ Add Friend
        </button>
      ) : (
        <AddFriendPanel onClose={() => setShowAddFriend(false)} />
      )}
    </div>
  );
};

export default RightPanel;
