// Icons.jsx — Hand-curated 24-grid mono/fill icons matching Toss icon style.
// All paths use currentColor + fill-rule:evenodd so size + colour are
// controlled by parent CSS. Match the @toss/icon naming convention.

const Icon = ({ children, size = 24, color = "currentColor", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: "block", flex: "0 0 auto", ...style }}
  >
    {children}
  </svg>
);

const IconArrowBack = (p) => (
  <Icon {...p}>
    <path fillRule="evenodd" d="M14.7 5.3a1 1 0 0 1 0 1.4L9.4 12l5.3 5.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z" />
  </Icon>
);

const IconClose = (p) => (
  <Icon {...p}>
    <path fillRule="evenodd" d="M6.3 6.3a1 1 0 0 1 1.4 0L12 10.6l4.3-4.3a1 1 0 1 1 1.4 1.4L13.4 12l4.3 4.3a1 1 0 1 1-1.4 1.4L12 13.4l-4.3 4.3a1 1 0 1 1-1.4-1.4L10.6 12 6.3 7.7a1 1 0 0 1 0-1.4z" />
  </Icon>
);

const IconChevRight = (p) => (
  <Icon {...p}>
    <path fillRule="evenodd" d="M9.3 6.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4l4.3-4.3-4.3-4.3a1 1 0 0 1 0-1.4z" />
  </Icon>
);

const IconChevDown = (p) => (
  <Icon {...p}>
    <path fillRule="evenodd" d="M6.3 9.3a1 1 0 0 1 1.4 0L12 13.6l4.3-4.3a1 1 0 1 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4z" />
  </Icon>
);

const IconSearch = (p) => (
  <Icon {...p}>
    <path fillRule="evenodd" d="M10 4a6 6 0 1 0 3.74 10.69l4.29 4.29a1 1 0 1 0 1.41-1.42l-4.29-4.29A6 6 0 0 0 10 4zm-4 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" />
  </Icon>
);

const IconSettings = (p) => (
  <Icon {...p}>
    <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.03 7.03 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65c-.6.25-1.17.58-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.14.24.43.34.68.22l2.49-1c.52.4 1.09.73 1.69.98l.38 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.38-2.65c.6-.25 1.17-.58 1.69-.98l2.49 1c.25.12.54.02.68-.22l2-3.46a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
  </Icon>
);

const IconHome = (p) => (
  <Icon {...p}>
    <path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </Icon>
);

const IconHomeMono = (p) => (
  <Icon {...p}>
    <path fillRule="evenodd" d="M12 3.3a1 1 0 0 0-.65.24l-8 6.8A1 1 0 0 0 3 11.1V20a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1v-8.9a1 1 0 0 0-.35-.76l-8-6.8A1 1 0 0 0 12 3.3zM5 19v-7.45l7-5.95 7 5.95V19h-3v-6H8v6H5z"/>
  </Icon>
);

const IconAlarm = (p) => (
  <Icon {...p}>
    <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1z" />
  </Icon>
);

const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
  </Icon>
);

const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M9.55 18 4.05 12.5l1.41-1.41 4.09 4.08 8.99-8.99 1.41 1.41z" />
  </Icon>
);

const IconStar = (p) => (
  <Icon {...p}>
    <path d="m12 2 2.6 6.6L22 9.3l-5.6 5L18 22l-6-3.5L6 22l1.6-7.7L2 9.3l7.4-.7z" />
  </Icon>
);

const IconUser = (p) => (
  <Icon {...p}>
    <path fillRule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 20a8 8 0 0 1 16 0v1H4v-1z" />
  </Icon>
);

const IconWallet = (p) => (
  <Icon {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2h-2V8H5v9h14v-1h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 11h6v4h-6a2 2 0 0 1 0-4zm2 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </Icon>
);

const IconSend = (p) => (
  <Icon {...p}>
    <path d="M3 11l18-8-8 18-2-8z" />
  </Icon>
);

const IconCamera = (p) => (
  <Icon {...p}>
    <path d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
  </Icon>
);

const IconShield = (p) => (
  <Icon {...p}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3zm-1 14-3.5-3.5 1.4-1.4L11 13.2l4.6-4.6 1.4 1.4L11 16z"/>
  </Icon>
);

const IconCard = (p) => (
  <Icon {...p}>
    <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6zm2 4v8h14v-8H5zm0-4v2h14V6H5z"/>
  </Icon>
);

const IconLightning = (p) => (
  <Icon {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
  </Icon>
);

const IconBuilding = (p) => (
  <Icon {...p}>
    <path d="M4 21V3h10v6h6v12h-7v-4h-2v4H4zm3-4h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2V7H7v2zm4 4h2v-2h-2v2zm0-4h2V7h-2v2zm5 8h2v-2h-2v2zm0-4h2v-2h-2v2z"/>
  </Icon>
);

const IconMore = (p) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
  </Icon>
);

// Toss "ㅌ" mark — placeholder mark we draw rather than use the binary asset
const TossMark = ({ size = 24, color = "#fff", style }) => (
  <svg width={size} height={size * 0.92} viewBox="0 0 100 92" style={{ display: "block", ...style }}>
    <path
      d="M10 12h80v14h-33v54h-14v-54h-33z m -4 60h88l-6 14h-76z"
      fill={color}
    />
  </svg>
);

Object.assign(window, {
  Icon, IconArrowBack, IconClose, IconChevRight, IconChevDown, IconSearch,
  IconSettings, IconHome, IconHomeMono, IconAlarm, IconPlus, IconCheck,
  IconStar, IconUser, IconWallet, IconSend, IconCamera, IconShield, IconCard,
  IconLightning, IconBuilding, IconMore, TossMark,
});
