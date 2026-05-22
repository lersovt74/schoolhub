// PCApp.jsx — desktop SchoolHub root.

const PC_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3182F6",
  "language": "ko",
  "showAllergyWarning": true
}/*EDITMODE-END*/;

const PC_ACCENTS = ["#3182F6", "#2D7D4B", "#7A5AE0", "#FF6B35"];

function SHDesktopApp() {
  const [tw, setTweak] = useTweaks(PC_TWEAK_DEFAULTS);
  const lang = tw.language;
  const L = window.SH_STRINGS[lang];
  const accent = tw.accent;
  const sync = useSchoolDataSync(window.SH_DATA);
  window.SH_RUNTIME_DATA = sync.data;

  const [route, setRoute] = React.useState(window.SH_USER?.role === "admin" ? "admin" : "home");
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);

  const nav = [
    { id: "home", label: L.tab_home, icon: <IconHomeMono/> },
    { id: "meal", label: L.home_meal_title, icon: <IcUtensils/> },
    { id: "timetable", label: L.home_timetable, icon: <IcClock/> },
    { id: "calendar", label: L.cal_title, icon: <IcCalendar/> },
    { id: "lost", label: L.lost_title, icon: <IcTag/>, badge: 14, badgeColor: "#3182F6" },
    { id: "board", label: L.sug_title, icon: <IcThumbsUpOutline/> },
    { id: "anon", label: L.anon_title, icon: <IcShieldCheck/> },
    { id: "forms", label: L.forms_title, icon: <IcDocument/> },
    { id: "exams", label: L.exams_title, icon: <IcBook/> },
    ...(window.SH_USER?.role === "admin" ? [{ id: "admin", label: "관리자", icon: <IconSettings/> }] : []),
  ];

  const titles = {
    home:       { t: lang === "ko" ? "홈" : "Home", bc: lang === "ko" ? "장평중학교" : "Jangpyeong MS" },
    meal:       { t: L.meal_today, bc: lang === "ko" ? "정보 / 식단" : "Info / Meal" },
    timetable:  { t: L.home_timetable, bc: lang === "ko" ? "정보 / 시간표" : "Info / Timetable" },
    calendar:   { t: L.cal_title, bc: lang === "ko" ? "정보 / 학사일정" : "Info / Calendar" },
    notices:    { t: L.home_notice, bc: lang === "ko" ? "정보 / 주요 공지" : "Info / Notices" },
    lost:       { t: L.lost_title, bc: lang === "ko" ? "생활 / 분실물" : "Life / Lost & Found" },
    board:      { t: L.sug_title, bc: lang === "ko" ? "소통 / 건의함" : "Voice / Board" },
    anon:       { t: L.anon_title, bc: lang === "ko" ? "소통 / 익명 신고" : "Voice / Anonymous" },
    forms:      { t: L.forms_title, bc: lang === "ko" ? "자료 / 출결 양식" : "Docs / Forms" },
    exams:      { t: L.exams_title, bc: lang === "ko" ? "자료 / 기출문제" : "Docs / Past exams" },
    admin:      { t: "관리자", bc: lang === "ko" ? "관리 / 학교 관리" : "Admin / School management" },
  };

  const renderRoute = () => {
    switch (route) {
      case "home":  return <PCHome L={L} lang={lang} accent={accent} onNavigate={setRoute}/>;
      case "anon":  return window.PCAnon ? <PCAnon L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      case "lost":  return window.PCLost ? <PCLost L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      case "board": return window.PCBoard ? <PCBoard L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      case "meal":  return window.PCMeal ? <PCMeal L={L} lang={lang} accent={accent} showAllergyWarning={tw.showAllergyWarning}/> : <RouteStub label={titles[route]?.t}/>;
      case "timetable": return window.PCTimetable ? <PCTimetable L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      case "calendar": return window.PCCalendar ? <PCCalendar L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      case "notices": return window.PCNotices ? <PCNotices L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      case "forms": return window.PCForms ? <PCForms L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      case "exams": return window.PCExams ? <PCExams L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      case "admin":
        if (window.SH_USER?.role !== "admin") return <RouteStub label={lang === "ko" ? "권한이 없어요" : "Access denied"}/>;
        return window.PCAdmin ? <PCAdmin L={L} lang={lang} accent={accent}/> : <RouteStub label={titles[route]?.t}/>;
      default:      return <RouteStub label={route}/>;
    }
  };

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: "#F2F4F6", color: "#191F28", fontFamily: "var(--tds-font-sans)",
    }}>
      <PCSidebar
        items={nav}
        active={route}
        onSelect={setRoute}
        school={lang === "ko" ? "장평중학교" : "Jangpyeong MS"}
        accent={accent}
        lang={lang}
      />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <PCTopbar
          title={titles[route]?.t || route}
          breadcrumb={titles[route]?.bc}
          accent={accent}
          studentName={L.studentName}
          grade={L.grade}
          lang={lang}
        />
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {renderRoute()}
        </div>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label={lang === "ko" ? "포인트 컬러" : "Accent"}>
          <TweakColor label={lang === "ko" ? "메인 컬러" : "Primary"}
            value={tw.accent} options={PC_ACCENTS}
            onChange={(v) => setTweak("accent", v)}/>
        </TweakSection>
        <TweakSection label={lang === "ko" ? "급식" : "Meal"}>
          <TweakToggle label={lang === "ko" ? "알레르기 표시" : "Show allergens"}
            value={tw.showAllergyWarning}
            onChange={(v) => setTweak("showAllergyWarning", v)}/>
        </TweakSection>
        <TweakSection label={lang === "ko" ? "언어" : "Language"}>
          <TweakRadio label="Lang" value={tw.language}
            options={[{ value: "ko", label: "한국어" }, { value: "en", label: "English" }]}
            onChange={(v) => setTweak("language", v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function RouteStub({ label }) {
  return (
    <div style={{ padding: 60, textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#191F28" }}>
        곧 추가될 화면이에요
      </div>
      <div style={{ marginTop: 6, fontSize: 14, color: "#8B95A1" }}>"{label}"</div>
    </div>
  );
}

window.SHDesktopApp = SHDesktopApp;
