// pc/Screens.jsx — remaining desktop screens batched: Meal, Timetable, Calendar, Forms, Exams.

// ═══ NOTICES ═════════════════════════════════════════════════════════════════
function PCNotices({ L, lang, accent, onOpen }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const visibleNotices = window.SHVisibleNotices ? window.SHVisibleNotices(d.notices, window.SH_USER) : d.notices;
  const [tab, setTab] = React.useState("all");
  const [readSet, setReadSet] = React.useState(() => new Set());

  const notices = visibleNotices.filter((n) => {
    if (tab === "pinned") return !!n.pinned;
    return true;
  });

  const toggleRead = (id) => {
    setReadSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 6 }}>
        <Chip active={tab === "all"} onClick={() => setTab("all")}>
          {lang === "ko" ? "전체" : "All"}
        </Chip>
        <Chip active={tab === "pinned"} onClick={() => setTab("pinned")}>
          {lang === "ko" ? "중요 공지" : "Pinned"}
        </Chip>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F2F4F6", overflow: "hidden" }}>
        {notices.map((n, i) => {
          const read = readSet.has(n.id);
          return (
            <button
              key={n.id}
              onClick={() => {
                toggleRead(n.id);
                onOpen?.(n.id);
              }}
              className="tds-press"
              style={{
                width: "100%", border: 0, background: "#fff", cursor: "pointer",
                textAlign: "left", padding: "16px 20px",
                borderBottom: i < notices.length - 1 ? "1px solid #F2F4F6" : "none",
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: n.pinned ? "rgba(240,68,82,0.12)" : "rgba(7,25,76,0.05)",
                color: n.pinned ? "#F04452" : "#6B7683",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                flex: "0 0 38px",
              }}>
                <IcMegaphone size={18}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {n.pinned && (
                    <span style={{
                      padding: "2px 8px", borderRadius: 6,
                      background: "rgba(240,68,82,0.12)", color: "#D43144",
                      fontSize: 10, fontWeight: 800,
                    }}>
                      {lang === "ko" ? "중요" : "Pinned"}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "#8B95A1" }}>{n[`time_${lang}`]}</span>
                  {!read && (
                    <span style={{
                      marginLeft: "auto", width: 8, height: 8, borderRadius: 999,
                      background: accent, flex: "0 0 8px",
                    }}/>
                  )}
                </div>
                <div style={{
                  marginTop: 4, fontSize: 15, color: "#191F28", letterSpacing: "-0.012em",
                  fontWeight: read ? 600 : 800,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {n.title}
                </div>
                <div style={{ marginTop: 3, fontSize: 12, color: "#6B7683" }}>{n.tag}</div>
              </div>
              <IconChevRight color="#B0B8C1"/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PCNoticeDetail({ L, lang, accent, noticeId }) {
  const { data } = useSHData();
  const notice = (data.notices || []).find((n) => n.id === noticeId) || (data.notices || [])[0];
  if (!notice) return null;

  const attachments = Array.isArray(notice.attachments) ? notice.attachments : [];
  const imageAssets = attachments.filter((asset) => String(asset.type || "").startsWith("image/"));
  const fileAssets = attachments.filter((asset) => !String(asset.type || "").startsWith("image/"));

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 28, border: "1px solid #F2F4F6" }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: "#191F28", letterSpacing: "-0.03em", lineHeight: 1.24 }}>
          {notice.title}
        </div>
        <div style={{ marginTop: 14, fontSize: 14, color: "#6B7683", lineHeight: 1.45 }}>
          장평중학교
          <br />
          {notice.createdAtLabel || notice.time_ko || notice.time_en}
        </div>

        {!!notice.body && (
          <div style={{ marginTop: 24, fontSize: 16, color: "#191F28", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {notice.body}
          </div>
        )}

        {imageAssets.length > 0 && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {imageAssets.map((asset) => (
              <img
                key={asset.id}
                src={asset.dataUrl}
                alt={asset.name}
                style={{ width: "100%", borderRadius: 16, border: "1px solid #E5E8EB" }}
              />
            ))}
          </div>
        )}

        {fileAssets.length > 0 && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            {fileAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => window.SHDownloadAsset?.(asset, window.SHSlug?.(notice.title, "notice"))}
                className="tds-press"
                style={{
                  width: "100%", border: 0, background: "rgba(49,130,246,0.08)", color: "#1B64DA",
                  borderRadius: 14, padding: "16px 18px", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                }}
              >
                <IcDocument size={18}/>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700 }}>{asset.name}</span>
                <IcDownload size={18}/>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ MEAL ════════════════════════════════════════════════════════════════════
function PCMeal({ L, lang, accent, showAllergyWarning }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const allergens = d.meal.allergyKey;
  const mealByDate = d.meal.byDate || {};
  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();
  const weekRows = Array.isArray(d.meal.week) ? d.meal.week : [];
  const initialDay = Math.max(0, weekRows.findIndex((row) => row.today || row.key === todayKey));
  const [day, setDay] = React.useState(initialDay >= 0 ? initialDay : 0);
  const selectedWeekRow = weekRows[day] || weekRows[0] || null;
  const selectedMeal = selectedWeekRow?.key ? mealByDate[selectedWeekRow.key] : null;
  const items = selectedMeal?.items || d.meal.today.items || [];
  const kcal = selectedMeal?.kcal ?? selectedWeekRow?.kcal ?? d.meal.today.kcal ?? 0;
  const originInfo = selectedMeal?.originInfo || d.meal.today.originInfo || "";

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      {/* Week strip */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: 12, marginBottom: 24,
        border: "1px solid #F2F4F6",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {weekRows.map((w, i) => {
            const on = i === day;
            return (
              <button key={i} onClick={() => setDay(i)} style={{
                padding: "16px 8px", border: 0, borderRadius: 12,
                background: on ? accent : "transparent",
                color: on ? "#fff" : "#191F28",
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                transition: "all 200ms",
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: on ? "rgba(255,255,255,0.7)" : "#8B95A1" }}>
                  {w.day}
                </span>
                <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{w.date}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: on ? "rgba(255,255,255,0.8)" : "#6B7683" }}>
                  {w.kcal} kcal
                </span>
                {w.today && (
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    padding: "1px 6px", borderRadius: 999,
                    background: on ? "rgba(255,255,255,0.22)" : `${accent}1F`,
                    color: on ? "#fff" : accent,
                  }}>{lang === "ko" ? "오늘" : "TODAY"}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Big card */}
        <div style={{
          background: `linear-gradient(135deg, ${accent}, ${shadeColor(accent, -22)})`,
          color: "#fff", borderRadius: 20, padding: 32, position: "relative", overflow: "hidden", minHeight: 540,
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", right: -60, top: -60, width: 260, height: 260,
            borderRadius: "50%", background: "rgba(255,255,255,0.08)",
          }}/>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.75)" }}>
              {lang === "ko" ? "오늘의 점심" : "TODAY'S LUNCH"}
            </div>
            <h2 style={{ margin: "8px 0 0", fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", color: "#fff" }}>
              {kcal} {L.home_kcal}
            </h2>
            <div style={{
              marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px",
            }}>
              {items.map((it, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.16)",
                  minWidth: 0,
                }}>
                  <span style={{ fontSize: 24 }}>{["🍚","🥣","🥘","🍳","🥬","🥛","🍱","🥗"][i % 8]}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.012em", color: "#fff" }}>{it[lang]}</div>
                    {showAllergyWarning && it.allergens?.length > 0 && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {lang === "ko" ? "알레르기 " : "Allergens "}{it.allergens.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side: allergy key + origin */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {showAllergyWarning && items.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #F2F4F6" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
                {lang === "ko" ? "오늘의 알레르기 정보" : "Allergens today"}
              </div>
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {allergens.filter(a => items.some(it => it.allergens?.includes(a.n))).map((a) => (
                  <span key={a.n} style={{
                    padding: "5px 10px", borderRadius: 8,
                    background: "rgba(240,68,82,0.08)", color: "#D43144",
                    fontSize: 12, fontWeight: 700,
                  }}>{a.n} · {a[lang]}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #F2F4F6" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
              {L.meal_origin}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: "#4E5968", lineHeight: 1.7 }}>
              {originInfo || (lang === "ko" ? "원산지 정보 준비 중" : "Origin information unavailable")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ TIMETABLE ═══════════════════════════════════════════════════════════════
function PCTimetable({ L, lang, accent }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const nowInfo = useSchoolNow();
  const rowsToday = window.SHSchoolTime
    ? window.SHSchoolTime.getTodayTimetableRows(d.timetable.today, nowInfo)
    : d.timetable.today;
  const todayKo = window.SH_WEEKDAY_KO ? window.SH_WEEKDAY_KO[nowInfo.day] : "목";
  const currentPeriod = window.SHSchoolTime ? window.SHSchoolTime.getCurrentPeriod(nowInfo) : null;

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{
        background: "#fff", borderRadius: 18, padding: 24,
        border: "1px solid #F2F4F6",
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7683" }}>{L.tt_class_3_5}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", marginTop: 2 }}>
              {lang === "ko" ? "이번 주 시간표" : "This week"}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(5, 1fr)", gap: 6 }}>
          <div/>
          {d.timetable.week.days.map((day, i) => {
            const friday = i === 4;
            return (
              <div key={day} style={{
                textAlign: "center", padding: "10px 0",
                fontSize: 13, fontWeight: 800, letterSpacing: "-0.012em",
                color: friday ? accent : "#191F28",
                background: friday ? `${accent}10` : "transparent",
                borderRadius: 8,
              }}>{day}</div>
            );
          })}
          {d.timetable.week.grid.map((row, p) => (
            <React.Fragment key={p}>
              <div style={{
                padding: "16px 0", textAlign: "center",
                fontSize: 12, fontWeight: 700, color: "#8B95A1",
              }}>{p + 1}</div>
              {row.map((sub, di) => {
                const isToday = d.timetable.week.days[di] === todayKo;
                const isFriday = di === 4;
                const isNow = isToday && currentPeriod === p + 1;
                const todayTint = "#EAF2FF";
                return (
                  <div key={di} style={{
                    padding: "14px 8px", borderRadius: 10,
                    background: isNow ? accent : isFriday ? todayTint : "#F8F9FA",
                    color: isNow ? "#fff" : isFriday ? accent : "#4E5968",
                    textAlign: "center", fontSize: 13, fontWeight: 800,
                    letterSpacing: "-0.012em", minHeight: 36,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    {sub}
                    {isNow && (
                      <span style={{
                        position: "absolute", top: 4, right: 4,
                        width: 6, height: 6, borderRadius: 999, background: "#fff",
                        animation: "tdsPulseDot 1.4s infinite",
                      }}/>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Today detail */}
      <div style={{ marginTop: 20, background: "#fff", borderRadius: 18, padding: 24, border: "1px solid #F2F4F6" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em", marginBottom: 16 }}>
          {lang === "ko" ? "오늘 (목요일)" : "Today (Thursday)"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {rowsToday.map((c) => (
            <div key={c.period} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: 14, borderRadius: 12,
              background: c.now ? "#EAF2FF" : "#F8F9FA",
              borderLeft: `4px solid ${c.now ? accent : "#D1D6DB"}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: c.now ? `${accent}1F` : "rgba(7,25,76,0.08)", color: c.now ? accent : "#6B7683",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, flex: "0 0 36px",
              }}>{c.period}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
                  {c[`subject_${lang}`]}
                </div>
                <div style={{ fontSize: 11, color: "#6B7683", marginTop: 2 }}>
                  {c.teacher} · {c.room}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8B95A1", fontVariantNumeric: "tabular-nums" }}>
                {c.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes tdsPulseDot { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
    </div>
  );
}

// ═══ CALENDAR ════════════════════════════════════════════════════════════════
function PCCalendar({ L, lang, accent }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const now = new Date();
  const [month, setMonth] = React.useState(d.calendar?.month || (now.getMonth() + 1));
  const year = d.calendar?.year || now.getFullYear();
  const todayDate = now.getDate();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsFor = (day) => {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return d.calendar.events[key] || [];
  };
  const typeColor = { exam: "#F04452", trip: "#7A5AE0", meeting: "#3182F6", holiday: "#FF9000" };
  const typeLabel = (t) => (lang === "ko"
    ? ({exam:"시험",trip:"체험학습",meeting:"학부모 상담",holiday:"휴업일"})[t]
    : ({exam:"Exam",trip:"Trip",meeting:"Meeting",holiday:"Holiday"})[t]);

  const upcoming = Object.entries(d.calendar.events)
    .filter(([key]) => key >= todayKey)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 10);

  return (
    <div style={{ padding: 32, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 24, border: "1px solid #F2F4F6" }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <button onClick={() => setMonth((m) => Math.max(1, m - 1))} className="tds-press" style={{
            width: 36, height: 36, borderRadius: 10, border: 0, background: "rgba(7,25,76,0.05)",
            cursor: "pointer", color: "#191F28",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}><span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><IcRight size={18}/></span></button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B95A1", letterSpacing: "0.04em" }}>{year}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em" }}>
              {lang === "ko" ? `${month}월` : new Date(year, month - 1).toLocaleString("en-US", { month: "long" })}
            </div>
          </div>
          <button onClick={() => setMonth((m) => Math.min(12, m + 1))} className="tds-press" style={{
            width: 36, height: 36, borderRadius: 10, border: 0, background: "rgba(7,25,76,0.05)",
            cursor: "pointer", color: "#191F28",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}><IcRight size={18}/></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
          {(lang === "ko" ? ["일","월","화","수","목","금","토"] : ["S","M","T","W","T","F","S"]).map((dn, i) => (
            <div key={i} style={{
              textAlign: "center", fontSize: 11, fontWeight: 800,
              padding: "8px 0", color: i === 0 ? "#F04452" : i === 6 ? "#3182F6" : "#8B95A1",
            }}>{dn}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i}/>;
            const evs = eventsFor(day);
            const isToday = day === todayDate && month === 5;
            const weekday = i % 7;
            return (
              <div key={i} style={{
                aspectRatio: "1/1", padding: 6,
                borderRadius: 10,
                background: isToday ? accent : "transparent",
                color: isToday ? "#fff" : weekday === 0 ? "#F04452" : weekday === 6 ? "#3182F6" : "#191F28",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 600 }}>{day}</span>
                {evs.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {evs.slice(0, 2).map((e, j) => (
                      <div key={j} style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "-0.012em",
                        padding: "2px 5px", borderRadius: 4,
                        background: isToday ? "rgba(255,255,255,0.22)" : `${typeColor[e.type]}18`,
                        color: isToday ? "#fff" : typeColor[e.type],
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{e[`title_${lang}`]}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 18, padding: 24, border: "1px solid #F2F4F6" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
          {lang === "ko" ? "다가오는 일정" : "Upcoming"}
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {upcoming.map(([key, evs]) => {
            const ev = evs[0];
            const mm = key.slice(5, 7);
            const dd = key.slice(8);
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 48, padding: "6px 0", borderRadius: 10,
                  background: `${typeColor[ev.type]}14`, color: typeColor[ev.type],
                  textAlign: "center", flex: "0 0 48px",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700 }}>{lang === "ko" ? `${parseInt(mm)}월` : mm}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.012em" }}>{parseInt(dd)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>
                    {ev[`title_${lang}`]}
                  </div>
                  <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 1 }}>{typeLabel(ev.type)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══ FORMS ═══════════════════════════════════════════════════════════════════
function PCForms({ L, lang, accent }) {
  const { data, updateData } = useSHData();
  const [q, setQ] = React.useState("");
  const forms = Array.isArray(data.forms) ? data.forms : [];
  const filtered = forms.filter((f) =>
    !q || (lang === "ko" ? f.title_ko : f.title_en).toLowerCase().includes(q.toLowerCase())
  );
  const recent = [...filtered].sort((a, b) => b.recent - a.recent).slice(0, 4);
  const downloadForm = (form) => {
    if (form.asset) window.SHDownloadAsset?.(form.asset, window.SHSlug?.(form.title_ko, "form"));
    updateData((draft) => {
      const item = (draft.forms || []).find((x) => x.id === form.id);
      if (item) item.recent = Number(item.recent || 0) + 1;
    });
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{
        height: 52, padding: "0 18px", borderRadius: 12,
        background: "#fff", display: "flex", alignItems: "center", gap: 10,
        border: "1px solid #F2F4F6", marginBottom: 24,
      }}>
        <IconSearch size={18} color="#8B95A1"/>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L.forms_search_ph}
          style={{
            flex: 1, border: 0, background: "transparent", outline: "none",
            fontSize: 15, fontWeight: 500, fontFamily: "inherit", color: "#191F28",
          }}/>
      </div>

      {!q && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em", padding: "0 4px 12px" }}>
            {L.forms_recent}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {recent.map((f) => (
              <div key={f.id} onClick={() => downloadForm(f)} className="tds-press" style={{
                background: "#fff", borderRadius: 14, padding: 18,
                border: "1px solid #F2F4F6", cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                <div style={{
                  width: 40, height: 48, borderRadius: 6,
                  background: f.fmt === "HWP" ? "#E8F1FE" : "#FFE9EB",
                  color: f.fmt === "HWP" ? "#1B64DA" : "#D43144",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                }}>{f.fmt}</div>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em",
                    lineHeight: 1.35, minHeight: 36,
                  }}>{f[`title_${lang}`]}</div>
                  <div style={{ fontSize: 11, color: "#8B95A1", marginTop: 4 }}>
                    {f.size}{L.forms_size_kb} · {lang === "ko" ? `${f.recent}회 받음` : `${f.recent}↓`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 14, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em", padding: "0 4px 12px" }}>
        {q ? (lang === "ko" ? `검색 결과 ${filtered.length}건` : `${filtered.length} results`) : L.forms_all}
      </div>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #F2F4F6" }}>
        {filtered.map((f, i) => (
          <div key={f.id} onClick={() => downloadForm(f)} className="tds-press" style={{
            display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
            borderBottom: i < filtered.length - 1 ? "1px solid #F2F4F6" : "none",
            cursor: "pointer",
          }}>
            <div style={{
              width: 36, height: 44, borderRadius: 6,
              background: f.fmt === "HWP" ? "#E8F1FE" : "#FFE9EB",
              color: f.fmt === "HWP" ? "#1B64DA" : "#D43144",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800,
            }}>{f.fmt}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>
                {f[`title_${lang}`]}
              </div>
              <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 2 }}>
                {f.size}{L.forms_size_kb} · {lang === "ko" ? `${f.recent}회 다운로드` : `${f.recent} downloads`}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); downloadForm(f); }} className="tds-press" style={{
              height: 36, padding: "0 14px", borderRadius: 10, border: 0,
              background: `${accent}14`, color: accent,
              fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <IcDownload size={14}/> {L.forms_download}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ EXAMS ═══════════════════════════════════════════════════════════════════
function PCExams({ L, lang, accent }) {
  const { data, updateData } = useSHData();
  const [subj, setSubj] = React.useState("all");
  const [grade, setGrade] = React.useState("all");
  const exams = Array.isArray(data.exams) ? data.exams : [];
  const subjects = ["all", ...new Set(exams.map((e) => e.subject))];
  const filtered = exams.filter((e) => {
    if (subj !== "all" && e.subject !== subj) return false;
    if (grade !== "all" && e.grade !== Number(grade)) return false;
    return true;
  });
  const openExam = (exam) => {
    if (exam.asset) window.SHDownloadAsset?.(exam.asset, window.SHSlug?.(exam.subject, "exam"));
    updateData((draft) => {
      const item = (draft.exams || []).find((x) => x.id === exam.id);
      if (item) item.count = Number(item.count || 0) + 1;
    });
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{
        marginBottom: 20, padding: "16px 20px", borderRadius: 14,
        background: "rgba(255,144,0,0.08)", display: "flex", gap: 12, alignItems: "center",
      }}>
        <IcLock size={20} color="#FF9000"/>
        <div style={{ fontSize: 13, color: "#B96B00", fontWeight: 600, lineHeight: 1.5 }}>
          {L.exams_warn}
        </div>
      </div>

      <div style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#6B7683" }}>{L.exams_filter_subject}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {subjects.map((s) => (
            <Chip key={s} active={subj === s} onClick={() => setSubj(s)}>
              {s === "all" ? L.exams_subjects_all : (lang === "ko" ? s : exams.find(e => e.subject === s)?.subjectEn || s)}
            </Chip>
          ))}
        </div>
        <span style={{ marginLeft: 18, fontSize: 12, fontWeight: 800, color: "#6B7683" }}>{L.exams_filter_grade}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", 1, 2, 3].map((g) => (
            <Chip key={g} active={grade === String(g) || (grade === "all" && g === "all")} onClick={() => setGrade(String(g))}>
              {g === "all" ? L.exams_subjects_all : (lang === "ko" ? `${g}학년` : `G${g}`)}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {filtered.map((e) => {
          const subjEmoji = { "수학":"🧮","영어":"📘","국어":"📖","사회":"🌏","과학":"🔬" }[e.subject] || "📚";
          return (
            <div key={e.id} onClick={() => openExam(e)} className="tds-press" style={{
              background: "#fff", borderRadius: 16, padding: 20,
              border: "1px solid #F2F4F6", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: `${accent}15`, color: accent,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, flex: "0 0 56px",
              }}>{subjEmoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 5, background: "rgba(122,90,224,0.14)", color: "#5A3DC0", fontSize: 10, fontWeight: 800 }}>
                    {e.year}{lang === "ko" ? "년" : ""}
                  </span>
                  <span style={{ padding: "2px 8px", borderRadius: 5, background: "rgba(49,130,246,0.12)", color: "#1B64DA", fontSize: 10, fontWeight: 800 }}>
                    {e.type}{lang === "ko" ? "고사" : ""}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
                  {lang === "ko" ? `${e.grade}학년 ${e.subject}` : `Grade ${e.grade} ${e.subjectEn}`}
                </div>
                <div style={{ fontSize: 12, color: "#6B7683", marginTop: 2 }}>
                  {lang === "ko" ? `${e.count}문항 · PDF + 해설지` : `${e.count} questions · PDF + Answers`}
                </div>
              </div>
              <IconChevRight color="#B0B8C1"/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { PCNotices, PCNoticeDetail, PCMeal, PCTimetable, PCCalendar, PCForms, PCExams });
