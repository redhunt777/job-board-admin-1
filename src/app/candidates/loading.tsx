export default function CandidatesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-neutral-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-neutral-200 rounded w-24"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-neutral-200 rounded w-20"></div>
              <div className="h-6 bg-neutral-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 