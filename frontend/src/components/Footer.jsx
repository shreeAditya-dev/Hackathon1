function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030b08]">

      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="flex flex-col justify-between gap-8 md:flex-row">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-black">
                🌱
              </div>

              <span className="text-lg font-bold">
                AgriSentinal
              </span>

            </div>

            <p className="mt-4 max-w-sm text-xs leading-6 text-gray-600">
              Sowing-window intelligence for smarter
              Kharif farming decisions.
            </p>
          </div>

          <div className="flex gap-12 text-sm">

            <div>
              <p className="font-semibold text-white">
                Platform
              </p>

              <div className="mt-4 space-y-3 text-gray-600">
                <p>Dashboard</p>
                <p>Sowing Analysis</p>
                <p>History</p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-white">
                Information
              </p>

              <div className="mt-4 space-y-3 text-gray-600">
                <p>About</p>
                <p>How it works</p>
                <p>Data Sources</p>
              </div>
            </div>

          </div>

        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-xs text-gray-700">
          © 2026 AgriSentinal · Built for Codefiesta 5.0
        </div>

      </div>

    </footer>
  );
}

export default Footer;