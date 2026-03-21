import { Link } from 'react-router-dom';
import DashboardSection from '../../components/common/DashboardSection';
import DashboardStatCard from '../../components/common/DashboardStatCard';
import SectionNav from '../../components/common/SectionNav';
import { useAuth } from '../../hooks/useAuth';
import { C } from '../../styles/tokens';

const SELLER_SECTION_ITEMS = [
  { to: '/seller', label: '대시보드', match: (pathname) => pathname === '/seller' },
  { to: '/seller/lodgings', label: '숙소 관리', match: (pathname) => pathname.startsWith('/seller/lodgings') },
  { to: '/seller/reservations', label: '예약 관리', match: (pathname) => pathname.startsWith('/seller/reservations') },
  { to: '/seller/inquiries', label: '문의 관리', match: (pathname) => pathname.startsWith('/seller/inquiries') },
];

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const dashboardState = {
    loading: false,
    error: '',
    stats: [
      { label: '등록 숙소', value: 3, link: '/seller/lodgings', background: '#eff6ff', description: '현재 노출 중 숙소' },
      { label: '총 예약', value: 12, link: '/seller/reservations', background: '#f0fdf4', description: '이번 달 기준' },
      { label: '미처리 문의', value: 2, link: '/seller/inquiries', background: '#fef9c3', description: '빠른 응답 권장' },
    ],
  };
  // TODO(back-end): 판매자 대시보드 요약 API 응답으로 stats를 교체한다.
  const todayChecklist = [
    { label: '답변 대기 문의', value: '2건', tone: 'warning' },
    { label: '이번 주 체크인 예정', value: '5건', tone: 'default' },
    { label: '신규 등록 초안', value: '1건', tone: 'accent' },
  ];
  const quickInsightCards = [
    {
      title: '가장 반응 좋은 숙소',
      value: '제주 오션 브리즈',
      description: '최근 7일 조회 대비 예약 전환율이 가장 높습니다.',
    },
    {
      title: '즉시 확인 필요',
      value: '체크인 문의 1건',
      description: '오늘 오후 체크인 예정 고객 문의가 있습니다.',
    },
  ];

  return (
    <div style={styles.wrap}>
      <style>{`
        @media (max-width: 900px) {
          .tz-seller-hero {
            grid-template-columns: 1fr !important;
          }
          .tz-seller-actions {
            width: 100%;
          }
          .tz-seller-actions a {
            flex: 1 1 100%;
            justify-content: center;
          }
        }
      `}</style>
      <SectionNav items={SELLER_SECTION_ITEMS} />
      <section style={styles.hero} className="tz-seller-hero">
        <div style={styles.heroMain}>
          <p style={styles.eyebrow}>SELLER CONTROL</p>
          <h1 style={styles.heroTitle}>{user?.name || '판매자'}님의 운영 보드</h1>
          <p style={styles.heroDesc}>예약, 문의, 숙소 등록 상태를 한 번에 보고 오늘 처리할 일을 바로 고를 수 있게 정리했습니다.</p>

          <div style={styles.checklistRow}>
            {todayChecklist.map((item) => (
              <div
                key={item.label}
                style={{
                  ...styles.checklistCard,
                  ...(item.tone === 'warning'
                    ? styles.checklistWarning
                    : item.tone === 'accent'
                      ? styles.checklistAccent
                      : null),
                }}
              >
                <span style={styles.checklistLabel}>{item.label}</span>
                <strong style={styles.checklistValue}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.heroAside}>
          <div style={styles.heroAsideCard}>
            <p style={styles.heroAsideLabel}>오늘의 운영 메모</p>
            <strong style={styles.heroAsideTitle}>체크인 전 문의와 신규 숙소 등록 흐름을 우선 확인하세요.</strong>
            <p style={styles.heroAsideDesc}>프론트 데모 기준으로도 문의 응답 속도와 숙소 카드 품질이 대시보드 첫인상에 가장 크게 보입니다.</p>
          </div>
        </div>
      </section>

      <DashboardSection
        title="판매자 대시보드"
        description={`안녕하세요, ${user?.name || '판매자'}님. 오늘 확인할 운영 현황입니다.`}
        loading={dashboardState.loading}
        error={dashboardState.error}
        empty={!dashboardState.stats.length}
      >
        <div style={styles.statsGrid}>
          {dashboardState.stats.map((stat) => (
            <DashboardStatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div style={styles.actions}>
          <Link to="/seller/lodgings/create" style={styles.primaryBtn}>+ 숙소 등록</Link>
          <Link to="/seller/reservations" style={styles.secondaryBtn}>예약 현황 보기</Link>
          <Link to="/inquiry/create" style={styles.secondaryBtn}>관리자 문의</Link>
        </div>

        <div style={styles.insightGrid}>
          {quickInsightCards.map((item) => (
            <article key={item.title} style={styles.insightCard}>
              <p style={styles.insightLabel}>{item.title}</p>
              <h3 style={styles.insightValue}>{item.value}</h3>
              <p style={styles.insightDesc}>{item.description}</p>
            </article>
          ))}
        </div>
      </DashboardSection>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 48px' },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.65fr) minmax(280px, 0.9fr)',
    gap: '18px',
    marginBottom: '24px',
  },
  heroMain: {
    padding: '30px 32px',
    borderRadius: '28px',
    background: 'linear-gradient(145deg, #FFF4F2 0%, #FFFFFF 52%, #F5F8FF 100%)',
    border: '1px solid #F1DEDE',
    boxShadow: '0 18px 40px rgba(17,17,17,0.06)',
  },
  eyebrow: {
    margin: '0 0 12px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: C.primary,
  },
  heroTitle: {
    margin: '0 0 10px',
    fontSize: 'clamp(28px, 4vw, 42px)',
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    color: C.text,
  },
  heroDesc: {
    margin: 0,
    maxWidth: '720px',
    fontSize: '15px',
    lineHeight: 1.75,
    color: C.textSub,
  },
  checklistRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginTop: '22px',
  },
  checklistCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px 18px',
    borderRadius: '20px',
    background: '#FFFFFFD4',
    border: '1px solid #EFE8E8',
  },
  checklistWarning: {
    background: '#FFF9E8',
    borderColor: '#F4DC92',
  },
  checklistAccent: {
    background: '#EEF5FF',
    borderColor: '#CFE0FF',
  },
  checklistLabel: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#746C6C',
  },
  checklistValue: {
    fontSize: '24px',
    lineHeight: 1.1,
    color: C.text,
  },
  heroAside: {
    display: 'flex',
  },
  heroAsideCard: {
    width: '100%',
    padding: '26px',
    borderRadius: '28px',
    background: 'linear-gradient(145deg, #FFF1EE 0%, #FFF9F7 55%, #F7F3EF 100%)',
    border: '1px solid #EFD9D2',
    color: '#2F3640',
    boxShadow: '0 18px 36px rgba(78, 48, 42, 0.10)',
  },
  heroAsideLabel: {
    margin: '0 0 14px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.1em',
    color: '#C4634E',
  },
  heroAsideTitle: {
    display: 'block',
    fontSize: '22px',
    lineHeight: 1.35,
    letterSpacing: '-0.02em',
    color: '#2F3640',
  },
  heroAsideDesc: {
    margin: '14px 0 0',
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#6A5F5A',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '13px 20px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: 800,
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 20px',
    background: '#fff',
    color: C.text,
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: '700',
    border: `1px solid ${C.borderLight}`,
  },
  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
  },
  insightCard: {
    padding: '22px',
    borderRadius: '22px',
    background: '#FFFFFF',
    border: '1px solid #ECE8E4',
    boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
  },
  insightLabel: {
    margin: '0 0 10px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#8A7B7B',
  },
  insightValue: {
    margin: '0 0 8px',
    fontSize: '24px',
    lineHeight: 1.25,
    color: C.text,
  },
  insightDesc: {
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.7,
    color: C.textSub,
  },
};
