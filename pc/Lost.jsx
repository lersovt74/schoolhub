// pc/Lost.jsx — desktop lost & found with shared persistence.

function PCLost({ L, lang, accent }) {
  const { data } = useSHData();
  const isAdmin = window.SHIsAdminUser ? window.SHIsAdminUser() : window.SH_USER?.role === "admin";
  const [seg, setSeg] = React.useState(isAdmin ? "found" : "lost");
  const [selected, setSelected] = React.useState(null);
  const [showRegister, setShowRegister] = React.useState(false);
  const [vw, setVw] = React.useState(() => window.innerWidth);

  const items = (data.lostItems || [])
    .filter((it) => it.category === seg)
    .filter((it) => it.status !== "done");

  React.useEffect(() => {
    setSelected(items[0]?.id || null);
  }, [seg, items.length]);

  React.useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const current = (data.lostItems || []).find((it) => it.id === selected) || items[0] || null;
  const isCompact = vw < 1580;
  const isNarrow = vw < 1220;

  return (
    <div style={{
      padding: 32,
      display: "grid",
      gridTemplateColumns: isCompact ? "minmax(0, 1fr)" : "minmax(0, 1.35fr) minmax(420px, 1fr)",
      gap: 20,
      alignItems: "start",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 4px 16px", flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", padding: 4, background: "rgba(7,25,76,0.06)", borderRadius: 12 }}>
            {[
              { v: "found", l: L.lost_seg_found },
              { v: "lost", l: L.lost_seg_lost },
            ].map((item) => {
              const on = item.v === seg;
              return (
                <button key={item.v} onClick={() => setSeg(item.v)} style={{
                  height: 36, padding: "0 18px", border: 0, borderRadius: 9,
                  background: on ? "#fff" : "transparent",
                  color: on ? "#191F28" : "#6B7683",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "-0.012em",
                  boxShadow: on ? "0 1px 3px rgba(0,19,43,0.06)" : "none",
                }}>{item.l}</button>
              );
            })}
          </div>

          <div style={{ fontSize: 12, color: "#8B95A1" }}>
            {seg === "found"
              ? "찾아가세요 페이지는 관리자만 등록 가능합니다."
              : lang === "ko" ? "분실한 물건을 빠르게 올려서 학교 안에서 찾아보세요." : "Post lost items so others can help quickly."}
          </div>

          <button
            onClick={() => {
              if (seg === "found" && !isAdmin) return;
              setShowRegister(true);
            }}
            className="tds-press"
            style={{
              marginLeft: "auto",
              height: 36, padding: "0 14px", borderRadius: 10, border: 0,
              background: seg === "found" && !isAdmin ? "#D1D6DB" : accent, color: "#fff",
              fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <IconPlus size={14}/> {L.lost_register}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr", gap: 14 }}>
          {items.map((it) => {
            const on = it.id === selected;
            return (
              <div key={it.id} onClick={() => setSelected(it.id)} className="tds-press" style={{
                background: "#fff", borderRadius: 14, padding: 16, cursor: "pointer",
                border: on ? `2px solid ${accent}` : "2px solid transparent",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{
                  width: "100%", aspectRatio: "16/10", borderRadius: 12,
                  background: it.color, color: it.iconColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 56, position: "relative", overflow: "hidden",
                }}>
                  {(it.image || it.asset?.url || it.asset?.dataUrl) ? <img src={it.image || it.asset?.url || it.asset?.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : it.icon}
                  <span style={{
                    position: "absolute", top: 8, left: 8,
                    padding: "3px 8px", borderRadius: 6,
                    background: "rgba(255,255,255,0.96)",
                    color: it.category === "found" ? "#1B64DA" : "#D43144",
                    fontSize: 10, fontWeight: 800,
                  }}>
                    {it.category === "found" ? L.lost_seg_found : L.lost_seg_lost}
                  </span>
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em",
                    lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>{it[`title_${lang}`]}</div>
                  <div style={{ fontSize: 11, color: "#6B7683", marginTop: 4 }}>📍 {it[`place_${lang}`]}</div>
                  <div style={{ fontSize: 11, color: "#8B95A1", marginTop: 2 }}>{it.postedBy} · {it[`time_${lang}`]}</div>
                </div>
              </div>
            );
          })}
          {!items.length && (
            <PCCard title={lang === "ko" ? "안내" : "Info"} pad={20} style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 13, color: "#6B7683" }}>
                {lang === "ko" ? "등록된 분실물이 아직 없어요." : "No items posted yet."}
              </div>
            </PCCard>
          )}
        </div>
      </div>

      <div style={{
        position: isCompact ? "relative" : "sticky", top: isCompact ? 0 : 32,
        background: "#fff", borderRadius: 18, padding: 28,
        border: "1px solid #F2F4F6",
      }}>
        {current ? (
          <>
            <div style={{
              width: "100%", aspectRatio: "1/1", borderRadius: 18,
              background: current.color, color: current.iconColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 140, position: "relative", overflow: "hidden",
            }}>
              {(current.image || current.asset?.url || current.asset?.dataUrl) ? <img src={current.image || current.asset?.url || current.asset?.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : current.icon}
              <div style={{ position: "absolute", top: 14, left: 14 }}>
                <span style={{
                  padding: "4px 10px", borderRadius: 6,
                  background: "rgba(255,255,255,0.96)",
                  color: current.category === "lost" ? "#D43144" : "#1B64DA",
                  fontSize: 11, fontWeight: 800,
                }}>{current.category === "lost" ? L.lost_seg_lost : L.lost_seg_found}</span>
              </div>
            </div>
            <h3 style={{ margin: "18px 0 0", fontSize: 20, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
              {current[`title_${lang}`]}
            </h3>
            <div style={{ marginTop: 6, fontSize: 12, color: "#6B7683" }}>
              {current.postedBy} · {current[`time_${lang}`]}
            </div>

            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <PCDetailRow icon={<IcMap size={18} color={accent}/>} label={L.lost_place} value={current[`place_${lang}`]}/>
              <PCDetailRow icon={<IcCalendar size={18} color={accent}/>} label={L.lost_date} value={current.date}/>
              <PCDetailRow icon={<IcTag size={18} color={accent}/>} label={L.lost_desc} value={current[`desc_${lang}`]}/>
            </div>

            <div style={{
              marginTop: 18, padding: "12px 14px", borderRadius: 12,
              background: `${accent}10`, display: "flex", gap: 10,
            }}>
              <IcShieldCheck size={18} color={accent}/>
              <div style={{ flex: 1, fontSize: 12, color: "#4E5968", lineHeight: 1.55 }}>
                {lang === "ko"
                  ? "본인 거예요 버튼을 누르면 행정실 선생님께 연결돼요. 신원 확인 후 보관 중인 물건을 받을 수 있어요."
                  : "Tap \"It's mine\" and the office can help verify the owner."}
              </div>
            </div>

            <button className="tds-press" style={{
              marginTop: 18, width: "100%", height: 52, borderRadius: 12, border: 0,
              background: accent, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}>{L.lost_owner}</button>
          </>
        ) : (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#8B95A1" }}>
            {lang === "ko" ? "물건을 선택해 주세요" : "Select an item"}
          </div>
        )}
      </div>

      {showRegister && (
        <PCLostRegisterModal L={L} lang={lang} accent={accent} segment={seg} isAdmin={isAdmin} onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}

function PCDetailRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: "rgba(7,25,76,0.04)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flex: "0 0 28px",
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7683" }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#191F28", marginTop: 2, lineHeight: 1.45 }}>{value}</div>
      </div>
    </div>
  );
}

function PCLostRegisterModal({ L, lang, accent, segment, isAdmin, onClose }) {
  const { updateData } = useSHData();
  const [where, setWhere] = React.useState("");
  const [feature, setFeature] = React.useState("");
  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const [when, setWhen] = React.useState(todayStr);
  const [photo, setPhoto] = React.useState(null);
  const fileRef = React.useRef(null);
  const canSubmit = where.trim() && feature.trim() && (segment !== "found" || isAdmin);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const assets = await (window.SHReadFiles ? window.SHReadFiles([file]) : []);
    if (assets?.[0]) setPhoto(assets[0]);
  };

  const submit = () => {
    if (!canSubmit) return;
    updateData((draft) => {
      if (!Array.isArray(draft.lostItems)) draft.lostItems = [];
      draft.lostItems.unshift({
        id: `l-${Date.now()}`,
        category: segment,
        icon: "📦",
        image: photo?.dataUrl || photo?.url || null,
        asset: photo || null,
        color: "#EEF2F6",
        iconColor: "#4E5968",
        title_ko: feature.trim(),
        title_en: feature.trim(),
        place_ko: where.trim(),
        place_en: where.trim(),
        date: when.trim(),
        desc_ko: feature.trim(),
        desc_en: feature.trim(),
        status: segment === "found" ? "keep" : "open",
        postedBy: segment === "found" ? "관리자" : (window.SH_USER?.name || "익명"),
        time_ko: "방금",
        time_en: "now",
      });
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 560, maxHeight: "85vh", overflowY: "auto",
        background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 60px rgba(0,19,43,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#191F28" }}>{L.lost_form_title}</h2>
          <button onClick={onClose} style={{
            marginLeft: "auto", width: 36, height: 36, borderRadius: 18, border: 0, background: "rgba(7,25,76,0.05)", cursor: "pointer",
          }}><IconClose size={20}/></button>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "#8B95A1" }}>
          {segment === "found" ? "찾아가세요 페이지는 관리자만 등록 가능합니다." : "분실한 물건을 빠르게 공유할 수 있어요."}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} className="tds-press" style={{
          marginTop: 16, width: "100%", aspectRatio: "16/8", borderRadius: 14, border: photo ? `2px solid ${accent}` : "2px dashed #D1D6DB",
          background: photo ? `${accent}1F` : "#fff", cursor: "pointer", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {photo ? <img src={photo.dataUrl || photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <div style={{ color: "#6B7683", fontWeight: 700 }}>{L.lost_form_photo}</div>}
        </button>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <PCField label={L.lost_form_where} value={where} onChange={setWhere} placeholder={L.lost_form_where_ph}/>
          <PCField label={L.lost_form_when} value={when} onChange={setWhen}/>
        </div>
        <div style={{ marginTop: 12 }}>
          <PCField label={L.lost_form_feature} value={feature} onChange={setFeature} placeholder={L.lost_form_feature_ph} multiline />
        </div>
        <button onClick={submit} disabled={!canSubmit} style={{
          marginTop: 20, width: "100%", height: 52, borderRadius: 12, border: 0,
          background: canSubmit ? accent : "rgba(7,25,76,0.05)", color: canSubmit ? "#fff" : "#B0B8C1",
          fontSize: 15, fontWeight: 800, cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "inherit",
        }}>{L.lost_form_submit}</button>
      </div>
    </div>
  );
}

function PCField({ label, value, onChange, placeholder, multiline }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#4E5968" }}>{label}</div>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
          width: "100%", minHeight: 120, resize: "vertical", borderRadius: 12, border: "1px solid #E5E8EB", padding: "12px 14px",
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

window.PCLost = PCLost;
