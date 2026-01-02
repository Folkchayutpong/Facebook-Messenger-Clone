import AddFriendPanel from "./AddFriendPanel";
import InboundRequestsPanel from "./InboundRequest";
import FriendListPanel from "./FriendList";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import axios from "axios";

const RightPanel = ({ showAddFriend, setShowAddFriend }) => {
  // 🔹 state รวมกลาง
  const [friends, setFriends] = useState([]);
  const [inbound, setInbound] = useState([]);

  // 🔹 โหลดข้อมูลครั้งแรก
  useEffect(() => {
    axios.get("/api/friend/list", { withCredentials: true }).then((res) => {
      setFriends(res.data.data);
    });

    axios.get("/api/friend/inbound", { withCredentials: true }).then((res) => {
      setInbound(res.data.data);
    });
  }, []);

  // 🔹 socket realtime
  useEffect(() => {
    socket.on("friend:inbound", (user) => {
      setInbound((prev) => [...prev, user]);
    });

    socket.on("friend:accepted", (friend) => {
      setInbound((prev) => prev.filter((u) => u._id !== friend._id));
      setFriends((prev) => [...prev, friend]);
    });

    socket.on("friend:removed", (friendId) => {
      setFriends((prev) => prev.filter((u) => u._id !== friendId));
    });

    return () => {
      socket.off("friend:inbound");
      socket.off("friend:accepted");
      socket.off("friend:removed");
    };
  }, []);

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

          {/* 👇 ส่ง state ลงไป */}
          <InboundRequestsPanel inbound={inbound} setInbound={setInbound}/>
          <FriendListPanel friends={friends} />
        </>
      ) : (
        <AddFriendPanel onClose={() => setShowAddFriend(false)} />
      )}
    </div>
  );
};

export default RightPanel;
