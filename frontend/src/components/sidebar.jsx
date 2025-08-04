import { useNavigate } from "react-router-dom";

const SettingButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/setting")}
      className="btn btn-circle text-3xl"
      title="Settings"
    >
      ⚙️
    </button>
  );
};

export default SettingButton;
