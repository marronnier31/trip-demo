import { Link, useParams, useSearchParams } from 'react-router-dom';
import { OVERSEAS_LODGINGS } from '../../mock/overseasMockData';
import { getBenefitScopeLabel } from '../../utils/benefitNavigation';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function OverseasLodgingDetailPage() {
  const { lodgingId } = useParams();
  const [params] = useSearchParams();
  const benefit = params.get('benefit') || '';
  const scope = params.get('scope') || '';
  const isCouponEntry = benefit === 'coupon' && scope === 'overseas';
  const lodging = OVERSEAS_LODGINGS.find((item) => String(item.lodgingId) === String(lodgingId));
  const recommendedLodgings = OVERSEAS_LODGINGS.filter((item) => item.lodgingId !== lodging?.lodgingId)
    .filter((item) => item.country === lodging?.country || item.tags.some((tag) => lodging?.tags.includes(tag)))
    .slice(0, 3);

  if (!lodging) {
    return (
      <div style={s.page}>
        <div style={s.inner}>
          <div style={s.emptyCard}>
            <p style={s.emptyEyebrow}>OVERSEAS STAY</p>
            <h1 style={s.emptyTitle}>숙소를 찾을 수 없습니다.</h1>
            <p style={s.emptyDesc}>존재하지 않거나 현재 노출되지 않는 해외숙소입니다.</p>
            <Link to="/overseas" style={s.primaryBtn}>해외숙소 목록 보기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.inner}>
          <div style={s.heroGrid}>
            <img src={lodging.imageUrl} alt={lodging.name} style={s.heroImage} />
            <div>
              {isCouponEntry ? (
                <div style={s.benefitBanner}>
                  <p style={s.benefitEyebrow}>COUPON ENTRY</p>
                  <p style={s.benefitTitle}>{getBenefitScopeLabel(scope)}</p>
                </div>
              ) : null}
              <p style={s.location}>{lodging.country} · {lodging.city} · {lodging.district}</p>
              <h1 style={s.title}>{lodging.name}</h1>
              <p style={s.meta}>★ {lodging.rating} · 1박 {lodging.pricePerNight.toLocaleString()}원부터</p>
              <div style={s.tagRow}>
                {lodging.tags.map((tag) => (
                  <span key={tag} style={s.tag}>{tag}</span>
                ))}
              </div>
              <p style={s.desc}>
                {isCouponEntry
                  ? '해외 쿠폰이 적용 가능한 숙소를 중심으로 혜택과 예약 조건을 확인할 수 있습니다.'
                  : '객실 구성, 취소 규정, 세금 안내, 혜택 정보를 한 화면에서 확인할 수 있도록 정리했습니다.'}
              </p>
              <div style={s.summaryStrip}>
                <div style={s.summaryPill}>
                  <span style={s.summaryPillLabel}>{isCouponEntry ? '현재 진입 상태' : '예약 혜택'}</span>
                  <strong style={s.summaryPillValue}>{isCouponEntry ? '해외 쿠폰 적용 보기' : '포인트 적립 가능'}</strong>
                </div>
                <div style={s.summaryPill}>
                  <span style={s.summaryPillLabel}>{isCouponEntry ? '다음 단계' : '추천 흐름'}</span>
                  <strong style={s.summaryPillValue}>{isCouponEntry ? '예약 단계 할인 계산' : '프로모션 확인 후 예약'}</strong>
                </div>
              </div>
              <div style={s.actions}>
                {isCouponEntry ? (
                  <>
                    <Link to="/coupons" style={s.secondaryBtn}>다른 쿠폰 보기</Link>
                    <Link to="/overseas?benefit=coupon&scope=overseas" style={s.primaryBtn}>쿠폰 적용 숙소 더 보기</Link>
                  </>
                ) : (
                  <>
                    <Link to="/points" style={s.secondaryBtn}>포인트함 보기</Link>
                    <Link to="/promotions" style={s.primaryBtn}>프로모션 보기</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={s.detailGrid}>
            <article style={s.infoCard}>
              <p style={s.cardEyebrow}>ROOM GUIDE</p>
              <h2 style={s.cardTitle}>객실 안내</h2>
              <div style={s.roomList}>
                <div style={s.roomRow}>
                  <div>
                    <p style={s.roomName}>스탠다드 더블</p>
                    <p style={s.roomMeta}>2인 기준 · 시티뷰 · 무료 Wi‑Fi</p>
                  </div>
                  <strong style={s.roomPrice}>{lodging.pricePerNight.toLocaleString()}원</strong>
                </div>
                <div style={s.roomRow}>
                  <div>
                    <p style={s.roomName}>디럭스 트윈</p>
                    <p style={s.roomMeta}>3인 가능 · 조식 선택 · 넓은 객실</p>
                  </div>
                  <strong style={s.roomPrice}>{(lodging.pricePerNight + 42000).toLocaleString()}원</strong>
                </div>
              </div>
            </article>

            <article style={s.infoCard}>
              <p style={s.cardEyebrow}>POLICY</p>
              <h2 style={s.cardTitle}>취소 및 체크인 안내</h2>
              <ul style={s.policyList}>
                <li style={s.policyItem}>체크인 7일 전까지 무료 취소</li>
                <li style={s.policyItem}>체크인 3일 전부터 1박 요금 부과 가능</li>
                <li style={s.policyItem}>현지 사정에 따라 세금/리조트피가 추가될 수 있음</li>
              </ul>
            </article>

            <article style={s.infoCard}>
              <p style={s.cardEyebrow}>BENEFIT</p>
              <h2 style={s.cardTitle}>혜택 적용 안내</h2>
              <div style={s.benefitGuideBox}>
                <p style={s.benefitGuideTitle}>
                  {isCouponEntry
                    ? '현재 해외 쿠폰 적용 가능 숙소 상세를 보고 있습니다.'
                    : '현재 페이지는 일반 숙소 탐색 진입 상태입니다.'}
                </p>
                <p style={s.benefitGuideDesc}>
                  {isCouponEntry
                    ? '해외 쿠폰 사용 가능 여부와 예상 할인 금액을 확인한 뒤 예약 단계로 이어갈 수 있습니다.'
                    : '포인트 적립과 진행 중인 프로모션을 함께 보고 예약 흐름을 이어갈 수 있습니다.'}
                </p>
                <div style={s.benefitGuideList}>
                  <div style={s.benefitGuideItem}>
                    <span style={s.benefitGuideItemLabel}>{isCouponEntry ? '쿠폰 상태' : '포인트 적립'}</span>
                    <strong style={s.benefitGuideItemValue}>{isCouponEntry ? '숙소별 조건 확인' : '등급 기준 적립 예정'}</strong>
                  </div>
                  <div style={s.benefitGuideItem}>
                    <span style={s.benefitGuideItemLabel}>{isCouponEntry ? '예약 연결' : '추천 동선'}</span>
                    <strong style={s.benefitGuideItemValue}>{isCouponEntry ? '할인 적용 예약 단계' : '프로모션 확인 후 예약'}</strong>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <section style={s.recommendSection}>
            <div style={s.recommendHead}>
              <div>
                <p style={s.cardEyebrow}>RECOMMENDED STAYS</p>
                <h2 style={s.cardTitle}>함께 보면 좋은 해외숙소</h2>
              </div>
              <Link to={lodging.country ? `/overseas?country=${encodeURIComponent(lodging.country)}` : '/overseas'} style={s.secondaryBtn}>
                같은 국가 더 보기
              </Link>
            </div>

            <div style={s.recommendGrid}>
              {recommendedLodgings.map((item) => (
                <Link
                  key={item.lodgingId}
                  to={`/overseas/${item.lodgingId}${benefit ? `?benefit=${benefit}&scope=${scope}` : ''}`}
                  style={s.recommendCard}
                >
                  <img src={item.imageUrl} alt={item.name} style={s.recommendImage} />
                  <div style={s.recommendBody}>
                    <p style={s.recommendLocation}>{item.country} · {item.city}</p>
                    <h3 style={s.recommendTitle}>{item.name}</h3>
                    <p style={s.recommendMeta}>★ {item.rating} · 1박 {item.pricePerNight.toLocaleString()}원부터</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

const s = {
  page: { background: '#F9F7F5', minHeight: 'calc(100vh - 160px)' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  hero: { padding: '48px 24px 72px' },
  heroGrid: { display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '28px', alignItems: 'start' },
  heroImage: { width: '100%', height: '440px', objectFit: 'cover', borderRadius: '28px', boxShadow: '0 18px 34px rgba(15,23,42,0.08)' },
  benefitBanner: { display: 'inline-flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', borderRadius: '16px', background: '#FFF1F1', marginBottom: '14px' },
  benefitEyebrow: { margin: 0, fontSize: '11px', fontWeight: '800', color: C.primary, letterSpacing: '0.08em' },
  benefitTitle: { margin: 0, fontSize: '13px', fontWeight: '800', color: C.text },
  location: { margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: C.textSub },
  title: { margin: '0 0 12px', fontSize: 'clamp(30px, 4vw, 46px)', lineHeight: 1.08, color: C.text, letterSpacing: '-0.03em' },
  meta: { margin: '0 0 14px', fontSize: '15px', color: C.textSub, fontWeight: '700' },
  tagRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
  tag: { display: 'inline-flex', padding: '7px 10px', borderRadius: '999px', background: '#F4F4F5', color: '#52525B', fontSize: '12px', fontWeight: '700' },
  desc: { margin: 0, fontSize: '15px', lineHeight: 1.8, color: C.textSub },
  summaryStrip: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' },
  summaryPill: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 14px', borderRadius: '16px', background: '#fff', border: `1px solid ${C.borderLight}` },
  summaryPillLabel: { fontSize: '11px', fontWeight: '800', color: C.textLight },
  summaryPillValue: { fontSize: '13px', fontWeight: '800', color: C.text },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginTop: '24px' },
  recommendSection: { marginTop: '28px' },
  recommendHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' },
  recommendGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  recommendCard: { display: 'block', textDecoration: 'none', background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' },
  recommendImage: { width: '100%', height: '180px', objectFit: 'cover' },
  recommendBody: { padding: '16px 16px 18px' },
  recommendLocation: { margin: '0 0 8px', fontSize: '12px', color: C.textSub, fontWeight: '700' },
  recommendTitle: { margin: '0 0 8px', fontSize: '18px', color: C.text, fontWeight: '800' },
  recommendMeta: { margin: 0, fontSize: '13px', color: C.textSub },
  infoCard: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '22px', padding: '22px', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' },
  cardEyebrow: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.primary, letterSpacing: '0.08em' },
  cardTitle: { margin: '0 0 14px', fontSize: '22px', fontWeight: '800', color: C.text },
  roomList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  roomRow: { display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', border: `1px solid ${C.borderLight}`, borderRadius: '16px', padding: '14px 16px' },
  roomName: { margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: C.text },
  roomMeta: { margin: 0, fontSize: '13px', color: C.textSub, lineHeight: 1.6 },
  roomPrice: { fontSize: '15px', color: C.text, fontWeight: '800' },
  policyList: { margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' },
  policyItem: { fontSize: '14px', lineHeight: 1.7, color: C.textSub },
  benefitGuideBox: { borderRadius: '18px', background: '#FFF7F7', border: `1px solid #F4D6D7`, padding: '16px' },
  benefitGuideTitle: { margin: '0 0 8px', fontSize: '15px', fontWeight: '800', color: C.text },
  benefitGuideDesc: { margin: 0, fontSize: '13px', lineHeight: 1.7, color: C.textSub },
  benefitGuideList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '14px' },
  benefitGuideItem: { borderRadius: '14px', background: '#fff', border: `1px solid ${C.borderLight}`, padding: '12px' },
  benefitGuideItemLabel: { display: 'block', marginBottom: '6px', fontSize: '11px', color: C.textLight, fontWeight: '800' },
  benefitGuideItemValue: { fontSize: '13px', color: C.text, fontWeight: '800' },
  primaryBtn: { display: 'inline-flex', padding: '13px 20px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontWeight: '800', fontSize: '14px' },
  secondaryBtn: { display: 'inline-flex', padding: '13px 20px', borderRadius: '999px', background: '#fff', color: C.text, textDecoration: 'none', fontWeight: '700', fontSize: '14px', border: `1px solid ${C.border}` },
  emptyCard: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '24px', padding: '52px 28px', textAlign: 'center', marginTop: '48px' },
  emptyEyebrow: { margin: '0 0 10px', fontSize: '12px', fontWeight: '800', color: C.primary },
  emptyTitle: { margin: '0 0 10px', fontSize: '32px', fontWeight: '800', color: C.text },
  emptyDesc: { margin: '0 0 20px', fontSize: '15px', color: C.textSub, lineHeight: 1.7 },
};
