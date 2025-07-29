const Avartar = ({
  width,
  src = "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
}) => {
  const widthClass =
    {
      8: "w-8",
      10: "w-10",
      12: "w-12",
      16: "w-16",
      18: "w-18",
      20: "w-20",
      22: "w-22",
      24: "w-24",
      26: "w-26",
      28: "w-28",
      30: "w-30",
    }[width] || "w-15";

  return (
    <div className="avatar">
      <div className={`${widthClass} rounded-full`}>
        <img src={src} />
      </div>
    </div>
  );
};

export default Avartar;
