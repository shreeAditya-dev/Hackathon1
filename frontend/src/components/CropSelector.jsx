function CropSelector({ selectedCrop, setSelectedCrop }) {
  // Crops drawn from AgriSentinal's crop_config.json + original UI crops
  const crops = [
    { name: "Bajra", icon: "🌾", duration: "75–90 days", desc: "Short-duration millet" },
    { name: "Maize", icon: "🌽", duration: "80–110 days", desc: "Versatile cereal crop" },
    { name: "Soybean", icon: "🌱", duration: "90–120 days", desc: "High-protein oilseed" },
    { name: "Groundnut", icon: "🥜", duration: "100–130 days", desc: "Underground oilseed" },
    { name: "Cotton", icon: "🌿", duration: "150–180 days", desc: "Long-duration fibre crop" },
    { name: "Rice", icon: "🍚", duration: "120–180 days", desc: "High water-demand staple" },
    { name: "Pulses", icon: "🫘", duration: "60–90 days", desc: "Short-duration legumes" },
    { name: "Moong", icon: "🌱", duration: "60–75 days", desc: "Quick-maturing legume" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

      {crops.map((crop) => {
        const active = selectedCrop === crop.name;

        return (
          <button
            key={crop.name}
            onClick={() => setSelectedCrop(crop.name)}
            className={`rounded-3xl border p-6 text-left transition duration-300 ${
              active
                ? "border-emerald-400 bg-emerald-400/[0.08]"
                : "border-white/10 bg-white/[0.02] hover:-translate-y-1 hover:border-emerald-400/30"
            }`}
          >
            <div className="flex justify-between">
              <span className="text-4xl">
                {crop.icon}
              </span>

              {active && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-xs text-black">
                  ✓
                </span>
              )}
            </div>

            <h3 className="mt-6 font-semibold">
              {crop.name}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {crop.duration}
            </p>

            <p className="mt-1 text-[10px] text-gray-600">
              {crop.desc}
            </p>
          </button>
        );
      })}

    </div>
  );
}

export default CropSelector;