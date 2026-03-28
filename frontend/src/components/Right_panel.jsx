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
      console.log("📋 Friends loaded:", res.data.data);
      setFriends(res.data.data);
    });

    axios.get("/api/friend/inbound", { withCredentials: true }).then((res) => {
      console.log("📨 Inbound requests loaded:", res.data.data);
      setInbound(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("✅ Socket connected in RightPanel!");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected in RightPanel!");
    });

    socket.on("friend:inbound", (user) => {
      console.log("📩 Received friend:inbound", user);
      setInbound((prev) => [...prev, user]);
    });

    socket.on("friend:accepted", (friend) => {
      console.log("✅ Received friend:accepted", friend);
      setInbound((prev) => prev.filter((u) => u._id !== friend._id));
      setFriends((prev) => [...prev, friend]);
    });

    socket.on("friend:removed", (friendId) => {
      console.log("🗑️ Received friend:removed", friendId);
      setFriends((prev) => prev.filter((u) => u._id !== friendId));
    });

    return () => {
      socket.off("friend:inbound");
      socket.off("friend:accepted");
      socket.off("friend:removed");
      socket.off("connect");
      socket.off("disconnect");
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
