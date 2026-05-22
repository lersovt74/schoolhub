// Primitives.jsx — TDS core building blocks for the mobile UI kit.

const tdsBtnStyles = {
  base: {
    fontFamily: 'var(--tds-font-sans)',
    fontWeight: 700,
    border: 0,
    borderRadius: 14,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 200ms cubic-bezier(.2,.8,.2,1)',
    WebkitTapHighlightColor: 'transparent',
  },
  size: {
    xl: { height: 56, padding: '0 20px', fontSize: 18, lineHeight: '1.25' },
    l:  { height: 48, padding: '0 16px', fontSize: 17, lineHeight: '1.25' },
    m:  { height: 38, padding: '0 14px', fontSize: 15, lineHeight: '1.25', borderRadius: 10 },
    s:  { height: 32, padding: '0 12px', fontSize: 13, lineHeight: '1.25', borderRadius: 8 },
  },
  color: {
    brand:        { background: '#3182F6',                color: '#fff' },
    brandWeak:    { background: 'rgba(49,130,246,0.16)',  color: '#1B64DA' },
    neutral:      { background: 'rgba(7,25,76,0.05)',     color: 'rgba(3,18,40,0.7)' },
    danger:       { background: '#F04452',                color: '#fff' },
    inverse:      { background: '#191F28',                color: '#fff' },
    ghost:        { background: 'transparent',            color: '#3182F6' },
  },
  disabled: { background: 'rgba(7,25,76,0.05)', color: '#B0B8C1', cursor: 'not-allowed' },
};

const Button = ({
  children, size = 'l', color = 'brand',
  fullWidth, disabled, loading, onClick, style, ...rest
}) => {
  const [pressed, setPressed] = React.useState(false);
  const merged = {
    ...tdsBtnStyles.base,
    ...tdsBtnStyles.size[size],
    ...tdsBtnStyles.color[color],
    ...(disabled ? tdsBtnStyles.disabled : null),
    ...(fullWidth ? { width: '100%' } : null),
    ...style,
  };
  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={merged}
      {...rest}
    >
      <span style={{ opacity: loading ? 0 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {children}
      </span>
      {loading && (
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Dot c={merged.color} /><Dot c={merged.color} d={0.15} /><Dot c={merged.color} d={0.3} />
        </span>
      )}
      {pressed && !disabled && !loading && (
        <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.26)' }} />
      )}
    </button>
  );
};

const Dot = ({ c = '#fff', d = 0 }) => (
  <span style={{
    width: 6, height: 6, borderRadius: 999, background: c, display: 'block',
    animation: `tdsPulse 1.2s ${d}s infinite`,
  }} />
);

// One-shot keyframes injection
if (typeof document !== 'undefined' && !document.getElementById('tds-anim')) {
  const s = document.createElement('style');
  s.id = 'tds-anim';
  s.textContent = `
    @keyframes tdsPulse { 0%,80%,100%{transform:scale(.4);opacity:.4} 40%{transform:scale(1);opacity:1} }
    @keyframes tdsSheetIn { from{transform:translateY(100%)} to{transform:translateY(0)} }
    @keyframes tdsFadeIn { from{opacity:0} to{opacity:1} }
    .tds-press:active { background-color: rgba(0,0,0,0.04) !important; }
  `;
  document.head.appendChild(s);
}

// ---------- ListRow ----------
const ListRow = ({ thumb, title, sub, right, onClick, divider = true }) => (
  <div
    className="tds-press"
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 20px',
      borderBottom: divider ? '1px solid #F2F4F6' : 'none',
      cursor: onClick ? 'pointer' : 'default',
      background: '#fff',
    }}
  >
    {thumb}
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: '#191F28', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title}
      </div>
      {sub && <div style={{ fontSize: 13, color: '#6B7683', lineHeight: 1.4 }}>{sub}</div>}
    </div>
    {right && <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#B0B8C1' }}>{right}</div>}
  </div>
);

// ---------- Avatar / thumb tiles ----------
const Thumb = ({ children, color = '#3182F6', bg, size = 40, radius = 12 }) => (
  <div style={{
    width: size, height: size, flex: `0 0 ${size}px`,
    background: bg ?? color,
    borderRadius: radius,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: size < 40 ? 13 : 15,
  }}>
    {children}
  </div>
);

// ---------- Chip ----------
const Chip = ({ children, active, color = 'neutral', onClick }) => {
  const palette = {
    neutral: active ? { background: '#191F28', color: '#fff' } : { background: 'rgba(7,25,76,0.05)', color: '#4E5968' },
    brand:   { background: 'rgba(49,130,246,0.16)', color: '#1B64DA' },
    outline: { background: '#fff', color: '#4E5968', boxShadow: 'inset 0 0 0 1px #E5E8EB' },
  }[color];
  return (
    <button onClick={onClick} style={{
      height: 32, padding: '0 12px', borderRadius: 999, border: 0,
      fontFamily: 'var(--tds-font-sans)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 4,
      ...palette,
    }}>{children}</button>
  );
};

// ---------- BottomSheet ----------
const BottomSheet = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.45)',
      animation: 'tdsFadeIn 200ms',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '24px 20px 32px',
        animation: 'tdsSheetIn 320ms cubic-bezier(.16,1,.3,1)',
        boxShadow: '0 -8px 32px rgba(0,19,43,0.12)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 16px' }} />
        {title && <div style={{ fontSize: 22, fontWeight: 700, color: '#191F28', letterSpacing: '-0.012em', marginBottom: 12 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
};

// ---------- Toast ----------
const Toast = ({ show, children, tone = 'dark' }) => {
  if (!show) return null;
  const palette = tone === 'danger' ? { background: '#F04452' } : { background: '#191F28' };
  return (
    <div style={{
      position: 'absolute', left: 20, right: 20, bottom: 110, zIndex: 80,
      color: '#fff', borderRadius: 14, padding: '14px 18px',
      fontSize: 15, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
      boxShadow: '0 4px 16px rgba(0,19,43,0.24)',
      animation: 'tdsSheetIn 320ms cubic-bezier(.16,1,.3,1)',
      ...palette,
    }}>{children}</div>
  );
};

// ---------- TopNav ----------
const TopNav = ({ title, onBack, onClose, right }) => (
  <div style={{
    height: 56, display: 'flex', alignItems: 'center',
    padding: '0 6px', background: '#fff', position: 'relative',
    marginTop: 47,
  }}>
    {onBack && (
      <button className="tds-press" onClick={onBack} style={{
        width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#191F28',
        borderRadius: 22,
      }}><IconArrowBack /></button>
    )}
    {onClose && !onBack && (
      <button className="tds-press" onClick={onClose} style={{
        width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#191F28',
        borderRadius: 22, marginLeft: 'auto', order: 2,
      }}><IconClose /></button>
    )}
    {title && (
      <div style={{
        flex: 1, fontSize: 17, fontWeight: 700, color: '#191F28', textAlign: 'center',
        letterSpacing: '-0.012em', padding: onBack ? '0 44px 0 0' : '0 12px',
      }}>{title}</div>
    )}
    {right && <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, paddingRight: 6 }}>{right}</div>}
  </div>
);

// ---------- TabBar ----------
const TabBar = ({ tabs, active, onChange }) => (
  <div style={{
    flex: '0 0 auto',
    height: 84, paddingBottom: 24,
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid #F2F4F6',
    display: 'flex',
  }}>
    {tabs.map((t) => {
      const on = t.id === active;
      return (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, border: 0, background: 'transparent', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: on ? '#191F28' : '#B0B8C1',
          paddingTop: 6,
        }}>
          {t.icon}
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '-0.01em' }}>{t.label}</span>
        </button>
      );
    })}
  </div>
);

Object.assign(window, {
  Button, ListRow, Thumb, Chip, BottomSheet, Toast, TopNav, TabBar,
});
