// HomeScreen.jsx — SchoolHub main dashboard.
// Mixes: greeting header, meal + timetable hero cards, notices, lost & found feed,
// upcoming events, quick shortcuts.

function SHHomeScreen({ t, lang, accent, mealLayout, showAllergyWarning, onGo }) {
  const { data: d } = useSHData();
  const notices = window.SHVisibleNotices ? window.SHVisibleNotices(d.notices, window.SH_USER) : (d.notices || []);
  const nowInfo = useSchoolNow();
  const timeUtil = window.SHSchoolTime;
  const todayMeal = d.meal?.today || { items: [], kcal: 0 };
  const tt = timeUtil ? timeUtil.getTodayTimetableRows(d.timetable?.today || [], nowInfo) : (d.timetable?.today || []);
  const nowClass = tt.find((c) => c.now);
  const currentLabel = timeUtil ? timeUtil.getSegmentLabel(nowInfo.current, lang) : (lang === "ko" ? "시간표 확인" : "Check timetable");
  const dateLine = nowInfo ? `${lang === "ko" ? nowInfo.dateKo : nowInfo.dateEn} · ${currentLabel}` : "";
  const headline = timeUtil ? timeUtil.getHomeHeadline(nowInfo, lang, t.studentName) : "";
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
        dateLabel: `${mm}.${dd}`,
        title_ko: ev?.title_ko || "",
        title_en: ev?.title_en || ev?.title_ko || "",
        color: c,
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

  // Lost items for home: only "찾아가세요(found)" that are still active
  const lostItemsFound = (d.lostItems || []).filter((it) => it.category === "found" && it.status !== "done").slice(0, 2);

  return (
    <div style={{
      background: "#F2F4F6", minHeight: "100%", paddingBottom: "calc(20px + env(safe-area-inset-bottom))", paddingTop: "env(safe-area-inset-top)",
    }}>
      {/* Status spacer + top bar */}
      <SHTopBar
        accent={accent}
        school={t.school}
        studentName={t.studentName}
        grade={t.grade}
        t={t}
      />

      {/* Greeting block */}
      <div style={{ padding: "0px 20px 19px", marginTop: -12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent, letterSpacing: "-0.012em" }}>
          {dateLine}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", marginTop: 4, lineHeight: 1.25 }}>
          {t.studentName}{lang === "ko" ? "님, " : ", "}<br/>
          {lang === "ko" && headline.includes("까지 ") ? (() => {
            const idx = headline.indexOf("까지 ") + 3;
            return <>{headline.slice(0, idx)}<br/>{headline.slice(idx + 1)}</>;
          })() : headline}
        </div>
      </div>

      {/* Hero: today's lunch — rich card */}
      <div style={{ padding: "0 16px" }}>
        <SHCard
          onClick={() => onGo("meal")}
          radius={24}
          pad={20}
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${shadeColor(accent, -16)} 100%)`,
            color: "#fff",
            display: "flex", flexDirection: "column", gap: 14,
            position: "relative", overflow: "hidden",
          }}
        >
          {/* deco */}
          <div aria-hidden="true" style={{
            position: "absolute", right: -30, top: -40, width: 180, height: 180,
            borderRadius: "50%", background: "rgba(255,255,255,0.12)",
          }}/>
          <div aria-hidden="true" style={{
            position: "absolute", right: 30, bottom: -50, width: 100, height: 100,
            borderRadius: "50%", background: "rgba(255,255,255,0.08)",
          }}/>

          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            <SHPill color="dark" style={{ background: "rgba(0,0,0,0.18)", color: "#fff" }}>
              {t.home_meal_title}
            </SHPill>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
              {todayMeal.kcal} {t.home_kcal}
            </span>
          </div>

          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginTop: 2 }}>
            {todayMeal.items.map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 16, fontWeight: 700, letterSpacing: "-0.012em" }}>
                {it[lang]}
                {showAllergyWarning && it.allergens.length > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.55)",
                    fontVariantNumeric: "tabular-nums",
                  }}>·{it.allergens.join(".")}</span>
                )}
              </div>
            ))}
          </div>

          <div style={{
            position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 6, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.18)",
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
              {showAllergyWarning ? (lang === "ko" ? "알레르기 번호 표시 중" : "Allergens shown") : (lang === "ko" ? "알레르기 표시 꺼짐" : "Allergens hidden")}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "inline-flex", alignItems: "center", gap: 2 }}>
              {t.home_meal_more} <IconChevRight size={14} />
            </span>
          </div>
        </SHCard>
      </div>

      {/* Today's timetable strip */}
      <div style={{ padding: "12px 16px 0" }}>
        <SHCard radius={20} pad={0} onClick={() => onGo("timetable")} style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7683" }}>{t.home_timetable}</div>
              {nowClass ? (
                <div style={{ fontSize: 17, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em", marginTop: 2 }}>
                  {lang === "ko" ? `지금 ${nowClass.subject_ko}` : `Now: ${nowClass.subject_en}`}
                </div>
              ) : (
                <div style={{ fontSize: 15, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em", marginTop: 2 }}>
                  {lang === "ko" ? `지금 ${currentLabel}` : `Now: ${currentLabel}`}
                </div>
              )}
            </div>
            <IconChevRight color="#B0B8C1" style={{ marginLeft: "auto" }}/>
          </div>
          <div className="sh-mobile-scroll" style={{ display: "flex", gap: 8, padding: "8px 16px 16px", overflowX: "auto" }}>
            {tt.map((c) => (
              <div key={c.period} style={{
                flex: "0 0 76px",
                background: c.now ? c.color : "#F2F4F6",
                color: c.now ? "#fff" : "#191F28",
                borderRadius: 12, padding: "10px 12px",
                display: "flex", flexDirection: "column", gap: 4,
                position: "relative",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.now ? "rgba(255,255,255,0.8)" : "#8B95A1", letterSpacing: "0.04em" }}>
                  {c.period}{lang === "ko" ? "교시" : ""}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.012em" }}>
                  {c[`subject_${lang}`]}
                </div>
                {c.now && <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>● {t.home_timetable_now}</div>}
              </div>
            ))}
          </div>
        </SHCard>
      </div>

      {/* Two-up: notices + upcoming */}
      <div style={{ padding: "12px 16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SHCard radius={20} pad={16} onClick={() => onGo("notices")}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <SHTile bg="rgba(240,68,82,0.12)" color="#F04452" size={28} radius={8}>
              <IcMegaphone size={16} />
            </SHTile>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4E5968" }}>{t.home_notice}</span>
          </div>
          {notices.slice(0, 2).map((n) => (
            <div key={n.id} style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#F04452" }}>{n.pinned ? "📌 " : ""}{n.tag}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#191F28", lineHeight: 1.35, letterSpacing: "-0.012em", marginTop: 2 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 11, color: "#8B95A1", marginTop: 3 }}>{n[`time_${lang}`]}</div>
            </div>
          ))}
        </SHCard>

        <SHCard radius={20} pad={16} onClick={() => onGo("calendar")}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <SHTile bg="rgba(122,90,224,0.14)" color="#7A5AE0" size={28} radius={8}>
              <IcCalendar size={16} />
            </SHTile>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4E5968" }}>{t.home_upcoming}</span>
          </div>
          {upcomingEvents.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{
                width: 40, padding: "4px 0", borderRadius: 8,
                background: "#F2F4F6", textAlign: "center",
                fontSize: 11, fontWeight: 800, color: e.color,
                letterSpacing: "-0.012em",
              }}>{e.dateLabel}</div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>
                {e[`title_${lang}`]}
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#8B95A1" }}>
              {lang === "ko" ? "다가오는 일정이 없습니다." : "No upcoming events."}
            </div>
          )}
        </SHCard>
      </div>

      {/* Anonymous report — featured promo */}
      <div style={{ padding: "12px 16px 0" }}>
        <SHCard
          radius={20}
          pad={0}
          onClick={() => onGo("report")}
          style={{
            background: "#0F172A", color: "#fff", overflow: "hidden", position: "relative",
          }}
        >
          {/* decorative shield */}
          <div aria-hidden="true" style={{
            position: "absolute", right: -10, top: -10, opacity: 0.18,
          }}>
            <IcShieldLock size={140} color="#fff" />
          </div>
          <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.12)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <IcShieldCheck size={24} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em" }}>
                {lang === "ko" ? "100% 익명" : "100% ANONYMOUS"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, letterSpacing: "-0.012em" }}>
                {lang === "ko" ? "마음에 담아두지 마세요" : "Don't keep it to yourself"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                {lang === "ko" ? "익명 신고 · 작성자는 절대 알 수 없어요" : "Your identity is never recorded"}
              </div>
            </div>
            <IconChevRight color="rgba(255,255,255,0.6)" />
          </div>
        </SHCard>
      </div>

      {/* Lost & Found recent — only "찾아가세요(found)" items */}
      <div style={{ padding: "14px 16px 0" }}>
        <SHSection title={t.home_lost_recent} action={lang === "ko" ? "전체보기" : "See all"} onAction={() => onGo("lost")} />
        <SHCard radius={20} pad={0} style={{ overflow: "hidden" }}>
          {lostItemsFound.length === 0 && (
            <div style={{ padding: "20px 16px", fontSize: 13, color: "#8B95A1" }}>
              {lang === "ko" ? "보관 중인 분실물이 없어요." : "No held items right now."}
            </div>
          )}
          {lostItemsFound.map((it, i) => (
            <div key={it.id} onClick={() => onGo("lost", { item: it.id })}
              className="tds-press"
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                borderBottom: i < lostItemsFound.length - 1 ? "1px solid #F2F4F6" : "none",
                cursor: "pointer", background: "#fff",
              }}>
              <SHTile bg={it.color} color={it.iconColor} size={48} radius={12}>
                <span style={{ fontSize: 22 }}>{it.icon}</span>
              </SHTile>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SHPill color={it.category === "lost" ? "red" : "blue"}>
                    {it.category === "lost" ? t.lost_seg_lost : t.lost_seg_found}
                  </SHPill>
                  <span style={{ fontSize: 11, color: "#8B95A1" }}>{it[`time_${lang}`]}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {it[`title_${lang}`]}
                </div>
                <div style={{ fontSize: 12, color: "#6B7683", marginTop: 1 }}>
                  📍 {it[`place_${lang}`]}
                </div>
              </div>
            </div>
          ))}
        </SHCard>
      </div>

      {/* Quick shortcuts */}
      <div style={{ padding: "14px 16px 0" }}>
        <SHSection title={t.home_quick} />
        <SHCard radius={20} pad={16}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
            {[
              { l: t.home_widget_calendar, ic: <IcCalendarFill size={22}/>, bg: "rgba(122,90,224,0.14)", c: "#7A5AE0", go: "calendar" },
              { l: t.home_widget_forms,    ic: <IcDocument size={22}/>,    bg: "rgba(49,130,246,0.14)", c: "#3182F6", go: "forms" },
              { l: t.home_widget_exams,    ic: <IcBook size={22}/>,        bg: "rgba(255,144,0,0.16)",  c: "#FF9000", go: "exams" },
              { l: t.home_widget_suggest,  ic: <IcThumbsUp size={22}/>,    bg: "rgba(0,123,51,0.14)",   c: "#007B33", go: "board" },
            ].map((q) => (
              <button key={q.go} onClick={() => onGo(q.go)} className="tds-press" style={{
                border: 0, background: "transparent", padding: "8px 0", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8, borderRadius: 12,
              }}>
                <SHTile bg={q.bg} color={q.c} size={48} radius={14}>{q.ic}</SHTile>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>{q.l}</span>
              </button>
            ))}
          </div>
        </SHCard>
      </div>

      {/* D-Day — full-width card (same width as quote card) */}
      {ddays.length > 0 && (
        <div style={{ padding: "14px 16px 0" }}>
          <SHCard radius={20} pad={16}>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(ddays.length, 2)}, 1fr)`,
              gap: 10,
            }}>
              {ddays.map((dd) => (
                <div key={dd.id} style={{
                  background: "#F8F9FA", borderRadius: 14, padding: "18px 14px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#8B95A1" }}>{dd.label}</div>
                  <div style={{
                    fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
                    color: dd.diff === 0 ? "#F04452" : dd.diff < 0 ? "#8B95A1" : accent,
                    marginTop: 2,
                  }}>
                    {dd.diff === 0 ? "D-Day" : dd.diff > 0 ? `D-${dd.diff}` : `D+${Math.abs(dd.diff)}`}
                  </div>
                  <div style={{ fontSize: 10, color: "#B0B8C1", marginTop: 4 }}>{dd.date}</div>
                </div>
              ))}
            </div>
          </SHCard>
        </div>
      )}

      {/* Quote / Motto */}
      {quote.text && (
        <div style={{ padding: "14px 16px 0" }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "24px 22px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "'NanumMyeongjo', serif",
              fontSize: 20, fontWeight: 700, color: "#191F28",
              lineHeight: 1.65, letterSpacing: "0.01em",
            }}>
              {quote.text}
            </div>
            {quote.author && (
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: "#8B95A1" }}>— {quote.author}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SHNoticesScreen({ t, lang, accent, onBack, push }) {
  const { data } = useSHData();
  const visibleNotices = window.SHVisibleNotices ? window.SHVisibleNotices(data.notices, window.SH_USER) : data.notices;
  const [tab, setTab] = React.useState("all");
  const [readSet, setReadSet] = React.useState(() => new Set());

  const toggleRead = (id) => {
    setReadSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const notices = visibleNotices.filter((n) => {
    if (tab === "pinned") return !!n.pinned;
    return true;
  });

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 28 }}>
      <SHNav title={t.home_notice} onBack={onBack}/>

      <div style={{ padding: "8px 20px 0" }}>
        <SHSeg
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: lang === "ko" ? "전체" : "All" },
            { value: "pinned", label: lang === "ko" ? "중요" : "Pinned" },
          ]}
        />
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <SHCard radius={16} pad={0}>
          {notices.map((n, i) => {
            const read = readSet.has(n.id);
            return (
              <button
                key={n.id}
                onClick={() => {
                  toggleRead(n.id);
                  push("notice-detail", { id: n.id });
                }}
                className="tds-press"
                style={{
                  width: "100%", border: 0, background: "#fff", textAlign: "left",
                  padding: "14px 16px", cursor: "pointer",
                  borderBottom: i < notices.length - 1 ? "1px solid #F2F4F6" : "none",
                  display: "flex", gap: 12,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flex: "0 0 28px",
                  background: n.pinned ? "rgba(240,68,82,0.12)" : "rgba(7,25,76,0.05)",
                  color: n.pinned ? "#F04452" : "#6B7683",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IcMegaphone size={16}/>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {n.pinned && <SHPill color="red">{lang === "ko" ? "중요" : "Pinned"}</SHPill>}
                    <span style={{ fontSize: 11, color: "#8B95A1" }}>{n[`time_${lang}`]}</span>
                    {!read && (
                      <span style={{
                        marginLeft: "auto", width: 7, height: 7, borderRadius: 999,
                        background: accent, flex: "0 0 7px",
                      }}/>
                    )}
                  </div>
                  <div style={{
                    marginTop: 4,
                    fontSize: 14, fontWeight: read ? 600 : 800, color: "#191F28", letterSpacing: "-0.012em",
                    lineHeight: 1.4,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {n.title}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 12, color: "#6B7683" }}>
                    {n.tag}
                  </div>
                </div>
              </button>
            );
          })}
        </SHCard>
      </div>
    </div>
  );
}

function SHNoticeDetailScreen({ t, lang, accent, onBack, noticeId }) {
  const { data } = useSHData();
  const notice = (data.notices || []).find((n) => n.id === noticeId) || (data.notices || [])[0];
  if (!notice) return null;
  const attachments = Array.isArray(notice.attachments) ? notice.attachments : [];
  const imageAssets = attachments.filter((asset) => String(asset.type || "").startsWith("image/"));
  const fileAssets = attachments.filter((asset) => !String(asset.type || "").startsWith("image/"));

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 28 }}>
      <SHNav title="받은 알리미 상세보기" onBack={onBack}/>
      <div style={{ padding: "10px 16px 0" }}>
        <SHCard radius={20} pad={20}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#191F28", letterSpacing: "-0.03em", lineHeight: 1.24 }}>
            {notice.title}
          </div>
          <div style={{ marginTop: 14, fontSize: 14, color: "#6B7683", lineHeight: 1.45 }}>
            장평중학교
            <br />
            {notice.createdAtLabel || notice.time_ko || notice.time_en}
          </div>
          {!!notice.body && (
            <div style={{ marginTop: 20, fontSize: 15, color: "#191F28", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {notice.body}
            </div>
          )}

          {imageAssets.length > 0 && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {imageAssets.map((asset) => (
                <img key={asset.id} src={asset.dataUrl || asset.url} alt={asset.name} style={{ width: "100%", borderRadius: 14, border: "1px solid #E5E8EB" }} />
              ))}
            </div>
          )}

          {fileAssets.length > 0 && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {fileAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => window.SHDownloadAsset?.(asset, window.SHSlug?.(notice.title, "notice"))}
                  className="tds-press"
                  style={{
                    width: "100%", border: 0, background: "rgba(49,130,246,0.08)", color: "#1B64DA",
                    borderRadius: 14, padding: "14px 16px", fontFamily: "inherit",
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
        </SHCard>
      </div>
    </div>
  );
}

// utility: darken a hex by N percent (negative darkens)
function shadeColor(hex, percent) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (1 + percent / 100);
  r = Math.max(0, Math.min(255, Math.round(r * f)));
  g = Math.max(0, Math.min(255, Math.round(g * f)));
  b = Math.max(0, Math.min(255, Math.round(b * f)));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

window.SHHomeScreen = SHHomeScreen;
window.SHNoticesScreen = SHNoticesScreen;
window.SHNoticeDetailScreen = SHNoticeDetailScreen;
window.shadeColor = shadeColor;
