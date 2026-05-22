// Forms.jsx — Attendance form downloads.

function SHFormsScreen({ t, lang, accent, onBack, showToast }) {
  const { data, updateData } = useSHData();
  const [q, setQ] = React.useState("");
  const filtered = (data.forms || []).filter((f) =>
    !q || (f[`title_${lang}`] || f.title_ko).toLowerCase().includes(q.toLowerCase())
  );
  const recent = [...filtered].sort((a, b) => b.recent - a.recent).slice(0, 3);
  const downloadForm = (form) => {
    if (form.asset) window.SHDownloadAsset?.(form.asset, window.SHSlug?.(form.title_ko, "form"));
    updateData((draft) => {
      const item = (draft.forms || []).find((x) => x.id === form.id);
      if (item) item.recent = Number(item.recent || 0) + 1;
    });
    showToast(lang === "ko" ? `${form.title_ko} 다운로드 시작` : `Downloading ${form.title_en}`);
  };

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 28 }}>
      <SHNav title={t.forms_title} onBack={onBack}/>

      {/* Search */}
      <div style={{ padding: "8px 20px 16px" }}>
        <div style={{
          height: 48, padding: "0 14px", borderRadius: 12,
          background: "rgba(7,25,76,0.05)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <IconSearch size={18} color="#8B95A1"/>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.forms_search_ph}
            style={{
              flex: 1, border: 0, background: "transparent", outline: "none",
              fontSize: 15, fontWeight: 500, fontFamily: "inherit", color: "#191F28",
            }}/>
        </div>
      </div>

      {/* Recent (most used) */}
      {!q && (
        <div style={{ padding: "0 16px" }}>
          <SHSection title={t.forms_recent}/>
          <SHCard radius={20} pad={16}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              {recent.map((f) => (
                <div key={f.id} onClick={() => downloadForm(f)}
                  className="tds-press"
                  style={{
                    flex: "0 0 140px",
                    background: `${accent}10`,
                    borderRadius: 14, padding: "14px",
                    display: "flex", flexDirection: "column", gap: 10, cursor: "pointer",
                  }}>
                  <SHTile bg={`${accent}1F`} color={accent} size={36} radius={10}>
                    <IcDocument size={18}/>
                  </SHTile>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: "#191F28",
                    lineHeight: 1.35, letterSpacing: "-0.012em",
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    minHeight: 36,
                  }}>{f[`title_${lang}`]}</div>
                  <div style={{ fontSize: 11, color: "#8B95A1" }}>
                    {f.fmt} · {f.size}{t.forms_size_kb}
                  </div>
                </div>
              ))}
            </div>
          </SHCard>
        </div>
      )}

      {/* All forms */}
      <div style={{ padding: "20px 16px 0" }}>
        <SHSection title={q ? (lang === "ko" ? `검색 결과 ${filtered.length}건` : `${filtered.length} results`) : t.forms_all}/>
        <SHCard radius={16} pad={0}>
          {filtered.map((f, i) => (
            <div key={f.id}
              className="tds-press"
              onClick={() => downloadForm(f)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 18px", cursor: "pointer",
                borderBottom: i < filtered.length - 1 ? "1px solid #F2F4F6" : "none",
              }}>
              <div style={{
                width: 40, height: 48, borderRadius: 6,
                background: f.fmt === "HWP" ? "#E8F1FE" : "#FFE9EB",
                color: f.fmt === "HWP" ? "#1B64DA" : "#D43144",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800,
                position: "relative",
              }}>
                {f.fmt}
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: 10, height: 10,
                  borderTop: "6px solid #F2F4F6", borderLeft: "6px solid transparent",
                }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{f[`title_${lang}`]}</div>
                <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 2 }}>
                  {f.size}{t.forms_size_kb} · {lang === "ko" ? `${f.recent}회 받음` : `${f.recent} downloads`}
                </div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                background: `${accent}14`, color: accent,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                flex: "0 0 36px",
              }}>
                <IcDownload size={18}/>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <SHEmpty icon={<div style={{ fontSize: 56 }}>🔍</div>} title={lang === "ko" ? "결과가 없어요" : "No results"}/>
          )}
        </SHCard>
      </div>
    </div>
  );
}

window.SHFormsScreen = SHFormsScreen;
