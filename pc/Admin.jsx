// pc/Admin.jsx — desktop admin management using shared state.

function PCAdmin({ L, lang, accent }) {
  const { data, updateData } = useSHData();
  const [tab, setTab] = React.useState("notice");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [target, setTarget] = React.useState("all");
  const [targetValue, setTargetValue] = React.useState("");
  const [assets, setAssets] = React.useState([]);
  const [boardReplies, setBoardReplies] = React.useState({});
  const [reportNotes, setReportNotes] = React.useState({});
  const [statusDropdown, setStatusDropdown] = React.useState(null); // { key, id }
  const [quoteText, setQuoteText] = React.useState("");
  const [quoteAuthor, setQuoteAuthor] = React.useState("");
  const [ddayLabel, setDdayLabel] = React.useState("");
  const [ddayDate, setDdayDate] = React.useState("");
  const noticeFileRef = React.useRef(null);
  const formFileRef = React.useRef(null);
  const examFileRef = React.useRef(null);

  // Sync quote fields when data loads
  React.useEffect(() => {
    setQuoteText(data.quote?.text || "청춘! 그것은 행운이다.");
    setQuoteAuthor(data.quote?.author || "");
  }, [data.quote?.text, data.quote?.author]);

  const reportStatusLabel = (status) => ({
    received: "접수완료",
    review: "검토 중",
    resolved: "처리 완료",
  }[status] || status);
  const lostStatusLabel = (status) => ({
    open: "찾는 중",
    keep: "보관 중",
    done: "주인 만남",
  }[status] || status);
  const boardStatusLabel = (status) => ({
    open: "검토 전",
    review: "검토 중",
    done: "처리 완료",
  }[status] || status);

  const removeItem = (key, id) => updateData((draft) => {
    draft[key] = (draft[key] || []).filter((x) => x.id !== id);
  });

  const setStatus = (key, id, status) => updateData((draft) => {
    const item = (draft[key] || []).find((x) => x.id === id);
    if (item) item.status = status;
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
        body: body.trim(),
        time_ko: "방금",
        time_en: "now",
        pinned: true,
        target,
        targetValue: targetValue.trim(),
        attachments: assets,
        createdAt: new Date().toISOString(),
        createdAtLabel: new Date().toLocaleString("ko-KR"),
      });
    });
    setTitle("");
    setBody("");
    setTarget("all");
    setTargetValue("");
    setAssets([]);
  };

  const saveBoardReply = (id) => {
    const reply = String(boardReplies[id] || "").trim();
    if (!reply) return;
    updateData((draft) => {
      const item = (draft.suggestions || []).find((x) => x.id === id);
      if (!item) return;
      item.reply_ko = reply;
      item.reply_en = reply;
      if (item.status === "open") item.status = "review";
      if (!Array.isArray(item.comments)) item.comments = [];
      item.comments.push({
        id: `c-admin-${Date.now()}`,
        author: lang === "ko" ? "학생회" : "Council",
        staff: true,
        time_ko: "방금",
        time_en: "now",
        body_ko: reply,
        body_en: reply,
      });
    });
    setBoardReplies((prev) => ({ ...prev, [id]: "" }));
  };

  const saveReportNote = (id) => {
    const note = String(reportNotes[id] || "").trim();
    updateData((draft) => {
      const item = (draft.reports || []).find((x) => x.id === id);
      if (!item) return;
      if (item.status === "resolved") item.resolutionNote = note;
      else item.adminNote = note;
    });
  };

  const saveQuote = () => {
    updateData((draft) => {
      if (!draft.quote) draft.quote = {};
      draft.quote.text = quoteText.trim();
      draft.quote.author = quoteAuthor.trim();
    });
  };

  const addDday = () => {
    if (!ddayLabel.trim() || !ddayDate.trim()) return;
    updateData((draft) => {
      if (!Array.isArray(draft.ddays)) draft.ddays = [];
      draft.ddays.push({ id: `d-${Date.now()}`, label: ddayLabel.trim(), date: ddayDate.trim() });
    });
    setDdayLabel("");
    setDdayDate("");
  };

  const addFilesToState = async (files, kind) => {
    const parsed = await window.SHReadFiles?.(files);
    if (!parsed?.length) return;
    updateData((draft) => {
      const key = kind === "form" ? "forms" : "exams";
      if (!Array.isArray(draft[key])) draft[key] = [];
      parsed.forEach((asset) => {
        if (kind === "form") {
          draft.forms.unshift({
            id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            title_ko: asset.name.replace(/\.[^.]+$/, ""),
            title_en: asset.name.replace(/\.[^.]+$/, ""),
            fmt: (asset.ext || "file").toUpperCase(),
            size: Math.max(1, Math.round((asset.size || 0) / 1024)),
            recent: 0,
            asset,
          });
        } else {
          draft.exams.unshift({
            id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            subject: asset.name.replace(/\.[^.]+$/, ""),
            subjectEn: asset.name.replace(/\.[^.]+$/, ""),
            grade: 3,
            year: new Date().getFullYear(),
            term: 1,
            type: "기출",
            count: 0,
            asset,
          });
        }
      });
    });
  };

  // Inline status dropdown
  const StatusDropdown = ({ dKey, id, current, options }) => {
    const open = statusDropdown?.key === dKey && statusDropdown?.id === id;
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={(e) => { e.stopPropagation(); setStatusDropdown(open ? null : { key: dKey, id }); }}
          style={{ border: 0, background: "transparent", color: accent, cursor: "pointer", fontWeight: 700, padding: "4px 8px" }}>
          상태변경
        </button>
        {open && (
          <div style={{
            position: "absolute", right: 0, top: "100%", zIndex: 200,
            background: "#fff", border: "1px solid #E5E8EB", borderRadius: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 130,
          }}>
            {options.map((opt) => (
              <button key={opt.v} onClick={(e) => { e.stopPropagation(); setStatus(dKey, id, opt.v); setStatusDropdown(null); }}
                style={{
                  display: "block", width: "100%", padding: "10px 16px", border: 0,
                  background: current === opt.v ? `${accent}10` : "transparent",
                  color: current === opt.v ? accent : "#191F28",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  fontWeight: current === opt.v ? 800 : 600, fontSize: 13,
                }}>
                {opt.l}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}
      onClick={() => { if (statusDropdown) setStatusDropdown(null); }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { v: "notice", l: "주요공지 전송" },
          { v: "lost", l: "분실물 관리" },
          { v: "reports", l: "신고 목록" },
          { v: "board", l: "게시판 관리" },
          { v: "docs", l: "자료실 관리" },
          { v: "settings", l: "설정" },
        ].map((x) => <Chip key={x.v} active={tab === x.v} onClick={() => setTab(x.v)}>{x.l}</Chip>)}
      </div>

      {tab === "notice" && (
        <PCCard title="공지 전송" pad={20}>
          <div style={{ display: "grid", gap: 12 }}>
            <PCField label="공지 제목" value={title} onChange={setTitle} placeholder="내용을 입력하세요" />
            <PCField label="공지 내용" value={body} onChange={setBody} placeholder="자세한 안내를 적어주세요" multiline />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {["single", "grade", "all"].map((v) => (
                <Chip key={v} active={target === v} onClick={() => setTarget(v)}>
                  {v === "single" ? "개별" : v === "grade" ? "학년" : "전체"}
                </Chip>
              ))}
            </div>
            {target !== "all" && (
              <PCField label={target === "single" ? "대상(예: 3-5-12)" : "대상 학년(예: 3)"} value={targetValue} onChange={setTargetValue} />
            )}
            <div>
              <input ref={noticeFileRef} type="file" accept="image/*,.pdf,.hwp,.doc,.docx" multiple style={{ display: "none" }} onChange={async (e) => setAssets(await window.SHReadFiles?.(e.target.files) || [])} />
              <button onClick={() => noticeFileRef.current?.click()} style={{
                height: 40, padding: "0 14px", borderRadius: 10, border: "1px dashed #B0B8C1", background: "#fff", color: "#4E5968",
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>이미지 / 파일 첨부</button>
              {!!assets.length && (
                <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                  {assets.map((asset) => <div key={asset.id} style={{ fontSize: 12, color: "#6B7683" }}>{asset.name}</div>)}
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={sendNotice} style={{
                height: 42, padding: "0 18px", borderRadius: 10, border: 0, background: accent, color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}>전송</button>
            </div>
          </div>

          <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
            {(data.notices || []).slice(0, 10).map((n) => (
              <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F2F4F6" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#191F28" }}>{n.title}</div>
                  {n.body && <div style={{ marginTop: 4, fontSize: 12, color: "#6B7683", lineHeight: 1.5 }}>{n.body}</div>}
                  {Array.isArray(n.attachments) && n.attachments.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: 12, color: "#6B7683" }}>
                      첨부 {n.attachments.length}개 · {n.attachments.map((asset) => asset.name).join(", ")}
                    </div>
                  )}
                </div>
                <button onClick={() => removeItem("notices", n.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </div>
            ))}
          </div>
        </PCCard>
      )}

      {tab === "lost" && (
        <PCCard title="분실물 관리" pad={16}>
          {(data.lostItems || []).length === 0 && <div style={{ color: "#6B7683" }}>분실물 등록 내역이 없습니다.</div>}
          {(data.lostItems || []).map((it) => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F2F4F6" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title_ko}</div>
                <div style={{ fontSize: 12, color: "#6B7683", marginTop: 2 }}>{it.category === "found" ? "찾아가세요" : "찾아주세요"} · {it.place_ko}</div>
              </div>
              <Chip active>{lostStatusLabel(it.status)}</Chip>
              <StatusDropdown dKey="lostItems" id={it.id} current={it.status} options={[
                { v: "open", l: "찾는 중" },
                { v: "keep", l: "보관 중" },
                { v: "done", l: "주인 만남" },
              ]}/>
              <button onClick={() => removeItem("lostItems", it.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
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
              <div style={{ marginTop: 10 }}>
                <PCField
                  label={r.status === "resolved" ? "처리 결과" : "관리자 메모"}
                  value={reportNotes[r.id] ?? (r.status === "resolved" ? (r.resolutionNote || "") : (r.adminNote || ""))}
                  onChange={(v) => setReportNotes((prev) => ({ ...prev, [r.id]: v }))}
                  placeholder={r.status === "resolved" ? "최종 처리 결과를 적어주세요" : "진행 상황을 적어주세요"}
                  multiline
                />
                <button onClick={() => saveReportNote(r.id)} style={{ marginTop: 8, border: 0, background: "transparent", color: accent, cursor: "pointer", fontWeight: 800 }}>메모 저장</button>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <Chip active>{reportStatusLabel(r.status)}</Chip>
                <StatusDropdown dKey="reports" id={r.id} current={r.status} options={[
                  { v: "received", l: "접수완료" },
                  { v: "review", l: "검토 중" },
                  { v: "resolved", l: "처리 완료" },
                ]}/>
                <button onClick={() => removeItem("reports", r.id)} style={{ marginLeft: "auto", border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </div>
            </div>
          ))}
        </PCCard>
      )}

      {tab === "board" && (
        <PCCard title="게시판 관리" pad={16}>
          {(data.suggestions || []).map((s) => (
            <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #F2F4F6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title_ko}</div>
                  <div style={{ fontSize: 12, color: "#6B7683", marginTop: 2 }}>👍 {s.likes || 0} · 댓글 {(s.comments || []).length}</div>
                </div>
                <Chip active>{boardStatusLabel(s.status)}</Chip>
                <StatusDropdown dKey="suggestions" id={s.id} current={s.status} options={[
                  { v: "open", l: "검토 전" },
                  { v: "review", l: "검토 중" },
                  { v: "done", l: "처리 완료" },
                ]}/>
                <button onClick={() => removeItem("suggestions", s.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </div>
              <div style={{ marginTop: 10 }}>
                <PCField label="답변" value={boardReplies[s.id] ?? (s.reply_ko || "")} onChange={(v) => setBoardReplies((prev) => ({ ...prev, [s.id]: v }))} placeholder="학생에게 보여줄 답변을 적어주세요" multiline />
                <button onClick={() => saveBoardReply(s.id)} style={{ marginTop: 8, border: 0, background: "transparent", color: accent, cursor: "pointer", fontWeight: 800 }}>답변 저장</button>
              </div>
            </div>
          ))}
        </PCCard>
      )}

      {tab === "docs" && (
        <PCCard title="자료실 관리" pad={16}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input ref={formFileRef} type="file" accept=".pdf,.hwp,.doc,.docx" multiple style={{ display: "none" }} onChange={(e) => addFilesToState(e.target.files, "form")} />
            <input ref={examFileRef} type="file" accept=".pdf,.hwp,.doc,.docx" multiple style={{ display: "none" }} onChange={(e) => addFilesToState(e.target.files, "exam")} />
            <button onClick={() => formFileRef.current?.click()} style={{ height: 34, padding: "0 12px", borderRadius: 8, border: 0, background: "#E8F1FE", color: "#1B64DA", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>출결 양식 업로드</button>
            <button onClick={() => examFileRef.current?.click()} style={{ height: 34, padding: "0 12px", borderRadius: 8, border: 0, background: "#FFF6DD", color: "#B96B00", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>기출문제 업로드</button>
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

      {tab === "settings" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Quote / Motto editor */}
          <PCCard title="명언 / 모토 설정" pad={20}>
            <div style={{ display: "grid", gap: 12 }}>
              <PCField label="명언 내용" value={quoteText} onChange={setQuoteText} placeholder="예) 청춘! 그것은 행운이다." />
              <PCField label="출처 (선택)" value={quoteAuthor} onChange={setQuoteAuthor} placeholder="예) 고은" />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={saveQuote} style={{
                  height: 42, padding: "0 18px", borderRadius: 10, border: 0,
                  background: accent, color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                }}>저장</button>
              </div>
            </div>
            {(data.quote?.text) && (
              <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: "#F8F9FA" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7683", marginBottom: 4 }}>현재 저장된 명언</div>
                <div style={{ fontSize: 14, fontStyle: "italic", color: "#191F28" }}>"{data.quote.text}"</div>
                {data.quote.author && <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 4 }}>— {data.quote.author}</div>}
              </div>
            )}
          </PCCard>

          {/* D-Day manager */}
          <PCCard title="디데이 관리" pad={20}>
            <div style={{ marginBottom: 12 }}>
              {(data.ddays || []).length === 0 && (
                <div style={{ fontSize: 13, color: "#8B95A1", padding: "8px 0" }}>등록된 디데이가 없습니다.</div>
              )}
              {(data.ddays || []).map((dd) => (
                <div key={dd.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F2F4F6" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{dd.label}</div>
                    <div style={{ fontSize: 12, color: "#6B7683" }}>{dd.date}</div>
                  </div>
                  <button onClick={() => removeItem("ddays", dd.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <PCField label="이름 (예: 1학기 중간고사)" value={ddayLabel} onChange={setDdayLabel} placeholder="디데이 이름" />
              <PCField label="날짜 (YYYY-MM-DD)" value={ddayDate} onChange={setDdayDate} placeholder="예) 2026-06-15" />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={addDday} disabled={!ddayLabel.trim() || !ddayDate.trim()} style={{
                  height: 42, padding: "0 18px", borderRadius: 10, border: 0,
                  background: ddayLabel.trim() && ddayDate.trim() ? accent : "rgba(7,25,76,0.05)",
                  color: ddayLabel.trim() && ddayDate.trim() ? "#fff" : "#B0B8C1",
                  fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                }}>디데이 추가</button>
              </div>
            </div>
          </PCCard>
        </div>
      )}
    </div>
  );
}

function PCField({ label, value, onChange, placeholder, multiline }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#4E5968" }}>{label}</div>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
          width: "100%", minHeight: 96, resize: "vertical", borderRadius: 12, border: "1px solid #E5E8EB", padding: "12px 14px",
          fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box",
        }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
          width: "100%", height: 48, borderRadius: 12, border: "1px solid #E5E8EB", padding: "0 14px",
          fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box",
        }} />
      )}
    </div>
  );
}

window.PCAdmin = PCAdmin;
