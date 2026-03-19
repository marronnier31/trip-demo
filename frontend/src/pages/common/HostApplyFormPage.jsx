import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HostApplyFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    representativeName: '',
    businessNumber: '',
    phone: '',
    region: '',
    introduction: '',
  });

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/host/apply/pending', { state: { representativeName: form.representativeName, region: form.region } });
  };

  return (
    <div style={s.page}>
      <div style={s.bgGlowA} />
      <div style={s.bgGlowB} />

      <div style={s.panel}>
        <div style={s.leftCol}>
          <p style={s.eyebrow}>HOST APPLICATION FORM</p>
          <h1 style={s.leftTitle}>호스트 신청서 작성</h1>
          <p style={s.leftDesc}>대표자 정보와 운영 지역을 입력하면 신청이 접수되며, 이후 승인 결과에 따라 판매자 기능이 활성화됩니다.</p>

          <div style={s.tipBox}>
            <p style={s.tipTitle}>작성 팁</p>
            <ul style={s.tipList}>
              <li>대표자명과 사업자번호는 정확히 입력</li>
              <li>운영 지역은 대표 지역만 먼저 작성</li>
              <li>소개 문구는 숙소 운영 성격이 드러나게 작성</li>
            </ul>
          </div>
        </div>

        <div style={s.formCol}>
          <div style={s.headerRow}>
            <h2 style={s.formTitle}>신청 정보</h2>
            <span style={s.stepBadge}>2 / 3</span>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>대표자명</label>
            <input style={s.input} value={form.representativeName} onChange={set('representativeName')} required />

            <label style={s.label}>사업자등록번호</label>
            <input style={s.input} value={form.businessNumber} onChange={set('businessNumber')} placeholder="000-00-00000" required />

            <label style={s.label}>연락처</label>
            <input style={s.input} value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" required />

            <label style={s.label}>대표 운영 지역</label>
            <input style={s.input} value={form.region} onChange={set('region')} placeholder="예: 제주 / 부산 / 서울" required />

            <label style={s.label}>소개 문구</label>
            <textarea
              style={s.textarea}
              value={form.introduction}
              onChange={set('introduction')}
              placeholder="숙소 운영 경험이나 운영 예정 숙소의 특성을 간단히 적어주세요."
              required
            />

            <div style={s.actions}>
              <Link to="/host/apply" style={s.secondaryBtn}>이전 단계</Link>
              <button type="submit" style={s.primaryBtn}>신청 제출하기</button>
            </div>
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
    padding: 'clamp(28px, 4vw, 42px)',
    background: 'linear-gradient(160deg, #FFF8F4 0%, #FFEFF1 55%, #F5F8FF 100%)',
    color: '#222',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  eyebrow: { margin: '0 0 10px', fontSize: '11px', letterSpacing: '0.14em', color: '#D45759', fontWeight: 700 },
  leftTitle: { margin: '0 0 14px', fontSize: 'clamp(34px, 4vw, 52px)', lineHeight: 1.08, color: '#E8484A' },
  leftDesc: { margin: 0, color: '#535353', fontSize: '14px', lineHeight: 1.7, maxWidth: '360px' },
  tipBox: {
    marginTop: '20px',
    border: '1px solid #E9DEDE',
    borderRadius: '14px',
    padding: '14px 16px',
    background: '#FFFFFFAA',
  },
  tipTitle: { margin: '0 0 8px', fontSize: '13px', fontWeight: 800, color: '#222' },
  tipList: { margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px', fontSize: '13px', lineHeight: 1.6, color: '#666' },
  formCol: { padding: 'clamp(26px, 4vw, 38px) clamp(22px, 3vw, 36px)' },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' },
  formTitle: { margin: 0, fontSize: '28px', letterSpacing: '-0.02em' },
  stepBadge: {
    padding: '7px 12px',
    borderRadius: '999px',
    background: '#FFF1F1',
    color: '#D45759',
    fontSize: '12px',
    fontWeight: 800,
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
  textarea: {
    width: '100%',
    minHeight: '130px',
    border: '1px solid #D7D7D7',
    borderRadius: '12px',
    padding: '12px 13px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' },
  primaryBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '13px 16px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryBtn: {
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '12px',
    padding: '13px 16px',
    background: '#fff',
    color: '#444',
    fontSize: '14px',
    fontWeight: 700,
    border: '1px solid #DDD',
  },
};
