import AddFriendPanel from "./AddFriendPanel";
import InboundRequestsPanel from "./InboundRequest";
import FriendListPanel from "./FriendList";
import { useEffect, useState } from "react";
import axios from "axios";

const RightPanel = ({ showAddFriend, setShowAddFriend, socket }) => {
  const [friends, setFriends] = useState([]);
  const [inbound, setInbound] = useState([]);

  useEffect(() => {
    axios.get("/api/friend/list", { withCredentials: true }).then((res) => {
      setFriends(res.data.data);
    });

    axios.get("/api/friend/inbound", { withCredentials: true }).then((res) => {
      setInbound(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onInbound = (user) => setInbound((prev) => [...prev, user]);
    const onAccepted = (friend) => {
      setInbound((prev) => prev.filter((u) => u._id !== friend._id));
      setFriends((prev) => [...prev, friend]);
    };
    const onRemoved = (friendId) => {
      setFriends((prev) => prev.filter((u) => u._id !== friendId));
    };

    socket.on("connect");
    socket.on("disconnect");
    socket.on("friend:inbound", onInbound);
    socket.on("friend:accepted", onAccepted);
    socket.on("friend:removed", onRemoved);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("friend:inbound", onInbound);
      socket.off("friend:accepted", onAccepted);
      socket.off("friend:removed", onRemoved);
    };
  }, [socket]);

  return (
    <div className="w-1/4 bg-base-300 h-screen p-5 space-y-4">
      {!showAddFriend ? (
        <>
          <button
            className="btn btn-primary w-full"
            onClick={() => setShowAddFriend(true)}
          >
            ➕ Add Friend
          </button>

          <InboundRequestsPanel
            inbound={inbound}
            setInbound={setInbound}
            socket={socket}
          />
          <FriendListPanel friends={friends} socket={socket} />
        </>
      ) : (
        <AddFriendPanel
          onClose={() => setShowAddFriend(false)}
          socket={socket}
        />
      )}
    </div>
  );
};

export default RightPanel;
