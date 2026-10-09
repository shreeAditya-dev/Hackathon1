function LoadingAnimation() {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center text-center">

      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-emerald-400/20">

        <div className="absolute inset-2 animate-ping rounded-full border border-emerald-400/20" />

        <span className="text-5xl">
          🌧️
        </span>

      </div>

      <p className="mt-8 text-xs uppercase tracking-[0.3em] text-emerald-400">
        Processing
      </p>

      <h2 className="mt-3 text-2xl font-bold">
        Analysing conditions...
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-gray-600">
        Checking rainfall, soil moisture, historical onset and crop
        duration.
      </p>

      <div className="mt-7 flex gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:300ms]" />
      </div>

    </div>
  );
}

export default LoadingAnimation;