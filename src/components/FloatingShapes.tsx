const FloatingShapes = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">

      {/* LEFT BIG DIAMOND */}
      <div
        className="
        absolute
        left-[18%]
        top-[35%]
        animate-pulse
      "
      >
        <div className="relative w-[120px] h-[120px] rotate-45 border border-cyan-400/30">

          <div className="absolute inset-[18px] border border-cyan-400/20" />

          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-400/15" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-cyan-400/15" />
        </div>
      </div>

      {/* CENTER SMALL DIAMOND */}
      <div
        className="
        absolute
        left-[54%]
        top-[28%]
        animate-pulse
      "
      >
        <div className="w-[55px] h-[55px] rotate-45 border border-cyan-400/30" />
      </div>

      {/* RIGHT LOWER BIG */}
      <div
        className="
        absolute
        right-[16%]
        bottom-[20%]
        animate-pulse
      "
      >
        <div className="relative w-[140px] h-[140px] rotate-45 border border-cyan-400/25">

          <div className="absolute inset-[20px] border border-cyan-400/15" />

          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-400/10" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-cyan-400/10" />
        </div>
      </div>

      {/* LARGE GLOW ORB */}
      <div
        className="
        absolute
        left-[42%]
        top-[45%]
        w-[400px]
        h-[400px]
        rounded-full
        bg-cyan-500/10
        blur-[140px]
      "
      />

    </div>
  );
};

export default FloatingShapes;