// test-esm.mjs (ESM Test)
import { ReelRipper } from './dist/index.js';

const ripper = new ReelRipper();
try {
  // const id = await ripper.getProfileId("https://www.instagram.com/athxrva.xo");
  // console.log(id);

  // const urls = await ripper.getMediaURL("https://www.instagram.com/p/DK7fEw5xnqo/");
  // console.log(urls);

  // const info = await ripper.getProfileInfo("athxrva.xo");
  // console.log(info);

  const mediaInfo = await ripper.getMediaInfo("https://www.instagram.com/p/DKT1NMiA1Rs/?igsh=cHQ0Y2xuemZ0OTkx", comments=true);
  console.log(mediaInfo);

  // await ripper.downloadMedia("https://www.instagram.com/reels/DLnJiIkvDqk/");

} catch (e) {
  console.error(e);
}
