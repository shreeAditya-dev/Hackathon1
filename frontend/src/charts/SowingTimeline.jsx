function SowingTimeline() {
  const timeline = [
    {
      date: "10 Jun",
      title: "Too Early",
      type: "normal",
    },
    {
      date: "14 Jun",
      title: "Watch",
      type: "watch",
    },
    {
      date: "16 Jun",
      title: "Recommended",
      type: "best",
    },
    {
      date: "19 Jun",
      title: "Peak",
      type: "best",
    },
    {
      date: "21 Jun",
      title: "Recommended",
      type: "best",
    },
    {
      date: "26 Jun",
      title: "Late",
      type: "normal",
    },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7">

      <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
        Calendar
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        Sowing Window Timeline
      </h2>

      <div className="relative mt-12">

        <div className="absolute left-0 right-0 top-5 h-px bg-white/10" />

        <div className="relative flex justify-between">

          {timeline.map((item) => (
            <div
              key={item.date}
              className="flex w-20 flex-col items-center text-center"
            >

              <div
                className={`relative z-10 h-10 w-10 rounded-full border-4 border-[#04100c] ${
                  item.type === "best"
                    ? "bg-emerald-400"
                    : item.type === "watch"
                    ? "bg-yellow-400"
                    : "bg-white/20"
                }`}
              />

              <p className="mt-4 text-[10px] font-semibold">
                {item.date}
              </p>

              <p
                className={`mt-1 text-[9px] ${
                  item.type === "best"
                    ? "text-emerald-400"
                    : item.type === "watch"
                    ? "text-yellow-400"
                    : "text-gray-600"
                }`}
              >
                {item.title}
              </p>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default SowingTimeline;