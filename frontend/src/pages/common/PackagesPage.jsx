import { Link, useSearchParams } from 'react-router-dom';
import { PACKAGE_ITEMS } from '../../mock/packageMockData';
import { C, MAX_WIDTH } from '../../styles/tokens';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export default function PackagesPage() {
  const [params, setSearchParams] = useSearchParams();
  const keyword = params.get('keyword') || '';
  const selectedTheme = params.get('theme') || '';
  const themes = Array.from(new Set(PACKAGE_ITEMS.map((item) => item.theme)));
  // TODO(back-end): 패키지 목록/필터/최저가 응답으로 교체한다.

  const filteredItems = PACKAGE_ITEMS.filter((item) => {
    const matchesTheme = !selectedTheme || item.theme === selectedTheme;
    const term = normalize(keyword);
    const matchesKeyword = !term || [
      item.title,
      item.destination,
      item.theme,
      item.departureCity,
      item.durationLabel,
      ...(item.includes || []),
    ]
      .map(normalize)
      .join(' ')
      .includes(term);

    return matchesTheme && matchesKeyword;
  });

  const updateTheme = (theme) => {
    const nextParams = new URLSearchParams(params);
    if (theme) nextParams.set('theme', theme);
    else nextParams.delete('theme');
    setSearchParams(nextParams);
  };

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>PACKAGE TRAVEL</p>
          <h1 style={s.title}>패키지 여행</h1>
          <p style={s.desc}>항공과 숙소를 한 번에 비교할 수 있는 패키지 여행 결과형 페이지입니다.</p>
          <div style={s.actions}>
            <Link to="/promotions" style={s.primaryBtn}>프로모션 보기</Link>
            <Link to="/support" style={s.secondaryBtn}>상담 문의</Link>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.headRow}>
            <div>
              <p style={s.resultText}>
                {keyword ? `'${keyword}' 검색 결과` : selectedTheme ? `${selectedTheme} 패키지` : '추천 패키지'}
              </p>
              <p style={s.resultCount}>{filteredItems.length}개 상품</p>
            </div>
            <Link to="/flights" style={s.secondaryBtn}>항공만 보기</Link>
          </div>

          <div style={s.chipWrap}>
            <button type="button" style={{ ...s.chip, ...(selectedTheme ? null : s.chipActive) }} onClick={() => updateTheme('')}>전체</button>
            {themes.map((theme) => (
              <button key={theme} type="button" style={{ ...s.chip, ...(selectedTheme === theme ? s.chipActive : null) }} onClick={() => updateTheme(theme)}>
                {theme}
              </button>
            ))}
          </div>

          <div style={s.grid}>
            {filteredItems.map((item) => (
              <article key={item.packageId} style={s.card}>
                <img src={item.imageUrl} alt={item.title} style={s.image} />
                <div style={s.body}>
                  <div style={s.topRow}>
                    <span style={s.badge}>{item.theme}</span>
                    <span style={s.departure}>{item.departureDate} 출발</span>
                  </div>
                  <h2 style={s.cardTitle}>{item.title}</h2>
                  <p style={s.cardMeta}>{item.destination} · {item.departureCity} 출발 · {item.durationLabel}</p>
                  <div style={s.includeWrap}>
                    {item.includes.map((include) => (
                      <span key={include} style={s.includeChip}>{include}</span>
                    ))}
                  </div>
                  <div style={s.bottomRow}>
                    <p style={s.price}>1인 {item.priceFrom.toLocaleString()}원부터</p>
                    <Link to="/support" style={s.cardBtn}>상담 요청</Link>
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
  hero: { padding: '72px 24px 44px', background: 'linear-gradient(145deg, #FFF6F1 0%, #FFFFFF 52%, #F7F7FF 100%)', borderBottom: '1px solid #F0E8E8' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto' },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 14px', fontSize: 'clamp(32px, 4vw, 50px)', lineHeight: 1.06, letterSpacing: '-0.03em', color: C.text },
  desc: { margin: 0, maxWidth: '760px', fontSize: '16px', lineHeight: 1.8, color: C.textSub },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '28px' },
  primaryBtn: { padding: '13px 22px', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', textDecoration: 'none', fontWeight: '800', fontSize: '14px' },
  secondaryBtn: { padding: '13px 22px', borderRadius: '999px', background: '#fff', color: C.text, textDecoration: 'none', fontWeight: '700', fontSize: '14px', border: `1px solid ${C.border}` },
  section: { padding: '32px 24px 64px' },
  headRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' },
  resultText: { margin: 0, fontSize: '14px', color: C.textSub, fontWeight: '700' },
  resultCount: { margin: '6px 0 0', fontSize: '26px', color: C.text, fontWeight: '800' },
  chipWrap: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' },
  chip: { border: `1px solid ${C.border}`, background: '#fff', color: C.text, borderRadius: '999px', padding: '9px 13px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  chipActive: { background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', borderColor: '#E8484A' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' },
  card: { background: '#fff', border: `1px solid ${C.borderLight}`, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' },
  image: { width: '100%', height: '210px', objectFit: 'cover', display: 'block' },
  body: { padding: '20px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  badge: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: '800' },
  departure: { fontSize: '12px', color: C.textLight, fontWeight: '700' },
  cardTitle: { margin: '0 0 8px', fontSize: '22px', color: C.text, fontWeight: '800' },
  cardMeta: { margin: '0 0 12px', fontSize: '14px', color: C.textSub, lineHeight: 1.7 },
  includeWrap: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
  includeChip: { display: 'inline-flex', padding: '6px 9px', borderRadius: '999px', background: '#F4F4F5', color: '#52525B', fontSize: '11px', fontWeight: '700' },
  bottomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  price: { margin: 0, fontSize: '16px', color: C.text, fontWeight: '800' },
  cardBtn: { display: 'inline-flex', padding: '10px 14px', borderRadius: '12px', background: '#FFF1F1', color: C.primary, textDecoration: 'none', fontSize: '13px', fontWeight: '800' },
};
