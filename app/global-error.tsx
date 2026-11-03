"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-xs text-slate-400">An unexpected application error occurred.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
