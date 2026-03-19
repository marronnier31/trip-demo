import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import BookingPopup from '../../components/booking/BookingPopup';
import SellerInquiryPopup from '../../components/inquiry/SellerInquiryPopup';
import LodgingMap from '../../components/lodging/LodgingMap';
import ReviewCard from '../../components/review/ReviewCard';
import ReviewComposer from '../../components/review/ReviewComposer';
import { getLodging } from '../../api/lodging';
import { createReview, deleteReview, getReviewEligibility, getReviewSummary, getReviewsByLodging } from '../../utils/reviewMock';
import { ROLES } from '../../constants/roles';
import { C, MAX_WIDTH } from '../../styles/tokens';

const DETAIL_MAX_WIDTH = '1320px';

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const [inY, inM, inD] = String(checkIn).split('-').map(Number);
  const [outY, outM, outD] = String(checkOut).split('-').map(Number);
  if (!inY || !inM || !inD || !outY || !outM || !outD) return 0;
  const inUtc = Date.UTC(inY, inM - 1, inD);
  const outUtc = Date.UTC(outY, outM - 1, outD);
  return Math.max(0, Math.floor((outUtc - inUtc) / 86400000));
}

function getTodayText() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLodgingHighlights(lodging) {
  if (!lodging) return [];
  return [
    '즉시 예약 확정',
    '무료 취소 가능',
    `${lodging.region} 인기 숙소`,
  ];
}

function getAmenityItems(lodging) {
  const common = ['무료 Wi-Fi', '주차 가능', '셀프 체크인'];
  if (String(lodging?.region || '').includes('제주')) return [...common, '바비큐 공간', '오션/산 전망'];
  if (String(lodging?.region || '').includes('서울')) return [...common, '짐 보관', '대중교통 접근'];
  if (String(lodging?.region || '').includes('강원')) return [...common, '테라스', '조식 제공'];
  return [...common, '가족실', '냉난방 완비'];
}

function getPolicyRows(lodging) {
  return [
    { label: '체크인', value: '15:00 이후' },
    { label: '체크아웃', value: '11:00 이전' },
    { label: '취소 정책', value: '체크인 3일 전까지 무료 취소' },
    { label: '호스트 응답', value: '평균 10분 이내' },
    { label: '예약 확정', value: '결제 후 즉시 확정' },
    { label: '기준 인원', value: '2명 · 최대 4명' },
  ];
}

function getLocationNotes(lodging) {
  return [
    {
      eyebrow: 'ACCESS',
      title: `${lodging?.region || '주요 지역'} 중심 이동`,
      desc: '체크인 후 바로 이동 동선을 잡기 좋은 위치입니다.',
    },
    {
      eyebrow: 'NEARBY',
      title: '편의점 · 카페 도보권',
      desc: '간단한 식음료나 필요한 물품을 가까이에서 해결할 수 있습니다.',
    },
    {
      eyebrow: 'DRIVE',
      title: '주요 관광지 10~20분',
      desc: '차량 기준으로 주요 스팟까지 무리 없이 이동 가능한 거리입니다.',
    },
  ];
}

function getIntroductionParagraphs(lodging) {
  return [
    `${lodging?.name || '이 숙소'}는 ${lodging?.region || '주요 여행지'} 이동이 편한 위치에 있으면서도 한층 차분한 휴식 분위기를 갖춘 스테이입니다. 체크인부터 체크아웃까지 과하게 복잡하지 않게 머물 수 있도록 객실 동선, 기본 어메니티, 셀프 체크인 흐름을 기준으로 구성했습니다.`,
    `숙소 안에서는 무료 Wi-Fi, 기본 취식 공간, 짐 정리와 휴식에 무리가 없는 레이아웃을 제공하고 있습니다. 짧은 1박 일정은 물론 주말 여행이나 가벼운 기념일 숙박처럼 일정이 빠듯한 경우에도 부담 없이 이용할 수 있는 점이 장점입니다.`,
    `예약 전에는 체크인 가능 시간, 인원 기준, 취소 가능 시점, 추가 비용 여부를 먼저 확인해두는 것을 권장합니다. 이 페이지 하단에는 이용 정보와 중요 안내를 한 번에 볼 수 있도록 정리해두었고, 더 세부적인 확인이 필요하면 판매자 문의를 통해 바로 질문할 수 있습니다.`,
  ];
}

function getUsageGuideSections() {
  return [
    {
      title: '숙소 이용 정보',
      items: [
        '체크인 15:00 / 체크아웃 11:00 기준이며, 숙소별 실제 입실 안내는 예약 확정 후 다시 제공됩니다.',
        '객실 기준 인원을 초과하는 경우 추가 요금 또는 이용 제한이 있을 수 있습니다.',
        '숙소 내 비품/가구 위치와 이용 방식은 체크인 안내 메시지에서 다시 확인할 수 있습니다.',
      ],
    },
    {
      title: '중요 안내',
      emphasis: '[공지] 일부 날짜와 상품은 예약 상황에 따라 판매가, 객실 재고, 취소 가능 조건이 실시간으로 변경될 수 있습니다.',
      items: [
        '체크인 전 판매자가 별도 확인이 필요한 정보를 요청할 수 있습니다.',
        '객실 상태와 운영 정책은 예약일 기준으로 적용되며, 시즌이나 행사 일정에 따라 일부 조건이 달라질 수 있습니다.',
        '시설물 파손, 분실, 객실 내 흡연 등 운영 정책 위반 시 추가 비용이 발생할 수 있습니다.',
        '숙소에 따라 엘리베이터, 주차, 조식, 추가 침구 등 제공 범위가 다르므로 예약 전 세부 조건을 확인해 주세요.',
      ],
    },
    {
      title: '숙박 시설 결제 요금 안내',
      items: [
        '표시된 요금은 선택한 일정과 인원 기준의 1차 예약 금액입니다.',
        '추가 인원, 현장 선택 옵션, 일부 부가 서비스는 체크인 전 또는 현장에서 별도로 안내될 수 있습니다.',
        '환율, 지역세, 특별 프로모션 조건은 예약 시점 기준으로 최종 반영됩니다.',
      ],
    },
    {
      title: '서비스 요금',
      items: [
        '일부 상품은 운영 수수료 또는 청소/정비 관련 비용이 포함될 수 있습니다.',
        '포인트/쿠폰 적용 결과는 예약 페이지에서 최종 확인 가능합니다.',
        '정책상 환불 불가 구간에 진입한 이후에는 일부 서비스 요금이 차감될 수 있습니다.',
      ],
    },
  ];
}

function getBenefitFacts(selectedRoom) {
  return [
    '최대 10% 쿠폰 적용 가능',
    '리뷰 작성 시 포인트 적립 예정',
    `${selectedRoom?.name || '선택 객실'} 기준 혜택 문맥 표시`,
  ];
}

function getRoomOptions(lodging) {
  const basePrice = Number(lodging?.pricePerNight || 0);
  return [
    {
      roomId: 'room-standard',
      name: '디럭스 더블룸',
      tags: ['무료 취소', '조식 선택 가능'],
      description: '도심 또는 지역 뷰가 보이는 기본 객실입니다.',
      imageUrl: lodging?.thumbnailUrl,
      maxGuests: 2,
      stockText: '남은 객실 3개',
      pricePerNight: basePrice,
    },
    {
      roomId: 'room-family',
      name: '프리미엄 트윈룸',
      tags: ['무료 취소', '고층 배정'],
      description: '넓은 침대 구성으로 가족/동반 투숙에 적합합니다.',
      imageUrl: `https://picsum.photos/seed/${lodging?.lodgingId || 'room'}-family/640/420`,
      maxGuests: 3,
      stockText: '남은 객실 2개',
      pricePerNight: basePrice + 24000,
    },
    {
      roomId: 'room-suite',
      name: '시그니처 스위트',
      tags: ['무료 취소', '혜택 포함'],
      description: '업그레이드된 공간과 라운지 혜택을 함께 제공합니다.',
      imageUrl: `https://picsum.photos/seed/${lodging?.lodgingId || 'room'}-suite/640/420`,
      maxGuests: 4,
      stockText: '남은 객실 1개',
      pricePerNight: basePrice + 58000,
    },
  ];
}

function getQuickFacts(lodging) {
  return [
    { label: '혜택 적용', value: '쿠폰 · 포인트 가능' },
    { label: '체크인/체크아웃', value: '15:00 · 11:00' },
    { label: '기준/최대 인원', value: '2명 / 4명' },
    { label: '숙소 유형', value: '프라이빗 스테이' },
  ];
}

function getReviewTone(summary) {
  if (summary.averageRating >= 4.8) return '만족도 높은 후기 비중이 큰 숙소입니다.';
  if (summary.averageRating >= 4.5) return '전반적으로 안정적인 평가를 받고 있습니다.';
  return '리뷰 내용을 꼼꼼히 확인하고 선택해 보세요.';
}

export default function LodgingDetailPage() {
  const { lodgingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [lodging, setLodging] = useState(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [bookingError, setBookingError] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [reviewSort, setReviewSort] = useState('latest');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [sellerInquiryOpen, setSellerInquiryOpen] = useState(false);
  const [bookingPopupOpen, setBookingPopupOpen] = useState(false);
  const [bookingRoleMessage, setBookingRoleMessage] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [showSectionNav, setShowSectionNav] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const overviewSectionRef = useRef(null);
  const roomSectionRef = useRef(null);
  const amenitySectionRef = useRef(null);
  const locationSectionRef = useRef(null);
  const reviewSectionRef = useRef(null);
  const sectionOffset = 148;

  const nights = calcNights(checkIn, checkOut);
  const today = getTodayText();
  const highlights = getLodgingHighlights(lodging);
  const amenityItems = getAmenityItems(lodging);
  const policyRows = getPolicyRows(lodging);
  const locationNotes = getLocationNotes(lodging);
  const roomOptions = getRoomOptions(lodging);
  const selectedRoom = roomOptions.find((room) => room.roomId === selectedRoomId) || roomOptions[0];
  const benefitFacts = getBenefitFacts(selectedRoom);
  const introParagraphs = getIntroductionParagraphs(lodging);
  const usageGuideSections = getUsageGuideSections();
  const quickFacts = getQuickFacts(lodging);

  const sectionEntries = [
    { key: 'overview', label: '개요', ref: overviewSectionRef },
    { key: 'room', label: '객실', ref: roomSectionRef },
    { key: 'service', label: '서비스', ref: amenitySectionRef },
    { key: 'location', label: '위치', ref: locationSectionRef },
    { key: 'review', label: '리뷰', ref: reviewSectionRef },
  ];

  useEffect(() => {
    getLodging(lodgingId).then(res => setLodging(res.data)).catch(() => { });
  }, [lodgingId]);

  useEffect(() => {
    if (!roomOptions.length) return;
    setSelectedRoomId((current) => current || roomOptions[0].roomId);
  }, [lodgingId, roomOptions]);

  useEffect(() => {
    setReviews(getReviewsByLodging(lodgingId, user?.userId));
  }, [lodgingId, user?.userId]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowSectionNav((prev) => currentY > 460 || (prev && currentY > 90));

      const visible = sectionEntries
        .map((entry) => ({
          key: entry.key,
          top: entry.ref.current?.getBoundingClientRect().top,
        }))
        .filter((entry) => typeof entry.top === 'number');

      if (!visible.length) return;

      const passed = visible.filter((entry) => entry.top <= 196);
      const current = passed.length ? passed[passed.length - 1] : visible[0];

      if (current?.key) setActiveSection(current.key);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lodgingId, reviews.length, selectedRoomId]);

  if (!lodging) return (
    <div style={{ padding: '80px', textAlign: 'center', color: C.textSub }}>
      로딩 중...
    </div>
  );

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== ROLES.USER) {
      setBookingRoleMessage('예약은 여행객 계정에서만 진행할 수 있습니다.');
      setBookingPopupOpen(true);
      return;
    }
    setBookingRoleMessage('');
    setBookingPopupOpen(true);
  };

  const handleBookingConfirm = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== ROLES.USER) {
      setBookingRoleMessage('예약은 여행객 계정으로 로그인한 뒤 이용할 수 있습니다.');
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingError('체크인/체크아웃 날짜를 선택해 주세요.');
      return;
    }
    if (nights <= 0) {
      setBookingError('체크아웃은 체크인보다 이후 날짜여야 합니다.');
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingError('체크인/체크아웃 날짜를 선택해 주세요.');
      return;
    }
    if (nights <= 0) {
      setBookingError('체크아웃은 체크인보다 이후 날짜여야 합니다.');
      return;
    }
    setBookingError('');
    setBookingPopupOpen(false);
    navigate(`/booking/${lodgingId}`, { state: { checkIn, checkOut, guests } });
  };

  const handleInquiry = () => {
    if (!user) { navigate('/login'); return; }
    setSellerInquiryOpen(true);
  };

  const liked = isWishlisted(lodgingId);

  const moveToSection = (sectionRef, key) => {
    const nextTop = sectionRef?.current?.getBoundingClientRect().top;
    if (typeof nextTop !== 'number') return;
    const nextOffset = key === 'overview' ? 118 : sectionOffset;
    setActiveSection(key);
    const absoluteTop = window.scrollY + nextTop - nextOffset;
    window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: lodging.name, text: `${lodging.name} 공유`, url: shareUrl });
        setShareMessage('공유가 완료되었습니다.');
        window.setTimeout(() => setShareMessage(''), 1400);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('링크가 복사되었습니다.');
      window.setTimeout(() => setShareMessage(''), 1400);
    } catch {
      setShareMessage('공유에 실패했습니다. 다시 시도해 주세요.');
      window.setTimeout(() => setShareMessage(''), 1800);
    }
  };

  const handleReviewImageChange = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5);
    const nextImages = await Promise.all(files.map((file, index) => (
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            id: `${file.name}-${index}-${file.size}`,
            name: file.name,
            url: String(reader.result || ''),
          });
        };
        reader.readAsDataURL(file);
      })
    )));
    setReviewImages(nextImages);
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    const trimmedContent = reviewContent.trim();
    if (!trimmedContent) {
      setReviewError('리뷰 내용을 입력해 주세요.');
      setReviewMessage('');
      return;
    }
    if (!user) {
      setReviewError('로그인 후 리뷰를 작성할 수 있습니다.');
      setReviewMessage('');
      return;
    }
    // TODO(back-end): 리뷰 작성 API가 준비되면 rating/content/imageUrls와 bookingId를 함께 서버에 전송한다.
    createReview({
      lodgingId,
      user,
      rating: reviewRating,
      content: trimmedContent,
      imageUrls: reviewImages.map((image) => image.url),
    });
    setReviews(getReviewsByLodging(lodgingId, user?.userId));
    setReviewContent('');
    setReviewImages([]);
    setReviewRating(5);
    setReviewMessage('리뷰가 등록되었습니다.');
    setReviewError('');
  };

  const handleReviewDelete = (reviewId) => {
    if (!user) return;
    const deleted = deleteReview(reviewId, user.userId);
    if (!deleted) {
      setReviewError('리뷰 삭제에 실패했습니다.');
      setReviewMessage('');
      return;
    }
    setReviews(getReviewsByLodging(lodgingId, user?.userId));
    setReviewMessage('리뷰가 삭제되었습니다.');
    setReviewError('');
  };

  const reviewSummary = getReviewSummary(lodgingId);
  const reviewEligibility = getReviewEligibility(user, lodgingId);
  const reviewTone = getReviewTone(reviewSummary);
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'rating') return b.rating - a.rating;
    if (reviewSort === 'photo') return (b.imageUrls?.length || 0) - (a.imageUrls?.length || 0);
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });

  return (
    <div>
      <style>{`
        @media (max-width: 980px) {
          .tz-section-nav {
            display: none !important;
          }
          .tz-lodging-gallery {
            grid-template-columns: 1fr !important;
            max-height: none !important;
          }
          .tz-lodging-main-img {
            height: 320px !important;
          }
          .tz-lodging-gallery-subs {
            flex-direction: row !important;
          }
          .tz-lodging-sub-img {
            height: 140px !important;
          }
          .tz-lodging-content {
            flex-direction: column !important;
            gap: 28px !important;
          }
          .tz-lodging-sidebar {
            width: 100% !important;
            position: static !important;
            top: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .tz-lodging-wrap {
            padding: 28px 16px 44px !important;
          }
        }
        @media (max-width: 720px) {
          .tz-lodging-quickinfo {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .tz-lodging-main-img {
            height: 240px !important;
          }
          .tz-lodging-sub-img {
            height: 120px !important;
          }
        }
        .tz-action-btn { transition: all 0.2s ease; }
        .tz-action-btn:hover { background: #f9f9f9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .tz-lodging-img { transition: transform 0.4s ease; }
        .tz-gallery-wrap:hover .tz-lodging-img { transform: scale(1.02); }
      `}</style>
      {showSectionNav ? (
        <div style={s.sectionNavBar} className="tz-section-nav">
          <div style={s.sectionNavInner}>
            <div style={s.sectionNavLinks}>
              {sectionEntries.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  style={{ ...s.sectionNavBtn, ...(activeSection === entry.key ? s.sectionNavBtnActive : null) }}
                  onClick={() => moveToSection(entry.ref, entry.key)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {/* ── 이미지 갤러리 ── */}
      <div style={s.galleryShell} className="tz-gallery-wrap">
        <div style={s.gallery} className="tz-lodging-gallery">
          <div style={s.galleryMain}>
            <img src={lodging.thumbnailUrl} alt={lodging.name} style={s.mainImg} className="tz-lodging-main-img" />
          </div>
          <div style={s.gallerySubs} className="tz-lodging-gallery-subs">
            <img src={`https://picsum.photos/seed/${lodgingId}a/400/300`} alt="" style={s.subImg} className="tz-lodging-sub-img" />
            <img src={`https://picsum.photos/seed/${lodgingId}b/400/300`} alt="" style={s.subImg} className="tz-lodging-sub-img" />
          </div>
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div style={s.wrap} className="tz-lodging-wrap">
        <div style={s.content} className="tz-lodging-content">
          {/* 좌측 메인 */}
          <div style={s.main}>
            <div ref={overviewSectionRef} />
            <div style={s.overviewCard}>
              <div style={s.overviewTopRow}>
                <div>
                  <p style={s.region}>{lodging.region}</p>
                  <h1 style={s.name}>{lodging.name}</h1>
                  <div style={s.highlightRow}>
                    {highlights.map((item) => (
                      <span key={item} style={s.highlightChip}>{item}</span>
                    ))}
                  </div>
                </div>
                <div style={s.actionRow}>
                  <button type="button" className="tz-action-btn" style={{ ...s.actionBtn, ...(liked ? s.actionBtnActive : null) }} onClick={() => toggleWishlist(lodging)}>
                    {liked ? '♥ 찜 완료' : '♡ 찜하기'}
                  </button>
                  <button type="button" className="tz-action-btn" style={s.actionBtn} onClick={handleShare}>
                    {shareMessage || '공유하기'}
                  </button>
                </div>
              </div>
              <div style={s.metaCard}>
                <div style={s.metaPrimary}>
                  <span style={s.metaRating}>★ {lodging.rating}</span>
                  <button type="button" style={s.metaLinkBtn} onClick={() => moveToSection(reviewSectionRef, 'review')}>
                    후기 {lodging.reviewCount}개
                  </button>
                </div>
                <button type="button" style={s.metaAddressBtn} onClick={() => moveToSection(locationSectionRef, 'location')}>
                  {lodging.address}
                </button>
              </div>
              <div style={s.quickInfoGrid} className="tz-lodging-quickinfo">
                {quickFacts.map((fact) => (
                  <div key={fact.label} style={s.quickInfoItem}>
                    <span style={s.quickInfoLabel}>{fact.label}</span>
                    <strong style={s.quickInfoValue}>{fact.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <hr style={s.hr} />

            <div style={s.section} ref={roomSectionRef}>
              <div style={s.sectionHeaderRow}>
                <div>
                  <h2 style={s.sectionTitle}>객실 선택</h2>
                </div>
              </div>
              {roomOptions.map((room) => {
                const selected = selectedRoom?.roomId === room.roomId;
                return (
                  <div key={room.roomId} style={{ ...s.roomRow, ...(selected ? s.roomRowActive : null) }}>
                    <div style={s.roomImageWrap}>
                      <img src={room.imageUrl} alt={room.name} style={s.roomImage} />
                    </div>
                    <div style={s.roomBody}>
                      <div style={s.roomHeader}>
                        <div>
                          <h3 style={s.roomName}>{room.name}</h3>
                          <div style={s.roomFactRow}>
                            <span style={s.roomFact}>최대 {room.maxGuests}명</span>
                            <span style={s.roomFactDot}>·</span>
                            <span style={s.roomFact}>{room.stockText}</span>
                            {room.tags.map((tag) => (
                              <span key={`${room.roomId}-${tag}`} style={s.roomFactTag}>{tag}</span>
                            ))}
                          </div>
                          <p style={s.roomDesc}>{room.description}</p>
                        </div>
                        <div style={s.roomPriceBox}>
                          <span style={s.roomPriceLabel}>1박 기준</span>
                          <strong style={s.roomPriceValue}>{room.pricePerNight.toLocaleString()}원</strong>
                        </div>
                      </div>
                      <div style={s.roomTagRow}>
                        {selected ? <span style={s.roomStock}>현재 선택된 객실</span> : null}
                      </div>
                      <div style={s.roomFooter}>
                        <div style={s.roomMetaText}>선택 시 오른쪽 예약 정보와 금액이 함께 바뀝니다.</div>
                        <button
                          type="button"
                          style={{ ...s.roomSelectBtn, ...(selected ? s.roomSelectBtnActive : null) }}
                          onClick={() => setSelectedRoomId(room.roomId)}
                        >
                          {selected ? '선택됨' : '이 객실 선택'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <hr style={s.hr} />

            <div style={s.section} ref={amenitySectionRef}>
              <div style={s.sectionHeaderRow}>
                <div>
                  <h2 style={s.sectionTitle}>숙소 소개</h2>
                </div>
              </div>
              <div style={s.introductionQuote}>{lodging.description}</div>
              <div style={s.introductionBody}>
                {introParagraphs.map((paragraph) => (
                  <p key={paragraph} style={s.desc}>{paragraph}</p>
                ))}
              </div>
            </div>

            <hr style={s.hr} />

            <div style={s.section}>
              <div style={s.sectionHeaderRow}>
                <div>
                  <h2 style={s.sectionTitle}>서비스 및 편의시설</h2>
                </div>
              </div>
              <div style={s.amenityList}>
                {amenityItems.map((item) => (
                  <div key={item} style={s.amenityItem}>{item}</div>
                ))}
              </div>
            </div>

            <hr style={s.hr} />

            <div style={s.section}>
              <h2 style={s.sectionTitle}>이용 안내</h2>
              <div style={s.policyList}>
                {policyRows.map((row) => (
                  <div key={row.label} style={s.policyRow}>
                    <span style={s.policyLabel}>{row.label}</span>
                    <span style={s.policyValue}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={s.guideSectionList}>
                {usageGuideSections.map((section) => (
                  <div key={section.title} style={s.guideSection}>
                    <h3 style={s.guideSectionTitle}>{section.title}</h3>
                    {section.emphasis ? <div style={s.guideNotice}>{section.emphasis}</div> : null}
                    <ul style={s.guideBulletList}>
                      {section.items.map((item) => (
                        <li key={item} style={s.guideBulletItem}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 우측 정보 패널 */}
          <div style={s.sidebar} className="tz-lodging-sidebar">
            <div style={s.bookingCard}>
              <div style={s.bookingCardTop}>
                <div style={s.sideInfoHeader}>
                  <p style={s.sideInfoTitle}>선택한 객실</p>
                  <span style={{ ...s.sideInfoBadge, background: '#EEF2FF', color: '#4338CA', borderColor: '#C7D2FE' }}>객실</span>
                </div>
                <strong style={s.sideRoomName}>{selectedRoom?.name}</strong>
                <p style={s.sideRoomDesc}>최대 {selectedRoom?.maxGuests}명 · {selectedRoom?.stockText}</p>
              </div>

              <div style={s.bookingPriceBox}>
                <span style={s.bookingPriceLabel}>1박 기준 금액</span>
                <strong style={s.bookingPriceValue}>{selectedRoom?.pricePerNight?.toLocaleString()}원</strong>
                <p style={s.bookingPriceHint}>쿠폰과 포인트는 예약 단계에서 함께 적용할 수 있습니다.</p>
              </div>

              <div style={s.bookingActionRow}>
                <button type="button" style={s.bookingPrimaryBtn} onClick={handleBook}>예약하기</button>
                <button type="button" style={s.bookingSecondaryBtn} onClick={() => moveToSection(roomSectionRef, 'room')}>객실 다시 보기</button>
              </div>

              <div style={s.bookingPolicyBox}>
                <p style={s.bookingPolicyTitle}>예약 전 확인</p>
                <ul style={s.sideInfoList}>
                  <li>체크인 3일 전까지 무료 취소가 가능합니다.</li>
                  <li>결제 완료 후 즉시 예약이 확정됩니다.</li>
                  <li>예약 단계에서 최종 금액을 한 번 더 확인할 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div style={s.fullWidthArea}>
          <hr style={s.hr} />

          <div style={s.section} ref={locationSectionRef}>
            <div style={s.locationHeader}>
              <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>위치</h2>
            </div>
            <div style={s.mapBox}>
              <LodgingMap
                latitude={lodging.latitude}
                longitude={lodging.longitude}
                name={lodging.name}
                address={lodging.address}
                pricePerNight={lodging.pricePerNight}
              />
            </div>
            <p style={s.mapCoord}>위도 {lodging.latitude} / 경도 {lodging.longitude}</p>
            <div style={s.locationNoteListWide}>
              {locationNotes.map((note) => (
                <article key={note.title} style={s.locationNoteCard}>
                  <p style={s.locationNoteEyebrow}>{note.eyebrow}</p>
                  <h3 style={s.locationNoteTitle}>{note.title}</h3>
                  <p style={s.locationNoteDesc}>{note.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <hr style={s.hr} />

          <div style={s.section} ref={reviewSectionRef}>
            {/* TODO(back-end): 리뷰 요약/리뷰 목록/작성 가능 여부는 아래 mock 대신 리뷰 API 응답으로 교체한다. */}
            <div style={s.reviewInner}>
              <div style={s.reviewSectionHeader}>
                <div>
                  <h2 style={s.sectionTitle}>리뷰</h2>
                  <p style={s.reviewSectionDesc}>실제 투숙 경험을 기준으로 한 리뷰와 사진을 모아봤습니다.</p>
                </div>
                <div style={s.reviewScoreInline}>
                  <span style={s.reviewScoreValue}>★ {reviewSummary.averageRating.toFixed(1)}</span>
                  <span style={s.reviewScoreMeta}>리뷰 {reviewSummary.reviewCount}개</span>
                </div>
              </div>

              <div style={s.reviewSummaryInline}>
                <div style={s.reviewSummaryStat}>
                  <span style={s.reviewSummaryLabel}>평균 별점</span>
                  <span style={s.reviewSummaryText}>{reviewSummary.averageRating.toFixed(1)}</span>
                </div>
                <div style={s.reviewSummaryDivider} />
                <div style={s.reviewSummaryStat}>
                  <span style={s.reviewSummaryLabel}>전체 리뷰</span>
                  <span style={s.reviewSummaryText}>{reviewSummary.reviewCount}개</span>
                </div>
                <div style={s.reviewSummaryDivider} />
                <div style={s.reviewSummaryStat}>
                  <span style={s.reviewSummaryLabel}>사진 리뷰</span>
                  <span style={s.reviewSummaryText}>{reviewSummary.photoReviewCount}개</span>
                </div>
              </div>
              <div style={s.reviewToneBox}>{reviewTone}</div>

              <ReviewComposer
                user={user}
                canWrite={reviewEligibility.canWrite}
                reason={reviewEligibility.reason}
                rating={reviewRating}
                content={reviewContent}
                selectedImages={reviewImages}
                onRatingChange={setReviewRating}
                onContentChange={setReviewContent}
                onImageChange={handleReviewImageChange}
                onLogin={() => navigate('/login')}
                onSubmit={handleReviewSubmit}
              />

              {reviewMessage ? <p style={s.reviewSuccess}>{reviewMessage}</p> : null}
              {reviewError ? <p style={s.reviewError}>{reviewError}</p> : null}

              <div style={s.reviewSortRow}>
                {[
                  { value: 'latest', label: '최신순' },
                  { value: 'rating', label: '평점 높은순' },
                  { value: 'photo', label: '사진 리뷰' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    style={{ ...s.reviewSortBtn, ...(reviewSort === option.value ? s.reviewSortBtnActive : null) }}
                    onClick={() => setReviewSort(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div style={s.reviewList}>
                {sortedReviews.length ? (
                  sortedReviews.map((review) => <ReviewCard key={review.reviewId} review={review} onDelete={handleReviewDelete} />)
                ) : (
                  <div style={s.reviewEmpty}>
                    <p style={s.reviewEmptyTitle}>아직 리뷰가 없습니다.</p>
                    <p style={s.reviewEmptyDesc}>첫 번째 리뷰를 남겨 숙소 경험을 공유해 주세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr style={s.hr} />

          <div style={s.section}>
            <button onClick={handleInquiry} style={s.inquiryBtn}>판매자에게 문의하기</button>
          </div>
        </div>
      </div>
      {sellerInquiryOpen ? (
        <SellerInquiryPopup
          lodging={lodging}
          user={user}
          onClose={() => setSellerInquiryOpen(false)}
        />
      ) : null}
      <BookingPopup
        open={bookingPopupOpen}
        lodging={lodging}
        room={selectedRoom}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        today={today}
        error={bookingError}
        roleMessage={bookingRoleMessage}
        onClose={() => {
          setBookingPopupOpen(false);
          setBookingError('');
          setBookingRoleMessage('');
        }}
        onCheckInChange={(value) => {
          setCheckIn(value);
          if (checkOut && value && checkOut <= value) setCheckOut('');
          setBookingError('');
        }}
        onCheckOutChange={(value) => {
          setCheckOut(value);
          setBookingError('');
        }}
        onGuestsChange={(value) => {
          setGuests(value);
          setBookingError('');
        }}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
}

const s = {
  galleryShell: {
    maxWidth: DETAIL_MAX_WIDTH,
    margin: '0 auto',
    padding: '24px 24px 0',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '8px',
    maxHeight: '520px',
    overflow: 'hidden',
    background: C.bgGray,
    borderRadius: '30px',
    border: '1px solid rgba(17,24,39,0.06)',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)',
  },
  galleryMain: { overflow: 'hidden' },
  mainImg: { width: '100%', height: '480px', objectFit: 'cover', display: 'block' },
  gallerySubs: { display: 'flex', flexDirection: 'column', gap: '8px' },
  subImg: { width: '100%', height: '236px', objectFit: 'cover', display: 'block' },
  wrap: { maxWidth: DETAIL_MAX_WIDTH, margin: '0 auto', padding: '28px 24px 64px' },
  content: { display: 'flex', gap: '36px', alignItems: 'flex-start', justifyContent: 'space-between' },
  main: { flex: '1 1 auto', minWidth: 0 },
  fullWidthArea: { marginTop: '8px', display: 'grid', gap: '8px' },
  overviewCard: {
    padding: '28px',
    borderRadius: '28px',
    background: 'linear-gradient(145deg, #FFF9F5 0%, #FFFFFF 52%, #FAF7F4 100%)',
    border: '1px solid #EEE4DE',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  overviewTopRow: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' },
  region: { fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: C.primary, margin: '0 0 12px' },
  name: { fontSize: '36px', fontWeight: '800', color: C.text, margin: 0, lineHeight: 1.1 },
  metaCard: {
    marginTop: '18px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '16px 18px',
    borderRadius: '22px',
    background: '#fff',
    border: '1px solid #EEE4DE',
  },
  metaPrimary: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  metaRating: { fontSize: '18px', color: C.text, fontWeight: '800' },
  metaAddressBtn: {
    border: 'none',
    background: '#F7F4F1',
    padding: '10px 14px',
    borderRadius: '999px',
    color: '#4B5563',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  highlightRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0 0' },
  highlightChip: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#B45309',
    background: '#FFF7ED',
    border: '1px solid #FED7AA',
    borderRadius: '999px',
    padding: '6px 10px',
  },
  metaLinkBtn: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    color: '#24303C',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: '#D6DADF',
    textUnderlineOffset: '3px',
  },
  quickInfoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginTop: '18px' },
  quickInfoItem: { borderRadius: '20px', padding: '18px', background: '#fff', border: '1px solid #EEE4DE', minHeight: '88px' },
  quickInfoLabel: { display: 'block', fontSize: '12px', color: '#8A6F66', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.04em' },
  quickInfoValue: { fontSize: '17px', color: C.text, fontWeight: 800, lineHeight: 1.35 },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actionBtn: {
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.text,
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 700,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  actionBtnActive: {
    borderColor: '#E8484A',
    background: '#FFF1F1',
    color: '#C13A3D',
  },
  hr: { border: 'none', borderTop: `1px solid ${C.borderLight}`, margin: '32px 0' },
  section: { marginBottom: '8px' },
  sectionHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' },
  sectionTitle: { fontSize: '22px', fontWeight: '700', color: C.text, margin: '0 0 16px' },
  sectionIntro: { margin: 0, fontSize: '15px', color: '#66707C', lineHeight: 1.65 },
  desc: { fontSize: '16px', lineHeight: '1.9', color: C.text, margin: 0 },
  introductionQuote: {
    borderLeft: '2px solid #D9C8BF',
    paddingLeft: '12px',
    fontSize: '18px',
    lineHeight: 1.7,
    color: '#2F3540',
    fontWeight: 700,
    marginBottom: '16px',
  },
  introductionBody: { display: 'grid', gap: '12px', maxWidth: '900px' },
  roomRow: {
    display: 'grid',
    gridTemplateColumns: '220px minmax(0, 1fr)',
    gap: '18px',
    borderBottom: `1px solid ${C.borderLight}`,
    padding: '18px 0',
    marginBottom: '14px',
  },
  roomRowActive: {
    background: 'linear-gradient(90deg, rgba(255,241,241,0.75) 0%, rgba(255,255,255,0) 100%)',
  },
  roomImageWrap: {
    borderRadius: '14px',
    overflow: 'hidden',
    background: '#F3F4F6',
    minHeight: '156px',
  },
  roomImage: { width: '100%', height: '100%', minHeight: '156px', objectFit: 'cover', display: 'block' },
  roomBody: { minWidth: 0, display: 'grid', gap: '10px' },
  roomHeader: { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' },
  roomName: { margin: '0 0 6px', fontSize: '21px', fontWeight: 800, color: C.text, lineHeight: 1.3 },
  roomFactRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '8px' },
  roomFact: { fontSize: '13px', color: '#5F6B76', fontWeight: 700, lineHeight: 1.5 },
  roomFactDot: { fontSize: '12px', color: '#98A1AA', fontWeight: 700 },
  roomFactTag: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#166534',
    background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '999px',
    padding: '4px 8px',
  },
  roomDesc: { margin: 0, fontSize: '15px', color: '#66707C', lineHeight: 1.65, maxWidth: '640px' },
  roomPriceBox: { display: 'grid', gap: '4px', textAlign: 'right' },
  roomPriceLabel: { fontSize: '12px', color: '#66707C', fontWeight: 700 },
  roomPriceValue: { fontSize: '26px', fontWeight: 800, color: '#111827', lineHeight: 1.1 },
  roomTagRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', minHeight: '24px' },
  roomTag: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#166534',
    background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '999px',
    padding: '6px 10px',
  },
  roomStock: { fontSize: '13px', color: '#B45309', fontWeight: 700, marginLeft: '2px' },
  roomFooter: { display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', flexWrap: 'wrap' },
  roomMetaText: { fontSize: '14px', color: '#5F6B76', lineHeight: 1.55 },
  roomSelectBtn: {
    border: `1px solid ${C.border}`,
    background: '#fff',
    color: C.text,
    borderRadius: '999px',
    padding: '10px 15px',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  roomSelectBtnActive: {
    borderColor: '#E8484A',
    background: '#FFF1F1',
    color: '#C13A3D',
  },
  amenityList: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  amenityItem: {
    borderRadius: '999px',
    background: '#FFFCFA',
    border: '1px solid #EEE4DE',
    padding: '11px 15px',
    fontSize: '14px',
    color: '#3F3F46',
    fontWeight: 700,
    boxShadow: '0 6px 16px rgba(15,23,42,0.04)',
  },
  policyList: { display: 'grid', gap: '10px' },
  policyRow: { display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBottom: '10px', borderBottom: `1px solid ${C.borderLight}` },
  policyLabel: { fontSize: '14px', color: '#66707C', fontWeight: 700 },
  policyValue: { fontSize: '15px', color: C.text, fontWeight: 700, textAlign: 'right' },
  guideSectionList: { display: 'grid', gap: '16px', marginTop: '18px' },
  guideSection: { display: 'grid', gap: '10px' },
  guideSectionTitle: { margin: 0, fontSize: '17px', color: C.text, fontWeight: 800 },
  guideNotice: {
    borderRadius: '14px',
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#B45309',
    fontWeight: 700,
    lineHeight: 1.6,
  },
  guideBulletList: {
    margin: 0,
    paddingLeft: '18px',
    display: 'grid',
    gap: '8px',
  },
  guideBulletItem: {
    fontSize: '14px',
    color: '#66707C',
    lineHeight: 1.65,
  },
  reviewSectionHeader: { display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '16px' },
  reviewInner: { maxWidth: '1080px', margin: '0 auto' },
  reviewSectionDesc: { margin: 0, fontSize: '15px', color: '#66707C', lineHeight: 1.65 },
  reviewScoreInline: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    paddingTop: '4px',
  },
  reviewScoreValue: { fontSize: '24px', fontWeight: 800, color: '#B45309' },
  reviewScoreMeta: { fontSize: '14px', fontWeight: 700, color: '#66707C' },
  reviewSummaryInline: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    padding: '0 0 16px',
    marginBottom: '10px',
    borderBottom: `1px solid ${C.borderLight}`,
  },
  reviewSummaryStat: { display: 'inline-flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' },
  reviewSummaryLabel: { fontSize: '13px', color: '#66707C', fontWeight: 700 },
  reviewSummaryText: { fontSize: '19px', color: C.text, fontWeight: 800 },
  reviewSummaryDivider: { width: '1px', height: '14px', background: C.borderLight },
  reviewToneBox: {
    marginBottom: '16px',
    borderRadius: '14px',
    background: '#FFF8EE',
    border: '1px solid #FBD6A8',
    padding: '12px 14px',
    fontSize: '14px',
    color: '#9A5B13',
    fontWeight: 700,
  },
  reviewSortRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '14px 0 10px' },
  reviewSortBtn: {
    border: 'none',
    borderRadius: '999px',
    background: '#F5F5F5',
    color: '#5F6B76',
    fontSize: '14px',
    fontWeight: 700,
    padding: '8px 13px',
    cursor: 'pointer',
  },
  reviewSortBtnActive: {
    background: '#21242B',
    color: '#fff',
  },
  reviewSuccess: { margin: '12px 0 0', fontSize: '13px', color: '#15803D', fontWeight: 700 },
  reviewError: { margin: '12px 0 0', fontSize: '13px', color: '#B91C1C', fontWeight: 700 },
  reviewList: { display: 'grid', gap: 0, justifyItems: 'start' },
  reviewEmpty: {
    border: `1px dashed ${C.border}`,
    borderRadius: '18px',
    background: '#FAFAFA',
    padding: '28px 20px',
    textAlign: 'center',
  },
  reviewEmptyTitle: { margin: '0 0 8px', fontSize: '18px', color: C.text, fontWeight: 800 },
  reviewEmptyDesc: { margin: 0, fontSize: '15px', color: '#66707C', lineHeight: 1.65 },
  locationHeader: { maxWidth: '1240px', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' },
  mapBox: { borderRadius: '28px', overflow: 'hidden', border: `1px solid ${C.borderLight}`, boxShadow: '0 14px 32px rgba(15,23,42,0.08)', maxWidth: '1240px', margin: '0 auto' },
  mapCoord: { fontSize: '13px', color: '#66707C', margin: '14px auto 0', maxWidth: '1240px' },
  locationNoteList: { display: 'grid', gap: '8px', marginTop: '14px' },
  locationNoteListWide: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '18px', maxWidth: '1240px', marginLeft: 'auto', marginRight: 'auto' },
  locationNoteCard: { background: 'linear-gradient(145deg, #FFF9F4 0%, #FFFFFF 52%, #F8F5F2 100%)', borderRadius: '22px', padding: '18px 18px 20px', border: '1px solid #EEE4DE', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' },
  locationNoteEyebrow: { margin: '0 0 8px', fontSize: '11px', letterSpacing: '0.12em', color: C.primary, fontWeight: 800 },
  locationNoteTitle: { margin: '0 0 8px', fontSize: '18px', lineHeight: 1.3, color: C.text, fontWeight: 800 },
  locationNoteDesc: { margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#66707C' },
  inquiryBtn: {
    padding: '14px 28px',
    background: 'transparent',
    border: `1px solid ${C.border}`,
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: '700',
    color: C.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  sidebar: {
    width: '360px',
    flexShrink: 0,
    position: 'sticky',
    top: '120px',
    alignSelf: 'flex-start',
    maxHeight: 'calc(100vh - 136px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '6px',
    scrollbarGutter: 'stable',
  },
  bookingCard: {
    background: 'linear-gradient(145deg, #FFF8F3 0%, #FFFFFF 48%, #F7F4F1 100%)',
    border: '1px solid #EEE4DE',
    borderRadius: '28px',
    padding: '22px',
    boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
  },
  bookingCardTop: { display: 'grid', gap: '4px' },
  bookingPriceBox: {
    marginTop: '18px',
    padding: '18px',
    borderRadius: '22px',
    background: '#fff',
    border: '1px solid #EEE4DE',
  },
  bookingPriceLabel: { display: 'block', margin: '0 0 8px', fontSize: '12px', color: '#8A6F66', fontWeight: 800, letterSpacing: '0.04em' },
  bookingPriceValue: { display: 'block', fontSize: '30px', lineHeight: 1.1, color: C.text, fontWeight: 800 },
  bookingPriceHint: { margin: '8px 0 0', fontSize: '13px', lineHeight: 1.65, color: '#66707C' },
  bookingActionRow: { display: 'grid', gap: '10px', marginTop: '16px' },
  bookingPrimaryBtn: {
    border: 'none',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 800,
    padding: '14px 16px',
    cursor: 'pointer',
  },
  bookingSecondaryBtn: {
    border: `1px solid ${C.border}`,
    borderRadius: '999px',
    background: '#fff',
    color: C.text,
    fontSize: '14px',
    fontWeight: 700,
    padding: '12px 16px',
    cursor: 'pointer',
  },
  bookingPolicyBox: {
    marginTop: '18px',
    paddingTop: '18px',
    borderTop: '1px solid #E9DED8',
  },
  bookingPolicyTitle: { margin: '0 0 10px', fontSize: '15px', color: C.text, fontWeight: 800 },
  sideRoomName: { display: 'block', margin: '0 0 8px', fontSize: '17px', color: C.text, fontWeight: 800 },
  sideRoomDesc: { margin: '0 0 6px', fontSize: '14px', color: '#66707C', lineHeight: 1.65 },
  sideInfoHeader: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' },
  sideInfoTitle: { margin: 0, fontSize: '16px', color: C.text, fontWeight: 800 },
  sideInfoBadge: { fontSize: '11px', fontWeight: 800, color: '#B45309', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '999px', padding: '5px 8px', whiteSpace: 'nowrap' },
  sideInfoList: { margin: 0, paddingLeft: '18px', display: 'grid', gap: '8px', color: '#66707C', fontSize: '14px', lineHeight: 1.65 },
  sectionNavBar: {
    position: 'fixed',
    top: '72px',
    left: 0,
    right: 0,
    zIndex: 2000,
    padding: '0 34px',
    display: 'flex',
    justifyContent: 'center',
  },
  sectionNavInner: {
    width: 'fit-content',
    maxWidth: 'min(100%, 760px)',
    margin: 0,
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${C.borderLight}`,
    borderRadius: '999px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
    padding: '12px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNavLinks: { display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', justifyContent: 'center', minWidth: 0 },
  sectionNavBtn: {
    border: 'none',
    background: 'transparent',
    color: '#5F6B76',
    fontSize: '16px',
    fontWeight: 800,
    padding: '9px 14px',
    borderRadius: '999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.18s ease, color 0.18s ease',
  },
  sectionNavBtnActive: {
    background: '#FFF1F1',
    color: '#C13A3D',
  },
};
