import { Link, useParams } from 'react-router-dom';
import { getPromotionTarget, PROMOTION_ITEMS, findPromotionBySlug } from '../../mock/promotionData';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function PromotionDetailPage() {
  const { promotionSlug } = useParams();
  const promotion = findPromotionBySlug(promotionSlug);
  const promotionTarget = getPromotionTarget(promotion);

  // TODO(back-end):
  // GET /api/v1/promotions/{promotionSlug}
  // response example:
  // { slug, title, subtitle, date, description, applyPath, applyLabel, highlights[] }
  // applyPath / applyLabel / highlights 배열만 내려주면 현재 상세 흐름을 그대로 재사용할 수 있다.

  if (!promotion) {
    return (
      <div style={s.page}>
        <div style={s.inner}>
          <div style={s.emptyCard}>
            <p style={s.emptyEyebrow}>PROMOTION DETAIL</p>
            <h1 style={s.emptyTitle}>프로모션을 찾을 수 없습니다.</h1>
            <p style={s.emptyDesc}>존재하지 않거나 종료된 프로모션일 수 있습니다. 다른 프로모션을 확인해 주세요.</p>
            <Link to="/promotions" style={s.primaryBtn}>프로모션 목록 보기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <section style={{ ...s.hero, background: promotion.gradient }}>
        <div style={s.inner}>
          <div style={s.heroShell}>
            <div style={s.heroMain}>
              <p style={s.eyebrow}>{promotion.lead}</p>
              <h1 style={s.title}>{promotion.title}</h1>
              <p style={s.subtitle}>{promotion.subtitle}</p>
              <p style={s.desc}>{promotion.description}</p>
              <div style={s.heroActions}>
                <Link to={promotionTarget} style={s.primaryBtn}>{promotion.applyLabel || '적용 숙소 보기'}</Link>
                <Link to="/promotions" style={s.secondaryBtn}>목록으로</Link>
              </div>
            </div>

            <aside style={s.heroAside}>
              <div style={s.summaryCard}>
                <div style={{ ...s.heroCircle, background: promotion.circle }}>
                  <img src={promotion.imageUrl} alt={promotion.subtitle} style={s.heroImage} />
                </div>
                <div style={s.summaryList}>
                  <div style={s.summaryRow}>
                    <span style={s.summaryLabel}>혜택 기간</span>
                    <span style={s.summaryText}>{promotion.date}</span>
                  </div>
                  <div style={s.summaryRow}>
                    <span style={s.summaryLabel}>혜택 성격</span>
                    <span style={s.summaryText}>{promotion.subtitle}</span>
                  </div>
                  <div style={s.summaryRow}>
                    <span style={s.summaryLabel}>이동 경로</span>
                    <span style={s.summaryText}>{promotion.applyLabel}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.contentGrid}>
            <div style={s.storyCard}>
              <p style={s.sectionEyebrow}>PROMOTION GUIDE</p>
              <h2 style={s.sectionTitle}>이 혜택이 좋은 이유</h2>
              <p style={s.storyDesc}>{promotion.description}</p>
              <div style={s.tipGrid}>
                {promotion.highlights.map((item, index) => (
                  <article key={item.title} style={s.tipCard}>
                    <p style={s.tipIndex}>POINT {String(index + 1).padStart(2, '0')}</p>
                    <h3 style={s.tipTitle}>{item.title}</h3>
                    <p style={s.tipDesc}>{item.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div style={s.moreSection}>
            <div style={s.moreHead}>
              <div>
                <p style={s.sectionEyebrow}>MORE PROMOTIONS</p>
                <h2 style={s.moreTitle}>같이 보면 좋은 혜택</h2>
              </div>
            </div>
            <div style={s.moreList}>
              {PROMOTION_ITEMS.filter((item) => item.slug !== promotion.slug).slice(0, 3).map((item) => (
                <Link key={item.slug} to={`/promotions/${item.slug}`} style={s.moreCard}>
                  <p style={s.moreLead}>{item.lead}</p>
                  <h3 style={s.moreCardTitle}>{item.title}</h3>
                  <p style={s.moreDate}>{item.date}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const s = {
  page: { background: 'linear-gradient(180deg, #FBF8F6 0%, #F5F1EE 100%)', minHeight: 'calc(100vh - 160px)' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  hero: { padding: '56px 24px 36px', borderBottom: '1px solid #EEE5E0' },
  heroShell: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.8fr)',
    gap: '20px',
    alignItems: 'stretch',
  },
  heroMain: {
    padding: '36px',
    borderRadius: '32px',
    background: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(255,255,255,0.76)',
    boxShadow: '0 20px 48px rgba(15,23,42,0.06)',
  },
  heroAside: { display: 'flex' },
  summaryCard: {
    width: '100%',
    padding: '28px',
    borderRadius: '32px',
    background: 'linear-gradient(145deg, #FFF3EE 0%, #F6E8E0 58%, #F4ECE8 100%)',
    color: C.text,
    border: '1px solid #EAD9D0',
    boxShadow: '0 18px 40px rgba(120,74,56,0.10)',
  },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 14px', fontSize: 'clamp(34px, 4.4vw, 52px)', lineHeight: 1.04, whiteSpace: 'pre-line', color: C.text },
  subtitle: { margin: '0 0 14px', fontSize: '16px', color: C.text, fontWeight: '800' },
  desc: { margin: 0, maxWidth: '720px', fontSize: '16px', lineHeight: 1.85, color: C.textSub },
  heroActions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' },
  heroCircle: { width: '148px', height: '148px', margin: '0 auto 22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 18px 36px rgba(15,23,42,0.18)' },
  heroImage: { width: '100%', height: '100%', objectFit: 'cover' },
  summaryList: { display: 'grid', gap: '12px' },
  summaryRow: { display: 'grid', gap: '6px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.12)' },
  summaryLabel: { fontSize: '12px', color: '#C75B5D', fontWeight: '800' },
  summaryText: { fontSize: '15px', lineHeight: 1.6, color: C.text, fontWeight: '700' },
  section: { padding: '28px 24px 64px' },
  contentGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '20px', alignItems: 'start' },
  storyCard: {
    padding: '30px',
    borderRadius: '30px',
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid #EEE4DE',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  sectionEyebrow: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: C.primary },
  sectionTitle: { margin: '0 0 12px', fontSize: '30px', fontWeight: '800', color: C.text },
  storyDesc: { margin: '0 0 22px', fontSize: '15px', lineHeight: 1.8, color: C.textSub },
  tipGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' },
  tipCard: { padding: '20px', borderRadius: '24px', background: '#FAF6F2', border: '1px solid #F0E7E0' },
  tipIndex: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.primary },
  tipTitle: { margin: '0 0 10px', fontSize: '18px', fontWeight: '800', color: C.text },
  tipDesc: { margin: 0, fontSize: '14px', lineHeight: 1.75, color: C.textSub },
  moreSection: { marginTop: '28px' },
  moreHead: { marginBottom: '14px' },
  moreTitle: { margin: 0, fontSize: '28px', fontWeight: '800', color: C.text },
  moreList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' },
  moreCard: { display: 'block', padding: '20px', borderRadius: '24px', background: '#fff', border: '1px solid #EEE4DE', textDecoration: 'none', boxShadow: '0 14px 30px rgba(15,23,42,0.04)' },
  moreLead: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.primary },
  moreCardTitle: { margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: C.text, whiteSpace: 'pre-line' },
  moreDate: { margin: 0, fontSize: '13px', color: C.textLight, fontWeight: '700' },
  primaryBtn: { display: 'inline-flex', padding: '12px 18px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontWeight: '800', fontSize: '14px' },
  secondaryBtn: { display: 'inline-flex', padding: '12px 18px', borderRadius: '999px', background: '#fff', color: C.text, textDecoration: 'none', fontWeight: '700', fontSize: '14px', border: `1px solid ${C.border}` },
  emptyCard: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '24px', padding: '52px 28px', textAlign: 'center', marginTop: '48px' },
  emptyEyebrow: { margin: '0 0 10px', fontSize: '12px', fontWeight: '800', color: C.primary },
  emptyTitle: { margin: '0 0 10px', fontSize: '32px', fontWeight: '800', color: C.text },
  emptyDesc: { margin: '0 0 20px', fontSize: '15px', color: C.textSub, lineHeight: 1.7 },
};
