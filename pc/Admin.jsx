// pc/Admin.jsx — desktop admin management.

function PCAdmin({ L, lang, accent }) {
  const { data, updateData } = useSHData();
  const [tab, setTab] = React.useState("notice");
  const [title, setTitle] = React.useState("");
  const [target, setTarget] = React.useState("all");
  const [targetValue, setTargetValue] = React.useState("");

  const removeItem = (key, id) => updateData((draft) => { draft[key] = (draft[key] || []).filter((x) => x.id !== id); });
  const cycleStatus = (key, id, order) => updateData((draft) => {
    const item = (draft[key] || []).find((x) => x.id === id);
    if (!item) return;
    const i = order.indexOf(item.status);
    item.status = order[(i + 1) % order.length];
  });

  const sendNotice = () => {
    if (!title.trim()) return;
    if (target !== "all" && !targetValue.trim()) return;
    updateData((draft) => {
      if (!Array.isArray(draft.notices)) draft.notices = [];
      draft.notices.unshift({
        id: `n-${Date.now()}`,
        tag: "공지",
        title: title.trim(),
        time_ko: "방금",
        time_en: "now",
        pinned: true,
        target,
        targetValue: targetValue.trim(),
      });
    });
    setTitle("");
    setTargetValue("");
  };

  const addForm = () => {
    const formTitle = window.prompt("양식 이름");
    if (!formTitle) return;
    updateData((draft) => {
      if (!Array.isArray(draft.forms)) draft.forms = [];
      draft.forms.unshift({
        id: `f-${Date.now()}`,
        title_ko: formTitle.trim(),
        title_en: formTitle.trim(),
        fmt: "PDF",
        size: 0,
        recent: 0,
      });
    });
  };

  const addExam = () => {
    const subject = window.prompt("과목명");
    if (!subject) return;
    updateData((draft) => {
      if (!Array.isArray(draft.exams)) draft.exams = [];
      draft.exams.unshift({
        id: `e-${Date.now()}`,
        subject: subject.trim(),
        subjectEn: subject.trim(),
        grade: Number(window.SH_USER?.grade || 3),
        year: new Date().getFullYear(),
        term: 1,
        type: "기말",
        count: 0,
      });
    });
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { v: "notice", l: "주요공지 전송" },
          { v: "lost", l: "분실물 관리" },
          { v: "reports", l: "신고 목록" },
          { v: "board", l: "게시판 관리" },
          { v: "docs", l: "자료실 관리" },
        ].map((x) => <Chip key={x.v} active={tab === x.v} onClick={() => setTab(x.v)}>{x.l}</Chip>)}
      </div>

      {tab === "notice" && (
        <PCCard title="공지 전송" pad={20}>
          <PCField label="공지 제목" value={title} onChange={setTitle} placeholder="내용을 입력하세요" />
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            {["single", "grade", "all"].map((v) => (
              <Chip key={v} active={target === v} onClick={() => setTarget(v)}>
                {v === "single" ? "개별" : v === "grade" ? "학년" : "전체"}
              </Chip>
            ))}
          </div>
          {target !== "all" && (
            <div style={{ marginTop: 12 }}>
              <PCField label={target === "single" ? "대상(예: 3-5-12)" : "대상 학년"} value={targetValue} onChange={setTargetValue} />
            </div>
          )}
          <button onClick={sendNotice} style={{
            marginTop: 14, height: 42, padding: "0 18px", borderRadius: 10, border: 0,
            background: accent, color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          }}>전송</button>
        </PCCard>
      )}

      {tab === "lost" && (
        <PCCard title="분실물 관리" pad={16}>
          {(data.lostItems || []).map((it) => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F2F4F6" }}>
              <div style={{ flex: 1 }}>{it.title_ko}</div>
              <Chip active>{it.status}</Chip>
              <button onClick={() => cycleStatus("lostItems", it.id, ["open", "keep", "done"])} style={{ border: 0, background: "transparent", color: accent, cursor: "pointer" }}>상태변경</button>
            </div>
          ))}
        </PCCard>
      )}

      {tab === "reports" && (
        <PCCard title="신고 목록" pad={16}>
          {(data.reports || []).length === 0 && <div style={{ color: "#6B7683" }}>신고 내역이 없습니다.</div>}
          {(data.reports || []).map((r) => (
            <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid #F2F4F6" }}>
              <div style={{ fontSize: 12, color: "#8B95A1" }}>{r.code} · {r.category} · {r.when}</div>
              <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700 }}>{r.what}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                <Chip active>{r.status}</Chip>
                <button onClick={() => cycleStatus("reports", r.id, ["review", "resolved"])} style={{ border: 0, background: "transparent", color: accent, cursor: "pointer" }}>상태변경</button>
              </div>
            </div>
          ))}
        </PCCard>
      )}

      {tab === "board" && (
        <PCCard title="게시판 관리" pad={16}>
          {(data.suggestions || []).map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F2F4F6" }}>
              <div style={{ flex: 1 }}>{s.title_ko}</div>
              <button onClick={() => cycleStatus("suggestions", s.id, ["open", "review", "done"])} style={{ border: 0, background: "transparent", color: accent, cursor: "pointer" }}>상태변경</button>
              <button onClick={() => removeItem("suggestions", s.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
            </div>
          ))}
        </PCCard>
      )}

      {tab === "docs" && (
        <PCCard title="자료실 관리" pad={16}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={addForm} style={{
              height: 34, padding: "0 12px", borderRadius: 8, border: 0,
              background: "#E8F1FE", color: "#1B64DA", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}>출결 양식 추가</button>
            <button onClick={addExam} style={{
              height: 34, padding: "0 12px", borderRadius: 8, border: 0,
              background: "#FFF6DD", color: "#B96B00", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}>기출문제 추가</button>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>출결 양식 {data.forms?.length || 0}개</div>
          <div style={{ marginTop: 8 }}>
            {(data.forms || []).slice(0, 10).map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F2F4F6" }}>
                <div style={{ flex: 1, fontSize: 13 }}>{f.title_ko}</div>
                <button onClick={() => removeItem("forms", f.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 14 }}>기출문제 {data.exams?.length || 0}개</div>
          <div style={{ marginTop: 8 }}>
            {(data.exams || []).slice(0, 10).map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F2F4F6" }}>
                <div style={{ flex: 1, fontSize: 13 }}>{e.subject} · {e.grade}학년 · {e.year}</div>
                <button onClick={() => removeItem("exams", e.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </div>
            ))}
          </div>
        </PCCard>
      )}
    </div>
  );
}

window.PCAdmin = PCAdmin;
