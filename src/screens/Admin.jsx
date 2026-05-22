// Admin.jsx — mobile admin management console.

function SHAdminScreen({ t, lang, accent, onBack }) {
  const { data, updateData } = useSHData();
  const [tab, setTab] = React.useState("notice");
  const [noticeTitle, setNoticeTitle] = React.useState("");
  const [noticeTarget, setNoticeTarget] = React.useState("all");
  const [noticeTargetValue, setNoticeTargetValue] = React.useState("");

  const sendNotice = () => {
    if (!noticeTitle.trim()) return;
    if (noticeTarget !== "all" && !noticeTargetValue.trim()) return;
    updateData((draft) => {
      if (!Array.isArray(draft.notices)) draft.notices = [];
      draft.notices.unshift({
        id: `n-${Date.now()}`,
        tag: "공지",
        title: noticeTitle.trim(),
        time_ko: "방금",
        time_en: "now",
        pinned: true,
      target: noticeTarget,
      targetValue: noticeTargetValue.trim(),
      });
    });
    setNoticeTitle("");
    setNoticeTargetValue("");
  };

  const cycleStatus = (key, id, order) => {
    updateData((draft) => {
      const arr = draft[key] || [];
      const item = arr.find((x) => x.id === id);
      if (!item) return;
      const i = order.indexOf(item.status);
      item.status = order[(i + 1) % order.length];
    });
  };

  const removeItem = (key, id) => {
    updateData((draft) => {
      draft[key] = (draft[key] || []).filter((x) => x.id !== id);
    });
  };

  const addForm = () => {
    const title = window.prompt(lang === "ko" ? "양식 이름" : "Form title");
    if (!title) return;
    updateData((draft) => {
      if (!Array.isArray(draft.forms)) draft.forms = [];
      draft.forms.unshift({
        id: `f-${Date.now()}`,
        title_ko: title,
        title_en: title,
        fmt: "PDF",
        size: 0,
        recent: 0,
      });
    });
  };

  const addExam = () => {
    const subject = window.prompt(lang === "ko" ? "과목명" : "Subject");
    if (!subject) return;
    updateData((draft) => {
      if (!Array.isArray(draft.exams)) draft.exams = [];
      draft.exams.unshift({
        id: `e-${Date.now()}`,
        subject,
        subjectEn: subject,
        grade: Number(window.SH_USER?.grade || 3),
        year: new Date().getFullYear(),
        term: 1,
        type: "기말",
        count: 0,
      });
    });
  };

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 20 }}>
      <SHNav title="관리자 페이지" onBack={onBack}/>

      <div style={{ padding: "8px 16px 0", display: "flex", gap: 6, overflowX: "auto" }}>
        {[
          { v: "notice", l: "공지" },
          { v: "lost", l: "분실물" },
          { v: "reports", l: "신고" },
          { v: "board", l: "게시판" },
          { v: "docs", l: "자료실" },
        ].map((x) => <Chip key={x.v} active={tab === x.v} onClick={() => setTab(x.v)}>{x.l}</Chip>)}
      </div>

      {tab === "notice" && (
        <div style={{ padding: "12px 16px 0" }}>
          <SHCard radius={16} pad={14}>
            <SHInput label="공지 제목" value={noticeTitle} onChange={setNoticeTitle} placeholder="내용을 입력하세요" />
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              {[
                { v: "single", l: "개별" },
                { v: "grade", l: "학년" },
                { v: "all", l: "전체" },
              ].map((x) => <Chip key={x.v} active={noticeTarget === x.v} onClick={() => setNoticeTarget(x.v)}>{x.l}</Chip>)}
            </div>
            {noticeTarget !== "all" && (
              <div style={{ marginTop: 10 }}>
                <SHInput
                  label={noticeTarget === "single" ? "대상(예: 3-5-12)" : "대상 학년(예: 3)"}
                  value={noticeTargetValue}
                  onChange={setNoticeTargetValue}
                />
              </div>
            )}
            <button onClick={sendNotice} style={{
              marginTop: 12, width: "100%", height: 42, borderRadius: 10, border: 0,
              background: accent, color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}>공지 전송</button>
          </SHCard>

          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {(data.notices || []).slice(0, 10).map((n) => (
              <SHCard key={n.id} radius={12} pad={12} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#191F28" }}>{n.title}</div>
                <button onClick={() => removeItem("notices", n.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </SHCard>
            ))}
          </div>
        </div>
      )}

      {tab === "lost" && (
        <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {(data.lostItems || []).map((it) => (
            <SHCard key={it.id} radius={12} pad={12}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{it.title_ko}</div>
                <Chip active>{it.status}</Chip>
                <button onClick={() => cycleStatus("lostItems", it.id, ["open", "keep", "done"])} style={{ border: 0, background: "transparent", color: accent, cursor: "pointer" }}>상태변경</button>
              </div>
            </SHCard>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {(data.reports || []).length === 0 && <SHCard radius={12} pad={12}>신고 내역이 없습니다.</SHCard>}
          {(data.reports || []).map((r) => (
            <SHCard key={r.id} radius={12} pad={12}>
              <div style={{ fontSize: 12, color: "#6B7683" }}>{r.code} · {r.category}</div>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700 }}>{r.what}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <Chip active>{r.status}</Chip>
                <button onClick={() => cycleStatus("reports", r.id, ["review", "resolved"])} style={{ border: 0, background: "transparent", color: accent, cursor: "pointer" }}>상태변경</button>
              </div>
            </SHCard>
          ))}
        </div>
      )}

      {tab === "board" && (
        <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {(data.suggestions || []).map((s) => (
            <SHCard key={s.id} radius={12} pad={12}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{s.title_ko}</div>
                <button onClick={() => cycleStatus("suggestions", s.id, ["open", "review", "done"])} style={{ border: 0, background: "transparent", color: accent, cursor: "pointer" }}>상태변경</button>
                <button onClick={() => removeItem("suggestions", s.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </div>
            </SHCard>
          ))}
        </div>
      )}

      {tab === "docs" && (
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addForm} style={{ flex: 1, height: 42, borderRadius: 10, border: 0, background: "#E8F1FE", color: "#1B64DA", fontWeight: 800, cursor: "pointer" }}>출결 양식 추가</button>
            <button onClick={addExam} style={{ flex: 1, height: 42, borderRadius: 10, border: 0, background: "#FFF6DD", color: "#B96B00", fontWeight: 800, cursor: "pointer" }}>기출문제 추가</button>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <SHCard radius={12} pad={12}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>양식 {data.forms?.length || 0}개</div>
            </SHCard>
            <SHCard radius={12} pad={12}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>기출문제 {data.exams?.length || 0}개</div>
            </SHCard>
            <SHCard radius={12} pad={12}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#6B7683", marginBottom: 8 }}>출결 양식 목록</div>
              {(data.forms || []).slice(0, 8).map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #F2F4F6" }}>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{f.title_ko}</div>
                  <button onClick={() => removeItem("forms", f.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
                </div>
              ))}
            </SHCard>
            <SHCard radius={12} pad={12}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#6B7683", marginBottom: 8 }}>기출문제 목록</div>
              {(data.exams || []).slice(0, 8).map((e) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #F2F4F6" }}>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{e.subject} · {e.grade}학년 · {e.year}</div>
                  <button onClick={() => removeItem("exams", e.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
                </div>
              ))}
            </SHCard>
          </div>
        </div>
      )}
    </div>
  );
}

window.SHAdminScreen = SHAdminScreen;
