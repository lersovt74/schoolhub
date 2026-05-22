// pc/Anonymous.jsx — desktop anonymous report center.
// 4 sub-views in one route: intro / form / done / status. Big "vault" feel.

function PCAnon({ L, lang, accent }) {
  const [view, setView] = React.useState("intro"); // intro | form | done | status | check
  const rootRef = React.useRef(null);
  const [state, setState] = React.useState({
    category: "violence", when: "", where: "", what: "", code: null,
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [enteredCode, setEnteredCode] = React.useState("");

  const submit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      setState((s) => ({ ...s, code }));
      setSubmitting(false);
      setView("done");
    }, 1200);
  };

  React.useEffect(() => {
    const scroller = rootRef.current?.parentElement;
    if (scroller && typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [view]);

  return (
    <div ref={rootRef} style={{
      minHeight: "100%", background: "#0F172A", color: "#fff",
      padding: 40,
    }}>
      {view === "intro" && <Intro L={L} lang={lang} onStart={() => setView("form")} onCheck={() => setView("check")}/>}
      {view === "form" && <Form L={L} lang={lang} accent={accent} state={state} setState={setState}
        submitting={submitting} onSubmit={submit} onBack={() => setView("intro")}/>}
      {view === "done" && <Done L={L} lang={lang} code={state.code}
        onView={() => setView("status")} onBack={() => setView("intro")}/>}
      {view === "check" && <Check L={L} lang={lang} accent={accent} code={enteredCode} setCode={setEnteredCode}
        onSubmit={() => { setState((s) => ({ ...s, code: enteredCode || "X3K9MZ" })); setView("status"); }}
        onBack={() => setView("intro")} prefill={state.code}/>}
      {view === "status" && <Status L={L} lang={lang} accent={accent} code={state.code || "X3K9MZ"}
        onBack={() => setView("intro")}/>}
    </div>
  );
}

// ─── 1. Intro ───────────────────────────────────────────────────────────────
function Intro({ L, lang, onStart, onCheck }) {
  return (
    <div style={{
      maxWidth: 980,
      margin: "0 auto",
      minHeight: "calc(100vh - 250px)",
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: 32,
      alignItems: "center",
    }}>
      {/* Left: hero */}
      <div>
        <div style={{
          display: "inline-block",
          padding: "6px 12px", borderRadius: 999,
          background: "rgba(125,168,255,0.18)",
          color: "#7DA8FF",
          fontSize: 11, fontWeight: 800, letterSpacing: "0.16em",
        }}>
          {lang === "ko" ? "끝에서 끝까지 암호화" : "END-TO-END ENCRYPTED"}
        </div>
        <h1 style={{
          margin: "18px 0 0", fontSize: 44, fontWeight: 800, color: "#fff",
          letterSpacing: "-0.03em", lineHeight: 1.15,
        }}>
          {L.anon_hero_title}
        </h1>
        <p style={{
          margin: "16px 0 0", fontSize: 17, color: "rgba(255,255,255,0.7)",
          lineHeight: 1.6, whiteSpace: "pre-line", maxWidth: 420,
        }}>{L.anon_hero_sub}</p>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button onClick={onStart} className="tds-press" style={{
            height: 56, padding: "0 32px", borderRadius: 14, border: 0,
            background: "#fff", color: "#0F172A",
            fontSize: 16, fontWeight: 800, letterSpacing: "-0.012em",
            cursor: "pointer", fontFamily: "inherit",
          }}>{L.anon_start}</button>
          <button onClick={onCheck} className="tds-press" style={{
            height: 56, padding: "0 24px", borderRadius: 14, border: 0,
            background: "rgba(255,255,255,0.06)", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>{L.anon_check}</button>
        </div>
      </div>

      {/* Right: promises */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { ic: <IcShieldLock size={20}/>, text: L.anon_promise1 },
          { ic: <IcLock size={20}/>, text: L.anon_promise2 },
          { ic: <IcCopy size={20}/>, text: L.anon_promise3 },
        ].map((row, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "20px 22px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(49,130,246,0.18)", color: "#7DA8FF",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flex: "0 0 40px",
            }}>{row.ic}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.012em", lineHeight: 1.45 }}>
              {row.text}
            </div>
          </div>
        ))}
        <div style={{
          marginTop: 4, padding: "14px 18px",
          background: "rgba(255,255,255,0.04)", borderRadius: 12,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <IcLight size={18} color="#FFB400"/>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
            {lang === "ko"
              ? "주변에 사람이 많다면 창을 작게 줄여서 작성해도 괜찮아요. 작성 중 페이지를 닫으면 내용이 저장되지 않아요 — 이는 안전을 위한 의도된 동작이에요."
              : "Drafts aren't auto-saved — that's deliberate. Close the tab anytime."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Form ────────────────────────────────────────────────────────────────
function Form({ L, lang, accent, state, setState, submitting, onSubmit, onBack }) {
  const cats = [
    { v: "violence", l: L.anon_form_cat_violence, ic: "⚠️" },
    { v: "corrupt",  l: L.anon_form_cat_corrupt,  ic: "🛡" },
    { v: "etc",      l: L.anon_form_cat_etc,      ic: "💬" },
  ];
  const canSubmit = state.what.trim().length >= 10 && state.where.trim() && state.when.trim();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button onClick={onBack} className="tds-press" style={{
        height: 36, padding: "0 14px", borderRadius: 10, border: 0,
        background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)",
        cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>← {L.back}</button>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#7DA8FF", letterSpacing: "0.16em" }}>
          {lang === "ko" ? "STEP 1 / 1" : "STEP 1 / 1"}
        </div>
        <h2 style={{ margin: "8px 0 0", fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
          {L.anon_form_title}
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          {lang === "ko" ? "아래 정보 중 어떤 것도 작성자를 식별하지 않아요." : "Nothing here can be traced back to you."}
        </p>
      </div>

      {/* Category */}
      <div style={{ marginTop: 32 }}>
        <FieldLabel>{L.anon_form_cat}</FieldLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
          {cats.map((c) => {
            const on = state.category === c.v;
            return (
              <button key={c.v} onClick={() => setState((s) => ({ ...s, category: c.v }))} className="tds-press" style={{
                padding: "20px 16px", textAlign: "left",
                background: on ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)",
                border: on ? "1.5px solid #fff" : "1.5px solid transparent",
                borderRadius: 14, color: "#fff", cursor: "pointer",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 24 }}>{c.ic}</span>
                <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.012em" }}>{c.l}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* When / Where row */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DarkField label={L.anon_form_when} value={state.when}
          onChange={(v) => setState((s) => ({ ...s, when: v }))}
          placeholder={lang === "ko" ? "예) 5월 18일 점심시간" : "e.g. May 18, lunch"}/>
        <DarkField label={L.anon_form_where} value={state.where}
          onChange={(v) => setState((s) => ({ ...s, where: v }))}
          placeholder={lang === "ko" ? "예) 본관 화장실 앞" : "e.g. Outside main bldg restroom"}/>
      </div>

      {/* What — big */}
      <div style={{ marginTop: 16 }}>
        <DarkField label={L.anon_form_what} value={state.what}
          onChange={(v) => setState((s) => ({ ...s, what: v }))}
          placeholder={L.anon_form_what_ph} multiline/>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 6, textAlign: "right" }}>
          {state.what.length} / 2000
        </div>
      </div>

      <div style={{
        marginTop: 16, padding: "14px 18px",
        background: "rgba(49,130,246,0.10)", color: "#7DA8FF",
        borderRadius: 12, fontSize: 13, fontWeight: 500, lineHeight: 1.55,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <IcLock size={18}/>
        <span>
          {lang === "ko"
            ? "제출 시점에 즉시 암호화돼요. 학교 관리자도 본인이 받은 6자리 코드 없이는 내용을 열어볼 수 없어요."
            : "Encrypted on submit. Even staff need the 6-digit code to open this case."}
        </span>
      </div>

      <button onClick={onSubmit} disabled={!canSubmit || submitting} className="tds-press" style={{
        marginTop: 24, width: "100%", height: 60, borderRadius: 14, border: 0,
        background: canSubmit && !submitting ? "#fff" : "rgba(255,255,255,0.16)",
        color: canSubmit && !submitting ? "#0F172A" : "rgba(255,255,255,0.4)",
        fontSize: 17, fontWeight: 800, letterSpacing: "-0.012em",
        cursor: canSubmit && !submitting ? "pointer" : "not-allowed", fontFamily: "inherit",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        {submitting ? (
          <>
            <span style={{
              display: "inline-block", width: 16, height: 16, borderRadius: 999,
              border: "2px solid rgba(15,23,42,0.2)", borderTopColor: "#0F172A",
              animation: "spin 0.8s linear infinite",
            }}/>
            {lang === "ko" ? "암호화 중…" : "Encrypting…"}
          </>
        ) : (
          <><IcLock size={18}/> {L.anon_form_submit}</>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.012em" }}>{children}</div>;
}

function DarkField({ label, value, onChange, placeholder, multiline }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: multiline ? "14px 16px" : "0 16px",
        minHeight: multiline ? 180 : 52,
        display: "flex", alignItems: multiline ? "stretch" : "center",
      }}>
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            style={{
              flex: 1, minHeight: 152, border: 0, background: "transparent",
              resize: "vertical", outline: "none", fontFamily: "inherit",
              fontSize: 14, color: "#fff", lineHeight: 1.6,
            }}/>
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            style={{
              flex: 1, border: 0, background: "transparent", outline: "none",
              fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.012em",
            }}/>
        )}
      </div>
    </div>
  );
}

// ─── 3. Done — code reveal ──────────────────────────────────────────────────
function Done({ L, lang, code, onView, onBack }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    try { navigator.clipboard?.writeText(code); } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ maxWidth: 560, margin: "40px auto 0", textAlign: "center" }}>
      <div style={{
        width: 96, height: 96, borderRadius: "50%",
        background: "rgba(49,130,246,0.18)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, position: "relative",
      }}>
        <IcShieldCheck size={56} color="#7DA8FF"/>
        <div style={{
          position: "absolute", top: -6, right: 6, fontSize: 18,
          animation: "sparkle 1.6s infinite",
        }}>✨</div>
      </div>
      <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>
        {L.anon_done_title}
      </h2>
      <p style={{ margin: "12px 0 0", fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
        {L.anon_done_sub}
      </p>

      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#7DA8FF", letterSpacing: "0.16em" }}>
          {L.anon_code}
        </div>
        <div style={{
          marginTop: 12, padding: "28px 20px",
          background: "rgba(255,255,255,0.06)",
          border: "1.5px dashed rgba(125,168,255,0.4)",
          borderRadius: 18,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {code?.split("").map((ch, i) => (
            <span key={i} style={{
              width: 52, height: 64, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)", borderRadius: 10,
              fontSize: 32, fontWeight: 800, color: "#fff",
              fontFamily: "var(--tds-font-mono)",
            }}>{ch}</span>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: "#FFB400", display: "inline-flex", alignItems: "center", gap: 6 }}>
          ⚠ {L.anon_code_save}
        </div>
      </div>

      <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={copy} className="tds-press" style={{
          height: 52, padding: "0 20px", borderRadius: 14, border: 0,
          background: "rgba(255,255,255,0.12)", color: "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          <IcCopy size={16}/>
          {copied ? (lang === "ko" ? "복사됨" : "Copied") : L.anon_code_copy}
        </button>
        <button onClick={onView} className="tds-press" style={{
          height: 52, padding: "0 28px", borderRadius: 14, border: 0,
          background: "#fff", color: "#0F172A",
          fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
        }}>
          {lang === "ko" ? "상태 보기 →" : "View status →"}
        </button>
      </div>

      <style>{`@keyframes sparkle { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </div>
  );
}

// ─── 4. Check — enter code ──────────────────────────────────────────────────
function Check({ L, lang, accent, code, setCode, onSubmit, onBack, prefill }) {
  return (
    <div style={{ maxWidth: 560, margin: "20px auto 0" }}>
      <button onClick={onBack} className="tds-press" style={{
        height: 36, padding: "0 14px", borderRadius: 10, border: 0,
        background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)",
        cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>← {L.back}</button>

      <h2 style={{ margin: "32px 0 0", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>
        {L.anon_check_input_title}
      </h2>

      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
        {[0,1,2,3,4,5].map((i) => (
          <div key={i} style={{
            aspectRatio: "1/1.1",
            background: "rgba(255,255,255,0.06)",
            border: code[i] ? "1.5px solid #7DA8FF" : "1.5px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, fontWeight: 800, color: "#fff",
            fontFamily: "var(--tds-font-mono)",
          }}>{code[i] || ""}</div>
        ))}
      </div>

      <input autoFocus value={code} maxLength={6}
        onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6))}
        placeholder="X3K9MZ"
        style={{
          marginTop: 20, width: "100%", height: 56, padding: "0 20px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, color: "#fff", fontFamily: "var(--tds-font-mono)",
          fontSize: 20, fontWeight: 700, letterSpacing: "0.2em", textAlign: "center",
          outline: "none", boxSizing: "border-box",
        }}/>

      <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
        {lang === "ko"
          ? "코드를 잊어버렸다면 다시 찾을 수 없어요. 작성자만 알 수 있는 정보이기 때문이에요."
          : "Lost codes can't be recovered — they exist only with the reporter."}
      </div>

      {prefill && (
        <button onClick={() => setCode(prefill)} style={{
          marginTop: 12, border: 0, background: "transparent",
          color: "#7DA8FF", fontSize: 13, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit", padding: 0,
        }}>
          {lang === "ko" ? `이전 코드 사용: ${prefill}` : `Use last code: ${prefill}`}
        </button>
      )}

      <button onClick={onSubmit} disabled={code.length !== 6} className="tds-press" style={{
        marginTop: 24, width: "100%", height: 56, borderRadius: 14, border: 0,
        background: code.length === 6 ? "#fff" : "rgba(255,255,255,0.16)",
        color: code.length === 6 ? "#0F172A" : "rgba(255,255,255,0.4)",
        fontSize: 16, fontWeight: 800, letterSpacing: "-0.012em",
        cursor: code.length === 6 ? "pointer" : "not-allowed", fontFamily: "inherit",
      }}>{L.anon_check_submit}</button>
    </div>
  );
}

// ─── 5. Status — timeline ───────────────────────────────────────────────────
function Status({ L, lang, accent, code, onBack }) {
  const steps = [
    { key: "received", title: L.anon_status_received, when_ko: "2026.05.21 09:14", when_en: "May 21, 9:14",
      desc_ko: "신고가 안전하게 접수됐어요. 학생 안전부에 자동 전달됐어요.",
      desc_en: "Report received and auto-routed to the safety officer." },
    { key: "review", title: L.anon_status_review, when_ko: "2026.05.21 14:02", when_en: "May 21, 14:02",
      desc_ko: "안전부 선생님이 내용을 확인하는 중이에요. 추가 정보가 필요할 수 있어요.",
      desc_en: "Officer is reviewing. May request more info.", current: true },
    { key: "resolved", title: L.anon_status_resolved, when_ko: "—", when_en: "—",
      desc_ko: "처리가 끝나면 결과를 이 코드로 다시 확인할 수 있어요.",
      desc_en: "Result will appear here when resolved.", pending: true },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button onClick={onBack} className="tds-press" style={{
        height: 36, padding: "0 14px", borderRadius: 10, border: 0,
        background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)",
        cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>← {L.back}</button>

      {/* Code header */}
      <div style={{
        marginTop: 24, padding: 24, borderRadius: 18,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "rgba(125,168,255,0.18)", color: "#7DA8FF",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flex: "0 0 56px",
        }}>
          <IcShieldCheck size={32}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}>
            {L.anon_code}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--tds-font-mono)", letterSpacing: "0.08em", marginTop: 2, color: "#fff" }}>
            {code}
          </div>
        </div>
        <span style={{
          padding: "6px 12px", borderRadius: 999,
          background: "rgba(125,168,255,0.22)", color: "#7DA8FF",
          fontSize: 12, fontWeight: 800, letterSpacing: "-0.012em",
        }}>{L.anon_status_review}</span>
      </div>

      {/* Timeline */}
      <div style={{
        marginTop: 20, padding: 28, borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.012em" }}>
          {lang === "ko" ? "처리 상황" : "Progress"}
        </div>
        <div style={{ marginTop: 20, position: "relative", paddingLeft: 36 }}>
          <div style={{ position: "absolute", left: 13, top: 16, bottom: 16, width: 2, background: "rgba(255,255,255,0.12)" }}/>
          {steps.map((s, i) => (
            <div key={s.key} style={{ position: "relative", paddingBottom: i < steps.length - 1 ? 28 : 0 }}>
              <div style={{
                position: "absolute", left: -36, top: 0,
                width: 28, height: 28, borderRadius: 999,
                background: s.pending ? "rgba(255,255,255,0.1)" : (s.current ? "#7DA8FF" : "#fff"),
                color: s.pending ? "rgba(255,255,255,0.5)" : "#0F172A",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: s.current ? "0 0 0 5px rgba(125,168,255,0.18)" : "none",
              }}>
                {s.pending ? (
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
                ) : (
                  <IconCheck size={16}/>
                )}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.pending ? "rgba(255,255,255,0.5)" : "#fff", letterSpacing: "-0.012em" }}>
                {s.title}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                {s[`when_${lang}`]}
              </div>
              <div style={{ fontSize: 14, color: s.pending ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.75)", marginTop: 8, lineHeight: 1.5 }}>
                {s[`desc_${lang}`]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.PCAnon = PCAnon;
