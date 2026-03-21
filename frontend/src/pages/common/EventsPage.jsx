import { Link } from 'react-router-dom';
import { EVENT_ITEMS, getEventTarget } from '../../mock/eventData';
import { C, MAX_WIDTH } from '../../styles/tokens';

const eventStats = [
  { label: '진행 중 이벤트', value: `${EVENT_ITEMS.filter((item) => item.status === '진행중').length}개` },
  { label: '참여 방식', value: '리뷰 · 출석 · 초대' },
  { label: '전용 혜택', value: `${EVENT_ITEMS.filter((item) => item.status === '등급전용').length}개 운영` },
];

export default function EventsPage() {
  const featuredEvent = EVENT_ITEMS[0];

  // TODO(back-end):
  // GET /api/v1/events
  // response item example:
  // { slug, status, audienceLabel, ctaLabel, actionPath, lead, title, date, subtitle, imageUrl, description }
  // actionPath가 서버에서 확정되면 현재 getEventTarget과 CTA 문구를 그대로 재사용할 수 있다.
  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 980px) {
          .tz-event-hero {
            grid-template-columns: 1fr !important;
          }
          .tz-event-item {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <section style={s.hero}>
        <div style={s.inner}>
          <div style={s.heroShell} className="tz-event-hero">
            <div style={s.heroMain}>
              <p style={s.eyebrow}>EVENT HUB</p>
              <h1 style={s.title}>참여형 이벤트를
                <br />
                한 번에 둘러보세요.
              </h1>
              <p style={s.desc}>리뷰, 출석체크, 친구 초대처럼 회원 참여가 바로 이어지는 이벤트를 모아 현재 참여 가능한 흐름을 먼저 보여줍니다.</p>
              <div style={s.heroActions}>
                <Link to={getEventTarget(featuredEvent)} style={s.primaryBtn}>{featuredEvent.ctaLabel}</Link>
                <Link to="/promotions" style={s.secondaryBtn}>프로모션 보기</Link>
              </div>
            </div>

            <aside style={s.heroAside}>
              <div style={s.featureCard}>
                <div style={s.featureVisualWrap}>
                  <div style={{ ...s.featureVisual, background: featuredEvent.circle }}>
                    <img src={featuredEvent.imageUrl} alt={featuredEvent.subtitle} style={s.featureVisualImage} />
                  </div>
                </div>
                <div style={s.featureBadgeRow}>
                  <span style={{ ...s.statusBadge, ...(featuredEvent.status === '등급전용' ? s.statusBadgeDark : featuredEvent.status === '오픈예정' ? s.statusBadgeSoon : s.statusBadgeLive) }}>
                    {featuredEvent.status}
                  </span>
                  <span style={s.audienceBadge}>{featuredEvent.audienceLabel}</span>
                </div>
                <h2 style={s.featureTitle}>{featuredEvent.title}</h2>
                <p style={s.featureSub}>{featuredEvent.description}</p>
                <p style={s.featureDate}>{featuredEvent.date}</p>
                <div style={s.featureChipRow}>
                  {featuredEvent.highlights.slice(0, 2).map((item) => (
                    <span key={item.title} style={s.featureChip}>{item.title}</span>
                  ))}
                </div>
                <Link to={`/events/${featuredEvent.slug}`} style={s.featureLink}>상세 보기</Link>
              </div>
            </aside>
          </div>

          <div style={s.statGrid}>
            {eventStats.map((item) => (
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
              <p style={s.sectionEyebrow}>EVENT LIST</p>
              <h2 style={s.sectionTitle}>참여 방식별로 보기</h2>
            </div>
            <p style={s.sectionDesc}>혜택 대상과 참여 방법을 한 카드에서 읽을 수 있게 정리해 진입 판단이 빠르도록 바꿨습니다.</p>
          </div>

          <div style={s.list}>
            {EVENT_ITEMS.map((item) => (
              <article key={item.slug} style={s.item} className="tz-event-item">
                <div style={s.body}>
                  <div style={s.metaRow}>
                    <span style={{ ...s.statusBadge, ...(item.status === '등급전용' ? s.statusBadgeDark : item.status === '오픈예정' ? s.statusBadgeSoon : s.statusBadgeLive) }}>
                      {item.status}
                    </span>
                    <span style={s.audienceBadge}>{item.audienceLabel}</span>
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
                      <p style={s.footerLabel}>진행 일정</p>
                      <p style={s.date}>{item.date}</p>
                    </div>
                    <div style={s.actionRow}>
                      <Link to={getEventTarget(item)} style={s.primaryBtn}>{item.ctaLabel}</Link>
                      <Link to={`/events/${item.slug}`} style={s.secondaryLink}>자세히 보기</Link>
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
  page: { background: 'linear-gradient(180deg, #F7F6FB 0%, #F3F0EE 100%)', minHeight: 'calc(100vh - 160px)' },
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
    background: 'linear-gradient(135deg, #FFF8F8 0%, #FFFFFF 48%, #F6F8FF 100%)',
    border: '1px solid #EEE5E6',
    boxShadow: '0 20px 48px rgba(15,23,42,0.06)',
  },
  heroAside: { display: 'flex' },
  featureCard: {
    width: '100%',
    padding: '28px',
    borderRadius: '32px',
    background: 'linear-gradient(145deg, #FFF1F3 0%, #F3EAF3 58%, #F5EEEA 100%)',
    color: C.text,
    border: '1px solid #E7D9DD',
    boxShadow: '0 18px 40px rgba(126,78,88,0.10)',
  },
  featureVisualWrap: { display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' },
  featureVisual: { width: '96px', height: '96px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 16px 28px rgba(90,63,84,0.16)' },
  featureVisualImage: { width: '100%', height: '100%', objectFit: 'cover' },
  featureBadgeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
  featureTitle: { margin: '0 0 12px', fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.15, whiteSpace: 'pre-line' },
  featureSub: { margin: '0 0 12px', fontSize: '15px', lineHeight: 1.7, color: C.textSub },
  featureDate: { margin: '0 0 18px', fontSize: '13px', color: '#866770', fontWeight: '700' },
  featureChipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' },
  featureChip: { display: 'inline-flex', padding: '8px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.72)', border: '1px solid #E4D6DB', color: C.text, fontSize: '12px', fontWeight: '800' },
  featureLink: { display: 'inline-flex', padding: '11px 16px', borderRadius: '999px', background: 'rgba(255,255,255,0.78)', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '800', border: '1px solid #E3D5DA' },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 14px', fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.04, fontWeight: '800', color: C.text },
  desc: { margin: 0, maxWidth: '680px', fontSize: '16px', lineHeight: 1.85, color: C.textSub },
  heroActions: { marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' },
  statGrid: { marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  statCard: { padding: '18px 20px', borderRadius: '22px', background: 'rgba(255,255,255,0.86)', border: '1px solid #ECE8E8' },
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
    border: '1px solid #ECE6E8',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  body: { minWidth: 0, padding: '12px 10px 12px 12px' },
  metaRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', padding: '7px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' },
  statusBadgeLive: { background: '#FFF1F1', color: C.primary },
  statusBadgeSoon: { background: '#EFF6FF', color: '#2563EB' },
  statusBadgeDark: { background: '#18181B', color: '#F9FAFB' },
  audienceBadge: { display: 'inline-flex', alignItems: 'center', padding: '7px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', background: '#F5F6F8', color: C.text },
  cardLead: { margin: '0 0 8px', fontSize: '13px', fontWeight: '800', color: C.primary },
  cardTitle: { margin: '0 0 12px', fontSize: 'clamp(26px, 3.6vw, 38px)', lineHeight: 1.06, color: C.text, whiteSpace: 'pre-line' },
  cardSub: { margin: 0, fontSize: '15px', lineHeight: 1.8, color: C.textSub, maxWidth: '720px' },
  highlightRail: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' },
  highlightChip: { display: 'inline-flex', padding: '10px 14px', borderRadius: '999px', background: '#F6F4F8', color: C.text, fontSize: '13px', fontWeight: '700' },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '18px',
    alignItems: 'end',
    flexWrap: 'wrap',
    marginTop: '22px',
    paddingTop: '18px',
    borderTop: '1px solid #EEE7E4',
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
