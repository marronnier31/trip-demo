import { Link } from 'react-router-dom';
import DashboardSection from '../../components/common/DashboardSection';
import SectionNav from '../../components/common/SectionNav';
import { adminDashboardMock } from '../../mock/adminDashboardMock';
import { C, MAX_WIDTH, S } from '../../styles/tokens';

const ADMIN_SECTION_ITEMS = [
  { to: '/admin', label: '대시보드', match: (pathname) => pathname === '/admin' },
  { to: '/admin/users', label: '회원 관리', match: (pathname) => pathname.startsWith('/admin/users') },
  { to: '/admin/sellers', label: '호스트 승인', match: (pathname) => pathname.startsWith('/admin/sellers') },
  { to: '/admin/inquiries', label: '문의 처리', match: (pathname) => pathname.startsWith('/admin/inquiries') },
  { to: '/admin/rewards', label: '쿠폰·마일리지', match: (pathname) => pathname.startsWith('/admin/rewards') },
  { to: '/admin/events', label: '이벤트 관리', match: (pathname) => pathname.startsWith('/admin/events') },
];

export default function AdminDashboardPage() {
  const dashboardState = {
    loading: false,
    error: '',
    data: adminDashboardMock,
  };
  // TODO(back-end):
  // GET /api/v1/admin/dashboard
  // response example:
  // {
  //   overview,
  //   monthlyPerformance,
  //   sellerPerformance,
  //   lodgingTypePerformance,
  //   reservationMix,
  //   lodgingTypeMix,
  //   quickLinks
  // }
  // 현재 mock 구조와 key를 맞추면 UI 교체 없이 서버 응답으로 전환 가능하다.

  const { overview, monthlyPerformance, sellerPerformance, lodgingTypePerformance, reservationMix, lodgingTypeMix, quickLinks } = dashboardState.data;
  const kpiCards = [
    { label: '총 매출액', value: formatMoneyForCard(overview.totalRevenue), subValue: formatCurrency(overview.totalRevenue), description: '누적 기준 gross booking revenue', tone: 'primary' },
    { label: '총 예약 수', value: formatCount(overview.totalBookings), description: '예약 완료 + 취소 포함 누적 요청', tone: 'neutral' },
    { label: '예약 완료율', value: `${formatRate(overview.confirmedRate)}%`, description: `${formatCount(overview.confirmedBookings)}건 완료`, tone: 'success' },
    { label: '예약 취소율', value: `${formatRate(overview.cancellationRate)}%`, description: `${formatCount(overview.cancelledBookings)}건 취소`, tone: 'warning' },
    { label: '총 판매자 수', value: formatCount(overview.totalSellers), description: `${formatCount(overview.activeLodgings)}개 운영 숙소 추적`, tone: 'forest' },
    { label: '예약당 평균 매출', value: formatMoneyForCard(overview.avgRevenuePerBooking), subValue: formatCurrency(overview.avgRevenuePerBooking), description: '객단가 기준 운영 효율 지표', tone: 'ink' },
  ];

  const monthlyRevenuePoints = buildLinePath(monthlyPerformance);
  const reservationRingStyle = buildSegmentRing(reservationMix, ['#2B8A62', '#F0A444']);
  const lodgingTypeRingStyle = buildSegmentRing(
    lodgingTypeMix.slice(0, 5),
    ['#E8484A', '#F19578', '#F0C15A', '#8ABF9A', '#6C89C9'],
  );

  return (
    <div style={styles.wrap}>
      <SectionNav items={ADMIN_SECTION_ITEMS} />
      <style>{`
        @keyframes adminFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminScaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes adminGrowX {
          from { opacity: 0; transform: scaleX(0.7); transform-origin: left center; }
          to { opacity: 1; transform: scaleX(1); transform-origin: left center; }
        }
        @keyframes adminDrawLine {
          from { stroke-dashoffset: 160; opacity: 0.35; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes adminBarRise {
          from { opacity: 0; transform: scaleY(0.2); transform-origin: bottom center; }
          to { opacity: 1; transform: scaleY(1); transform-origin: bottom center; }
        }
        .admin-tooltip-target:hover .admin-hover-tooltip,
        .admin-tooltip-target:focus-visible .admin-hover-tooltip,
        .admin-tooltip-target:focus .admin-hover-tooltip {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <section style={styles.hero}>
        <div style={styles.heroCopy}>
          <p style={styles.eyebrow}>ADMIN OVERVIEW</p>
          <h1 style={styles.heroTitle}>운영 현황을 한눈에 보는 관리자 대시보드</h1>
          <p style={styles.heroDescription}>
            전체 사이트 스타일을 유지하면서 예약 흐름, 매출 추이, 판매자 성과를 한 화면에서 빠르게 읽을 수 있게 구성했습니다.
          </p>
          <div style={styles.heroActions}>
            {quickLinks.map((item) => (
              <Link to={item.to} key={item.to} style={styles.primaryLink}>{item.label}</Link>
            ))}
          </div>
        </div>
        <div style={styles.heroAside}>
          <div style={styles.heroSpotlight}>
            <span style={styles.heroSpotlightLabel}>총 매출액</span>
            <strong style={styles.heroSpotlightValue}>{formatCurrency(overview.totalRevenue)}</strong>
            <span style={styles.heroSpotlightNote}>최근 6개월 누적 기준</span>
          </div>
          <div style={styles.heroMetaGrid}>
            <div style={styles.heroMetaCard}>
              <span style={styles.heroMetaLabel}>총 예약 요청</span>
              <strong style={styles.heroMetaValue}>{formatCount(overview.totalBookings)}건</strong>
            </div>
            <div style={styles.heroMetaCard}>
              <span style={styles.heroMetaLabel}>미처리 문의</span>
              <strong style={styles.heroMetaValue}>{formatCount(overview.pendingInquiries)}건</strong>
            </div>
            <div style={styles.heroMetaCard}>
              <span style={styles.heroMetaLabel}>전체 사용자</span>
              <strong style={styles.heroMetaValue}>{formatCount(overview.totalUsers)}명</strong>
            </div>
            <div style={styles.heroMetaCard}>
              <span style={styles.heroMetaLabel}>전체 판매자</span>
              <strong style={styles.heroMetaValue}>{formatCount(overview.totalSellers)}명</strong>
            </div>
          </div>
        </div>
      </section>

      <DashboardSection
        title="핵심 운영 지표"
        description="총 매출액, 예약 수, 취소율, 판매자 운영 현황을 핵심 KPI 카드로 정리했습니다."
        loading={dashboardState.loading}
        error={dashboardState.error}
        empty={!kpiCards.length}
      >
        <div style={styles.kpiGrid}>
          {kpiCards.map((card, index) => (
            <article key={card.label} style={{ ...styles.kpiCard, ...toneStyles[card.tone], animationDelay: `${index * 70}ms` }}>
              <span style={styles.kpiLabel}>{card.label}</span>
              <strong style={styles.kpiValue}>{card.value}</strong>
              {card.subValue ? <span style={styles.kpiSubValue}>{card.subValue}</span> : null}
              <span style={styles.kpiDescription}>{card.description}</span>
            </article>
          ))}
        </div>
      </DashboardSection>

      <div style={styles.analyticsGrid}>
        <DashboardSection
          title="누적 판매자 예약 비율"
          description="예약 완료건과 취소건 비중을 운영 안정성 지표로 요약했습니다."
          loading={dashboardState.loading}
          error={dashboardState.error}
          empty={!reservationMix.length}
        >
          <div style={styles.splitCard}>
            <div style={styles.chartSummary}>
              <div style={{ ...styles.donutChart, background: reservationRingStyle, animationDelay: '120ms' }}>
                <div style={styles.donutInner}>
                  <strong style={styles.donutValue}>{formatRate(overview.confirmedRate)}%</strong>
                  <span style={styles.donutLabel}>완료 비중</span>
                </div>
              </div>
              <div style={styles.chartSummaryText}>
                <strong style={styles.chartHeadline}>예약 완료와 취소 흐름을 원형 차트로 압축했습니다.</strong>
                <span style={styles.chartSummaryMeta}>총 {formatCount(overview.totalBookings)}건 기준</span>
              </div>
            </div>
            <div style={styles.mixList}>
              {reservationMix.map((item, index) => (
                <div key={item.label} className="admin-tooltip-target" style={{ ...styles.mixRow, animationDelay: `${160 + (index * 70)}ms` }} tabIndex={0}>
                  <span style={{ ...styles.mixDot, ...(item.tone === 'success' ? styles.mixDotSuccess : styles.mixDotWarning) }} />
                  <div>
                    <div style={styles.mixLabel}>{item.label}</div>
                    <div style={styles.mixCount}>{formatCount(item.count)}건</div>
                  </div>
                  <div style={styles.mixRatio}>{formatRate(item.ratio)}%</div>
                  <div className="admin-hover-tooltip" style={styles.hoverTooltip}>
                    <strong style={styles.tooltipTitle}>{item.label}</strong>
                    <span style={styles.tooltipLine}>건수 {formatCount(item.count)}건</span>
                    <span style={styles.tooltipLine}>비중 {formatRate(item.ratio)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          title="누적 숙소 타입 예약 비율"
          description="숙소 타입별 예약 점유율과 매출 규모를 함께 볼 수 있게 구성했습니다."
          loading={dashboardState.loading}
          error={dashboardState.error}
          empty={!lodgingTypeMix.length}
        >
          <div style={styles.typeMixList}>
            <div style={styles.typeMixHero}>
              <div style={{ ...styles.donutChart, background: lodgingTypeRingStyle, animationDelay: '160ms' }}>
                <div style={styles.donutInner}>
                  <strong style={styles.donutValue}>{lodgingTypeMix[0] ? formatRate(lodgingTypeMix[0].ratio) : '0.0'}%</strong>
                  <span style={styles.donutLabel}>{lodgingTypeMix[0]?.label || '상위 타입'}</span>
                </div>
              </div>
              <div style={styles.chartSummaryText}>
                <strong style={styles.chartHeadline}>숙소 타입별 예약 점유율을 도넛형으로 강조했습니다.</strong>
                <span style={styles.chartSummaryMeta}>상위 타입 중심 운영 비교</span>
              </div>
            </div>
            {lodgingTypeMix.map((item, index) => (
              <div key={item.label} className="admin-tooltip-target" style={{ ...styles.typeMixItem, animationDelay: `${180 + (index * 60)}ms` }} tabIndex={0}>
                <div style={styles.typeMixHead}>
                  <strong style={styles.typeMixLabel}>{item.label}</strong>
                  <span style={styles.typeMixRatio}>{formatRate(item.ratio)}%</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${item.ratio}%`, animationDelay: `${220 + (index * 60)}ms` }} />
                </div>
                <div style={styles.typeMixMeta}>
                  <span>{formatCount(item.count)}건 예약</span>
                  <span>{formatCurrency(item.revenue)}</span>
                </div>
                <div className="admin-hover-tooltip" style={styles.hoverTooltip}>
                  <strong style={styles.tooltipTitle}>{item.label}</strong>
                  <span style={styles.tooltipLine}>예약 {formatCount(item.count)}건</span>
                  <span style={styles.tooltipLine}>취소 {formatCount(item.cancelledCount)}건</span>
                  <span style={styles.tooltipLine}>매출 {formatMoneyForCard(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection
        title="월별 매출액"
        description="월별 매출과 예약/취소 건수를 함께 비교해 계절성과 취소 리스크를 볼 수 있습니다."
        loading={dashboardState.loading}
        error={dashboardState.error}
        empty={!monthlyPerformance.length}
      >
        <div style={styles.revenuePanel}>
          <div style={styles.revenuePanelHead}>
            <div>
              <strong style={styles.revenuePanelTitle}>월별 매출 추이</strong>
              <p style={styles.revenuePanelCopy}>막대 위에 매출 라인을 올려 차트처럼 읽히도록 조정했습니다.</p>
            </div>
            <div style={styles.revenuePanelBadge}>최근 6개월</div>
          </div>
          <div style={styles.lineChartFrame}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.lineChartSvg} aria-hidden="true">
              <path d={monthlyRevenuePoints.areaPath} style={styles.lineAreaPath} />
              <path d={monthlyRevenuePoints.linePath} style={styles.lineStrokePath} />
              {monthlyRevenuePoints.points.map((point, index) => (
                <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="1.8" style={index === monthlyRevenuePoints.points.length - 1 ? styles.linePointActive : styles.linePoint} />
              ))}
            </svg>
          </div>
          <div style={styles.revenueBars}>
            {monthlyPerformance.map((item, index) => (
              <div key={item.month} className="admin-tooltip-target" style={{ ...styles.revenueBarItem, animationDelay: `${index * 90}ms` }} tabIndex={0}>
                <span style={styles.barValue}>{formatCurrencyCompact(item.revenue)}</span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, height: `${Math.max(item.revenueRatio, 16)}%`, animationDelay: `${120 + (index * 90)}ms` }} />
                </div>
                <strong style={styles.barMonth}>{item.month}</strong>
                <div style={styles.seriesGroup}>
                  <div style={styles.seriesRow}>
                    <span style={{ ...styles.seriesLabel, ...styles.seriesLabelBooking }}>예약</span>
                    <div style={styles.seriesTrack}>
                      <div
                        style={{
                          ...styles.seriesFill,
                          ...styles.seriesFillBooking,
                          width: `${getMonthlySeriesRatio(item.bookingCount, monthlyPerformance, 'bookingCount')}%`,
                          animationDelay: `${160 + (index * 90)}ms`,
                        }}
                      />
                    </div>
                    <span style={styles.seriesValue}>{item.bookingCount}</span>
                  </div>
                  <div style={styles.seriesRow}>
                    <span style={{ ...styles.seriesLabel, ...styles.seriesLabelCancel }}>취소</span>
                    <div style={styles.seriesTrack}>
                      <div
                        style={{
                          ...styles.seriesFill,
                          ...styles.seriesFillCancel,
                          width: `${getMonthlySeriesRatio(item.cancelledCount, monthlyPerformance, 'cancelledCount')}%`,
                          animationDelay: `${220 + (index * 90)}ms`,
                        }}
                      />
                    </div>
                    <span style={styles.seriesValue}>{item.cancelledCount}</span>
                  </div>
                </div>
                <span style={styles.barMetaMuted}>취소율 {formatRate(item.cancellationRate)}%</span>
                <div className="admin-hover-tooltip" style={styles.hoverTooltip}>
                  <strong style={styles.tooltipTitle}>{item.month} 운영 요약</strong>
                  <span style={styles.tooltipLine}>매출 {formatCurrency(item.revenue)}</span>
                  <span style={styles.tooltipLine}>예약 완료 {formatCount(item.bookingCount)}건</span>
                  <span style={styles.tooltipLine}>취소 {formatCount(item.cancelledCount)}건</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardSection>

      <div style={styles.analyticsGrid}>
        <DashboardSection
          title="판매자별 성과"
          description="상위 판매자 매출과 예약 점유율을 동시에 확인할 수 있습니다."
          loading={dashboardState.loading}
          error={dashboardState.error}
          empty={!sellerPerformance.length}
        >
          <div style={styles.rankList}>
            {sellerPerformance.map((item, index) => (
              <div key={item.sellerId} className="admin-tooltip-target" style={{ ...styles.rankCard, animationDelay: `${index * 70}ms` }} tabIndex={0}>
                <div style={styles.rankHeader}>
                  <span style={styles.rankIndex}>#{index + 1}</span>
                  <div>
                    <strong style={styles.rankTitle}>{item.name}</strong>
                    <div style={styles.rankSub}>{formatCount(item.bookingCount)}건 예약 · 취소율 {formatRate(item.cancellationRate)}%</div>
                  </div>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${item.bookingRatio}%`, animationDelay: `${100 + (index * 70)}ms` }} />
                </div>
                <div style={styles.rankFooter}>
                  <span>예약 비중 {formatRate(item.bookingRatio)}%</span>
                  <strong>{formatCurrency(item.revenue)}</strong>
                </div>
                <div className="admin-hover-tooltip" style={styles.hoverTooltip}>
                  <strong style={styles.tooltipTitle}>{item.name}</strong>
                  <span style={styles.tooltipLine}>매출 {formatCurrency(item.revenue)}</span>
                  <span style={styles.tooltipLine}>예약 {formatCount(item.bookingCount)}건</span>
                  <span style={styles.tooltipLine}>취소율 {formatRate(item.cancellationRate)}%</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          title="숙소 타입별 매출"
          description="숙소 타입별 총 예약 수, 취소율, 누적 매출을 함께 비교합니다."
          loading={dashboardState.loading}
          error={dashboardState.error}
          empty={!lodgingTypePerformance.length}
        >
          <div style={styles.rankList}>
            {lodgingTypePerformance.map((item, index) => (
              <div key={item.type} className="admin-tooltip-target" style={{ ...styles.typeRevenueCard, animationDelay: `${index * 70}ms` }} tabIndex={0}>
                <div style={styles.typeRevenueHead}>
                  <strong style={styles.rankTitle}>{item.type}</strong>
                  <span style={styles.typeRevenueRatio}>{formatRate(item.bookingRatio)}%</span>
                </div>
                <div style={styles.typeRevenueMeta}>
                  <span>총 예약 {formatCount(item.bookingCount)}건</span>
                  <span>취소율 {formatRate(item.cancellationRate)}%</span>
                </div>
                <strong style={styles.typeRevenueValue}>{formatCurrency(item.revenue)}</strong>
                <div className="admin-hover-tooltip" style={styles.hoverTooltip}>
                  <strong style={styles.tooltipTitle}>{item.type}</strong>
                  <span style={styles.tooltipLine}>예약 {formatCount(item.bookingCount)}건</span>
                  <span style={styles.tooltipLine}>취소 {formatCount(item.cancelledCount)}건</span>
                  <span style={styles.tooltipLine}>매출 {formatCurrency(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyCompact(value) {
  return `${(value / 100000000).toFixed(1)}억`;
}

function formatMoneyForCard(value) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억 원`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}만 원`;
  }
  return formatCurrency(value);
}

function formatCount(value) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function formatRate(value) {
  return value.toFixed(1);
}

function buildSegmentRing(items, palette) {
  const segments = [];
  let cursor = 0;
  items.forEach((item, index) => {
    const color = palette[index % palette.length];
    const start = cursor;
    const end = cursor + item.ratio;
    segments.push(`${color} ${start}% ${end}%`);
    cursor = end;
  });
  return `conic-gradient(${segments.join(', ')})`;
}

function buildLinePath(items) {
  if (!items.length) {
    return { linePath: '', areaPath: '', points: [] };
  }

  const step = items.length === 1 ? 100 : 100 / (items.length - 1);
  const points = items.map((item, index) => ({
    x: Number((index * step).toFixed(2)),
    y: Number((100 - item.revenueRatio).toFixed(2)),
  }));

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

  return { linePath, areaPath, points };
}

function getMonthlySeriesRatio(value, items, key) {
  const max = Math.max(...items.map((item) => item[key]), 1);
  return (value / max) * 100;
}

const toneStyles = {
  primary: { background: 'linear-gradient(135deg, #FFF3F0 0%, #FFFFFF 100%)' },
  neutral: { background: 'linear-gradient(135deg, #F5F7FB 0%, #FFFFFF 100%)' },
  success: { background: 'linear-gradient(135deg, #F1FAF4 0%, #FFFFFF 100%)' },
  warning: { background: 'linear-gradient(135deg, #FFF8EF 0%, #FFFFFF 100%)' },
  forest: { background: 'linear-gradient(135deg, #EEF7F3 0%, #FFFFFF 100%)' },
  ink: { background: 'linear-gradient(135deg, #F7F7FA 0%, #FFFFFF 100%)' },
};

const styles = {
  wrap: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 0.9fr)',
    gap: '18px',
    marginBottom: '24px',
    padding: '30px',
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #FFF8F4 0%, #FFFFFF 46%, #F6F7FB 100%)',
    border: `1px solid ${C.borderLight}`,
    boxShadow: S.card,
  },
  heroCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    justifyContent: 'space-between',
  },
  eyebrow: {
    margin: 0,
    fontSize: '12px',
    letterSpacing: '0.18em',
    fontWeight: 800,
    color: C.primary,
  },
  heroTitle: {
    margin: 0,
    fontSize: '34px',
    lineHeight: 1.15,
    color: C.text,
  },
  heroDescription: {
    margin: 0,
    maxWidth: '680px',
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#5F6471',
  },
  heroActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  primaryLink: {
    padding: '11px 16px',
    borderRadius: '999px',
    background: '#fff',
    color: C.text,
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 800,
    border: `1px solid ${C.borderLight}`,
  },
  heroAside: {
    display: 'grid',
    gap: '14px',
  },
  heroSpotlight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '22px',
    borderRadius: '24px',
    background: 'linear-gradient(145deg, #FFF1EE 0%, #FFF9F7 55%, #F7F3EF 100%)',
    border: '1px solid #EFD9D2',
    color: '#2F3640',
  },
  heroSpotlightLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#C4634E',
  },
  heroSpotlightValue: {
    fontSize: '32px',
    lineHeight: 1.1,
    fontWeight: 800,
    color: '#2F3640',
  },
  heroSpotlightNote: {
    fontSize: '13px',
    color: '#6A5F5A',
  },
  heroMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  },
  heroMetaCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '18px',
    borderRadius: '22px',
    background: '#fff',
    border: `1px solid ${C.borderLight}`,
  },
  heroMetaLabel: {
    fontSize: '12px',
    color: C.textSub,
    fontWeight: 700,
  },
  heroMetaValue: {
    fontSize: '24px',
    lineHeight: 1.1,
    color: C.text,
    fontWeight: 800,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '22px',
    borderRadius: '24px',
    border: `1px solid ${C.borderLight}`,
    boxShadow: '0 14px 30px rgba(17, 17, 17, 0.04)',
    animation: 'adminFadeUp 560ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  kpiLabel: {
    fontSize: '13px',
    color: C.textSub,
    fontWeight: 700,
  },
  kpiValue: {
    fontSize: '29px',
    lineHeight: 1.1,
    color: C.text,
    fontWeight: 800,
  },
  kpiDescription: {
    fontSize: '13px',
    color: '#6B7280',
    lineHeight: 1.5,
  },
  kpiSubValue: {
    fontSize: '11px',
    color: '#8A909C',
    marginTop: '-4px',
    lineHeight: 1.4,
    wordBreak: 'break-all',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  splitCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    padding: '22px',
    borderRadius: '24px',
    background: '#fff',
    border: `1px solid ${C.borderLight}`,
    animation: 'adminFadeUp 620ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  splitBar: {
    display: 'flex',
    width: '100%',
    height: '18px',
    overflow: 'hidden',
    borderRadius: '999px',
    background: '#F3F4F6',
  },
  splitBarSegment: {
    height: '100%',
  },
  chartSummary: {
    display: 'grid',
    gridTemplateColumns: '128px minmax(0, 1fr)',
    gap: '16px',
    alignItems: 'center',
  },
  chartSummaryText: {
    display: 'grid',
    gap: '6px',
  },
  chartHeadline: {
    fontSize: '15px',
    lineHeight: 1.5,
    color: C.text,
  },
  chartSummaryMeta: {
    fontSize: '12px',
    color: '#7A808C',
  },
  donutChart: {
    width: '128px',
    height: '128px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
    animation: 'adminScaleIn 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  donutInner: {
    width: '78px',
    height: '78px',
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    boxShadow: '0 12px 22px rgba(15, 23, 42, 0.08)',
  },
  donutValue: {
    fontSize: '20px',
    lineHeight: 1,
    color: C.text,
    fontWeight: 800,
  },
  donutLabel: {
    fontSize: '11px',
    color: '#7A808C',
    fontWeight: 700,
  },
  successFill: {
    background: 'linear-gradient(90deg, #2B8A62 0%, #7BCFA0 100%)',
  },
  warningFill: {
    background: 'linear-gradient(90deg, #F3C45D 0%, #E28B3A 100%)',
  },
  mixList: {
    display: 'grid',
    gap: '12px',
  },
  mixRow: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: '18px',
    background: '#FAFAFA',
    gap: '12px',
    animation: 'adminFadeUp 560ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  mixDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  mixDotSuccess: {
    background: '#2B8A62',
  },
  mixDotWarning: {
    background: '#E28B3A',
  },
  mixLabel: {
    fontSize: '14px',
    fontWeight: 800,
    color: C.text,
  },
  mixCount: {
    marginTop: '4px',
    fontSize: '13px',
    color: C.textSub,
  },
  mixRatio: {
    fontSize: '22px',
    fontWeight: 800,
    color: C.text,
  },
  typeMixList: {
    display: 'grid',
    gap: '14px',
  },
  typeMixHero: {
    display: 'grid',
    gridTemplateColumns: '128px minmax(0, 1fr)',
    gap: '16px',
    alignItems: 'center',
    padding: '4px 0 6px',
  },
  typeMixItem: {
    position: 'relative',
    display: 'grid',
    gap: '10px',
    padding: '16px 18px',
    borderRadius: '20px',
    background: '#fff',
    border: `1px solid ${C.borderLight}`,
    animation: 'adminFadeUp 560ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  typeMixHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
  },
  typeMixLabel: {
    fontSize: '14px',
    color: C.text,
  },
  typeMixRatio: {
    fontSize: '15px',
    fontWeight: 800,
    color: C.primary,
  },
  progressTrack: {
    width: '100%',
    height: '10px',
    borderRadius: '999px',
    overflow: 'hidden',
    background: '#F1F3F5',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #E8484A 0%, #F2A08A 100%)',
    animation: 'adminGrowX 760ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  typeMixMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '12px',
    color: '#69707D',
  },
  revenuePanel: {
    padding: '24px',
    borderRadius: '28px',
    border: `1px solid ${C.borderLight}`,
    background: 'linear-gradient(180deg, #FBFBFB 0%, #FFFFFF 100%)',
  },
  revenuePanelHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },
  revenuePanelTitle: {
    display: 'block',
    fontSize: '18px',
    color: C.text,
    marginBottom: '6px',
  },
  revenuePanelCopy: {
    margin: 0,
    fontSize: '13px',
    color: '#6B7280',
    lineHeight: 1.5,
  },
  revenuePanelBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#8B3B3D',
    background: '#FFF1F1',
  },
  lineChartFrame: {
    position: 'relative',
    height: '96px',
    marginBottom: '12px',
    borderRadius: '18px',
    background: 'linear-gradient(180deg, rgba(232,72,74,0.06) 0%, rgba(232,72,74,0) 100%)',
    overflow: 'hidden',
  },
  lineChartSvg: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  lineAreaPath: {
    fill: 'rgba(232, 72, 74, 0.12)',
    stroke: 'none',
  },
  lineStrokePath: {
    fill: 'none',
    stroke: '#D94A4D',
    strokeWidth: 2.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: '160',
    strokeDashoffset: '160',
    animation: 'adminDrawLine 1100ms ease-out both',
  },
  linePoint: {
    fill: '#FFFFFF',
    stroke: '#D94A4D',
    strokeWidth: 1.6,
  },
  linePointActive: {
    fill: '#D94A4D',
    stroke: '#FFFFFF',
    strokeWidth: 1.6,
  },
  revenueBars: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '16px',
    alignItems: 'end',
    minHeight: '320px',
  },
  revenueBarItem: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    minHeight: '280px',
    animation: 'adminFadeUp 620ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  barValue: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#5B6270',
  },
  barTrack: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    padding: '10px 0',
    borderRadius: '22px',
    background: 'linear-gradient(180deg, #F7F7F8 0%, #EFEFEF 100%)',
  },
  barFill: {
    width: '58px',
    minHeight: '28px',
    borderRadius: '18px 18px 8px 8px',
    background: 'linear-gradient(180deg, #F2B09A 0%, #E8484A 100%)',
    boxShadow: '0 12px 18px rgba(203, 98, 71, 0.18)',
    animation: 'adminBarRise 760ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  seriesGroup: {
    width: '100%',
    display: 'grid',
    gap: '6px',
  },
  seriesRow: {
    display: 'grid',
    gridTemplateColumns: '34px minmax(0, 1fr) 28px',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  seriesLabel: {
    fontSize: '11px',
    fontWeight: 800,
    textAlign: 'left',
  },
  seriesLabelBooking: {
    color: '#304A85',
  },
  seriesLabelCancel: {
    color: '#9B5A1A',
  },
  seriesTrack: {
    width: '100%',
    height: '6px',
    borderRadius: '999px',
    background: '#EEF1F5',
    overflow: 'hidden',
  },
  seriesFill: {
    height: '100%',
    borderRadius: '999px',
    animation: 'adminGrowX 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  seriesFillBooking: {
    background: 'linear-gradient(90deg, #8CAAE8 0%, #4665B1 100%)',
  },
  seriesFillCancel: {
    background: 'linear-gradient(90deg, #F4CF8A 0%, #DA8A31 100%)',
  },
  seriesValue: {
    fontSize: '11px',
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: 700,
  },
  barMonth: {
    fontSize: '14px',
    color: C.text,
  },
  barMeta: {
    fontSize: '12px',
    color: C.textSub,
  },
  barMetaMuted: {
    fontSize: '11px',
    color: '#8A909C',
  },
  rankList: {
    display: 'grid',
    gap: '14px',
  },
  rankCard: {
    position: 'relative',
    display: 'grid',
    gap: '12px',
    padding: '18px',
    borderRadius: '22px',
    border: `1px solid ${C.borderLight}`,
    background: '#fff',
    animation: 'adminFadeUp 560ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  rankHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  rankIndex: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#FFF1F1',
    color: C.primary,
    fontSize: '13px',
    fontWeight: 800,
  },
  rankTitle: {
    fontSize: '15px',
    color: C.text,
  },
  rankSub: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#6B7280',
  },
  rankFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '13px',
    color: C.textSub,
    alignItems: 'center',
  },
  typeRevenueCard: {
    position: 'relative',
    display: 'grid',
    gap: '10px',
    padding: '18px',
    borderRadius: '22px',
    border: `1px solid ${C.borderLight}`,
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFCFC 100%)',
    animation: 'adminFadeUp 560ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  hoverTooltip: {
    position: 'absolute',
    left: '18px',
    bottom: 'calc(100% + 10px)',
    minWidth: '168px',
    display: 'grid',
    gap: '4px',
    padding: '12px 13px',
    borderRadius: '14px',
    background: 'rgba(26, 28, 36, 0.96)',
    color: '#fff',
    boxShadow: '0 18px 34px rgba(15, 23, 42, 0.22)',
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translateY(8px)',
    transition: 'opacity 160ms ease, transform 160ms ease',
    zIndex: 5,
  },
  tooltipTitle: {
    fontSize: '12px',
    fontWeight: 800,
    lineHeight: 1.4,
  },
  tooltipLine: {
    fontSize: '11px',
    lineHeight: 1.45,
    color: 'rgba(255,255,255,0.84)',
  },
  typeRevenueHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
  },
  typeRevenueRatio: {
    fontSize: '14px',
    fontWeight: 800,
    color: C.primary,
  },
  typeRevenueMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '12px',
    color: '#69707D',
  },
  typeRevenueValue: {
    fontSize: '24px',
    lineHeight: 1.15,
    color: C.text,
    fontWeight: 800,
  },
};
