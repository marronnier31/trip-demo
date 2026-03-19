import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import { getMyBookings } from '../../api/booking';
import { benefitSnapshot } from '../../mock/benefitsData';
import {
  BookingsList,
  CouponsSection,
  GradeSection,
  MyInfoSection,
  PointsSection,
  SettingsSection,
  WishlistSection,
} from '../../components/mypage/UserTabSections';
import { C } from '../../styles/tokens';

const USER_TABS = [
  { key: 'bookings', label: '예약 내역' },
  { key: 'wishlist', label: '찜 목록' },
  { key: 'grade', label: '등급 혜택' },
  { key: 'points', label: '포인트' },
  { key: 'coupons', label: '쿠폰' },
  { key: 'myinfo', label: '내 정보 관리' },
  { key: 'settings', label: '설정' },
];

const USER_SHORTCUT_LINKS = [
  { to: '/my/inquiries', label: '문의 내역', desc: '접수한 문의와 답변 확인' },
  { to: '/attendance', label: '출석 체크', desc: '출석 보상과 적립 내역 확인' },
  { to: '/benefits', label: '혜택 안내', desc: '등급별 혜택과 쿠폰 정책 보기' },
  { to: '/recent', label: '최근 본 숙소', desc: '최근 탐색한 숙소 다시 보기' },
];

const SELLER_TABS = [
  { key: 'dashboard', label: '판매자 대시보드', to: '/seller' },
  { key: 'lodgings', label: '내 숙소', to: '/seller/lodgings' },
  { key: 'reservations', label: '예약 현황', to: '/seller/reservations' },
  { key: 'inquiries', label: '문의 관리', to: '/seller/inquiries' },
];

const ADMIN_LINKS = [
  { key: 'dashboard', label: '관리자 대시보드', to: '/admin', desc: '운영 현황과 핵심 지표 확인' },
  { key: 'users', label: '사용자 관리', to: '/admin/users', desc: '회원 상태와 등급 관리' },
  { key: 'sellers', label: '호스트 승인', to: '/admin/sellers', desc: '승인, 반려, 복구 처리' },
  { key: 'inquiries', label: '문의 처리', to: '/admin/inquiries', desc: '문의 답변과 종료 관리' },
  { key: 'rewards', label: '쿠폰·마일리지', to: '/admin/rewards', desc: '혜택 정책 운영' },
  { key: 'events', label: '이벤트 관리', to: '/admin/events', desc: '이벤트 등록과 상태 변경' },
];

const roleLabelMap = {
  [ROLES.USER]: '일반 사용자',
  [ROLES.SELLER]: '판매자',
  [ROLES.ADMIN]: '관리자',
};

export default function MyPage() {
  const { user, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const displayGrade = user?.role === ROLES.SELLER || user?.role === ROLES.ADMIN ? 'BLACK' : benefitSnapshot.currentGrade;
  const overviewCards = user?.role === ROLES.USER
    ? [
        { label: '예약 내역', value: `${bookings.length}건`, tone: 'warm' },
        { label: '등급', value: displayGrade, tone: 'cool' },
        { label: '빠른 이동', value: '문의/혜택', tone: 'accent' },
      ]
    : user?.role === ROLES.SELLER
      ? [
          { label: '운영 메뉴', value: '4개', tone: 'warm' },
          { label: '계정 등급', value: displayGrade, tone: 'cool' },
          { label: '바로 가기', value: '판매 관리', tone: 'accent' },
        ]
      : [
          { label: '운영 메뉴', value: `${ADMIN_LINKS.length}개`, tone: 'warm' },
          { label: '계정 등급', value: displayGrade, tone: 'cool' },
          { label: '바로 가기', value: '관리 보드', tone: 'accent' },
        ];
  // TODO(back-end): 사용자 혜택 API가 준비되면 benefitSnapshot 기반 영역을 서버 데이터로 교체한다.

  useEffect(() => {
    if (user?.role === ROLES.USER) {
      getMyBookings(user.userId || 1).then((res) => setBookings(res.data)).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={s.wrap}>
      <style>{`
        @media (max-width: 980px) {
          .tz-mypage-layout {
            flex-direction: column;
          }
          .tz-mypage-sidebar {
            width: 100% !important;
            position: static !important;
          }
          .tz-mypage-overview {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={s.inner} className="tz-mypage-layout">
        <aside style={s.sidebar} className="tz-mypage-sidebar">
          <div style={s.profile}>
            <div style={s.avatar}>{user.name[0]}</div>
            <div>
              <p style={s.profileName}>{user.name}</p>
              <p style={s.profileEmail}>{user.email}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={s.roleBadge}>{roleLabelMap[user.role]}</span>
                <span style={s.gradeBadge}>{displayGrade} 등급</span>
              </div>
            </div>
          </div>

          <nav style={s.sideNav}>
            {user.role === ROLES.USER ? (
              <>
                <p style={s.sideSectionLabel}>마이페이지</p>
                {USER_TABS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    style={{ ...s.navItem, background: tab === item.key ? C.bgGray : 'transparent', fontWeight: tab === item.key ? '700' : '400' }}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            ) : null}

            {user.role === ROLES.USER ? (
              <>
                <p style={{ ...s.sideSectionLabel, marginTop: '12px' }}>빠른 이동</p>
                <Link to="/inquiry/create" style={{ ...s.navItem, textDecoration: 'none', color: C.text, display: 'block', marginTop: '4px' }}>
                  문의하기
                </Link>
                <Link to="/host/apply" style={{ ...s.navItem, textDecoration: 'none', color: C.text, display: 'block' }}>
                  호스트 신청
                </Link>
              </>
            ) : null}

            {user.role === ROLES.SELLER ? (
              <>
                <p style={s.sideSectionLabel}>판매자 메뉴</p>
                {SELLER_TABS.map((item) => (
                  <Link key={item.key} to={item.to} style={{ ...s.navItem, textDecoration: 'none', color: C.text, display: 'block' }}>
                    {item.label}
                  </Link>
                ))}
              </>
            ) : null}

            {user.role === ROLES.ADMIN ? (
              <>
                <p style={s.sideSectionLabel}>관리자 메뉴</p>
                {ADMIN_LINKS.map((item) => (
                  <Link key={item.key} to={item.to} style={{ ...s.navItem, textDecoration: 'none', color: C.text, display: 'block' }}>
                    {item.label}
                  </Link>
                ))}
              </>
            ) : null}
          </nav>

          <button onClick={handleLogout} style={s.logoutBtn}>로그아웃</button>
        </aside>

        <main style={s.content}>
          <section style={s.hero}>
            <div>
              <p style={s.heroEyebrow}>ACCOUNT HUB</p>
              <h1 style={s.heroTitle}>{user.name}님의 {user.role === ROLES.USER ? '마이페이지' : user.role === ROLES.SELLER ? '운영 페이지' : '관리 페이지'}</h1>
              <p style={s.heroDesc}>
                {user.role === ROLES.USER
                  ? '예약, 혜택, 문의 흐름을 한 번에 보고 자주 사용하는 메뉴로 빠르게 이동할 수 있습니다.'
                  : user.role === ROLES.SELLER
                    ? '판매 운영에 필요한 핵심 메뉴를 한곳에서 빠르게 확인할 수 있습니다.'
                    : '운영 현황과 관리 메뉴를 한곳에서 확인하고 바로 이동할 수 있습니다.'}
              </p>
            </div>
            <div style={s.overviewGrid} className="tz-mypage-overview">
              {overviewCards.map((item) => (
                <article
                  key={item.label}
                  style={{
                    ...s.overviewCard,
                    ...(item.tone === 'warm' ? s.overviewWarm : item.tone === 'cool' ? s.overviewCool : s.overviewAccent),
                  }}
                >
                  <span style={s.overviewLabel}>{item.label}</span>
                  <strong style={s.overviewValue}>{item.value}</strong>
                </article>
              ))}
            </div>
          </section>

          {user.role === ROLES.USER ? (
            <>
              <h2 style={s.contentTitle}>{USER_TABS.find((item) => item.key === tab)?.label}</h2>
              <div style={s.quickGrid}>
                {USER_SHORTCUT_LINKS.map((item) => (
                  <Link key={item.to} to={item.to} style={s.quickCard}>
                    <strong style={s.quickCardTitle}>{item.label}</strong>
                    <span style={s.quickCardDesc}>{item.desc}</span>
                  </Link>
                ))}
              </div>
              {tab === 'bookings' ? <BookingsList bookings={bookings} /> : null}
              {tab === 'wishlist' ? <WishlistSection /> : null}
              {tab === 'grade' ? <GradeSection /> : null}
              {tab === 'points' ? <PointsSection /> : null}
              {tab === 'coupons' ? <CouponsSection /> : null}
              {tab === 'myinfo' ? <MyInfoSection user={user} logout={handleLogout} updateCurrentUser={updateCurrentUser} /> : null}
              {tab === 'settings' ? <SettingsSection /> : null}
            </>
          ) : null}

          {user.role === ROLES.SELLER ? (
            <>
              <h2 style={s.contentTitle}>판매자 관리</h2>
              <p style={s.helperText}>숙소 운영에 자주 쓰는 화면으로 빠르게 이동할 수 있습니다.</p>
              <div style={s.quickGrid}>
                {SELLER_TABS.map((item) => (
                  <Link key={item.key} to={item.to} style={s.quickCard}>
                    <strong style={s.quickCardTitle}>{item.label}</strong>
                    <span style={s.quickCardDesc}>바로 이동</span>
                  </Link>
                ))}
              </div>
            </>
          ) : null}

          {user.role === ROLES.ADMIN ? (
            <>
              <h2 style={s.contentTitle}>관리자 페이지</h2>
              <p style={s.helperText}>운영 현황, 회원 관리, 문의 처리 메뉴로 바로 이동할 수 있습니다.</p>
              <div style={s.quickGrid}>
                {ADMIN_LINKS.map((item) => (
                  <Link key={item.key} to={item.to} style={s.quickCard}>
                    <strong style={s.quickCardTitle}>{item.label}</strong>
                    <span style={s.quickCardDesc}>{item.desc}</span>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

const s = {
  wrap: { background: C.bgWarm, minHeight: 'calc(100vh - 160px)', padding: '56px 24px' },
  inner: { maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '28px', alignItems: 'flex-start' },
  sidebar: {
    width: '240px',
    flexShrink: 0,
    background: C.bg,
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: `1px solid ${C.borderLight}`,
    position: 'sticky',
    top: '100px',
  },
  profile: { display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px', paddingBottom: '24px', borderBottom: `1px solid ${C.borderLight}` },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: C.primary,
    color: '#fff',
    fontSize: '24px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(232,72,74,0.3)',
  },
  profileName: { fontSize: '18px', fontWeight: '800', color: C.text, margin: '0 0 4px' },
  profileEmail: { fontSize: '12px', color: C.textSub, margin: '0 0 8px' },
  roleBadge: { fontSize: '11px', fontWeight: '700', background: '#FFF1F1', color: C.primary, padding: '4px 10px', borderRadius: '999px', display: 'inline-block' },
  gradeBadge: { fontSize: '11px', fontWeight: '700', background: '#EEF2FF', color: '#4F46E5', padding: '4px 10px', borderRadius: '999px', display: 'inline-block' },
  sideNav: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' },
  sideSectionLabel: {
    margin: '0 0 6px',
    padding: '0 14px',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#9A8F8F',
    textTransform: 'uppercase',
  },
  navItem: {
    width: '100%',
    textAlign: 'left',
    padding: '12px 14px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    color: C.text,
    cursor: 'pointer',
    transition: 'background 0.2s',
    outline: 'none',
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    background: '#fff',
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: C.textSub,
    cursor: 'pointer',
  },
  hero: {
    marginBottom: '28px',
    padding: '28px 30px',
    borderRadius: '28px',
    background: 'linear-gradient(145deg, #FFF7F2 0%, #FFFFFF 52%, #F5F8FF 100%)',
    border: `1px solid ${C.borderLight}`,
    boxShadow: '0 18px 40px rgba(17,17,17,0.05)',
  },
  heroEyebrow: {
    margin: '0 0 10px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: C.primary,
  },
  heroTitle: {
    margin: '0 0 10px',
    fontSize: 'clamp(28px, 4vw, 40px)',
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
    color: C.text,
  },
  heroDesc: {
    margin: 0,
    maxWidth: '760px',
    fontSize: '15px',
    lineHeight: 1.75,
    color: C.textSub,
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '20px',
  },
  overviewCard: {
    padding: '16px 18px',
    borderRadius: '18px',
    border: '1px solid #EDE6E0',
    background: '#FFFFFFD8',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  overviewWarm: { background: '#FFF6EA', borderColor: '#F2D7A3' },
  overviewCool: { background: '#EEF6FF', borderColor: '#CCE0FF' },
  overviewAccent: { background: '#FFF1F1', borderColor: '#F3C9CA' },
  overviewLabel: { fontSize: '12px', fontWeight: 800, color: '#7B7070' },
  overviewValue: { fontSize: '24px', lineHeight: 1.1, color: C.text },
  content: {
    flex: 1,
    background: C.bg,
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: `1px solid ${C.borderLight}`,
    minHeight: '400px',
  },
  contentTitle: { fontSize: '24px', fontWeight: '800', color: '#1A1A1A', margin: '0 0 32px' },
  helperText: { color: C.textSub, fontSize: '14px' },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '28px',
  },
  quickCard: {
    textDecoration: 'none',
    border: `1px solid ${C.borderLight}`,
    borderRadius: '16px',
    padding: '18px 16px',
    background: '#FAFBFC',
    display: 'grid',
    gap: '8px',
  },
  quickCardTitle: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#222',
  },
  quickCardDesc: {
    fontSize: '13px',
    lineHeight: 1.6,
    color: C.textSub,
  },
};
