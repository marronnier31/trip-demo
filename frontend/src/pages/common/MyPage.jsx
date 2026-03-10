import { useState, useEffect } from 'react';
import { useAuth } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { ROLES } from '../../constants/roles';
import Badge from '../../components/common/Badge';
import { getMyBookings } from '../../api/booking';
import { getMyInquiries } from '../../api/inquiry';
import { updateUser } from '../../api/auth';
import { C, MAX_WIDTH, R, S } from '../../styles/tokens';
import { INQUIRY_TYPE_LABELS } from '../../constants/inquiryTypes';

const USER_TABS = [
  { key: 'bookings', label: '예약 내역' },
  { key: 'wishlist', label: '찜 목록' },
  { key: 'points', label: '포인트' },
  { key: 'coupons', label: '쿠폰' },
  { key: 'myinfo', label: '내 정보 관리' },
  { key: 'settings', label: '설정' },
];
const SELLER_TABS = [
  { key: 'lodgings', label: '내 숙소', to: '/seller/lodgings' },
  { key: 'reservations', label: '예약 현황', to: '/seller/reservations' },
  { key: 'inquiries', label: '문의 관리', to: '/seller/inquiries' },
];

function BookingsList({ bookings }) {
  if (!bookings.length) return <p style={{ color: C.textSub, padding: '20px 0' }}>예약 내역이 없습니다.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {bookings.map(b => (
        <div key={b.bookingId} style={sCard.card}>
          <img src={b.thumbnailUrl} alt={b.lodgingName} style={sCard.img} />
          <div style={sCard.body}>
            <div style={sCard.header}>
              <h3 style={sCard.name}>{b.lodgingName}</h3>
              <Badge status={b.bookingStatus} />
            </div>
            <p style={sCard.meta}>{b.checkIn} ~ {b.checkOut} · {b.guests}명</p>
            <p style={sCard.price}>{b.totalPrice.toLocaleString()}원</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MyInfoSection({ user, logout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: '01012345678',
    birthdate: '',
    gender: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      await updateUser(user.id || 1, { name: formData.name });
      alert('정보가 성공적으로 저장되었습니다.');
      setIsEditing(false);
      // user 객체는 전역 store 또는 context 업데이트 필요하지만 
      // 이 데모에선 UI상 저장 완료 피드백만 제공.
    } catch (err) {
      alert('정보 저장에 실패했습니다.');
    }
  };

  return (
    <div style={sInfo.wrap}>
      <div style={sInfo.header}>
        <div style={sInfo.avatarWrap}>
          <div style={{ ...s.avatar, width: '64px', height: '64px', fontSize: '28px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={sInfo.headerText}>
            <p style={sInfo.desc}>회원 정보</p>
            <p style={sInfo.subDesc}>내 정보를 원하시는 대로 관리하세요.</p>
          </div>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={sInfo.textBtnGray} onClick={() => setIsEditing(false)}>취소</button>
              <button style={{ ...sInfo.textBtn, background: C.primary, color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }} onClick={handleSave}>저장</button>
            </div>
          ) : (
            <button style={sInfo.textBtn} onClick={() => setIsEditing(true)}>수정하기</button>
          )}
        </div>
      </div>

      <div style={sInfo.secureAlert}>
        <div style={sInfo.secureAlertText}>🔒 가려진 내 정보를 확인할 수 있어요!</div>
        <div style={sInfo.secureToggle}>
          <div style={sInfo.secureToggleKnob} />
        </div>
      </div>

      <div style={sInfo.grid}>
        <div style={sInfo.field}>
          <label style={sInfo.label}>닉네임</label>
          {isEditing ? (
            <input name="name" style={sInfo.inputEdit} value={formData.name} onChange={handleChange} />
          ) : (
            <div style={sInfo.inputVal}>{formData.name}</div>
          )}
        </div>
        <div style={sInfo.field}>
          <label style={sInfo.label}>휴대폰 번호</label>
          {isEditing ? (
            <input name="phone" style={sInfo.inputEdit} value={formData.phone} onChange={handleChange} />
          ) : (
            <div style={formData.phone ? sInfo.inputVal : sInfo.inputMuted}>
              {formData.phone ? formData.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3') : '미입력(앱에서 입력해 주세요.)'}
            </div>
          )}
        </div>
        <div style={sInfo.field}>
          <label style={sInfo.label}>생년월일</label>
          {isEditing ? (
            <input name="birthdate" type="date" style={sInfo.inputEdit} value={formData.birthdate} onChange={handleChange} />
          ) : (
            <div style={formData.birthdate ? sInfo.inputVal : sInfo.inputMuted}>
              {formData.birthdate || '미입력(앱에서 입력해 주세요.)'}
            </div>
          )}
        </div>
        <div style={sInfo.field}>
          <label style={sInfo.label}>성별</label>
          {isEditing ? (
            <select name="gender" style={sInfo.inputEdit} value={formData.gender} onChange={handleChange}>
              <option value="">선택</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          ) : (
            <div style={formData.gender ? sInfo.inputVal : sInfo.inputMuted}>
              {formData.gender === 'M' ? '남성' : formData.gender === 'F' ? '여성' : '미입력(앱에서 입력해 주세요.)'}
            </div>
          )}
        </div>
      </div>

      <div style={sInfo.deviceWrap}>
        <div style={sInfo.deviceHeader}>
          <h3 style={sInfo.deviceTitle}>접속 기기 관리</h3>
          <button style={sInfo.textBtn} onClick={logout}>전체 로그아웃</button>
        </div>
        <p style={sInfo.deviceDesc}>로그인 된 모든 기기에서 로그아웃 돼요.</p>
      </div>

      <div style={sInfo.footer}>
        <span style={{ color: '#999' }}>더 이상 TripZone 이용을 원하지 않으신가요? </span>
        <button style={sInfo.textBtnGray}>회원탈퇴</button>
      </div>
    </div>
  );
}

function SettingsSection({ user }) {
  const [consents, setConsents] = useState({
    marketing: true,
    email: false,
    sms: true,
  });

  const toggleConsent = (key) => setConsents(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    alert('설정이 성공적으로 저장되었습니다.');
  };

  const ToggleRender = ({ checked, onClick }) => (
    <div style={{ ...sInfo.secureToggle, background: checked ? C.primary : '#DCDCDC' }} onClick={onClick}>
      <div style={{ ...sInfo.secureToggleKnob, transform: checked ? 'translateX(24px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
    </div>
  );

  return (
    <div style={sInfo.wrap}>
      <div style={{ ...sInfo.header, paddingBottom: '24px', borderBottom: '1px solid #F0EFEF' }}>
        <div style={{ flex: 1 }}>
          <p style={sInfo.desc}>마케팅 정보 수신</p>
          <p style={sInfo.subDesc}>다양한 혜택과 이벤트 소식을 받아보세요.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: '700', color: C.text }}>마케팅 정보 수신 동의</span>
          <ToggleRender checked={consents.marketing} onClick={() => toggleConsent('marketing')} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '16px' }}>
          <span style={{ fontSize: '15px', color: '#444' }}>이메일 수신</span>
          <ToggleRender checked={consents.email} onClick={() => toggleConsent('email')} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '16px' }}>
          <span style={{ fontSize: '15px', color: '#444' }}>SMS 수신</span>
          <ToggleRender checked={consents.sms} onClick={() => toggleConsent('sms')} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
        <button style={{ ...sInfo.textBtn, background: C.primary, color: '#fff', padding: '12px 32px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px' }} onClick={handleSave}>
          변경 사항 저장
        </button>
      </div>
    </div>
  );
}

function EmptyView({ title }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: C.textSub }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
      <p style={{ margin: 0, fontSize: '16px' }}>아직 {title}가 없어요.</p>
    </div>
  );
}

export default function MyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    if (user?.role === ROLES.USER) {
      getMyBookings(user.userId || 1).then(res => setBookings(res.data)).catch(() => { });
      getMyInquiries(user.userId || 1).then(res => setInquiries(res.data)).catch(() => { });
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const roleLabelMap = { [ROLES.USER]: '일반 사용자', [ROLES.SELLER]: '판매자', [ROLES.ADMIN]: '관리자' };

  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        {/* ── 좌측 사이드바 ── */}
        <aside style={s.sidebar}>
          <div style={s.profile}>
            <div style={s.avatar}>{user.name[0]}</div>
            <div>
              <p style={s.profileName}>{user.name}</p>
              <p style={s.profileEmail}>{user.email}</p>
              <span style={s.roleBadge}>{roleLabelMap[user.role]}</span>
            </div>
          </div>

          <nav style={s.sideNav}>
            {user.role === ROLES.USER && USER_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{ ...s.navItem, background: tab === t.key ? C.bgGray : 'transparent', fontWeight: tab === t.key ? '700' : '400' }}
              >
                {t.label}
              </button>
            ))}

            {user.role === ROLES.USER && (
              <Link to="/inquiry/create" style={{ ...s.navItem, textDecoration: 'none', color: C.text, display: 'block', marginTop: '4px' }}>
                + 문의하기
              </Link>
            )}

            {user.role === ROLES.SELLER && SELLER_TABS.map(t => (
              <Link key={t.key} to={t.to} style={{ ...s.navItem, textDecoration: 'none', color: C.text, display: 'block' }}>
                {t.label}
              </Link>
            ))}

            {user.role === ROLES.ADMIN && (
              <Link to="/admin" style={{ ...s.navItem, textDecoration: 'none', color: C.text, display: 'block' }}>
                관리자 대시보드
              </Link>
            )}
          </nav>

          <button onClick={handleLogout} style={s.logoutBtn}>로그아웃</button>
        </aside>

        {/* ── 우측 콘텐츠 ── */}
        <main style={s.content}>
          {user.role === ROLES.USER && (
            <>
              <h2 style={s.contentTitle}>
                {USER_TABS.find(t => t.key === tab)?.label}
              </h2>
              {tab === 'bookings' && <BookingsList bookings={bookings} />}
              {tab === 'myinfo' && <MyInfoSection user={user} logout={handleLogout} />}
              {tab === 'settings' && <SettingsSection user={user} />}
              {['wishlist', 'points', 'coupons'].includes(tab) && (
                <EmptyView title={USER_TABS.find(t => t.key === tab)?.label} />
              )}
            </>
          )}
          {user.role === ROLES.SELLER && (
            <>
              <h2 style={s.contentTitle}>판매자 관리</h2>
              <p style={{ color: C.textSub, fontSize: '14px' }}>좌측 메뉴에서 항목을 선택하세요.</p>
            </>
          )}
          {user.role === ROLES.ADMIN && (
            <>
              <h2 style={s.contentTitle}>관리자 페이지</h2>
              <p style={{ color: C.textSub, fontSize: '14px' }}>좌측 메뉴에서 항목을 선택하세요.</p>
            </>
          )}
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
  sideNav: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' },
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
    transition: 'background 0.2s, color 0.2s',
  },
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
};

const sCard = {
  card: {
    display: 'flex',
    gap: '24px',
    border: `1px solid #F0EFEF`,
    borderRadius: '20px',
    overflow: 'hidden',
    padding: '24px',
    background: '#fff',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'pointer',
  },
  img: { width: '140px', height: '110px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0 },
  body: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  name: { fontSize: '18px', fontWeight: '800', color: C.text, margin: 0 },
  meta: { fontSize: '14px', color: '#6A6A6A', margin: '0 0 12px' },
  price: { fontSize: '18px', fontWeight: '800', color: C.text, margin: 0 },
  inquiryCard: { border: `1px solid #F0EFEF`, borderRadius: '16px', padding: '20px 24px', background: '#fff' },
  inquiryTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  inquiryTitle: { fontSize: '16px', fontWeight: '700', color: C.text },
  inquiryMeta: { fontSize: '14px', color: '#888', margin: 0 },
};

const sInfo = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '32px' },
  header: { display: 'flex', gap: '24px', alignItems: 'center' },
  avatarWrap: {
    width: '100px', height: '100px', borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(232,72,74,0.05) 0%, rgba(232,72,74,0.15) 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  desc: { fontSize: '20px', fontWeight: '800', color: C.text, margin: '0 0 8px' },
  subDesc: { fontSize: '14px', color: C.textSub, margin: 0 },

  secureAlert: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#F8F9FA', borderRadius: '16px', padding: '16px 24px',
    border: '1px solid #F0EFEF'
  },
  secureAlertText: { fontSize: '15px', fontWeight: '600', color: '#4A4A4A' },
  secureToggle: {
    width: '48px', height: '24px', borderRadius: '12px', background: '#DCDCDC',
    position: 'relative', cursor: 'pointer'
  },
  secureToggleKnob: {
    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
    position: 'absolute', top: '2px', left: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  grid: {
    display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px',
    paddingBottom: '32px', borderBottom: '1px solid #F0EFEF'
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#777' },
  inputVal: { fontSize: '15px', color: '#222', padding: '16px', background: '#F8F9FA', borderRadius: '12px' },
  inputMuted: { fontSize: '15px', color: '#AAA', padding: '16px', background: '#F8F9FA', borderRadius: '12px' },
  inputEdit: { fontSize: '15px', color: '#1A1A1A', padding: '15px', background: '#FFFFFF', borderRadius: '12px', border: `1px solid ${C.primary}`, outline: 'none', width: '100%', boxSizing: 'border-box' },

  deviceWrap: { paddingBottom: '32px', borderBottom: '1px solid #F0EFEF' },
  deviceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  deviceTitle: { fontSize: '18px', fontWeight: '700', color: C.text, margin: 0 },
  textBtn: { border: 'none', background: 'none', color: C.primary, fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  deviceDesc: { fontSize: '14px', color: C.textSub, margin: 0 },

  footer: { display: 'flex', gap: '8px', fontSize: '13px', marginTop: '16px' },
  textBtnGray: { border: 'none', background: 'none', color: '#777', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer', padding: 0 },
};
