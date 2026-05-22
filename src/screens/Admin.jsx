// Admin.jsx — mobile admin management console.

function SHAdminScreen({ t, lang, accent, onBack }) {
  const { data, updateData } = useSHData();
  const [tab, setTab] = React.useState("notice");
  const [noticeTitle, setNoticeTitle] = React.useState("");
  const [noticeBody, setNoticeBody] = React.useState("");
  const [noticeTarget, setNoticeTarget] = React.useState("all");
  const [noticeTargetValue, setNoticeTargetValue] = React.useState("");
  const [noticeAssets, setNoticeAssets] = React.useState([]);
  const [boardReplies, setBoardReplies] = React.useState({});
  const [reportNotes, setReportNotes] = React.useState({});
  const [uploading, setUploading] = React.useState(false);
  const [statusDropdown, setStatusDropdown] = React.useState(null); // { key, id }
  const [quoteText, setQuoteText] = React.useState("");
  const [quoteAuthor, setQuoteAuthor] = React.useState("");
  const [ddayLabel, setDdayLabel] = React.useState("");
  const [ddayDate, setDdayDate] = React.useState("");
  const noticeFileRef = React.useRef(null);
  const formFileRef = React.useRef(null);
  const examFileRef = React.useRef(null);

  // Sync quote fields when data loads or changes
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

  const sendNotice = () => {
    if (!noticeTitle.trim()) return;
    if (noticeTarget !== "all" && !noticeTargetValue.trim()) return;
    updateData((draft) => {
      if (!Array.isArray(draft.notices)) draft.notices = [];
      draft.notices.unshift({
        id: `n-${Date.now()}`,
        tag: "공지",
        title: noticeTitle.trim(),
        body: noticeBody.trim(),
        time_ko: "방금",
        time_en: "now",
        pinned: true,
        target: noticeTarget,
        targetValue: noticeTargetValue.trim(),
        attachments: noticeAssets,
        createdAt: new Date().toISOString(),
        createdAtLabel: new Date().toLocaleString("ko-KR"),
      });
    });
    setNoticeTitle("");
    setNoticeBody("");
    setNoticeTargetValue("");
    setNoticeAssets([]);
  };

  const setStatus = (key, id, status) => {
    updateData((draft) => {
      const item = (draft[key] || []).find((x) => x.id === id);
      if (item) item.status = status;
    });
  };

  const removeItem = (key, id) => {
    updateData((draft) => {
      draft[key] = (draft[key] || []).filter((x) => x.id !== id);
    });
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
    if (!files?.length) return;
    setUploading(true);
    try {
      const assets = await (window.SHReadFiles ? window.SHReadFiles(files) : []);
      if (!assets?.length) return;
      updateData((draft) => {
        const key = kind === "form" ? "forms" : "exams";
        if (!Array.isArray(draft[key])) draft[key] = [];
        assets.forEach((asset) => {
          const baseName = asset.name.replace(/\.[^.]+$/, "");
          if (kind === "form") {
            draft.forms.unshift({
              id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              title_ko: baseName,
              title_en: baseName,
              fmt: (asset.ext || "file").toUpperCase(),
              size: Math.max(1, Math.round((asset.size || 0) / 1024)),
              recent: 0,
              asset,
            });
          } else {
            draft.exams.unshift({
              id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              subject: baseName,
              subjectEn: baseName,
              grade: Number(window.SH_USER?.grade || 3),
              year: new Date().getFullYear(),
              term: 1,
              type: "기출",
              count: 0,
              asset,
            });
          }
        });
      });
    } finally {
      setUploading(false);
    }
  };

  // Inline status dropdown component
  const StatusDropdown = ({ dKey, id, current, options }) => {
    const open = statusDropdown?.key === dKey && statusDropdown?.id === id;
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setStatusDropdown(open ? null : { key: dKey, id })}
          style={{ border: 0, background: "transparent", color: accent, cursor: "pointer", fontWeight: 700 }}
        >
          상태변경
        </button>
        {open && (
          <div style={{
            position: "absolute", right: 0, top: "100%", zIndex: 200,
            background: "#fff", border: "1px solid #E5E8EB", borderRadius: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 120,
          }}>
            {options.map((opt) => (
              <button key={opt.v} onClick={() => { setStatus(dKey, id, opt.v); setStatusDropdown(null); }}
                style={{
                  display: "block", width: "100%", padding: "10px 14px", border: 0,
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
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 20 }}
      onClick={() => { if (statusDropdown) setStatusDropdown(null); }}>
      <SHNav title="관리자 페이지" onBack={onBack}/>

      <div style={{ padding: "8px 16px 0", display: "flex", gap: 6, overflowX: "auto" }}>
        {[
          { v: "notice", l: "공지" },
          { v: "lost", l: "분실물" },
          { v: "reports", l: "신고" },
          { v: "board", l: "게시판" },
          { v: "docs", l: "자료실" },
          { v: "settings", l: "설정" },
        ].map((x) => <Chip key={x.v} active={tab === x.v} onClick={() => setTab(x.v)}>{x.l}</Chip>)}
      </div>

      {tab === "notice" && (
        <div style={{ padding: "12px 16px 0" }}>
          <SHCard radius={16} pad={14}>
            <SHInput label="공지 제목" value={noticeTitle} onChange={setNoticeTitle} placeholder="내용을 입력하세요" />
            <div style={{ marginTop: 10 }}>
              <SHInput label="공지 내용" value={noticeBody} onChange={setNoticeBody} placeholder="자세한 안내를 적어주세요" multiline />
            </div>
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
            <div style={{ marginTop: 10 }}>
              <input ref={noticeFileRef} type="file" accept="image/*,.pdf,.hwp,.doc,.docx" multiple style={{ display: "none" }}
                onChange={async (e) => setNoticeAssets(await window.SHReadFiles?.(e.target.files) || [])}/>
              <button onClick={() => noticeFileRef.current?.click()} style={{
                width: "100%", height: 42, borderRadius: 10, border: "1px dashed #B0B8C1",
                background: "#fff", color: "#4E5968", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>이미지 / 파일 첨부</button>
              {noticeAssets.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {noticeAssets.map((asset) => (
                    <div key={asset.id} style={{ fontSize: 12, color: "#6B7683" }}>{asset.name}</div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={sendNotice} style={{
              marginTop: 12, width: "100%", height: 42, borderRadius: 10, border: 0,
              background: accent, color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}>공지 전송</button>
          </SHCard>

          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {(data.notices || []).slice(0, 10).map((n) => (
              <SHCard key={n.id} radius={12} pad={12} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#191F28" }}>{n.title}</div>
                  {Array.isArray(n.attachments) && n.attachments.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: 11, color: "#6B7683" }}>
                      첨부 {n.attachments.length}개 · {n.attachments.map((asset) => asset.name).join(", ")}
                    </div>
                  )}
                </div>
                <button onClick={() => removeItem("notices", n.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </SHCard>
            ))}
          </div>
        </div>
      )}

      {tab === "lost" && (
        <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {(data.lostItems || []).length === 0 && <SHCard radius={12} pad={12}>분실물 등록 내역이 없습니다.</SHCard>}
          {(data.lostItems || []).map((it) => (
            <SHCard key={it.id} radius={12} pad={12}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title_ko}</div>
                  <div style={{ fontSize: 11, color: "#6B7683", marginTop: 2 }}>
                    {it.category === "found" ? "찾아가세요" : "찾아주세요"} · {it.place_ko}
                  </div>
                </div>
                <Chip active>{lostStatusLabel(it.status)}</Chip>
                <div onClick={(e) => e.stopPropagation()}>
                  <StatusDropdown dKey="lostItems" id={it.id} current={it.status} options={[
                    { v: "open", l: "찾는 중" },
                    { v: "keep", l: "보관 중" },
                    { v: "done", l: "주인 만남" },
                  ]}/>
                </div>
                <button onClick={() => removeItem("lostItems", it.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
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
              <div style={{ marginTop: 8 }}>
                <SHInput
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
                <div onClick={(e) => e.stopPropagation()}>
                  <StatusDropdown dKey="reports" id={r.id} current={r.status} options={[
                    { v: "received", l: "접수완료" },
                    { v: "review", l: "검토 중" },
                    { v: "resolved", l: "처리 완료" },
                  ]}/>
                </div>
                <button onClick={() => removeItem("reports", r.id)} style={{ marginLeft: "auto", border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title_ko}</div>
                  <div style={{ fontSize: 11, color: "#6B7683", marginTop: 2 }}>
                    👍 {s.likes || 0} · 댓글 {(s.comments || []).length}
                  </div>
                </div>
                <Chip active>{boardStatusLabel(s.status)}</Chip>
                <div onClick={(e) => e.stopPropagation()}>
                  <StatusDropdown dKey="suggestions" id={s.id} current={s.status} options={[
                    { v: "open", l: "검토 전" },
                    { v: "review", l: "검토 중" },
                    { v: "done", l: "처리 완료" },
                  ]}/>
                </div>
                <button onClick={() => removeItem("suggestions", s.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </div>
              <div style={{ marginTop: 8 }}>
                <SHInput
                  label="답변"
                  value={boardReplies[s.id] ?? (s.reply_ko || "")}
                  onChange={(v) => setBoardReplies((prev) => ({ ...prev, [s.id]: v }))}
                  placeholder="학생에게 보여줄 답변을 적어주세요"
                  multiline
                />
                <button onClick={() => saveBoardReply(s.id)} style={{ marginTop: 8, border: 0, background: "transparent", color: accent, cursor: "pointer", fontWeight: 800 }}>답변 저장</button>
              </div>
            </SHCard>
          ))}
        </div>
      )}

      {tab === "docs" && (
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input ref={formFileRef} type="file" accept=".pdf,.hwp,.doc,.docx" multiple style={{ display: "none" }} onChange={(e) => addFilesToState(e.target.files, "form")} />
            <input ref={examFileRef} type="file" accept=".pdf,.hwp,.doc,.docx" multiple style={{ display: "none" }} onChange={(e) => addFilesToState(e.target.files, "exam")} />
            <button onClick={() => !uploading && formFileRef.current?.click()} style={{ flex: 1, height: 42, borderRadius: 10, border: 0, background: "#E8F1FE", color: "#1B64DA", fontWeight: 800, cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>{uploading ? "업로드 중…" : "출결 양식 업로드"}</button>
            <button onClick={() => !uploading && examFileRef.current?.click()} style={{ flex: 1, height: 42, borderRadius: 10, border: 0, background: "#FFF6DD", color: "#B96B00", fontWeight: 800, cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>{uploading ? "업로드 중…" : "기출문제 업로드"}</button>
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

      {tab === "settings" && (
        <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Quote / Motto editor */}
          <SHCard radius={16} pad={14}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#191F28", marginBottom: 10 }}>명언 / 모토</div>
            <SHInput label="명언 내용" value={quoteText} onChange={setQuoteText} placeholder="예) 청춘! 그것은 행운이다." />
            <div style={{ marginTop: 8 }}>
              <SHInput label="출처 (선택)" value={quoteAuthor} onChange={setQuoteAuthor} placeholder="예) 고은" />
            </div>
            <button onClick={saveQuote} style={{
              marginTop: 10, width: "100%", height: 42, borderRadius: 10, border: 0,
              background: accent, color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}>저장</button>
          </SHCard>

          {/* D-Day manager */}
          <SHCard radius={16} pad={14}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#191F28", marginBottom: 10 }}>디데이 관리</div>
            {(data.ddays || []).length === 0 && (
              <div style={{ fontSize: 12, color: "#8B95A1", marginBottom: 10 }}>등록된 디데이가 없습니다.</div>
            )}
            {(data.ddays || []).map((dd) => (
              <div key={dd.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #F2F4F6" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{dd.label}</div>
                  <div style={{ fontSize: 11, color: "#6B7683" }}>{dd.date}</div>
                </div>
                <button onClick={() => removeItem("ddays", dd.id)} style={{ border: 0, background: "transparent", color: "#D43144", cursor: "pointer" }}>삭제</button>
              </div>
            ))}
            <div style={{ marginTop: 10 }}>
              <SHInput label="이름 (예: 1학기 중간고사)" value={ddayLabel} onChange={setDdayLabel} placeholder="디데이 이름" />
              <div style={{ marginTop: 8 }}>
                <SHInput label="날짜 (YYYY-MM-DD)" value={ddayDate} onChange={setDdayDate} placeholder="예) 2026-06-15" />
              </div>
              <button onClick={addDday} style={{
                marginTop: 8, width: "100%", height: 42, borderRadius: 10, border: 0,
                background: ddayLabel.trim() && ddayDate.trim() ? accent : "rgba(7,25,76,0.05)",
                color: ddayLabel.trim() && ddayDate.trim() ? "#fff" : "#B0B8C1",
                fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}>디데이 추가</button>
            </div>
          </SHCard>
        </div>
      )}
    </div>
  );
}

window.SHAdminScreen = SHAdminScreen;
