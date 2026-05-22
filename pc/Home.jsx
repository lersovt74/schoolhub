// pc/Home.jsx — desktop dashboard.
// Three-column-ish responsive grid: meal/timetable hero, then notices, calendar,
// lost & found, suggestions teaser. Anonymous prominent footer.

function PCHome({ L, lang, accent, onNavigate }) {
  const { data: d } = useSHData();
  const notices = window.SHVisibleNotices ? window.SHVisibleNotices(d.notices, window.SH_USER) : (d.notices || []);
  const nowInfo = useSchoolNow();
  const timeUtil = window.SHSchoolTime;
  const todayMeal = d.meal?.today || { items: [], kcal: 0 };
  const tt = timeUtil ? timeUtil.getTodayTimetableRows(d.timetable?.today || [], nowInfo) : (d.timetable?.today || []);
  const nowClass = tt.find((c) => c.now);
  const currentLabel = timeUtil ? timeUtil.getSegmentLabel(nowInfo.current, lang) : "";
  const dateLine = nowInfo ? `${lang === "ko" ? nowInfo.dateKo : nowInfo.dateEn} · ${currentLabel}` : "";
  const headline = timeUtil ? timeUtil.getHomeHeadline(nowInfo, lang, L.studentName) : "";
  const quickForms = [...(d.forms || [])].sort((a, b) => b.recent - a.recent).slice(0, 4);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const upcomingEvents = Object.entries(d.calendar?.events || {})
    .filter(([key]) => key >= todayKey)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 4)
    .map(([key, evs]) => {
      const ev = evs[0];
      const mm = Number(key.slice(5, 7));
      const dd = Number(key.slice(8, 10));
      const c = ev?.type === "exam" ? "#F04452"
        : ev?.type === "trip" ? "#7A5AE0"
        : ev?.type === "holiday" ? "#FF9000"
        : "#3182F6";
      return {
        key,
        mm,
        dd,
        c,
        title_ko: ev?.title_ko || "",
        title_en: ev?.title_en || ev?.title_ko || "",
      };
    });

  // D-Day computation
  const todayMidnight = new Date(today); todayMidnight.setHours(0, 0, 0, 0);
  const ddays = (d.ddays || []).map((dd) => {
    if (!dd.date) return null;
    const target = new Date(dd.date); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - todayMidnight) / 86400000);
    return { ...dd, diff };
  }).filter(Boolean).sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff));

  // Quote
  const quote = d.quote || { text: "청춘! 그것은 행운이다.", author: "" };

  // Lost items: only "found" category, active
  const lostItemsFound = (d.lostItems || []).filter((it) => it.category === "found" && it.status !== "done").slice(0, 3);

  return (
    <div style={{
      padding: 32,
      display: "grid",
      gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
      gap: 20, alignContent: "start",
    }}>
      {/* GREETING (full width) */}
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ padding: "0 8px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#8B95A1", letterSpacing: "-0.012em" }}>
            {L.school}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>
            {dateLine}
          </div>
          <div style={{
            fontSize: 30, fontWeight: 800, color: "#191F28",
            letterSpacing: "-0.025em", marginTop: 4, lineHeight: 1.2,
          }}>
            {L.studentName}{lang === "ko" ? "님, " : ", "}{headline}
          </div>
        </div>
      </div>

      {/* LUNCH HERO */}
      <div style={{ gridColumn: "1 / 2" }}>
        <div onClick={() => onNavigate("meal")}
          className="tds-press"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${shadeColor(accent, -22)})`,
            color: "#fff", borderRadius: 20, padding: 28,
            position: "relative", overflow: "hidden", cursor: "pointer",
            maxWidth: 1280,
            minHeight: 252,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
          {/* deco */}
          <div aria-hidden="true" style={{
            position: "absolute", right: -40, top: -60, width: 240, height: 240,
            borderRadius: "50%", background: "rgba(255,255,255,0.10)",
          }}/>
          <div aria-hidden="true" style={{
            position: "absolute", right: 60, bottom: -50, width: 120, height: 120,
            borderRadius: "50%", background: "rgba(255,255,255,0.08)",
          }}/>

          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 999,
              background: "rgba(0,0,0,0.16)", fontSize: 12, fontWeight: 800, letterSpacing: "-0.012em",
            }}>🍚 {L.home_meal_title}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
              {todayMeal.kcal} {L.home_kcal}
            </span>
          </div>

          <div style={{
            position: "relative", marginTop: 18,
            display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px 24px",
          }}>
            {todayMeal.items.map((it, i) => (
              <div key={i} style={{
                fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em",
                display: "flex", alignItems: "baseline", gap: 6, minWidth: 0,
              }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it[lang]}</span>
                {it.allergens.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>
                    ·{it.allergens.join(".")}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{
            position: "relative", marginTop: 20, paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.16)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>
              {lang === "ko"
                ? (todayMeal.originInfo
                  ? `원산지: ${todayMeal.originInfo.replace(/\s+/g, " ").slice(0, 80)}`
                  : "원산지 정보 준비 중")
                : "Origin information"}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 3 }}>
              {L.home_meal_more} <IconChevRight size={14}/>
            </span>
          </div>
        </div>
      </div>

      <PCCard style={{ gridColumn: "2 / 3", alignSelf: "start" }} pad={24}>
        {quote.text && (
          <div style={{
            borderRadius: 14, border: "1px solid #F2F4F6",
            background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "28px 26px",
            minHeight: ddays.length > 0 ? 0 : 180,
          }}>
            <div>
              <div style={{
                fontFamily: "'NanumMyeongjo', serif",
                fontSize: 22, fontWeight: 700, color: "#191F28",
                lineHeight: 1.65, letterSpacing: "0.01em",
              }}>
                {quote.text}
              </div>
              {quote.author && (
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "#8B95A1" }}>— {quote.author}</div>
              )}
            </div>
          </div>
        )}
        {ddays.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ddays.map((dd) => (
              <div key={dd.id} style={{
                flex: "1 1 0", minWidth: 80,
                background: "#F8F9FA", borderRadius: 14, padding: "14px 16px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#8B95A1", marginBottom: 4 }}>{dd.label}</div>
                <div style={{
                  fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
                  color: dd.diff === 0 ? "#F04452" : dd.diff < 0 ? "#8B95A1" : accent,
                }}>
                  {dd.diff === 0 ? "D-Day" : dd.diff > 0 ? `D-${dd.diff}` : `D+${Math.abs(dd.diff)}`}
                </div>
                <div style={{ fontSize: 10, color: "#B0B8C1", marginTop: 4 }}>{dd.date}</div>
              </div>
            ))}
          </div>
        )}
      </PCCard>

      {/* TIMETABLE — right column */}
      <div style={{ gridColumn: "2 / 3", gridRow: "3 / 7", display: "flex", flexDirection: "column", gap: 20 }}>
        <PCCard
          title={L.home_timetable}
          action={lang === "ko" ? "전체보기" : "See all"}
          onAction={() => onNavigate("timetable")}
          pad={20}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7683", marginBottom: 8 }}>
            {lang === "ko" ? `현재 상태: ${currentLabel}` : `Now: ${currentLabel}`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tt.map((c) => (
              <div key={c.period} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 12,
                background: c.now ? `${c.color}12` : "transparent",
                border: c.now ? `1px solid ${c.color}40` : "1px solid transparent",
                position: "relative",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${c.color}1F`, color: c.color,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, flex: "0 0 32px",
                }}>{c.period}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
                      {c[`subject_${lang}`]}
                    </span>
                    {c.now && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, color: c.color,
                        display: "inline-flex", alignItems: "center", gap: 3,
                      }}>
                        <span style={{
                          display: "inline-block", width: 5, height: 5,
                          borderRadius: 999, background: c.color,
                          animation: "tdsPulseDot 1.4s infinite",
                        }}/>
                        {lang === "ko" ? "수업 중" : "Now"}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7683", marginTop: 2 }}>
                    {c.time ? c.time.split("–")[0] : ""}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#8B95A1", fontVariantNumeric: "tabular-nums" }}>
                  {c.time.split("–")[0]}
                </div>
              </div>
            ))}
          </div>
        </PCCard>

        <PCCard
          title={L.forms_title}
          action={lang === "ko" ? "전체보기" : "See all"}
          onAction={() => onNavigate("forms")}
          pad={20}
          style={{ flex: 1 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickForms.map((f) => (
              <div key={f.id}
                className="tds-press"
                onClick={() => onNavigate("forms")}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 2px", borderRadius: 10, cursor: "pointer",
                }}>
                <div style={{
                  width: 32, height: 38, borderRadius: 6,
                  background: f.fmt === "HWP" ? "#E8F1FE" : "#FFE9EB",
                  color: f.fmt === "HWP" ? "#1B64DA" : "#D43144",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, flex: "0 0 32px",
                }}>{f.fmt}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {f[`title_${lang}`]}
                  </div>
                  <div style={{ fontSize: 11, color: "#8B95A1", marginTop: 2 }}>
                    {f.size}{L.forms_size_kb} · {lang === "ko" ? `${f.recent}회` : `${f.recent}x`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PCCard>
      </div>

      {/* NOTICES */}
      <PCCard
        title={L.home_notice}
        action={lang === "ko" ? "전체보기" : "See all"}
        onAction={() => onNavigate("notices")}
        style={{ gridColumn: "1 / 2" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notices.map((n) => (
            <div key={n.id} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 14px", borderRadius: 12,
              background: n.pinned ? "rgba(240,68,82,0.06)" : "#F8F9FA",
              cursor: "pointer",
            }} className="tds-press" onClick={() => onNavigate("notice-detail", { id: n.id })}>
              <div style={{
                width: 4, height: 36, borderRadius: 2,
                background: n.pinned ? "#F04452" : "#D1D6DB", flex: "0 0 4px",
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: n.pinned ? "#F04452" : "#6B7683",
                    letterSpacing: "0.02em",
                  }}>{n.pinned ? "📌 " : ""}{n.tag}</span>
                  <span style={{ fontSize: 11, color: "#8B95A1" }}>· {n[`time_${lang}`]}</span>
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em",
                  marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{n.title}</div>
              </div>
              <IconChevRight size={16} color="#B0B8C1"/>
            </div>
          ))}
        </div>
      </PCCard>

      {/* CALENDAR MINI + LOST & FOUND */}
      <div style={{ gridColumn: "1 / 2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <PCCard
          title={L.home_upcoming}
          action={lang === "ko" ? "달력 보기" : "Calendar"}
          onAction={() => onNavigate("calendar")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingEvents.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, padding: "6px 0", borderRadius: 10,
                  background: `${e.c}14`, color: e.c, textAlign: "center", flex: "0 0 44px",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700 }}>{e.mm}{lang === "ko" ? "월" : "/"}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.012em" }}>{e.dd}</div>
                </div>
                <div style={{
                  flex: 1, fontSize: 13, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em",
                }}>{e[`title_${lang}`]}</div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div style={{ fontSize: 12, color: "#8B95A1" }}>
                {lang === "ko" ? "다가오는 일정이 없습니다." : "No upcoming events."}
              </div>
            )}
          </div>
        </PCCard>

        <PCCard
          title={L.home_lost_recent}
          action={lang === "ko" ? "전체보기" : "See all"}
          onAction={() => onNavigate("lost")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lostItemsFound.length === 0 && (
              <div style={{ fontSize: 12, color: "#8B95A1" }}>
                {lang === "ko" ? "보관 중인 분실물이 없어요." : "No held items right now."}
              </div>
            )}
            {lostItemsFound.map((it) => (
              <div key={it.id} className="tds-press"
                onClick={() => onNavigate("lost")}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 0", cursor: "pointer",
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: it.color, display: "inline-flex",
                  alignItems: "center", justifyContent: "center",
                  flex: "0 0 40px", fontSize: 20,
                }}>{it.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{it[`title_${lang}`]}</div>
                  <div style={{ fontSize: 11, color: "#8B95A1", marginTop: 1, display: "flex", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: it.category === "lost" ? "#D43144" : "#1B64DA" }}>
                      {it.category === "lost" ? L.lost_seg_lost : L.lost_seg_found}
                    </span>
                    · {it[`place_${lang}`]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PCCard>
      </div>

      {/* SUGGESTIONS LEADERBOARD + ANONYMOUS BANNER */}
      <PCCard
        title={lang === "ko" ? "공감 많은 건의" : "Top suggestions"}
        action={lang === "ko" ? "건의함" : "Voice"}
        onAction={() => onNavigate("board")}
        style={{ gridColumn: "1 / 2" }}
      >
        {(() => {
          const isAdmin = window.SHIsAdminUser ? window.SHIsAdminUser() : window.SH_USER?.role === "admin";
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(d.suggestions || []).slice(0, 3).map((s, i) => (
                <div key={s.id} className="tds-press"
                  onClick={() => onNavigate("board")}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "10px 14px", borderRadius: 12,
                    background: "#F8F9FA", cursor: "pointer",
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: i === 0 ? "#FFB400" : i === 1 ? "#B0B8C1" : "#C4824D",
                    color: "#fff", fontSize: 12, fontWeight: 800,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flex: "0 0 28px",
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{s[`title_${lang}`]}</div>
                    <div style={{ fontSize: 11, color: "#8B95A1", marginTop: 1 }}>
                      {s.status === "done" ? L.sug_status_done : s.status === "review" ? L.sug_status_review : L.sug_status_open} · {s[`time_${lang}`]}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: accent }}>
                      <IcThumbsUp size={14}/>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>{(s.likes || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </PCCard>

      {/* ANONYMOUS HERO — full width */}
      <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
        <div onClick={() => onNavigate("anon")}
          className="tds-press"
          style={{
            background: "#0F172A", color: "#fff", borderRadius: 20,
            padding: "32px 36px", cursor: "pointer", position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", gap: 24,
          }}>
          <div aria-hidden="true" style={{
            position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)",
            opacity: 0.16,
          }}>
            <IcShieldLock size={200} color="#fff"/>
          </div>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "rgba(125,168,255,0.18)", color: "#7DA8FF",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flex: "0 0 64px",
          }}>
            <IcShieldCheck size={36}/>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#7DA8FF", letterSpacing: "0.16em" }}>
              {lang === "ko" ? "100% 익명 보장" : "100% ANONYMOUS"}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, marginTop: 4,
              letterSpacing: "-0.02em",
            }}>
              {lang === "ko"
                ? "마음에 담아두지 마세요. 끝에서 끝까지 암호화돼요."
                : "Don't keep it in. End-to-end encrypted."}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
              {lang === "ko"
                ? "IP나 계정 정보는 어디에도 저장되지 않아요. 본인이 받은 6자리 코드만으로 상태를 확인할 수 있어요."
                : "No IP or account is recorded. Only your 6-digit code can open the case."}
            </div>
          </div>
          <button style={{
            padding: "14px 24px", borderRadius: 14, border: 0,
            background: "#fff", color: "#0F172A",
            fontSize: 14, fontWeight: 800, letterSpacing: "-0.012em",
            cursor: "pointer", fontFamily: "inherit",
            flex: "0 0 auto", position: "relative",
          }}>
            {lang === "ko" ? "익명 신고 시작하기 →" : "Start a report →"}
          </button>
        </div>
      </div>

      <style>{`@keyframes tdsPulseDot { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
    </div>
  );
}

window.PCHome = PCHome;
