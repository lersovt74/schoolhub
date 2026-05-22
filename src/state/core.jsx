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

function shSafeParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function shBackendCfg() {
  const cfg = window.SH_BACKEND_CONFIG || {};
  if (!cfg.enabled || !cfg.endpoint) return null;
  return cfg;
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

async function shFetchRemoteState() {
  const cfg = shBackendCfg();
  if (!cfg) return null;
  try {
    const res = await fetch(cfg.endpoint, { method: "GET" });
    if (!res.ok) return null;
    const json = await res.json();
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
      body: JSON.stringify({ state }),
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
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

function shSaveData(next) {
  const copy = shApplyDataLocal(next);
  shPushRemoteState(copy).then((remote) => {
    if (!remote) return;
    shApplyDataLocal(remote);
  });
}

function shLoadData() {
  if (!window.SH_DEFAULT_DATA) window.SH_DEFAULT_DATA = shClone(window.SH_DATA || {});
  const stored = shSafeParse(localStorage.getItem(SH_DATA_KEY), null);
  const next = stored && typeof stored === "object" ? stored : shClone(window.SH_DEFAULT_DATA);
  return shApplyDataLocal(next, { notify: false });
}

function shGetData() {
  return window.SH_DATA || window.SH_RUNTIME_DATA || {};
}

function shUpdateData(updater) {
  const draft = shClone(shGetData());
  updater(draft);
  shSaveData(draft);
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

function shReadFileAsset(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("파일 읽기 실패"));
    reader.onload = () =>
      resolve({
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: Number(file.size || 0),
        ext: shInferExtension(file.type, file.name),
        dataUrl: String(reader.result || ""),
      });
    reader.readAsDataURL(file);
  });
}

async function shReadFiles(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  return Promise.all(files.map(shReadFileAsset));
}

function shDownloadAsset(asset, fallbackName = "download") {
  if (!asset?.dataUrl) return false;
  const link = document.createElement("a");
  link.href = asset.dataUrl;
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
  shUpdateData((draft) => {
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
    return () => window.removeEventListener("sh:data-change", onChange);
  }, []);
  React.useEffect(() => {
    let alive = true;
    const syncFromRemote = async () => {
      const remote = await shFetchRemoteState();
      if (!alive || !remote) return;
      shApplyDataLocal(remote);
    };
    syncFromRemote();
    const interval = window.setInterval(syncFromRemote, 10000);
    const onVisible = () => {
      if (document.visibilityState === "visible") syncFromRemote();
    };
    window.addEventListener("focus", syncFromRemote);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", syncFromRemote);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return { data, setData: shSaveData, updateData: shUpdateData, resetData: shResetData };
}

Object.assign(window, {
  SHUserState: { load: shLoadUser, save: shSaveUser, clear: shClearUser, apply: shApplyUserToRuntime },
  SHDataState: { load: shLoadData, save: shSaveData, get: shGetData, update: shUpdateData, reset: shResetData },
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
