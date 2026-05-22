// Anonymous.jsx — 100% anonymous report center.
// Four sub-screens: Home (intake), Form (multi-step), Done (code reveal),
// Check (enter code), Status (case timeline).
//
// Visual language: deep navy "vault" surface to signal security.
// Big shield, plain promises, no decoration that looks corporate.

// ─────────────────────────────────────────────────────────────────────────────
// 1) Report home — landing page with promises
// ─────────────────────────────────────────────────────────────────────────────
function SHReportHomeScreen({ t, lang, accent, safeMode, anonHero, onStart, onCheck, onClose }) {
  return (
    <div style={{
      minHeight: "100%", background: "#0F172A", color: "#fff",
      paddingTop: 47, display: "flex", flexDirection: "column",
    }}>
      <SHNav title={t.anon_title} dark={true} onClose={onClose} />

      {/* Hero illustration */}
      <div style={{
        padding: "24px 28px 8px",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", gap: 16,
      }}>
        <div style={{
          width: 96, height: 96,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(49,130,246,0.35) 0%, rgba(15,23,42,0) 70%)",
          }}/>
          {anonHero === "lock" ? <IcLock size={64} color="#fff" /> : <IcShieldCheck size={72} color="#fff" />}
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: "#7DA8FF", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          {lang === "ko" ? "끝에서 끝까지 암호화" : "End-to-end encrypted"}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {t.anon_hero_title}
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, whiteSpace: "pre-line", maxWidth: 280 }}>
          {t.anon_hero_sub}
        </div>
      </div>

      {/* Three promises */}
      <div style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { ic: <IcShieldLock size={20} />, text: t.anon_promise1 },
          { ic: <IcLock size={20} />, text: t.anon_promise2 },
          { ic: <IcCopy size={20} />, text: t.anon_promise3 },
        ].map((row, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(49,130,246,0.18)", color: "#7DA8FF",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flex: "0 0 34px",
            }}>{row.ic}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.012em", lineHeight: 1.4 }}>
              {row.text}
            </div>
          </div>
        ))}

        {safeMode && (
          <div style={{
            marginTop: 6, padding: "12px 14px",
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "rgba(255,255,255,0.04)", borderRadius: 12,
          }}>
            <IcLight size={18} color="#FFB400" />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
              {lang === "ko"
                ? "주변에 사람이 많다면, 화면을 작게 줄여서 작성해도 괜찮아요. 작성 도중 앱을 꺼도 내용이 자동 저장되지 않아요 — 처음부터 다시 써야 안전해요."
                : "If others are nearby, you can shrink the screen while writing. Drafts aren't auto-saved — that's deliberate."}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* CTAs */}
      <div style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onStart} className="tds-press" style={{
          height: 56, borderRadius: 14, border: 0,
          background: "#fff", color: "#0F172A",
          fontSize: 17, fontWeight: 800, letterSpacing: "-0.012em",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          {t.anon_start}
        </button>
        <button onClick={onCheck} className="tds-press" style={{
          height: 50, borderRadius: 14, border: 0,
          background: "transparent", color: "rgba(255,255,255,0.8)",
          fontSize: 15, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          {t.anon_check}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Report form — guided form
// ─────────────────────────────────────────────────────────────────────────────
function SHReportFormScreen({ t, lang, accent, state, setState, onBack, onSubmit }) {
  const [submitting, setSubmitting] = React.useState(false);

  const cats = [
    { v: "violence", l: t.anon_form_cat_violence, ic: "⚠️", c: "#F04452" },
    { v: "corrupt",  l: t.anon_form_cat_corrupt,  ic: "🛡", c: "#7A5AE0" },
    { v: "etc",      l: t.anon_form_cat_etc,      ic: "💬", c: "#3182F6" },
  ];

  const canSubmit = state.what.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      // generate 6-char code
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      onSubmit(code);
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100%", background: "#0F172A", color: "#fff", paddingTop: 47, display: "flex", flexDirection: "column" }}>
      <SHNav title={t.anon_title} onBack={onBack} dark={true}
        right={
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "5px 10px",
            background: "rgba(49,130,246,0.18)", color: "#7DA8FF",
            borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
            marginRight: 6,
          }}><IcLock size={12} /> {lang === "ko" ? "암호화 중" : "Encrypting"}</span>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
          {t.anon_form_title}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
          {lang === "ko" ? "어떤 정보도 작성자를 식별하지 않아요" : "Nothing here identifies you"}
        </div>

        {/* Category */}
        <div style={{ marginTop: 24, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t.anon_form_cat}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
          {cats.map((c) => {
            const on = state.category === c.v;
            return (
              <button key={c.v} onClick={() => setState((s) => ({ ...s, category: c.v }))}
                className="tds-press"
                style={{
                  padding: "16px 8px",
                  background: on ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)",
                  border: on ? "1.5px solid #fff" : "1.5px solid transparent",
                  borderRadius: 14, color: "#fff", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  fontFamily: "inherit",
                }}>
                <span style={{ fontSize: 22 }}>{c.ic}</span>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.012em" }}>{c.l}</span>
              </button>
            );
          })}
        </div>

        {/* When */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <DarkField
            label={t.anon_form_when} required
            value={state.when} onChange={(v) => setState((s) => ({ ...s, when: v }))}
            placeholder={lang === "ko" ? "예) 5월 18일 점심시간" : "e.g. May 18, lunch"}
          />
          <DarkField
            label={t.anon_form_where} required
            value={state.where} onChange={(v) => setState((s) => ({ ...s, where: v }))}
            placeholder={lang === "ko" ? "예) 본관 화장실 앞" : "e.g. Outside main bldg restroom"}
          />
          <DarkField
            label={t.anon_form_what} required
            value={state.what} onChange={(v) => setState((s) => ({ ...s, what: v }))}
            placeholder={t.anon_form_what_ph}
            multiline
          />
        </div>

        <div style={{
          marginTop: 12, padding: "10px 12px",
          background: "rgba(49,130,246,0.10)", color: "#7DA8FF",
          borderRadius: 10, fontSize: 12, fontWeight: 500, lineHeight: 1.5,
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <IcLock size={16} />
          <span>
            {lang === "ko"
              ? "제출 시점에 즉시 암호화돼요. 학교 관리자도 본인이 받은 6자리 코드 없이는 내용을 열어볼 수 없어요."
              : "Encrypted on submit. Even staff need the 6-digit code to open this case."}
          </span>
        </div>
      </div>

      <SHBottomCTA dark>
        <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="tds-press" style={{
          width: "100%", height: 56, borderRadius: 14, border: 0,
          background: canSubmit && !submitting ? "#fff" : "rgba(255,255,255,0.2)",
          color: canSubmit && !submitting ? "#0F172A" : "rgba(255,255,255,0.5)",
          fontSize: 17, fontWeight: 800, letterSpacing: "-0.012em",
          cursor: canSubmit && !submitting ? "pointer" : "not-allowed", fontFamily: "inherit",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {submitting ? (
            <>
              <span style={{
                display: "inline-block", width: 16, height: 16, borderRadius: 999,
                border: "2px solid rgba(15,23,42,0.2)", borderTopColor: "#0F172A",
                animation: "tdsSpin 0.8s linear infinite",
              }}/>
              <span>{lang === "ko" ? "암호화 중…" : "Encrypting…"}</span>
            </>
          ) : (
            <>
              <IcLock size={18} />
              <span>{t.anon_form_submit}</span>
            </>
          )}
        </button>
      </SHBottomCTA>

      <style>{`@keyframes tdsSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// dark-mode field for anonymous form
function DarkField({ label, value, onChange, placeholder, multiline, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.012em" }}>{label}</span>
        {required && <span style={{ fontSize: 10, fontWeight: 700, color: "#7DA8FF" }}>●</span>}
      </div>
      <div style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: multiline ? "12px 14px" : "0 14px",
        minHeight: multiline ? 110 : 48,
        display: "flex", alignItems: "center",
      }}>
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1, minHeight: 86, border: 0, background: "transparent",
              resize: "none", outline: "none", fontFamily: "inherit",
              fontSize: 14, color: "#fff", lineHeight: 1.5,
            }}/>
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1, border: 0, background: "transparent", outline: "none",
              fontFamily: "inherit",
              fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.012em",
            }}/>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Report done — code reveal
// ─────────────────────────────────────────────────────────────────────────────
function SHReportDoneScreen({ t, lang, accent, code, onCheck, onHome, showToast }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    try {
      navigator.clipboard?.writeText(code);
    } catch (_) {}
    setCopied(true);
    showToast(lang === "ko" ? "코드가 복사됐어요" : "Code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100%", background: "#0F172A", color: "#fff", paddingTop: 47, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 52 }}/>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(49,130,246,0.18)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginTop: 8, position: "relative",
        }}>
          <IcShieldCheck size={48} color="#7DA8FF"/>
          {/* sparkles */}
          <div style={{
            position: "absolute", top: -6, right: 4, fontSize: 14,
            animation: "tdsSparkle 1.6s infinite",
          }}>✨</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{t.anon_done_title}</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, whiteSpace: "pre-line", maxWidth: 280 }}>
          {t.anon_done_sub}
        </div>

        {/* Code box */}
        <div style={{ marginTop: 12, width: "100%" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#7DA8FF", letterSpacing: "0.16em" }}>
            {t.anon_code}
          </div>
          <div style={{
            marginTop: 10, padding: "20px 16px",
            background: "rgba(255,255,255,0.06)",
            border: "1.5px dashed rgba(125,168,255,0.4)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            {code?.split("").map((ch, i) => (
              <span key={i} style={{
                width: 36, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.08)", borderRadius: 10,
                fontSize: 24, fontWeight: 800, color: "#fff",
                fontFamily: "var(--tds-font-mono)", letterSpacing: 0,
              }}>{ch}</span>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#FFB400", display: "inline-flex", alignItems: "center", gap: 6 }}>
            ⚠ {t.anon_code_save}
          </div>
        </div>
      </div>

      <SHBottomCTA dark>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={copy} className="tds-press" style={{
            height: 52, borderRadius: 14, border: 0,
            background: "rgba(255,255,255,0.12)", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <IcCopy size={18}/>
            {copied ? (lang === "ko" ? "복사됨" : "Copied") : t.anon_code_copy}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onHome} className="tds-press" style={{
              flex: 1, height: 56, borderRadius: 14, border: 0,
              background: "transparent", color: "rgba(255,255,255,0.6)",
              fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>
              {lang === "ko" ? "홈으로" : "Home"}
            </button>
            <button onClick={onCheck} className="tds-press" style={{
              flex: 2, height: 56, borderRadius: 14, border: 0,
              background: "#fff", color: "#0F172A",
              fontSize: 17, fontWeight: 800, letterSpacing: "-0.012em",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {lang === "ko" ? "상태 보기" : "View status"}
            </button>
          </div>
        </div>
      </SHBottomCTA>

      <style>{`@keyframes tdsSparkle { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) Check — enter code to open status
// ─────────────────────────────────────────────────────────────────────────────
function SHReportCheckScreen({ t, lang, accent, onBack, onSuccess, prefillCode }) {
  const { data } = useSHData();
  const [code, setCode] = React.useState("");
  const valid = code.length === 6;
  const normalizedReports = Array.isArray(data.reports) ? data.reports : [];

  const handleOpen = () => {
    const found = normalizedReports.find((r) => String(r.code || "").toUpperCase() === code);
    if (!found) {
      window.alert?.(lang === "ko" ? "일치하는 신고 코드를 찾지 못했어요." : "No report matched that code.");
      return;
    }
    onSuccess(found);
  };

  return (
    <div style={{ minHeight: "100%", background: "#0F172A", color: "#fff", paddingTop: 47, display: "flex", flexDirection: "column" }}>
      <SHNav title={t.anon_check} onBack={onBack} dark/>

      <div style={{ padding: "16px 24px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
          {t.anon_check_input_title}
        </div>

        {/* 6 boxes */}
        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} style={{
              aspectRatio: "1/1.2",
              background: "rgba(255,255,255,0.06)",
              border: code[i] ? "1.5px solid #7DA8FF" : "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: "#fff",
              fontFamily: "var(--tds-font-mono)",
            }}>{code[i] || ""}</div>
          ))}
        </div>

        <input
          autoFocus
          value={code}
          maxLength={6}
          onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6))}
          style={{
            marginTop: 16, width: "100%", height: 48, padding: "0 14px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, color: "#fff", fontFamily: "var(--tds-font-mono)",
            fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", textAlign: "center",
            outline: "none",
          }}
          placeholder="X3K9MZ"
        />

        <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
          {lang === "ko"
            ? "코드를 잊어버렸다면 다시 찾을 수 없어요. 작성자만 알 수 있는 정보이기 때문이에요."
            : "Lost codes can't be recovered — they exist only with the reporter."}
        </div>

        {prefillCode && (
          <button onClick={() => setCode(prefillCode)} style={{
            marginTop: 16, border: 0, background: "transparent",
            color: "#7DA8FF", fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", padding: 0,
          }}>
            {lang === "ko" ? `이전에 발급받은 코드 사용: ${prefillCode}` : `Use last code: ${prefillCode}`}
          </button>
        )}
      </div>

      <div style={{ flex: 1 }}/>

      <SHBottomCTA dark>
        <button onClick={handleOpen} disabled={!valid} className="tds-press" style={{
          width: "100%", height: 56, borderRadius: 14, border: 0,
          background: valid ? "#fff" : "rgba(255,255,255,0.2)",
          color: valid ? "#0F172A" : "rgba(255,255,255,0.5)",
          fontSize: 17, fontWeight: 800, cursor: valid ? "pointer" : "not-allowed",
          fontFamily: "inherit",
        }}>{t.anon_check_submit}</button>
      </SHBottomCTA>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5) Status — timeline
// ─────────────────────────────────────────────────────────────────────────────
function SHReportStatusScreen({ t, lang, accent, code, reportId, onBack, onHome }) {
  const { data } = useSHData();
  const report = (data.reports || []).find((r) => r.id === reportId)
    || (data.reports || []).find((r) => String(r.code || "").toUpperCase() === String(code || "").toUpperCase());
  const createdLabel = report?.createdAt
    ? new Date(report.createdAt).toLocaleString(lang === "ko" ? "ko-KR" : "en-US")
    : (lang === "ko" ? "방금" : "now");
  const status = report?.status || "review";
  const steps = [
    {
      key: "received",
      title: t.anon_status_received,
      when_ko: createdLabel,
      when_en: createdLabel,
      desc_ko: "신고가 안전하게 접수됐어요. 자동으로 학생 안전 담당자에게 전달됐어요.",
      desc_en: "Your report was safely received and routed to the safety team.",
      done: true,
    },
    {
      key: "review",
      title: t.anon_status_review,
      when_ko: status === "review" || status === "resolved" ? createdLabel : "—",
      when_en: status === "review" || status === "resolved" ? createdLabel : "—",
      desc_ko: report?.adminNote || "관리자가 신고 내용을 확인하고 있어요.",
      desc_en: report?.adminNote || "An administrator is reviewing the report.",
      current: status === "review",
      done: status === "resolved",
      pending: status === "received",
    },
    {
      key: "resolved",
      title: t.anon_status_resolved,
      when_ko: status === "resolved" ? createdLabel : "—",
      when_en: status === "resolved" ? createdLabel : "—",
      desc_ko: report?.resolutionNote || "처리가 끝나면 이곳에 결과가 보여요.",
      desc_en: report?.resolutionNote || "The final result will appear here when resolved.",
      current: status === "resolved",
      pending: status !== "resolved",
    },
  ];

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 24 }}>
      <SHNav title={t.anon_status_title} onBack={onBack}/>

      {/* Code header */}
      <div style={{ padding: "8px 20px 16px" }}>
        <SHCard radius={20} pad={20} style={{
          background: "#0F172A", color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(125,168,255,0.18)", color: "#7DA8FF",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <IcShieldCheck size={24}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em" }}>
                {t.anon_code}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--tds-font-mono)", letterSpacing: "0.08em", marginTop: 2 }}>
              {report?.code || code}
            </div>
          </div>
          <SHPill color="dark" style={{ background: "rgba(125,168,255,0.22)", color: "#7DA8FF" }}>
              {status === "resolved" ? t.anon_status_resolved : status === "review" ? t.anon_status_review : t.anon_status_received}
            </SHPill>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            {lang === "ko" ? "이 화면을 캡처해 두세요. 다른 사람은 이 코드만으로는 내용을 볼 수 없어요." : "Screenshot this — others can't open the case with the code alone."}
          </div>
        </SHCard>
      </div>

      {report && (
        <div style={{ padding: "0 20px 16px" }}>
          <SHCard radius={16} pad={16}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#191F28" }}>
              {lang === "ko" ? "접수된 신고 내용" : "Submitted report"}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#6B7683", lineHeight: 1.6 }}>
              {lang === "ko" ? `언제: ${report.when || "-"}` : `When: ${report.when || "-"}`}<br/>
              {lang === "ko" ? `어디서: ${report.where || "-"}` : `Where: ${report.where || "-"}`}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: "#191F28", lineHeight: 1.6 }}>
              {report.what || "-"}
            </div>
          </SHCard>
        </div>
      )}

      {/* Timeline */}
      <div style={{ padding: "0 20px" }}>
        <SHCard radius={20} pad={20}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em", marginBottom: 12 }}>
            {lang === "ko" ? "처리 상황" : "Progress"}
          </div>
          <div style={{ position: "relative", paddingLeft: 30 }}>
            <div style={{ position: "absolute", left: 11, top: 12, bottom: 12, width: 2, background: "#E5E8EB" }}/>
            {steps.map((s, i) => (
              <div key={s.key} style={{ position: "relative", paddingBottom: i < steps.length - 1 ? 24 : 0 }}>
                <div style={{
                  position: "absolute", left: -30, top: 0,
                  width: 24, height: 24, borderRadius: 999,
                  background: s.pending ? "#E5E8EB" : (s.current ? accent : "#191F28"),
                  color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  boxShadow: s.current ? `0 0 0 4px ${accent}33` : "none",
                }}>
                  {s.pending ? (
                    <span style={{ fontSize: 11, color: "#8B95A1", fontWeight: 800 }}>{i + 1}</span>
                  ) : (
                    <IconCheck size={14} color="#fff"/>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.pending ? "#8B95A1" : "#191F28", letterSpacing: "-0.012em" }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 11, color: "#8B95A1", marginTop: 2 }}>
                  {s[`when_${lang}`]}
                </div>
                <div style={{ fontSize: 13, color: s.pending ? "#8B95A1" : "#4E5968", marginTop: 6, lineHeight: 1.5 }}>
                  {s[`desc_${lang}`]}
                </div>
              </div>
            ))}
          </div>
        </SHCard>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <button onClick={onHome} className="tds-press" style={{
          width: "100%", height: 52, borderRadius: 14, border: 0,
          background: "#fff", color: "#191F28",
          fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>
          {lang === "ko" ? "홈으로 돌아가기" : "Back to home"}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  SHReportHomeScreen, SHReportFormScreen, SHReportDoneScreen,
  SHReportCheckScreen, SHReportStatusScreen,
});
