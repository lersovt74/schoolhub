// schoolTime.jsx — realtime school clock/schedule helpers (KST/local time).

const SH_WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];
const SH_WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getKoreaDate(base = new Date()) {
  const utc = base.getTime() + (base.getTimezoneOffset() * 60000);
  return new Date(utc + (9 * 60 * 60000));
}

function toMinute(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isSevenPeriodDay(day) {
  // Tue(2), Thu(4)
  return day === 2 || day === 4;
}

function buildDaySchedule(day) {
  const base = [
    { id: "homeroom", type: "homeroom", start: "08:40", end: "08:50" },
    { id: "break-1-pre", type: "break", period: 1, start: "08:50", end: "09:00" },
    { id: "class-1", type: "class", period: 1, start: "09:00", end: "09:45" },
    { id: "break-1", type: "break", period: 2, start: "09:45", end: "09:55" },
    { id: "class-2", type: "class", period: 2, start: "09:55", end: "10:40" },
    { id: "break-2", type: "break", period: 3, start: "10:40", end: "10:50" },
    { id: "class-3", type: "class", period: 3, start: "10:50", end: "11:35" },
    { id: "break-3", type: "break", period: 4, start: "11:35", end: "11:45" },
    { id: "class-4", type: "class", period: 4, start: "11:45", end: "12:30" },
    { id: "lunch", type: "lunch", start: "12:30", end: "13:20" },
    { id: "class-5", type: "class", period: 5, start: "13:20", end: "14:05" },
    { id: "break-5", type: "break", period: 6, start: "14:05", end: "14:15" },
    { id: "class-6", type: "class", period: 6, start: "14:15", end: "15:00" },
  ];

  if (isSevenPeriodDay(day)) {
    base.push(
      { id: "break-6", type: "break", period: 7, start: "15:00", end: "15:10" },
      { id: "class-7", type: "class", period: 7, start: "15:10", end: "15:55" },
      { id: "after", type: "after", start: "15:55", end: "24:00" },
    );
  } else {
    base.push({ id: "after", type: "after", start: "15:00", end: "24:00" });
  }

  return base.map((s) => ({ ...s, startMin: toMinute(s.start), endMin: toMinute(s.end) }));
}

function getSegmentLabel(segment, lang) {
  if (!segment) return lang === "ko" ? "시간표 확인" : "Check timetable";
  if (segment.type === "class") return lang === "ko" ? `${segment.period}교시` : `Period ${segment.period}`;
  if (segment.type === "break") return lang === "ko" ? `${segment.period}교시 · 쉬는시간` : `Period ${segment.period} · Break`;
  if (segment.type === "homeroom") return lang === "ko" ? "아침조회" : "Morning homeroom";
  if (segment.type === "lunch") return lang === "ko" ? "점심시간" : "Lunch break";
  if (segment.type === "after") return lang === "ko" ? "수업종료" : "Classes finished";
  if (segment.type === "before") return lang === "ko" ? "등교 준비" : "Before classes";
  return lang === "ko" ? "시간표 확인" : "Check timetable";
}

function formatDateLine(date, lang) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = lang === "ko" ? SH_WEEKDAY_KO[date.getDay()] : SH_WEEKDAY_EN[date.getDay()];
  return lang === "ko" ? `${month}월 ${day}일 ${weekday}요일` : `${weekday}, ${month}/${day}`;
}

function getSchoolNow(now = getKoreaDate()) {
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const schedule = buildDaySchedule(day);

  let current = schedule.find((s) => mins >= s.startMin && mins < s.endMin);
  let next = schedule.find((s) => s.startMin > mins);

  if (!current && mins < schedule[0].startMin) {
    current = {
      id: "before",
      type: "before",
      startMin: 0,
      endMin: schedule[0].startMin,
    };
    next = schedule[0];
  }
  if (!current) {
    current = schedule[schedule.length - 1];
  }

  const minsToNext = next ? Math.max(0, next.startMin - mins) : null;
  const minsToEnd = Math.max(0, current.endMin - mins);

  return {
    now,
    day,
    schedule,
    current,
    next,
    minsToNext,
    minsToEnd,
    dateKo: formatDateLine(now, "ko"),
    dateEn: formatDateLine(now, "en"),
  };
}

function getHomeHeadline(nowInfo, lang, studentName = "") {
  if (!nowInfo) return "";
  const cur = nowInfo.current;
  const next = nowInfo.next;
  if (!cur) return "";

  if (cur.type === "before" || cur.type === "homeroom" || cur.type === "after") {
    if (lang === "ko") return "내일은 좋은 일이 있을거에요.";
    return "Tomorrow will be a good day.";
  }

  if (cur.type === "lunch") {
    return lang === "ko"
      ? `점심시간이 ${nowInfo.minsToEnd}분 남았어요`
      : `${nowInfo.minsToEnd} min left for lunch`;
  }

  if (!next) {
    return lang === "ko" ? "오늘 일정을 마쳤어요" : "Today's schedule is done";
  }

  if (next.type === "lunch") {
    return lang === "ko"
      ? `점심시간까지 ${nowInfo.minsToNext}분 남았어요`
      : `${nowInfo.minsToNext} min to lunch`;
  }

  return lang === "ko"
    ? `${getSegmentLabel(next, "ko")}까지 ${nowInfo.minsToNext}분 남았어요`
    : `${nowInfo.minsToNext} min to ${getSegmentLabel(next, "en")}`;
}

function getCurrentPeriod(nowInfo) {
  if (!nowInfo || !nowInfo.current) return null;
  return nowInfo.current.period ?? null;
}

function getTodayTimetableRows(rawRows, nowInfo) {
  const currentPeriod = getCurrentPeriod(nowInfo);
  return rawRows
    .filter((row) => isSevenPeriodDay(nowInfo.day) || row.period !== 7)
    .map((row) => ({ ...row, now: row.period === currentPeriod }));
}

function useSchoolNow() {
  const [tick, setTick] = React.useState(() => getSchoolNow(getKoreaDate()));
  React.useEffect(() => {
    const id = setInterval(() => setTick(getSchoolNow(getKoreaDate())), 30000);
    return () => clearInterval(id);
  }, []);
  return tick;
}

Object.assign(window, {
  SH_WEEKDAY_KO,
  SH_WEEKDAY_EN,
  SHSchoolTime: {
    isSevenPeriodDay,
    buildDaySchedule,
    getSegmentLabel,
    getSchoolNow,
    getHomeHeadline,
    getCurrentPeriod,
    getTodayTimetableRows,
    formatDateLine,
    getKoreaDate,
  },
  useSchoolNow,
});
