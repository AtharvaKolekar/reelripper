# 🎞️ ReelRipper

**ReelRipper** is an open-source Node.js package for downloading Instagram Reels and extracting metadata (including post details, profile info, and comments).  
It works with public Instagram content and is designed for developers, researchers, and automation workflows.

> 🚨 This package was built after discovering vulnerabilities in Instagram’s public media endpoints.

---

## 📦 Installation

```bash
npm i reelripper
````

---

## 🚀 Features

* 📥 Download Instagram Reels directly by URL
* 📝 Fetch detailed media info (captions, likes, comments, etc.)
* 🔍 Get Instagram profile info (bio, profile pic, followers)
* 🔗 Extract direct media URLs from posts

---

## 🧪 Sample Code (ESM)

```js
// test-esm.mjs (ESM Test)
import { ReelRipper } from 'reelpipper';

const ripper = new ReelRipper();

try {
  // Get profile ID
  const profileId = await ripper.getProfileId("https://www.instagram.com/athxrva.xo");
  console.log("🆔 Profile ID:", profileId);

  // Get direct media URLs from a post
  const mediaURLs = await ripper.getMediaURL("https://www.instagram.com/p/DK7fEw5xnqo/");
  console.log("🎞️ Media URLs:", mediaURLs);

  // Get basic profile info
  const profileInfo = await ripper.getProfileInfo("athxrva.xo");
  console.log("📄 Profile Info:", profileInfo);

  // Get full media info with comments
  const mediaInfo = await ripper.getMediaInfo(
    "https://www.instagram.com/p/DKT1NMiA1Rs/?igsh=cHQ0Y2xuemZ0OTkx",
    true
  );
  console.log("📦 Media Info:", mediaInfo);

  // Download a reel
  await ripper.downloadMedia("https://www.instagram.com/reels/DLnJiIkvDqk/");
  console.log("✅ Reel downloaded successfully.");

} catch (error) {
  console.error("❌ Error:", error.message || error);
}

```

---

## 🛡️ Disclaimer

* This tool is intended for **educational and ethical use only**.
* Do not use this on private or copyrighted content you do not own.
* Instagram may change its public endpoints at any time, which could break the functionality.

---

## 📚 License

MIT License

---

## ✨ Author

Made with ❤️ by [Atharva Kolekar](https://athrva.in)
Feel free to report issues, contribute, or suggest features!