"use client";
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
