import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';

const MOCK_USERS = [
  { userId: 1, email: 'user@test.com', password: '1234', name: '홍길동', role: ROLES.USER },
  { userId: 2, email: 'seller@test.com', password: '1234', name: '김판매', role: ROLES.SELLER },
  { userId: 3, email: 'admin@test.com', password: '1234', name: '관리자', role: ROLES.ADMIN },
];

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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hoveredSocial, setHoveredSocial] = useState('');

  const moveByRole = (user) => {
    if (user.role === ROLES.ADMIN) navigate('/admin');
    else if (user.role === ROLES.SELLER) navigate('/seller');
    else navigate('/');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = MOCK_USERS.find((user) => user.email === email && user.password === password);
    if (!found) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    setError('');
    login(found);
    moveByRole(found);
  };

  const handleSocialLogin = (provider) => {
    const socialUser = {
      userId: 9000,
      email: `${provider}@social.demo`,
      name: `${provider.toUpperCase()} 사용자`,
      role: ROLES.USER,
      social: true,
    };
    login(socialUser);
    navigate('/');
  };

  return (
    <div style={s.page}>
      <div style={s.bgGlowA} />
      <div style={s.bgGlowB} />
      <div style={s.panel}>
        <div style={s.brandCol}>
          <p style={s.eyebrow}>WELCOME BACK</p>
          <h1 style={s.brandTitle}>TRIPZONE</h1>
          <p style={s.brandDesc}>숙소 탐색, 예약, 여행 계획을 한 번에 관리하세요.</p>
          <p style={s.mockHint}>테스트 계정: user@test.com / seller@test.com / admin@test.com (비밀번호: 1234)</p>
        </div>

        <div style={s.formCol}>
          <h2 style={s.formTitle}>로그인</h2>

          <div style={s.socialWrap}>
            {SOCIALS.map((social) => (
              <button
                key={social.id}
                type="button"
                onClick={() => handleSocialLogin(social.id)}
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

          <div style={s.divider}><span>또는 이메일로 로그인</span></div>

          {error && <p style={s.error}>{error}</p>}

          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>이메일</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <label style={s.label}>비밀번호</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />

            <button type="submit" style={s.submitBtn}>로그인</button>
          </form>

          <div style={s.helperLinks}>
            <Link to="/find-id" style={s.helperLink}>아이디 찾기</Link>
            <Link to="/find-password" style={s.helperLink}>비밀번호 찾기</Link>
          </div>

          <p style={s.signup}>계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
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
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    right: '-120px',
    top: '-100px',
    background: 'radial-gradient(circle, rgba(232,72,74,0.20) 0%, rgba(232,72,74,0) 70%)',
  },
  bgGlowB: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    left: '-120px',
    bottom: '-120px',
    background: 'radial-gradient(circle, rgba(80,130,255,0.16) 0%, rgba(80,130,255,0) 70%)',
  },
  panel: {
    width: '100%',
    maxWidth: '1100px',
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
  brandCol: {
    padding: 'clamp(28px, 4vw, 42px)',
    background: 'linear-gradient(160deg, #FFF8F4 0%, #FFEFF1 55%, #F5F8FF 100%)',
    color: '#222',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  eyebrow: { margin: '0 0 10px', fontSize: '11px', letterSpacing: '0.14em', color: '#D45759', fontWeight: 700 },
  brandTitle: {
    margin: '0 0 14px',
    fontSize: 'clamp(34px, 4vw, 54px)',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    color: '#E8484A',
  },
  brandDesc: { margin: 0, color: '#535353', fontSize: '14px', lineHeight: 1.7, maxWidth: '360px' },
  mockHint: {
    marginTop: '18px',
    fontSize: '12px',
    lineHeight: 1.55,
    color: '#636363',
    background: '#FFFFFFAA',
    border: '1px solid #E9DEDE',
    borderRadius: '12px',
    padding: '10px 12px',
  },
  formCol: { padding: 'clamp(26px, 4vw, 38px) clamp(22px, 3vw, 36px)' },
  formTitle: { margin: '0 0 14px', fontSize: '28px', letterSpacing: '-0.02em' },
  socialWrap: { display: 'grid', gap: '8px' },
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
  iconGlyph: { fontSize: '13px', fontWeight: 900, lineHeight: 1 },
  divider: {
    margin: '14px 0',
    display: 'flex',
    alignItems: 'center',
    color: '#909090',
    fontSize: '12px',
    gap: '10px',
  },
  error: {
    margin: '0 0 8px',
    color: '#DC2626',
    fontSize: '13px',
    fontWeight: 600,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 700, color: '#444', marginTop: '3px' },
  input: {
    width: '100%',
    border: '1px solid #D7D7D7',
    borderRadius: '12px',
    padding: '12px 13px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    border: 'none',
    borderRadius: '12px',
    padding: '13px 16px',
    marginTop: '8px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  helperLinks: {
    marginTop: '14px',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '10px 14px',
  },
  helperLink: {
    color: '#E8484A',
    fontSize: '13px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  signup: { textAlign: 'center', marginTop: '14px', fontSize: '13px', color: '#5E5E5E' },
};
