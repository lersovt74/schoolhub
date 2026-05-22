// pc/Board.jsx — desktop suggestions board with shared persistence.

function PCBoard({ L, lang, accent }) {
  const { data, updateData } = useSHData();
  const [sort, setSort] = React.useState("hot");
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState(null);
  const [draftOpen, setDraftOpen] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftBody, setDraftBody] = React.useState("");
  const [commentText, setCommentText] = React.useState("");
  const userCode = window.SHStudentCode ? window.SHStudentCode(window.SH_USER) : "";

  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
  const sorted = [...suggestions]
    .filter((s) => filter === "all" || s.status === filter)
    .sort((a, b) => sort === "hot" ? Number(b.likes || 0) - Number(a.likes || 0) : (a.id < b.id ? 1 : -1));

  React.useEffect(() => {
    if (!sorted.length) {
      setSelected(null);
      return;
    }
    if (!sorted.some((item) => item.id === selected)) {
      setSelected(sorted[0].id);
    }
  }, [selected, sorted]);

  const current = suggestions.find((s) => s.id === selected) || sorted[0] || null;
  const comments = current?.comments || [];
  const liked = !!current && (current.likedBy || []).includes(userCode);

  const toggleLike = (id, e) => {
    e?.stopPropagation?.();
    updateData((draft) => {
      const item = (draft.suggestions || []).find((s) => s.id === id);
      if (!item) return;
      if (!Array.isArray(item.likedBy)) item.likedBy = [];
      const idx = item.likedBy.indexOf(userCode);
      if (idx >= 0) item.likedBy.splice(idx, 1);
      else item.likedBy.push(userCode);
      item.likes = item.likedBy.length;
    });
  };

  const submitSuggestion = () => {
    if (draftTitle.trim().length < 4 || draftBody.trim().length < 12) return;
    updateData((draft) => {
      if (!Array.isArray(draft.suggestions)) draft.suggestions = [];
      draft.suggestions.unshift({
        id: `s-${Date.now()}`,
        title_ko: draftTitle.trim(),
        title_en: draftTitle.trim(),
        body_ko: draftBody.trim(),
        body_en: draftBody.trim(),
        likes: 0,
        likedBy: [],
        comments: [],
        status: "open",
        author: window.SH_USER?.name || "익명",
        time_ko: "방금",
        time_en: "now",
      });
    });
    setDraftTitle("");
    setDraftBody("");
    setDraftOpen(false);
  };

  const addComment = () => {
    if (!current || !commentText.trim()) return;
    updateData((draft) => {
      const item = (draft.suggestions || []).find((s) => s.id === current.id);
      if (!item) return;
      if (!Array.isArray(item.comments)) item.comments = [];
      item.comments.push({
        id: `c-${Date.now()}`,
        author: window.SH_USER?.name || "익명",
        staff: false,
        time_ko: "방금",
        time_en: "now",
        body_ko: commentText.trim(),
        body_en: commentText.trim(),
      });
    });
    setCommentText("");
  };

  return (
    <div style={{ padding: 32, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start" }}>
      <div>
        <div style={{ padding: "0 4px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", padding: 4, background: "rgba(7,25,76,0.06)", borderRadius: 12 }}>
            {[
              { v: "hot", l: L.sug_sort_hot },
              { v: "new", l: L.sug_sort_new },
            ].map((item) => {
              const on = item.v === sort;
              return (
                <button key={item.v} onClick={() => setSort(item.v)} style={{
                  height: 36, padding: "0 18px", border: 0, borderRadius: 9,
                  background: on ? "#fff" : "transparent",
                  color: on ? "#191F28" : "#6B7683",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "-0.012em",
                  boxShadow: on ? "0 1px 3px rgba(0,19,43,0.06)" : "none",
                }}>{item.l}</button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {[
              { v: "all", l: L.sug_sort_all },
              { v: "open", l: L.sug_status_open },
              { v: "review", l: L.sug_sort_review },
              { v: "done", l: L.sug_sort_done },
            ].map((item) => (
              <Chip key={item.v} active={filter === item.v} onClick={() => setFilter(item.v)}>{item.l}</Chip>
            ))}
          </div>

          <button onClick={() => setDraftOpen((v) => !v)} className="tds-press" style={{
            marginLeft: "auto",
            height: 36, padding: "0 14px", borderRadius: 10, border: 0,
            background: accent, color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <IcEdit size={14}/> {L.sug_write}
          </button>
        </div>

        {draftOpen && (
          <PCCard title={L.sug_write} pad={20} style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <PCField label={lang === "ko" ? "제목" : "Title"} value={draftTitle} onChange={setDraftTitle} placeholder={lang === "ko" ? "예) 급식실 동선을 개선해 주세요" : "Suggestion title"} />
              <PCField label={lang === "ko" ? "내용" : "Details"} value={draftBody} onChange={setDraftBody} placeholder={lang === "ko" ? "학생들이 겪는 불편과 개선 아이디어를 적어주세요" : "Describe the issue and your idea"} multiline />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setDraftOpen(false)} style={{
                  height: 38, padding: "0 14px", borderRadius: 10, border: 0,
                  background: "rgba(7,25,76,0.06)", color: "#4E5968", cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
                }}>{lang === "ko" ? "닫기" : "Close"}</button>
                <button onClick={submitSuggestion} style={{
                  height: 38, padding: "0 14px", borderRadius: 10, border: 0,
                  background: accent, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 800,
                }}>{lang === "ko" ? "등록" : "Post"}</button>
              </div>
            </div>
          </PCCard>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((s, i) => {
            const on = s.id === selected;
            const rowLiked = (s.likedBy || []).includes(userCode);
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
                    background: s.status === "done" ? "rgba(0,123,51,0.12)" : s.status === "review" ? "rgba(255,180,0,0.18)" : "rgba(7,25,76,0.05)",
                    color: s.status === "done" ? "#007B33" : s.status === "review" ? "#8A5C00" : "#4E5968",
                    fontSize: 10, fontWeight: 800,
                  }}>
                    {s.status === "done" ? L.sug_status_done : s.status === "review" ? L.sug_status_review : L.sug_status_open}
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
                    background: rowLiked ? `${accent}1F` : "rgba(7,25,76,0.05)",
                    color: rowLiked ? accent : "#4E5968",
                    fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {rowLiked ? <IcThumbsUp size={14}/> : <IcThumbsUpOutline size={14}/>}
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{Number(s.likes || 0).toLocaleString()}</span>
                  </button>
                  <span style={{ fontSize: 12, color: "#8B95A1" }}>
                    {lang === "ko" ? `댓글 ${(s.comments || []).length}` : `${(s.comments || []).length} comments`}
                  </span>
                  {s.reply_ko && (
                    <span style={{
                      marginLeft: "auto",
                      fontSize: 11, fontWeight: 700, color: "#007B33",
                      padding: "3px 8px", borderRadius: 6, background: "rgba(0,123,51,0.08)",
                    }}>✓ {L.sug_replied}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                background: current.status === "done" ? "rgba(0,123,51,0.12)" : current.status === "review" ? "rgba(255,180,0,0.18)" : "rgba(7,25,76,0.05)",
                color: current.status === "done" ? "#007B33" : current.status === "review" ? "#8A5C00" : "#4E5968",
                fontSize: 11, fontWeight: 800,
              }}>
                {current.status === "done" ? L.sug_status_done : current.status === "review" ? L.sug_status_review : L.sug_status_open}
              </span>
              <span style={{ fontSize: 11, color: "#8B95A1" }}>{L.sug_anon} · {current[`time_${lang}`]}</span>
            </div>
            <h3 style={{ margin: "12px 0 0", fontSize: 20, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
              {current[`title_${lang}`]}
            </h3>
            <p style={{ margin: "12px 0 0", fontSize: 14, color: "#4E5968", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
              {current[`body_${lang}`]}
            </p>

            {current.reply_ko && (
              <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: "rgba(0,123,51,0.06)" }}>
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
                background: liked ? `${accent}1F` : "rgba(7,25,76,0.05)",
                color: liked ? accent : "#191F28",
                fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                {liked ? <IcThumbsUp size={16}/> : <IcThumbsUpOutline size={16}/>}
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{Number(current.likes || 0).toLocaleString()}</span>
              </button>
              <span style={{ fontSize: 13, color: "#8B95A1" }}>
                {lang === "ko" ? `댓글 ${comments.length}개` : `${comments.length} comments`}
              </span>
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #F2F4F6" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#191F28", marginBottom: 12 }}>
                {lang === "ko" ? "댓글" : "Comments"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {comments.map((c) => (
                  <div key={c.id} style={{
                    padding: "12px 14px", borderRadius: 12,
                    background: c.staff ? "rgba(49,130,246,0.06)" : "rgba(7,25,76,0.03)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.staff ? "#1B64DA" : "#4E5968" }}>
                        {c.author}
                      </span>
                      <span style={{ fontSize: 11, color: "#8B95A1" }}>· {c[`time_${lang}`]}</span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: "#191F28", lineHeight: 1.55 }}>
                      {c[`body_${lang}`]}
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div style={{ fontSize: 12, color: "#8B95A1" }}>
                    {lang === "ko" ? "아직 댓글이 없어요." : "No comments yet."}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={lang === "ko" ? "댓글을 적어주세요" : "Add a comment"} style={{
                flex: 1, minHeight: 88, borderRadius: 12, border: "1px solid #E5E8EB",
                padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "inherit", fontSize: 14,
              }} />
              <button onClick={addComment} style={{
                width: 96, borderRadius: 12, border: 0, background: accent, color: "#fff",
                fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}>{lang === "ko" ? "등록" : "Post"}</button>
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
