// UnifiedApp.jsx — single entry for mobile/desktop + passwordless login.

function SHLoginGate({ onSubmit }) {
  const narrow = typeof window !== "undefined" ? window.innerWidth < 420 : false;
  const [grade, setGrade] = React.useState("3");
  const [className, setClassName] = React.useState("5");
  const [number, setNumber] = React.useState("12");
  const [name, setName] = React.useState("");

  const canLogin = grade && className && number && name.trim().length > 0;

  const submit = () => {
    if (!canLogin) return;
    onSubmit({
      grade: String(grade).trim(),
      className: String(className).trim(),
      number: String(number).trim(),
      name: name.trim(),
    });
  };

  return (
    <div style={{
      width: "100%", minHeight: "100dvh", background: "#F2F4F6",
      display: "flex", alignItems: narrow ? "center" : "flex-start", justifyContent: "center",
      padding: narrow
        ? "16px 14px max(18px, env(safe-area-inset-bottom))"
        : "max(32px, calc(env(safe-area-inset-top) + 28px)) 16px max(24px, env(safe-area-inset-bottom))",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%", maxWidth: narrow ? 420 : 480, background: "#fff", borderRadius: 24,
        padding: narrow ? "18px" : "clamp(20px, 5vw, 28px)",
        boxShadow: "0 10px 30px rgba(2,32,71,0.08)",
      }}>
        <div style={{ fontSize: narrow ? 30 : "clamp(28px, 7vw, 40px)", fontWeight: 800, color: "#191F28", letterSpacing: "-0.03em", lineHeight: 1.1 }}>SchoolHub 로그인</div>
        <div style={{ marginTop: 8, fontSize: narrow ? 15 : "clamp(14px, 3.8vw, 17px)", color: "#6B7683", lineHeight: 1.5 }}>
          학년, 반, 번호, 이름만 입력하면 바로 들어가요.
        </div>

        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))", gap: 10 }}>
          <SHInput label="학년" value={grade} onChange={setGrade} placeholder="3" type="number"/>
          <SHInput label="반" value={className} onChange={setClassName} placeholder="5" type="number"/>
          <SHInput label="번호" value={number} onChange={setNumber} placeholder="12" type="number"/>
        </div>
        <div style={{ marginTop: 12 }}>
          <SHInput label="이름" value={name} onChange={setName} placeholder="예) 김다온"/>
        </div>

        <button
          onClick={submit}
          disabled={!canLogin}
          style={{
            marginTop: 20, width: "100%", height: 56, borderRadius: 14, border: 0,
            background: canLogin ? "#3182F6" : "rgba(7,25,76,0.08)",
            color: canLogin ? "#fff" : "#B0B8C1",
            fontSize: 17, fontWeight: 800, cursor: canLogin ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

function SHUnifiedRoot() {
  React.useMemo(() => {
    window.SHDataState?.load?.();
    return null;
  }, []);
  const { user, login, logout } = useSHUser();
  const [isDesktop, setIsDesktop] = React.useState(() => window.innerWidth >= 1100);

  React.useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1100);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!user) return <SHLoginGate onSubmit={login} />;

  const AppCmp = isDesktop ? window.SHDesktopApp : window.SHMobileApp;
  if (!AppCmp) return <div style={{ padding: 24 }}>앱 로딩 중...</div>;

  return (
    <div style={{ width: "100%", minHeight: "100dvh" }}>
      <AppCmp onLogout={logout} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SHUnifiedRoot />);
