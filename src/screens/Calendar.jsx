// Calendar.jsx — stable month calendar synced with school schedule.

function SHCalendarScreen({ t, lang, accent, onBack }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const now = new Date();
  const baseYear = d.calendar?.year || now.getFullYear();
  const baseMonth = d.calendar?.month || (now.getMonth() + 1);
  const [year, setYear] = React.useState(baseYear);
  const [month, setMonth] = React.useState(baseMonth);
  const eventsMap = d.calendar?.events || {};
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let i = 1; i <= daysInMonth; i += 1) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const typeColor = {
    exam: "#F04452",
    trip: "#7A5AE0",
    meeting: "#3182F6",
    holiday: "#FF9000",
  };

  const eventsFor = (day) => {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return eventsMap[key] || [];
  };

  const navigateMonth = (dir) => {
    const next = new Date(year, month - 1 + dir, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
  };

  const upcoming = Object.entries(eventsMap)
    .filter(([key]) => key >= todayKey)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 12);

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 20 }}>
      <SHNav title={t.cal_title} onBack={onBack}/>

      <div style={{ padding: "8px 20px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => navigateMonth(-1)} className="tds-press" style={{
          width: 36, height: 36, borderRadius: 18, border: 0, background: "rgba(7,25,76,0.05)",
          cursor: "pointer", color: "#191F28", display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ transform: "rotate(180deg)" }}><IcRight size={18}/></span>
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#6B7683" }}>{year}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em" }}>
            {lang === "ko" ? `${month}월` : new Date(year, month - 1).toLocaleString("en-US", { month: "long" })}
          </div>
        </div>
        <button onClick={() => navigateMonth(1)} className="tds-press" style={{
          width: 36, height: 36, borderRadius: 18, border: 0, background: "rgba(7,25,76,0.05)",
          cursor: "pointer", color: "#191F28", display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          <IcRight size={18}/>
        </button>
      </div>

      <div style={{ padding: "0 16px" }}>
        <SHCard radius={20} pad={14} style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", paddingBottom: 10 }}>
            {(lang === "ko" ? ["일", "월", "화", "수", "목", "금", "토"] : ["S", "M", "T", "W", "T", "F", "S"]).map((dayTxt, i) => (
              <div key={i} style={{
                textAlign: "center", fontSize: 11, fontWeight: 700,
                color: i === 0 ? "#F04452" : i === 6 ? "#3182F6" : "#8B95A1",
              }}>{dayTxt}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} style={{ minHeight: 72 }}/>;
              const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const evs = eventsFor(day);
              const isToday = key === todayKey;
              const weekday = i % 7;
              const dayColor = isToday ? "#fff" : weekday === 0 ? "#F04452" : weekday === 6 ? "#3182F6" : "#191F28";
              return (
                <div key={i} style={{
                  minHeight: 82,
                  borderRadius: 10,
                  background: isToday ? accent : "#F8F9FA",
                  color: dayColor,
                  padding: "6px 5px 5px",
                  display: "flex", flexDirection: "column", gap: 4,
                  overflow: "hidden",
                }}>
                  <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 700, textAlign: "center" }}>{day}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {evs.slice(0, 1).map((e, j) => (
                      <div key={`${key}-${j}`} style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "-0.01em",
                        padding: "2px 4px", borderRadius: 5,
                        background: isToday ? "rgba(255,255,255,0.24)" : `${(typeColor[e.type] || accent)}1A`,
                        color: isToday ? "#fff" : (typeColor[e.type] || accent),
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {e[`title_${lang}`]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SHCard>
      </div>

      <div style={{ padding: "18px 16px 0" }}>
        <SHSection title={lang === "ko" ? "다가오는 일정" : "Upcoming"}/>
        <SHCard radius={16} pad={0}>
          {upcoming.length === 0 && (
            <div style={{ padding: "16px 18px", fontSize: 13, color: "#6B7683" }}>
              {lang === "ko" ? "이번 달 일정이 없습니다." : "No events this month."}
            </div>
          )}
          {upcoming.map(([key, evs], idx) => {
            const ev = evs[0];
            const mm = Number(key.slice(5, 7));
            const dd = Number(key.slice(8, 10));
            const color = typeColor[ev.type] || accent;
            return (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px",
                borderBottom: idx < upcoming.length - 1 ? "1px solid #F2F4F6" : "none",
              }}>
                <div style={{
                  width: 44, padding: "6px 0", borderRadius: 10,
                  background: `${color}14`, color, textAlign: "center", flex: "0 0 44px",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700 }}>{lang === "ko" ? `${mm}월` : `${mm}`}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.012em" }}>{dd}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {ev[`title_${lang}`]}
                  </div>
                  <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 2 }}>
                    {lang === "ko"
                      ? (ev.category_ko || ({ exam: "시험", trip: "체험학습", meeting: "학교행사", holiday: "휴업일" }[ev.type] || "학교행사"))
                      : ({ exam: "Exam", trip: "Field trip", meeting: "Event", holiday: "Holiday" }[ev.type] || "Event")}
                  </div>
                </div>
                <IconChevRight color="#B0B8C1"/>
              </div>
            );
          })}
        </SHCard>
      </div>
    </div>
  );
}

window.SHCalendarScreen = SHCalendarScreen;
