"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="wordmark text-4xl">Spicy</h1>
        <p className="mt-4 text-sm text-neutral-500">Something broke on this screen. Your work is not lost on the server.</p>
        <button onClick={reset} className="mt-5 rounded-xl bg-black px-5 py-2 text-sm text-white">Try again</button>
      </div>
    </main>
  );
}