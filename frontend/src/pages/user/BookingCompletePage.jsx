import { useLocation, useNavigate, Link } from 'react-router-dom';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function BookingCompletePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/');
    return null;
  }

  const { lodgingName, checkIn, checkOut, guests, totalPrice, couponName, usedMileage, couponDiscount, expectedMileage, paymentMethod } = state;

  const rows = [
    { label: '숙소', value: lodgingName },
    { label: '체크인', value: checkIn },
    { label: '체크아웃', value: checkOut },
    { label: '인원', value: `${guests}명` },
    { label: '결제 수단', value: paymentMethod === 'BANK' ? '무통장입금' : '카드 결제' },
  ];

  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <section style={s.hero}>
          <div style={s.heroMainWide}>
            <div style={s.iconCircle}>✓</div>
            <p style={s.eyebrow}>BOOKING COMPLETE</p>
            <h1 style={s.title}>예약이 완료되었습니다!</h1>
            <p style={s.sub}>예약 확인 내용은 내 예약에서 다시 확인할 수 있습니다.</p>
            <div style={s.heroMetaRow}>
              <div style={s.heroMetaCard}>
                <p style={s.heroMetaLabel}>최종 결제 금액</p>
                <p style={s.heroMetaValue}>{totalPrice.toLocaleString()}원</p>
              </div>
              <div style={s.heroMetaCard}>
                <p style={s.heroMetaLabel}>적립 예정</p>
                <p style={s.heroMetaValue}>{Number(expectedMileage || 0).toLocaleString()}P</p>
              </div>
              <div style={s.heroMetaCard}>
                <p style={s.heroMetaLabel}>결제 수단</p>
                <p style={s.heroMetaValue}>{paymentMethod === 'BANK' ? '무통장입금' : '카드 결제'}</p>
              </div>
            </div>
            <div style={s.actionRow}>
              <Link to="/my/bookings" style={s.primaryBtn}>내 예약 확인하기</Link>
              <Link to="/" style={s.secondaryBtn}>홈으로 가기</Link>
            </div>
          </div>
        </section>

        <section style={s.grid}>
          <div style={s.panel}>
            <p style={s.panelEyebrow}>RESERVATION SUMMARY</p>
            <h2 style={s.panelTitle}>예약 정보</h2>
            <div style={s.infoCard}>
              {rows.map((r) => (
                <div key={r.label} style={s.infoRow}>
                  <span style={s.infoKey}>{r.label}</span>
                  <span style={s.infoValue}>{r.value}</span>
                </div>
              ))}
              <div style={{ ...s.infoRow, borderBottom: 'none' }}>
                <span style={s.infoKey}>결제 금액</span>
                <span style={{ ...s.infoValue, color: C.primary, fontWeight: '800' }}>{totalPrice.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <div style={s.panel}>
            <p style={s.panelEyebrow}>BENEFITS</p>
            <h2 style={s.panelTitle}>적용 혜택</h2>
            <div style={s.benefitCard}>
              <div style={s.benefitRow}>
                <span style={s.benefitLabel}>사용 쿠폰</span>
                <span style={s.benefitValue}>{couponName || '미사용'}</span>
              </div>
              <div style={s.benefitRow}>
                <span style={s.benefitLabel}>쿠폰 할인</span>
                <span style={s.benefitValue}>-{Number(couponDiscount || 0).toLocaleString()}원</span>
              </div>
              <div style={s.benefitRow}>
                <span style={s.benefitLabel}>사용 포인트</span>
                <span style={s.benefitValue}>-{Number(usedMileage || 0).toLocaleString()}P</span>
              </div>
              <div style={{ ...s.benefitRow, borderBottom: 'none' }}>
                <span style={s.benefitLabel}>적립 예정</span>
                <span style={{ ...s.benefitValue, color: '#15803D' }}>{Number(expectedMileage || 0).toLocaleString()}P</span>
              </div>
            </div>
          </div>
        </section>

        <section style={s.bottomGrid}>
          <div style={s.noteCard}>
            <p style={s.noteTitle}>다음에 할 수 있는 일</p>
            <ul style={s.noteList}>
              <li>내 예약에서 일정과 결제 정보를 다시 확인할 수 있습니다.</li>
              <li>숙소 상세나 문의센터로 이동해 추가 문의 흐름을 이어갈 수 있습니다.</li>
              <li>예약 일정에 맞춰 체크인 안내와 준비 사항을 미리 확인해 주세요.</li>
            </ul>
          </div>
          <div style={s.noteCard}>
            <p style={s.noteTitle}>안내</p>
            <ul style={s.noteList}>
              <li>결제 수단과 적용 혜택은 위 예약 정보에서 다시 확인할 수 있습니다.</li>
              <li>변경이나 요청 사항이 있으면 문의센터에서 바로 문의를 남길 수 있습니다.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

const s = {
  wrap: { minHeight: 'calc(100vh - 160px)', padding: '40px 24px 64px', background: 'linear-gradient(180deg, #FBF8F6 0%, #F3EFEC 100%)' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto', display: 'grid', gap: '20px' },
  hero: { display: 'block' },
  heroMainWide: { padding: '34px', borderRadius: '30px', background: 'linear-gradient(135deg, #FFF7F1 0%, #FFFFFF 52%, #F7F7FF 100%)', border: '1px solid #EEE3DD', boxShadow: '0 18px 42px rgba(15,23,42,0.06)' },
  iconCircle: { width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  eyebrow: { margin: '0 0 10px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 10px', fontSize: '40px', lineHeight: 1.08, color: C.text, fontWeight: '800' },
  sub: { margin: '0 0 20px', fontSize: '15px', lineHeight: 1.8, color: C.textSub, maxWidth: '760px' },
  heroMetaRow: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '22px' },
  heroMetaCard: { padding: '16px 18px', borderRadius: '18px', background: 'rgba(255,255,255,0.84)', border: '1px solid #EFE4DE' },
  heroMetaLabel: { margin: '0 0 6px', fontSize: '12px', color: C.textLight, fontWeight: '800' },
  heroMetaValue: { margin: 0, fontSize: '18px', color: C.text, fontWeight: '800' },
  actionRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  primaryBtn: { display: 'inline-flex', padding: '13px 18px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontWeight: '800', fontSize: '14px' },
  secondaryBtn: { display: 'inline-flex', padding: '13px 18px', borderRadius: '999px', background: '#fff', color: C.text, textDecoration: 'none', fontWeight: '700', fontSize: '14px', border: `1px solid ${C.border}` },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' },
  panel: { padding: '24px', borderRadius: '26px', background: 'rgba(255,255,255,0.95)', border: '1px solid #EEE4DE', boxShadow: '0 18px 40px rgba(15,23,42,0.05)' },
  panelEyebrow: { margin: '0 0 8px', fontSize: '12px', color: C.primary, fontWeight: '800', letterSpacing: '0.1em' },
  panelTitle: { margin: '0 0 16px', fontSize: '24px', color: C.text, fontWeight: '800' },
  infoCard: { border: `1px solid ${C.borderLight}`, borderRadius: '18px', overflow: 'hidden', background: '#fff' },
  benefitCard: { border: `1px solid ${C.borderLight}`, borderRadius: '18px', overflow: 'hidden', background: '#FAFAFA' },
  benefitRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: `1px solid ${C.borderLight}` },
  benefitLabel: { fontSize: '13px', color: C.textSub, fontWeight: '700' },
  benefitValue: { fontSize: '14px', color: C.text, fontWeight: '700' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: `1px solid ${C.borderLight}` },
  infoKey: { fontSize: '13px', color: C.textSub, fontWeight: '700' },
  infoValue: { fontSize: '14px', color: C.text, fontWeight: '700' },
  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' },
  noteCard: { padding: '22px', borderRadius: '24px', background: '#FFFCFB', border: '1px solid #EEE4DE' },
  noteTitle: { margin: '0 0 12px', fontSize: '16px', color: C.text, fontWeight: '800' },
  noteList: { margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px', fontSize: '14px', color: C.textSub, lineHeight: 1.7 },
};
