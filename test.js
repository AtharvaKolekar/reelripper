// test-esm.mjs (ESM Test)
import { ReelRipper } from './dist/index.js';

const ripper = new ReelRipper();

try {
  // Get profile ID
  const profileId = await ripper.getProfileId("https://www.instagram.com/googleindia");
  console.log("🆔 Profile ID:", profileId);

  // Get direct media URLs from a post
  const mediaURLs = await ripper.getMediaURL("https://www.instagram.com/p/DK7fEw5xnqo/");
  console.log("🎞️ Media URLs:", mediaURLs);

  // Get basic profile info
  const profileInfo = await ripper.getProfileInfo("netfilx");
  console.log("📄 Profile Info:", profileInfo);

  // Get full media info with comments
  const mediaInfo = await ripper.getMediaInfo(
    "https://www.instagram.com/p/DMAwPzWsdKK/",
    true
  );
  console.log("📦 Media Info:", mediaInfo);

  // Download a reel
  await ripper.downloadMedia("https://www.instagram.com/reel/DL5Q8bAO5Dj/", "path-to-folder"<optional>);
  console.log("✅ Reel downloaded successfully.");

} catch (error) {
  console.error("❌ Error:", error.message || error);
}