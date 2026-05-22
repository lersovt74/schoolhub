// PCPrimitives.jsx — desktop shell components: sidebar, topbar, card, etc.

// Color utility (also exported by src/screens/Home.jsx but we standalone here)
function shadeColor(hex, percent) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (1 + percent / 100);
  r = Math.max(0, Math.min(255, Math.round(r * f)));
  g = Math.max(0, Math.min(255, Math.round(g * f)));
  b = Math.max(0, Math.min(255, Math.round(b * f)));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
window.shadeColor = window.shadeColor || shadeColor;

function PCSidebar({ items, active, onSelect, school, accent, lang }) {
  return (
    <aside style={{
      width: 240, flex: "0 0 240px",
      background: "#fff",
      borderRight: "1px solid #F2F4F6",
      display: "flex", flexDirection: "column",
      padding: "20px 14px",
    }}>
      {/* Brand */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 10px 20px",
      }}>
        <img
          src="./src/school-logo-circle.svg"
          alt="장평중학교"
          style={{
            width: 96, height: 96,
            borderRadius: "50%",
            objectFit: "contain",
            flex: "0 0 96px",
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#191F28", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
            SchoolHub
          </div>
          <div style={{ fontSize: 14, color: "#8B95A1", fontWeight: 600, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {school}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onSelect(it.id)}
              className="tds-press"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", border: 0, cursor: "pointer",
                background: on ? `${accent}14` : "transparent",
                color: on ? accent : "#4E5968",
                borderRadius: 10, textAlign: "left", fontFamily: "inherit",
                fontSize: 14, fontWeight: on ? 800 : 600,
                letterSpacing: "-0.012em",
                position: "relative",
              }}>
              <span style={{
                width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>{it.icon}</span>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  padding: "2px 6px", borderRadius: 999,
                  background: it.badgeColor || "#F04452", color: "#fff",
                }}>{it.badge}</span>
              )}
            </button>
          );
        })}
      </div>

    </aside>
  );
}

function PCTopbar({ title, breadcrumb, accent, studentName, grade, lang, onTweaks, onLogout }) {
  return (
    <header style={{
      height: 64, flex: "0 0 64px",
      background: "#fff",
      borderBottom: "1px solid #F2F4F6",
      display: "flex", alignItems: "center",
      padding: "0 32px", gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb && (
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8B95A1", letterSpacing: "0.04em", marginBottom: 2 }}>
            {breadcrumb}
          </div>
        )}
        <div style={{
          fontSize: 18, fontWeight: 800, color: "#191F28",
          letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {title}
        </div>
      </div>

      {/* Search */}
      <div style={{
        height: 40, width: 280, padding: "0 14px",
        background: "#F2F4F6", borderRadius: 10,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <IconSearch size={16} color="#8B95A1"/>
        <input placeholder={lang === "ko" ? "검색" : "Search"}
          style={{
            flex: 1, border: 0, background: "transparent", outline: "none",
            fontFamily: "inherit", fontSize: 14, fontWeight: 500, color: "#191F28",
          }}/>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#B0B8C1",
          padding: "2px 6px", border: "1px solid #E5E8EB", borderRadius: 4,
        }}>⌘K</span>
      </div>

      {/* Alarm */}
      <button className="tds-press" style={{
        width: 40, height: 40, border: 0, borderRadius: 10,
        background: "#F2F4F6", color: "#191F28", cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <IconAlarm size={20}/>
        <span style={{
          position: "absolute", top: 8, right: 9, width: 7, height: 7,
          borderRadius: 999, background: "#F04452",
        }}/>
      </button>

      {/* Profile */}
      <div style={{
        height: 40, padding: "0 6px 0 4px",
        display: "flex", alignItems: "center", gap: 10,
        background: "#F2F4F6", borderRadius: 999,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: `linear-gradient(135deg, ${accent}, ${shadeColor(accent, -22)})`,
          color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800,
        }}>{studentName?.[0] || "J"}</div>
        <div style={{ lineHeight: 1.2, paddingRight: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
            {studentName}
          </div>
          <div style={{ fontSize: 10, color: "#6B7683", fontWeight: 600 }}>
            {grade}
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="tds-press"
        style={{
          height: 40,
          padding: "0 16px",
          border: "1px solid #E5E8EB",
          borderRadius: 999,
          background: "#fff",
          color: "#4E5968",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "-0.012em",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {lang === "ko" ? "로그아웃" : "Log out"}
      </button>
    </header>
  );
}

// Card with optional title + action
function PCCard({ title, action, onAction, children, style, pad = 24, radius = 16 }) {
  return (
    <div style={{
      background: "#fff", borderRadius: radius,
      border: "1px solid #F2F4F6",
      ...style,
    }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center",
          padding: `${pad - 4}px ${pad}px 0`,
        }}>
          <h3 style={{
            margin: 0, fontSize: 16, fontWeight: 800,
            color: "#191F28", letterSpacing: "-0.012em",
          }}>{title}</h3>
          {action && (
            <button onClick={onAction} style={{
              marginLeft: "auto", border: 0, background: "transparent",
              fontSize: 12, fontWeight: 700, color: "#6B7683", cursor: "pointer",
              fontFamily: "inherit",
            }}>{action} ›</button>
          )}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

// Statistic — number + label
function PCStat({ label, value, sub, color = "#191F28" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8B95A1", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#6B7683" }}>{sub}</div>}
    </div>
  );
}

Object.assign(window, { PCSidebar, PCTopbar, PCCard, PCStat });
