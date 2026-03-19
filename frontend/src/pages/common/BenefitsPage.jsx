import { Link } from 'react-router-dom';
import { benefitSnapshot, couponItems, gradeGuide, mileageItems } from '../../mock/benefitsData';
import { C, MAX_WIDTH } from '../../styles/tokens';
import { buildCouponDestination, buildPointsDestination } from '../../utils/benefitNavigation';

function formatWon(value) {
  return `${Number(value || 0).toLocaleString()}원`;
}

function formatPoint(value) {
  return `${Number(value || 0).toLocaleString()}P`;
}

function GradeCard({ item, active }) {
  return (
    <article
      style={{
        ...s.gradeCard,
        background: item.bg,
        color: item.textColor || C.text,
        boxShadow: active ? '0 16px 36px rgba(17,24,39,0.14)' : 'none',
        transform: active ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={s.gradeRow}>
        <span style={{ ...s.gradeBadge, color: item.accent }}>{item.name}</span>
        <span style={{ ...s.gradeRate, color: item.accent }}>{item.mileageRate}% 적립</span>
      </div>
      {active ? <span style={s.activePill}>현재 등급</span> : null}
      <p style={{ ...s.gradeCond, color: item.textColor || C.text }}>누적 결제 {formatWon(item.minTotalAmount)} 또는 {item.minStayCount}회 숙박</p>
      <p style={{ ...s.gradeBenefit, color: item.textColor === '#F9FAFB' ? 'rgba(249,250,251,0.84)' : C.textSub }}>{item.benefit}</p>
    </article>
  );
}

export default function BenefitsPage() {
  // TODO(back-end): /api/v1/me/benefits, /api/v1/me/coupons, /api/v1/me/mileage 응답으로 교체
  // TODO(back-end): 사용하러 가기 버튼은 나중에 국내/국외/적용 가능 숙소 필터 진입으로 교체한다.
  const activeGrade = gradeGuide.find((item) => item.name === benefitSnapshot.currentGrade) || gradeGuide[0];

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <section style={s.hero}>
          <div style={s.heroMain}>
            <p style={s.eyebrow}>TRIPZONE MEMBERSHIP</p>
            <h1 style={s.title}>{benefitSnapshot.currentGrade} 등급 혜택을
              <br />
              한 화면에서 확인하세요.
            </h1>
            <p style={s.desc}>현재 등급, 포인트 잔액, 최근 쿠폰과 적립 내역을 묶어서 보여주고 다음 등급까지 얼마나 남았는지도 바로 읽히게 정리했습니다.</p>
            <div style={s.heroActions}>
              <Link to="/coupons" style={s.primaryBtn}>쿠폰함 보기</Link>
              <Link to="/points" style={s.secondaryBtn}>포인트함 보기</Link>
            </div>
          </div>

          <aside style={s.heroAside}>
            <div style={s.snapshotCard}>
              <p style={s.snapshotLabel}>현재 요약</p>
              <div style={s.snapshotGrid}>
                <div>
                  <p style={s.snapshotValue}>{formatPoint(benefitSnapshot.mileageBalance)}</p>
                  <p style={s.snapshotMeta}>보유 포인트</p>
                </div>
                <div>
                  <p style={s.snapshotValue}>{benefitSnapshot.couponCount}장</p>
                  <p style={s.snapshotMeta}>사용 가능 쿠폰</p>
                </div>
                <div>
                  <p style={s.snapshotValue}>{benefitSnapshot.annualStayCount}회</p>
                  <p style={s.snapshotMeta}>누적 숙박</p>
                </div>
                <div>
                  <p style={s.snapshotValue}>{formatWon(benefitSnapshot.annualSpendAmount)}</p>
                  <p style={s.snapshotMeta}>누적 결제</p>
                </div>
              </div>
              <p style={s.snapshotFoot}>{benefitSnapshot.nextGradeRemainBookings}번 더 예약하면 {benefitSnapshot.nextGrade} 등급 예상</p>
            </div>
          </aside>
        </section>

        <section style={s.progressSection}>
          <article style={s.progressCard}>
            <p style={s.progressLabel}>다음 등급까지</p>
            <p style={s.progressValue}>{benefitSnapshot.nextGradeRemainBookings}회 예약</p>
            <p style={s.progressDesc}>{benefitSnapshot.currentGrade}에서 {benefitSnapshot.nextGrade}로 올라가기 위해 남은 예약 횟수입니다.</p>
          </article>
          <article style={s.progressCard}>
            <p style={s.progressLabel}>가장 최근 적립</p>
            <p style={s.progressValue}>{mileageItems[0]?.changeAmount > 0 ? `+${mileageItems[0].changeAmount.toLocaleString()}P` : '0P'}</p>
            <p style={s.progressDesc}>{mileageItems[0]?.reason || '최근 적립 내역이 없습니다.'}</p>
          </article>
          <article style={s.progressCard}>
            <p style={s.progressLabel}>최근 쿠폰</p>
            <p style={s.progressValue}>{couponItems[0]?.couponName || '-'}</p>
            <p style={s.progressDesc}>{couponItems[0]?.expiredAt ? `${couponItems[0].expiredAt}까지 사용 가능` : '현재 발급된 쿠폰이 없습니다.'}</p>
          </article>
        </section>

        <section style={s.section}>
          <div style={s.sectionHead}>
            <div>
              <p style={s.sectionEyebrow}>GRADE GUIDE</p>
              <h2 style={s.sectionTitle}>회원 등급별 혜택</h2>
            </div>
            <Link to="/mypage" style={s.linkBtn}>마이페이지로 이동</Link>
          </div>
          <div style={s.gradeGrid}>
            {gradeGuide.map((item) => (
              <GradeCard key={item.code} item={item} active={item.code === activeGrade.code} />
            ))}
          </div>
        </section>

        <section style={s.split}>
          <article style={s.panel}>
            <div style={s.sectionHeadCompact}>
              <div>
                <p style={s.sectionEyebrow}>COUPONS</p>
                <h2 style={s.sectionTitle}>최근 쿠폰</h2>
              </div>
              <Link to="/coupons" style={s.ctaBtn}>쿠폰함 보기</Link>
            </div>
            <div style={s.stack}>
              {couponItems.slice(0, 2).map((coupon) => (
                <div key={coupon.couponNo} style={s.couponCard}>
                  <div>
                    <p style={s.couponTitle}>{coupon.couponName}</p>
                    <p style={s.couponMeta}>{coupon.discountLabel} · {coupon.maxDiscountLabel}</p>
                    <p style={s.couponScope}>{coupon.applyLabel}</p>
                  </div>
                  <div style={s.couponSide}>
                    <span style={s.couponStatus}>{coupon.status === 'ISSUED' ? '사용 가능' : '만료'}</span>
                    <span style={s.couponExpire}>{coupon.expiredAt}까지</span>
                    <Link to={buildCouponDestination(coupon)} style={s.couponLink}>사용하러 가기</Link>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article style={s.panel}>
            <div style={s.sectionHeadCompact}>
              <div>
                <p style={s.sectionEyebrow}>POINTS</p>
                <h2 style={s.sectionTitle}>최근 적립/사용</h2>
              </div>
              <Link to="/points" style={s.ctaBtn}>포인트함 보기</Link>
            </div>
            <div style={s.stack}>
              {mileageItems.map((item) => (
                <div key={item.mileageHistoryNo} style={s.mileageRow}>
                  <div>
                    <p style={s.mileageReason}>{item.reason}</p>
                    <p style={s.mileageDate}>{item.regDate}</p>
                  </div>
                  <div style={s.mileageSide}>
                    <div style={{ ...s.mileageAmount, color: item.changeAmount > 0 ? C.success : C.text }}>
                      {item.changeAmount > 0 ? '+' : ''}{item.changeAmount.toLocaleString()}P
                    </div>
                    <Link to={buildPointsDestination()} style={s.mileageLink}>사용하러 가기</Link>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

const s = {
  page: { background: 'linear-gradient(180deg, #FBF8F6 0%, #F4F0EE 100%)', minHeight: 'calc(100vh - 160px)', padding: '48px 24px 72px' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  hero: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.8fr)', gap: '18px', alignItems: 'stretch' },
  heroMain: { padding: '34px', borderRadius: '30px', background: 'linear-gradient(135deg, #FFF7F1 0%, #FFFFFF 50%, #F7F7FF 100%)', border: '1px solid #EEE3DE', boxShadow: '0 18px 42px rgba(15,23,42,0.06)' },
  heroAside: { display: 'flex' },
  snapshotCard: { width: '100%', padding: '28px', borderRadius: '30px', background: 'linear-gradient(145deg, #FFF1EE 0%, #F5E9E4 58%, #F3ECE9 100%)', color: C.text, border: '1px solid #E8DAD2', boxShadow: '0 18px 40px rgba(120,74,56,0.10)' },
  snapshotLabel: { margin: '0 0 12px', fontSize: '12px', letterSpacing: '0.12em', color: '#C75B5D', fontWeight: '800' },
  snapshotGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  snapshotValue: { margin: 0, fontSize: '22px', fontWeight: '800' },
  snapshotMeta: { margin: '6px 0 0', fontSize: '12px', color: '#8C6A63' },
  snapshotFoot: { margin: '18px 0 0', fontSize: '13px', color: '#9B5C37', fontWeight: '700' },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', letterSpacing: '0.14em', color: C.primary, fontWeight: '800' },
  title: { margin: '0 0 14px', fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.04, color: C.text, fontWeight: '800' },
  desc: { margin: 0, maxWidth: '700px', fontSize: '16px', lineHeight: 1.85, color: C.textSub },
  heroActions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' },
  primaryBtn: { display: 'inline-flex', padding: '12px 18px', borderRadius: '999px', textDecoration: 'none', color: '#fff', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', fontWeight: '800' },
  secondaryBtn: { display: 'inline-flex', padding: '12px 18px', borderRadius: '999px', textDecoration: 'none', color: C.text, background: '#fff', border: `1px solid ${C.border}`, fontWeight: '700' },
  progressSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  progressCard: { background: 'rgba(255,255,255,0.9)', border: '1px solid #EFE5DE', borderRadius: '22px', padding: '20px 22px' },
  progressLabel: { margin: '0 0 8px', fontSize: '12px', color: C.textLight, fontWeight: '800' },
  progressValue: { margin: '0 0 8px', fontSize: '24px', color: C.text, fontWeight: '800' },
  progressDesc: { margin: 0, fontSize: '13px', lineHeight: 1.7, color: C.textSub },
  section: { background: 'rgba(255,255,255,0.94)', borderRadius: '30px', padding: '28px', border: '1px solid #EEE4DE', boxShadow: '0 18px 40px rgba(15,23,42,0.05)' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  sectionHeadCompact: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
  sectionEyebrow: { margin: 0, fontSize: '12px', color: C.primary, fontWeight: '800', letterSpacing: '0.1em' },
  sectionTitle: { margin: '6px 0 0', fontSize: '26px', color: C.text, fontWeight: '800' },
  linkBtn: { padding: '10px 14px', borderRadius: '999px', textDecoration: 'none', color: C.text, background: '#F5F3F2', fontWeight: '700', fontSize: '14px' },
  ctaBtn: { padding: '10px 14px', borderRadius: '999px', textDecoration: 'none', color: '#fff', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', fontWeight: '800', fontSize: '13px' },
  gradeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  gradeCard: { border: '1px solid rgba(255,255,255,0.24)', borderRadius: '22px', padding: '22px', minHeight: '184px', transition: 'transform .18s ease, box-shadow .18s ease' },
  gradeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' },
  gradeBadge: { fontSize: '18px', fontWeight: '800' },
  gradeRate: { fontSize: '13px', fontWeight: '700' },
  activePill: { display: 'inline-block', marginBottom: '12px', padding: '5px 9px', borderRadius: '999px', background: 'rgba(255,255,255,0.72)', color: '#111827', fontSize: '11px', fontWeight: '800' },
  gradeCond: { margin: '0 0 10px', fontSize: '14px', lineHeight: 1.6 },
  gradeBenefit: { margin: 0, fontSize: '13px', lineHeight: 1.7 },
  split: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' },
  panel: { background: 'rgba(255,255,255,0.94)', borderRadius: '28px', padding: '24px', boxShadow: '0 18px 40px rgba(15,23,42,0.05)', border: '1px solid #EEE4DE' },
  stack: { display: 'flex', flexDirection: 'column', gap: '14px' },
  couponCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', border: '1px solid #EEE4DE', borderRadius: '18px', padding: '16px', background: '#FFFCFB' },
  couponTitle: { margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: C.text },
  couponMeta: { margin: '0 0 6px', fontSize: '13px', color: C.textSub },
  couponScope: { margin: 0, fontSize: '12px', color: C.primary, fontWeight: '800' },
  couponSide: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  couponStatus: { fontSize: '11px', fontWeight: '800', color: C.success, background: C.successBg, padding: '6px 8px', borderRadius: '999px' },
  couponExpire: { fontSize: '12px', color: C.textLight },
  couponLink: { fontSize: '12px', color: C.primary, textDecoration: 'none', fontWeight: '800' },
  mileageRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '1px solid #F0E6E1', paddingBottom: '12px' },
  mileageSide: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  mileageReason: { margin: 0, fontSize: '15px', fontWeight: '800', color: C.text },
  mileageDate: { margin: '6px 0 0', fontSize: '12px', color: C.textLight },
  mileageAmount: { fontSize: '16px', fontWeight: '800' },
  mileageLink: { fontSize: '12px', color: C.primary, textDecoration: 'none', fontWeight: '800' },
};
