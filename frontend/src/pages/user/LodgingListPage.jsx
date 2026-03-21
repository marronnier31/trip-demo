import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import LodgingCard from '../../components/lodging/LodgingCard';
import SearchBar from '../../components/lodging/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { getLodgings } from '../../api/lodging';
import { C, MAX_WIDTH } from '../../styles/tokens';

const SORT_OPTIONS = [
  { value: 'default', label: '추천순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
  { value: 'rating', label: '평점 높은순' },
];

const REGION_FILTER_OPTIONS = [
  { value: 'all', label: '전체 지역' },
  { value: '서울', label: '서울' },
  { value: '부산', label: '부산' },
  { value: '제주', label: '제주' },
  { value: '강원', label: '강원' },
];

const RATING_FILTER_OPTIONS = [
  { value: 0, label: '상관없음' },
  { value: 4, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
  { value: 4.8, label: '4.8+' },
];

const REGION_ALIASES = {
  서울: ['서울', '서울특별시'],
  경기: ['경기', '경기도'],
  인천: ['인천', '인천광역시'],
  부산: ['부산', '부산광역시'],
  대구: ['대구', '대구광역시'],
  대전: ['대전', '대전광역시'],
  광주: ['광주', '광주광역시'],
  울산: ['울산', '울산광역시'],
  제주: ['제주', '제주도', '제주특별자치도'],
};

function normalizeRegionText(value) {
  return String(value || '').replace(/\s+/g, '').toLowerCase();
}

function isRegionMatch(lodgingRegion, selectedRegion) {
  if (!selectedRegion) return true;
  const lodging = normalizeRegionText(lodgingRegion);
  const aliasTargets = REGION_ALIASES[selectedRegion] || [selectedRegion];
  const aliasNormalized = aliasTargets.map(normalizeRegionText);
  return aliasNormalized.some((alias) => lodging === alias || lodging.includes(alias) || alias.includes(lodging));
}

function isKeywordMatch(lodging, keyword) {
  const term = normalizeRegionText(keyword);
  if (!term) return true;
  const haystack = [lodging.name, lodging.region, lodging.address, lodging.description]
    .map(normalizeRegionText)
    .join(' ');
  return haystack.includes(term);
}

function sortLodgings(list, sort) {
  const copy = [...list];
  if (sort === 'price_asc') return copy.sort((a, b) => a.pricePerNight - b.pricePerNight);
  if (sort === 'price_desc') return copy.sort((a, b) => b.pricePerNight - a.pricePerNight);
  if (sort === 'rating') return copy.sort((a, b) => b.rating - a.rating);
  return copy;
}

function hasValidCoordinate(lodging) {
  return Number.isFinite(Number(lodging.latitude)) && Number.isFinite(Number(lodging.longitude));
}

function applyAdvancedFilters(list, filters) {
  return list.filter((lodging) => {
    const price = Number(lodging.pricePerNight || 0);
    const rating = Number(lodging.rating || 0);
    const lodgingRegion = String(lodging.region || '');

    if (filters.regionFilter !== 'all' && lodgingRegion !== filters.regionFilter) return false;
    if (price < filters.minPrice || price > filters.maxPrice) return false;
    if (rating < filters.minRating) return false;
    return true;
  });
}

function buildPriceMarkerIcon(pricePerNight, active) {
  const amount = Number(pricePerNight || 0).toLocaleString();
  return L.divIcon({
    className: 'tz-price-marker-shell',
    html: `<div class="tz-price-marker${active ? ' is-active' : ''}">₩${amount}</div>`,
    iconSize: [96, 34],
    iconAnchor: [48, 17],
  });
}

function MapBoundsWatcher({ onBoundsChange }) {
  const map = useMapEvents({
    moveend() {
      onBoundsChange(map.getBounds());
    },
    zoomend() {
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

export default function LodgingListPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const keyword = params.get('keyword') || '';
  const region = params.get('region') || '';
  const benefit = params.get('benefit') || '';
  const scope = params.get('scope') || '';
  const checkIn = params.get('checkIn') || '';
  const checkOut = params.get('checkOut') || '';
  const guests = params.get('guests') || 2;

  const [sort, setSort] = useState('default');
  const [lodgings, setLodgings] = useState([]);
  const [mapBoundsDraft, setMapBoundsDraft] = useState(null);
  const [appliedBounds, setAppliedBounds] = useState(null);
  const [draftBoundsKey, setDraftBoundsKey] = useState('');
  const [appliedBoundsKey, setAppliedBoundsKey] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [activeLodgingId, setActiveLodgingId] = useState(null);
  const [regionFilter, setRegionFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(999999);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSort, setDraftSort] = useState('default');
  const [draftRegionFilter, setDraftRegionFilter] = useState('all');
  const [draftMinRating, setDraftMinRating] = useState(0);
  const [draftMinPrice, setDraftMinPrice] = useState(0);
  const [draftMaxPrice, setDraftMaxPrice] = useState(999999);

  useEffect(() => {
    getLodgings()
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        setLodgings(all.filter((lodging) => isRegionMatch(lodging.region, region) && isKeywordMatch(lodging, keyword)));
      })
      .catch(() => setLodgings([]));
  }, [keyword, region]);

  const visibleLodgings = useMemo(() => {
    if (!appliedBounds) return lodgings;
    return lodgings.filter((lodging) => {
      if (!hasValidCoordinate(lodging)) return false;
      return appliedBounds.contains([Number(lodging.latitude), Number(lodging.longitude)]);
    });
  }, [lodgings, appliedBounds]);

  const priceBounds = useMemo(() => {
    const prices = lodgings.map((item) => Number(item.pricePerNight || 0)).filter((value) => Number.isFinite(value));
    if (!prices.length) return { min: 0, max: 999999 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [lodgings]);

  const filteredVisibleLodgings = useMemo(() => {
    const filtered = applyAdvancedFilters(visibleLodgings, { regionFilter, minRating, minPrice, maxPrice });
    return sortLodgings(filtered, sort);
  }, [visibleLodgings, regionFilter, minRating, minPrice, maxPrice, sort]);

  const mapPoints = useMemo(
    () => filteredVisibleLodgings.filter(hasValidCoordinate).map((lodging) => [Number(lodging.latitude), Number(lodging.longitude)]),
    [filteredVisibleLodgings]
  );

  const activeFilterCount = Number(sort !== 'default')
    + Number(regionFilter !== 'all')
    + Number(minRating > 0)
    + Number(minPrice > priceBounds.min || maxPrice < priceBounds.max);

  const isBoundsDirty = Boolean(appliedBoundsKey && draftBoundsKey && appliedBoundsKey !== draftBoundsKey);

  const onBoundsChange = useCallback((bounds) => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const key = `${sw.lat.toFixed(4)},${sw.lng.toFixed(4)},${ne.lat.toFixed(4)},${ne.lng.toFixed(4)}`;
    setMapBoundsDraft(bounds);
    setDraftBoundsKey(key);
    if (!appliedBounds) {
      setAppliedBounds(bounds);
      setAppliedBoundsKey(key);
    }
  }, [appliedBounds]);

  useEffect(() => {
    if (!mapInstance) return;
    if (mapPoints.length > 1) {
      mapInstance.fitBounds(mapPoints, { padding: [40, 40] });
    } else if (mapPoints.length === 1) {
      mapInstance.setView(mapPoints[0], 12);
    }
  }, [mapInstance, mapPoints, region]);

  useEffect(() => {
    if (!mapInstance || !activeLodgingId) return;
    const target = filteredVisibleLodgings.find((lodging) => lodging.lodgingId === activeLodgingId && hasValidCoordinate(lodging));
    if (target) {
      mapInstance.panTo([Number(target.latitude), Number(target.longitude)], { animate: true, duration: 0.35 });
    }
  }, [activeLodgingId, mapInstance, filteredVisibleLodgings]);

  useEffect(() => {
    if (!filterOpen) return undefined;
    setDraftSort(sort);
    setDraftRegionFilter(regionFilter);
    setDraftMinRating(minRating);
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [filterOpen, sort, regionFilter, minRating, minPrice, maxPrice]);

  useEffect(() => {
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
    setDraftMinPrice(priceBounds.min);
    setDraftMaxPrice(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  const initialCenter = [36.4, 127.8];

  const handleRecenter = () => {
    if (!mapInstance || !mapPoints.length) return;
    if (mapPoints.length > 1) {
      mapInstance.fitBounds(mapPoints, { padding: [40, 40] });
    } else {
      mapInstance.setView(mapPoints[0], 12);
    }
  };

  const handleSearchInMap = () => {
    if (!mapBoundsDraft || !draftBoundsKey) return;
    setAppliedBounds(mapBoundsDraft);
    setAppliedBoundsKey(draftBoundsKey);
  };

  const handleApplyFilters = () => {
    setSort(draftSort);
    setRegionFilter(draftRegionFilter);
    setMinRating(draftMinRating);
    setMinPrice(Math.min(draftMinPrice, draftMaxPrice));
    setMaxPrice(Math.max(draftMinPrice, draftMaxPrice));
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setDraftSort('default');
    setDraftRegionFilter('all');
    setDraftMinRating(0);
    setDraftMinPrice(priceBounds.min);
    setDraftMaxPrice(priceBounds.max);
  };

  return (
    <div>
      <style>{`
        .tz-price-marker-shell {
          background: transparent;
          border: none;
        }
        .tz-price-marker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 70px;
          height: 30px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid #D8D8D8;
          background: #ffffff;
          color: #272727;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 3px 10px rgba(0,0,0,0.14);
          white-space: nowrap;
        }
        .tz-price-marker.is-active {
          background: #1f1f1f;
          color: #fff;
          border-color: #1f1f1f;
        }
        @media (max-width: 1180px) {
          .tz-lodging-split {
            display: block !important;
          }
          .tz-lodging-map-pane {
            position: static !important;
            height: 420px !important;
            margin-top: 18px;
          }
        }
      `}</style>
      <div style={s.searchSticky}>
        <div style={s.searchInner}>
          <SearchBar
            key={[keyword, region, checkIn, checkOut, Number(guests)].join('|')}
            defaultKeyword={keyword}
            defaultRegion={region}
            defaultCheckIn={checkIn}
            defaultCheckOut={checkOut}
            defaultGuests={Number(guests)}
          />
        </div>
      </div>

      <div style={s.splitWrap} className="tz-lodging-split">
        <section style={s.listPane}>
          <div style={s.filterBar}>
            <div style={s.resultRow}>
              {benefit ? (
                <p style={s.benefitGuide}>
                  {benefit === 'points'
                    ? '포인트 사용 가능한 숙소를 보고 있습니다.'
                    : scope === 'domestic'
                      ? '쿠폰 적용 가능한 국내 숙소를 보고 있습니다.'
                      : scope === 'all'
                        ? '쿠폰 적용 가능한 숙소를 보고 있습니다.'
                        : null}
                </p>
              ) : null}
              <p style={s.resultCount}>
              {keyword ? `'${keyword}' 검색 결과` : region ? `'${region}' 검색 결과` : '지도에 표시된 숙소'}
              <span style={s.count}> {filteredVisibleLodgings.length}개</span>
              </p>
              <button type="button" style={s.filterTriggerBtnInline} onClick={() => setFilterOpen(true)}>
                <span style={s.filterTriggerIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                    <circle cx="9" cy="6" r="2" fill="#FFF6F6" />
                    <circle cx="15" cy="12" r="2" fill="#FFF6F6" />
                    <circle cx="11" cy="18" r="2" fill="#FFF6F6" />
                  </svg>
                </span>
                <span>필터</span>
                {activeFilterCount > 0 ? <span style={s.filterTriggerCount}>{activeFilterCount}</span> : null}
              </button>
            </div>
          </div>

          {filteredVisibleLodgings.length === 0 ? (
            <EmptyState
              icon="🗺️"
              title="지도 영역에 숙소가 없습니다"
              desc="지도를 이동하거나 축소해서 다른 지역을 찾아보세요."
              action={{ label: '전체 숙소 보기', onClick: () => navigate('/lodgings') }}
            />
          ) : (
            <div style={s.grid}>
              {filteredVisibleLodgings.map((lodging) => (
                <div
                  key={lodging.lodgingId}
                  style={{
                    ...s.cardWrap,
                    borderColor: activeLodgingId === lodging.lodgingId ? '#E8484A' : 'transparent',
                    boxShadow: activeLodgingId === lodging.lodgingId
                      ? '0 0 0 2px rgba(232,72,74,0.12)'
                      : 'none',
                  }}
                  onMouseEnter={() => setActiveLodgingId(lodging.lodgingId)}
                >
                  <LodgingCard lodging={lodging} />
                </div>
              ))}
            </div>
          )}
        </section>

        <aside style={s.mapPane} className="tz-lodging-map-pane">
          <div style={s.mapFrame}>
            <MapContainer
              center={initialCenter}
              zoom={7}
              scrollWheelZoom
              zoomControl={false}
              style={s.map}
              whenReady={(event) => setMapInstance(event.target)}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
              />
              <TileLayer
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
              />

              <MapBoundsWatcher onBoundsChange={onBoundsChange} />

              {filteredVisibleLodgings.filter(hasValidCoordinate).map((lodging) => (
                <Marker
                  key={`marker-${lodging.lodgingId}`}
                  position={[Number(lodging.latitude), Number(lodging.longitude)]}
                  icon={buildPriceMarkerIcon(lodging.pricePerNight, activeLodgingId === lodging.lodgingId)}
                  zIndexOffset={activeLodgingId === lodging.lodgingId ? 200 : 0}
                  eventHandlers={{
                    click: () => setActiveLodgingId(lodging.lodgingId),
                    mouseover: () => setActiveLodgingId(lodging.lodgingId),
                  }}
                >
                  <Popup>
                    <div style={s.popupWrap}>
                      <strong>{lodging.name}</strong>
                      <div style={s.popupMeta}>{lodging.region} · ₩{Number(lodging.pricePerNight).toLocaleString()}</div>
                      <button style={s.popupBtn} onClick={() => navigate(`/lodgings/${lodging.lodgingId}`)}>상세 보기</button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            <div style={s.mapOverlayTop}>지도로 표시된 지역의 숙소</div>
            {isBoundsDirty && (
              <button style={s.mapSearchBtn} onClick={handleSearchInMap}>현재 지도에서 검색</button>
            )}
            <div style={s.mapControls}>
              <button style={s.mapCtrlBtn} onClick={() => mapInstance?.zoomIn()} aria-label="지도 확대">+</button>
              <button style={s.mapCtrlBtn} onClick={() => mapInstance?.zoomOut()} aria-label="지도 축소">−</button>
              <button style={s.mapCtrlBtn} onClick={handleRecenter} aria-label="지도 재중앙">⌖</button>
            </div>
          </div>
        </aside>
      </div>

      {filterOpen ? (
        <div style={s.filterModalOverlay} onClick={() => setFilterOpen(false)}>
          <div style={s.filterModal} onClick={(event) => event.stopPropagation()}>
            <div style={s.filterModalHeader}>
              <strong style={s.filterModalTitle}>필터</strong>
              <button type="button" style={s.filterModalClose} onClick={() => setFilterOpen(false)}>×</button>
            </div>

            <div style={s.filterModalBody}>
              <section style={s.filterModalSection}>
                <p style={s.filterModalSectionTitle}>지역</p>
                <div style={s.chipRow}>
                  {REGION_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      style={{ ...s.sortBtn, ...(draftRegionFilter === option.value ? s.sortBtnActive : null) }}
                      onClick={() => setDraftRegionFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              <section style={s.filterModalSection}>
                <p style={s.filterModalSectionTitle}>가격 범위</p>
                <div style={s.priceGuideRow}>
                  <div style={s.priceBadgeBox}>
                    <span style={s.priceBadgeLabel}>최저</span>
                    <strong style={s.priceBadgeValue}>₩{draftMinPrice.toLocaleString()}</strong>
                  </div>
                  <div style={s.priceBadgeBox}>
                    <span style={s.priceBadgeLabel}>최고</span>
                    <strong style={s.priceBadgeValue}>₩{draftMaxPrice.toLocaleString()}</strong>
                  </div>
                </div>
                <div style={s.rangeWrap}>
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step="5000"
                    value={draftMinPrice}
                    onChange={(event) => setDraftMinPrice(Math.min(Number(event.target.value), draftMaxPrice))}
                    style={s.rangeInput}
                  />
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step="5000"
                    value={draftMaxPrice}
                    onChange={(event) => setDraftMaxPrice(Math.max(Number(event.target.value), draftMinPrice))}
                    style={s.rangeInput}
                  />
                </div>
              </section>

              <section style={s.filterModalSection}>
                <p style={s.filterModalSectionTitle}>평점</p>
                <div style={s.chipRow}>
                  {RATING_FILTER_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      style={{ ...s.quickFilterBtn, ...(draftMinRating === item.value ? s.quickFilterBtnActive : null) }}
                      onClick={() => setDraftMinRating(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              <section style={s.filterModalSection}>
                <p style={s.filterModalSectionTitle}>정렬</p>
                <div style={s.chipRow}>
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      style={{ ...s.quickFilterBtn, ...(draftSort === option.value ? s.quickFilterBtnActive : null) }}
                      onClick={() => setDraftSort(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div style={s.filterModalFooter}>
              <button type="button" style={s.filterResetBtn} onClick={handleResetFilters}>전체 해제</button>
              <button type="button" style={s.filterApplyBtn} onClick={handleApplyFilters}>
                숙소 {sortLodgings(applyAdvancedFilters(visibleLodgings, {
                  regionFilter: draftRegionFilter,
                  minRating: draftMinRating,
                  minPrice: Math.min(draftMinPrice, draftMaxPrice),
                  maxPrice: Math.max(draftMinPrice, draftMaxPrice),
                }), draftSort).length}개 보기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const s = {
  searchSticky: {
    position: 'sticky',
    top: '74px',
    zIndex: 50,
    background: C.bg,
    borderBottom: `1px solid ${C.borderLight}`,
    padding: '12px 24px',
  },
  searchInner: { maxWidth: MAX_WIDTH, margin: '0 auto', display: 'flex', justifyContent: 'center' },
  splitWrap: {
    maxWidth: 'min(1720px, calc(100vw - 36px))',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 42%',
    gap: '18px',
    padding: '24px 18px 40px',
  },
  listPane: {
    minWidth: 0,
  },
  mapPane: {
    position: 'sticky',
    top: '148px',
    alignSelf: 'start',
    height: 'calc(100vh - 164px)',
  },
  mapFrame: {
    position: 'relative',
    borderRadius: '24px',
    overflow: 'hidden',
    border: `1px solid ${C.borderLight}`,
    boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
    height: '100%',
  },
  mapOverlayTop: {
    position: 'absolute',
    left: '16px',
    top: '16px',
    zIndex: 500,
    borderRadius: '999px',
    border: '1px solid #E5E7EB',
    background: '#FFFFFFE8',
    backdropFilter: 'blur(2px)',
    fontSize: '12px',
    color: '#374151',
    fontWeight: 700,
    padding: '8px 12px',
  },
  mapSearchBtn: {
    position: 'absolute',
    left: '50%',
    top: '16px',
    transform: 'translateX(-50%)',
    zIndex: 520,
    border: 'none',
    borderRadius: '999px',
    background: '#111827',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    padding: '9px 14px',
    boxShadow: '0 8px 18px rgba(0,0,0,0.24)',
    cursor: 'pointer',
  },
  mapControls: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 500,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mapCtrlBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    background: '#FFFFFFEE',
    color: '#111827',
    fontSize: '20px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
  },
  map: { width: '100%', height: '100%' },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  benefitGuide: {
    margin: '0 0 8px',
    fontSize: '12px',
    fontWeight: '800',
    color: C.primary,
  },
  filterTriggerBtnInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '999px',
    border: `2px solid ${C.primary}`,
    background: '#FFF6F6',
    color: C.primary,
    fontSize: '15px',
    fontWeight: 800,
    padding: '10px 18px',
    cursor: 'pointer',
    marginTop: '2px',
  },
  filterTriggerIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 0,
  },
  filterTriggerCount: {
    minWidth: '26px',
    height: '26px',
    borderRadius: '999px',
    background: C.primary,
    color: '#fff',
    fontSize: '13px',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '2px',
  },
  resultCount: { fontSize: '22px', fontWeight: '700', color: C.text, margin: 0 },
  count: { fontSize: '16px', fontWeight: '400', color: C.textSub },
  searchSummaryInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  chipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  quickFilterBtn: {
    border: '1px solid #E3E6EC',
    borderRadius: '999px',
    background: '#fff',
    color: '#5D6778',
    fontSize: '13px',
    fontWeight: 700,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  quickFilterBtnActive: {
    background: '#1F2530',
    color: '#fff',
    borderColor: '#1F2530',
  },
  sortBtn: {
    padding: '8px 12px',
    border: '1px solid #E3E6EC',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#fff',
    color: '#5D6778',
  },
  sortBtnActive: {
    background: '#1F2530',
    color: '#fff',
    borderColor: '#1F2530',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))',
    gap: '18px',
    paddingTop: '6px',
  },
  cardWrap: {
    borderRadius: '14px',
    border: '2px solid transparent',
    transition: 'border-color .18s ease, box-shadow .18s ease',
    paddingTop: '4px',
  },
  popupWrap: { minWidth: '160px' },
  popupMeta: { marginTop: '4px', color: '#6b7280', fontSize: '12px' },
  popupBtn: {
    marginTop: '8px',
    border: 'none',
    borderRadius: '8px',
    background: '#111827',
    color: '#fff',
    padding: '6px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  filterModalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.34)',
    backdropFilter: 'blur(4px)',
    zIndex: 3000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  filterModal: {
    width: 'min(760px, 100%)',
    maxHeight: 'min(86vh, 920px)',
    background: '#fff',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 28px 80px rgba(15,23,42,0.24)',
    display: 'flex',
    flexDirection: 'column',
  },
  filterModalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 26px',
    borderBottom: `1px solid ${C.borderLight}`,
  },
  filterModalTitle: {
    fontSize: '22px',
    color: C.text,
    fontWeight: 800,
  },
  filterModalClose: {
    border: 'none',
    background: 'transparent',
    color: '#2D2D2D',
    fontSize: '28px',
    lineHeight: 1,
    cursor: 'pointer',
  },
  filterModalBody: {
    padding: '10px 26px 24px',
    overflowY: 'auto',
    display: 'grid',
    gap: '22px',
  },
  filterModalSection: {
    display: 'grid',
    gap: '12px',
    paddingTop: '14px',
    borderTop: `1px solid ${C.borderLight}`,
  },
  filterModalSectionTitle: {
    margin: 0,
    fontSize: '18px',
    color: C.text,
    fontWeight: 800,
  },
  priceGuideRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  priceBadgeBox: {
    minWidth: '160px',
    borderRadius: '18px',
    border: `1px solid ${C.borderLight}`,
    background: '#FCFCFD',
    padding: '14px 16px',
    display: 'grid',
    gap: '6px',
  },
  priceBadgeLabel: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: 800,
  },
  priceBadgeValue: {
    fontSize: '18px',
    color: C.text,
    fontWeight: 800,
  },
  rangeWrap: {
    display: 'grid',
    gap: '14px',
  },
  rangeInput: {
    width: '100%',
    accentColor: C.primary,
  },
  filterModalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '18px 26px 24px',
    borderTop: `1px solid ${C.borderLight}`,
  },
  filterResetBtn: {
    border: 'none',
    background: 'transparent',
    color: '#4B5563',
    fontSize: '15px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  filterApplyBtn: {
    border: 'none',
    borderRadius: '16px',
    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryHover} 100%)`,
    color: '#fff',
    fontSize: '15px',
    fontWeight: 800,
    padding: '14px 18px',
    cursor: 'pointer',
  },
};
