import { Link, useParams } from 'react-router-dom';
import { EVENT_ITEMS, findEventBySlug, getEventTarget } from '../../mock/eventData';
import { C, MAX_WIDTH } from '../../styles/tokens';

export default function EventDetailPage() {
  const { eventSlug } = useParams();
  const event = findEventBySlug(eventSlug);
  const eventActionLink = getEventTarget(event);

  // TODO(back-end):
  // GET /api/v1/events/{eventSlug}
  // response example:
  // { slug, title, subtitle, date, status, audienceLabel, ctaLabel, actionPath, description, highlights[] }
  // highlights 배열과 actionPath만 내려주면 현재 상세 레이아웃을 그대로 사용할 수 있다.

  if (!event) {
    return (
      <div style={s.page}>
        <div style={s.inner}>
          <div style={s.emptyCard}>
            <p style={s.emptyEyebrow}>EVENT DETAIL</p>
            <h1 style={s.emptyTitle}>이벤트를 찾을 수 없습니다.</h1>
            <p style={s.emptyDesc}>존재하지 않거나 종료된 이벤트일 수 있습니다. 다른 이벤트를 확인해 주세요.</p>
            <Link to="/events" style={s.primaryBtn}>이벤트 목록 보기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <section style={{ ...s.hero, background: event.gradient }}>
        <div style={s.inner}>
          <div style={s.heroShell}>
            <div style={s.heroMain}>
              <div style={s.heroBadgeRow}>
                <span style={{ ...s.statusBadge, ...(event.status === '등급전용' ? s.statusBadgeDark : event.status === '오픈예정' ? s.statusBadgeSoon : s.statusBadgeLive) }}>
                  {event.status}
                </span>
                <span style={s.audienceBadge}>{event.audienceLabel}</span>
              </div>
              <p style={s.eyebrow}>{event.lead}</p>
              <h1 style={s.title}>{event.title}</h1>
              <p style={s.subtitle}>{event.subtitle}</p>
              <p style={s.desc}>{event.description}</p>
              <div style={s.heroActions}>
                <Link to={eventActionLink} style={s.primaryBtn}>{event.ctaLabel}</Link>
                <Link to="/events" style={s.secondaryBtn}>목록으로</Link>
              </div>
            </div>

            <aside style={s.heroAside}>
              <div style={s.summaryCard}>
                <div style={{ ...s.heroCircle, background: event.circle }}>
                  <img src={event.imageUrl} alt={event.subtitle} style={s.heroImage} />
                </div>
                <div style={s.summaryList}>
                  <div style={s.summaryRow}>
                    <span style={s.summaryLabel}>진행 일정</span>
                    <span style={s.summaryText}>{event.date}</span>
                  </div>
                  <div style={s.summaryRow}>
                    <span style={s.summaryLabel}>참여 대상</span>
                    <span style={s.summaryText}>{event.audienceLabel}</span>
                  </div>
                  <div style={s.summaryRow}>
                    <span style={s.summaryLabel}>참여 방식</span>
                    <span style={s.summaryText}>{event.ctaLabel}</span>
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
              <p style={s.sectionEyebrow}>EVENT GUIDE</p>
              <h2 style={s.sectionTitle}>참여 전 확인할 내용</h2>
              <div style={s.tipGrid}>
                {event.highlights.map((item, index) => (
                  <article key={item.title} style={s.tipCard}>
                    <p style={s.tipIndex}>STEP {String(index + 1).padStart(2, '0')}</p>
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
                <p style={s.sectionEyebrow}>MORE EVENTS</p>
                <h2 style={s.moreTitle}>이어서 볼 만한 이벤트</h2>
              </div>
            </div>
            <div style={s.moreList}>
              {EVENT_ITEMS.filter((item) => item.slug !== event.slug).slice(0, 3).map((item) => (
                <Link key={item.slug} to={`/events/${item.slug}`} style={s.moreCard}>
                  <div style={s.moreBadgeRow}>
                    <span style={{ ...s.statusBadge, ...(item.status === '등급전용' ? s.statusBadgeDark : item.status === '오픈예정' ? s.statusBadgeSoon : s.statusBadgeLive) }}>
                      {item.status}
                    </span>
                  </div>
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
  page: { background: 'linear-gradient(180deg, #F7F6FB 0%, #F3F0EE 100%)', minHeight: 'calc(100vh - 160px)' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  hero: { padding: '56px 24px 36px', borderBottom: '1px solid #ECE7EA' },
  heroShell: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.8fr)',
    gap: '20px',
    alignItems: 'stretch',
  },
  heroMain: {
    padding: '36px',
    borderRadius: '32px',
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.76)',
    boxShadow: '0 20px 48px rgba(15,23,42,0.06)',
  },
  heroAside: { display: 'flex' },
  summaryCard: {
    width: '100%',
    padding: '28px',
    borderRadius: '32px',
    background: 'linear-gradient(145deg, #FFF2F3 0%, #F2E7EE 58%, #F4ECE8 100%)',
    color: C.text,
    border: '1px solid #E7D8DE',
    boxShadow: '0 18px 40px rgba(126,78,88,0.10)',
  },
  heroBadgeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', padding: '7px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' },
  statusBadgeLive: { background: '#FFF1F1', color: C.primary },
  statusBadgeSoon: { background: '#EFF6FF', color: '#2563EB' },
  statusBadgeDark: { background: '#18181B', color: '#F9FAFB' },
  audienceBadge: { display: 'inline-flex', alignItems: 'center', padding: '7px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', background: '#F5F6F8', color: C.text },
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
    border: '1px solid #ECE6E8',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  sectionEyebrow: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: C.primary },
  sectionTitle: { margin: '0 0 18px', fontSize: '30px', fontWeight: '800', color: C.text },
  tipGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' },
  tipCard: { padding: '20px', borderRadius: '24px', background: '#F7F5FA', border: '1px solid #ECE7EF' },
  tipIndex: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.primary },
  tipTitle: { margin: '0 0 10px', fontSize: '18px', fontWeight: '800', color: C.text },
  tipDesc: { margin: 0, fontSize: '14px', lineHeight: 1.75, color: C.textSub },
  moreSection: { marginTop: '28px' },
  moreHead: { marginBottom: '14px' },
  moreTitle: { margin: 0, fontSize: '28px', fontWeight: '800', color: C.text },
  moreList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' },
  moreCard: { display: 'block', padding: '20px', borderRadius: '24px', background: '#fff', border: '1px solid #ECE6E8', textDecoration: 'none', boxShadow: '0 14px 30px rgba(15,23,42,0.04)' },
  moreBadgeRow: { marginBottom: '10px' },
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
