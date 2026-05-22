// neis.jsx — NEIS OpenAPI sync helpers (meal + timetable).
//
// Configure once (before app loads) by defining window.SH_NEIS_CONFIG.
// Example:
// window.SH_NEIS_CONFIG = {
//   enabled: true,
//   key: "YOUR_NEIS_KEY",
//   officeCode: "S10",          // ATPT_OFCDC_SC_CODE
//   schoolCode: "7010569",      // SD_SCHUL_CODE
//   schoolName: "장평중학교",     // optional auto-search fallback
//   schoolLevel: "middle",      // elementary | middle | high | special
//   grade: 3,
//   className: 5,
// };

const SH_NEIS_DEFAULT_CONFIG = {
  enabled: false,
  baseUrl: "https://open.neis.go.kr/hub",
  proxyUrl: "",
  type: "json",
  pIndex: 1,
  pSize: 100,
  key: "",
  officeCode: "B10",
  schoolCode: "7021139",
  schoolName: "장평중학교",
  schoolLevel: "middle",
  grade: 3,
  className: 5,
};

if (!window.SH_NEIS_CONFIG) window.SH_NEIS_CONFIG = {};
window.SH_NEIS_CONFIG = { ...SH_NEIS_DEFAULT_CONFIG, ...window.SH_NEIS_CONFIG };

const SH_NEIS_LEVEL_ENDPOINT = {
  elementary: "elsTimetable",
  middle: "misTimetable",
  high: "hisTimetable",
  special: "spsTimetable",
};

function neisYmd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function ymdToKey(ymd) {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

function toDateFromYmd(ymd) {
  return new Date(Number(ymd.slice(0, 4)), Number(ymd.slice(4, 6)) - 1, Number(ymd.slice(6, 8)));
}

function clampDate(n) {
  return n < 10 ? `0${n}` : String(n);
}

function formatMdFromDate(date) {
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function toYmdByParts(year, month, day) {
  return `${year}${clampDate(month)}${clampDate(day)}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeekMonday(date) {
  const n = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = n.getDay(); // Sun=0
  const diff = day === 0 ? -6 : 1 - day;
  n.setDate(n.getDate() + diff);
  return n;
}

function endOfWeekFriday(date) {
  const mon = startOfWeekMonday(date);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  return fri;
}

function eachDateInRange(fromDate, toDate) {
  const days = [];
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const last = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseMealKcal(row) {
  const calInfo = safeNumber(String(row?.CAL_INFO || "").replace(/[^\d.]/g, ""), NaN);
  if (Number.isFinite(calInfo)) return calInfo;
  return safeNumber(row?.MLSV_FGR, 0);
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<br\s*\/?>/gi, " · ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s*·\s*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

function mealNameFromDish(raw) {
  // "쇠고기미역국(영)5.6.16." -> "쇠고기미역국", allergens: ["5","6","16"]
  const txt = stripHtml(raw).trim();
  const allergens = [...new Set((txt.match(/\d{1,2}/g) || []).filter((n) => Number(n) <= 19))];
  const clean = txt
    .replace(/\([^)]*\)/g, "")
    .replace(/\d{1,2}[.,]?/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return { name: clean || txt, allergens };
}

function getJsonRows(payload, rootKey) {
  if (!payload || !payload[rootKey]) return [];
  const bag = payload[rootKey];
  const rows = bag.find((x) => x.row)?.row || [];
  return Array.isArray(rows) ? rows : [];
}

async function neisRequest(endpoint, params) {
  const cfg = window.SH_NEIS_CONFIG;
  const appendParams = (url) => {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  };
  const fetchJson = async (url) => {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`NEIS ${endpoint} ${res.status}`);
    return res.json();
  };

  // 1) Prefer secure server proxy.
  if (cfg.proxyUrl) {
    try {
      const proxyUrl = new URL(cfg.proxyUrl, window.location.origin);
      proxyUrl.searchParams.set("endpoint", endpoint);
      appendParams(proxyUrl);
      return await fetchJson(proxyUrl);
    } catch (err) {
      // 2) Local/dev fallback: if client key is present, call NEIS directly.
      if (!cfg.key) throw err;
    }
  }

  const directUrl = new URL(`${cfg.baseUrl}/${endpoint}`);
  appendParams(directUrl);
  return fetchJson(directUrl);
}

async function resolveSchoolCodes() {
  const cfg = window.SH_NEIS_CONFIG;
  if (cfg.officeCode && cfg.schoolCode) {
    return { officeCode: cfg.officeCode, schoolCode: cfg.schoolCode };
  }

  if (!cfg.schoolName) throw new Error("NEIS 학교명이 설정되지 않았어요.");

  const data = await neisRequest("schoolInfo", {
    KEY: cfg.key,
    Type: cfg.type,
    pIndex: cfg.pIndex,
    pSize: cfg.pSize,
    SCHUL_NM: cfg.schoolName,
  });
  const rows = getJsonRows(data, "schoolInfo");
  if (!rows.length) throw new Error("학교 코드 조회 실패");

  const first = rows[0];
  return {
    officeCode: first.ATPT_OFCDC_SC_CODE,
    schoolCode: first.SD_SCHUL_CODE,
  };
}

async function fetchNeisMeal(officeCode, schoolCode, date) {
  const cfg = window.SH_NEIS_CONFIG;
  const ymd = neisYmd(date);
  const data = await neisRequest("mealServiceDietInfo", {
    KEY: cfg.key,
    Type: cfg.type,
    pIndex: cfg.pIndex,
    pSize: cfg.pSize,
    ATPT_OFCDC_SC_CODE: officeCode,
    SD_SCHUL_CODE: schoolCode,
    MLSV_YMD: ymd,
    MMEAL_SC_CODE: 2, // lunch
  });
  const rows = getJsonRows(data, "mealServiceDietInfo");
  if (!rows.length) return null;

  const row = rows[0];
  const dishList = String(row.DDISH_NM || "").split(/<br\s*\/?>/i).filter(Boolean);
  const items = dishList.map((dish) => {
    const { name, allergens } = mealNameFromDish(dish);
    return { ko: name, en: name, allergens };
  });

  const kcalNum = parseMealKcal(row);
  return {
    date: `${ymd.slice(0, 4)}.${ymd.slice(4, 6)}.${ymd.slice(6, 8)}`,
    day: window.SH_WEEKDAY_KO ? window.SH_WEEKDAY_KO[date.getDay()] : "",
    kcal: kcalNum,
    items,
    originInfo: stripHtml(row.ORPLC_INFO || ""),
  };
}

async function fetchNeisMealsByRange(officeCode, schoolCode, fromDate, toDate) {
  const byDate = {};
  const days = eachDateInRange(fromDate, toDate).filter((date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  });
  const meals = await Promise.all(days.map((date) => fetchNeisMeal(officeCode, schoolCode, date)));
  meals.forEach((meal, idx) => {
    if (!meal) return;
    const date = days[idx];
    const ymd = neisYmd(date);
    byDate[ymdToKey(ymd)] = {
      ymd,
      key: ymdToKey(ymd),
      day: meal.day,
      date: formatMdFromDate(date),
      kcal: meal.kcal || 0,
      items: meal.items || [],
      originInfo: meal.originInfo || "",
    };
  });
  return byDate;
}

async function fetchNeisTimetable(officeCode, schoolCode, date) {
  const cfg = window.SH_NEIS_CONFIG;
  const endpoint = SH_NEIS_LEVEL_ENDPOINT[cfg.schoolLevel] || SH_NEIS_LEVEL_ENDPOINT.middle;
  const ymd = neisYmd(date);
  const data = await neisRequest(endpoint, {
    KEY: cfg.key,
    Type: cfg.type,
    pIndex: cfg.pIndex,
    pSize: cfg.pSize,
    ATPT_OFCDC_SC_CODE: officeCode,
    SD_SCHUL_CODE: schoolCode,
    ALL_TI_YMD: ymd,
    AY: String(date.getFullYear()),
    GRADE: cfg.grade,
    CLASS_NM: cfg.className,
  });

  const rows = getJsonRows(data, endpoint);
  if (!rows.length) return null;

  return rows
    .map((r) => ({
      period: Number(r.PERIO),
      subject_ko: stripHtml(r.ITRT_CNTNT || ""),
      subject_en: stripHtml(r.ITRT_CNTNT || ""),
    }))
    .filter((r) => Number.isFinite(r.period))
    .sort((a, b) => a.period - b.period);
}

async function fetchNeisTimetableByRange(officeCode, schoolCode, fromDate, toDate) {
  const byDate = {};
  const days = eachDateInRange(fromDate, toDate).filter((date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  });
  const rowsByDay = await Promise.all(days.map((date) => fetchNeisTimetable(officeCode, schoolCode, date)));
  rowsByDay.forEach((rows, idx) => {
    if (!rows || !rows.length) return;
    const key = ymdToKey(neisYmd(days[idx]));
    byDate[key] = rows
      .filter((r) => Number.isFinite(r.period))
      .sort((a, b) => a.period - b.period);
  });
  return byDate;
}

async function fetchNeisSchoolSchedule(officeCode, schoolCode, fromDate, toDate) {
  const cfg = window.SH_NEIS_CONFIG;
  const data = await neisRequest("SchoolSchedule", {
    KEY: cfg.key,
    Type: cfg.type,
    pIndex: cfg.pIndex,
    pSize: 1000,
    ATPT_OFCDC_SC_CODE: officeCode,
    SD_SCHUL_CODE: schoolCode,
    AA_FROM_YMD: neisYmd(fromDate),
    AA_TO_YMD: neisYmd(toDate),
  });
  return getJsonRows(data, "SchoolSchedule");
}

function schoolEventType(eventName = "", sbtrName = "") {
  const name = `${eventName} ${sbtrName}`;
  if (/시험|평가|고사/.test(name)) return "exam";
  if (/체험|수련|수학여행|여행/.test(name)) return "trip";
  if (/상담|학부모|총회|회의/.test(name)) return "meeting";
  if (/공휴일|휴업|휴일|재량|대체공휴일/.test(name)) return "holiday";
  return "meeting";
}

function buildCalendarEventsMap(rows) {
  const events = {};
  rows.forEach((row) => {
    const ymd = String(row.AA_YMD || "");
    if (!ymd || ymd.length !== 8) return;
    const key = ymdToKey(ymd);
    if (!events[key]) events[key] = [];
    const title = stripHtml(row.EVENT_NM || "").trim();
    if (!title) return;
    events[key].push({
      title_ko: title,
      title_en: title,
      type: schoolEventType(title, row.SBTR_DD_SC_NM || ""),
      category_ko: stripHtml(row.SBTR_DD_SC_NM || ""),
    });
  });
  return events;
}

function buildMealWeek(mealByDate, anchorDate) {
  const monday = startOfWeekMonday(anchorDate);
  const rows = [];
  for (let i = 0; i < 5; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = ymdToKey(neisYmd(d));
    const src = mealByDate[key];
    rows.push({
      day: window.SH_WEEKDAY_KO ? window.SH_WEEKDAY_KO[d.getDay()] : "",
      date: formatMdFromDate(d),
      kcal: src?.kcal || 0,
      items: (src?.items || []).map((x) => x.ko),
      today: key === ymdToKey(neisYmd(anchorDate)),
      key,
    });
  }
  return rows;
}

function buildMonthWeekAnchors(date) {
  const anchors = [];
  const year = date.getFullYear();
  const month = date.getMonth();
  let cursor = new Date(year, month, 1);
  while (cursor.getMonth() === month) {
    const mon = startOfWeekMonday(cursor);
    const monKey = neisYmd(mon);
    if (!anchors.find((a) => neisYmd(a) === monKey)) anchors.push(mon);
    cursor.setDate(cursor.getDate() + 7);
  }
  return anchors
    .filter((d) => d.getMonth() === month)
    .sort((a, b) => a - b);
}

function periodTimeByIndex(period) {
  const table = {
    1: "09:00–09:45",
    2: "09:55–10:40",
    3: "10:50–11:35",
    4: "11:45–12:30",
    5: "13:20–14:05",
    6: "14:15–15:00",
    7: "15:10–15:55",
  };
  return table[period] || "";
}

function mapTimetableRows(rows, prevRows = []) {
  const colorByPeriod = Object.fromEntries(prevRows.map((r) => [r.period, r.color]));
  const teacherByPeriod = Object.fromEntries(prevRows.map((r) => [r.period, r.teacher]));
  const roomByPeriod = Object.fromEntries(prevRows.map((r) => [r.period, r.room]));
  return rows.map((r) => ({
    period: r.period,
    subject_ko: r.subject_ko,
    subject_en: r.subject_en,
    teacher: teacherByPeriod[r.period] || "-",
    room: roomByPeriod[r.period] || "-",
    time: periodTimeByIndex(r.period),
    color: colorByPeriod[r.period] || "#3182F6",
  }));
}

function buildWeekGridFromTimetableRows(rowsByDate, baseDate) {
  const monday = startOfWeekMonday(baseDate);
  const dayNames = ["월", "화", "수", "목", "금"];
  const dayKeys = [];
  for (let i = 0; i < 5; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dayKeys.push(ymdToKey(neisYmd(d)));
  }
  const maxPeriod = 7;
  const grid = Array.from({ length: maxPeriod }, () => Array.from({ length: 5 }, () => ""));
  dayKeys.forEach((key, dayIdx) => {
    const rows = rowsByDate[key] || [];
    rows.forEach((r) => {
      if (r.period >= 1 && r.period <= maxPeriod) {
        grid[r.period - 1][dayIdx] = r.subject_ko;
      }
    });
  });
  return { days: dayNames, grid };
}

function mergeNeisToSchoolData(baseData, payload) {
  const next = JSON.parse(JSON.stringify(baseData));
  const {
    mealToday,
    mealByDate,
    mealWeekAnchors,
    timetableTodayRows,
    timetableWeekRows,
    scheduleRows,
    nowDate,
  } = payload;

  if (mealToday) {
    next.meal.today = {
      ...next.meal.today,
      ...mealToday,
    };
    const todayDay = mealToday.day;
    const idx = next.meal.week.findIndex((d) => d.day === todayDay);
    if (idx >= 0) {
      next.meal.week[idx] = {
        ...next.meal.week[idx],
        kcal: mealToday.kcal || next.meal.week[idx].kcal,
        items: mealToday.items.map((x) => x.ko),
        today: true,
      };
    }
  }

  if (mealByDate && Object.keys(mealByDate).length) {
    next.meal.byDate = mealByDate;
    next.meal.week = buildMealWeek(mealByDate, nowDate);
    next.meal.weekAnchors = (mealWeekAnchors || []).map((d) => neisYmd(d));
    next.meal.currentMonth = `${nowDate.getFullYear()}-${clampDate(nowDate.getMonth() + 1)}`;
    next.meal.originInfo = mealToday?.originInfo || next.meal.originInfo || "";
  }

  if (timetableTodayRows && timetableTodayRows.length) {
    next.timetable.today = mapTimetableRows(timetableTodayRows, next.timetable.today || []);
  }

  if (timetableWeekRows) {
    next.timetable.week = buildWeekGridFromTimetableRows(timetableWeekRows, nowDate);
  }

  if (scheduleRows && scheduleRows.length) {
    next.calendar = next.calendar || {};
    next.calendar.year = nowDate.getFullYear();
    next.calendar.month = nowDate.getMonth() + 1;
    next.calendar.events = {
      ...(next.calendar.events || {}),
      ...buildCalendarEventsMap(scheduleRows),
    };
  }

  return next;
}

async function syncNeisSchoolData(baseData, date = new Date()) {
  const cfg = window.SH_NEIS_CONFIG;
  if (!cfg.enabled) return { data: baseData, synced: false, message: "NEIS 비활성화" };

  const { officeCode, schoolCode } = await resolveSchoolCodes();
  if (!cfg.officeCode) cfg.officeCode = officeCode;
  if (!cfg.schoolCode) cfg.schoolCode = schoolCode;
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const yearEnd = new Date(date.getFullYear(), 11, 31);
  const weekStart = startOfWeekMonday(date);
  const weekEnd = endOfWeekFriday(date);

  const [meal, mealByDate, timetable, timetableWeekRows, scheduleRows] = await Promise.all([
    fetchNeisMeal(officeCode, schoolCode, date),
    fetchNeisMealsByRange(officeCode, schoolCode, monthStart, monthEnd),
    fetchNeisTimetable(officeCode, schoolCode, date),
    fetchNeisTimetableByRange(officeCode, schoolCode, weekStart, weekEnd),
    fetchNeisSchoolSchedule(officeCode, schoolCode, monthStart, yearEnd),
  ]);

  const mealWeekAnchors = buildMonthWeekAnchors(date);
  return {
    data: mergeNeisToSchoolData(baseData, {
      mealToday: meal,
      mealByDate,
      mealWeekAnchors,
      timetableTodayRows: timetable,
      timetableWeekRows,
      scheduleRows,
      nowDate: date,
    }),
    synced: true,
    officeCode,
    schoolCode,
    mealSynced: !!meal,
    mealRangeSynced: Object.keys(mealByDate || {}).length > 0,
    timetableSynced: !!(timetable && timetable.length),
    calendarSynced: !!(scheduleRows && scheduleRows.length),
  };
}

function useSchoolDataSync(baseData) {
  const [state, setState] = React.useState({
    data: baseData,
    loading: false,
    synced: false,
    lastSyncAt: null,
    error: null,
  });

  const refresh = React.useCallback(async () => {
    const cfg = window.SH_NEIS_CONFIG || SH_NEIS_DEFAULT_CONFIG;
    const snapshot = window.SHDataState?.get?.() || window.SH_RUNTIME_DATA || window.SH_DATA || baseData;
    if (!cfg.enabled) {
      setState((s) => ({ ...s, data: snapshot, loading: false, synced: false, error: null }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const nowDate = window.SHSchoolTime?.getKoreaDate ? window.SHSchoolTime.getKoreaDate() : new Date();
      const res = await syncNeisSchoolData(snapshot, nowDate);
      window.SHDataState?.save?.(res.data);
      setState((s) => ({
        ...s,
        data: res.data,
        loading: false,
        synced: !!res.synced,
        error: null,
        lastSyncAt: new Date(),
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        data: snapshot,
        loading: false,
        synced: false,
        error: err.message || "NEIS 동기화 실패",
      }));
    }
  }, [baseData]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}

function SHGetData() {
  return window.SH_RUNTIME_DATA || window.SH_DATA;
}

Object.assign(window, {
  SH_NEIS_DEFAULT_CONFIG,
  SHGetData,
  SHNeisApi: {
    resolveSchoolCodes,
    fetchNeisMeal,
    fetchNeisTimetable,
    fetchNeisMealsByRange,
    fetchNeisTimetableByRange,
    fetchNeisSchoolSchedule,
    syncNeisSchoolData,
    mergeNeisToSchoolData,
  },
  useSchoolDataSync,
});
