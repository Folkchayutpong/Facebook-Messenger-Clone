import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const SettingPage = ({ user }) => {
  const [avatar, setAvatar] = useState(user?.avatar);
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null); // เก็บไฟล์จริงสำหรับส่งไป backend
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
  if (!avatar) { // หรือเช็คว่า avatar ว่างหรือยัง
    setAvatar(user?.avatar);
  }
  setUsername(user?.username);
  setEmail(user?.email);
}, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result); // แสดง preview เป็น data URL
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      let avatarUrl = avatar;

      // ถ้าเลือกไฟล์ใหม่ ให้ส่งไฟล์ไป backend เพื่ออัพโหลดเก็บจริง แล้วได้ URL มา
      if (file) {
        const formData = new FormData();
        formData.append("avatar", file);

        // สมมติ backend มี endpoint อัพโหลดไฟล์รูปภาพ
        const uploadRes = await axios.post("/api/user/upload-avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        avatarUrl = uploadRes.data.avatarUrl; // ได้ URL รูปจาก backend
      }

      // อัพเดตข้อมูลโปรไฟล์ (username, email, avatarUrl)
      await axios.put(
        "/api/user/profile",
        {
          username,
          email,
          avatar: avatarUrl,
        },
        { withCredentials: true }
      );

      setMessage("Profile updated successfully!");
      setFile(null); // เคลียร์ไฟล์เก็บไว้
      console.log("avatarUrl from backend:", avatarUrl);
      setAvatar(avatarUrl);
    } catch (error) {
      console.error(error);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center h-screen bg-base-300 text-white">
      <div className="w-1/3 bg-base-100 shadow-md rounded-xl p-6 mt-10">
        <div className="flex flex-col items-center space-y-4">
          {/* รูปโปรไฟล์ */}
          <div
            className="avatar cursor-pointer"
            onClick={handleAvatarClick}
            title="Click to change avatar"
          >
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={avatar} alt="Avatar" />
            </div>
          </div>

          {/* input type file ซ่อน */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* ฟอร์ม username */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-black">Username</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* ฟอร์ม email */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-black">Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* ข้อความสถานะ */}
          {message && <p className="text-center mt-2">{message}</p>}

          {/* ปุ่มบันทึก */}
          <div className="mt-4 flex gap-4">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
