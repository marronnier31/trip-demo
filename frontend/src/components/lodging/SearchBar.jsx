import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { C } from '../../styles/tokens';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const TAB_CONFIG = [
  {
    key: 'domestic',
    label: '국내 숙소',
    route: '/lodgings',
    placeholder: '여행지, 역, 랜드마크, 숙소명 검색',
    emptyText: '국내 숙소 관련 검색 결과가 없습니다.',
    summaryFallback: '지역, 날짜, 인원을 선택해보세요',
  },
  {
    key: 'overseas',
    label: '해외 숙소',
    route: '/overseas',
    placeholder: '도시, 지역, 관광지, 해외 숙소 검색',
    emptyText: '해외 숙소 관련 검색 결과가 없습니다.',
    summaryFallback: '도시, 날짜, 인원을 선택해보세요',
  },
  {
    key: 'package',
    label: '패키지 여행',
    route: '/packages',
    placeholder: '여행지, 상품명, 테마 패키지 검색',
    emptyText: '패키지 여행 관련 검색 결과가 없습니다.',
    summaryFallback: '여행 상품, 날짜, 인원을 선택해보세요',
  },
];

const TYPE_META = {
  region: { icon: '📍', label: '지역' },
  station: { icon: '🚉', label: '역' },
  landmark: { icon: '🧭', label: '명소' },
  hotel: { icon: '🏨', label: '숙소' },
  package: { icon: '🎒', label: '패키지' },
};

const SEARCH_ITEMS = [
  { id: 'd-r-seoul', label: '서울', sublabel: '대한민국 서울특별시', type: 'region', tabs: ['domestic'], aliases: ['서울시', 'seoul', 'korea seoul'] },
  { id: 'd-s-seoul-st', label: '서울역', sublabel: '1호선 · 4호선 · GTX-A', type: 'station', tabs: ['domestic'], aliases: ['서울 스테이션', 'seoul station'] },
  { id: 'd-r-jamsil', label: '잠실', sublabel: '롯데월드 · 석촌호수', type: 'region', tabs: ['domestic'], aliases: ['잠실역', 'jamsil'] },
  { id: 'd-r-hongdae', label: '홍대', sublabel: '연남동 · 합정 인근', type: 'region', tabs: ['domestic'], aliases: ['홍익대', 'hongdae'] },
  { id: 'd-r-sinchon', label: '신촌', sublabel: '이대 · 서강대 상권', type: 'region', tabs: ['domestic'], aliases: ['sinchon'] },
  { id: 'd-r-gangnam', label: '강남', sublabel: '강남역 · 삼성역 비즈니스 중심', type: 'region', tabs: ['domestic'], aliases: ['gangnam'] },
  { id: 'd-r-myeongdong', label: '명동', sublabel: '서울 대표 쇼핑 관광지', type: 'landmark', tabs: ['domestic'], aliases: ['명동역', 'myeongdong'] },
  { id: 'd-r-busan', label: '부산', sublabel: '대한민국 부산광역시', type: 'region', tabs: ['domestic'], aliases: ['busan'] },
  { id: 'd-l-haeundae', label: '해운대', sublabel: '부산 대표 해변', type: 'landmark', tabs: ['domestic'], aliases: ['해운대해수욕장', 'haeundae'] },
  { id: 'd-l-gwangalli', label: '광안리', sublabel: '광안대교 야경 명소', type: 'landmark', tabs: ['domestic'], aliases: ['광안리해수욕장', 'gwangalli'] },
  { id: 'd-r-jeju', label: '제주', sublabel: '대한민국 제주특별자치도', type: 'region', tabs: ['domestic'], aliases: ['제주도', 'jeju'] },
  { id: 'd-r-seogwipo', label: '서귀포', sublabel: '제주 남부 관광 중심지', type: 'region', tabs: ['domestic'], aliases: ['서귀포시', 'seogwipo'] },
  { id: 'd-r-gyeongju', label: '경주', sublabel: '역사 유적 도시', type: 'region', tabs: ['domestic'], aliases: ['gyeongju', '황리단길'] },
  { id: 'd-r-sokcho', label: '속초', sublabel: '설악산 · 동해 바다', type: 'region', tabs: ['domestic'], aliases: ['sokcho'] },
  { id: 'd-r-yeosu', label: '여수', sublabel: '여수 밤바다', type: 'region', tabs: ['domestic'], aliases: ['yeosu'] },
  { id: 'd-h-grand-hyatt', label: '그랜드 하얏트 서울', sublabel: '호텔 · 서울 용산구', type: 'hotel', tabs: ['domestic'], aliases: ['hyatt seoul', '그랜드하얏트'] },
  { id: 'd-h-signiel', label: '시그니엘 서울', sublabel: '럭셔리 호텔 · 서울 송파구', type: 'hotel', tabs: ['domestic'], aliases: ['signiel', '롯데월드타워 호텔'] },
  { id: 'd-h-lotte-seoul', label: '롯데호텔 서울', sublabel: '호텔 · 서울 중구', type: 'hotel', tabs: ['domestic'], aliases: ['lotte hotel seoul', '롯데호텔'] },
  { id: 'd-h-paradise', label: '파라다이스 호텔 부산', sublabel: '호텔 · 부산 해운대구', type: 'hotel', tabs: ['domestic'], aliases: ['paradise busan'] },
  { id: 'd-h-shilla-yeoksam', label: '신라스테이 역삼', sublabel: '비즈니스 호텔 · 서울 강남구', type: 'hotel', tabs: ['domestic'], aliases: ['shilla stay', '역삼 호텔'] },
  { id: 'd-h-lottecity', label: '롯데시티호텔 명동', sublabel: '호텔 · 서울 중구', type: 'hotel', tabs: ['domestic'], aliases: ['lotte city', '명동 호텔'] },
  { id: 'd-h-jeju-shilla', label: '제주신라호텔', sublabel: '리조트 · 제주 서귀포시', type: 'hotel', tabs: ['domestic'], aliases: ['shilla jeju', '중문 호텔'] },
  { id: 'd-h-hiddencliff', label: '히든클리프 호텔 제주', sublabel: '호텔 · 제주 중문', type: 'hotel', tabs: ['domestic'], aliases: ['hidden cliff'] },

  { id: 'o-r-tokyo', label: '도쿄', sublabel: '일본 도쿄도', type: 'region', tabs: ['overseas'], aliases: ['tokyo'] },
  { id: 'o-r-osaka', label: '오사카', sublabel: '일본 간사이 대표 도시', type: 'region', tabs: ['overseas'], aliases: ['osaka'] },
  { id: 'o-r-fukuoka', label: '후쿠오카', sublabel: '일본 규슈 중심 도시', type: 'region', tabs: ['overseas'], aliases: ['fukuoka'] },
  { id: 'o-r-kyoto', label: '교토', sublabel: '일본 전통 문화 도시', type: 'region', tabs: ['overseas'], aliases: ['kyoto'] },
  { id: 'o-r-sapporo', label: '삿포로', sublabel: '일본 홋카이도', type: 'region', tabs: ['overseas'], aliases: ['sapporo'] },
  { id: 'o-r-bangkok', label: '방콕', sublabel: '태국 수도', type: 'region', tabs: ['overseas'], aliases: ['bangkok'] },
  { id: 'o-r-danang', label: '다낭', sublabel: '베트남 휴양 도시', type: 'region', tabs: ['overseas'], aliases: ['danang'] },
  { id: 'o-r-paris', label: '파리', sublabel: '프랑스 수도', type: 'region', tabs: ['overseas'], aliases: ['paris'] },
  { id: 'o-r-london', label: '런던', sublabel: '영국 수도', type: 'region', tabs: ['overseas'], aliases: ['london'] },
  { id: 'o-r-newyork', label: '뉴욕', sublabel: '미국 뉴욕주', type: 'region', tabs: ['overseas'], aliases: ['new york', 'nyc'] },
  { id: 'o-l-shibuya', label: '시부야', sublabel: '도쿄 대표 상권', type: 'landmark', tabs: ['overseas'], aliases: ['shibuya'] },
  { id: 'o-l-shinjuku', label: '신주쿠', sublabel: '도쿄 교통·상업 중심지', type: 'landmark', tabs: ['overseas'], aliases: ['shinjuku'] },
  { id: 'o-l-umeda', label: '우메다', sublabel: '오사카 북부 중심지', type: 'landmark', tabs: ['overseas'], aliases: ['umeda'] },
  { id: 'o-l-namba', label: '난바', sublabel: '오사카 남부 상권', type: 'landmark', tabs: ['overseas'], aliases: ['namba'] },
  { id: 'o-r-macau', label: '마카오', sublabel: '카지노·리조트 도시', type: 'region', tabs: ['overseas'], aliases: ['macau'] },
  { id: 'o-l-waikiki', label: '와이키키', sublabel: '하와이 대표 해변', type: 'landmark', tabs: ['overseas'], aliases: ['waikiki'] },
  { id: 'o-h-mbs', label: 'Marina Bay Sands', sublabel: '호텔 · 싱가포르 마리나베이', type: 'hotel', tabs: ['overseas'], aliases: ['marina bay sands singapore', 'mbs'] },
  { id: 'o-h-hilton-tokyo', label: 'Hilton Tokyo', sublabel: '호텔 · 도쿄 신주쿠', type: 'hotel', tabs: ['overseas'], aliases: ['힐튼 도쿄', 'tokyo hilton'] },
  { id: 'o-h-granbell', label: 'Shinjuku Granbell Hotel', sublabel: '호텔 · 도쿄 신주쿠', type: 'hotel', tabs: ['overseas'], aliases: ['granbell'] },
  { id: 'o-h-gracery', label: 'Hotel Gracery Shinjuku', sublabel: '호텔 · 도쿄 신주쿠', type: 'hotel', tabs: ['overseas'], aliases: ['gracery'] },
  { id: 'o-h-plv', label: 'Paris Las Vegas Hotel', sublabel: '호텔 · 라스베이거스 스트립', type: 'hotel', tabs: ['overseas'], aliases: ['las vegas paris'] },
  { id: 'o-h-sheraton-waikiki', label: 'Sheraton Waikiki', sublabel: '호텔 · 하와이 호놀룰루', type: 'hotel', tabs: ['overseas'], aliases: ['waikiki sheraton'] },

  { id: 'p-1', label: '제주 2박 3일', sublabel: '항공+숙소 포함 · 인기 패키지', type: 'package', tabs: ['package'], aliases: ['제주 패키지', '제주 여행'] },
  { id: 'p-2', label: '부산 먹방 여행', sublabel: '부산 미식 투어 · 2박 3일', type: 'package', tabs: ['package'], aliases: ['부산 패키지', '먹방'] },
  { id: 'p-3', label: '경주 역사 투어', sublabel: '유적지 중심 1박 2일', type: 'package', tabs: ['package'], aliases: ['경주 패키지', '역사 여행'] },
  { id: 'p-4', label: '오사카 3박 4일', sublabel: '항공+숙소+시내투어', type: 'package', tabs: ['package'], aliases: ['오사카 패키지'] },
  { id: 'p-5', label: '도쿄 벚꽃 여행', sublabel: '시즌 한정 · 벚꽃 명소 포함', type: 'package', tabs: ['package'], aliases: ['도쿄 패키지', '벚꽃'] },
  { id: 'p-6', label: '후쿠오카 온천 여행', sublabel: '료칸 포함 3박 4일', type: 'package', tabs: ['package'], aliases: ['후쿠오카 패키지', '온천 여행'] },
  { id: 'p-7', label: '방콕/파타야 패키지', sublabel: '휴양+시내관광 4박 5일', type: 'package', tabs: ['package'], aliases: ['방콕 패키지', '파타야'] },
  { id: 'p-8', label: '다낭 호이안 4박 5일', sublabel: '리조트+투어 포함', type: 'package', tabs: ['package'], aliases: ['다낭 패키지', '호이안'] },
  { id: 'p-9', label: '홋카이도 설경 여행', sublabel: '겨울 시즌 한정', type: 'package', tabs: ['package'], aliases: ['홋카이도 패키지'] },
  { id: 'p-10', label: '유럽 서유럽 7박 9일', sublabel: '파리·로마·런던 포함', type: 'package', tabs: ['package'], aliases: ['서유럽 패키지', '유럽 여행'] },
  { id: 'p-11', label: '스페인/포르투갈 패키지', sublabel: '이베리아 핵심 도시 투어', type: 'package', tabs: ['package'], aliases: ['스페인 패키지', '포르투갈 패키지'] },
  { id: 'p-12', label: '일본 온천 패키지', sublabel: '큐슈·벳부 중심', type: 'package', tabs: ['package'], aliases: ['일본 패키지', '온천'] },
  { id: 'p-13', label: '가족 여행 패키지', sublabel: '키즈 프렌들리 일정', type: 'package', tabs: ['package'], aliases: ['패밀리 여행'] },
  { id: 'p-14', label: '커플 여행 패키지', sublabel: '로맨틱 일정 구성', type: 'package', tabs: ['package'], aliases: ['허니문', '연인 여행'] },
  { id: 'p-15', label: '효도 여행 패키지', sublabel: '편안한 이동 동선', type: 'package', tabs: ['package'], aliases: ['부모님 여행'] },
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function parseISO(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthGrid(baseDate) {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }).map((_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    return day;
  });
}

function sameDate(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function betweenDate(day, start, end) {
  if (!start || !end) return false;
  const t = day.getTime();
  return t > start.getTime() && t < end.getTime();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computePosition(anchorRect, wantedWidth, wantedHeight) {
  const margin = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = clamp(anchorRect.left, margin, vw - wantedWidth - margin);
  let top = anchorRect.bottom + 8;
  if (top + wantedHeight > vh - margin) {
    top = clamp(anchorRect.top - wantedHeight - 8, margin, vh - wantedHeight - margin);
  }
  return { left, top };
}

function highlightText(text, keyword) {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);
  if (!keyword.trim() || index < 0) return text;
  const end = index + keyword.length;
  return (
    <>
      {text.slice(0, index)}
      <mark style={s.highlight}>{text.slice(index, end)}</mark>
      {text.slice(end)}
    </>
  );
}

function formatDateSummary(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '날짜 선택';
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  if (!start || !end) return '날짜 선택';
  const nights = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
  return `${start.getMonth() + 1}.${start.getDate()} ${WEEK_DAYS[start.getDay()]}~${end.getMonth() + 1}.${end.getDate()} ${WEEK_DAYS[end.getDay()]} (${nights}박)`;
}

function GuestCounter({ value, onChange }) {
  const numberValue = clamp(Number(value || 2), 1, 30);
  return (
    <div style={s.guestWrap}>
      <button type="button" style={s.guestBtn} className="tz-guest-btn" onClick={() => onChange(Math.max(1, numberValue - 1))}>
        −
      </button>
      <span style={s.guestValue}>{numberValue}명</span>
      <button type="button" style={s.guestBtn} className="tz-guest-btn" onClick={() => onChange(Math.min(30, numberValue + 1))}>
        +
      </button>
    </div>
  );
}

function Suggestions({ open, anchorRef, panelRef, items, keyword, activeIndex, onHover, onPick, emptyText }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const wanted = computePosition(rect, rect.width, 300);
      setPos({
        left: wanted.left,
        top: wanted.top,
        width: rect.width,
        maxHeight: clamp(window.innerHeight - wanted.top - 12, 180, 340),
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div ref={panelRef} style={{ ...s.dropdown, left: `${pos.left}px`, top: `${pos.top}px`, width: `${pos.width}px`, maxHeight: `${pos.maxHeight}px` }}>
      {items.length === 0 && <div style={s.emptyRow}>{emptyText}</div>}
      {items.map((item, idx) => {
        const meta = TYPE_META[item.type] || TYPE_META.region;
        return (
          <button
            key={item.id}
            type="button"
            style={{ ...s.dropdownRow, ...(idx === activeIndex ? s.dropdownRowActive : null) }}
            onMouseEnter={() => onHover(idx)}
            onMouseDown={() => onPick(item)}
          >
            <span style={s.dropdownIcon}>{meta.icon}</span>
            <div style={s.dropdownTextWrap}>
              <div style={s.dropdownLabel}>{highlightText(item.label, keyword)}</div>
              <div style={s.dropdownSub}>{item.sublabel}</div>
            </div>
            <span style={s.dropdownType}>{meta.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}

function GuestPopover({ open, anchorRef, panelRef, guests, onChange, onClose }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const panelWidth = Math.max(rect.width, 220);
      const wanted = computePosition(rect, panelWidth, 120);
      setPos({
        left: wanted.left,
        top: wanted.top,
        width: panelWidth,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div ref={panelRef} style={{ ...s.guestPopover, left: `${pos.left}px`, top: `${pos.top}px`, width: `${pos.width}px` }}>
      <GuestCounter value={guests} onChange={onChange} />
      <button type="button" style={s.guestApplyBtn} onClick={onClose}>확인</button>
    </div>,
    document.body
  );
}

function DateRangePopover({ anchorRef, panelRef, checkIn, checkOut, initialCursor, onChange, onClose }) {
  const [cursor, setCursor] = useState(() => initialCursor);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth <= 900;
      const panelWidth = isMobile ? clamp(window.innerWidth - 20, 320, 760) : clamp(window.innerWidth - 24, 680, 860);
      const wanted = computePosition(rect, panelWidth, isMobile ? 560 : 510);
      setPos({
        left: wanted.left,
        top: wanted.top,
        width: panelWidth,
        maxHeight: clamp(window.innerHeight - wanted.top - 12, 340, 560),
        isMobile,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef]);

  if (!pos) return null;

  const startDate = parseISO(checkIn);
  const endDate = parseISO(checkOut);
  const leftMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const rightMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);

  const pickDay = (day) => {
    if (!startDate || (startDate && endDate)) {
      onChange(toISO(day), '');
      return;
    }
    if (day.getTime() < startDate.getTime()) {
      onChange(toISO(day), toISO(startDate));
      return;
    }
    onChange(toISO(startDate), toISO(day));
  };

  const renderMonth = (monthDate) => {
    const days = monthGrid(monthDate);
    return (
      <div style={s.monthCard}>
        <p style={s.monthTitle}>{monthDate.getFullYear()}년 {monthDate.getMonth() + 1}월</p>
        <div style={s.weekRow}>
          {WEEK_DAYS.map((day) => <span key={`${monthDate.getMonth()}-${day}`} style={s.weekCell}>{day}</span>)}
        </div>
        <div style={s.dayGrid}>
          {days.map((day) => {
            const inMonth = day.getMonth() === monthDate.getMonth();
            const isStart = sameDate(day, startDate);
            const isEnd = sameDate(day, endDate);
            const isMid = betweenDate(day, startDate, endDate);
            return (
              <button
                key={toISO(day)}
                type="button"
                style={{ ...s.dayBtn, opacity: inMonth ? 1 : 0.34, ...(isMid ? s.dayMid : null), ...(isStart || isEnd ? s.dayActive : null) }}
                onClick={() => pickDay(day)}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return createPortal(
    <div ref={panelRef} style={{ ...s.calendarPanel, left: `${pos.left}px`, top: `${pos.top}px`, width: `${pos.width}px`, maxHeight: `${pos.maxHeight}px` }}>
      <div style={s.calendarNav}>
        <button type="button" style={s.navBtn} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button>
        <button type="button" style={s.navBtn} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button>
      </div>
      <div style={{ ...s.monthGrid, gridTemplateColumns: pos.isMobile ? '1fr' : '1fr 1fr' }}>
        {renderMonth(leftMonth)}
        {!pos.isMobile && renderMonth(rightMonth)}
      </div>
      <div style={s.calendarFooter}>
        <span style={s.calendarText}>{formatDateSummary(checkIn, checkOut)}</span>
        <button type="button" style={s.applyBtn} onClick={onClose}>적용</button>
      </div>
    </div>,
    document.body
  );
}

export default function SearchBar({ defaultKeyword = '', defaultRegion = '', defaultCheckIn = '', defaultCheckOut = '', defaultGuests = 2, showTabs = false }) {
  const navigate = useNavigate();
  const keywordRef = useRef(null);
  const dateRef = useRef(null);
  const guestRef = useRef(null);
  const suggestRef = useRef(null);
  const calendarRef = useRef(null);
  const guestPanelRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [region, setRegion] = useState(defaultRegion);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(clamp(Number(defaultGuests || 2), 1, 30));
  const [showSuggest, setShowSuggest] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState(0);
  const [calendarSeed, setCalendarSeed] = useState(() => parseISO(defaultCheckIn) || new Date());

  const tab = TAB_CONFIG[activeTab] || TAB_CONFIG[0];

  const filteredItems = useMemo(() => {
    const term = normalize(keyword);
    if (term.length < 1) return [];
    return SEARCH_ITEMS
      .filter((item) => item.tabs.includes(tab.key))
      .filter((item) => {
        const fields = [item.label, item.sublabel, ...(item.aliases || [])].map(normalize);
        return fields.some((field) => field.includes(term));
      })
      .slice(0, 12);
  }, [keyword, tab.key]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      const t = e.target;
      if (keywordRef.current && keywordRef.current.contains(t)) return;
      if (dateRef.current && dateRef.current.contains(t)) return;
      if (guestRef.current && guestRef.current.contains(t)) return;
      if (suggestRef.current && suggestRef.current.contains(t)) return;
      if (calendarRef.current && calendarRef.current.contains(t)) return;
      if (guestPanelRef.current && guestPanelRef.current.contains(t)) return;
      setShowSuggest(false);
      setShowCalendar(false);
      setShowGuest(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const handleTabChange = (idx) => {
    setActiveTab(idx);
    setKeyword('');
    setRegion('');
    setCheckIn('');
    setCheckOut('');
    setGuests(clamp(Number(defaultGuests || 2), 1, 30));
    setActiveSuggest(0);
    setShowSuggest(false);
    setShowCalendar(false);
    setShowGuest(false);
  };

  const pickSuggestion = (item) => {
    setKeyword(item.label);
    setRegion(item.region || region);
    setActiveSuggest(0);
    setShowSuggest(false);
  };

  const onKeywordKeyDown = (e) => {
    if (!showSuggest) return;
    if (filteredItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggest((prev) => (prev + 1) % filteredItems.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggest((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      pickSuggestion(filteredItems[activeSuggest]);
    }
  };

  const submitSearch = () => {
    const q = new URLSearchParams();
    if (keyword.trim()) q.set('keyword', keyword.trim());
    if (region) q.set('region', region);
    if (checkIn) q.set('checkIn', checkIn);
    if (checkOut) q.set('checkOut', checkOut);
    q.set('guests', String(clamp(guests, 1, 30)));
    q.set('tab', tab.key);
    navigate(`${tab.route}?${q.toString()}`);
  };

  return (
    <div style={s.root} className="tz-search-root">
      <style>{`
        .tz-search-root, .tz-search-root * { box-sizing: border-box; }
        .tz-main-row { 
          display: flex;
          align-items: center;
          width: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 999px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03);
          padding: 8px;
        }
        .tz-search-root input::placeholder { color:#8B92A2; font-weight: 500; }
        .tz-soft-field { transition: background 0.2s; }
        .tz-soft-field:hover { background: rgba(0,0,0,0.03); }
        .tz-soft-divider { width: 1px; height: 32px; background: ${C.borderLight}; flex-shrink: 0; }
        .tz-guest-btn:hover { background:#f7f7f8; }
        .tz-guest-btn:active { transform: translateY(1px); }
        .tz-guest-btn:focus-visible { outline:2px solid #f2b7b8; outline-offset:1px; }
        
        @media (max-width: 980px) {
          .tz-main-row { 
            flex-direction: column; 
            border-radius: 24px; 
            padding: 16px; 
            gap: 12px; 
          }
          .tz-soft-divider { display: none; }
          .tz-search-btn { width: 100%; border-radius: 16px !important; }
        }
      `}</style>

      {showTabs && (
        <div style={s.tabsWrap}>
          {TAB_CONFIG.map((item, idx) => (
            <button key={item.key} type="button" style={{ ...s.tabBtn, ...(idx === activeTab ? s.tabBtnActive : null) }} onClick={() => handleTabChange(idx)}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="tz-main-row">
        <div ref={keywordRef} style={{ flex: '2', minWidth: 0 }}>
          <input
            value={keyword}
            onChange={(e) => {
              const next = e.target.value;
              setKeyword(next);
              setActiveSuggest(0);
              setShowSuggest(next.trim().length >= 1);
              setShowCalendar(false);
              setShowGuest(false);
            }}
            onFocus={() => setShowSuggest(keyword.trim().length >= 1)}
            onKeyDown={onKeywordKeyDown}
            placeholder={tab.placeholder}
            style={s.keywordInput}
          />
        </div>

        <div className="tz-soft-divider" />

        <div ref={dateRef} style={{ flex: '1', minWidth: 0 }}>
          <button
            type="button"
            style={s.dateField}
            onClick={() => {
              setShowSuggest(false);
              if (!showCalendar) setCalendarSeed(parseISO(checkIn) || new Date());
              setShowCalendar((prev) => !prev);
              setShowGuest(false);
            }}
            className="tz-soft-field"
          >
            {formatDateSummary(checkIn, checkOut)}
          </button>
        </div>

        <div className="tz-soft-divider" />

        <div ref={guestRef} style={{ flex: '0.8', minWidth: 0 }}>
          <button
            type="button"
            style={s.guestTrigger}
            onClick={() => {
              setShowSuggest(false);
              setShowCalendar(false);
              setShowGuest((prev) => !prev);
            }}
            className="tz-soft-field"
          >
            {guests}명
          </button>
        </div>

        <button type="button" style={s.searchBtn} className="tz-search-btn" onClick={submitSearch}>검색</button>
      </div>

      <Suggestions
        open={showSuggest && keyword.trim().length >= 1}
        anchorRef={keywordRef}
        panelRef={suggestRef}
        items={filteredItems}
        keyword={keyword}
        activeIndex={activeSuggest}
        onHover={setActiveSuggest}
        onPick={pickSuggestion}
        emptyText={tab.emptyText}
      />

      {showCalendar && (
        <DateRangePopover
          key={`${calendarSeed.getTime()}-${checkIn}-${checkOut}`}
          anchorRef={dateRef}
          panelRef={calendarRef}
          checkIn={checkIn}
          checkOut={checkOut}
          initialCursor={calendarSeed}
          onChange={(nextIn, nextOut) => {
            setCheckIn(nextIn);
            setCheckOut(nextOut);
          }}
          onClose={() => setShowCalendar(false)}
        />
      )}

      <GuestPopover
        open={showGuest}
        anchorRef={guestRef}
        panelRef={guestPanelRef}
        guests={guests}
        onChange={setGuests}
        onClose={() => setShowGuest(false)}
      />
    </div>
  );
}

const s = {
  root: {
    width: '100%',
    maxWidth: '100%',
  },
  tabsWrap: {
    display: 'flex',
    gap: '22px',
    borderBottom: `1px solid ${C.borderLight}`,
    marginBottom: '12px',
    paddingBottom: '2px',
  },
  tabBtn: {
    border: 'none',
    background: 'transparent',
    color: '#8B92A2',
    fontSize: '16px',
    fontWeight: 700,
    padding: '8px 0 10px',
    cursor: 'pointer',
  },
  tabBtnActive: {
    color: C.primary,
    boxShadow: `inset 0 -3px 0 ${C.primary}`,
  },
  keywordInput: {
    width: '100%',
    height: '56px',
    border: 'none',
    background: 'transparent',
    color: '#1F2530',
    fontSize: '16px',
    fontWeight: 600,
    padding: '0 24px',
    textAlign: 'left',
    outline: 'none',
    boxSizing: 'border-box',
  },
  dateField: {
    width: '100%',
    height: '56px',
    border: 'none',
    borderRadius: '999px',
    background: 'transparent',
    color: '#1F2530',
    fontSize: '15px',
    fontWeight: 600,
    padding: '0 16px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
  },
  guestTrigger: {
    width: '100%',
    height: '56px',
    border: 'none',
    borderRadius: '999px',
    background: 'transparent',
    color: '#1F2530',
    fontSize: '15px',
    fontWeight: 600,
    padding: '0 10px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  guestWrap: {
    width: '100%',
    height: '56px',
    borderRadius: '14px',
    border: '1px solid #E3E6EC',
    background: '#F9FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    gap: '6px',
  },
  guestBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: `1px solid ${C.border}`,
    background: C.bg,
    color: '#3F495B',
    fontSize: '22px',
    lineHeight: 1,
    cursor: 'pointer',
  },
  guestValue: {
    color: '#1F2530',
    fontSize: '16px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  searchBtn: {
    height: '56px',
    borderRadius: '999px',
    border: 'none',
    background: `linear-gradient(135deg, ${C.primary} 0%, #D4393B 100%)`,
    color: '#fff',
    fontSize: '16px',
    fontWeight: 800,
    padding: '0 32px',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(232,72,74,0.3)',
  },
  guestPopover: {
    position: 'fixed',
    borderRadius: '14px',
    border: `1px solid ${C.borderLight}`,
    background: '#fff',
    boxShadow: '0 14px 30px rgba(16,24,40,0.14)',
    padding: '12px',
    zIndex: 1100,
  },
  guestApplyBtn: {
    width: '100%',
    height: '38px',
    marginTop: '10px',
    border: 'none',
    borderRadius: '10px',
    background: C.primary,
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  dropdown: {
    position: 'fixed',
    borderRadius: '12px',
    border: `1px solid ${C.borderLight}`,
    background: C.bg,
    boxShadow: '0 12px 24px rgba(16, 24, 40, 0.12)',
    zIndex: 1100,
    overflowY: 'auto',
  },
  dropdownRow: {
    width: '100%',
    border: 'none',
    borderBottom: `1px solid ${C.borderLight}`,
    background: 'transparent',
    textAlign: 'left',
    color: '#1F2530',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  dropdownRowActive: {
    background: '#EEF2F7',
  },
  dropdownIcon: {
    width: '24px',
    textAlign: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  dropdownTextWrap: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  dropdownLabel: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1F2530',
  },
  dropdownSub: {
    fontSize: '12px',
    color: '#748094',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  dropdownType: {
    borderRadius: '999px',
    background: '#F3F4F7',
    color: '#5D6778',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    flexShrink: 0,
  },
  emptyRow: {
    padding: '14px 12px',
    color: '#6B7383',
    fontSize: '13px',
    fontWeight: 600,
  },
  highlight: {
    background: '#FFECEC',
    color: C.primary,
    borderRadius: '4px',
    padding: '0 2px',
  },
  calendarPanel: {
    position: 'fixed',
    borderRadius: '16px',
    border: `1px solid ${C.borderLight}`,
    background: C.bg,
    boxShadow: '0 18px 36px rgba(16, 24, 40, 0.20)',
    padding: '12px',
    zIndex: 1100,
    overflowY: 'auto',
  },
  calendarNav: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  navBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    border: `1px solid ${C.border}`,
    background: C.bg,
    color: '#3C4556',
    fontSize: '22px',
    lineHeight: 1,
    cursor: 'pointer',
  },
  monthGrid: {
    display: 'grid',
    gap: '10px',
  },
  monthCard: {
    border: `1px solid ${C.borderLight}`,
    borderRadius: '12px',
    background: C.bg,
    padding: '10px',
    minWidth: 0,
  },
  monthTitle: {
    margin: '0 0 8px',
    color: '#202736',
    fontSize: '18px',
    fontWeight: 800,
    textAlign: 'center',
  },
  weekRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '4px',
  },
  weekCell: {
    color: '#97A0AE',
    fontSize: '12px',
    fontWeight: 700,
    textAlign: 'center',
  },
  dayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  dayBtn: {
    height: '44px',
    border: 'none',
    borderRadius: '10px',
    background: 'transparent',
    color: '#243041',
    fontSize: '16px',
    cursor: 'pointer',
  },
  dayMid: {
    background: '#FCECEC',
  },
  dayActive: {
    background: C.primary,
    color: '#fff',
    fontWeight: 800,
  },
  calendarFooter: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: `1px solid ${C.borderLight}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  calendarText: {
    color: '#4A5565',
    fontSize: '14px',
    fontWeight: 700,
  },
  applyBtn: {
    border: 'none',
    borderRadius: '10px',
    background: C.primary,
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
    padding: '8px 14px',
    cursor: 'pointer',
  },
};
