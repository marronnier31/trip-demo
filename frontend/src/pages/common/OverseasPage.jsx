import { Link, useSearchParams } from 'react-router-dom';
import { OVERSEAS_LODGINGS } from '../../mock/overseasMockData';
import { getBenefitScopeLabel } from '../../utils/benefitNavigation';
import { C, MAX_WIDTH } from '../../styles/tokens';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export default function OverseasPage() {
  const [params, setSearchParams] = useSearchParams();
  const keyword = params.get('keyword') || '';
  const benefit = params.get('benefit') || '';
  const scope = params.get('scope') || '';
  const selectedCountry = params.get('country') || '';
  const selectedCity = params.get('city') || '';

  const countries = Array.from(new Set(OVERSEAS_LODGINGS.map((item) => item.country)));
  const cities = Array.from(
    new Set(
      OVERSEAS_LODGINGS
        .filter((item) => !selectedCountry || item.country === selectedCountry)
        .map((item) => item.city)
    )
  );

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(params);

    Object.entries(next).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });

    if (next.country && !OVERSEAS_LODGINGS.some((item) => item.country === next.country && item.city === nextParams.get('city'))) {
      nextParams.delete('city');
    }

    setSearchParams(nextParams);
  };

  const filtered = OVERSEAS_LODGINGS.filter((item) => {
    const term = normalize(keyword);
    const matchesKeyword = !term || [item.name, item.city, item.country, item.district, item.tags.join(' ')]
      .map(normalize)
      .join(' ')
      .includes(term);
    const matchesCountry = !selectedCountry || item.country === selectedCountry;
    const matchesCity = !selectedCity || item.city === selectedCity;
    return matchesKeyword && matchesCountry && matchesCity;
  });

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>GLOBAL STAYS</p>
          <h1 style={s.title}>해외숙소</h1>
          <p style={s.desc}>도시형 호텔부터 휴양지 리조트까지, 해외 숙소 탐색 화면을 결과형으로 먼저 준비했습니다.</p>
          <div style={s.actions}>
            <Link to="/support" style={s.secondaryBtn}>서비스 문의</Link>
            <Link to="/promotions" style={s.primaryBtn}>프로모션 보기</Link>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          {benefit === 'coupon' && scope === 'overseas' ? (
            <div style={s.benefitBanner}>
              <p style={s.benefitEyebrow}>COUPON ENTRY</p>
              <h2 style={s.benefitTitle}>{getBenefitScopeLabel(scope)}</h2>
              <p style={s.benefitDesc}>해외숙소 쿠폰이 적용되는 상품을 중심으로 둘러볼 수 있도록 준비된 추천 화면입니다.</p>
            </div>
          ) : null}

          <div style={s.headRow}>
            <div>
              <p style={s.resultText}>{keyword ? `'${keyword}' 검색 결과` : '추천 해외숙소'}</p>
              <p style={s.resultCount}>{filtered.length}개 숙소</p>
            </div>
            <Link to="/lodgings" style={s.secondaryBtn}>국내숙소 보기</Link>
          </div>

          <div style={s.filterBlock}>
            <div style={s.filterRow}>
              <span style={s.filterLabel}>국가</span>
              <div style={s.chipWrap}>
                <button
                  type="button"
                  style={{ ...s.filterChip, ...(selectedCountry ? null : s.filterChipActive) }}
                  onClick={() => updateFilter({ country: '', city: '' })}
                >
                  전체
                </button>
                {countries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    style={{ ...s.filterChip, ...(selectedCountry === country ? s.filterChipActive : null) }}
                    onClick={() => updateFilter({ country, city: '' })}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.filterRow}>
              <span style={s.filterLabel}>도시</span>
              <div style={s.chipWrap}>
                <button
                  type="button"
                  style={{ ...s.filterChip, ...(selectedCity ? null : s.filterChipActive) }}
                  onClick={() => updateFilter({ city: '' })}
                >
                  전체
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    style={{ ...s.filterChip, ...(selectedCity === city ? s.filterChipActive : null) }}
                    onClick={() => updateFilter({ city })}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={s.grid}>
            {filtered.map((item) => (
              <article key={item.lodgingId} style={s.card}>
                <img src={item.imageUrl} alt={item.name} style={s.image} />
                <div style={s.body}>
                  <div style={s.topRow}>
                    <span style={s.location}>{item.country} · {item.city}</span>
                    <span style={s.rating}>★ {item.rating}</span>
                  </div>
                  <h3 style={s.name}>{item.name}</h3>
                  <p style={s.district}>{item.district}</p>
                  <div style={s.tagRow}>
                    {item.tags.map((tag) => (
                      <span key={tag} style={s.tag}>{tag}</span>
                    ))}
                  </div>
                  <div style={s.bottomRow}>
                    <p style={s.price}>1박 {item.pricePerNight.toLocaleString()}원부터</p>
                    <Link
                      to={`/overseas/${item.lodgingId}${benefit ? `?benefit=${benefit}&scope=${scope}` : ''}`}
                      style={s.cardBtn}
                    >
                      {benefit === 'coupon' && scope === 'overseas' ? '쿠폰 적용 보기' : '상세 보기'}
                    </Link>
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
  hero: { padding: '72px 24px 44px', background: 'linear-gradient(145deg, #FFF6F1 0%, #FFFFFF 52%, #F6F7FF 100%)', borderBottom: '1px solid #F0E8E8' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 14px', fontSize: 'clamp(32px, 4vw, 50px)', lineHeight: 1.06, letterSpacing: '-0.03em', color: C.text },
  desc: { margin: 0, maxWidth: '760px', fontSize: '16px', lineHeight: 1.8, color: C.textSub },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '28px' },
  primaryBtn: { padding: '13px 22px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontWeight: '800', fontSize: '14px' },
  secondaryBtn: { padding: '13px 22px', borderRadius: '999px', background: '#fff', color: C.text, textDecoration: 'none', fontWeight: '700', fontSize: '14px', border: `1px solid ${C.border}` },
  section: { padding: '32px 24px 64px' },
  benefitBanner: { background: 'linear-gradient(135deg, #FFF1F1 0%, #FFFFFF 100%)', border: `1px solid #F6D4D5`, borderRadius: '24px', padding: '22px', marginBottom: '18px' },
  benefitEyebrow: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.1em', color: C.primary },
  benefitTitle: { margin: '0 0 10px', fontSize: '24px', color: C.text, fontWeight: '800' },
  benefitDesc: { margin: 0, fontSize: '14px', lineHeight: 1.7, color: C.textSub },
  headRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' },
  resultText: { margin: 0, fontSize: '14px', color: C.textSub, fontWeight: '700' },
  resultCount: { margin: '6px 0 0', fontSize: '26px', color: C.text, fontWeight: '800' },
  filterBlock: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' },
  filterRow: { display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' },
  filterLabel: { minWidth: '36px', paddingTop: '8px', fontSize: '13px', color: C.textSub, fontWeight: '800' },
  chipWrap: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterChip: { border: `1px solid ${C.border}`, background: '#fff', color: C.text, borderRadius: '999px', padding: '9px 13px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  filterChipActive: { background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', borderColor: '#E8484A' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' },
  card: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '22px', overflow: 'hidden', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' },
  image: { width: '100%', height: '200px', objectFit: 'cover', display: 'block' },
  body: { padding: '18px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  location: { fontSize: '12px', color: C.textSub, fontWeight: '700' },
  rating: { fontSize: '13px', color: C.text, fontWeight: '800' },
  name: { margin: '0 0 8px', fontSize: '21px', color: C.text, fontWeight: '800' },
  district: { margin: '0 0 12px', fontSize: '14px', color: C.textSub },
  tagRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' },
  tag: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: '#F4F4F5', color: '#52525B', fontSize: '11px', fontWeight: '700' },
  bottomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  price: { margin: 0, fontSize: '16px', color: C.text, fontWeight: '800' },
  cardBtn: { display: 'inline-flex', padding: '10px 14px', borderRadius: '12px', background: '#FFF1F1', color: C.primary, textDecoration: 'none', fontSize: '13px', fontWeight: '800' },
};
