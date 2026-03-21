import { Link } from 'react-router-dom';
import { benefitSnapshot, gradeGuide, mileageItems } from '../../mock/benefitsData';
import { C, MAX_WIDTH } from '../../styles/tokens';
import { buildPointsDestination } from '../../utils/benefitNavigation';
import { buildAttendanceMileageItems, getPendingAttendancePoint } from '../../utils/attendanceMock';

export default function PointsPage() {
  // TODO(back-end): /api/v1/me/mileage 응답으로 교체하고, 적립 예정/소멸 예정 포인트를 서버 계산값으로 연결한다.
  // TODO(back-end): 출석체크 적립 이력은 /api/v1/events/attendance/check 또는 포인트 이력 응답에 합쳐 내려주면 된다.
  const currentRate = gradeGuide.find((item) => item.name === benefitSnapshot.currentGrade)?.mileageRate || 1;
  const attendanceMileageItems = buildAttendanceMileageItems();
  const mergedMileageItems = [...attendanceMileageItems, ...mileageItems].sort((a, b) => b.regDate.localeCompare(a.regDate));
  const earnedTotal = mergedMileageItems.filter((item) => item.changeAmount > 0).reduce((sum, item) => sum + item.changeAmount, 0);
  const usedTotal = mergedMileageItems.filter((item) => item.changeAmount < 0).reduce((sum, item) => sum + Math.abs(item.changeAmount), 0);
  const pendingAttendancePoint = getPendingAttendancePoint();

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <section style={s.hero}>
          <div>
            <p style={s.eyebrow}>MY POINT WALLET</p>
            <h1 style={s.title}>포인트함</h1>
            <p style={s.desc}>현재 보유 포인트와 적립 이력을 한 번에 보고, 예약에 바로 사용할 수 있도록 정리했습니다.</p>
          </div>
          <Link to="/benefits" style={s.heroBtn}>혜택 페이지로 이동</Link>
        </section>

        <section style={s.summaryGrid}>
          <article style={s.summaryCard}>
            <p style={s.summaryLabel}>보유 포인트</p>
            <p style={s.summaryValue}>{benefitSnapshot.mileageBalance.toLocaleString()}P</p>
            <p style={s.summaryDesc}>현재 예약 결제에서 사용할 수 있는 포인트 잔액입니다.</p>
          </article>
          <article style={s.summaryCard}>
            <p style={s.summaryLabel}>현재 적립률</p>
            <p style={s.summaryValue}>{currentRate}%</p>
            <p style={s.summaryDesc}>{benefitSnapshot.currentGrade} 등급 기준 결제 금액 적립률입니다.</p>
          </article>
          <article style={s.summaryCard}>
            <p style={s.summaryLabel}>출석 적립 예정</p>
            <p style={s.summaryValue}>{pendingAttendancePoint.toLocaleString()}P</p>
            <p style={s.summaryDesc}>출석체크 참여 시 받을 수 있는 적립 예정 포인트입니다.</p>
          </article>
          <article style={s.summaryCard}>
            <p style={s.summaryLabel}>누적 사용 포인트</p>
            <p style={s.summaryValue}>{usedTotal.toLocaleString()}P</p>
            <p style={s.summaryDesc}>최근 이력 기준으로 사용된 포인트 합계입니다.</p>
          </article>
        </section>

        <section style={s.section}>
          <div style={s.sectionHead}>
            <div>
              <p style={s.sectionEyebrow}>USE NOW</p>
              <h2 style={s.sectionTitle}>포인트 사용하기</h2>
            </div>
            <Link to={buildPointsDestination()} style={s.primaryBtn}>사용하러 가기</Link>
          </div>

          <div style={s.useCard}>
            <div>
              <p style={s.useValue}>{benefitSnapshot.mileageBalance.toLocaleString()}P</p>
              <p style={s.useDesc}>현재 보유 포인트는 예약 단계에서 바로 사용할 수 있고, 출석체크 혜택도 함께 쌓을 수 있습니다.</p>
            </div>
            <div style={s.useMeta}>
              <div style={s.metaBox}>
                <span style={s.metaLabel}>최근 적립</span>
                <strong style={s.metaPositive}>+{earnedTotal.toLocaleString()}P</strong>
              </div>
              <div style={s.metaBox}>
                <span style={s.metaLabel}>최근 사용</span>
                <strong style={s.metaNegative}>-{usedTotal.toLocaleString()}P</strong>
              </div>
            </div>
          </div>
        </section>

        <section style={s.sectionMuted}>
          <div style={s.sectionHead}>
            <div>
              <p style={s.sectionEyebrow}>HISTORY</p>
              <h2 style={s.sectionTitle}>포인트 이용 내역</h2>
            </div>
          </div>

          <div style={s.historyList}>
            {mergedMileageItems.map((item) => (
              <article key={item.mileageHistoryNo} style={s.historyRow}>
                <div>
                  <p style={s.historyTitle}>{item.reason}</p>
                  <p style={s.historyMeta}>
                    {item.regDate}
                    {item.balanceAfter !== null ? ` · 잔액 ${item.balanceAfter.toLocaleString()}P` : ' · 서버 반영 대기'}
                  </p>
                </div>
                <div style={s.historyAmountWrap}>
                  <div style={{ ...s.historyAmount, color: item.changeAmount > 0 ? C.success : C.text }}>
                    {item.changeAmount > 0 ? '+' : ''}{item.changeAmount.toLocaleString()}P
                  </div>
                  {item.status === 'MOCK_PENDING' ? <span style={s.pendingBadge}>출석 적립 예정</span> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const s = {
  page: { background: '#F9F7F5', minHeight: 'calc(100vh - 160px)', padding: '48px 24px 72px' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' },
  eyebrow: { margin: '0 0 10px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 10px', fontSize: '36px', fontWeight: '800', color: C.text },
  desc: { margin: 0, maxWidth: '720px', fontSize: '15px', lineHeight: 1.7, color: C.textSub },
  heroBtn: { display: 'inline-flex', alignItems: 'center', padding: '12px 18px', borderRadius: '999px', textDecoration: 'none', border: `1px solid ${C.border}`, background: '#fff', color: C.text, fontWeight: '700' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  summaryCard: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '20px', padding: '20px 22px', boxShadow: '0 10px 24px rgba(15,23,42,0.04)' },
  summaryLabel: { margin: 0, fontSize: '13px', color: C.textSub, fontWeight: '700' },
  summaryValue: { margin: '10px 0 8px', fontSize: '28px', color: C.text, fontWeight: '800' },
  summaryDesc: { margin: 0, fontSize: '13px', lineHeight: 1.7, color: C.textSub },
  section: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '24px', padding: '24px', boxShadow: '0 12px 28px rgba(15,23,42,0.04)' },
  sectionMuted: { background: '#FCFCFC', border: `1px solid ${C.borderLight}`, borderRadius: '24px', padding: '24px' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' },
  sectionEyebrow: { margin: 0, fontSize: '12px', color: C.textLight, fontWeight: '800' },
  sectionTitle: { margin: '6px 0 0', fontSize: '24px', color: C.text, fontWeight: '800' },
  primaryBtn: { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: '128px', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontWeight: '800', fontSize: '13px' },
  useCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', flexWrap: 'wrap', border: `1px solid ${C.borderLight}`, borderRadius: '20px', padding: '22px', background: 'linear-gradient(135deg, #FFF7F7 0%, #FFFFFF 100%)' },
  useValue: { margin: '0 0 8px', fontSize: '30px', color: C.text, fontWeight: '800' },
  useDesc: { margin: 0, maxWidth: '560px', fontSize: '14px', lineHeight: 1.7, color: C.textSub },
  useMeta: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  metaBox: { minWidth: '140px', padding: '14px 16px', borderRadius: '16px', background: '#fff', border: `1px solid ${C.borderLight}` },
  metaLabel: { display: 'block', fontSize: '12px', color: C.textLight, fontWeight: '700', marginBottom: '6px' },
  metaPositive: { fontSize: '18px', color: C.success, fontWeight: '800' },
  metaNegative: { fontSize: '18px', color: C.text, fontWeight: '800' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', border: `1px solid ${C.borderLight}`, borderRadius: '18px', padding: '18px 20px', background: '#fff' },
  historyTitle: { margin: '0 0 6px', fontSize: '16px', color: C.text, fontWeight: '700' },
  historyMeta: { margin: 0, fontSize: '13px', color: C.textSub },
  historyAmountWrap: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  historyAmount: { fontSize: '16px', fontWeight: '800' },
  pendingBadge: { display: 'inline-flex', padding: '5px 9px', borderRadius: '999px', background: '#FFF3D6', color: '#A16207', fontSize: '11px', fontWeight: '800' },
};
