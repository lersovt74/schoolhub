// UnifiedApp.jsx — single entry for mobile/desktop + passwordless login.

function SHLoginGate({ onSubmit }) {
  const [grade, setGrade] = React.useState("3");
  const [className, setClassName] = React.useState("5");
  const [number, setNumber] = React.useState("12");
  const [name, setName] = React.useState("");

  const canLogin = grade && className && number && name.trim().length > 0;

  const submit = () => {
    if (!canLogin) return;
    const role = /admin|관리/.test(name.trim().toLowerCase()) ? "admin" : "student";
    onSubmit({
      grade: String(grade).trim(),
      className: String(className).trim(),
      number: String(number).trim(),
      name: name.trim(),
      role,
    });
  };

  return (
    <div style={{
      width: "100%", height: "100%", background: "#F2F4F6",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 420, background: "#fff", borderRadius: 18, padding: 24,
        boxShadow: "0 10px 30px rgba(2,32,71,0.08)",
      }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#191F28", letterSpacing: "-0.02em" }}>SchoolHub 로그인</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "#6B7683" }}>학년, 반, 번호, 이름만 입력하면 바로 들어가요.</div>

        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
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
            marginTop: 18, width: "100%", height: 52, borderRadius: 12, border: 0,
            background: canLogin ? "#3182F6" : "rgba(7,25,76,0.08)",
            color: canLogin ? "#fff" : "#B0B8C1",
            fontSize: 16, fontWeight: 800, cursor: canLogin ? "pointer" : "not-allowed",
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
    <div style={{ width: "100%", height: "100%" }}>
      <AppCmp />
      <button
        onClick={logout}
        style={{
          position: "fixed", right: 16, bottom: 16, zIndex: 9999,
          height: 36, padding: "0 12px", borderRadius: 999, border: 0,
          background: "rgba(25,31,40,0.85)", color: "#fff", fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        로그아웃
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SHUnifiedRoot />);
