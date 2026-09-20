export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.split("/")[1];
    else if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "www.youtube-nocookie.com", "youtube-nocookie.com"].includes(host)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v") : /^\/(embed|shorts|live)\//.test(url.pathname) ? url.pathname.split("/")[2] : null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
export function youtubeEmbedUrl(id: string, loop: boolean) {
  const url = new URL(`https://www.youtube.com/embed/${id}`);
  url.searchParams.set("playsinline", "1");
  if (loop) { url.searchParams.set("loop", "1"); url.searchParams.set("playlist", id); }
  return url.toString();
}
