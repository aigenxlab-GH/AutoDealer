"use client";

export default function VehicleDetailError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-xl font-bold text-destructive">Something went wrong</h1>
      <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground">
        {error.message}
        {error.digest ? `\n\nDigest: ${error.digest}` : ""}
      </pre>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
      >
        Reload
      </button>
    </div>
  );
}
