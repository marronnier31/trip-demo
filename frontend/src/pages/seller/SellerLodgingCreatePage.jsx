import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ALL_REGIONS } from '../../mock/mockData';
import { C, MAX_WIDTH, R } from '../../styles/tokens';

function FormSection({ title, children }) {
  return (
    <div style={fs.section}>
      <h2 style={fs.title}>{title}</h2>
      {children}
    </div>
  );
}
const fs = {
  section: { marginBottom: '8px' },
  title: { fontSize: '18px', fontWeight: '700', color: C.text, margin: '0 0 20px' },
};

export default function SellerLodgingCreatePage() {
  const navigate = useNavigate();
  const [submitMessage, setSubmitMessage] = useState('');
  const [form, setForm] = useState({
    name: '', region: '', address: '', pricePerNight: '', description: '', latitude: '', longitude: '',
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitMessage('숙소가 등록되었습니다. 목록으로 이동합니다.');
    window.setTimeout(() => navigate('/seller/lodgings'), 800);
  };

  const priceDisplay = form.pricePerNight
    ? Number(form.pricePerNight).toLocaleString()
    : '';

  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <Link to="/seller/lodgings" style={s.back}>← 내 숙소 목록</Link>
        <h1 style={s.title}>숙소 등록</h1>

        <form onSubmit={handleSubmit} style={s.form}>
          {/* 섹션 1: 기본 정보 */}
          <FormSection title="기본 정보">
            <label style={s.label}>숙소명 <span style={s.req}>*</span></label>
            <input style={s.input} value={form.name} onChange={set('name')} required placeholder="예: 한라산 뷰 펜션" />

            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>지역 <span style={s.req}>*</span></label>
                <select style={s.select} value={form.region} onChange={set('region')} required>
                  <option value="">지역 선택</option>
                  {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={s.label}>주소 <span style={s.req}>*</span></label>
                <input style={s.input} value={form.address} onChange={set('address')} required placeholder="상세 주소" />
              </div>
            </div>

            <label style={s.label}>1박 요금 (원) <span style={s.req}>*</span></label>
            <div style={s.priceWrap}>
              <input
                style={{ ...s.input, paddingRight: '40px' }}
                type="number"
                value={form.pricePerNight}
                onChange={set('pricePerNight')}
                required
                min="0"
                placeholder="100000"
              />
              {priceDisplay && (
                <span style={s.pricePreview}>{priceDisplay}원</span>
              )}
            </div>
          </FormSection>

          <hr style={s.hr} />

          {/* 섹션 2: 상세 설명 */}
          <FormSection title="숙소 소개">
            <label style={s.label}>설명</label>
            <textarea
              style={{ ...s.input, height: '120px', resize: 'vertical', lineHeight: '1.6' }}
              value={form.description}
              onChange={set('description')}
              placeholder="숙소의 특징, 편의시설, 주변 환경 등을 소개해 주세요."
            />
          </FormSection>

          <hr style={s.hr} />

          {/* 섹션 3: 위치 좌표 */}
          <FormSection title="위치 좌표">
            <p style={s.coordHint}>지도에서 숙소 위치를 표시하는 데 사용됩니다.</p>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>위도 (latitude)</label>
                <input style={s.input} value={form.latitude} onChange={set('latitude')} placeholder="37.1234" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>경도 (longitude)</label>
                <input style={s.input} value={form.longitude} onChange={set('longitude')} placeholder="127.5678" />
              </div>
            </div>
          </FormSection>

          <hr style={s.hr} />

          {/* 제출 버튼 */}
          {submitMessage ? <p style={s.successText}>{submitMessage}</p> : null}
          <div style={s.btnGroup}>
            <button type="submit" style={s.submitBtn}>등록하기</button>
            <button type="button" onClick={() => navigate(-1)} style={s.cancelBtn}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  wrap: { background: C.bgGray, minHeight: 'calc(100vh - 160px)', padding: '48px 24px' },
  inner: { maxWidth: '640px', margin: '0 auto', background: C.bg, borderRadius: '16px', padding: '40px' },
  back: { fontSize: '14px', color: C.textSub, textDecoration: 'none', display: 'inline-block', marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '700', color: C.text, margin: '0 0 32px' },
  form: {},
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: C.text, marginBottom: '6px', marginTop: '16px' },
  req: { color: C.primary },
  input: {
    width: '100%',
    minHeight: '48px',
    padding: '12px 14px',
    border: `1px solid ${C.border}`,
    borderRadius: R.md,
    fontSize: '15px',
    color: C.text,
    boxSizing: 'border-box',
    outline: 'none',
    background: C.bg,
  },
  select: {
    width: '100%',
    minHeight: '48px',
    padding: '12px 40px 12px 14px',
    border: `1px solid ${C.border}`,
    borderRadius: R.md,
    fontSize: '15px',
    color: C.text,
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: C.bg,
    backgroundImage: 'linear-gradient(45deg, transparent 50%, #8A6B64 50%), linear-gradient(135deg, #8A6B64 50%, transparent 50%)',
    backgroundPosition: 'calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px)',
    backgroundSize: '6px 6px, 6px 6px',
    backgroundRepeat: 'no-repeat',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  },
  row: { display: 'flex', gap: '12px' },
  priceWrap: { position: 'relative' },
  pricePreview: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '13px',
    color: C.primary,
    fontWeight: '600',
    pointerEvents: 'none',
  },
  coordHint: { fontSize: '13px', color: C.textSub, margin: '0 0 4px' },
  hr: { border: 'none', borderTop: `1px solid ${C.borderLight}`, margin: '28px 0' },
  successText: { margin: '0 0 16px', fontSize: '13px', color: '#15803D', fontWeight: '700' },
  btnGroup: { display: 'flex', gap: '12px' },
  submitBtn: {
    flex: 1,
    padding: '14px',
    background: C.primary,
    color: '#fff',
    border: 'none',
    borderRadius: R.md,
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '14px 24px',
    background: C.bgGray,
    color: C.textSub,
    border: 'none',
    borderRadius: R.md,
    fontSize: '15px',
    cursor: 'pointer',
  },
};
