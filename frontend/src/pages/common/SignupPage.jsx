import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROLES } from '../../constants/roles';

const SOCIALS = [
  { id: 'kakao', label: '카카오로 시작하기' },
  { id: 'naver', label: '네이버로 시작하기' },
  { id: 'google', label: '구글로 시작하기' },
  { id: 'apple', label: 'Apple로 시작하기' },
];

const SOCIAL_HOVER_STYLES = {
  kakao: {
    borderColor: '#E5CF35',
    background: 'linear-gradient(180deg, #FFFBE2 0%, #FFF8CC 100%)',
    boxShadow: '0 12px 20px rgba(229, 207, 53, 0.20)',
  },
  naver: {
    borderColor: '#01B050',
    background: 'linear-gradient(180deg, #F2FFF8 0%, #E9FFF2 100%)',
    boxShadow: '0 12px 20px rgba(3, 199, 90, 0.18)',
  },
  google: {
    borderColor: '#BBD1FF',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F6F9FF 100%)',
    boxShadow: '0 12px 20px rgba(66, 133, 244, 0.15)',
  },
  apple: {
    borderColor: '#B7B7B7',
    background: 'linear-gradient(180deg, #FAFAFA 0%, #F1F1F1 100%)',
    boxShadow: '0 12px 20px rgba(17, 17, 17, 0.14)',
  },
};

function SocialIcon({ id }) {
  if (id === 'kakao') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 4.5c-5 0-9 3.1-9 6.9c0 2.5 1.8 4.7 4.5 5.9l-.9 3.5l3.7-2.4c.6.1 1.1.1 1.7.1c5 0 9-3.1 9-7c0-3.8-4-7-9-7Z" fill="#191919" />
      </svg>
    );
  }
  if (id === 'naver') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="4.8" fill="#03C75A" />
        <path d="M8 6h2.3l3.7 5.4V6H16v12h-2.3L10 12.6V18H8V6Z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (id === 'apple') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M17.16 12.69c.01 2.45 2.14 3.26 2.16 3.27c-.02.06-.34 1.17-1.12 2.33c-.67 1-1.37 1.99-2.48 2.01c-1.08.02-1.43-.63-2.67-.63c-1.24 0-1.63.61-2.65.65c-1.06.04-1.86-1.06-2.54-2.06c-1.39-2.04-2.46-5.74-1.04-8.22c.7-1.23 1.96-2 3.31-2.02c1.04-.02 2.03.7 2.67.7c.64 0 1.85-.88 3.12-.75c.53.02 2.03.22 2.99 1.62c-.08.05-1.78 1.05-1.77 3.1Zm-1.99-5.26c.57-.7.95-1.66.84-2.63c-.83.03-1.83.54-2.42 1.22c-.53.61-.99 1.59-.87 2.53c.92.07 1.85-.46 2.45-1.12Z"
          fill="#111111"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21.6 12.23c0-.72-.06-1.2-.19-1.7H12v3.19h5.53c-.1.79-.66 1.99-1.9 2.79l-.02.11l2.76 2.1l.19.02c1.75-1.57 3.04-3.88 3.04-6.51Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.97-.88 6.63-2.38l-3.16-2.42c-.85.58-1.99.98-3.47.98a5.99 5.99 0 0 1-5.68-4.06l-.11.01l-2.87 2.18l-.04.1A10.01 10.01 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.32 14.12A6.14 6.14 0 0 1 6 12c0-.73.12-1.43.31-2.11l-.01-.14L3.39 7.53l-.1.04A9.91 9.91 0 0 0 2.2 12c0 1.59.39 3.08 1.08 4.42l3.04-2.3Z" fill="#FBBC05" />
      <path d="M12 5.82c1.86 0 3.12.78 3.84 1.43l2.81-2.67C16.95 3.05 14.7 2 12 2a10.01 10.01 0 0 0-8.71 5.57l3.13 2.32A5.99 5.99 0 0 1 12 5.82Z" fill="#EA4335" />
    </svg>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: ROLES.USER,
    businessNumber: '',
    businessDocumentName: '',
  });
  const [done, setDone] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState('');

  useEffect(() => {
    if (params.get('role') !== ROLES.SELLER) return;
    setForm((prev) => (prev.role === ROLES.SELLER ? prev : { ...prev, role: ROLES.SELLER }));
  }, [params]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setDone(true);
  };

  const handleSocialSignup = () => {
    setForm((prev) => ({ ...prev, role: ROLES.USER }));
    setDone(true);
  };

  if (done) {
    return (
      <div style={s.page}>
        <div style={s.completeBox}>
          <h2 style={s.completeTitle}>회원가입 완료!</h2>
          <p style={s.completeDesc}>TripZone 가입이 완료되었습니다. 이제 로그인해서 여행을 시작해보세요.</p>
          {form.role === ROLES.SELLER && (
            <p style={s.completeHint}>사업자 정보 심사 후 판매자 기능이 활성화됩니다.</p>
          )}
          <button onClick={() => navigate('/login')} style={s.completeBtn}>로그인하러 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.bgGlowA} />
      <div style={s.bgGlowB} />

      <div style={s.panel}>
        <div style={s.leftCol}>
          <p style={s.eyebrow}>CREATE ACCOUNT</p>
          <h1 style={s.leftTitle}>TRIPZONE 가입하기</h1>
          <p style={s.leftDesc}>회원가입 후 숙소 예약, 판매자 등록, 문의 기능을 모두 이용할 수 있습니다.</p>

          <div style={s.socialWrap}>
            {SOCIALS.map((social) => (
              <button
                key={social.id}
                type="button"
                onClick={handleSocialSignup}
                onMouseEnter={() => setHoveredSocial(social.id)}
                onMouseLeave={() => setHoveredSocial('')}
                style={{
                  ...s.socialBtn,
                  ...(hoveredSocial === social.id
                    ? { ...s.socialBtnHoverBase, ...SOCIAL_HOVER_STYLES[social.id] }
                    : null),
                }}
              >
                <span style={s.socialMark}><SocialIcon id={social.id} /></span>
                <span style={s.socialLabel}>{social.label}</span>
              </button>
            ))}
          </div>

          <p style={s.leftFoot}>이미 계정이 있으신가요? <Link to="/login" style={s.leftLink}>로그인</Link></p>
        </div>

        <div style={s.formCol}>
          <h2 style={s.formTitle}>회원가입</h2>

          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>가입 유형</label>
            <div style={s.roleRow}>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role: ROLES.USER }))}
                style={{ ...s.roleBtn, ...(form.role === ROLES.USER ? s.roleBtnActive : null) }}
              >
                일반 여행자
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role: ROLES.SELLER }))}
                style={{ ...s.roleBtn, ...(form.role === ROLES.SELLER ? s.roleBtnActive : null) }}
              >
                판매자(사업자)
              </button>
            </div>

            <label style={s.label}>이름</label>
            <input style={s.input} value={form.name} onChange={set('name')} required />

            <label style={s.label}>이메일</label>
            <input style={s.input} type="email" value={form.email} onChange={set('email')} required />

            <label style={s.label}>비밀번호</label>
            <input style={s.input} type="password" value={form.password} onChange={set('password')} required />

            <label style={s.label}>전화번호</label>
            <input style={s.input} value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" />

            {form.role === ROLES.SELLER && (
              <>
                <label style={s.label}>사업자등록번호</label>
                <input
                  style={s.input}
                  value={form.businessNumber}
                  onChange={set('businessNumber')}
                  placeholder="000-00-00000"
                  required
                />

                <label style={s.label}>사업자등록증 파일</label>
                <input
                  style={s.input}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    businessDocumentName: event.target.files?.[0]?.name || '',
                  }))}
                  required
                />
                {form.businessDocumentName && <p style={s.fileName}>선택된 파일: {form.businessDocumentName}</p>}
              </>
            )}

            <button type="submit" style={s.submitBtn}>가입하기</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '42px 24px',
    background: 'linear-gradient(180deg, #F8F6F4 0%, #F1EEEA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlowA: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    right: '-120px',
    top: '-120px',
    background: 'radial-gradient(circle, rgba(232,72,74,0.20) 0%, rgba(232,72,74,0) 70%)',
  },
  bgGlowB: {
    position: 'absolute',
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    left: '-120px',
    bottom: '-120px',
    background: 'radial-gradient(circle, rgba(80,130,255,0.14) 0%, rgba(80,130,255,0) 70%)',
  },
  panel: {
    width: '100%',
    maxWidth: '1120px',
    background: '#FFFFFFEE',
    border: '1px solid #E7DFDF',
    borderRadius: '24px',
    boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },
  leftCol: {
    padding: 'clamp(28px, 4vw, 38px)',
    background: 'linear-gradient(160deg, #FFF8F4 0%, #FFEFF1 55%, #F5F8FF 100%)',
    color: '#232323',
    display: 'flex',
    flexDirection: 'column',
  },
  eyebrow: { margin: '0 0 10px', fontSize: '11px', letterSpacing: '0.14em', color: '#D45759', fontWeight: 700 },
  leftTitle: {
    margin: '0 0 14px',
    fontSize: 'clamp(30px, 4vw, 46px)',
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
    color: '#E8484A',
  },
  leftDesc: { margin: 0, color: '#555555', fontSize: '14px', lineHeight: 1.7 },
  socialWrap: { marginTop: '20px', display: 'grid', gap: '8px' },
  socialBtn: {
    width: '100%',
    border: '1px solid #1F1F1F',
    borderRadius: '14px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFFFFF',
    color: '#1F1F1F',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease',
  },
  socialBtnHoverBase: {
    transform: 'translateY(-1px)',
  },
  socialMark: {
    width: '24px',
    height: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '14px',
  },
  socialLabel: { width: '100%', textAlign: 'center' },
  leftFoot: { marginTop: 'auto', fontSize: '13px', color: '#666' },
  leftLink: { color: '#111' },
  formCol: { padding: 'clamp(26px, 4vw, 36px) clamp(22px, 3vw, 34px)' },
  formTitle: { margin: '0 0 12px', fontSize: '28px', letterSpacing: '-0.02em' },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 700, color: '#444', marginTop: '3px' },
  roleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '2px',
  },
  roleBtn: {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    background: '#fff',
    color: '#505050',
    padding: '11px 10px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  roleBtnActive: {
    borderColor: '#E8484A',
    background: '#FFF3F3',
    color: '#C13A3D',
    boxShadow: 'inset 0 0 0 1px #E8484A',
  },
  input: {
    width: '100%',
    border: '1px solid #D7D7D7',
    borderRadius: '12px',
    padding: '12px 13px',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: '#fff',
  },
  fileName: { fontSize: '12px', color: '#6b7280', margin: '2px 0 0' },
  submitBtn: {
    width: '100%',
    border: 'none',
    borderRadius: '12px',
    padding: '13px 16px',
    marginTop: '10px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  completeBox: {
    width: '100%',
    maxWidth: '460px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 16px 36px rgba(0,0,0,0.10)',
    textAlign: 'center',
  },
  completeTitle: { margin: '0 0 8px', fontSize: '26px', color: '#E8484A' },
  completeDesc: { margin: '0 0 8px', fontSize: '14px', color: '#4B5563', lineHeight: 1.6 },
  completeHint: {
    margin: '0 0 12px',
    color: '#6b7280',
    fontSize: '13px',
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    padding: '8px 10px',
  },
  completeBtn: {
    border: 'none',
    borderRadius: '10px',
    background: '#111827',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    padding: '11px 16px',
    cursor: 'pointer',
  },
};
