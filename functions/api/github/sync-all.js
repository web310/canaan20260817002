// Cloudflare Pages Function: POST /api/github/sync-all
export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const { token, owner, repo, branch, data, commitMessage } = body;

    if (!token) {
      return new Response(JSON.stringify({ error: "GitHub Personal Access Token is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const targetOwner = owner || "canaannewlife";
    const targetRepo = repo || "canaan-shin-sheng-church";
    const activeBranch = branch || "main";

    const sermonsList = Array.isArray(data?.sermons) ? data.sermons : [];
    const photosList = Array.isArray(data?.photos) ? data.photos : [];
    const categoriesList = Array.isArray(data?.categories) ? data.categories : [];
    const albumsList = Array.isArray(data?.albums) ? data.albums : [];
    const bulletinData = data?.bulletin || {};
    const prayersList = Array.isArray(data?.prayers) ? data.prayers : [];

    const versionStr = `version-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
    const sermonsTs = `import { Sermon } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - SUNDAY SERMONS MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Authoritative Constant: SERMON_CONTENT_LIST (Strictly top 3 latest sermons)
// Total Sermons: ${sermonsList.length}
// ============================================================================

export const SERMONS_DATA_VERSION = "${versionStr}";

export const SERMON_CONTENT_LIST: Sermon[] = ${JSON.stringify(sermonsList, null, 2)};

// Backwards compatibility aliases
export const INITIAL_SERMONS: Sermon[] = SERMON_CONTENT_LIST;
export const RECENT_SERMONS: Sermon[] = SERMON_CONTENT_LIST;
`;

    const prayersTs = `import { PrayerRequest } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - PRAYER WALL MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Total Active Prayers: ${prayersList.length}
// ============================================================================

export const PRAYERS_DATA_VERSION = "${versionStr}";

export const INITIAL_PRAYERS: PrayerRequest[] = ${JSON.stringify(prayersList, null, 2)};
`;

    const masterBackupJson = JSON.stringify({
      app: "Canaan Shin Sheng Christian Church",
      exportedAt: new Date().toISOString(),
      version: "2.0",
      stats: {
        totalSermons: sermonsList.length,
        totalPhotos: photosList.length,
        totalCategories: categoriesList.length,
        totalAlbums: albumsList.length,
        totalPrayers: prayersList.length,
      },
      data: {
        sermons: sermonsList,
        photos: photosList,
        categories: categoriesList,
        albums: albumsList,
        bulletin: bulletinData,
        prayers: prayersList
      }
    }, null, 2);

    const files = [
      ...(sermonsList.length > 0 ? [{ path: "src/data/sermonsData.ts", content: sermonsTs }] : []),
      ...(prayersList.length > 0 ? [{ path: "src/data/prayersData.ts", content: prayersTs }] : []),
      { path: "public/canaan_master_data.json", content: masterBackupJson }
    ];

    let lastSha = "latest";
    let lastCommitUrl = `https://github.com/${targetOwner}/${targetRepo}`;
    const defaultMsg = commitMessage || `feat(data): sync church data from Cloudflare edge - ${new Date().toISOString().slice(0, 10)}`;

    for (const f of files) {
      let fileSha = undefined;
      try {
        const getRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}/contents/${f.path}?ref=${activeBranch}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "CanaanChurchEdge/1.0"
          }
        });
        if (getRes.ok) {
          const info = await getRes.json();
          fileSha = info.sha;
        }
      } catch {}

      // base64 encode UTF-8
      const encoded = btoa(unescape(encodeURIComponent(f.content)));

      const putRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}/contents/${f.path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "CanaanChurchEdge/1.0"
        },
        body: JSON.stringify({
          message: defaultMsg,
          content: encoded,
          branch: activeBranch,
          sha: fileSha
        })
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        return new Response(JSON.stringify({
          error: errJson.message || `GitHub error (${putRes.status})`
        }), {
          status: putRes.status,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }

      const resData = await putRes.json();
      if (resData.commit?.sha) {
        lastSha = resData.commit.sha.slice(0, 7);
        lastCommitUrl = resData.commit.html_url || lastCommitUrl;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      commitSha: lastSha,
      commitUrl: lastCommitUrl,
      syncedFiles: files.map(f => f.path),
      environment: "Cloudflare Pages Edge"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Failed to sync to GitHub" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
