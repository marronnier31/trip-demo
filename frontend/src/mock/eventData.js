// TODO(back-end): 진짜 이벤트 목록/상세 API가 준비되면 이 mock 데이터를 서버 응답으로 교체한다.
export const EVENT_ITEMS = [
  {
    slug: 'spring-review-challenge',
    status: '진행중',
    audienceLabel: '전체 회원',
    ctaLabel: '리뷰 이벤트 참여하기',
    actionPath: '/my/bookings',
    lead: '리뷰만 써도 추첨 혜택!',
    title: '봄 리뷰 챌린지',
    date: '2026.03.11 - 2026.04.10',
    subtitle: '리뷰 작성 이벤트',
    imageUrl: 'https://picsum.photos/seed/tripzone-event-review/280/280',
    circle: '#FFE6E8',
    gradient: 'linear-gradient(135deg, #FFF7F7 0%, #FFECEE 52%, #FFF9F2 100%)',
    description: '기간 내 숙박 리뷰를 작성한 회원 중 추첨을 통해 포인트와 쿠폰을 증정하는 참여형 이벤트입니다.',
    highlights: [
      { title: '리뷰 작성만으로 참여', desc: '예약 완료 후 리뷰를 남기면 자동 응모되는 흐름으로 연결할 수 있습니다.' },
      { title: '당첨 혜택 지급', desc: '포인트 지급, 쿠폰 발급, 배너 노출 종료 처리를 백엔드에서 확장하기 쉽습니다.' },
      { title: '이벤트 기간 관리', desc: '시작일/종료일과 참여 상태를 서버 응답으로 바꿔 관리할 수 있습니다.' },
    ],
  },
  {
    slug: 'attendance-point-festa',
    status: '진행중',
    audienceLabel: '로그인 회원',
    ctaLabel: '출석체크 하러 가기',
    actionPath: '/attendance',
    lead: '매일 출석하고 포인트 받기',
    title: '출석체크 포인트 페스타',
    date: '2026.03.15 - 2026.04.14',
    subtitle: '출석체크 이벤트',
    imageUrl: 'https://picsum.photos/seed/tripzone-event-attendance/280/280',
    circle: '#E7F7FF',
    gradient: 'linear-gradient(135deg, #F5FCFF 0%, #EAF8FF 52%, #F5F7FF 100%)',
    description: '매일 방문만 해도 포인트를 적립할 수 있는 출석체크 이벤트입니다. 누적 출석 일수에 따라 보상이 달라집니다.',
    highlights: [
      { title: '일별 참여 상태', desc: '로그인 기준 출석 여부를 체크해 일자별 캘린더에 표시할 수 있습니다.' },
      { title: '누적 보상 구조', desc: '3일, 7일, 14일, 30일 단위 보상 지급 정책을 붙이기 좋습니다.' },
      { title: '포인트 연동', desc: '지급된 포인트는 포인트 이력과 마이페이지에 바로 반영되는 구조로 연결할 수 있습니다.' },
    ],
  },
  {
    slug: 'friend-invite-reward',
    status: '진행중',
    audienceLabel: '추천 가능 회원',
    ctaLabel: '초대 코드 확인하기',
    actionPath: '/mypage',
    lead: '친구 초대하고 혜택 받기',
    title: '친구 초대 리워드',
    date: '2026.03.20 - 2026.05.20',
    subtitle: '추천인 이벤트',
    imageUrl: 'https://picsum.photos/seed/tripzone-event-friend/280/280',
    circle: '#F3EBFF',
    gradient: 'linear-gradient(135deg, #FBF8FF 0%, #F2ECFF 52%, #FFF8FC 100%)',
    description: '친구가 초대 코드를 통해 가입하고 첫 예약을 완료하면 추천인과 친구 모두 혜택을 받는 이벤트입니다.',
    highlights: [
      { title: '추천 코드 기반 참여', desc: '회원별 초대 코드 발급과 사용 상태를 연결하기 좋은 이벤트입니다.' },
      { title: '양방향 혜택 지급', desc: '추천인과 신규 가입자 모두에게 쿠폰이나 포인트를 지급하는 확장에 적합합니다.' },
      { title: '성과 추적 가능', desc: '초대 횟수, 예약 전환 수, 혜택 지급 이력을 한 화면에서 보여줄 수 있습니다.' },
    ],
  },
  {
    slug: 'black-grade-lounge-week',
    status: '등급전용',
    audienceLabel: 'BLACK 등급 전용',
    ctaLabel: '전용 혜택 확인하기',
    actionPath: '/benefits',
    lead: '블랙 등급 전용 한정 혜택',
    title: 'BLACK LOUNGE WEEK',
    date: '2026.04.01 - 2026.04.07',
    subtitle: '등급 전용 이벤트',
    imageUrl: 'https://picsum.photos/seed/tripzone-event-black/280/280',
    circle: '#E8E8E8',
    gradient: 'linear-gradient(135deg, #F5F5F5 0%, #E7E7E7 52%, #FAFAFA 100%)',
    description: '블랙 등급 회원만 참여 가능한 한정 혜택 이벤트입니다. 전용 쿠폰, 선오픈 특가, 추가 적립 혜택을 제공합니다.',
    highlights: [
      { title: '등급 기반 노출', desc: '특정 등급 사용자만 버튼과 혜택을 볼 수 있도록 권한 분기가 가능합니다.' },
      { title: '전용 쿠폰 발급', desc: '등급 조건 충족 시 자동 쿠폰 발급 구조를 붙이기 쉽습니다.' },
      { title: '선오픈 프로모션 연동', desc: '일반 공개 전 사전 예약 형태의 확장에도 잘 맞습니다.' },
    ],
  },
];

export function findEventBySlug(slug) {
  return EVENT_ITEMS.find((item) => item.slug === slug);
}

export function getEventTarget(event) {
  return event?.actionPath || '/events';
}
