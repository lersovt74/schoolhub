// state/core.jsx — shared client state (session + local data store).

const SH_USER_KEY = "schoolhub_user_v1";
const SH_DATA_KEY = "schoolhub_data_v1";
const SH_ADMIN_LOGIN = {
  grade: "9",
  className: "9",
  number: "9",
  name: "관관리자",
};

function shClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function shIsObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function shSafeParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function shEntityKey(item) {
  if (!shIsObject(item)) return "";
  return String(item.id || item.code || item.key || item.slug || "").trim();
}

function shMergeDeletedMaps(existing, incoming) {
  const next = shIsObject(existing) ? shClone(existing) : {};
  if (!shIsObject(incoming)) return next;
  for (const [bucket, values] of Object.entries(incoming)) {
    if (!shIsObject(values)) continue;
    next[bucket] = { ...(next[bucket] || {}), ...values };
  }
  return next;
}

function shDeletedFor(deletedMap, fieldName) {
  if (!fieldName || !shIsObject(deletedMap)) return {};
  return shIsObject(deletedMap[fieldName]) ? deletedMap[fieldName] : {};
}

function shComputeDeletedMap(before, after) {
  const deleted = {};
  if (!shIsObject(before) || !shIsObject(after)) return deleted;
  for (const key of Object.keys(before)) {
    if (!Array.isArray(before[key]) || !Array.isArray(after[key])) continue;
    const beforeIds = before[key].map(shEntityKey).filter(Boolean);
    if (beforeIds.length === 0) continue;
    const afterIds = new Set(after[key].map(shEntityKey).filter(Boolean));
    beforeIds.forEach((id) => {
      if (!afterIds.has(id)) {
        if (!deleted[key]) deleted[key] = {};
        deleted[key][id] = Date.now();
      }
    });
  }
  return deleted;
}

function shMergeValue(existing, incoming, fieldName = "", deletedMap = {}) {
  if (incoming == null) return existing;
  if (existing == null) return incoming;
  if (Array.isArray(existing) || Array.isArray(incoming)) return shMergeArray(existing, incoming, fieldName, deletedMap);
  if (typeof existing === "number" && typeof incoming === "number") {
    if (fieldName === "likes" || fieldName === "recent" || fieldName === "__updatedAt") {
      return Math.max(existing, incoming);
    }
    return incoming;
  }
  if (shIsObject(existing) && shIsObject(incoming)) {
    const next = { ...existing };
    for (const key of Object.keys(incoming)) {
      next[key] = shMergeValue(existing[key], incoming[key], key, deletedMap);
    }
    return next;
  }
  return incoming;
}

function shMergeArray(existing, incoming, fieldName = "", deletedMap = {}) {
  if (!Array.isArray(existing)) return Array.isArray(incoming) ? incoming : existing;
  if (!Array.isArray(incoming)) return existing;
  const deleted = shDeletedFor(deletedMap, fieldName);
  const alive = (item) => {
    const key = shEntityKey(item);
    return !(key && deleted[key]);
  };

  // An empty side is never a deletion signal — real deletions come through __deleted.
  if (existing.length === 0) return incoming.filter(alive);
  if (incoming.length === 0) return existing.filter(alive);

  const keyable = (arr) => arr.every((item) => !!shEntityKey(item));
  // Positional arrays (timetable rows, plain strings…) are replaced, not unioned.
  if (!keyable(existing) || !keyable(incoming)) return incoming.filter(alive);

  const map = new Map();
  existing.forEach((item) => {
    if (alive(item)) map.set(shEntityKey(item), item);
  });
  incoming.forEach((item) => {
    if (!alive(item)) return;
    const key = shEntityKey(item);
    map.set(key, shMergeValue(map.get(key), item, fieldName, deletedMap));
  });
  const out = [];
  const seen = new Set();
  const push = (item) => {
    const key = shEntityKey(item);
    if (seen.has(key) || deleted[key]) return;
    out.push(map.get(key));
    seen.add(key);
  };
  incoming.forEach(push);
  existing.forEach(push);
  return out;
}

function shMergeState(existing, incoming) {
  if (!shIsObject(existing)) return incoming;
  if (!shIsObject(incoming)) return existing;
  const deletedMap = shMergeDeletedMaps(existing.__deleted, incoming.__deleted);
  const merged = shMergeValue(existing, incoming, "", deletedMap);
  if (Object.keys(deletedMap).length > 0) merged.__deleted = deletedMap;
  return merged;
}

function shBackendCfg() {
  const cfg = window.SH_BACKEND_CONFIG || {};
  if (!cfg.enabled || !cfg.endpoint) return null;
  return cfg;
}

function shAssetEndpoint() {
  const cfg = shBackendCfg();
  if (!cfg?.endpoint) return null;
  return cfg.endpoint.replace(/\/state(?:\?.*)?$/, "/assets");
}

function shApplyDataLocal(next, options = {}) {
  const { persist = true, notify = true } = options;
  const copy = shClone(next || {});
  if (persist) localStorage.setItem(SH_DATA_KEY, JSON.stringify(copy));
  window.SH_DATA = copy;
  window.SH_RUNTIME_DATA = copy;
  if (notify) window.dispatchEvent(new CustomEvent("sh:data-change", { detail: copy }));
  return copy;
}

let shWarnedBackend = false;

// The API reports which store it actually landed on. "file" on a Vercel deploy means
// no Supabase env vars — writes are dropped and every device stays on its own copy.
function shNoteBackendStatus(json) {
  if (!json || typeof json !== "object") return;
  const status = {
    backend: json.backend || "unknown",
    durable: json.durable !== false,
    error: json.error || null,
  };
  window.SH_BACKEND_STATUS = status;
  if (!status.durable && !shWarnedBackend) {
    shWarnedBackend = true;
    console.warn(
      `[SchoolHub] 공유 저장소가 설정되지 않았어요 (backend: ${status.backend}). ` +
      "Vercel 프로젝트에 SUPABASE_URL / SUPABASE_SECRET_KEY 환경변수를 넣어야 기기 간 동기화가 됩니다."
    );
  }
}

async function shFetchRemoteState() {
  const cfg = shBackendCfg();
  if (!cfg) return null;
  try {
    const res = await fetch(cfg.endpoint, { method: "GET", cache: "no-store" });
    const json = await res.json().catch(() => null);
    shNoteBackendStatus(json);
    if (!res.ok) return null;
    const state = json?.state;
    if (!state || typeof state !== "object") return null;
    return state;
  } catch (_) {
    return null;
  }
}

async function shPushRemoteState(state) {
  const cfg = shBackendCfg();
  if (!cfg) return null;
  try {
    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ state }),
    });
    const json = await res.json().catch(() => null);
    shNoteBackendStatus(json);
    if (!res.ok) {
      console.warn("[SchoolHub] 서버 저장 실패:", json?.error || res.status);
      return null;
    }
    const next = json?.state;
    return next && typeof next === "object" ? next : null;
  } catch (_) {
    return null;
  }
}

function shNormalizeToken(v) {
  return String(v || "").trim().replace(/\s+/g, "");
}

function shIsAdminLogin(user) {
  if (!user) return false;
  return (
    shNormalizeToken(user.grade) === SH_ADMIN_LOGIN.grade &&
    shNormalizeToken(user.className) === SH_ADMIN_LOGIN.className &&
    shNormalizeToken(user.number) === SH_ADMIN_LOGIN.number &&
    String(user.name || "").trim() === SH_ADMIN_LOGIN.name
  );
}

function shIsAdminUser(user = window.SH_USER) {
  return !!user && user.role === "admin" && shIsAdminLogin(user);
}

function shNormalizeUser(user) {
  if (!user || !user.name) return null;
  const grade = String(user.grade || 3).trim();
  const className = String(user.className || 5).trim();
  const number = String(user.number || 1).trim();
  const name = String(user.name || "").trim();
  if (!name) return null;
  const role = shIsAdminLogin({ grade, className, number, name }) ? "admin" : "student";
  return { grade, className, number, name, role };
}

// Only these keys are shared between devices. meal / timetable / calendar are derived
// per device and per class (the timetable is rotated by class number), so uploading
// them would make every device overwrite everyone else's view.
const SH_SHARED_KEYS = ["suggestions", "notices", "lostItems", "reports", "forms", "exams", "ddays", "quote"];

function shPickShared(state) {
  const src = shIsObject(state) ? state : {};
  const out = {};
  SH_SHARED_KEYS.forEach((key) => {
    if (src[key] !== undefined) out[key] = src[key];
  });
  if (shIsObject(src.__deleted)) out.__deleted = src.__deleted;
  out.__updatedAt = Number(src.__updatedAt) || Date.now();
  return out;
}

let shHydration = null;
let shPushTimer = null;
let shPushInFlight = 0;
let shSyncStarted = false;
let shLoadedOnce = false;

// A fresh device starts from the seed data bundled in data.jsx. Uploading that before
// reading the server would resurrect deleted posts, so every write waits for the first
// read to land.
function shEnsureHydrated() {
  if (shHydration) return shHydration;
  shHydration = (async () => {
    const remote = await shFetchRemoteState();
    if (remote) shApplyDataLocal(shMergeState(shGetData(), shPickShared(remote)));
  })();
  return shHydration;
}

async function shFlushPush() {
  shPushTimer = null;
  await shEnsureHydrated();
  shPushInFlight += 1;
  try {
    const remote = await shPushRemoteState(shPickShared(shGetData()));
    if (remote) shApplyDataLocal(shMergeState(shGetData(), shPickShared(remote)));
  } finally {
    shPushInFlight -= 1;
  }
}

function shQueuePush() {
  if (!shBackendCfg() || shPushTimer) return;
  shPushTimer = window.setTimeout(shFlushPush, 180);
}

async function shSyncFromRemote() {
  if (!shBackendCfg()) return;
  // A local write is already on its way — its response carries the merged result.
  if (shPushTimer || shPushInFlight > 0) return;
  const remote = await shFetchRemoteState();
  if (!remote || shPushTimer || shPushInFlight > 0) return;
  shApplyDataLocal(shMergeState(shGetData(), shPickShared(remote)));
}

// One poller for the whole app — useSHData is mounted by a dozen screens at once.
function shStartSync() {
  if (shSyncStarted || !shBackendCfg()) return;
  shSyncStarted = true;
  shEnsureHydrated();
  window.setInterval(shSyncFromRemote, 15000);
  window.addEventListener("focus", shSyncFromRemote);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") shSyncFromRemote();
  });
}

function shSaveData(next) {
  const copy = shApplyDataLocal({ ...(next || {}), __updatedAt: Date.now() });
  shQueuePush();
  return copy;
}

// Device-local write: persisted and broadcast, never uploaded.
function shSaveLocalData(next) {
  return shApplyDataLocal({ ...(next || {}) });
}

function shLoadData() {
  if (!window.SH_DEFAULT_DATA) window.SH_DEFAULT_DATA = shClone(window.SH_DATA || {});
  if (shLoadedOnce) return shGetData();
  shLoadedOnce = true;
  const stored = shSafeParse(localStorage.getItem(SH_DATA_KEY), null);
  const next = stored && typeof stored === "object" ? stored : shClone(window.SH_DEFAULT_DATA);
  return shApplyDataLocal(next, { notify: false });
}

function shGetData() {
  return window.SH_DATA || window.SH_RUNTIME_DATA || {};
}

function shMakeDraft(updater) {
  const before = shClone(shGetData());
  const draft = shClone(before);
  updater(draft);
  draft.__deleted = shMergeDeletedMaps(draft.__deleted, shComputeDeletedMap(before, draft));
  return draft;
}

function shUpdateData(updater) {
  const draft = shMakeDraft(updater);
  draft.__updatedAt = Date.now();
  shSaveData(draft);
  return draft;
}

function shUpdateLocalData(updater) {
  const draft = shMakeDraft(updater);
  shSaveLocalData(draft);
  return draft;
}

function shResetData() {
  shSaveData(shClone(window.SH_DEFAULT_DATA || {}));
}

function shFormatGradeLabel(user) {
  return `${user.grade}학년 ${user.className}반 ${user.number}번`;
}

function shFormatClassLabel(user, lang = "ko") {
  if (!user) return "";
  if (lang === "en") return `Grade ${user.grade} · Class ${user.className}`;
  return `${user.grade}학년 ${user.className}반`;
}

function shStudentCode(user) {
  if (!user) return "";
  return `${shNormalizeToken(user.grade)}-${shNormalizeToken(user.className)}-${shNormalizeToken(user.number)}`;
}

function shSlug(input, fallback = "file") {
  const text = String(input || "")
    .trim()
    .replace(/[^\w\-가-힣.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return text || fallback;
}

function shInferExtension(type = "", name = "") {
  const fromName = String(name).split(".").pop();
  if (fromName && fromName !== name) return fromName.toLowerCase();
  const map = {
    "application/pdf": "pdf",
    "application/haansofthwp": "hwp",
    "application/x-hwp": "hwp",
    "application/vnd.hancom.hwp": "hwp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return map[type] || "bin";
}

function shReadDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("파일 읽기 실패"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function shCompressImageFile(file) {
  if (!String(file.type || "").startsWith("image/") || file.type === "image/gif") return shReadDataUrl(file);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(String(reader.result || ""));
      img.onload = () => {
        const maxSide = 1600;
        const ratio = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

async function shUploadAsset(asset) {
  const endpoint = shAssetEndpoint();
  if (!endpoint || !asset?.dataUrl) return null;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: asset.name,
        type: asset.type,
        size: asset.size,
        dataUrl: asset.dataUrl,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.asset || null;
  } catch (_) {
    return null;
  }
}

async function shReadFileAsset(file) {
  const originalType = file.type || "application/octet-stream";
  const dataUrl = String(originalType).startsWith("image/")
    ? await shCompressImageFile(file)
    : await shReadDataUrl(file);
  const type = dataUrl?.startsWith("data:image/jpeg") ? "image/jpeg" : originalType;
  const asset = {
    id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type,
    size: Number(file.size || 0),
    ext: shInferExtension(type, file.name),
    dataUrl,
  };
  const uploaded = await shUploadAsset(asset);
  if (!uploaded) return asset;
  return {
    ...asset,
    ...uploaded,
    dataUrl: undefined,
  };
}

async function shReadFiles(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  return Promise.all(files.map(shReadFileAsset));
}

function shDownloadAsset(asset, fallbackName = "download") {
  if (!asset?.dataUrl && !asset?.url) return false;
  const link = document.createElement("a");
  link.href = asset.dataUrl || asset.url;
  link.download = asset.name || `${fallbackName}.${shInferExtension(asset.type, asset.name)}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}

function shCreateReport(payload = {}) {
  const report = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code: String(payload.code || Math.random().toString(36).slice(2, 8)).toUpperCase(),
    category: String(payload.category || "etc"),
    when: String(payload.when || "").trim(),
    where: String(payload.where || "").trim(),
    what: String(payload.what || "").trim(),
    status: String(payload.status || "received"),
    createdAt: payload.createdAt || new Date().toISOString(),
    adminNote: String(payload.adminNote || ""),
    resolutionNote: String(payload.resolutionNote || ""),
    timeline: Array.isArray(payload.timeline) ? payload.timeline : [
      {
        key: "received",
        when: new Date().toISOString(),
        message_ko: "신고가 안전하게 접수됐어요.",
        message_en: "Your report was safely received.",
      },
    ],
  };
  shUpdateData((draft) => {
    if (!Array.isArray(draft.reports)) draft.reports = [];
    draft.reports.unshift(report);
  });
  return report;
}

function shNoticeVisibleToUser(notice, user) {
  if (!notice) return false;
  if (!user) return true;
  const target = String(notice.target || "all").toLowerCase();
  if (target === "all") return true;
  if (target === "grade") {
    return shNormalizeToken(notice.targetValue) === shNormalizeToken(user.grade);
  }
  if (target === "single") {
    const raw = shNormalizeToken(notice.targetValue)
      .replace(/[._]/g, "-")
      .replace(/-+/g, "-");
    const code = shStudentCode(user);
    const compact = code.replace(/-/g, "");
    return raw === code || raw === compact;
  }
  return true;
}

function shVisibleNotices(notices, user = window.SH_USER) {
  const arr = Array.isArray(notices) ? notices : [];
  return arr.filter((n) => shNoticeVisibleToUser(n, user));
}

function shApplyUserToRuntime(user) {
  window.SH_USER = user || null;
  if (!window.SH_STRINGS || !window.SH_STRINGS.ko || !window.SH_STRINGS.en || !user) return;
  window.SH_STRINGS.ko.studentName = user.name;
  window.SH_STRINGS.ko.grade = shFormatGradeLabel(user);
  window.SH_STRINGS.ko.tt_class_3_5 = shFormatClassLabel(user, "ko");
  window.SH_STRINGS.en.studentName = user.name;
  window.SH_STRINGS.en.grade = `Grade ${user.grade} · Class ${user.className} · No. ${user.number}`;
  window.SH_STRINGS.en.tt_class_3_5 = shFormatClassLabel(user, "en");
  if (window.SH_NEIS_CONFIG && user?.role !== "admin") {
    window.SH_NEIS_CONFIG.grade = Number(user.grade) || window.SH_NEIS_CONFIG.grade;
    window.SH_NEIS_CONFIG.className = Number(user.className) || window.SH_NEIS_CONFIG.className;
  }
}

function shLoadUser() {
  const stored = shNormalizeUser(shSafeParse(localStorage.getItem(SH_USER_KEY), null));
  if (stored) {
    shApplyUserToRuntime(stored);
    return stored;
  }
  shApplyUserToRuntime(null);
  return null;
}

function shSaveUser(user) {
  const next = shNormalizeUser(user);
  if (!next) return;
  localStorage.setItem(SH_USER_KEY, JSON.stringify(next));
  shApplyUserToRuntime(next);
  window.dispatchEvent(new CustomEvent("sh:user-change", { detail: next }));
}

function shClearUser() {
  localStorage.removeItem(SH_USER_KEY);
  shApplyUserToRuntime(null);
  window.dispatchEvent(new CustomEvent("sh:user-change", { detail: null }));
}

function shApplyClassFallbackTimetable(user) {
  if (!user || shIsAdminLogin(user)) return;
  const base = window.SH_DEFAULT_DATA || shGetData();
  const baseGrid = shClone(base?.timetable?.week?.grid || []);
  const baseToday = shClone(base?.timetable?.today || []);
  if (!Array.isArray(baseGrid) || baseGrid.length === 0) return;
  const shift = ((Number(user.className) || 1) - 1) % 5;
  // Class-specific — must not be pushed to the shared document.
  shUpdateLocalData((draft) => {
    if (!draft?.timetable?.week) return;
    const rotated = baseGrid.map((row) => {
      if (!Array.isArray(row) || row.length < 5) return row;
      return row.map((_, idx) => row[(idx + shift) % row.length]);
    });
    draft.timetable.week.grid = rotated;
    const now = new Date();
    const dayIdxRaw = now.getDay(); // Sun=0
    const dayIdx = dayIdxRaw === 0 ? 0 : Math.min(4, dayIdxRaw - 1);
    if (Array.isArray(baseToday) && baseToday.length > 0) {
      draft.timetable.today = baseToday.map((row, p) => {
        const sub = rotated[p]?.[dayIdx];
        if (!sub) return { ...row };
        return { ...row, subject_ko: sub, subject_en: sub };
      });
    }
    draft.timetable.classVariant = {
      grade: String(user.grade),
      className: String(user.className),
    };
  });
}

function useSHUser() {
  const [user, setUser] = React.useState(() => shLoadUser());
  React.useEffect(() => {
    const onChange = (e) => setUser(e.detail || null);
    window.addEventListener("sh:user-change", onChange);
    return () => window.removeEventListener("sh:user-change", onChange);
  }, []);
  return {
    user,
    login: (payload) => {
      shSaveUser(payload);
      shApplyClassFallbackTimetable(payload);
    },
    logout: shClearUser,
  };
}

function useSHData() {
  const [data, setData] = React.useState(() => shLoadData());
  React.useEffect(() => {
    const onChange = (e) => setData(e.detail || shGetData());
    window.addEventListener("sh:data-change", onChange);
    shStartSync();
    setData(shGetData());
    return () => window.removeEventListener("sh:data-change", onChange);
  }, []);
  return {
    data,
    setData: shSaveData,
    updateData: shUpdateData,
    updateLocalData: shUpdateLocalData,
    resetData: shResetData,
    refresh: shSyncFromRemote,
  };
}

Object.assign(window, {
  SHUserState: { load: shLoadUser, save: shSaveUser, clear: shClearUser, apply: shApplyUserToRuntime },
  SHDataState: {
    load: shLoadData,
    save: shSaveData,
    saveLocal: shSaveLocalData,
    get: shGetData,
    update: shUpdateData,
    updateLocal: shUpdateLocalData,
    reset: shResetData,
    sync: shSyncFromRemote,
    shared: shPickShared,
  },
  SHVisibleNotices: shVisibleNotices,
  SHNoticeVisibleToUser: shNoticeVisibleToUser,
  SHIsAdminLogin: shIsAdminLogin,
  SHIsAdminUser: shIsAdminUser,
  SHStudentCode: shStudentCode,
  SHReadFiles: shReadFiles,
  SHDownloadAsset: shDownloadAsset,
  SHSlug: shSlug,
  SHCreateReport: shCreateReport,
  useSHUser,
  useSHData,
});
