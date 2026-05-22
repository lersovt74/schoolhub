// App.jsx — SchoolHub root: device frame + router + tab bar + Tweaks.
// One file at the top; screens are split into ../screens/*.jsx.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3182F6",
  "mealLayout": "card",
  "language": "ko",
  "showAllergyWarning": true,
  "safeMode": true,
  "anonHero": "shield"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  "#3182F6", // Toss blue
  "#2D7D4B", // 장평 교색 (forest)
  "#7A5AE0", // purple
  "#FF6B35", // orange
];

function SHMobileApp({ onLogout }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const showTweaks = window.location.protocol === "file:" || ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const lang = t.language;
  const L = window.SH_STRINGS[lang];
  const accent = t.accent;
  const sync = useSchoolDataSync(window.SH_DATA);
  window.SH_RUNTIME_DATA = window.SH_DATA || sync.data;

  // Navigation stack
  const initialRoot = window.SH_USER?.role === "admin" ? "admin" : "home";
  const initialTab = initialRoot === "admin" ? "more" : initialRoot;
  const [stack, setStack] = React.useState([{ id: initialRoot }]);
  const [tab, setTab] = React.useState(initialTab);
  const [toast, setToast] = React.useState(null);
  const top = stack[stack.length - 1];
  const scrollRef = React.useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const push = (id, params = {}) => setStack((s) => [...s, { id, params }]);
  const pop = () => setStack((s) => s.length > 1 ? s.slice(0, -1) : s);
  const reset = (id) => setStack([{ id }]);

  const go = (id, params = {}) => {
    // tab IDs reset stack; sub-screens push
    if (["home", "lost", "report", "board", "more"].includes(id)) {
      setTab(id);
      reset(id);
    } else {
      push(id, params);
    }
  };

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "auto" });
  }, [top.id, stack.length]);

  // Anonymous report — flow state lives at app level so back doesn't reset it
  const [anonState, setAnonState] = React.useState({
    category: "violence",
    when: "",
    where: "",
    what: "",
    code: null, // assigned when submitted
  });

  const tabs = [
    { id: "report", label: L.tab_report, icon: <IcShieldLock size={24} /> },
    { id: "lost", label: L.tab_lost, icon: <IcTag size={24} /> },
    { id: "home", label: L.tab_home, icon: <IconHomeMono size={24} /> },
    { id: "board", label: L.tab_board, icon: <IcThumbsUpOutline size={24} /> },
    { id: "more", label: L.tab_more, icon: <IconMore size={24} /> },
  ];

  // Map sub-screens back to their owning tab so the bar highlights right tab
  const screenToTab = {
    home: "home", meal: "home", timetable: "home", calendar: "home", notices: "home",
    lost: "lost", "lost-detail": "lost", "lost-register": "lost",
    report: "report", "report-form": "report", "report-done": "report",
    "report-check": "report", "report-status": "report",
    board: "board", "board-write": "board", "board-detail": "board",
    more: "more", forms: "more", exams: "more", profile: "more", settings: "more", admin: "more",
  };
  const activeTab = screenToTab[top.id] || tab;

  // Stub renderer — wired one-by-one
  const screen = renderScreen({ top, L, lang, accent, t, push, pop, go, setAnonState, anonState, showToast, setTweak, onLogout });

  // Show tab bar on root tabs only.
  const isRoot = stack.length === 1;

  return (
    <div style={{
      width: "100%",
      minHeight: "100dvh",
      background: "#F2F4F6",
      display: "flex",
      justifyContent: "center",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        minHeight: "100dvh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "#F2F4F6",
      }}>
        <div ref={scrollRef} className="sh-mobile-scroll" style={{ flex: 1, overflowY: "auto", position: "relative", background: "#F2F4F6", overflowX: "hidden" }}>
          {screen}
        </div>
        {isRoot && (
          <SHTabBar
            tabs={tabs}
            active={activeTab}
            accent={accent}
            onChange={(id) => go(id)}
          />
        )}
        <Toast show={!!toast}>{toast}</Toast>
      </div>

      {showTweaks && <TweaksPanel title="Tweaks">
        <TweakSection label={lang === "ko" ? "포인트 컬러" : "Accent"}>
          <TweakColor
            label={lang === "ko" ? "메인 컬러" : "Primary"}
            value={t.accent}
            options={ACCENT_OPTIONS}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
        <TweakSection label={lang === "ko" ? "급식판" : "Meal"}>
          <TweakRadio
            label={lang === "ko" ? "레이아웃" : "Layout"}
            value={t.mealLayout}
            options={[
              { value: "card", label: lang === "ko" ? "카드" : "Card" },
              { value: "list", label: lang === "ko" ? "리스트" : "List" },
              { value: "grid", label: lang === "ko" ? "그리드" : "Grid" },
            ]}
            onChange={(v) => setTweak("mealLayout", v)}
          />
          <TweakToggle
            label={lang === "ko" ? "알레르기 표시" : "Show allergens"}
            value={t.showAllergyWarning}
            onChange={(v) => setTweak("showAllergyWarning", v)}
          />
        </TweakSection>
        <TweakSection label={lang === "ko" ? "익명 신고" : "Anonymous"}>
          <TweakRadio
            label={lang === "ko" ? "히어로 톤" : "Hero tone"}
            value={t.anonHero}
            options={[
              { value: "shield", label: lang === "ko" ? "방패" : "Shield" },
              { value: "lock", label: lang === "ko" ? "자물쇠" : "Lock" },
            ]}
            onChange={(v) => setTweak("anonHero", v)}
          />
          <TweakToggle
            label={lang === "ko" ? "Safe-mode 강조" : "Safe-mode banner"}
            value={t.safeMode}
            onChange={(v) => setTweak("safeMode", v)}
          />
        </TweakSection>
        <TweakSection label={lang === "ko" ? "언어" : "Language"}>
          <TweakRadio
            label="Lang"
            value={t.language}
            options={[
              { value: "ko", label: "한국어" },
              { value: "en", label: "English" },
            ]}
            onChange={(v) => setTweak("language", v)}
          />
        </TweakSection>
      </TweaksPanel>}
    </div>
  );
}

// Custom tab bar — middle tab is a circular accent button (anonymous report)
function SHTabBar({ tabs, active, accent, onChange }) {
  return (
    <div style={{
      flex: "0 0 auto", minHeight: 74, paddingBottom: "max(10px, env(safe-area-inset-bottom))",
      background: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid #F2F4F6",
      display: "flex", position: "relative",
    }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, border: 0, background: "transparent", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            paddingTop: 10, color: on ? "#191F28" : "#B0B8C1",
          }}>
            {t.icon}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "-0.01em" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Screen router. Stubs for not-yet-built screens.
function renderScreen({ top, L, lang, accent, t, push, pop, go, setAnonState, anonState, showToast, setTweak, onLogout }) {
  switch (top.id) {
    case "home":
      return <SHHomeScreen
        t={L} lang={lang} accent={accent}
        mealLayout={t.mealLayout}
        showAllergyWarning={t.showAllergyWarning}
        onGo={go}
      />;
    case "meal":
      return window.SHMealScreen
        ? <SHMealScreen t={L} lang={lang} accent={accent} mealLayout={t.mealLayout} showAllergyWarning={t.showAllergyWarning} onBack={pop}/>
        : <ScreenStub title={L.home_meal_title} onBack={pop} />;
    case "timetable":
      return window.SHTimetableScreen
        ? <SHTimetableScreen t={L} lang={lang} accent={accent} onBack={pop}/>
        : <ScreenStub title={L.home_timetable} onBack={pop} />;
    case "calendar":
      return window.SHCalendarScreen
        ? <SHCalendarScreen t={L} lang={lang} accent={accent} onBack={pop}/>
        : <ScreenStub title={L.cal_title} onBack={pop} />;
    case "notices":
      return window.SHNoticesScreen
        ? <SHNoticesScreen t={L} lang={lang} accent={accent} onBack={pop} push={push}/>
        : <ScreenStub title={L.home_notice} onBack={pop} />;
    case "notice-detail":
      return window.SHNoticeDetailScreen
        ? <SHNoticeDetailScreen t={L} lang={lang} accent={accent} onBack={pop} noticeId={top.params?.id}/>
        : <ScreenStub title={L.home_notice} onBack={pop} />;
    case "lost":
      return window.SHLostListScreen
        ? <SHLostListScreen t={L} lang={lang} accent={accent} onGo={go} push={push}/>
        : <ScreenStub title={L.lost_title} />;
    case "lost-detail":
      return window.SHLostDetailScreen
        ? <SHLostDetailScreen t={L} lang={lang} accent={accent} itemId={top.params?.item} onBack={pop} showToast={showToast}/>
        : <ScreenStub title={L.lost_title} onBack={pop} />;
    case "lost-register":
      return window.SHLostRegisterScreen
        ? <SHLostRegisterScreen t={L} lang={lang} accent={accent} onBack={pop} showToast={showToast} initialCategory={top.params?.category || "lost"}/>
        : <ScreenStub title={L.lost_form_title} onBack={pop} />;
    case "report":
      return window.SHReportHomeScreen
        ? <SHReportHomeScreen t={L} lang={lang} accent={accent} safeMode={t.safeMode} anonHero={t.anonHero}
            onStart={() => push("report-form")} onCheck={() => push("report-check")}
            onClose={() => go("home")} />
        : <ScreenStub title={L.anon_title} />;
    case "report-form":
      return window.SHReportFormScreen
        ? <SHReportFormScreen t={L} lang={lang} accent={accent}
            state={anonState} setState={setAnonState} onBack={pop}
            onSubmit={(code) => {
              setAnonState((s) => ({ ...s, code }));
              const report = window.SHCreateReport?.({
                code,
                category: anonState.category,
                when: anonState.when,
                where: anonState.where,
                what: anonState.what,
              });
              push("report-done", { code, reportId: report?.id });
            }}/>
        : <ScreenStub title={L.anon_form_title} onBack={pop} />;
    case "report-done":
      return window.SHReportDoneScreen
        ? <SHReportDoneScreen t={L} lang={lang} accent={accent} code={top.params?.code || anonState.code}
            onCheck={() => push("report-status", { code: top.params?.code || anonState.code, reportId: top.params?.reportId })} onHome={() => go("home")} showToast={showToast}/>
        : <ScreenStub title={L.anon_done_title} />;
    case "report-check":
      return window.SHReportCheckScreen
        ? <SHReportCheckScreen t={L} lang={lang} accent={accent} onBack={pop}
            onSuccess={(report) => push("report-status", { code: report.code, reportId: report.id })} prefillCode={anonState.code}/>
        : <ScreenStub title={L.anon_check} onBack={pop} />;
    case "report-status":
      return window.SHReportStatusScreen
        ? <SHReportStatusScreen t={L} lang={lang} accent={accent} code={top.params?.code || anonState.code || "X3K9MZ"} reportId={top.params?.reportId} onBack={pop} onHome={() => go("home")}/>
        : <ScreenStub title={L.anon_status_title} onBack={pop} />;
    case "board":
      return window.SHBoardScreen
        ? <SHBoardScreen t={L} lang={lang} accent={accent} push={push}/>
        : <ScreenStub title={L.sug_title} />;
    case "board-write":
      return window.SHBoardWriteScreen
        ? <SHBoardWriteScreen t={L} lang={lang} accent={accent} onBack={pop} showToast={showToast}/>
        : <ScreenStub title={L.sug_write} onBack={pop} />;
    case "board-detail":
      return window.SHBoardDetailScreen
        ? <SHBoardDetailScreen t={L} lang={lang} accent={accent} sid={top.params?.id} onBack={pop} showToast={showToast}/>
        : <ScreenStub title={L.sug_title} onBack={pop} />;
    case "more":
      return window.SHMoreScreen
        ? <SHMoreScreen t={L} lang={lang} accent={accent} push={push}/>
        : <ScreenStub title={L.more_title} />;
    case "profile":
      return window.SHProfileScreen
        ? <SHProfileScreen t={L} lang={lang} accent={accent} onBack={pop}/>
        : <ScreenStub title={L.more_account} onBack={pop} />;
    case "settings":
      return window.SHSettingsScreen
        ? <SHSettingsScreen t={L} lang={lang} accent={accent} onBack={pop} go={go} onLogout={onLogout}/>
        : <ScreenStub title={L.more_settings} onBack={pop} />;
    case "forms":
      return window.SHFormsScreen
        ? <SHFormsScreen t={L} lang={lang} accent={accent} onBack={pop} showToast={showToast}/>
        : <ScreenStub title={L.forms_title} onBack={pop} />;
    case "exams":
      return window.SHExamsScreen
        ? <SHExamsScreen t={L} lang={lang} accent={accent} onBack={pop} showToast={showToast}/>
        : <ScreenStub title={L.exams_title} onBack={pop} />;
    case "admin":
      if (window.SH_USER?.role !== "admin") return <ScreenStub title={lang === "ko" ? "권한이 없어요" : "Access denied"} onBack={pop} />;
      return window.SHAdminScreen
        ? <SHAdminScreen t={L} lang={lang} accent={accent} onBack={pop}/>
        : <ScreenStub title="관리자" onBack={pop} />;
    default:
      return <ScreenStub title={top.id} onBack={pop} />;
  }
}

function ScreenStub({ title, onBack }) {
  return (
    <div style={{ paddingTop: 47, background: "#F2F4F6", minHeight: "100%" }}>
      <SHNav title={title} onBack={onBack} />
      <div style={{ padding: 40, textAlign: "center", color: "#8B95A1" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#191F28" }}>곧 추가될 화면이에요</div>
        <div style={{ marginTop: 8, fontSize: 14 }}>"{title}"</div>
      </div>
    </div>
  );
}

window.SHMobileApp = SHMobileApp;
