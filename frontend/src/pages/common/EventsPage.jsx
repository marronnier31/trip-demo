import { Link } from 'react-router-dom';
import { EVENT_ITEMS, getEventTarget } from '../../mock/eventData';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function EventsPage() {
  // TODO(back-end):
  // GET /api/v1/events
  // response item example:
  // { slug, status, audienceLabel, ctaLabel, actionPath, lead, title, date, subtitle, imageUrl, description }
  // actionPath가 서버에서 확정되면 현재 getEventTarget과 CTA 문구를 그대로 재사용할 수 있다.
  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>EVENT HUB</p>
          <h1 style={s.title}>이벤트</h1>
          <p style={s.desc}>TripZone에서 참여형 이벤트와 시즌 캠페인을 한눈에 확인하고 바로 참여할 수 있는 이벤트 허브입니다.</p>
          <div style={s.heroActions}>
            <Link to="/promotions" style={s.secondaryBtn}>프로모션 보기</Link>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.list}>
            {EVENT_ITEMS.map((item) => (
              <article key={item.slug} style={s.item}>
                <div style={s.itemHead}>
                  <div style={s.metaRow}>
                    <span style={{ ...s.statusBadge, ...(item.status === '등급전용' ? s.statusBadgeDark : item.status === '오픈예정' ? s.statusBadgeSoon : s.statusBadgeLive) }}>
                      {item.status}
                    </span>
                    <span style={s.audienceText}>{item.audienceLabel}</span>
                    <span style={s.date}>{item.date}</span>
                  </div>
                  <div style={s.thumbWrap}>
                    <div style={{ ...s.thumbCircle, background: item.circle }}>
                      <img src={item.imageUrl} alt={item.subtitle} style={s.thumbImage} />
                    </div>
                  </div>
                </div>
                <div style={s.body}>
                  <p style={s.cardLead}>{item.lead}</p>
                  <h2 style={s.cardTitle}>{item.title}</h2>
                  <p style={s.cardSub}>{item.subtitle}</p>
                  <p style={s.bodyDesc}>{item.description}</p>
                  <div style={s.actionRow}>
                    <Link to={getEventTarget(item)} style={s.primaryBtn}>{item.ctaLabel}</Link>
                    <Link to={`/events/${item.slug}`} style={s.secondaryLink}>상세 보기</Link>
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
    gridTemplateColumns: 'minmax(0, 1fr) 120px',
    gap: '22px',
    alignItems: 'center',
    background: '#fff',
    border: `1px solid ${C.borderLight}`,
    borderRadius: '24px',
    padding: '24px',
  },
  itemHead: { display: 'contents' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' },
  statusBadge: { display: 'inline-flex', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' },
  statusBadgeLive: { background: '#FFF1F1', color: C.primary },
  statusBadgeSoon: { background: '#EFF6FF', color: '#2563EB' },
  statusBadgeDark: { background: '#18181B', color: '#F9FAFB' },
  audienceText: { fontSize: '12px', color: C.textLight, fontWeight: '700' },
  date: { fontSize: '12px', color: C.textLight, fontWeight: '700' },
  body: { minWidth: 0 },
  cardLead: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.primary },
  cardTitle: { margin: '0 0 10px', fontSize: '30px', lineHeight: 1.08, color: C.text, whiteSpace: 'pre-line' },
  cardSub: { margin: '0 0 12px', fontSize: '14px', color: C.textSub, fontWeight: '700' },
  bodyDesc: { margin: 0, fontSize: '14px', lineHeight: 1.75, color: C.textSub, maxWidth: '760px' },
  thumbWrap: { display: 'flex', justifyContent: 'flex-end' },
  thumbCircle: { width: '110px', height: '110px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  thumbImage: { width: '100%', height: '100%', objectFit: 'cover' },
  actionRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px', alignItems: 'center' },
  primaryBtn: { display: 'inline-flex', padding: '11px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '800' },
  secondaryLink: { display: 'inline-flex', padding: '11px 2px', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '700' },
  secondaryBtn: { display: 'inline-flex', padding: '11px 16px', borderRadius: '999px', border: `1px solid ${C.border}`, background: '#fff', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '700' },
};
