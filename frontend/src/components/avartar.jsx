const Avartar = ({
  width = 12,
  src = "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
}) => {
  return (
    <div className="avatar">
      <div className={`w-${width} rounded-full `}>
        <img src={src} />
      </div>
    </div>
  );
};

export default Avartar;
