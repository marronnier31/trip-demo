import { Link } from 'react-router-dom';
import { benefitSnapshot, couponItems } from '../../mock/benefitsData';
import { C, MAX_WIDTH } from '../../styles/tokens';
import { buildCouponDestination } from '../../utils/benefitNavigation';

function formatWon(value) {
  return `${Number(value || 0).toLocaleString()}원`;
}

export default function CouponsPage() {
  // TODO(back-end): /api/v1/me/coupons 응답으로 교체하고, 쿠폰별 적용 가능 카테고리/국내·해외 조건을 함께 연결한다.
  const availableCoupons = couponItems.filter((coupon) => coupon.status === 'ISSUED');
  const expiredCoupons = couponItems.filter((coupon) => coupon.status !== 'ISSUED');
  const strongestCoupon = availableCoupons.reduce((best, current) => {
    const bestAmount = best?.maxDiscountAmount || 0;
    return (current.maxDiscountAmount || 0) > bestAmount ? current : best;
  }, null);

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <section style={s.hero}>
          <div style={s.heroMain}>
            <p style={s.eyebrow}>MY COUPON WALLET</p>
            <h1 style={s.title}>지금 바로 쓸 수 있는
              <br />
              쿠폰만 모아봤어요.
            </h1>
            <p style={s.desc}>보유 중인 쿠폰을 할인 규모, 적용 범위, 만료일 기준으로 빠르게 확인하고 바로 숙소 탐색으로 이어질 수 있게 정리했습니다.</p>
            <div style={s.heroActions}>
              <Link to="/benefits" style={s.secondaryBtn}>등급 혜택 보기</Link>
              <Link to="/lodgings" style={s.primaryBtn}>국내 숙소 보러 가기</Link>
            </div>
          </div>

          <aside style={s.heroAside}>
            <div style={s.walletCard}>
              <p style={s.walletLabel}>가장 큰 할인</p>
              <h2 style={s.walletValue}>{strongestCoupon ? strongestCoupon.maxDiscountLabel : '보유 쿠폰 없음'}</h2>
              <p style={s.walletDesc}>{strongestCoupon ? strongestCoupon.couponName : '새 쿠폰이 발급되면 이곳에 표시됩니다.'}</p>
              <div style={s.walletMeta}>
                <div>
                  <p style={s.walletMetaLabel}>사용 가능</p>
                  <p style={s.walletMetaValue}>{availableCoupons.length}장</p>
                </div>
                <div>
                  <p style={s.walletMetaLabel}>현재 등급</p>
                  <p style={s.walletMetaValue}>{benefitSnapshot.currentGrade}</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section style={s.summaryGrid}>
          <article style={s.summaryCard}>
            <p style={s.summaryLabel}>사용 가능 쿠폰</p>
            <p style={s.summaryValue}>{availableCoupons.length}장</p>
            <p style={s.summaryDesc}>오늘 바로 사용할 수 있는 쿠폰 기준입니다.</p>
          </article>
          <article style={s.summaryCard}>
            <p style={s.summaryLabel}>최대 할인</p>
            <p style={s.summaryValue}>{formatWon(Math.max(...availableCoupons.map((coupon) => coupon.maxDiscountAmount || 0), 0))}</p>
            <p style={s.summaryDesc}>현재 보유 쿠폰 중 가장 큰 할인 금액입니다.</p>
          </article>
          <article style={s.summaryCard}>
            <p style={s.summaryLabel}>만료 임박</p>
            <p style={s.summaryValue}>{availableCoupons[0]?.expiredAt || '-'}</p>
            <p style={s.summaryDesc}>가장 먼저 확인해야 할 사용 기한입니다.</p>
          </article>
        </section>

        <section style={s.section}>
          <div style={s.sectionHead}>
            <div>
              <p style={s.sectionEyebrow}>AVAILABLE</p>
              <h2 style={s.sectionTitle}>사용 가능한 쿠폰</h2>
            </div>
            <Link to="/overseas" style={s.sectionAction}>해외 숙소 둘러보기</Link>
          </div>

          <div style={s.list}>
            {availableCoupons.map((coupon) => (
              <article key={coupon.couponNo} style={s.ticketCard}>
                <div style={s.ticketMain}>
                  <div style={s.ticketTop}>
                    <span style={s.channelBadge}>{coupon.channel}</span>
                    <span style={s.statusBadge}>사용 가능</span>
                  </div>
                  <h3 style={s.ticketTitle}>{coupon.couponName}</h3>
                  <p style={s.ticketDiscount}>{coupon.discountLabel}</p>
                  <p style={s.ticketSub}>{coupon.maxDiscountLabel} · {formatWon(coupon.minOrderAmount)} 이상 결제 시 적용</p>
                  <div style={s.ticketInfoRow}>
                    <div>
                      <p style={s.infoLabel}>적용 범위</p>
                      <p style={s.infoValue}>{coupon.applyLabel}</p>
                    </div>
                    <div>
                      <p style={s.infoLabel}>사용 기한</p>
                      <p style={s.infoValue}>{coupon.expiredAt}</p>
                    </div>
                  </div>
                </div>

                <div style={s.ticketSide}>
                  <div style={s.discountBubble}>
                    <span style={s.discountBubbleLabel}>혜택</span>
                    <strong style={s.discountBubbleValue}>{coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : formatWon(coupon.discountValue)}</strong>
                  </div>
                  <Link to={buildCouponDestination(coupon)} style={s.ticketBtn}>사용하러 가기</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {expiredCoupons.length ? (
          <section style={s.archiveSection}>
            <div style={s.sectionHead}>
              <div>
                <p style={s.sectionEyebrow}>ARCHIVE</p>
                <h2 style={s.sectionTitle}>지난 쿠폰</h2>
              </div>
            </div>
            <div style={s.archiveList}>
              {expiredCoupons.map((coupon) => (
                <article key={coupon.couponNo} style={s.archiveCard}>
                  <div>
                    <p style={s.archiveTitle}>{coupon.couponName}</p>
                    <p style={s.archiveDesc}>{coupon.discountLabel} · {coupon.maxDiscountLabel}</p>
                  </div>
                  <div style={s.archiveMeta}>
                    <span style={s.archiveBadge}>만료</span>
                    <span style={s.archiveDate}>{coupon.expiredAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const s = {
  page: { background: 'linear-gradient(180deg, #FBF8F6 0%, #F5F1EE 100%)', minHeight: 'calc(100vh - 160px)', padding: '48px 24px 72px' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  hero: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.8fr)', gap: '18px', alignItems: 'stretch' },
  heroMain: { padding: '34px', borderRadius: '30px', background: 'linear-gradient(135deg, #FFF7F1 0%, #FFFFFF 50%, #F7F5FF 100%)', border: '1px solid #EFE3DD', boxShadow: '0 18px 42px rgba(15,23,42,0.06)' },
  heroAside: { display: 'flex' },
  walletCard: { width: '100%', padding: '28px', borderRadius: '30px', background: 'linear-gradient(145deg, #FFF2EE 0%, #F7E9E3 58%, #F4ECE9 100%)', color: C.text, border: '1px solid #EBD8D0', boxShadow: '0 18px 40px rgba(120,74,56,0.10)' },
  walletLabel: { margin: '0 0 10px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: '#C75B5D' },
  walletValue: { margin: '0 0 10px', fontSize: 'clamp(26px, 3vw, 36px)', lineHeight: 1.1 },
  walletDesc: { margin: '0 0 18px', fontSize: '14px', lineHeight: 1.7, color: C.textSub },
  walletMeta: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  walletMetaLabel: { margin: '0 0 6px', fontSize: '12px', color: '#8C6A63', fontWeight: '700' },
  walletMetaValue: { margin: 0, fontSize: '17px', color: C.text, fontWeight: '800' },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 14px', fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.04, color: C.text, fontWeight: '800' },
  desc: { margin: 0, maxWidth: '700px', fontSize: '16px', lineHeight: 1.85, color: C.textSub },
  heroActions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', padding: '12px 18px', borderRadius: '999px', textDecoration: 'none', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', fontWeight: '800' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', padding: '12px 18px', borderRadius: '999px', textDecoration: 'none', border: `1px solid ${C.border}`, background: '#fff', color: C.text, fontWeight: '700' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  summaryCard: { background: 'rgba(255,255,255,0.9)', border: '1px solid #EFE4DD', borderRadius: '22px', padding: '20px 22px' },
  summaryLabel: { margin: 0, fontSize: '12px', color: C.textLight, fontWeight: '800' },
  summaryValue: { margin: '10px 0 8px', fontSize: '26px', color: C.text, fontWeight: '800' },
  summaryDesc: { margin: 0, fontSize: '13px', lineHeight: 1.7, color: C.textSub },
  section: { padding: '26px', borderRadius: '30px', background: 'rgba(255,255,255,0.94)', border: '1px solid #EEE4DE', boxShadow: '0 18px 40px rgba(15,23,42,0.05)' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' },
  sectionEyebrow: { margin: '0 0 8px', fontSize: '12px', color: C.primary, fontWeight: '800', letterSpacing: '0.1em' },
  sectionTitle: { margin: 0, fontSize: '28px', color: C.text, fontWeight: '800' },
  sectionAction: { display: 'inline-flex', padding: '11px 15px', borderRadius: '999px', textDecoration: 'none', color: '#fff', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', fontWeight: '800', fontSize: '13px' },
  list: { display: 'grid', gap: '14px' },
  ticketCard: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 180px', gap: '18px', padding: '20px', borderRadius: '24px', border: '1px solid #EEE5DF', background: '#FFFDFC' },
  ticketMain: { minWidth: 0 },
  ticketTop: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
  channelBadge: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: '800' },
  statusBadge: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: C.successBg, color: C.success, fontSize: '11px', fontWeight: '800' },
  ticketTitle: { margin: '0 0 8px', fontSize: '24px', color: C.text, fontWeight: '800' },
  ticketDiscount: { margin: '0 0 8px', fontSize: '17px', color: C.primary, fontWeight: '800' },
  ticketSub: { margin: '0 0 18px', fontSize: '14px', lineHeight: 1.7, color: C.textSub },
  ticketInfoRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', paddingTop: '16px', borderTop: '1px dashed #EADFD8' },
  infoLabel: { margin: '0 0 5px', fontSize: '12px', color: C.textLight, fontWeight: '800' },
  infoValue: { margin: 0, fontSize: '14px', color: C.text, fontWeight: '700' },
  ticketSide: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', gap: '14px' },
  discountBubble: { padding: '18px 16px', borderRadius: '22px', background: 'linear-gradient(135deg, #FFF1F1 0%, #FFF8F8 100%)', textAlign: 'center' },
  discountBubbleLabel: { display: 'block', marginBottom: '6px', fontSize: '12px', color: C.textLight, fontWeight: '800' },
  discountBubbleValue: { fontSize: '24px', color: C.primary, fontWeight: '800' },
  ticketBtn: { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: '128px', padding: '13px 16px', borderRadius: '14px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontWeight: '800', fontSize: '13px' },
  archiveSection: { padding: '24px 26px', borderRadius: '28px', background: 'rgba(255,255,255,0.72)', border: '1px solid #EDE4DD' },
  archiveList: { display: 'grid', gap: '12px' },
  archiveCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', padding: '18px 20px', borderRadius: '20px', background: '#F7F3F0', border: '1px solid #E8DED7' },
  archiveTitle: { margin: '0 0 6px', fontSize: '16px', color: '#666', fontWeight: '700' },
  archiveDesc: { margin: 0, fontSize: '13px', color: '#8A8A8A' },
  archiveMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  archiveBadge: { display: 'inline-flex', padding: '6px 8px', borderRadius: '999px', background: '#ECECEC', color: '#777', fontSize: '11px', fontWeight: '800' },
  archiveDate: { fontSize: '12px', color: '#8A8A8A' },
};
