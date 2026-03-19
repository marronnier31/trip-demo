import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FindIdPage() {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [result, setResult] = useState('');

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setResult('가입된 계정이 있다면 입력한 연락처 기준으로 아이디 안내를 받을 수 있습니다.');
  };

  return (
    <div style={s.page}>
      <div style={s.bgGlowA} />
      <div style={s.bgGlowB} />

      <div style={s.panel}>
        <div style={s.brandCol}>
          <p style={s.eyebrow}>ACCOUNT RECOVERY</p>
          <h1 style={s.brandTitle}>아이디 찾기</h1>
          <p style={s.brandDesc}>가입 시 입력한 이름과 연락처를 기준으로 계정 안내 흐름을 확인할 수 있습니다.</p>
          <div style={s.guideBox}>
            <p style={s.guideTitle}>안내</p>
            <p style={s.guideText}>입력한 정보가 일치하면 안내 가능한 계정 정보를 확인할 수 있습니다.</p>
          </div>
        </div>

        <div style={s.formCol}>
          <h2 style={s.formTitle}>가입 정보 확인</h2>
          <p style={s.formDesc}>가입한 이름과 전화번호를 입력해 주세요.</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>이름</label>
            <input
              style={s.input}
              value={form.name}
              onChange={set('name')}
              placeholder="이름을 입력하세요"
              required
            />

            <label style={s.label}>전화번호</label>
            <input
              style={s.input}
              value={form.phone}
              onChange={set('phone')}
              placeholder="010-0000-0000"
              required
            />

            <button type="submit" style={s.submitBtn}>아이디 찾기</button>
          </form>

          {result && (
            <div style={s.resultBox}>
              <p style={s.resultTitle}>안내 준비 완료</p>
              <p style={s.resultText}>{result}</p>
            </div>
          )}

          <div style={s.helperLinks}>
            <Link to="/login" style={s.helperLink}>로그인으로 돌아가기</Link>
            <Link to="/find-password" style={s.helperLink}>비밀번호 찾기</Link>
          </div>
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
    maxWidth: '1040px',
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: '#222',
  },
  eyebrow: { margin: '0 0 10px', fontSize: '11px', letterSpacing: '0.14em', color: '#D45759', fontWeight: 700 },
  brandTitle: { margin: '0 0 14px', fontSize: 'clamp(32px, 4vw, 50px)', lineHeight: 1.08, color: '#E8484A' },
  brandDesc: { margin: 0, color: '#535353', fontSize: '14px', lineHeight: 1.7, maxWidth: '360px' },
  guideBox: {
    marginTop: '18px',
    border: '1px solid #E9DEDE',
    borderRadius: '14px',
    padding: '14px 16px',
    background: '#FFFFFFAA',
  },
  guideTitle: { margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#222' },
  guideText: { margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#666' },
  formCol: { padding: 'clamp(26px, 4vw, 38px) clamp(22px, 3vw, 36px)' },
  formTitle: { margin: '0 0 8px', fontSize: '28px', letterSpacing: '-0.02em' },
  formDesc: { margin: '0 0 18px', color: '#6B6B6B', fontSize: '14px', lineHeight: 1.6 },
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
    marginTop: '10px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  resultBox: {
    marginTop: '16px',
    padding: '14px 16px',
    borderRadius: '14px',
    background: '#FFF7F7',
    border: '1px solid #F4CBCD',
  },
  resultTitle: { margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#B73C3E' },
  resultText: { margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#5D4C4D' },
  helperLinks: {
    marginTop: '18px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px 14px',
  },
  helperLink: {
    color: '#E8484A',
    fontSize: '13px',
    fontWeight: 700,
    textDecoration: 'none',
  },
};
