import { Link } from 'react-router-dom';
import { getPromotionTarget, PROMOTION_ITEMS } from '../../mock/promotionData';
import { C, MAX_WIDTH } from '../../styles/tokens';

const promoStats = [
  { label: '진행 중 혜택', value: `${PROMOTION_ITEMS.length}개` },
  { label: '대표 카테고리', value: '국내 · 해외 숙소' },
  { label: '추천 유형', value: '쿠폰팩 · 오픈런 특가' },
];

export default function PromotionsPage() {
  const featuredPromotion = PROMOTION_ITEMS[0];

  // TODO(back-end):
  // GET /api/v1/promotions
  // response item example:
  // { slug, lead, title, subtitle, date, imageUrl, description, applyPath, applyLabel, exposureOrder }
  // applyPath / applyLabel이 서버에서 내려오면 현재 대표 CTA와 상세 링크 구조를 그대로 유지할 수 있다.
  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 980px) {
          .tz-promotion-hero {
            grid-template-columns: 1fr !important;
          }
          .tz-promotion-item {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <section style={s.hero}>
        <div style={s.inner}>
          <div style={s.heroShell} className="tz-promotion-hero">
            <div style={s.heroMain}>
              <p style={s.eyebrow}>PROMOTION HUB</p>
              <h1 style={s.title}>예약 직전 바로 쓰는
                <br />
                프로모션을 모았습니다.
              </h1>
              <p style={s.desc}>쿠폰팩, 오픈런 특가, 시즌 할인처럼 실제 예약으로 바로 이어지는 혜택만 모아 빠르게 비교할 수 있게 정리했습니다.</p>
              <div style={s.heroActions}>
                <Link to={getPromotionTarget(featuredPromotion)} style={s.primaryBtn}>대표 혜택 바로 보기</Link>
                <Link to="/events" style={s.secondaryBtn}>이벤트 보기</Link>
              </div>
            </div>

            <aside style={s.heroAside}>
              <div style={s.featureCard}>
                <div style={s.featureOrbWrap}>
                  <div style={{ ...s.featureOrb, background: featuredPromotion.circle }}>
                    <img src={featuredPromotion.imageUrl} alt={featuredPromotion.subtitle} style={s.featureOrbImage} />
                  </div>
                </div>
                <p style={s.featureLabel}>지금 가장 많이 보는 혜택</p>
                <h2 style={s.featureTitle}>{featuredPromotion.title}</h2>
                <p style={s.featureSub}>{featuredPromotion.subtitle}</p>
                <p style={s.featureDate}>{featuredPromotion.date}</p>
                <div style={s.featureChipRow}>
                  {featuredPromotion.highlights.slice(0, 2).map((item) => (
                    <span key={item.title} style={s.featureChip}>{item.title}</span>
                  ))}
                </div>
                <Link to={`/promotions/${featuredPromotion.slug}`} style={s.featureLink}>상세 보기</Link>
              </div>
            </aside>
          </div>

          <div style={s.statGrid}>
            {promoStats.map((item) => (
              <div key={item.label} style={s.statCard}>
                <p style={s.statLabel}>{item.label}</p>
                <p style={s.statValue}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.sectionHead}>
            <div>
              <p style={s.sectionEyebrow}>PROMOTION LIST</p>
              <h2 style={s.sectionTitle}>혜택 유형별로 고르기</h2>
            </div>
            <p style={s.sectionDesc}>쿠폰형 혜택과 한정 특가를 구분해서 바로 이동할 수 있게 구성했습니다.</p>
          </div>

          <div style={s.list}>
            {PROMOTION_ITEMS.map((item, index) => (
              <article key={item.slug} style={s.item} className="tz-promotion-item">
                <div style={s.body}>
                  <div style={s.metaRow}>
                    <span style={s.rankBadge}>#{String(index + 1).padStart(2, '0')}</span>
                    <span style={s.categoryBadge}>{item.subtitle}</span>
                  </div>
                  <p style={s.cardLead}>{item.lead}</p>
                  <h2 style={s.cardTitle}>{item.title}</h2>
                  <p style={s.cardSub}>{item.description}</p>
                  <div style={s.highlightRail}>
                    {item.highlights.slice(0, 2).map((highlight) => (
                      <span key={highlight.title} style={s.highlightChip}>{highlight.title}</span>
                    ))}
                  </div>
                  <div style={s.footerRow}>
                    <div>
                      <p style={s.footerLabel}>혜택 기간</p>
                      <p style={s.date}>{item.date}</p>
                    </div>
                    <div style={s.actionRow}>
                      <Link to={getPromotionTarget(item)} style={s.primaryBtn}>{
                        item.applyLabel
                      }</Link>
                      <Link to={`/promotions/${item.slug}`} style={s.secondaryLink}>자세히 보기</Link>
                    </div>
                  </div>
                </div>

                <div style={{ ...s.visualPanel, background: item.gradient }}>
                  <div style={{ ...s.thumbCircle, background: item.circle }}>
                    <img src={item.imageUrl} alt={item.subtitle} style={s.thumbImage} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const s = {
  page: { background: 'linear-gradient(180deg, #FBF8F6 0%, #F5F1EE 100%)', minHeight: 'calc(100vh - 160px)' },
  hero: { padding: '56px 24px 36px' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  heroShell: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 0.8fr)',
    gap: '20px',
    alignItems: 'stretch',
  },
  heroMain: {
    padding: '36px',
    borderRadius: '32px',
    background: 'linear-gradient(135deg, #FFF7F1 0%, #FFFFFF 48%, #F8F6FF 100%)',
    border: '1px solid #F0E6E1',
    boxShadow: '0 20px 48px rgba(15,23,42,0.06)',
  },
  heroAside: { display: 'flex' },
  featureCard: {
    width: '100%',
    padding: '28px',
    borderRadius: '32px',
    background: 'linear-gradient(145deg, #FFF2EE 0%, #F7E9E3 58%, #F4ECE9 100%)',
    color: C.text,
    border: '1px solid #EBD8D0',
    boxShadow: '0 18px 40px rgba(120,74,56,0.10)',
  },
  featureOrbWrap: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  featureOrb: { width: '92px', height: '92px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 16px 28px rgba(120,74,56,0.16)' },
  featureOrbImage: { width: '100%', height: '100%', objectFit: 'cover' },
  featureLabel: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: '#C75B5D' },
  featureTitle: { margin: '0 0 12px', fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.15, whiteSpace: 'pre-line' },
  featureSub: { margin: '0 0 12px', fontSize: '15px', lineHeight: 1.6, color: C.textSub, fontWeight: '700' },
  featureDate: { margin: '0 0 18px', fontSize: '13px', color: '#8C6A63', fontWeight: '700' },
  featureChipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' },
  featureChip: { display: 'inline-flex', padding: '8px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.68)', border: '1px solid #EAD7CF', color: C.text, fontSize: '12px', fontWeight: '800' },
  featureLink: { display: 'inline-flex', padding: '11px 16px', borderRadius: '999px', background: 'rgba(255,255,255,0.8)', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '800', border: '1px solid #E7D4CC' },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 14px', fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.04, fontWeight: '800', color: C.text },
  desc: { margin: 0, maxWidth: '680px', fontSize: '16px', lineHeight: 1.85, color: C.textSub },
  heroActions: { marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' },
  statGrid: { marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  statCard: { padding: '18px 20px', borderRadius: '22px', background: 'rgba(255,255,255,0.86)', border: '1px solid #EFE5E0' },
  statLabel: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.textLight },
  statValue: { margin: 0, fontSize: '18px', fontWeight: '800', color: C.text },
  section: { padding: '18px 24px 64px' },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'end',
    flexWrap: 'wrap',
    marginBottom: '22px',
  },
  sectionEyebrow: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: C.primary },
  sectionTitle: { margin: 0, fontSize: '30px', fontWeight: '800', color: C.text },
  sectionDesc: { margin: 0, maxWidth: '420px', fontSize: '14px', lineHeight: 1.7, color: C.textSub },
  list: { display: 'grid', gap: '18px' },
  item: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(200px, 280px)',
    gap: '18px',
    alignItems: 'stretch',
    padding: '18px',
    borderRadius: '30px',
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid #EEE4DE',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  body: { minWidth: 0, padding: '12px 10px 12px 12px' },
  metaRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' },
  rankBadge: { display: 'inline-flex', padding: '7px 11px', borderRadius: '999px', background: '#FFF1F1', color: C.primary, fontSize: '11px', fontWeight: '800' },
  categoryBadge: { display: 'inline-flex', padding: '7px 11px', borderRadius: '999px', background: '#F4F4F5', color: C.text, fontSize: '11px', fontWeight: '800' },
  cardLead: { margin: '0 0 8px', fontSize: '13px', fontWeight: '800', color: C.primary },
  cardTitle: { margin: '0 0 12px', fontSize: 'clamp(26px, 3.6vw, 38px)', lineHeight: 1.06, color: C.text, whiteSpace: 'pre-line' },
  cardSub: { margin: 0, fontSize: '15px', lineHeight: 1.8, color: C.textSub, maxWidth: '720px' },
  highlightRail: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' },
  highlightChip: { display: 'inline-flex', padding: '10px 14px', borderRadius: '999px', background: '#F8F5F2', color: C.text, fontSize: '13px', fontWeight: '700' },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '18px',
    alignItems: 'end',
    flexWrap: 'wrap',
    marginTop: '22px',
    paddingTop: '18px',
    borderTop: '1px solid #F1E7E0',
  },
  footerLabel: { margin: '0 0 6px', fontSize: '12px', fontWeight: '800', color: C.textLight },
  date: { margin: 0, fontSize: '14px', color: C.text, fontWeight: '700' },
  actionRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  primaryBtn: { display: 'inline-flex', padding: '12px 18px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '800' },
  secondaryLink: { display: 'inline-flex', padding: '12px 2px', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '800' },
  secondaryBtn: { display: 'inline-flex', padding: '12px 18px', borderRadius: '999px', border: `1px solid ${C.border}`, background: '#fff', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '700' },
  visualPanel: {
    minHeight: '240px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  thumbCircle: { width: '150px', height: '150px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 18px 34px rgba(15,23,42,0.08)' },
  thumbImage: { width: '100%', height: '100%', objectFit: 'cover' },
};
