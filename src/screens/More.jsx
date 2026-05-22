// More.jsx — Hub for less-used features.

function SHMoreScreen({ t, lang, accent, push }) {
  const isAdmin = window.SH_USER?.role === "admin";
  const sections = [
    {
      title: lang === "ko" ? "정보 / 자료" : "Information",
      rows: [
        { id: "calendar", l: t.cal_title, ic: <IcCalendarFill/>, bg: "rgba(122,90,224,0.14)", c: "#7A5AE0" },
        { id: "forms", l: t.forms_title, ic: <IcDocument/>, bg: "rgba(49,130,246,0.14)", c: "#3182F6" },
        { id: "exams", l: t.exams_title, ic: <IcBook/>, bg: "rgba(255,144,0,0.16)", c: "#FF9000" },
        { id: "notices", l: t.home_notice, ic: <IcMegaphone/>, bg: "rgba(240,68,82,0.14)", c: "#F04452" },
      ],
    },
    {
      title: lang === "ko" ? "내 정보" : "Account",
      rows: [
        { id: "profile", l: t.more_account, ic: <IconUser/>, bg: "rgba(7,25,76,0.05)", c: "#4E5968" },
        { id: "settings", l: t.more_settings, ic: <IconSettings/>, bg: "rgba(7,25,76,0.05)", c: "#4E5968" },
        ...(isAdmin ? [{ id: "admin", l: lang === "ko" ? "관리자 페이지" : "Admin console", ic: <IcShieldCheck/>, bg: "rgba(49,130,246,0.14)", c: "#3182F6" }] : []),
      ],
    },
  ];

  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 28 }}>
      {/* Header with profile */}
      <div style={{ padding: "16px 20px 14px" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em" }}>
          {t.more_title}
        </div>
      </div>

      {/* Profile card */}
      <div style={{ padding: "0 16px 12px" }}>
        <SHCard radius={20} pad={20} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: `linear-gradient(135deg, ${accent}, ${shadeColor(accent, -22)})`,
            color: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800,
          }}>{t.studentName[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#191F28", letterSpacing: "-0.012em" }}>
              {t.studentName}
            </div>
            <div style={{ fontSize: 13, color: "#6B7683", marginTop: 2 }}>
              {t.grade}
            </div>
          </div>
          <SHPill color="blue">{lang === "ko" ? "학생 인증" : "Verified"}</SHPill>
        </SHCard>
      </div>

      {sections.map((sec, i) => (
        <div key={i} style={{ padding: "8px 16px 0" }}>
          <SHSection title={sec.title}/>
          <SHCard radius={16} pad={0}>
            {sec.rows.map((row, j) => (
              <div key={row.id}
                className="tds-press"
                onClick={() => push(row.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 18px", cursor: "pointer",
                  borderBottom: j < sec.rows.length - 1 ? "1px solid #F2F4F6" : "none",
                }}>
                <SHTile bg={row.bg} color={row.c} size={36} radius={10}>{row.ic}</SHTile>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>
                  {row.l}
                </div>
                <IconChevRight color="#B0B8C1"/>
              </div>
            ))}
          </SHCard>
        </div>
      ))}

      <div style={{ padding: "24px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#B0B8C1", fontWeight: 600 }}>
          SchoolHub · v0.9.2 · {lang === "ko" ? "장평중학교 학생회 만듦" : "Made by JP Student Council"}
        </div>
      </div>
    </div>
  );
}

function SHProfileScreen({ t, lang, onBack }) {
  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 20 }}>
      <SHNav title={t.more_account} onBack={onBack}/>
      <div style={{ padding: "14px 16px 0" }}>
        <SHCard radius={18} pad={0}>
          {[
            { l: lang === "ko" ? "이름" : "Name", v: t.studentName },
            { l: lang === "ko" ? "학급" : "Class", v: t.grade },
            { l: lang === "ko" ? "학교" : "School", v: t.school },
          ].map((row, i) => (
            <div key={row.l} style={{
              display: "flex", alignItems: "center", padding: "16px 18px",
              borderBottom: i < 2 ? "1px solid #F2F4F6" : "none",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8B95A1", width: 72 }}>{row.l}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>{row.v}</div>
            </div>
          ))}
        </SHCard>
      </div>
    </div>
  );
}

function SHSettingsScreen({ t, lang, onBack, go }) {
  return (
    <div style={{ minHeight: "100%", background: "#F2F4F6", paddingTop: 47, paddingBottom: 20 }}>
      <SHNav title={t.more_settings} onBack={onBack}/>
      <div style={{ padding: "14px 16px 0" }}>
        <SHCard radius={18} pad={0}>
          {[
            { id: "board", l: t.sug_title, sub: lang === "ko" ? "학교 건의를 확인하고 작성해요" : "Read and write suggestions" },
            { id: "forms", l: t.forms_title, sub: lang === "ko" ? "자주 쓰는 양식을 빠르게 열어요" : "Open frequently used forms" },
            { id: "exams", l: t.exams_title, sub: lang === "ko" ? "기출문제를 바로 확인해요" : "Open past exam sheets" },
          ].map((row, i, arr) => (
            <div key={row.id}
              className="tds-press"
              onClick={() => go(row.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                padding: "16px 18px",
                borderBottom: i < arr.length - 1 ? "1px solid #F2F4F6" : "none",
              }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#191F28", letterSpacing: "-0.012em" }}>{row.l}</div>
                <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 3 }}>{row.sub}</div>
              </div>
              <IconChevRight color="#B0B8C1"/>
            </div>
          ))}
        </SHCard>
      </div>
    </div>
  );
}

Object.assign(window, { SHMoreScreen, SHProfileScreen, SHSettingsScreen });
