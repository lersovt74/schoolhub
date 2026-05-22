// LostFound.jsx — Lost & Found center: list, detail, register form.

// ─────────────────────────────────────────────────────────────────────────────
// List (root) — segmented "찾아주세요" / "찾아가세요"
// ─────────────────────────────────────────────────────────────────────────────
function SHLostListScreen({ t, lang, accent, onGo, push }) {
  const { data } = useSHData();
  const isAdmin = window.SHIsAdminUser ? window.SHIsAdminUser() : window.SH_USER?.role === "admin";
  const [seg, setSeg] = React.useState(isAdmin ? "found" : "lost");
  const items = (data.lostItems || [])
    .filter((it) => it.category === seg)
    .filter((it) => it.status !== "done");

  const heldCount = (data.lostItems || []).filter((it) => it.category === "found" && it.status !== "done").length;

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 20 }}>
      {/* Top */}
      <div style={{ padding: "22px 20px 10px", display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {t.lost_title}
          </div>
          <div style={{ fontSize: 13, color: "#6B7683", marginTop: 4 }}>
            {lang === "ko"
              ? `지금 학교에 보관 중인 물건이 ${heldCount}개 있어요`
              : `${heldCount} item${heldCount !== 1 ? "s" : ""} being held right now`}
          </div>
        </div>
        <button
          onClick={() => {
            if (seg === "found" && !isAdmin) return;
            push("lost-register", { category: seg });
          }}
          className="tds-press"
          style={{
          marginLeft: "auto",
          width: 44, height: 44, borderRadius: 22,
          background: seg === "found" && !isAdmin ? "#D1D6DB" : accent, color: "#fff", border: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: `0 6px 16px ${accent}44`,
        }}>
          <IconPlus size={22}/>
        </button>
      </div>

      {/* Segmented */}
      <div style={{ padding: "8px 20px 0" }}>
        <SHSeg
          value={seg}
          onChange={setSeg}
          options={[
            { value: "found", label: t.lost_seg_found },
            { value: "lost", label: t.lost_seg_lost },
          ]}
        />
        <div style={{ marginTop: 10, fontSize: 12, color: "#8B95A1", lineHeight: 1.5 }}>
          {seg === "found"
            ? "찾아가세요 페이지는 관리자만 등록 가능합니다."
            : lang === "ko"
              ? "분실한 물건을 빠르게 올려서 학교 안에서 찾아보세요."
              : "Post lost items so others can help you find them quickly."}
        </div>
      </div>

      {/* List */}
      <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {items.length === 0 ? (
          <SHEmpty
            icon={<div style={{ fontSize: 56 }}>🔍</div>}
            title={lang === "ko" ? "해당하는 물건이 없어요" : "Nothing here"}
            sub={lang === "ko" ? "다른 카테고리도 확인해 보세요" : "Try another category"}
          />
        ) : items.map((it) => (
          <SHCard
            key={it.id}
            onClick={() => push("lost-detail", { item: it.id })}
            radius={16} pad={14}
            style={{ display: "flex", gap: 14 }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: 14,
              background: it.color, color: it.iconColor,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, flex: "0 0 80px",
              overflow: "hidden",
            }}>
              {(it.image || it.asset?.url || it.asset?.dataUrl)
                ? <img src={it.image || it.asset?.url || it.asset?.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : it.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <SHPill color={it.category === "found" ? "blue" : "red"}>
                  {it.category === "found" ? t.lost_seg_found : t.lost_seg_lost}
                </SHPill>
                <span style={{ fontSize: 11, color: "#8B95A1", marginLeft: "auto" }}>{it[`time_${lang}`]}</span>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em",
                lineHeight: 1.3, overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {it[`title_${lang}`]}
              </div>
              <div style={{ fontSize: 12, color: "#6B7683", display: "flex", alignItems: "center", gap: 4 }}>
                📍 <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it[`place_${lang}`]}</span>
              </div>
            </div>
          </SHCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail
// ─────────────────────────────────────────────────────────────────────────────
function SHLostDetailScreen({ t, lang, accent, itemId, onBack, showToast }) {
  const { data } = useSHData();
  const it = (data.lostItems || []).find((x) => x.id === itemId) || (data.lostItems || [])[0];
  if (!it) {
    return (
      <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47 }}>
        <SHNav title="" onBack={onBack}/>
        <SHEmpty
          icon={<div style={{ fontSize: 56 }}>📦</div>}
          title={lang === "ko" ? "분실물 정보를 찾을 수 없어요" : "Item not found"}
          sub={lang === "ko" ? "목록에서 다른 분실물을 선택해 주세요" : "Please choose another item from the list"}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 28 }}>
      <SHNav title="" onBack={onBack} right={
        <button className="tds-press" style={{
          width: 44, height: 44, border: 0, background: "transparent", color: "#191F28",
          borderRadius: 22, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><IconMore /></button>
      }/>

      {/* Hero image area */}
      <div style={{ padding: "0 16px" }}>
        <div style={{
          width: "100%", aspectRatio: "1/1", borderRadius: 24,
          background: it.color, color: it.iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {(it.image || it.asset?.url || it.asset?.dataUrl)
            ? <img src={it.image || it.asset?.url || it.asset?.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ fontSize: 140 }}>{it.icon}</div>}
          <div style={{
            position: "absolute", top: 14, left: 14,
            display: "flex", gap: 6,
          }}>
            <SHPill color={it.category === "lost" ? "red" : "blue"}>
              {it.category === "lost" ? t.lost_seg_lost : t.lost_seg_found}
            </SHPill>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
          {it[`title_${lang}`]}
        </div>
        <div style={{ fontSize: 13, color: "#6B7683", marginTop: 6 }}>
          {lang === "ko" ? `${it.postedBy} · ${it[`time_${lang}`]}` : `${it.postedBy} · ${it[`time_${lang}`]}`}
        </div>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        <SHCard radius={16} pad={0}>
          <DetailRow icon={<IcMap size={20} color={accent}/>} label={t.lost_place} value={it[`place_${lang}`]}/>
          <DetailRow icon={<IcCalendar size={20} color={accent}/>} label={t.lost_date} value={it.date}/>
          <DetailRow icon={<IcTag size={20} color={accent}/>} label={t.lost_desc} value={it[`desc_${lang}`]} last/>
        </SHCard>
      </div>

      {/* Info card */}
      <div style={{ padding: "16px 16px 0" }}>
        <SHCard radius={14} pad={14} bg="rgba(49,130,246,0.06)" style={{ display: "flex", gap: 10 }}>
          <IcShieldCheck size={20} color={accent}/>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#4E5968", lineHeight: 1.5 }}>
            {lang === "ko" ? "분실물은 본교무실에서 보관중입니다." : "Lost items are kept at the main office."}
          </div>
        </SHCard>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, last }) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: "16px 16px",
      borderBottom: last ? "none" : "1px solid #F2F4F6",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: "rgba(7,25,76,0.04)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flex: "0 0 32px",
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7683" }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#191F28", marginTop: 2, lineHeight: 1.45, letterSpacing: "-0.012em" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Register form
// ─────────────────────────────────────────────────────────────────────────────
function SHLostRegisterScreen({ t, lang, accent, onBack, showToast, initialCategory = "lost" }) {
  const { updateData } = useSHData();
  const isAdmin = window.SHIsAdminUser ? window.SHIsAdminUser() : window.SH_USER?.role === "admin";
  const [category, setCategory] = React.useState(isAdmin ? initialCategory : "lost");
  const [where, setWhere] = React.useState("");
  const [feature, setFeature] = React.useState("");
  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const [when, setWhen] = React.useState(todayStr);
  const [photo, setPhoto] = React.useState(null);
  const fileRef = React.useRef(null);
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = where.trim() && feature.trim() && (isAdmin || category !== "found");

  const handlePhotoPick = () => {
    fileRef.current?.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const [asset] = await (window.SHReadFiles?.([file]) || []);
    if (asset) setPhoto(asset);
  };

  const submit = () => {
    if (!canSubmit || (category === "found" && !isAdmin)) return;
    setSubmitting(true);
    updateData((draft) => {
      if (!Array.isArray(draft.lostItems)) draft.lostItems = [];
      draft.lostItems.unshift({
        id: `l-${Date.now()}`,
        category,
        icon: "📦",
        image: photo?.dataUrl || photo?.url || null,
        color: "#EEF2F6",
        iconColor: "#4E5968",
        title_ko: feature.trim(),
        title_en: feature.trim(),
        asset: photo || null,
        place_ko: where.trim(),
        place_en: where.trim(),
        date: when.trim(),
        desc_ko: feature.trim(),
        desc_en: feature.trim(),
        status: category === "found" ? "keep" : "open",
        postedBy: category === "found" ? "관리자" : (window.SH_USER?.name || "익명"),
        time_ko: "방금",
        time_en: "now",
      });
    });
    setSubmitting(false);
    showToast(lang === "ko" ? "등록됐어요! 주인을 빨리 찾기를 바랄게요" : "Posted! Hope it finds its owner");
    onBack();
  };

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, display: "flex", flexDirection: "column" }}>
      <SHNav title={t.lost_form_title} onBack={onBack}/>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 0" }}>
        {/* Category */}
        <SHSeg
          value={category} onChange={(next) => { if (next === "found" && !isAdmin) return; setCategory(next); }}
          options={[
            { value: "found", label: t.lost_form_cat_found },
            { value: "lost", label: t.lost_form_cat_lost },
          ]}
        />
        {category === "found" && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#8B95A1", lineHeight: 1.5 }}>
            찾아가세요 페이지는 관리자만 등록 가능합니다.
          </div>
        )}

        {/* Photo */}
        <div style={{ marginTop: 20 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
          <button onClick={handlePhotoPick} className="tds-press" style={{
            width: "100%", aspectRatio: "16/9", borderRadius: 16,
            background: photo ? `${shadeColor(accent, 60)}40` : "#fff",
            border: photo ? `2px solid ${accent}` : "2px dashed #D1D6DB",
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            position: "relative",
          }}>
            {photo ? (
              <>
                <img src={photo.dataUrl || photo.url} alt="preview" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, objectFit: "cover" }} />
                <div style={{
                  position: "absolute", bottom: 12, right: 12,
                  padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.92)",
                  fontSize: 11, fontWeight: 700, color: "#4E5968",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <IconPlus size={12}/> {lang === "ko" ? "다시 찍기" : "Retake"}
                </div>
              </>
            ) : (
              <>
                <SHTile bg={`${accent}22`} color={accent} size={56} radius={16}>
                  <IconCamera size={28}/>
                </SHTile>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#191F28" }}>{t.lost_form_photo}</div>
                <div style={{ fontSize: 12, color: "#8B95A1" }}>{t.lost_form_photo_desc}</div>
              </>
            )}
          </button>
        </div>

        {/* Form fields */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <SHInput
            label={t.lost_form_where}
            value={where}
            onChange={setWhere}
            placeholder={t.lost_form_where_ph}
          />
          <SHInput
            label={t.lost_form_when}
            value={when}
            onChange={setWhen}
            placeholder="2026.05.21"
          />
          <SHInput
            label={t.lost_form_feature}
            value={feature}
            onChange={setFeature}
            placeholder={t.lost_form_feature_ph}
            multiline
          />
        </div>

        <div style={{ height: 12 }}/>
      </div>

      <SHBottomCTA>
        <button onClick={submit} disabled={!canSubmit || submitting} className="tds-press" style={{
          width: "100%", height: 56, borderRadius: 14, border: 0,
          background: canSubmit && !submitting ? accent : "rgba(7,25,76,0.05)",
          color: canSubmit && !submitting ? "#fff" : "#B0B8C1",
          fontSize: 17, fontWeight: 800, letterSpacing: "-0.012em",
          cursor: canSubmit && !submitting ? "pointer" : "not-allowed", fontFamily: "inherit",
        }}>{submitting ? (lang === "ko" ? "등록 중…" : "Posting…") : t.lost_form_submit}</button>
      </SHBottomCTA>
    </div>
  );
}

Object.assign(window, {
  SHLostListScreen, SHLostDetailScreen, SHLostRegisterScreen,
});
