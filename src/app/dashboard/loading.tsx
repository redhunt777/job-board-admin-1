export default function DashboardLoading() {
  return (
    <div className="transition-all duration-50 min-h-full px-3">
      <div className="max-w-8xl mx-auto px-2 py-8">
        <div className="h-10 w-48 bg-neutral-200 rounded mb-6 animate-pulse" />
        {/* Stat Cards Loader */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm flex flex-col justify-between p-6 min-w-0 h-44 animate-pulse"
            >
              {/* Top row: label, value, icon */}
              <div className="flex items-center justify-between w-full mb-6">
                <div>
                  <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
                  <div className="h-8 w-20 bg-neutral-200 rounded" />
                </div>
                <div className="h-14 w-14 bg-neutral-100 rounded-xl" />
              </div>
              {/* Change info at the bottom */}
              <div className="flex items-center gap-2 mt-auto pt-2">
                <div className="h-4 w-16 bg-neutral-200 rounded" />
                <div className="h-4 w-24 bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
        {/* You can add more skeleton loaders here for other dashboard sections if needed */}
      </div>
    </div>
  );
}