// shPrimitives.jsx — SchoolHub-specific composite components on top of TDS primitives.
// Keep visual style aligned to TDS but with school-friendly micro-touches.

// School header — used on Home (large) and as a topnav backdrop on Lost/Board.
function SHTopBar({ accent = "#3182F6", school, studentName, grade, onProfile, t }) {
  return (
    <div style={{
      padding: "12px 16px 0px 0px",
      marginLeft: -6,
      display: "flex", alignItems: "center", gap: 0,
      background: "transparent",
    }}>
      {/* school mark — 장평중로고원형 */}
      <img
        src="./src/school-logo-circle.svg"
        alt="장평중학교"
        style={{
          width: 100, height: 100,
          borderRadius: "50%",
          objectFit: "contain",
          flex: "0 0 100px",
        }}
      />
      <div style={{ flex: 1, minWidth: 0, marginLeft: -20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7683", letterSpacing: "-0.01em" }}>
          {school}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em", marginTop: 1 }}>
          {grade} · {studentName}
        </div>
      </div>
      <button onClick={onProfile} className="tds-press" style={{
        width: 40, height: 40, borderRadius: 20, border: 0,
        background: "rgba(7,25,76,0.05)", color: "#191F28",
        display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        position: "relative",
      }}>
        <IconAlarm />
        <span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 999, background: "#F04452" }} />
      </button>
    </div>
  );
}

// Generic top nav for subroutes (back chevron + centered title)
function SHNav({ title, onBack, onClose, right, dark = false }) {
  const c = dark ? "#fff" : "#191F28";
  return (
    <div style={{
      height: 52, display: "flex", alignItems: "center", padding: "0 6px",
      position: "relative",
    }}>
      {onBack && (
        <button className="tds-press" onClick={onBack} style={{
          width: 44, height: 44, border: 0, background: "transparent", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: c, borderRadius: 22,
        }}><IconArrowBack /></button>
      )}
      {title && (
        <div style={{
          position: "absolute", left: 0, right: 0,
          fontSize: 17, fontWeight: 700, color: c, textAlign: "center",
          letterSpacing: "-0.012em",
          pointerEvents: "none",
        }}>{title}</div>
      )}
      {right && <div style={{ marginLeft: "auto", display: "flex", gap: 4, paddingRight: 6 }}>{right}</div>}
      {onClose && !right && (
        <button className="tds-press" onClick={onClose} style={{
          width: 44, height: 44, border: 0, background: "transparent", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: c, borderRadius: 22, marginLeft: "auto",
        }}><IconClose /></button>
      )}
    </div>
  );
}

// Card wrapper — used everywhere
function SHCard({ children, style, onClick, pad = 20, radius = 20, bg = "#fff" }) {
  return (
    <div onClick={onClick}
      className={onClick ? "tds-press" : undefined}
      style={{
        background: bg, borderRadius: radius, padding: pad,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
      {children}
    </div>
  );
}

// Section header — h-line above lists
function SHSection({ title, action, onAction }) {
  return (
    <div style={{ padding: "0 4px 10px", display: "flex", alignItems: "center" }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>{title}</h3>
      {action && (
        <button onClick={onAction} style={{
          marginLeft: "auto", border: 0, background: "transparent",
          fontSize: 13, fontWeight: 600, color: "#6B7683", cursor: "pointer",
          fontFamily: "inherit",
        }}>{action} ›</button>
      )}
    </div>
  );
}

// Status pill — small badge
function SHPill({ children, color = "neutral", style }) {
  const palette = {
    neutral:  { background: "rgba(7,25,76,0.05)", color: "#4E5968" },
    blue:     { background: "rgba(49,130,246,0.12)", color: "#1B64DA" },
    green:    { background: "rgba(0,123,51,0.12)", color: "#007B33" },
    red:      { background: "rgba(240,68,82,0.12)", color: "#D43144" },
    orange:   { background: "rgba(255,144,0,0.16)", color: "#B96B00" },
    yellow:   { background: "rgba(255,180,0,0.18)", color: "#8A5C00" },
    purple:   { background: "rgba(122,90,224,0.14)", color: "#5A3DC0" },
    dark:     { background: "#191F28", color: "#fff" },
  }[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 6,
      fontSize: 11, fontWeight: 700, letterSpacing: "-0.01em",
      fontFamily: "inherit",
      ...palette, ...style,
    }}>{children}</span>
  );
}

// Segmented control (used in Lost & Found list, weekly toggles)
function SHSeg({ options, value, onChange, style }) {
  return (
    <div style={{
      display: "flex", padding: 4, background: "rgba(7,25,76,0.05)",
      borderRadius: 12, position: "relative", ...style,
    }}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            flex: 1, height: 38, border: 0, borderRadius: 9,
            background: on ? "#fff" : "transparent",
            color: on ? "#191F28" : "#6B7683",
            fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            boxShadow: on ? "0 1px 3px rgba(0,19,43,0.06)" : "none",
            transition: "all 200ms cubic-bezier(.2,.8,.2,1)",
            letterSpacing: "-0.012em",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// Empty state
function SHEmpty({ icon, title, sub }) {
  return (
    <div style={{
      padding: "40px 20px", display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center", gap: 12,
    }}>
      {icon}
      <div style={{ fontSize: 17, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>{title}</div>
      {sub && <div style={{ fontSize: 14, color: "#6B7683", maxWidth: 240, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

// Form input
function SHInput({ label, hint, value, onChange, placeholder, multiline, suffix, type = "text", autoFocus }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      {label && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4E5968", letterSpacing: "-0.012em" }}>{label}</span>
          {hint && <span style={{ fontSize: 12, color: "#8B95A1" }}>{hint}</span>}
        </div>
      )}
      <div style={{
        background: "#F2F4F6", borderRadius: 12,
        padding: multiline ? "14px 16px" : "0 16px",
        display: "flex", alignItems: "center", gap: 8,
        minHeight: multiline ? 96 : 52,
        minWidth: 0,
      }}>
        {multiline ? (
          <textarea
            value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            autoFocus={autoFocus}
            style={{
              flex: 1, minHeight: 76, minWidth: 0, border: 0, background: "transparent",
              resize: "none", outline: "none", fontFamily: "inherit",
              fontSize: 16, color: "#191F28", lineHeight: 1.5,
            }}
          />
        ) : (
          <input
            type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            autoFocus={autoFocus}
            style={{
              flex: 1, minWidth: 0, border: 0, background: "transparent",
              outline: "none", fontFamily: "inherit",
              fontSize: 16, fontWeight: 600, color: "#191F28", letterSpacing: "-0.012em",
            }}
          />
        )}
        {suffix}
      </div>
    </div>
  );
}

// Sticky bottom CTA — flush bottom, white bg, 1px divider above
function SHBottomCTA({ children, dark = false }) {
  return (
    <div style={{
      padding: "12px 20px calc(24px + env(safe-area-inset-bottom))",
      background: dark ? "rgba(15,23,42,0.96)" : "rgba(255,255,255,0.96)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid #F2F4F6",
    }}>{children}</div>
  );
}

// Round colored icon tile (small) — used a lot in nav/quick action
function SHTile({ children, bg = "#E8F1FE", color = "#3182F6", size = 44, radius = 12 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: bg, color: color,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flex: `0 0 ${size}px`,
    }}>{children}</div>
  );
}

Object.assign(window, {
  SHTopBar, SHNav, SHCard, SHSection, SHPill, SHSeg, SHEmpty,
  SHInput, SHBottomCTA, SHTile,
});
