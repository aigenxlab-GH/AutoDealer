"use client";

import { Play } from "lucide-react";

/** Converts various YouTube URL formats to the embed URL. Returns null if not YouTube. */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // youtube.com/shorts/VIDEO_ID
    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.replace("/shorts/", "");
      return `https://www.youtube.com/embed/${id}`;
    }
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    // youtube.com/embed/... (already embed)
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return url;
    }
  } catch {
    // invalid URL
  }
  return null;
}

export function VehicleVideo({ url }: { url: string }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (embedUrl) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">Vehicle Video</h2>
        <div className="relative w-full overflow-hidden rounded-xl border bg-muted"
          style={{ paddingBottom: "56.25%" /* 16:9 */ }}>
          <iframe
            src={`${embedUrl}?rel=0&modestbranding=1`}
            title="Vehicle video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />
        </div>
      </section>
    );
  }

  // Non-YouTube (Instagram Reels, WhatsApp, etc.) — show a button
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Vehicle Video</h2>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Play className="size-5 fill-current" />
        </span>
        <div>
          <p className="font-medium">Watch Vehicle Video</p>
          <p className="text-xs text-muted-foreground truncate max-w-xs">{url}</p>
        </div>
      </a>
    </section>
  );
}
