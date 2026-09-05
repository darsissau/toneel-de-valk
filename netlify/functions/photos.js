const GOOGLE_PHOTOS_ALBUM_URL = "https://photos.app.goo.gl/uTnLSD8vKqHBRowG6";
const IMAGE_WIDTH = 900;
const IMAGE_HEIGHT = 1200;

export const handler = async () => {
  try {
    const res = await fetch(GOOGLE_PHOTOS_ALBUM_URL, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Failed to fetch album: ${res.status}` }),
      };
    }

    const html = await res.text();

    const tokenRegex = /pw\/(AP1Gcz[A-Za-z0-9_-]+)/g;
    const tokens = new Set();
    let match;
    while ((match = tokenRegex.exec(html)) !== null) {
      tokens.add(match[1]);
    }

    const photos = Array.from(tokens).map(
      (token) =>
        `https://lh3.googleusercontent.com/pw/${token}=w${IMAGE_WIDTH}-h${IMAGE_HEIGHT}-k-no`,
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400",
      },
      body: JSON.stringify({ photos, count: photos.length }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
    };
  }
};
