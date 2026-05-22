// pc/Anonymous.jsx — desktop anonymous report center backed by shared state.

function PCAnon({ L, lang, accent }) {
  const { data } = useSHData();
  const [view, setView] = React.useState("intro");
  const [state, setState] = React.useState({ category: "violence", when: "", where: "", what: "", code: "", reportId: "" });
  const [enteredCode, setEnteredCode] = React.useState("");

  const submit = () => {
    const report = window.SHCreateReport?.({
      category: state.category,
      when: state.when,
      where: state.where,
      what: state.what,
    });
    if (!report) return;
    setState((prev) => ({ ...prev, code: report.code, reportId: report.id }));
    setView("done");
  };

  const matched = (data.reports || []).find((r) => String(r.code || "").toUpperCase() === String(enteredCode || "").toUpperCase());

  return (
    <div style={{ minHeight: "100%", background: "#0F172A", color: "#fff", padding: 40 }}>
      {view === "intro" && <PCAnonIntro L={L} lang={lang} onStart={() => setView("form")} onCheck={() => setView("check")} />}
      {view === "form" && <PCAnonForm L={L} lang={lang} accent={accent} state={state} setState={setState} onSubmit={submit} onBack={() => setView("intro")} />}
      {view === "done" && <PCAnonDone L={L} lang={lang} code={state.code} onHome={() => setView("intro")} onView={() => setView("status")} />}
      {view === "check" && <PCAnonCheck L={L} lang={lang} accent={accent} code={enteredCode} setCode={setEnteredCode} onBack={() => setView("intro")} onSubmit={() => { if (matched) { setState((s) => ({ ...s, code: matched.code, reportId: matched.id })); setView("status"); } else window.alert?.(lang === "ko" ? "일치하는 신고 코드를 찾지 못했어요." : "No report matched that code."); }} />}
      {view === "status" && <PCAnonStatus L={L} lang={lang} accent={accent} code={state.code} reportId={state.reportId} onBack={() => setView("intro")} />}
    </div>
  );
}

function PCAnonIntro({ L, lang, onStart, onCheck }) {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", minHeight: "calc(100vh - 250px)", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "center" }}>
      <div>
        <div style={{ display: "inline-block", padding: "6px 12px", borderRadius: 999, background: "rgba(125,168,255,0.18)", color: "#7DA8FF", fontSize: 11, fontWeight: 800 }}>
          {lang === "ko" ? "끝에서 끝까지 암호화" : "END-TO-END ENCRYPTED"}
        </div>
        <h1 style={{ margin: "18px 0 0", fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>{L.anon_hero_title}</h1>
        <p style={{ margin: "16px 0 0", fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 420, whiteSpace: "pre-line" }}>{L.anon_hero_sub}</p>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button onClick={onStart} style={{ height: 56, padding: "0 32px", borderRadius: 14, border: 0, background: "#fff", color: "#0F172A", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{L.anon_start}</button>
          <button onClick={onCheck} style={{ height: 56, padding: "0 24px", borderRadius: 14, border: 0, background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{L.anon_check}</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[L.anon_promise1, L.anon_promise2, L.anon_promise3].map((text, i) => (
          <div key={i} style={{ padding: "20px 22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, fontSize: 14, lineHeight: 1.45 }}>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

function PCAnonForm({ L, lang, accent, state, setState, onSubmit, onBack }) {
  const canSubmit = state.what.trim().length >= 10 && state.when.trim() && state.where.trim();
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button onClick={onBack} style={{ height: 36, padding: "0 14px", borderRadius: 10, border: 0, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>← {L.back}</button>
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#7DA8FF" }}>STEP 1 / 1</div>
        <h2 style={{ margin: "8px 0 0", fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{L.anon_form_title}</h2>
      </div>
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { v: "violence", l: L.anon_form_cat_violence, ic: "⚠️" },
          { v: "corrupt", l: L.anon_form_cat_corrupt, ic: "🛡" },
          { v: "etc", l: L.anon_form_cat_etc, ic: "💬" },
        ].map((c) => {
          const on = state.category === c.v;
          return (
            <button key={c.v} onClick={() => setState((s) => ({ ...s, category: c.v }))} style={{
              padding: "20px 16px", textAlign: "left", background: on ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)",
              border: on ? "1.5px solid #fff" : "1.5px solid transparent", borderRadius: 14, color: "#fff", cursor: "pointer",
            }}>
              <div style={{ fontSize: 24 }}>{c.ic}</div>
              <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800 }}>{c.l}</div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <PCDarkField label={L.anon_form_when} value={state.when} onChange={(v) => setState((s) => ({ ...s, when: v }))} placeholder={lang === "ko" ? "예) 5월 18일 점심시간" : "e.g. lunch time"} />
        <PCDarkField label={L.anon_form_where} value={state.where} onChange={(v) => setState((s) => ({ ...s, where: v }))} placeholder={lang === "ko" ? "예) 본관 화장실 앞" : "e.g. outside restroom"} />
      </div>
      <div style={{ marginTop: 16 }}>
        <PCDarkField label={L.anon_form_what} value={state.what} onChange={(v) => setState((s) => ({ ...s, what: v }))} placeholder={L.anon_form_what_ph} multiline />
      </div>
      <button onClick={onSubmit} disabled={!canSubmit} style={{
        marginTop: 24, width: "100%", height: 60, borderRadius: 14, border: 0,
        background: canSubmit ? "#fff" : "rgba(255,255,255,0.16)", color: canSubmit ? "#0F172A" : "rgba(255,255,255,0.4)",
        fontSize: 17, fontWeight: 800, cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "inherit",
      }}>{L.anon_form_submit}</button>
    </div>
  );
}

function PCDarkField({ label, value, onChange, placeholder, multiline }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{label}</div>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
          minHeight: 180, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)",
          color: "#fff", padding: "14px 16px", resize: "vertical", outline: "none", fontFamily: "inherit", fontSize: 14, lineHeight: 1.6,
        }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
          height: 52, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)",
          color: "#fff", padding: "0 16px", outline: "none", fontFamily: "inherit", fontSize: 15,
        }} />
      )}
    </div>
  );
}

function PCAnonDone({ L, lang, code, onHome, onView }) {
  return (
    <div style={{ maxWidth: 560, margin: "40px auto 0", textAlign: "center" }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{L.anon_done_title}</h2>
      <p style={{ marginTop: 12, fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{L.anon_done_sub}</p>
      <div style={{ marginTop: 24, padding: "28px 20px", background: "rgba(255,255,255,0.06)", borderRadius: 18, display: "flex", justifyContent: "center", gap: 6 }}>
        {String(code || "").split("").map((ch, i) => <span key={i} style={{ width: 52, height: 64, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 32, fontWeight: 800 }}>{ch}</span>)}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "center" }}>
        <button onClick={onHome} style={{ height: 52, padding: "0 20px", borderRadius: 14, border: 0, background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>{lang === "ko" ? "홈으로" : "Home"}</button>
        <button onClick={onView} style={{ height: 52, padding: "0 24px", borderRadius: 14, border: 0, background: "#fff", color: "#0F172A", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{lang === "ko" ? "상태 보기" : "View status"}</button>
      </div>
    </div>
  );
}

function PCAnonCheck({ L, lang, accent, code, setCode, onSubmit, onBack }) {
  return (
    <div style={{ maxWidth: 560, margin: "40px auto 0" }}>
      <button onClick={onBack} style={{ height: 36, padding: "0 14px", borderRadius: 10, border: 0, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>← {L.back}</button>
      <h2 style={{ marginTop: 24, fontSize: 28, fontWeight: 800, color: "#fff" }}>{L.anon_check_input_title}</h2>
      <input value={code} maxLength={6} onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6))} placeholder="X3K9MZ" style={{
        marginTop: 20, width: "100%", height: 56, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", color: "#fff", textAlign: "center",
        fontFamily: "var(--tds-font-mono)", fontSize: 24, letterSpacing: "0.16em", outline: "none",
      }} />
      <button onClick={onSubmit} disabled={String(code || "").length !== 6} style={{
        marginTop: 24, width: "100%", height: 56, borderRadius: 14, border: 0, background: String(code || "").length === 6 ? "#fff" : "rgba(255,255,255,0.16)",
        color: String(code || "").length === 6 ? "#0F172A" : "rgba(255,255,255,0.4)", fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
      }}>{L.anon_check_submit}</button>
    </div>
  );
}

function PCAnonStatus({ L, lang, accent, code, reportId, onBack }) {
  const { data } = useSHData();
  const report = (data.reports || []).find((r) => r.id === reportId) || (data.reports || []).find((r) => String(r.code || "").toUpperCase() === String(code || "").toUpperCase());
  const status = report?.status || "received";
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 40 }}>
      <button onClick={onBack} style={{ height: 36, padding: "0 14px", borderRadius: 10, border: 0, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>← {L.back}</button>
      <div style={{ marginTop: 24, background: "#111C33", borderRadius: 20, padding: 24 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{L.anon_code}</div>
        <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "var(--tds-font-mono)", letterSpacing: "0.12em" }}>{report?.code || code}</div>
        <div style={{ marginTop: 12, display: "inline-flex", padding: "6px 10px", borderRadius: 999, background: "rgba(125,168,255,0.18)", color: "#7DA8FF", fontSize: 12, fontWeight: 800 }}>
          {status === "resolved" ? L.anon_status_resolved : status === "review" ? L.anon_status_review : L.anon_status_received}
        </div>
      </div>
      {report && (
        <div style={{ marginTop: 16, background: "#fff", borderRadius: 18, padding: 20, color: "#191F28" }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{lang === "ko" ? "접수된 신고 내용" : "Submitted report"}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#6B7683", lineHeight: 1.6 }}>
            {lang === "ko" ? `언제: ${report.when || "-"}` : `When: ${report.when || "-"}`}<br />
            {lang === "ko" ? `어디서: ${report.where || "-"}` : `Where: ${report.where || "-"}`}
          </div>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65 }}>{report.what || "-"}</div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F2F4F6" }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{lang === "ko" ? "진행 상황" : "Progress"}</div>
            <div style={{ marginTop: 10, fontSize: 13, color: "#4E5968", lineHeight: 1.7 }}>
              {status === "received" && (lang === "ko" ? "신고가 안전하게 접수됐어요." : "Your report was safely received.")}
              {status === "review" && (report.adminNote || (lang === "ko" ? "관리자가 신고 내용을 확인하고 있어요." : "An administrator is reviewing the report."))}
              {status === "resolved" && (report.resolutionNote || (lang === "ko" ? "처리가 끝났어요." : "The case has been resolved."))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.PCAnon = PCAnon;
