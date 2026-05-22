// Exams.jsx — Past exam archive (closed to verified students).

function SHExamsScreen({ t, lang, accent, onBack, showToast }) {
  const d = window.SHGetData ? window.SHGetData() : window.SH_DATA;
  const [subj, setSubj] = React.useState("all");
  const [grade, setGrade] = React.useState("all");

  const subjects = ["all", ...new Set(d.exams.map((e) => e.subject))];

  const filtered = d.exams.filter((e) => {
    if (subj !== "all" && e.subject !== subj) return false;
    if (grade !== "all" && e.grade !== Number(grade)) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 28 }}>
      <SHNav title={t.exams_title} onBack={onBack}/>

      {/* Trust banner */}
      <div style={{ padding: "0 16px 12px" }}>
        <SHCard radius={14} pad={14} bg="rgba(255,144,0,0.08)" style={{ display: "flex", gap: 10 }}>
          <IcLock size={18} color="#FF9000"/>
          <div style={{ flex: 1, fontSize: 12, color: "#B96B00", lineHeight: 1.5 }}>
            {t.exams_warn}
          </div>
        </SHCard>
      </div>

      {/* Filters */}
      <div style={{ padding: "0 20px 12px", display: "flex", gap: 6, overflowX: "auto" }}>
        {subjects.map((s) => (
          <Chip key={s} active={subj === s} onClick={() => setSubj(s)}>
            {s === "all" ? t.exams_subjects_all : (lang === "ko" ? s : d.exams.find(e => e.subject === s)?.subjectEn || s)}
          </Chip>
        ))}
      </div>
      <div style={{ padding: "0 20px 8px", display: "flex", gap: 6 }}>
        {["all", 1, 2, 3].map((g) => (
          <Chip key={g} active={grade === String(g) || (grade === "all" && g === "all")} onClick={() => setGrade(String(g))}>
            {g === "all" ? t.exams_subjects_all : (lang === "ko" ? `${g}학년` : `G${g}`)}
          </Chip>
        ))}
      </div>

      {/* Exam cards */}
      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((e) => {
          const subjEmoji = { "수학": "🧮", "영어": "📘", "국어": "📖", "사회": "🌏", "과학": "🔬" }[e.subject] || "📚";
          return (
            <SHCard
              key={e.id}
              onClick={() => showToast(lang === "ko" ? `${e.subject} ${e.year} ${e.type} 열람 중…` : `Opening ${e.subjectEn} ${e.year} ${e.type}…`)}
              radius={16} pad={16}
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <SHTile bg={`${accent}15`} color={accent} size={48} radius={12}>
                <span style={{ fontSize: 24 }}>{subjEmoji}</span>
              </SHTile>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <SHPill color="purple">{e.year}{lang === "ko" ? "년" : ""}</SHPill>
                  <SHPill color="blue">{e.type}{lang === "ko" ? "고사" : ""}</SHPill>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
                  {lang === "ko" ? `${e.grade}학년 ${e.subject}` : `Grade ${e.grade} ${e.subjectEn}`}
                </div>
                <div style={{ fontSize: 12, color: "#6B7683", marginTop: 2 }}>
                  {lang === "ko" ? `${e.count}문항` : `${e.count} questions`} · {lang === "ko" ? "PDF + 해설지" : "PDF + Answers"}
                </div>
              </div>
              <IconChevRight color="#B0B8C1"/>
            </SHCard>
          );
        })}
      </div>
    </div>
  );
}

window.SHExamsScreen = SHExamsScreen;
