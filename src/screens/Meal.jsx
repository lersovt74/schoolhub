// Meal.jsx — Today's meal + weekly view with week pagination.

function ymdKeyFromDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function ymdFromCompact(ymd) {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

function dateFromCompact(ymd) {
  return new Date(Number(ymd.slice(0, 4)), Number(ymd.slice(4, 6)) - 1, Number(ymd.slice(6, 8)));
}

function buildWeekDaysFromAnchor(anchorCompact, mealByDate) {
  const mon = dateFromCompact(anchorCompact);
  const days = [];
  for (let i = 0; i < 5; i += 1) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    const key = ymdKeyFromDate(d);
    const src = mealByDate[key];
    days.push({
      key,
      day: window.SH_WEEKDAY_KO ? window.SH_WEEKDAY_KO[d.getDay()] : "",
      date: `${d.getMonth() + 1}.${d.getDate()}`,
      today: key === ymdKeyFromDate(new Date()),
      meal: src || null,
    });
  }
  return days;
}

function SHMealScreen({ t, lang, accent, mealLayout, showAllergyWarning, onBack }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const mealByDate = d.meal.byDate || {};
  const todayKey = ymdKeyFromDate(new Date());
  const fallbackAnchor = (() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);
    const y = mon.getFullYear();
    const m = String(mon.getMonth() + 1).padStart(2, "0");
    const dayTxt = String(mon.getDate()).padStart(2, "0");
    return `${y}${m}${dayTxt}`;
  })();
  const anchors = (d.meal.weekAnchors && d.meal.weekAnchors.length ? d.meal.weekAnchors : [fallbackAnchor]).slice();
  const initialWeekIdx = Math.max(0, anchors.findIndex((a) => {
    const weekDays = buildWeekDaysFromAnchor(a, mealByDate);
    return weekDays.some((x) => x.key === todayKey);
  }));
  const [weekIdx, setWeekIdx] = React.useState(initialWeekIdx);
  const anchorsKey = anchors.join("|");
  React.useEffect(() => {
    const todayWeekIdx = anchors.findIndex((a) => buildWeekDaysFromAnchor(a, mealByDate).some((x) => x.key === todayKey));
    setWeekIdx((prev) => {
      const valid = prev >= 0 && prev < anchors.length;
      if (valid) {
        const hasToday = buildWeekDaysFromAnchor(anchors[prev], mealByDate).some((x) => x.key === todayKey);
        if (hasToday) return prev;
      }
      return todayWeekIdx >= 0 ? todayWeekIdx : 0;
    });
  }, [anchorsKey, mealByDate, todayKey]);

  const weekDays = React.useMemo(
    () => buildWeekDaysFromAnchor(anchors[weekIdx], mealByDate),
    [anchors, weekIdx, mealByDate],
  );

  const initialDayIdx = Math.max(0, weekDays.findIndex((w) => w.key === todayKey));
  const [day, setDay] = React.useState(initialDayIdx);
  React.useEffect(() => {
    const next = weekDays.findIndex((w) => w.key === todayKey);
    setDay(next >= 0 ? next : 0);
  }, [weekIdx]);

  const selected = weekDays[day] || weekDays[0];
  const selectedMeal = selected?.meal;
  const items = selectedMeal?.items || [];
  const kcal = selectedMeal?.kcal || 0;
  const allergens = d.meal.allergyKey;
  const hasMeal = items.length > 0;

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 20 }}>
      <SHNav title={t.meal_today} onBack={onBack}/>

      <div style={{ padding: "0 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => setWeekIdx((v) => Math.max(0, v - 1))}
          disabled={weekIdx <= 0}
          style={{
            width: 34, height: 34, borderRadius: 17, border: 0,
            background: weekIdx <= 0 ? "#E5E8EB" : "#E9EEF5",
            color: weekIdx <= 0 ? "#B0B8C1" : "#4E5968",
            cursor: weekIdx <= 0 ? "default" : "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><IcRight size={16}/></span>
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7683" }}>
          {d.meal.currentMonth || ""}
        </div>
        <button
          onClick={() => setWeekIdx((v) => Math.min(anchors.length - 1, v + 1))}
          disabled={weekIdx >= anchors.length - 1}
          style={{
            width: 34, height: 34, borderRadius: 17, border: 0,
            background: weekIdx >= anchors.length - 1 ? "#E5E8EB" : "#E9EEF5",
            color: weekIdx >= anchors.length - 1 ? "#B0B8C1" : "#4E5968",
            cursor: weekIdx >= anchors.length - 1 ? "default" : "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <IcRight size={16}/>
        </button>
      </div>

      {/* Week strip */}
      <div style={{ padding: "0 16px 16px" }}>
        <SHCard radius={20} pad={12}>
          <div style={{ display: "flex", gap: 6 }}>
            {weekDays.map((w, i) => {
              const on = i === day;
              return (
                <button key={w.key} onClick={() => setDay(i)} style={{
                  flex: 1, border: 0, borderRadius: 12, padding: "10px 0",
                  background: on ? accent : "transparent",
                  color: on ? "#fff" : "#191F28",
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transition: "all 200ms",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: on ? "rgba(255,255,255,0.7)" : "#8B95A1" }}>
                    {w.day}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.012em" }}>{w.date}</span>
                  {(w.today || on) && (
                    <span style={{
                      width: 5, height: 5, borderRadius: 999,
                      background: on ? "#fff" : accent,
                    }}/>
                  )}
                </button>
              );
            })}
          </div>
        </SHCard>
      </div>

      {/* Meta header */}
      <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <SHPill color="blue">{t.meal_lunch}</SHPill>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#191F28" }}>
          {kcal} {t.home_kcal}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6B7683", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IcUtensils size={14}/> {lang === "ko" ? `${items.length}가지` : `${items.length} dishes`}
        </span>
      </div>

      {!hasMeal && (
        <div style={{ padding: "0 16px" }}>
          <SHCard radius={16} pad={18}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#4E5968" }}>{t.meal_no}</div>
          </SHCard>
        </div>
      )}

      {hasMeal && mealLayout === "card" && <MealCardLayout items={items} accent={accent} showAllergyWarning={showAllergyWarning} lang={lang}/>}
      {hasMeal && mealLayout === "list" && <MealListLayout items={items} accent={accent} showAllergyWarning={showAllergyWarning} lang={lang} allergens={allergens}/>}
      {hasMeal && mealLayout === "grid" && <MealGridLayout items={items} accent={accent} showAllergyWarning={showAllergyWarning} lang={lang}/>}

      {/* Allergy key */}
      {showAllergyWarning && hasMeal && (
        <div style={{ padding: "16px 16px 0" }}>
          <SHCard radius={16} pad={16}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>
              {lang === "ko" ? "오늘의 알레르기 정보" : "Allergens today"}
            </div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allergens.filter((a) => items.some((it) => it.allergens?.includes(a.n))).map((a) => (
                <span key={a.n} style={{
                  padding: "5px 10px", borderRadius: 8,
                  background: "rgba(240,68,82,0.08)", color: "#D43144",
                  fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{a.n}</span>
                  {a[lang]}
                </span>
              ))}
            </div>
          </SHCard>
        </div>
      )}

      {/* Origin info */}
      {hasMeal && (
        <div style={{ padding: "16px 16px 0" }}>
          <SHCard radius={16} pad={16}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>
              {t.meal_origin}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#6B7683", lineHeight: 1.6 }}>
              {selectedMeal?.originInfo || (lang === "ko" ? "원산지 정보 준비 중" : "Origin information unavailable")}
            </div>
          </SHCard>
        </div>
      )}
    </div>
  );
}

// ─── layouts ────────────────────────────────────────────────────────────────

function MealCardLayout({ items, accent, showAllergyWarning, lang }) {
  return (
    <div style={{ padding: "0 16px" }}>
      <SHCard radius={20} pad={20} style={{
        background: `linear-gradient(135deg, ${accent}, ${shadeColor(accent, -18)})`,
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        <div aria-hidden="true" style={{
          position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}/>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
              borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.16)" : "none",
            }}>
              <span style={{ fontSize: 22 }}>{["🍚","🥣","🥘","🍳","🥬","🥛","🍱","🥗"][i % 8]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.012em" }}>
                  {it[lang]}
                </div>
                {showAllergyWarning && it.allergens?.length > 0 && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                    {lang === "ko" ? "알레르기 " : "Allergens "}{it.allergens.join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </SHCard>
    </div>
  );
}

function MealListLayout({ items, accent, showAllergyWarning, lang }) {
  return (
    <div style={{ padding: "0 16px" }}>
      <SHCard radius={16} pad={0}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 18px",
            borderBottom: i < items.length - 1 ? "1px solid #F2F4F6" : "none",
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${accent}15`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>{["🍚","🥣","🥘","🍳","🥬","🥛","🍱","🥗"][i % 8]}</span>
            <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>
              {it[lang]}
            </div>
            {showAllergyWarning && it.allergens?.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: "#D43144",
                fontVariantNumeric: "tabular-nums",
              }}>
                {it.allergens.join(",")}
              </span>
            )}
          </div>
        ))}
      </SHCard>
    </div>
  );
}

function MealGridLayout({ items, accent, showAllergyWarning, lang }) {
  return (
    <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {items.map((it, i) => (
        <SHCard key={i} radius={16} pad={16} style={{
          display: "flex", flexDirection: "column", gap: 8, position: "relative",
          background: `${accent}0A`,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${accent}1F`, color: accent,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>{["🍚","🥣","🥘","🍳","🥬","🥛","🍱","🥗"][i % 8]}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em", lineHeight: 1.3, minHeight: 36 }}>
            {it[lang]}
          </div>
          {showAllergyWarning && it.allergens?.length > 0 && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              padding: "2px 6px", borderRadius: 6,
              background: "rgba(240,68,82,0.12)", color: "#D43144",
              fontSize: 10, fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
            }}>
              {it.allergens.join(",")}
            </div>
          )}
        </SHCard>
      ))}
    </div>
  );
}

window.SHMealScreen = SHMealScreen;
