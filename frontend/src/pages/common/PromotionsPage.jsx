import { Link } from 'react-router-dom';
import { getPromotionTarget, PROMOTION_ITEMS } from '../../mock/promotionData';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function PromotionsPage() {
  // TODO(back-end):
  // GET /api/v1/promotions
  // response item example:
  // { slug, lead, title, subtitle, date, imageUrl, description, applyPath, applyLabel, exposureOrder }
  // applyPath / applyLabel이 서버에서 내려오면 현재 대표 CTA와 상세 링크 구조를 그대로 유지할 수 있다.
  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>PROMOTION HUB</p>
          <h1 style={s.title}>프로모션</h1>
          <p style={s.desc}>쿠폰팩, 오픈런 특가, 시즌 할인처럼 바로 예약에 연결되는 혜택형 프로모션을 한곳에 모았습니다.</p>
          <div style={s.heroActions}>
            <Link to="/events" style={s.secondaryBtn}>이벤트 보기</Link>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.list}>
            {PROMOTION_ITEMS.map((item) => (
              <article key={item.slug} style={s.item}>
                <div style={s.body}>
                  <p style={s.cardLead}>{item.lead}</p>
                  <h2 style={s.cardTitle}>{item.title}</h2>
                  <p style={s.cardSub}>{item.subtitle}</p>
                  <p style={s.date}>{item.date}</p>
                  <p style={s.bodyDesc}>{item.description}</p>
                  <div style={s.actionRow}>
                    <Link to={getPromotionTarget(item)} style={s.primaryBtn}>{item.applyLabel}</Link>
                    <Link to={`/promotions/${item.slug}`} style={s.secondaryLink}>상세 보기</Link>
                  </div>
                </div>
                <div style={s.visualWrap}>
                  <div style={{ ...s.thumbPanel, background: item.gradient }}>
                    <div style={{ ...s.thumbCircle, background: item.circle }}>
                      <img src={item.imageUrl} alt={item.subtitle} style={s.thumbImage} />
                    </div>
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
  page: { background: '#F9F7F5', minHeight: 'calc(100vh - 160px)' },
  hero: { padding: '64px 24px 40px', background: 'linear-gradient(145deg, #FFF6F1 0%, #FFFFFF 52%, #F7F7FF 100%)', borderBottom: '1px solid #F0E8E8' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  eyebrow: { margin: '0 0 12px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 12px', fontSize: '42px', fontWeight: '800', color: C.text },
  desc: { margin: 0, maxWidth: '760px', fontSize: '16px', lineHeight: 1.8, color: C.textSub },
  heroActions: { marginTop: '20px', display: 'flex', gap: '10px' },
  section: { padding: '32px 24px 64px' },
  list: { display: 'grid', gap: '18px' },
  item: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 220px',
    gap: '24px',
    alignItems: 'stretch',
    background: '#fff',
    border: `1px solid ${C.borderLight}`,
    borderRadius: '24px',
    overflow: 'hidden',
  },
  body: { padding: '24px 24px 22px', minWidth: 0 },
  cardLead: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.primary },
  cardTitle: { margin: '0 0 10px', fontSize: '30px', lineHeight: 1.08, color: C.text, whiteSpace: 'pre-line' },
  cardSub: { margin: '0 0 10px', fontSize: '14px', color: C.textSub, fontWeight: '700' },
  date: { margin: '0 0 10px', fontSize: '13px', color: C.textLight, fontWeight: '700' },
  bodyDesc: { margin: 0, fontSize: '14px', lineHeight: 1.75, color: C.textSub, maxWidth: '760px' },
  actionRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px', alignItems: 'center' },
  primaryBtn: { display: 'inline-flex', padding: '11px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '800' },
  secondaryLink: { display: 'inline-flex', padding: '11px 2px', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '700' },
  visualWrap: { display: 'flex' },
  thumbPanel: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  thumbCircle: { width: '116px', height: '116px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  thumbImage: { width: '100%', height: '100%', objectFit: 'cover' },
  secondaryBtn: { display: 'inline-flex', padding: '11px 16px', borderRadius: '999px', border: `1px solid ${C.border}`, background: '#fff', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '700' },
};
