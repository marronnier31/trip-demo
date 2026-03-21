import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildImageVariant as buildImageVariantFromComponent, HorizontalLodgingRow as HomeHorizontalLodgingRow, PromoEventRow as HomePromoEventRow } from '../../components/home/HomeSections';
import SearchBar from '../../components/lodging/SearchBar';
import { getLodgings } from '../../api/lodging';
import { EVENT_ITEMS } from '../../mock/eventData';
import { PROMOTION_ITEMS } from '../../mock/promotionData';
import { C } from '../../styles/tokens';

const quickThemes = [
  { label: '국내숙소', emoji: '🏨', to: '/lodgings' },
  { label: '해외숙소', emoji: '✈️', to: '/overseas' },
  { label: '패키지 여행', emoji: '🎁', to: '/packages' },
  { label: '항공', emoji: '🛫', to: '/flights' },
  { label: '항공+숙소', emoji: '🛄', to: '/flight-stays' },
  { label: '레저·티켓', emoji: '🎫', to: '/leisure' },
  { label: '렌터카', emoji: '🚗', to: '/cars' },
  { label: '공간대여', emoji: '🏢', to: '/spaces' },
];

const regionNamePools = {
  제주: [
    '한라산 뷰 펜션',
    '제주 오션 브리즈 하우스',
    '애월 선셋 스테이',
    '제주 돌담 감성 숙소',
    '협재 라군 스위트',
    '성산 시뷰 리조트',
    '중문 가든 빌라',
    '함덕 파노라마 호텔',
    '제주 바람길 하우스',
    '서귀포 코지 펜션',
  ],
  부산: [
    '광안리 오션 호텔',
    '해운대 시그니처 스테이',
    '송정 비치 하우스',
    '남포 감성 게스트하우스',
    '기장 씨사이드 리조트',
    '부산 야경 루프탑 하우스',
    '광안 브릿지 뷰 스위트',
    '해운대 마리나 호텔',
    '다대포 선셋 스테이',
    '부산 코스트 펜션',
  ],
  강원: ['강릉 해변 펜션', '속초 오션 호텔', '평창 포레스트 리조트', '춘천 레이크 하우스'],
  서울: ['서울 시티 스테이', '강남 어반 호텔', '한강 브리즈 하우스', '북촌 한옥 스테이'],
};

function formatPrice(value) {
  return Number(value || 0).toLocaleString();
}

function buildImageVariant(url, seedSuffix) {
  if (!url) return url;

  const safeSeed = String(seedSuffix)
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'tripzone';

  if (url.includes('picsum.photos/seed/')) {
    return url.replace(/\/seed\/([^/]+)\//, `/seed/$1-${safeSeed}/`);
  }

  const hasQuery = url.includes('?');
  return `${url}${hasQuery ? '&' : '?'}v=${encodeURIComponent(safeSeed)}`;
}

function handleCardKeyDown(event, onActivate) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onActivate();
}

function PromoEventCard({ banner }) {
  return (
    <article style={s.promoItem} className="tz-lift-soft tz-promo-card">
      <div style={{ ...s.promoVisualShell, background: banner.gradient }}>
        <div>
          <p style={s.promoLead}>{banner.lead}</p>
          <h3 style={s.promoTitle}>{banner.title}</h3>
          <p style={s.promoSub}>{banner.subtitle}</p>
          <p style={s.promoDate}>{banner.date}</p>
        </div>
        <div style={{ ...s.promoCircle, background: banner.circle }}>
          <img src={banner.imageUrl} alt={banner.subtitle} style={s.promoCircleImage} className="tz-promo-image" />
        </div>
      </div>
    </article>
  );
}

function PromoEventRow({ banners }) {
  const railRef = useRef(null);

  const scrollByAmount = (amount) => {
    railRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleWheel = (event) => {
    if (!railRef.current) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      railRef.current.scrollLeft += event.deltaY;
    }
  };

  return (
    <div style={s.promoStage}>
      <button style={{ ...s.floatArrowBtn, ...s.floatArrowLeft }} onClick={() => scrollByAmount(-760)} aria-label="이전 이벤트">‹</button>
      <div ref={railRef} style={s.promoRail} className="tz-horizontal" onWheel={handleWheel}>
        {banners.map((banner) => (
          <PromoEventCard key={banner.title} banner={banner} />
        ))}
      </div>
      <button style={{ ...s.floatArrowBtn, ...s.floatArrowRight }} onClick={() => scrollByAmount(760)} aria-label="다음 이벤트">›</button>
    </div>
  );
}

function HorizontalLodgingRow({ title, cards, onMove, onOpenAll }) {
  const railRef = useRef(null);

  const scrollByAmount = (amount) => {
    railRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleWheel = (event) => {
    if (!railRef.current) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      railRef.current.scrollLeft += event.deltaY;
    }
  };

  return (
    <section style={s.rowSection}>
      <div style={s.rowHeader}>
        <h3 style={s.rowTitle}>{title}</h3>
      </div>

      <div style={s.railStage}>
        <button style={{ ...s.floatArrowBtn, ...s.floatArrowLeft }} onClick={() => scrollByAmount(-760)} aria-label="이전 숙소">‹</button>
        <div ref={railRef} style={s.rail} className="tz-horizontal" onWheel={handleWheel}>
          {cards.map((lodging, idx) => (
            <article key={lodging.cardKey} style={s.railCard} className="tz-lift-soft" onClick={() => onMove(lodging.lodgingId)}>
              <div style={s.railImgWrap}>
                <img src={lodging.thumbnailUrl} alt={lodging.name} style={s.railImg} />
                <span style={s.railBadge}>게스트 선호</span>
                <button style={s.heartBtn} aria-label="찜">♡</button>
              </div>
              <div style={s.railBody}>
                <p style={s.railName}>{lodging.region}의 {lodging.name}</p>
                <p style={s.railMeta}>총액 ₩{formatPrice(lodging.pricePerNight + idx * 2700)} · ★{(4.7 + (idx % 5) * 0.06).toFixed(2)}</p>
              </div>
            </article>
          ))}

          <button style={s.railTail} onClick={onOpenAll}>
            <div style={s.railTailPreview}>
              {cards.slice(0, 3).map((item, index) => (
                <img
                  key={`${item.cardKey}-preview`}
                  src={item.thumbnailUrl}
                  alt=""
                  style={{
                    ...s.railTailPreviewImg,
                    left: `${22 + index * 30}px`,
                    transform: `translateX(-50%) rotate(${index === 0 ? -8 : index === 2 ? 8 : 0}deg)`,
                    zIndex: index + 1,
                  }}
                />
              ))}
            </div>
            <span style={s.railTailLabel}>전체 보기</span>
          </button>
        </div>
        <button style={{ ...s.floatArrowBtn, ...s.floatArrowRight }} onClick={() => scrollByAmount(760)} aria-label="다음 숙소">›</button>
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [lodgings, setLodgings] = useState([]);

  useEffect(() => {
    getLodgings()
      .then((res) => setLodgings(res.data))
      .catch(() => setLodgings([]));
  }, []);

  const themeLoop = useMemo(() => [...quickThemes, ...quickThemes], []);
  const promoBanners = useMemo(
    () => PROMOTION_ITEMS.map((item) => ({ ...item, onClick: () => navigate(`/promotions/${item.slug}`) })),
    [navigate]
  );
  const eventCards = useMemo(() => EVENT_ITEMS.slice(0, 4), []);
  const newOpenings = useMemo(() => {
    if (!lodgings.length) return [];
    return Array.from({ length: 2 }).flatMap((_, idx) =>
      lodgings.slice(0, 6).map((item) => ({
        ...item,
        cardKey: `new-${item.lodgingId}-${idx}`,
        thumbnailUrl: buildImageVariantFromComponent(item.thumbnailUrl, `new-${idx}-${item.lodgingId}`),
      }))
    );
  }, [lodgings]);

  const lodgingRows = useMemo(() => {
    const rowDefs = [
      { region: '제주', title: '제주의 인기 숙소', cardCount: 28 },
      { region: '부산', title: '이번 주말 예약 가능한 부산 숙소', cardCount: 22 },
      { region: '강원', title: '강원 힐링 스테이 모음', cardCount: 14 },
      { region: '서울', title: '서울 시티 스테이 추천', cardCount: 14 },
    ];

    return rowDefs.map((row, rowIdx) => {
      const source = lodgings.filter((item) => item.region === row.region);
      const seed = source.length ? source : lodgings;
      const loopCount = Math.max(4, Math.ceil(row.cardCount / Math.max(seed.length, 1)));
      const pool = regionNamePools[row.region] || [];

      const cards = Array.from({ length: loopCount }).flatMap((_, loopIdx) =>
        seed.map((item, itemIdx) => {
          const variantIdx = loopIdx * seed.length + itemIdx;
          const variantName = pool.length ? pool[variantIdx % pool.length] : item.name;

          return {
            ...item,
            region: row.region,
            name: variantName,
            cardKey: `${row.region}-${item.lodgingId}-${rowIdx}-${loopIdx}-${itemIdx}`,
            pricePerNight: item.pricePerNight + ((variantIdx % 5) * 3200),
            thumbnailUrl: buildImageVariantFromComponent(item.thumbnailUrl, `${row.region}-${variantIdx}-${item.lodgingId}`),
          };
        })
      );

      return {
        ...row,
        cards: cards.slice(0, row.cardCount),
      };
    });
  }, [lodgings]);

  return (
    <div style={s.page}>
      <style>{`
        .tz-theme-track { animation: tz-marquee 26s linear infinite; }
        .tz-theme-track:hover { animation-play-state: paused; }
        .tz-lift-soft { transition: transform .22s ease, box-shadow .22s ease; }
        .tz-lift-soft:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,.12); }
        .tz-horizontal::-webkit-scrollbar { display: none; }
        .tz-promo-card:hover .tz-promo-image { transform: scale(1.05); }
        .tz-promo-image { transition: transform 0.3s ease; }
        .tz-theme-orb-wrap:hover .tz-theme-orb { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); border-color: ${C.primary}; }
        .tz-theme-orb { transition: all 0.2s ease; }
        .tz-focus-card:focus-visible {
          outline: 3px solid ${C.primary};
          outline-offset: 4px;
          border-radius: 24px;
        }
        @keyframes tz-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (max-width: 1024px) {
          .tz-theme-track { animation: none; }
        }
      `}</style>

      <section style={s.hero}>
        <div style={s.heroGlowA} />
        <div style={s.heroGlowB} />
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <p style={s.heroEyebrow}>TRIPZONE TRAVEL PLATFORM</p>
            <h1 style={s.heroTitle}>국내 숙소를 더 똑똑하게,
              <br />
              지도로 보고 바로 예약하세요.
            </h1>
            <p style={s.heroDesc}>사용자, 판매자, 관리자 역할을 분리해 예약부터 운영 관리까지 한 번에 연결합니다.</p>
          </div>
          <div style={s.heroRight}>
            <div style={s.searchShell}>
              <SearchBar showTabs />
            </div>
            <div style={s.themeWrap}>
              <div style={s.themeTrack} className="tz-theme-track">
                {themeLoop.map((theme, idx) => (
                  <button key={`${theme.label}-${idx}`} style={s.themeChip} className="tz-theme-orb-wrap" onClick={() => navigate(theme.to)}>
                    <span style={s.themeOrb} className="tz-theme-orb"><span style={s.themeOrbEmoji}>{theme.emoji}</span></span>
                    <span style={s.themeLabel}>{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={s.sectionCompact}>
        <div style={s.inner}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>진행 중인 프로모션</h2>
            <button style={s.linkBtn} onClick={() => navigate('/promotions')}>더보기</button>
          </div>
          <HomePromoEventRow banners={promoBanners} />
        </div>
      </section>

      <section style={s.sectionCompact}>
        <div style={s.inner}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>참여형 이벤트</h2>
            <button style={s.linkBtn} onClick={() => navigate('/events')}>더보기</button>
          </div>
          <div style={s.eventGrid}>
            {eventCards.map((item) => (
              <article
                key={item.slug}
                style={s.eventCard}
                className="tz-lift-soft tz-focus-card"
                onClick={() => navigate(`/events/${item.slug}`)}
                onKeyDown={(event) => handleCardKeyDown(event, () => navigate(`/events/${item.slug}`))}
                role="link"
                tabIndex={0}
              >
                <div style={{ ...s.eventVisual, background: item.gradient }}>
                  <div>
                    <p style={s.eventLead}>{item.lead}</p>
                    <h3 style={s.eventTitle}>{item.title}</h3>
                    <p style={s.eventSubtitle}>{item.subtitle}</p>
                  </div>
                  <div style={{ ...s.eventCircle, background: item.circle }}>
                    <img src={item.imageUrl} alt={item.subtitle} style={s.eventImage} />
                  </div>
                </div>
                <div style={s.eventBody}>
                  <p style={s.eventDate}>{item.date}</p>
                  <p style={s.eventDesc}>{item.description}</p>
                  <span style={s.eventAction}>이벤트 참여 정보 보기</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={s.sectionAlt}>
        <div style={s.inner}>
          {lodgingRows.map((row) => (
            <HomeHorizontalLodgingRow
              key={row.title}
              title={row.title}
              cards={row.cards}
              onMove={(lodgingId) => navigate(`/lodgings/${lodgingId}`)}
              onOpenAll={() => navigate(`/lodgings?region=${row.region}`)}
            />
          ))}
        </div>
      </section>

      <section style={s.sectionCompact}>
        <div style={s.inner}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>새로 등록된 숙소</h2>
            <button style={s.linkBtn} onClick={() => navigate('/lodgings')}>더보기</button>
          </div>
          <div style={s.newGrid}>
            {newOpenings.map((lodging) => (
              <article
                key={lodging.cardKey}
                style={s.newCard}
                className="tz-lift-soft tz-focus-card"
                onClick={() => navigate(`/lodgings/${lodging.lodgingId}`)}
                onKeyDown={(event) => handleCardKeyDown(event, () => navigate(`/lodgings/${lodging.lodgingId}`))}
                role="link"
                tabIndex={0}
              >
                <img src={lodging.thumbnailUrl} alt={lodging.name} style={s.newCardImg} />
                <div style={s.newCardBody}>
                  <p style={s.newCardRegion}>{lodging.region}</p>
                  <p style={s.newCardName}>{lodging.name}</p>
                  <p style={s.newCardPrice}>1박 {formatPrice(lodging.pricePerNight)}원부터</p>
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
  page: {
    background: '#F9F7F5',
    color: C.text,
    fontFamily: 'Manrope, "Noto Sans KR", sans-serif',
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    padding: '76px 30px 58px',
    background: 'linear-gradient(155deg, #FFF8F1 0%, #FFF 56%, #FDEEEE 100%)',
    borderBottom: '1px solid #F2E8E8',
  },
  heroGlowA: {
    position: 'absolute',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    top: '-180px',
    right: '-120px',
    background: 'radial-gradient(circle, rgba(232,72,74,0.22) 0%, rgba(232,72,74,0) 70%)',
  },
  heroGlowB: {
    position: 'absolute',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    bottom: '-180px',
    left: '-100px',
    background: 'radial-gradient(circle, rgba(240,140,80,0.18) 0%, rgba(240,140,80,0) 70%)',
  },
  heroInner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 'min(1600px, calc(100vw - 56px))',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '0.9fr 1.1fr',
    gap: '30px',
    alignItems: 'center',
  },
  heroLeft: { minWidth: 0 },
  heroEyebrow: {
    margin: '0 0 14px',
    fontSize: '11px',
    color: '#D64A4C',
    letterSpacing: '0.15em',
    fontWeight: 800,
  },
  heroTitle: {
    margin: '0 0 14px',
    fontSize: 'clamp(30px, 4vw, 50px)',
    lineHeight: 1.08,
    letterSpacing: '-0.02em',
  },
  heroDesc: {
    margin: 0,
    color: '#555555',
    fontSize: '15px',
    lineHeight: 1.7,
    maxWidth: '560px',
  },
  heroRight: { minWidth: 0 },
  searchShell: {
    background: 'rgba(255, 255, 255, 0.45)', // more transparent to show gradient/glow
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.04)',
  },
  themeWrap: {
    marginTop: '16px',
    overflow: 'hidden',
    paddingBottom: '4px',
  },
  themeTrack: {
    display: 'flex',
    width: 'max-content',
    gap: '10px',
  },
  themeChip: {
    border: 'none',
    borderRadius: '18px',
    background: 'transparent',
    padding: '6px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    minWidth: '84px',
    cursor: 'pointer',
  },
  themeOrb: {
    width: '68px',
    height: '68px',
    borderRadius: '24px',
    background: '#FFFFFF',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  themeOrbEmoji: {
    fontSize: '30px',
    lineHeight: 1,
  },
  themeLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#4A4A4A',
    whiteSpace: 'nowrap',
  },
  sectionCompact: { padding: '38px 30px' },
  sectionAlt: { padding: '34px 30px 26px', background: '#FFFFFF' },
  inner: { maxWidth: 'min(1600px, calc(100vw - 56px))', margin: '0 auto' },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: 'clamp(22px, 2.5vw, 31px)',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  linkBtn: {
    border: 'none',
    background: 'none',
    fontWeight: 700,
    fontSize: '13px',
    color: '#D64A4C',
    cursor: 'pointer',
  },
  promoStage: {
    position: 'relative',
  },
  promoRail: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    overflowY: 'hidden',
    padding: '2px 2px 10px',
    scrollbarWidth: 'none',
  },
  promoItem: { minWidth: '380px', flexShrink: 0 },
  promoVisualShell: {
    borderRadius: '24px',
    minHeight: '172px',
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    border: '1px solid rgba(255,255,255,0.6)',
  },
  promoLead: { margin: 0, color: '#5A5A5A', fontSize: '10px', fontWeight: 700 },
  promoTitle: {
    margin: '6px 0 0',
    fontSize: 'clamp(18px, 2.1vw, 28px)',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    color: '#2F2F2F',
    whiteSpace: 'pre-line',
    fontWeight: 800,
  },
  promoCircle: {
    width: '88px',
    height: '88px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  promoCircleImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '999px' },
  promoSub: { margin: '10px 0 2px', fontSize: '13px', fontWeight: 700, color: '#343434' },
  promoDate: { margin: 0, fontSize: '12px', color: '#777777', fontWeight: 500 },
  eventGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' },
  eventCard: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' },
  eventVisual: { minHeight: '200px', padding: '22px', display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'center' },
  eventLead: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.primary },
  eventTitle: { margin: '0 0 10px', fontSize: '24px', lineHeight: 1.15, color: C.text, whiteSpace: 'pre-line' },
  eventSubtitle: { margin: 0, fontSize: '14px', color: C.textSub, fontWeight: '700' },
  eventCircle: { width: '84px', height: '84px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  eventImage: { width: '100%', height: '100%', objectFit: 'cover' },
  eventBody: { padding: '20px 22px 22px' },
  eventDate: { margin: '0 0 10px', fontSize: '13px', color: C.textLight, fontWeight: '700' },
  eventDesc: { margin: '0 0 16px', fontSize: '14px', lineHeight: 1.7, color: C.textSub },
  eventAction: { display: 'inline-flex', padding: '10px 14px', borderRadius: '999px', background: '#FFF1F1', color: C.primary, fontSize: '13px', fontWeight: '800' },
  rowSection: { marginBottom: '34px' },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  rowTitle: { margin: 0, fontSize: 'clamp(27px, 2.4vw, 36px)', letterSpacing: '-0.02em' },
  railStage: { position: 'relative' },
  floatArrowBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '999px',
    border: '1px solid #DDDDDD',
    background: '#FFFFFFE8',
    boxShadow: '0 8px 18px rgba(0,0,0,0.14)',
    color: '#4B4B4B',
    fontSize: '24px',
    lineHeight: 1,
    cursor: 'pointer',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 3,
  },
  floatArrowLeft: { left: '-10px' },
  floatArrowRight: { right: '-10px' },
  rail: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: '8px',
    scrollbarWidth: 'none',
  },
  railCard: {
    width: '238px',
    flexShrink: 0,
    cursor: 'pointer',
  },
  railImgWrap: {
    position: 'relative',
    borderRadius: '18px',
    overflow: 'hidden',
    height: '225px',
    background: '#EDEDED',
  },
  railImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  railBadge: {
    position: 'absolute',
    left: '10px',
    top: '10px',
    borderRadius: '999px',
    background: '#FFFFFFCC',
    border: '1px solid #E8E8E8',
    color: '#3F3F3F',
    fontSize: '10px',
    padding: '5px 9px',
    fontWeight: 700,
  },
  heartBtn: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    width: '30px',
    height: '30px',
    borderRadius: '999px',
    border: '1px solid #FFFFFFAA',
    background: '#1F1F1F77',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  railBody: { padding: '9px 4px 0' },
  railName: {
    margin: '0 0 4px',
    fontSize: '16px',
    color: '#2B2B2B',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  railMeta: { margin: 0, fontSize: '13px', color: '#747474', fontWeight: 600 },
  railTail: {
    width: '210px',
    height: '225px',
    flexShrink: 0,
    borderRadius: '18px',
    border: '1px solid #E8DCDC',
    background: 'linear-gradient(150deg, #FFFDFB 0%, #FFF6F7 55%, #F5F8FF 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#4B4B4B',
    cursor: 'pointer',
  },
  railTailPreview: {
    position: 'relative',
    width: '108px',
    height: '58px',
  },
  railTailPreviewImg: {
    position: 'absolute',
    top: 0,
    width: '52px',
    height: '52px',
    objectFit: 'cover',
    borderRadius: '10px',
    border: '2px solid #fff',
    boxShadow: '0 7px 14px rgba(0,0,0,0.16)',
    transformOrigin: 'center',
  },
  railTailLabel: {
    fontSize: '18px',
    fontWeight: 800,
    letterSpacing: '-0.01em',
  },
  newGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  newCard: {
    background: '#fff',
    border: '1px solid #E7E1E1',
    borderRadius: '14px',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  newCardImg: { width: '100%', height: '150px', objectFit: 'cover', display: 'block' },
  newCardBody: { padding: '12px 12px 14px' },
  newCardRegion: { margin: '0 0 4px', fontSize: '11px', color: '#7A7A7A' },
  newCardName: { margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#2F2F2F' },
  newCardPrice: { margin: 0, fontSize: '13px', color: '#4B4B4B', fontWeight: 700 },
};
