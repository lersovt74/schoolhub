// Board.jsx — Suggestions board.
// List of suggestions with like(👍) -> reorder, status pills, and a detail view.

function SHBoardScreen({ t, lang, accent, push }) {
  const { data, updateData } = useSHData();
  const [sort, setSort] = React.useState("hot");  // hot | new
  const [filter, setFilter] = React.useState("all");
  const userCode = window.SHStudentCode ? window.SHStudentCode(window.SH_USER) : `${window.SH_USER?.grade}-${window.SH_USER?.className}-${window.SH_USER?.number}`;

  const toggleLike = (id) => {
    updateData((draft) => {
      const suggestion = (draft.suggestions || []).find((s) => s.id === id);
      if (!suggestion) return;
      if (!Array.isArray(suggestion.likedBy)) suggestion.likedBy = [];
      const idx = suggestion.likedBy.indexOf(userCode);
      if (idx >= 0) suggestion.likedBy.splice(idx, 1);
      else suggestion.likedBy.push(userCode);
      suggestion.likes = suggestion.likedBy.length;
    });
  };

  const sorted = [...(data.suggestions || [])]
    .filter((s) => filter === "all" || s.status === filter)
    .sort((a, b) => sort === "hot" ? b.likes - a.likes : (a.id < b.id ? 1 : -1));

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: "8px 20px 12px", display: "flex", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {t.sug_title}
          </div>
          <div style={{ fontSize: 13, color: "#6B7683", marginTop: 4 }}>
            {t.sug_sub}
          </div>
        </div>
        <button onClick={() => push("board-write")} className="tds-press" style={{
          marginLeft: "auto", marginTop: 4,
          height: 40, padding: "0 14px", borderRadius: 20,
          background: accent, color: "#fff", border: 0,
          fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
          boxShadow: `0 6px 16px ${accent}33`,
        }}>
          <IcEdit size={14}/> {t.sug_write}
        </button>
      </div>

      {/* Sort tabs */}
      <div style={{ padding: "4px 20px 0", display: "flex", gap: 6, alignItems: "center" }}>
        <SHSeg
          value={sort}
          onChange={setSort}
          options={[
            { value: "hot", label: t.sug_sort_hot },
            { value: "new", label: t.sug_sort_new },
          ]}
          style={{ flex: 1 }}
        />
      </div>

      {/* Status filter chips */}
      <div style={{ padding: "12px 20px 0", display: "flex", gap: 6, overflowX: "auto" }}>
        {[
          { v: "all", l: t.sug_sort_all },
          { v: "open", l: t.sug_status_open },
          { v: "review", l: t.sug_sort_review },
          { v: "done", l: t.sug_sort_done },
        ].map((f) => (
          <Chip key={f.v} active={filter === f.v} onClick={() => setFilter(f.v)}>
            {f.l}
          </Chip>
        ))}
      </div>

      {/* Cards */}
      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((s, idx) => (
          <SHCard
            key={s.id}
            onClick={() => push("board-detail", { id: s.id })}
            radius={16}
            pad={16}
            style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}
          >
            {/* Rank ribbon */}
            {sort === "hot" && idx < 3 && (
              <div style={{
                position: "absolute", top: 16, right: 14,
                width: 24, height: 24, borderRadius: 999,
                background: idx === 0 ? "#FFB400" : idx === 1 ? "#B0B8C1" : "#C4824D",
                color: "#fff", fontSize: 11, fontWeight: 800,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>{idx + 1}</div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SHPill color={
                s.status === "done" ? "green" :
                s.status === "review" ? "yellow" : "neutral"
              }>
                {s.status === "done" ? t.sug_status_done
                  : s.status === "review" ? t.sug_status_review
                  : t.sug_status_open}
              </SHPill>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8B95A1" }}>
                {t.sug_anon} · {s[`time_${lang}`]}
              </span>
            </div>

            <div style={{
              fontSize: 16, fontWeight: 800, color: "#191F28",
              letterSpacing: "-0.012em", lineHeight: 1.35,
              paddingRight: sort === "hot" && idx < 3 ? 30 : 0,
            }}>
              {s[`title_${lang}`]}
            </div>

            <div style={{
              fontSize: 13, color: "#4E5968", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {s[`body_${lang}`]}
            </div>

            {s.reply_ko && (
              <div style={{
                marginTop: 4, padding: "10px 12px", borderRadius: 10,
                background: "rgba(0,123,51,0.08)",
                fontSize: 12, color: "#005A24", lineHeight: 1.5,
                display: "flex", gap: 8,
              }}>
                <span style={{ fontWeight: 800, color: "#007B33" }}>{t.sug_replied}</span>
                <span style={{ flex: 1 }}>{s[`reply_${lang}`]}</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(s.id); }}
                className="tds-press"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 999, border: 0,
                  background: (s.likedBy || []).includes(userCode) ? `${accent}1F` : "rgba(7,25,76,0.05)",
                  color: (s.likedBy || []).includes(userCode) ? accent : "#4E5968",
                  fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 200ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                    {(s.likedBy || []).includes(userCode) ? <IcThumbsUp size={14}/> : <IcThumbsUpOutline size={14}/>}
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{s.likes.toLocaleString()}</span>
                  </button>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "#8B95A1" }}>
                {lang === "ko" ? `댓글 ${(s.comments || []).length}` : `${(s.comments || []).length} comments`}
                  </span>
                </div>
          </SHCard>
        ))}
      </div>
    </div>
  );
}

function SHBoardWriteScreen({ t, lang, accent, onBack, showToast }) {
  const [category, setCategory] = React.useState("facility");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = title.trim().length >= 4 && body.trim().length >= 12;

  const submit = () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      window.SHDataState?.update?.((draft) => {
        if (!Array.isArray(draft.suggestions)) draft.suggestions = [];
        draft.suggestions.unshift({
          id: `s-${Date.now()}`,
          title_ko: title.trim(),
          title_en: title.trim(),
          body_ko: body.trim(),
          body_en: body.trim(),
          likes: 0,
          likedBy: [],
          comments: [],
          status: "open",
          author: "익명",
          time_ko: "방금",
          time_en: "now",
        });
      });
      showToast(lang === "ko" ? "건의가 등록됐어요" : "Suggestion submitted");
      onBack();
    }, 900);
  };

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 28 }}>
      <SHNav title={t.sug_write} onBack={onBack}/>

      <div style={{ padding: "8px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7683", marginBottom: 8 }}>
            {lang === "ko" ? "주제" : "Category"}
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {[
              { id: "facility", label: lang === "ko" ? "시설" : "Facilities" },
              { id: "meal", label: lang === "ko" ? "급식" : "Meal" },
              { id: "class", label: lang === "ko" ? "수업" : "Class" },
              { id: "event", label: lang === "ko" ? "행사" : "Events" },
              { id: "other", label: lang === "ko" ? "기타" : "Other" },
            ].map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </div>

        <SHInput
          label={lang === "ko" ? "제목" : "Title"}
          hint={lang === "ko" ? "4자 이상" : "At least 4 chars"}
          value={title}
          onChange={setTitle}
          placeholder={lang === "ko" ? "예) 급식실 동선을 개선해 주세요" : "e.g. Improve cafeteria flow"}
        />
        <SHInput
          label={lang === "ko" ? "내용" : "Details"}
          hint={lang === "ko" ? "12자 이상" : "At least 12 chars"}
          value={body}
          onChange={setBody}
          placeholder={lang === "ko" ? "불편했던 점과 개선 아이디어를 적어주세요" : "Share the pain point and your idea"}
          multiline
        />

        <SHCard radius={14} pad={14} bg="rgba(49,130,246,0.08)" style={{ display: "flex", gap: 10 }}>
          <IcShieldCheck size={20} color={accent}/>
          <div style={{ fontSize: 12, color: "#4E5968", lineHeight: 1.5 }}>
            {lang === "ko"
              ? "건의는 익명으로 등록돼요. 비방이나 개인정보가 포함된 글은 숨김 처리될 수 있어요."
              : "Suggestions are posted anonymously. Personal data or abuse may be hidden."}
          </div>
        </SHCard>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <Button
          size="xl"
          color="brand"
          fullWidth
          loading={submitting}
          disabled={!canSubmit}
          onClick={submit}
          style={{ background: accent }}
        >
          {t.sug_write}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Board detail
// ─────────────────────────────────────────────────────────────────────────────
function SHBoardDetailScreen({ t, lang, accent, sid, onBack, showToast }) {
  const { data, updateData } = useSHData();
  const s = (data.suggestions || []).find((x) => x.id === sid) || (data.suggestions || [])[0];
  const [commentText, setCommentText] = React.useState("");
  const userCode = window.SHStudentCode ? window.SHStudentCode(window.SH_USER) : `${window.SH_USER?.grade}-${window.SH_USER?.className}-${window.SH_USER?.number}`;
  const comments = s?.comments || [];
  const likes = s?.likes || 0;
  const liked = !!s && (s.likedBy || []).includes(userCode);

  const toggleLike = () => {
    updateData((draft) => {
      const item = (draft.suggestions || []).find((x) => x.id === sid);
      if (!item) return;
      if (!Array.isArray(item.likedBy)) item.likedBy = [];
      const idx = item.likedBy.indexOf(userCode);
      if (idx >= 0) item.likedBy.splice(idx, 1);
      else item.likedBy.push(userCode);
      item.likes = item.likedBy.length;
    });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    updateData((draft) => {
      const item = (draft.suggestions || []).find((x) => x.id === sid);
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
    showToast(lang === "ko" ? "댓글이 등록됐어요" : "Comment posted");
  };

  if (!s) return null;

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 100 }}>
      <SHNav title="" onBack={onBack}/>

      <div style={{ padding: "8px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SHPill color={
            s.status === "done" ? "green" :
            s.status === "review" ? "yellow" : "neutral"
          }>
            {s.status === "done" ? t.sug_status_done
              : s.status === "review" ? t.sug_status_review
              : t.sug_status_open}
          </SHPill>
          <span style={{ fontSize: 12, color: "#8B95A1" }}>{t.sug_anon} · {s[`time_${lang}`]}</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", lineHeight: 1.3, marginTop: 10 }}>
          {s[`title_${lang}`]}
        </div>
        <div style={{ fontSize: 15, color: "#4E5968", lineHeight: 1.6, marginTop: 10 }}>
          {s[`body_${lang}`]}
        </div>
      </div>

      {s.reply_ko && (
        <div style={{ padding: "0 16px 16px" }}>
          <SHCard radius={16} pad={16} bg="rgba(0,123,51,0.06)">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SHTile bg="rgba(0,123,51,0.15)" color="#007B33" size={32} radius={10}>
                <IconCheck size={18}/>
              </SHTile>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#007B33" }}>{t.sug_replied}</div>
              <div style={{ marginLeft: "auto", fontSize: 11, color: "#8B95A1" }}>
                {lang === "ko" ? "2일 전" : "2d ago"}
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: "#005A24", lineHeight: 1.5 }}>
              {s[`reply_${lang}`]}
            </div>
          </SHCard>
        </div>
      )}

      {/* Comments */}
      <div style={{ padding: "0 20px 12px", fontSize: 14, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>
        {lang === "ko" ? `댓글 ${comments.length}` : `${comments.length} comments`}
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {comments.map((c) => (
          <SHCard key={c.id} radius={14} pad={14} bg={c.staff ? "rgba(49,130,246,0.06)" : "#fff"}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {c.staff ? (
                <SHPill color="blue">{c.author}</SHPill>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4E5968" }}>{c.author}</span>
              )}
              <span style={{ fontSize: 11, color: "#8B95A1" }}>· {c[`time_${lang}`]}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#191F28", lineHeight: 1.5 }}>
              {c[`body_${lang}`]}
            </div>
          </SHCard>
        ))}
      </div>

      {/* Floating like + comment bar */}
      <SHBottomCTA>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={toggleLike} className="tds-press" style={{
            height: 52, padding: "0 16px", borderRadius: 14, border: 0,
            background: liked ? `${accent}1F` : "rgba(7,25,76,0.05)",
            color: liked ? accent : "#191F28",
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            transition: "all 200ms cubic-bezier(.2,.8,.2,1)",
          }}>
            {liked ? <IcThumbsUp size={18}/> : <IcThumbsUpOutline size={18}/>}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{likes.toLocaleString()}</span>
          </button>
          <input
            value={commentText}
            placeholder={lang === "ko" ? "댓글을 적어주세요" : "Add a comment"}
            style={{
              flex: 1, height: 52, padding: "0 16px", borderRadius: 14, border: 0,
              background: "rgba(7,25,76,0.05)", color: "#191F28", fontFamily: "inherit",
              fontSize: 14, fontWeight: 500, outline: "none",
            }}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && commentText.trim()) addComment();
            }}
          />
        </div>
      </SHBottomCTA>
    </div>
  );
}

Object.assign(window, { SHBoardScreen, SHBoardWriteScreen, SHBoardDetailScreen });
