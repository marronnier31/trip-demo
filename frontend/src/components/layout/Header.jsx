import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import { benefitSnapshot, couponItems } from '../../mock/benefitsData';
import { C, MAX_WIDTH } from '../../styles/tokens';
import { buildCouponDestination, buildPointsDestination } from '../../utils/benefitNavigation';
import LogoMark from './LogoMark';

const BASE_LINKS = [
  { to: '/lodgings', label: '숙소 검색' },
  { to: '/lodgings?region=제주', label: '인기 지역' },
  { to: '/support', label: '문의센터' },
];

const DROPDOWN_SHORTCUTS = [
  { label: '예약 내역', to: '/my/bookings' },
  { label: '최근 본 상품', to: '/recent' },
  { label: '찜 목록', to: '/wishlist' },
];

const DROPDOWN_TRAVEL_LINKS = [
  { label: '국내숙소', to: '/lodgings' },
  { label: '해외숙소', to: '/overseas' },
  { label: '패키지 여행', to: '/packages', new: true },
  { label: '항공', to: '/flights' },
  { label: '항공+숙소', to: '/flight-stays' },
  { label: '레저·티켓', to: '/leisure' },
  { label: '렌터카', to: '/cars' },
  { label: '공간대여', to: '/spaces' },
];

const DROPDOWN_SERVICE_LINKS = [
  { label: '이벤트', to: '/events' },
  { label: '고객센터', to: '/support' },
  { label: '설정', to: '/settings' },
];

const ROLE_LINKS = {
  [ROLES.USER]: [
    { to: '/my/bookings', label: '내 예약' },
    { to: '/host/apply', label: '호스트 신청' },
    { to: '/mypage', label: '마이페이지' },
  ],
  [ROLES.SELLER]: [
    { to: '/seller/lodgings', label: '내 숙소' },
    { to: '/mypage', label: '마이페이지' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: '관리자' },
  ],
};

function isLinkActive(location, to) {
  if (to === '/lodgings') {
    return (
      (location.pathname === '/lodgings' && !new URLSearchParams(location.search).has('region')) ||
      location.pathname.startsWith('/lodgings/')
    );
  }
  if (to.startsWith('/lodgings?region=')) {
    return location.pathname === '/lodgings' && new URLSearchParams(location.search).has('region');
  }
  if (to === '/support') {
    return location.pathname === '/support' || location.pathname.startsWith('/inquiry');
  }
  if (to === '/mypage') {
    return location.pathname === '/mypage';
  }
  return location.pathname === to || location.pathname.startsWith(`${to}/`);
}

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileWrapRef = useRef(null);
  const isPrivilegedUser = user?.role === ROLES.SELLER || user?.role === ROLES.ADMIN;
  const displayGrade = isPrivilegedUser ? 'BLACK' : benefitSnapshot.currentGrade;
  // TODO(back-end):
  // GET /api/v1/me/summary
  // response example:
  // { name, role, currentGrade, nextGrade, nextGradeRemainBookings, mileageBalance, couponCount }
  // 현재 benefitSnapshot 기반 헤더 혜택/등급/관리자 노출 문맥은 이 응답으로 그대로 교체 가능하다.

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileNavOpen(false);
    navigate('/');
  };

  useEffect(() => {
    setMenuOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (profileWrapRef.current && !profileWrapRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const renderDropdownEntry = (item) => {
    const isReady = item.to && item.to !== '#';

    if (!isReady) {
      return (
        <span style={{ ...s.dropdownMenuItem, ...s.dropdownMenuItemDisabled }}>
          <span>{item.label}</span>
          <span style={s.badgeSoon}>준비중</span>
        </span>
      );
    }

    return (
      <Link to={item.to} style={s.dropdownMenuItem} onClick={() => setMenuOpen(false)}>
        <span>{item.label}</span>
        {item.new && <span style={s.badgeNew}>new</span>}
      </Link>
    );
  };

  return (
    <header style={s.header}>
      <style>{`
        .tz-header-nav::-webkit-scrollbar { display: none; }
        .tz-header-nav-item,
        .tz-header-nav-item:link,
        .tz-header-nav-item:visited,
        .tz-header-nav-item:active {
          outline: none !important;
          -webkit-tap-highlight-color: transparent;
        }
        .tz-header-nav-item:hover {
          color: #353535 !important;
          background: #fff !important;
          border-color: #C8CED8 !important;
        }
        .tz-header-nav-item:focus,
        .tz-header-nav-item:focus-visible {
          outline: none !important;
          border-color: #E7C2C2 !important;
          box-shadow: 0 0 0 2px rgba(232,72,74,0.12);
        }
        .tz-header-nav-item.is-active {
          color: #fff !important;
          background: linear-gradient(135deg, #F05A5C 0%, #E8484A 100%) !important;
          border-color: #E8484A !important;
          box-shadow: none;
        }
        @media (max-width: 1280px) {
          .tz-header-inner { grid-template-columns: auto 1fr auto !important; }
          .tz-header-nav a { padding: 7px 11px !important; font-size: 13px !important; }
          .tz-header-actions a { padding: 8px 12px !important; font-size: 13px !important; }
        }
        @media (max-width: 980px) {
          .tz-header-nav { overflow-x: auto !important; }
          .tz-header-actions { min-width: auto !important; }
          .tz-header-inner { height: 68px !important; }
        }
        @media (max-width: 840px) {
          .tz-header-inner {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            height: 68px !important;
          }
          .tz-header-nav,
          .tz-header-actions {
            display: none !important;
          }
          .tz-header-mobile-toggle {
            display: inline-flex !important;
          }
          .tz-header-mobile-panel {
            display: block !important;
          }
        }
      `}</style>
      <div style={s.inner} className="tz-header-inner">
        <Link to="/" style={s.logo} className="tz-header-logo">
          <LogoMark compact />
        </Link>

        <nav style={s.nav} className="tz-header-nav">
          {BASE_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`tz-header-nav-item ${isLinkActive(location, link.to) ? 'is-active' : ''}`}
              style={{ ...s.navLink, ...(isLinkActive(location, link.to) ? s.navLinkActive : null) }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={s.actions} className="tz-header-actions">
          {!user ? (
            <>
              <Link to="/host/apply" style={s.hostEntryBtn}>호스트 등록하기</Link>
              <Link to="/login" style={s.loginBtn}>로그인</Link>
              <Link to="/signup" style={s.signupBtn}>회원가입</Link>
            </>
          ) : (
            <>
              {user.role === ROLES.USER ? (
                <Link to="/host/apply" style={s.hostEntryBtn}>
                  호스트 등록하기
                </Link>
              ) : null}
              {user.role === ROLES.ADMIN ? (
                <Link to="/admin" style={s.adminEntryBtn}>
                  관리자 페이지
                </Link>
              ) : null}
              {user.role === ROLES.SELLER ? (
                <Link to="/seller" style={s.adminEntryBtn}>
                  판매자 페이지
                </Link>
              ) : null}
              <div style={s.profileWrap} ref={profileWrapRef}>
                <button type="button" style={s.profilePillBtn} onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen}>
                  <div style={s.profilePillIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </div>
                    <div style={s.profilePillText}>
                      <div style={s.profilePillName}>{user.name}</div>
                      <div style={s.profilePillGrade}>
                      <span style={{ color: '#8A7DF5', fontWeight: 800 }}>{displayGrade}</span> 회원
                      </div>
                    </div>
                  <div style={s.profilePillHamburger}>☰</div>
                </button>
                {menuOpen && (
                  <div style={s.dropdown}>
                    <div style={s.dropdownHeader}>
                      <Link to="/mypage" style={s.dropdownUserName} onClick={() => setMenuOpen(false)}>
                        <span>{user.name}</span>
                        <span style={s.dropdownUserArrow}>›</span>
                      </Link>

                      <div style={s.dropdownGradeCard}>
                        <div style={s.dropdownGradeTop}>
                          <span style={s.dropdownGradeText}>{displayGrade}</span>
                          <Link to="/benefits" style={s.dropdownBenefitsBtn} onClick={() => setMenuOpen(false)}>혜택 안내</Link>
                        </div>
                        <div style={s.dropdownGradeDesc}>
                          {isPrivilegedUser ? (
                            <>운영 계정은 BLACK 등급 기준 혜택 문맥으로 고정 표시됩니다.</>
                          ) : (
                            <>
                              <span style={s.dropdownGradeHighlight}>{benefitSnapshot.nextGradeRemainBookings}번 더 예약하면</span>
                              <br />{benefitSnapshot.nextGrade} 등급 혜택이 열려요
                            </>
                          )}
                        </div>
                      </div>

                      <div style={s.dropdownBenefitLinks}>
                        <div style={s.dropdownBenefitItem}>
                          <div style={s.benefitLabel}>포인트</div>
                          <div style={s.benefitValue}>{benefitSnapshot.mileageBalance.toLocaleString()}</div>
                          <Link to={buildPointsDestination()} style={s.benefitActionBtn} onClick={() => setMenuOpen(false)}>
                            사용하러 가기
                          </Link>
                        </div>
                        <div style={s.dropdownBenefitDivider} />
                        <div style={s.dropdownBenefitItem}>
                          <div style={s.benefitLabel}>쿠폰</div>
                          <div style={s.benefitValue}>{benefitSnapshot.couponCount}</div>
                          <Link to={buildCouponDestination(couponItems.find((coupon) => coupon.status === 'ISSUED'))} style={s.benefitActionBtn} onClick={() => setMenuOpen(false)}>
                            사용하러 가기
                          </Link>
                        </div>
                      </div>
                    </div>

                    <ul style={s.dropdownMenu}>
                      {DROPDOWN_SHORTCUTS.map(m => (
                        <li key={m.label}>
                          {renderDropdownEntry(m)}
                        </li>
                      ))}

                      <li><div style={s.dropdownMenuSection} /></li>
                      <li><div style={s.dropdownMenuHeader}>모든 여행</div></li>

                      {DROPDOWN_TRAVEL_LINKS.map(m => (
                        <li key={m.label}>
                          {renderDropdownEntry(m)}
                        </li>
                      ))}

                      <li><div style={s.dropdownMenuSection} /></li>

                      {user.role === ROLES.ADMIN ? (
                        <>
                          <li><div style={s.dropdownMenuHeader}>관리자</div></li>
                          {(ROLE_LINKS[ROLES.ADMIN] || []).map((m) => (
                            <li key={m.label}>
                              {renderDropdownEntry(m)}
                            </li>
                          ))}
                          <li><div style={s.dropdownMenuSection} /></li>
                        </>
                      ) : null}

                      {DROPDOWN_SERVICE_LINKS.map(m => (
                        <li key={m.label}>
                          {renderDropdownEntry(m)}
                        </li>
                      ))}
                      <li><div style={s.dropdownMenuSection} /></li>
                      <li>
                        <button style={{ ...s.dropdownMenuItem, width: '100%', background: 'none', border: 'none', textAlign: 'left', fontFamily: 'inherit' }} onClick={handleLogout}>
                          로그아웃
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          style={s.mobileToggle}
          className="tz-header-mobile-toggle"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label={mobileNavOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={mobileNavOpen}
          aria-controls="tz-mobile-navigation"
        >
          ☰
        </button>
      </div>

      {mobileNavOpen && (
        <>
          <button
            type="button"
            style={s.mobileBackdrop}
            aria-label="메뉴 닫기"
            onClick={() => setMobileNavOpen(false)}
          />
          <div style={s.mobilePanel} className="tz-header-mobile-panel" id="tz-mobile-navigation">
            <div style={s.mobileLinks}>
              {BASE_LINKS.map((link) => (
                <Link key={link.to} to={link.to} style={isLinkActive(location, link.to) ? s.mobilePrimaryLink : s.mobileLink} onClick={() => setMobileNavOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {(!user || user.role === ROLES.USER) ? (
                <Link to="/host/apply" style={s.mobileLink} onClick={() => setMobileNavOpen(false)}>호스트 등록하기</Link>
              ) : null}
              {user && (ROLE_LINKS[user.role] || []).map((link) => (
                <Link key={link.to} to={link.to} style={isLinkActive(location, link.to) ? s.mobilePrimaryLink : s.mobileLink} onClick={() => setMobileNavOpen(false)}>{link.label}</Link>
              ))}
            </div>
            <div style={s.mobileActions}>
              {!user ? (
                <>
                  <Link to="/login" style={s.mobileGhostBtn} onClick={() => setMobileNavOpen(false)}>로그인</Link>
                  <Link to="/signup" style={s.mobilePrimaryBtn} onClick={() => setMobileNavOpen(false)}>회원가입</Link>
                </>
              ) : (
                <button style={s.mobileGhostBtn} onClick={handleLogout}>로그아웃</button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}

const s = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid #F0E8E8`,
    fontFamily: 'Manrope, "Noto Sans KR", sans-serif',
  },
  inner: {
    maxWidth: 'min(1580px, calc(100vw - 40px))',
    margin: '0 auto',
    padding: '0 12px',
    height: '78px',
    display: 'grid',
    gridTemplateColumns: '220px 1fr 320px',
    alignItems: 'center',
    columnGap: '10px',
  },
  logo: { textDecoration: 'none', minWidth: '220px' },
  nav: { display: 'flex', gap: '6px', flexWrap: 'nowrap', justifyContent: 'center', flex: 1, minWidth: 0, overflowX: 'hidden', scrollbarWidth: 'none' },
  navLink: {
    fontSize: '14px',
    fontWeight: '700',
    color: C.textSub,
    textDecoration: 'none',
    padding: '9px 14px',
    borderRadius: '999px',
    border: '1px solid #D9DEE6',
    transition: 'color 0.15s, background 0.15s, border-color 0.15s',
    whiteSpace: 'nowrap',
  },
  navLinkActive: {
    color: '#fff',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    border: '1px solid #E8484A',
    boxShadow: 'none',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: '320px',
    justifyContent: 'flex-end',
    flexWrap: 'nowrap',
    flexShrink: 0,
  },
  actionBtnBase: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: '999px',
    fontSize: '13px',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  adminEntryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: '999px',
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: '#2F3640',
    fontSize: '13px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    boxSizing: 'border-box',
    textDecoration: 'none',
  },
  hostEntryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: '999px',
    border: '1px solid #F0D6D7',
    background: '#FFF7F7',
    color: '#C13A3D',
    fontSize: '13px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    boxSizing: 'border-box',
    textDecoration: 'none',
  },
  mobileToggle: {
    display: 'none',
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    border: '1px solid #E4E4E4',
    background: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#444',
    cursor: 'pointer',
  },
  loginBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '0 14px',
    fontSize: '13px',
    lineHeight: 1,
    fontWeight: '700',
    color: C.textSub,
    textDecoration: 'none',
    borderRadius: '999px',
    border: `1px solid ${C.border}`,
    background: '#fff',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
  },
  signupBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '0 14px',
    fontSize: '13px',
    lineHeight: 1,
    fontWeight: '700',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
  },
  profileWrap: { display: 'flex', alignItems: 'center', gap: '4px', position: 'relative', flexShrink: 0 },
  profilePillBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #EAEAEA',
    borderRadius: '999px',
    minHeight: '44px',
    padding: '5px 13px 5px 5px',
    background: '#fff',
    cursor: 'pointer',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap',
  },
  profilePillIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePillText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1px',
    minWidth: '82px',
  },
  profilePillName: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#333',
    lineHeight: 1.15,
  },
  profilePillGrade: {
    fontSize: '13px',
    color: '#666',
    lineHeight: 1.15,
  },
  profilePillHamburger: {
    fontSize: '16px',
    color: '#333',
    marginLeft: '2px',
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: '56px',
    right: 0,
    background: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '20px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,1)',
    width: '320px',
    zIndex: 200,
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 80px)',
  },
  dropdownHeader: {
    padding: '24px 20px 16px',
  },
  dropdownUserName: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  dropdownUserArrow: {
    color: '#E8484A',
    fontSize: '24px',
    lineHeight: 1,
    fontWeight: 300,
  },
  dropdownGradeCard: {
    position: 'relative',
    background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)',
    border: '1px solid #FFEBEB',
    borderRadius: '16px',
    padding: '16px 20px',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(232, 72, 74, 0.05)',
  },
  dropdownGradeTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  dropdownGradeText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#E8484A',
    letterSpacing: '-0.02em',
  },
  dropdownBenefitsBtn: {
    fontSize: '12px',
    color: '#777',
    fontWeight: '600',
    background: '#F0F0F0',
    padding: '4px 10px',
    borderRadius: '999px',
    cursor: 'pointer',
  },
  dropdownGradeDesc: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500',
    lineHeight: 1.4,
  },
  dropdownGradeHighlight: {
    color: '#D13D3F',
    fontWeight: '700',
  },
  dropdownBenefitLinks: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '12px',
    border: '1px solid #F0E8E8',
  },
  dropdownBenefitItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 0',
    gap: '8px',
  },
  benefitLabel: {
    fontSize: '12px',
    color: '#888',
    fontWeight: '600',
    marginBottom: '4px',
  },
  benefitValue: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '800',
  },
  benefitActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#FFF1F1',
    color: C.primary,
    textDecoration: 'none',
    fontSize: '11px',
    fontWeight: '800',
  },
  dropdownBenefitDivider: {
    width: '1px',
    background: '#F0E8E8',
    margin: '16px 0',
  },
  dropdownMenu: {
    listStyle: 'none',
    margin: 0,
    padding: '0 0 12px 0',
  },
  dropdownMenuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  dropdownMenuItemDisabled: {
    color: '#9CA3AF',
    cursor: 'default',
    background: '#FAFAFA',
  },
  dropdownMenuSection: {
    borderTop: '1px solid #F0F0F0',
    margin: '4px 0',
  },
  dropdownMenuHeader: {
    padding: '12px 20px 8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#999',
  },
  badgeNew: {
    background: '#FFE0E0',
    color: '#E8484A',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '8px',
  },
  badgeSoon: {
    background: '#ECECEC',
    color: '#8A8A8A',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '999px',
    marginLeft: '8px',
  },
  mobilePanel: {
    display: 'none',
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(520px, calc(100vw - 24px))',
    zIndex: 130,
    border: '1px solid rgba(233, 225, 225, 0.96)',
    borderRadius: '22px',
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 20px 44px rgba(26, 31, 44, 0.14)',
    padding: '14px 16px 16px',
  },
  mobileBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 120,
    border: 'none',
    background: 'rgba(17, 17, 17, 0.24)',
    backdropFilter: 'blur(4px)',
    cursor: 'pointer',
  },
  mobileLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mobileLink: {
    textDecoration: 'none',
    color: '#3E3E3E',
    fontWeight: 600,
    fontSize: '14px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: '#F8F8F8',
  },
  mobilePrimaryLink: {
    textDecoration: 'none',
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
  },
  mobileActions: { display: 'flex', gap: '8px', marginTop: '12px' },
  mobileGhostBtn: {
    flex: 1,
    textAlign: 'center',
    textDecoration: 'none',
    border: '1px solid #E3E3E3',
    background: '#fff',
    color: '#4B4B4B',
    borderRadius: '999px',
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  mobilePrimaryBtn: {
    flex: 1,
    textAlign: 'center',
    textDecoration: 'none',
    border: 'none',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    borderRadius: '999px',
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: 700,
  },
};
