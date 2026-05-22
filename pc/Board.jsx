// pc/Board.jsx — desktop suggestions: list + detail side, sort/filter.

function PCBoard({ L, lang, accent }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const [sort, setSort] = React.useState("hot");
  const [filter, setFilter] = React.useState("all");
  const [items, setItems] = React.useState(() => d.suggestions.map((s) => ({ ...s, liked: false })));
  const [selected, setSelected] = React.useState(items[0]?.id);

  const sorted = [...items]
    .filter((s) => filter === "all" || s.status === filter)
    .sort((a, b) => sort === "hot" ? b.likes - a.likes : (a.id < b.id ? 1 : -1));

  const toggleLike = (id, e) => {
    e?.stopPropagation();
    setItems((arr) => arr.map((s) =>
      s.id === id ? { ...s, liked: !s.liked, likes: s.likes + (s.liked ? -1 : 1) } : s
    ));
  };

  const current = items.find((s) => s.id === selected);
  const writeSuggestion = () => {
    const title = window.prompt(lang === "ko" ? "건의 제목을 입력하세요" : "Enter suggestion title");
    if (!title) return;
    const body = window.prompt(lang === "ko" ? "건의 내용을 입력하세요" : "Enter suggestion details");
    if (!body) return;
    const newItem = {
      id: `s-${Date.now()}`,
      title_ko: title,
      title_en: title,
      body_ko: body,
      body_en: body,
      likes: 0,
      status: "open",
      author: "익명",
      time_ko: "방금",
      time_en: "now",
    };
    setItems((prev) => [newItem, ...prev]);
    window.SHDataState?.update?.((draft) => {
      if (!Array.isArray(draft.suggestions)) draft.suggestions = [];
      draft.suggestions.unshift(newItem);
    });
    setSelected(newItem.id);
  };

  return (
    <div style={{ padding: 32, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start" }}>
      {/* LEFT */}
      <div>
        <div style={{ padding: "0 4px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{
            display: "inline-flex", padding: 4, background: "rgba(7,25,76,0.06)", borderRadius: 12,
          }}>
            {[
              { v: "hot", l: L.sug_sort_hot },
              { v: "new", l: L.sug_sort_new },
            ].map((s) => {
              const on = s.v === sort;
              return (
                <button key={s.v} onClick={() => setSort(s.v)} style={{
                  height: 36, padding: "0 18px", border: 0, borderRadius: 9,
                  background: on ? "#fff" : "transparent",
                  color: on ? "#191F28" : "#6B7683",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "-0.012em",
                  boxShadow: on ? "0 1px 3px rgba(0,19,43,0.06)" : "none",
                }}>{s.l}</button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {[
              { v: "all", l: L.sug_sort_all },
              { v: "open", l: L.sug_status_open },
              { v: "review", l: L.sug_sort_review },
              { v: "done", l: L.sug_sort_done },
            ].map((f) => (
              <Chip key={f.v} active={filter === f.v} onClick={() => setFilter(f.v)}>{f.l}</Chip>
            ))}
          </div>

          <button onClick={writeSuggestion} className="tds-press" style={{
            marginLeft: "auto",
            height: 36, padding: "0 14px", borderRadius: 10, border: 0,
            background: accent, color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <IcEdit size={14}/> {L.sug_write}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((s, i) => {
            const on = s.id === selected;
            return (
              <div key={s.id} onClick={() => setSelected(s.id)} className="tds-press" style={{
                background: "#fff", borderRadius: 14, padding: 18, cursor: "pointer",
                border: on ? `2px solid ${accent}` : "2px solid transparent",
                display: "flex", flexDirection: "column", gap: 10, position: "relative",
                transition: "all 200ms",
              }}>
                {sort === "hot" && i < 3 && (
                  <div style={{
                    position: "absolute", top: 16, right: 14,
                    width: 26, height: 26, borderRadius: 999,
                    background: i === 0 ? "#FFB400" : i === 1 ? "#B0B8C1" : "#C4824D",
                    color: "#fff", fontSize: 12, fontWeight: 800,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    padding: "3px 8px", borderRadius: 6,
                    background: s.status === "done" ? "rgba(0,123,51,0.12)"
                      : s.status === "review" ? "rgba(255,180,0,0.18)" : "rgba(7,25,76,0.05)",
                    color: s.status === "done" ? "#007B33"
                      : s.status === "review" ? "#8A5C00" : "#4E5968",
                    fontSize: 10, fontWeight: 800,
                  }}>
                    {s.status === "done" ? L.sug_status_done
                      : s.status === "review" ? L.sug_status_review : L.sug_status_open}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#8B95A1" }}>
                    {L.sug_anon} · {s[`time_${lang}`]}
                  </span>
                </div>

                <div style={{
                  fontSize: 16, fontWeight: 800, color: "#191F28",
                  letterSpacing: "-0.012em", lineHeight: 1.35,
                  paddingRight: sort === "hot" && i < 3 ? 32 : 0,
                }}>{s[`title_${lang}`]}</div>
                <div style={{
                  fontSize: 13, color: "#4E5968", lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{s[`body_${lang}`]}</div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={(e) => toggleLike(s.id, e)} className="tds-press" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 999, border: 0,
                    background: s.liked ? `${accent}1F` : "rgba(7,25,76,0.05)",
                    color: s.liked ? accent : "#4E5968",
                    fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 200ms",
                  }}>
                    {s.liked ? <IcThumbsUp size={14}/> : <IcThumbsUpOutline size={14}/>}
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{s.likes.toLocaleString()}</span>
                  </button>
                  <span style={{ fontSize: 12, color: "#8B95A1" }}>
                    {lang === "ko" ? "댓글 12" : "12 comments"}
                  </span>
                  {s.reply_ko && (
                    <span style={{
                      marginLeft: "auto",
                      fontSize: 11, fontWeight: 700, color: "#007B33",
                      padding: "3px 8px", borderRadius: 6, background: "rgba(0,123,51,0.08)",
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}>✓ {L.sug_replied}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: detail */}
      <div style={{
        position: "sticky", top: 32,
        background: "#fff", borderRadius: 18, padding: 28,
        border: "1px solid #F2F4F6",
      }}>
        {current ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                padding: "3px 10px", borderRadius: 6,
                background: current.status === "done" ? "rgba(0,123,51,0.12)"
                  : current.status === "review" ? "rgba(255,180,0,0.18)" : "rgba(7,25,76,0.05)",
                color: current.status === "done" ? "#007B33"
                  : current.status === "review" ? "#8A5C00" : "#4E5968",
                fontSize: 11, fontWeight: 800,
              }}>
                {current.status === "done" ? L.sug_status_done
                  : current.status === "review" ? L.sug_status_review : L.sug_status_open}
              </span>
              <span style={{ fontSize: 11, color: "#8B95A1" }}>{L.sug_anon} · {current[`time_${lang}`]}</span>
            </div>
            <h3 style={{
              margin: "12px 0 0", fontSize: 20, fontWeight: 800,
              color: "#191F28", letterSpacing: "-0.02em", lineHeight: 1.3,
            }}>{current[`title_${lang}`]}</h3>
            <p style={{
              margin: "12px 0 0", fontSize: 14, color: "#4E5968",
              lineHeight: 1.65, whiteSpace: "pre-wrap",
            }}>{current[`body_${lang}`]}</p>

            {current.reply_ko && (
              <div style={{
                marginTop: 18, padding: 16, borderRadius: 12,
                background: "rgba(0,123,51,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(0,123,51,0.15)", color: "#007B33",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}><IconCheck size={16}/></div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#007B33" }}>{L.sug_replied}</div>
                </div>
                <div style={{ marginTop: 10, fontSize: 14, color: "#005A24", lineHeight: 1.55 }}>
                  {current[`reply_${lang}`]}
                </div>
              </div>
            )}

            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={(e) => toggleLike(current.id, e)} className="tds-press" style={{
                height: 44, padding: "0 16px", borderRadius: 12, border: 0,
                background: current.liked ? `${accent}1F` : "rgba(7,25,76,0.05)",
                color: current.liked ? accent : "#191F28",
                fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                {current.liked ? <IcThumbsUp size={16}/> : <IcThumbsUpOutline size={16}/>}
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{current.likes.toLocaleString()}</span>
              </button>
              <span style={{ fontSize: 13, color: "#8B95A1" }}>
                {lang === "ko" ? "댓글 12개" : "12 comments"}
              </span>
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F2F4F6" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
                {lang === "ko" ? "최근 댓글" : "Recent comments"}
              </div>
              {[
                { author: "익명1", time: lang === "ko" ? "3일 전" : "3d", body: lang === "ko" ? "저도 동의해요. 오늘 1학년 동생이랑 부딪혔어요." : "Same — bumped into a 1st grader." },
                { author: lang === "ko" ? "학생회" : "Council", time: lang === "ko" ? "2일 전" : "2d", body: lang === "ko" ? "의견 감사합니다! 학교에 전달했어요." : "Thanks! Raised with the school.", staff: true },
              ].map((c, i) => (
                <div key={i} style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {c.staff ? (
                      <span style={{ padding: "2px 8px", borderRadius: 5, background: "rgba(49,130,246,0.12)", color: "#1B64DA", fontSize: 10, fontWeight: 800 }}>{c.author}</span>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#4E5968" }}>{c.author}</span>
                    )}
                    <span style={{ fontSize: 11, color: "#8B95A1" }}>· {c.time}</span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: "#191F28", lineHeight: 1.55 }}>{c.body}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#8B95A1" }}>
            {lang === "ko" ? "건의를 선택해 주세요" : "Select a suggestion"}
          </div>
        )}
      </div>
    </div>
  );
}

window.PCBoard = PCBoard;
