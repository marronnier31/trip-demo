import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../../styles/tokens';
import { useWishlist } from '../../hooks/useWishlist';

function getStayTags(lodging) {
  const tags = [];
  const region = String(lodging.region || '');
  const rating = Number(lodging.rating || 0);
  const price = Number(lodging.pricePerNight || 0);

  if (region.includes('제주') || region.includes('부산') || region.includes('강릉') || region.includes('속초')) {
    tags.push('인기 여행지');
  } else if (region.includes('서울')) {
    tags.push('도심 접근');
  }

  if (rating >= 4.8) tags.push('평점 우수');
  if (price <= 120000) tags.push('가성비');

  return tags.slice(0, 3);
}

export default function LodgingCard({ lodging }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { lodgingId, name, region, address, pricePerNight, thumbnailUrl, rating } = lodging;
  const isActive = hovered || focused;
  const stayTags = getStayTags(lodging);

  const goToDetail = () => navigate(`/lodgings/${lodgingId}`);

  const handleCardKeyDown = (event) => {
    if (event.currentTarget !== event.target) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToDetail();
    }
  };

  return (
    <div
      style={{
        ...s.card,
        transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: focused
          ? '0 0 0 3px rgba(232,72,74,0.18), 0 16px 32px rgba(0,0,0,0.1)'
          : isActive
            ? '0 16px 32px rgba(0,0,0,0.1)'
            : '0 4px 12px rgba(0,0,0,0.05)',
        borderColor: isActive ? 'rgba(232,72,74,0.34)' : 'rgba(0,0,0,0.04)',
      }}
      onClick={goToDetail}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      role="link"
      tabIndex={0}
      aria-label={`${name} 숙소 상세 보기`}
    >
      <div style={s.imgWrap}>
        <button
          type="button"
          style={{ ...s.heartBtn, ...(isWishlisted(lodgingId) ? s.heartBtnActive : null) }}
          onClick={(event) => {
            event.stopPropagation();
            toggleWishlist(lodging);
          }}
          aria-label="찜"
        >
          {isWishlisted(lodgingId) ? '♥' : '♡'}
        </button>
        <img
          src={thumbnailUrl}
          alt={name}
          style={{ ...s.img, transform: isActive ? 'scale(1.05)' : 'scale(1)' }}
        />
      </div>
      <div style={s.body}>
        <div style={s.topRow}>
          <span style={s.region}>{region}</span>
          <span style={s.rating}>★ {rating}</span>
        </div>
        <p style={s.name}>{name}</p>
        <p style={s.address}>{address}</p>
        {stayTags.length ? (
          <div style={s.tagRow}>
            {stayTags.map((tag) => (
              <span key={tag} style={s.tagChip}>{tag}</span>
            ))}
          </div>
        ) : null}
        <p style={s.price}>
          <strong style={s.priceNum}>{pricePerNight.toLocaleString()}원</strong>
          <span style={s.perNight}> / 1박</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  card: {
    cursor: 'pointer',
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.04)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s ease',
  },
  imgWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0',
    aspectRatio: '4 / 3',
    background: C.bgGray,
    marginBottom: 0,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
    display: 'block',
  },
  heartBtn: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    zIndex: 1,
    width: '32px',
    height: '32px',
    borderRadius: '999px',
    border: '1px solid #FFFFFFAA',
    background: '#1F1F1F77',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  heartBtnActive: {
    background: '#FFF1F1',
    color: C.primary,
    border: '1px solid #F4C7C8',
  },
  body: { padding: '12px 12px 13px', display: 'flex', flexDirection: 'column', flex: 1 },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  region: {
    fontSize: '12px',
    fontWeight: '600',
    color: C.textSub,
    letterSpacing: '0.02em',
  },
  rating: {
    fontSize: '12px',
    color: C.text,
    fontWeight: '500',
  },
  name: {
    fontSize: '15px',
    fontWeight: '600',
    color: C.text,
    margin: '0 0 2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.4',
  },
  address: {
    fontSize: '12px',
    color: C.textLight,
    margin: '0 0 6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    margin: '0 0 8px',
    minHeight: '26px',
    alignContent: 'flex-start',
  },
  tagChip: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '999px',
    background: '#F6F7F8',
    border: '1px solid #ECEFF2',
    color: '#55606D',
    fontSize: '11px',
    fontWeight: 700,
    padding: '5px 8px',
  },
  price: {
    fontSize: '14px',
    color: C.text,
    margin: 'auto 0 0',
  },
  priceNum: {
    fontWeight: '800',
    fontSize: '15px',
  },
  perNight: {
    fontSize: '12px',
    fontWeight: '400',
    color: C.textSub,
  },
};
