import { useRef } from 'react';
import { C } from '../../styles/tokens';
import { useWishlist } from '../../hooks/useWishlist';

function formatPrice(value) {
  return Number(value || 0).toLocaleString();
}

function handleCardKeyDown(event, onActivate) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onActivate();
}

function buildHomeCardTags(lodging, idx) {
  const tags = [];
  if ((idx % 3) === 0) tags.push('빠른 예약');
  if (Number(lodging.rating || 0) >= 4.8 || idx % 2 === 0) tags.push('평점 우수');
  if (Number(lodging.pricePerNight || 0) <= 120000) tags.push('가성비');
  return tags.slice(0, 2);
}

export function buildImageVariant(url, seedSuffix) {
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

function PromoEventCard({ banner }) {
  return (
    <article
      style={s.promoItem}
      className="tz-lift-soft tz-promo-card tz-focus-card"
      onClick={banner.onClick}
      onKeyDown={(event) => handleCardKeyDown(event, banner.onClick)}
      role="link"
      tabIndex={0}
    >
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

export function PromoEventRow({ banners }) {
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

export function HorizontalLodgingRow({ title, cards, onMove, onOpenAll }) {
  const railRef = useRef(null);
  const { isWishlistedVariant, toggleWishlist } = useWishlist();

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
            (() => {
              const homeTags = buildHomeCardTags(lodging, idx);
              return (
            <article
              key={lodging.cardKey}
              style={s.railCard}
              className="tz-lift-soft tz-focus-card"
              onClick={() => onMove(lodging.lodgingId)}
              onKeyDown={(event) => {
                if (event.currentTarget !== event.target) return;
                handleCardKeyDown(event, () => onMove(lodging.lodgingId));
              }}
              role="link"
              tabIndex={0}
            >
              <div style={s.railImgWrap}>
                <img src={lodging.thumbnailUrl} alt={lodging.name} style={s.railImg} />
                <span style={s.railBadge}>게스트 선호</span>
                <button
                  type="button"
                  style={{ ...s.heartBtn, ...(isWishlistedVariant(lodging.lodgingId, lodging.cardKey) ? s.heartBtnActive : null) }}
                  aria-label="찜"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleWishlist(lodging);
                  }}
                >
                  {isWishlistedVariant(lodging.lodgingId, lodging.cardKey) ? '♥' : '♡'}
                </button>
              </div>
              <div style={s.railBody}>
                <p style={s.railName}>{lodging.region}의 {lodging.name}</p>
                <p style={s.railMeta}>총액 ₩{formatPrice(lodging.pricePerNight + idx * 2700)} · ★{(4.7 + (idx % 5) * 0.06).toFixed(2)}</p>
                {homeTags.length ? (
                  <div style={s.railTagRow}>
                    {homeTags.map((tag) => (
                      <span key={`${lodging.cardKey}-${tag}`} style={s.railTag}>{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
              );
            })()
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

const s = {
  promoStage: { position: 'relative' },
  promoRail: { display: 'flex', gap: '10px', overflowX: 'auto', overflowY: 'hidden', padding: '2px 2px 10px', scrollbarWidth: 'none' },
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
    cursor: 'pointer',
  },
  promoLead: { margin: 0, color: '#5A5A5A', fontSize: '10px', fontWeight: 700 },
  promoTitle: { margin: '6px 0 0', fontSize: 'clamp(18px, 2.1vw, 28px)', lineHeight: 1.1, letterSpacing: '-0.03em', color: '#2F2F2F', whiteSpace: 'pre-line', fontWeight: 800 },
  promoCircle: { width: '88px', height: '88px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  promoCircleImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '999px' },
  promoSub: { margin: '10px 0 2px', fontSize: '13px', fontWeight: 700, color: '#343434' },
  promoDate: { margin: 0, fontSize: '12px', color: '#777777', fontWeight: 500 },
  rowSection: { marginBottom: '34px', paddingTop: '8px' },
  rowHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  rowTitle: { margin: 0, fontSize: 'clamp(27px, 2.4vw, 36px)', letterSpacing: '-0.02em' },
  railStage: { position: 'relative', paddingTop: '6px' },
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
  rail: { display: 'flex', gap: '12px', overflowX: 'auto', overflowY: 'visible', padding: '2px 0 8px', scrollbarWidth: 'none' },
  railCard: { width: '238px', flexShrink: 0, cursor: 'pointer' },
  railImgWrap: { position: 'relative', borderRadius: '18px', overflow: 'hidden', height: '225px', background: '#EDEDED' },
  railImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  railBadge: { position: 'absolute', left: '10px', top: '10px', borderRadius: '999px', background: '#FFFFFFCC', border: '1px solid #E8E8E8', color: '#3F3F3F', fontSize: '10px', padding: '5px 9px', fontWeight: 700 },
  heartBtn: { position: 'absolute', right: '10px', top: '10px', width: '30px', height: '30px', borderRadius: '999px', border: '1px solid #FFFFFFAA', background: '#1F1F1F77', color: '#fff', fontSize: '16px', cursor: 'pointer' },
  heartBtnActive: { background: '#FFF1F1', color: C.primary, border: '1px solid #F4C7C8' },
  railBody: { padding: '9px 4px 0' },
  railName: { margin: '0 0 4px', fontSize: '16px', color: '#2B2B2B', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  railMeta: { margin: 0, fontSize: '13px', color: '#747474', fontWeight: 600 },
  railTagRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  railTag: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '999px',
    background: '#F7F7F8',
    border: '1px solid #ECECEC',
    color: '#5A5A5A',
    fontSize: '11px',
    fontWeight: 700,
    padding: '5px 8px',
  },
  railTail: {
    width: '210px',
    height: '225px',
    flexShrink: 0,
    borderRadius: '18px',
    border: `1px solid ${C.borderLight}`,
    background: 'linear-gradient(150deg, #FFFDFB 0%, #FFF6F7 55%, #F5F8FF 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#4B4B4B',
    cursor: 'pointer',
  },
  railTailPreview: { position: 'relative', width: '108px', height: '58px' },
  railTailPreviewImg: { position: 'absolute', top: 0, width: '52px', height: '52px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #fff', boxShadow: '0 7px 14px rgba(0,0,0,0.16)', transformOrigin: 'center' },
  railTailLabel: { fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' },
};
