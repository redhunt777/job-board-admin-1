export default function LoginLoading() {
  return (
    <div className="animate-pulse">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-5 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-10 bg-neutral-200 rounded w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-10 bg-neutral-200 rounded w-full"></div>
          </div>
          <div className="h-10 bg-neutral-200 rounded w-full"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
} 