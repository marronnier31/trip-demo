import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { C, MAX_WIDTH } from '../../styles/tokens';

const STORAGE_KEY = 'tripzone-attendance-v1';
const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const REWARD_STEPS = [
  { day: 1, point: 100, label: '첫 출석 보상' },
  { day: 3, point: 300, label: '3일 연속 보상' },
  { day: 7, point: 700, label: '7일 연속 보상' },
  { day: 14, point: 1500, label: '14일 연속 보상' },
  { day: 30, point: 4000, label: '30일 연속 보상' },
];

// TODO(back-end):
// - GET /api/v1/events/attendance
//   expected shape:
//   {
//     dates: ['2026-03-11', '2026-03-12'],
//     streakCount: 2,
//     monthAttendance: 2,
//     rewardSteps: [{ day: 1, point: 100, label: '첫 출석 보상' }]
//   }
// - POST /api/v1/events/attendance/check
//   expected shape:
//   {
//     attendedDate: '2026-03-13',
//     earnedPoint: 100,
//     streakCount: 3,
//     totalPointBalance: 5400
//   }
// 프론트는 위 shape만 맞으면 localStorage 부분을 API 호출로 바로 교체할 수 있다.

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseStoredAttendance() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.dates) ? parsed.dates : [];
  } catch {
    return [];
  }
}

function saveAttendance(dates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ dates }));
}

function buildMonthMatrix(baseDate) {
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }).map((_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current;
  });
}

function getStreakCount(dates) {
  if (!dates.length) return 0;

  const sorted = [...dates].sort();
  let streak = 1;

  for (let i = sorted.length - 1; i > 0; i -= 1) {
    const current = new Date(sorted[i]);
    const prev = new Date(sorted[i - 1]);
    const diff = Math.round((current.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) streak += 1;
    else if (diff > 1) break;
  }

  return streak;
}

export default function AttendancePage() {
  const today = useMemo(() => new Date(), []);
  const todayKey = toISO(today);
  const [attendedDates, setAttendedDates] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // TODO(back-end): 출석 목록 조회 API가 준비되면 localStorage 대신 서버 응답으로 교체한다.
    setAttendedDates(parseStoredAttendance());
  }, []);

  const hasAttendedToday = attendedDates.includes(todayKey);
  const streakCount = useMemo(() => getStreakCount(attendedDates), [attendedDates]);
  const monthDates = useMemo(() => buildMonthMatrix(today), [today]);
  const monthAttendance = attendedDates.filter((date) => date.startsWith(`${todayKey.slice(0, 7)}-`)).length;
  const nextReward = REWARD_STEPS.find((item) => item.day > streakCount) || REWARD_STEPS[REWARD_STEPS.length - 1];

  const handleAttendToday = () => {
    if (hasAttendedToday) {
      setMessage('오늘은 이미 출석했습니다.');
      return;
    }

    const nextDates = [...attendedDates, todayKey].sort();
    saveAttendance(nextDates);
    setAttendedDates(nextDates);
    setMessage('오늘 출석이 완료되었습니다. 적립 예정 혜택은 내 혜택에서 확인할 수 있습니다.');
  };

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <section style={s.hero}>
          <div style={s.heroMain}>
            <p style={s.eyebrow}>ATTENDANCE EVENT</p>
            <h1 style={s.title}>매일 한 번,
              <br />
              출석으로 혜택을 쌓으세요.
            </h1>
            <p style={s.desc}>출석 현황과 누적 보상을 한 화면에서 보고, 오늘 출석 여부를 바로 체크할 수 있게 이벤트형으로 정리했습니다.</p>
            <div style={s.heroActions}>
              <button type="button" style={{ ...s.primaryBtn, opacity: hasAttendedToday ? 0.72 : 1 }} onClick={handleAttendToday}>
                {hasAttendedToday ? '오늘 출석 완료' : '오늘 출석하기'}
              </button>
              <Link to="/events/attendance-point-festa" style={s.secondaryBtn}>이벤트 상세 보기</Link>
            </div>
          </div>

          <aside style={s.heroAside}>
            <div style={s.summaryPanel}>
              <p style={s.summaryPanelLabel}>오늘의 진행 상태</p>
              <div style={s.summaryPanelGrid}>
                <div>
                  <p style={s.summaryPanelValue}>{streakCount}일</p>
                  <p style={s.summaryPanelMeta}>연속 출석</p>
                </div>
                <div>
                  <p style={s.summaryPanelValue}>{monthAttendance}일</p>
                  <p style={s.summaryPanelMeta}>이번 달 출석</p>
                </div>
              </div>
              <p style={s.summaryPanelFoot}>다음 보상은 {nextReward.day}일차 · {nextReward.point.toLocaleString()}P 입니다.</p>
            </div>
          </aside>
        </section>

        <section style={s.topStats}>
          <article style={s.statCard}>
            <p style={s.statLabel}>연속 출석</p>
            <p style={s.statValue}>{streakCount}일</p>
            <p style={s.statDesc}>하루라도 빠지면 다시 1일부터 시작합니다.</p>
          </article>
          <article style={s.statCard}>
            <p style={s.statLabel}>이번 달 출석</p>
            <p style={s.statValue}>{monthAttendance}일</p>
            <p style={s.statDesc}>{today.getFullYear()}년 {today.getMonth() + 1}월 기준 누적입니다.</p>
          </article>
          <article style={s.statCard}>
            <p style={s.statLabel}>다음 보상</p>
            <p style={s.statValue}>{nextReward.point.toLocaleString()}P</p>
            <p style={s.statDesc}>{nextReward.day}일차 · {nextReward.label}</p>
          </article>
        </section>

        {message ? <p style={s.message}>{message}</p> : null}

        <section style={s.contentGrid}>
          <article style={s.calendarCard}>
            <div style={s.cardHead}>
              <div>
                <p style={s.cardEyebrow}>MONTHLY CALENDAR</p>
                <h2 style={s.cardTitle}>{today.getFullYear()}년 {today.getMonth() + 1}월 출석 현황</h2>
              </div>
              <span style={s.liveBadge}>{hasAttendedToday ? '오늘 체크 완료' : '오늘 체크 가능'}</span>
            </div>

            <div style={s.calendarWeek}>
              {WEEK_DAYS.map((day) => (
                <span key={day} style={s.weekCell}>{day}</span>
              ))}
            </div>

            <div style={s.calendarGrid}>
              {monthDates.map((date) => {
                const iso = toISO(date);
                const isCurrentMonth = date.getMonth() === today.getMonth();
                const isToday = iso === todayKey;
                const isChecked = attendedDates.includes(iso);

                return (
                  <div
                    key={iso}
                    style={{
                      ...s.dateCell,
                      opacity: isCurrentMonth ? 1 : 0.35,
                      borderColor: isToday ? '#F1B3B3' : '#ECE4DE',
                      background: isChecked ? '#FFF2F2' : '#fff',
                    }}
                  >
                    <span style={{ ...s.dateNumber, color: isChecked ? C.primary : C.text }}>{date.getDate()}</span>
                    {isChecked ? <span style={s.checkedBadge}>출석</span> : null}
                    {isToday && !isChecked ? <span style={s.todayBadge}>오늘</span> : null}
                  </div>
                );
              })}
            </div>
          </article>

          <article style={s.rewardCard}>
            <div style={s.cardHead}>
              <div>
                <p style={s.cardEyebrow}>REWARD STEPS</p>
                <h2 style={s.cardTitle}>누적 보상 안내</h2>
              </div>
            </div>

            <div style={s.rewardList}>
              {REWARD_STEPS.map((item) => (
                <div
                  key={item.day}
                  style={{
                    ...s.rewardRow,
                    borderColor: streakCount >= item.day ? '#F1B3B3' : '#ECE4DE',
                    background: streakCount >= item.day ? '#FFF7F7' : '#FFFCFB',
                  }}
                >
                  <div>
                    <p style={s.rewardDay}>{item.day}일차</p>
                    <p style={s.rewardLabel}>{item.label}</p>
                  </div>
                  <strong style={s.rewardPoint}>{item.point.toLocaleString()}P</strong>
                </div>
              ))}
            </div>

            <div style={s.noticeCard}>
              <p style={s.noticeTitle}>안내</p>
              <p style={s.noticeDesc}>현재는 브라우저 저장소 기준으로 출석 상태를 유지합니다. 나중에 출석 조회와 저장 API만 붙이면 지금 화면 구조는 그대로 쓸 수 있습니다.</p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

const s = {
  page: { background: 'linear-gradient(180deg, #FBF8F6 0%, #F4F0EE 100%)', minHeight: 'calc(100vh - 160px)', padding: '48px 24px 72px' },
  inner: { maxWidth: MAX_WIDTH, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  hero: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.8fr)', gap: '18px', alignItems: 'stretch' },
  heroMain: { padding: '34px', borderRadius: '30px', background: 'linear-gradient(135deg, #FFF7F1 0%, #FFFFFF 50%, #F7F7FF 100%)', border: '1px solid #EEE4DE', boxShadow: '0 18px 42px rgba(15,23,42,0.06)' },
  heroAside: { display: 'flex' },
  summaryPanel: { width: '100%', padding: '28px', borderRadius: '30px', background: 'linear-gradient(145deg, #FFF2EF 0%, #F6E9E4 58%, #F4ECEA 100%)', color: C.text, border: '1px solid #E9DAD3', boxShadow: '0 18px 40px rgba(120,74,56,0.10)' },
  summaryPanelLabel: { margin: '0 0 12px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: '#C75B5D' },
  summaryPanelGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  summaryPanelValue: { margin: 0, fontSize: '24px', fontWeight: '800' },
  summaryPanelMeta: { margin: '6px 0 0', fontSize: '12px', color: '#8C6A63' },
  summaryPanelFoot: { margin: '18px 0 0', fontSize: '13px', color: '#9B5C37', fontWeight: '700', lineHeight: 1.7 },
  eyebrow: { margin: '0 0 14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 14px', fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.04, color: C.text, fontWeight: '800' },
  desc: { margin: 0, maxWidth: '700px', fontSize: '16px', lineHeight: 1.85, color: C.textSub },
  heroActions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' },
  primaryBtn: { border: 'none', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', padding: '13px 22px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', padding: '13px 18px', borderRadius: '999px', border: `1px solid ${C.border}`, background: '#fff', color: C.text, textDecoration: 'none', fontSize: '14px', fontWeight: '700' },
  topStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  statCard: { background: 'rgba(255,255,255,0.9)', border: '1px solid #EEE4DE', borderRadius: '22px', padding: '20px 22px' },
  statLabel: { margin: 0, fontSize: '12px', color: C.textLight, fontWeight: '800' },
  statValue: { margin: '10px 0 8px', fontSize: '26px', color: C.text, fontWeight: '800' },
  statDesc: { margin: 0, fontSize: '13px', lineHeight: 1.7, color: C.textSub },
  message: { margin: 0, padding: '14px 16px', borderRadius: '16px', background: '#FFF7F7', color: C.primary, fontSize: '14px', fontWeight: '800' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '18px', alignItems: 'start' },
  calendarCard: { background: 'rgba(255,255,255,0.94)', border: '1px solid #EEE4DE', borderRadius: '28px', padding: '24px', boxShadow: '0 18px 40px rgba(15,23,42,0.05)' },
  rewardCard: { background: 'rgba(255,255,255,0.94)', border: '1px solid #EEE4DE', borderRadius: '28px', padding: '24px', boxShadow: '0 18px 40px rgba(15,23,42,0.05)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' },
  cardEyebrow: { margin: '0 0 8px', fontSize: '12px', fontWeight: '800', color: C.primary, letterSpacing: '0.08em' },
  cardTitle: { margin: 0, fontSize: '26px', fontWeight: '800', color: C.text },
  liveBadge: { display: 'inline-flex', padding: '8px 12px', borderRadius: '999px', background: '#FFF1F1', color: C.primary, fontSize: '12px', fontWeight: '800' },
  calendarWeek: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '10px' },
  weekCell: { textAlign: 'center', fontSize: '12px', fontWeight: '800', color: C.textLight },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  dateCell: { minHeight: '78px', border: '1px solid #ECE4DE', borderRadius: '16px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', background: '#fff' },
  dateNumber: { fontSize: '14px', fontWeight: '800' },
  checkedBadge: { display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 7px', borderRadius: '999px', background: '#FDE2E2', color: C.primary, fontSize: '10px', fontWeight: '800' },
  todayBadge: { display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 7px', borderRadius: '999px', background: '#EEF2FF', color: '#4F46E5', fontSize: '10px', fontWeight: '800' },
  rewardList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  rewardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', border: '1px solid #ECE4DE', borderRadius: '18px', padding: '15px 16px' },
  rewardDay: { margin: '0 0 5px', fontSize: '15px', fontWeight: '800', color: C.text },
  rewardLabel: { margin: 0, fontSize: '13px', color: C.textSub },
  rewardPoint: { fontSize: '16px', color: C.primary, fontWeight: '800' },
  noticeCard: { marginTop: '18px', borderRadius: '20px', background: '#FFFCFA', border: '1px solid #EEE4DE', padding: '16px' },
  noticeTitle: { margin: '0 0 8px', fontSize: '14px', fontWeight: '800', color: C.text },
  noticeDesc: { margin: 0, fontSize: '13px', lineHeight: 1.7, color: C.textSub },
};
