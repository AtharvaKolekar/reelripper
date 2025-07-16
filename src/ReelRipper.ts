import axios from 'axios';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export class ReelRipper {
  constructor() { }
  private encodedBaseUrl(a: number, b: string): string {
    const BASEURL = 'https://api.instagram.com/graphql/query/';
    const DOC_ID = ["8845758582119845", "10068642573147916"];
    const VARIABLES = [
      {
        "shortcode": b,
        "fetch_tagged_user_count": null,
        "hoisted_comment_id": null,
        "hoisted_reply_id": null
      },
      {
        "id": b,
        "render_surface": "PROFILE"
      }
    ];
    return encodeURI(`${BASEURL}?doc_id=${DOC_ID[a]}&variables=${JSON.stringify(VARIABLES[a])}`);
  }

  private getUsername(instagramUrl: string): string | null {
    try {
      const url = new URL(instagramUrl);
      const parts = url.pathname.split("/").filter(Boolean);

      if (url.hostname.endsWith("instagram.com") && parts.length === 1 && !["p", "reel", "reels", "tv"].includes(parts[0])) {
        return parts[0];
      }
    } catch { }

    return null;
  }

  private getShortcode(instagramUrl: string): string | null {
    try {
      const url = new URL(instagramUrl);
      const parts = url.pathname.split("/").filter(Boolean);

      if (url.hostname.endsWith("instagram.com") && parts.length === 2 && ["p", "reel", "reels", "tv"].includes(parts[0])) {
        return parts[1];
      }
    } catch { }

    return null;
  }

  public async getProfileId(a: string | null): Promise<string | null> {
    if (typeof a !== "string") throw new Error("Username is required");
    const username = this.getUsername(a) || (/^[a-zA-Z0-9._]+$/.test(a) ? a : null);
    const url = `https://www.instagram.com/${username}`;

    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const html = response.data;
        const user_id = html.match(/"profilePage_([0-9]+)"/)[1] || null;
        return user_id;
      }
    } catch (e: any) {
      throw new Error("Profile not found");
    }

    return null;
  }

  public async getMediaURL(src: string): Promise<string[]> {
    if (typeof src !== "string") throw new Error("Media URL is required");
    const shortcode = this.getShortcode(src);
    if (shortcode) {
      const url = this.encodedBaseUrl(0, shortcode);
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          const type = response.data.data.xdt_shortcode_media.__typename;
          switch (type) {
            case "XDTGraphSidecar": {
              const edges = response.data.data.xdt_shortcode_media.edge_sidecar_to_children.edges;
              const urls = edges
                .map((e: any) => {
                  if (e.node.__typename === "XDTGraphVideo")
                    return e.node.video_url;
                  if (e.node.__typename === "XDTGraphImage")
                    return e.node.display_url;
                  return null;
                })
                .filter(Boolean);

              return urls;
            }
            case "XDTGraphVideo":
              return Array(response.data.data.xdt_shortcode_media.video_url);
            case "XDTGraphImage":
              return Array(response.data.data.xdt_shortcode_media.display_url);
          }
        }
      } catch (e: any) {
        throw new Error("Something went wrong! Check if the media URL is valid.");
      }
    }
    throw new Error("Invalid media URL!");
  }
  public async getProfileInfo(a: string): Promise<any> {
    if (typeof a !== "string") throw new Error("Profile URL is required");
    const username = this.getUsername(a) || (/^[a-zA-Z0-9._]+$/.test(a) ? a : null);

    const profile_id = await this.getProfileId(username);
    if (profile_id) {
      const url = this.encodedBaseUrl(1, profile_id);
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          const user = response.data.data.user;

          const json = {
            is_private: user.is_private,
            is_verified: user.is_verified,
            full_name: user.full_name,
            profile_pic: user.hd_profile_pic_url_info.url,
            username: user.username,
            bio: user.biography,
            external_url: user.external_url,
            follower_count: user.follower_count,
            following_count: user.following_count,
            media_count: user.media_count,
            user_id: user.id
          };

          return json;
        }
      } catch (e) {
        throw new Error("Something went wrong!");
      }
    }
    throw new Error("Invalid profile URL!");
  }
  public async getMediaInfo(src: string, comment: boolean = false): Promise<any> {
    if (typeof src !== "string") throw new Error("Media URL is required");
    const shortcode = this.getShortcode(src);
    if (shortcode) {
      const url = this.encodedBaseUrl(0, shortcode);
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          const media = response.data.data.xdt_shortcode_media;

          const comments = comment
            ? [
              ...media.edge_media_to_parent_comment.edges.map((e: any) => ({
                owner: e.node.owner.username,
                text: e.node.text,
                profile_pic: e.node.owner.profile_pic_url,
              })),
              ...media.edge_media_preview_comment.edges.map((e: any) => ({
                owner: e.node.owner.username,
                text: e.node.text,
                profile_pic: e.node.owner.profile_pic_url, // optional chaining for consistency
              })),
            ].filter(
              (item, index, self) =>
                index ===
                self.findIndex(
                  (t) => t.owner === item.owner && t.text === item.text
                )
            )
            : [];


          const json = {
            id: media.id,
            shortcode: media.shortcode,
            type: media.__typename,
            published_at: media.taken_at_timestamp,
            is_video: media.is_video,
            has_audio: (media.has_audio ? true : false),
            comments_count: media.edge_media_preview_comment.count,
            likes_count: media.edge_media_preview_like.count,
            caption: media.edge_media_to_caption.edges[0].node.text,
            accessibility_caption: media.accessibility_caption,
            dimensions: media.dimensions,
            owner: media.owner.username,
            owner_name: media.owner.full_name,
            owner_id: media.owner.id,
            tagged_users: media.edge_media_to_tagged_user.edges.map((e: any) => e.node.user.username),
            owner_profile_pic: media.owner.profile_pic_url,
            display_url: media.display_url,
            location: (media.location ? media.location.name : null),
            is_paid_partnership: media.is_paid_partnership,
            is_ad: media.is_ad,
            sponsors: media.edge_media_to_sponsor_user.edges.map((e: any) => e.node.sponsor.username),
            video_url: (media.is_video ? media.video_url : null),
            video_play_count: (media.is_video ? media.video_play_count : null),
            video_duration: (media.is_video ? media.video_duration : null),
            comments: comments
          }
          return json;
        }
      } catch (e: any) {
        console.log(e);
        throw new Error("Something went wrong! Check if the media URL is valid.");
      }
    }
    throw new Error("Invalid media URL!");
  }

  public async downloadMedia(src: string, basePath: string = "media"): Promise<any> {
    if (typeof src !== "string") throw new Error("Media URL is required");
    const shortcode = this.getShortcode(src);
    if (shortcode) {
      const urls = await this.getMediaURL(src);
      if (urls) {
        const folderPath = path.join(basePath, shortcode);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        for (let i = 0; i < urls.length; i++) {
          const mediaUrl = urls[i];

          try {
            const response = await axios({
              method: 'GET',
              url: mediaUrl,
              responseType: 'stream',
            });


            const contentType = response.headers['content-type'];
            const ext = mime.extension(contentType) || 'bin';
            const filePath = path.join(folderPath, `${i + 1}.${ext}`);

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on('finish', () => {
              console.log(`✅ Media ${i + 1} has been downloaded to ${filePath}`);
            });

            writer.on('error', (err) => {
              console.error('❌ Error writing file:', err.message);
            });
          } catch (err) {
            console.error(`Failed to download ${mediaUrl}:`, err);
          }
        }
      }
    } else {
      throw new Error("Invalid media URL!");
    }
  }
}
