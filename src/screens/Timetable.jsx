// Timetable.jsx — Today + weekly grid.

function SHTimetableScreen({ t, lang, accent, onBack }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const nowInfo = useSchoolNow();
  const timeUtil = window.SHSchoolTime;
  const [view, setView] = React.useState("today");
  const todayRows = timeUtil ? timeUtil.getTodayTimetableRows(d.timetable.today, nowInfo) : d.timetable.today;
  const todayKo = window.SH_WEEKDAY_KO ? window.SH_WEEKDAY_KO[nowInfo.day] : "목";

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 28 }}>
      <SHNav title={t.home_timetable} onBack={onBack}/>

      <div style={{ padding: "0 20px 8px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7683" }}>
          {t.tt_class_3_5}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", marginTop: 4 }}>
          {lang === "ko" ? nowInfo.dateKo : nowInfo.dateEn}
        </div>
      </div>

      <div style={{ padding: "12px 16px 0" }}>
        <SHSeg
          value={view} onChange={setView}
          options={[
            { value: "today", label: lang === "ko" ? "오늘" : "Today" },
            { value: "week", label: lang === "ko" ? "주간" : "Week" },
          ]}
        />
      </div>

      {view === "today" && (
        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {todayRows.map((c) => (
            <SHCard key={c.period} radius={16} pad={16} style={{
              display: "flex", alignItems: "center", gap: 14,
              borderLeft: `4px solid ${c.color}`,
              background: c.now ? `${c.color}10` : "#fff",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${c.color}1F`, color: c.color,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800,
              }}>{c.period}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
                    {c[`subject_${lang}`]}
                  </span>
                  {c.now && (
                    <SHPill color="blue">
                      <span style={{
                        display: "inline-block", width: 5, height: 5, borderRadius: 999,
                        background: c.color, marginRight: 4,
                        animation: "tdsPulseDot 1.4s infinite",
                      }}/>
                      {lang === "ko" ? "수업 중" : "Now"}
                    </SHPill>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#6B7683", marginTop: 4 }}>
                  {c.teacher} · {c.room}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7683", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {c.time}
              </div>
            </SHCard>
          ))}
        </div>
      )}

      {view === "week" && (
        <div style={{ padding: "16px 12px 0" }}>
          <SHCard radius={16} pad={8}>
            <div style={{ display: "grid", gridTemplateColumns: "30px repeat(5, 1fr)", gap: 4 }}>
              {/* Header */}
              <div/>
              {d.timetable.week.days.map((day) => (
              <div key={day} style={{
                  textAlign: "center", padding: "6px 0",
                  fontSize: 12, fontWeight: 800, color: day === todayKo ? accent : "#191F28",
                }}>{day}</div>
              ))}
              {/* Rows */}
              {d.timetable.week.grid.map((row, p) => (
                <React.Fragment key={p}>
                  <div style={{
                    textAlign: "center", padding: "8px 0",
                    fontSize: 11, fontWeight: 700, color: "#8B95A1",
                  }}>{p + 1}</div>
                  {row.map((sub, di) => {
                    const isToday = d.timetable.week.days[di] === todayKo;
                    return (
                      <div key={di} style={{
                        padding: "10px 6px", borderRadius: 8,
                        background: isToday ? `${accent}10` : "#F8F9FA",
                        textAlign: "center", fontSize: 11, fontWeight: 700,
                        color: isToday ? accent : "#4E5968", letterSpacing: "-0.012em",
                        minHeight: 26, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{sub}</div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </SHCard>
        </div>
      )}

      <style>{`@keyframes tdsPulseDot { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
    </div>
  );
}

window.SHTimetableScreen = SHTimetableScreen;
