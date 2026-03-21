import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getLodging } from '../../api/lodging';
import { createBooking } from '../../api/booking';
import { benefitSnapshot, couponItems, gradeGuide } from '../../mock/benefitsData';
import { C, MAX_WIDTH } from '../../styles/tokens';

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const [inY, inM, inD] = String(checkIn).split('-').map(Number);
  const [outY, outM, outD] = String(checkOut).split('-').map(Number);
  if (!inY || !inM || !inD || !outY || !outM || !outD) return 0;
  const inUtc = Date.UTC(inY, inM - 1, inD);
  const outUtc = Date.UTC(outY, outM - 1, outD);
  return Math.max(0, Math.floor((outUtc - inUtc) / 86400000));
}

function maskCardNumber(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export default function BookingPage() {
  const { lodgingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state: navState } = useLocation();

  const [lodging, setLodging] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [checkIn, setCheckIn] = useState(navState?.checkIn || '');
  const [checkOut, setCheckOut] = useState(navState?.checkOut || '');
  const [guests, setGuests] = useState(navState?.guests || 2);
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [specialRequest, setSpecialRequest] = useState('');
  const [formError, setFormError] = useState('');
  const [selectedCouponNo, setSelectedCouponNo] = useState('');
  const [useMileage, setUseMileage] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardCompany, setCardCompany] = useState('신한카드');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardInstallment, setCardInstallment] = useState('일시불');
  const [bankName, setBankName] = useState('국민은행');
  const [depositorName, setDepositorName] = useState(user?.name || '');
  const [cashReceiptPhone, setCashReceiptPhone] = useState('');
  const [agreeCancelPolicy, setAgreeCancelPolicy] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeThirdParty, setAgreeThirdParty] = useState(false);
  const formRef = useRef(null);
  const summaryWrapRef = useRef(null);
  const summaryCardRef = useRef(null);
  const [summaryFloating, setSummaryFloating] = useState({
    enabled: false,
    active: false,
    stopped: false,
    left: 0,
    width: 360,
    height: 0,
    originTop: 0,
    stopTop: 0,
  });

  useEffect(() => {
    setIsLoading(true);
    setLoadError('');
    getLodging(lodgingId)
      .then((res) => {
        setLodging(res.data);
      })
      .catch(() => {
        setLodging(null);
        setLoadError('숙소 정보를 불러오지 못했습니다. 다시 시도해 주세요.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [lodgingId]);

  const nights = calcNights(checkIn, checkOut);
  const basePrice = nights * (lodging?.pricePerNight || 0);
  const selectedCoupon = couponItems.find((item) => String(item.couponNo) === String(selectedCouponNo) && item.status === 'ISSUED');
  const couponDiscount = !selectedCoupon || basePrice < selectedCoupon.minOrderAmount
    ? 0
    : selectedCoupon.discountType === 'PERCENT'
      ? Math.min(Math.floor(basePrice * (selectedCoupon.discountValue / 100)), selectedCoupon.maxDiscountAmount || Number.MAX_SAFE_INTEGER)
      : selectedCoupon.discountValue;
  const mileageCap = Math.max(0, basePrice - couponDiscount);
  const appliedMileage = Math.max(0, Math.min(Number(useMileage || 0), benefitSnapshot.mileageBalance, mileageCap));
  const totalPrice = Math.max(0, basePrice - couponDiscount - appliedMileage);
  const expectedMileage = Math.floor(totalPrice * ((gradeGuide.find((item) => item.name === benefitSnapshot.currentGrade)?.mileageRate || 0) / 100));
  const agreementsAccepted = agreeCancelPolicy && agreePrivacy && agreeThirdParty;
  const isCardPaymentValid = cardNumber.replace(/\s/g, '').length >= 14 && cardHolder.trim() && cardExpiry.trim();
  const isBankPaymentValid = bankName.trim() && depositorName.trim() && cashReceiptPhone.trim();
  const paymentInfoValid = paymentMethod === 'CARD' ? isCardPaymentValid : isBankPaymentValid;

  useEffect(() => {
    const syncSummaryFloating = () => {
      const formEl = formRef.current;
      const wrapEl = summaryWrapRef.current;
      const cardEl = summaryCardRef.current;
      if (!formEl || !wrapEl || !cardEl) return;

      const shouldFloat = window.innerWidth > 1024;
      const wrapBox = wrapEl.getBoundingClientRect();
      const formBox = formEl.getBoundingClientRect();
      const originTop = window.scrollY + wrapBox.top;
      const active = shouldFloat && window.scrollY + 92 >= originTop;
      const formBottom = window.scrollY + formBox.bottom;
      const stopTop = Math.max(0, formBottom - originTop - cardEl.offsetHeight);
      const stopped = active && window.scrollY + 92 + cardEl.offsetHeight >= formBottom;
      setSummaryFloating({
        enabled: shouldFloat,
        active,
        stopped,
        left: wrapBox.left,
        width: wrapBox.width,
        height: cardEl.offsetHeight,
        originTop,
        stopTop,
      });
    };

    syncSummaryFloating();
    window.addEventListener('resize', syncSummaryFloating);
    window.addEventListener('scroll', syncSummaryFloating, { passive: true });
    return () => {
      window.removeEventListener('resize', syncSummaryFloating);
      window.removeEventListener('scroll', syncSummaryFloating);
    };
  }, [lodging, checkIn, checkOut, guests, guestPhone, paymentMethod, cardCompany, cardInstallment, bankName, depositorName, couponDiscount, appliedMileage, totalPrice, expectedMileage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      setFormError('체크인/체크아웃 날짜를 선택해 주세요.');
      return;
    }
    if (nights <= 0) {
      setFormError('체크아웃은 체크인보다 이후 날짜여야 합니다.');
      return;
    }
    if (!guestName.trim()) {
      setFormError('예약자 이름을 입력해 주세요.');
      return;
    }
    if (!guestPhone.trim()) {
      setFormError('예약자 연락처를 입력해 주세요.');
      return;
    }
    if (!guestEmail.trim()) {
      setFormError('이메일을 입력해 주세요.');
      return;
    }
    if (!paymentInfoValid) {
      setFormError(paymentMethod === 'CARD' ? '카드 결제 정보를 입력해 주세요.' : '무통장입금 정보를 입력해 주세요.');
      return;
    }
    if (!agreementsAccepted) {
      setFormError('취소 규정과 개인정보 제공 동의에 모두 체크해 주세요.');
      return;
    }

    setFormError('');

    // TODO(back-end):
    // - 결제 승인 API가 붙으면 paymentMethod, card/bank payload를 서버로 전달하고 승인 결과를 받은 뒤 예약 생성으로 이어간다.
    // - 현재는 예약 계약을 유지하기 위해 결제 정보는 프론트 상태와 완료 페이지 표시용으로만 사용한다.
    await createBooking({
      lodgingId: Number(lodgingId),
      lodgingName: lodging.name,
      thumbnailUrl: lodging.thumbnailUrl,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      appliedCouponNo: selectedCoupon?.couponNo || null,
      usedMileage: appliedMileage,
      bookingStatus: 'CONFIRMED',
      userId: user?.userId || 1,
    });

    navigate('/booking/complete', {
      state: {
        lodgingName: lodging.name,
        checkIn,
        checkOut,
        guests,
        totalPrice,
        couponName: selectedCoupon?.couponName || '',
        usedMileage: appliedMileage,
        couponDiscount,
        expectedMileage,
        paymentMethod,
      },
    });
  };

  if (isLoading) {
    return <div style={{ padding: '80px', textAlign: 'center', color: C.textSub }}>로딩 중...</div>;
  }

  if (loadError) {
    return (
      <div style={s.wrap}>
        <div style={s.errorCard}>
          <h1 style={s.errorTitle}>예약 정보를 불러오지 못했습니다.</h1>
          <p style={s.errorText}>{loadError}</p>
          <div style={s.errorActions}>
            <Link to="/lodgings" style={s.ghostBtn}>숙소 목록 보기</Link>
            <button type="button" style={s.primaryPillBtn} onClick={() => navigate(`/booking/${lodgingId}`, { replace: true })}>
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrap} className="tz-booking-wrap">
      <style>{`
        @media (max-width: 1024px) {
          .tz-booking-layout {
            grid-template-columns: 1fr !important;
          }
          .tz-booking-summary {
            max-width: none !important;
          }
        }
        @media (max-width: 720px) {
          .tz-booking-wrap {
            padding: 24px 16px 48px !important;
          }
          .tz-booking-hero {
            grid-template-columns: 1fr !important;
          }
          .tz-booking-double {
            grid-template-columns: 1fr !important;
          }
          .tz-booking-methods {
            grid-template-columns: 1fr !important;
          }
          .tz-booking-summary-card {
            position: static !important;
            top: auto !important;
          }
        }
      `}</style>

      <Link to={`/lodgings/${lodgingId}`} style={s.back}>← 숙소로 돌아가기</Link>

      <section style={s.hero}>
        <div style={s.heroMainWide}>
          <div style={s.stepBar}>
            <div style={{ ...s.stepItem, ...s.stepItemActive }}>1. 숙소 확인</div>
            <div style={s.stepDivider} />
            <div style={{ ...s.stepItem, ...s.stepItemActive }}>2. 예약 정보 입력</div>
            <div style={s.stepDivider} />
            <div style={s.stepItem}>3. 예약 완료</div>
          </div>
          <p style={s.eyebrow}>BOOKING CHECKOUT</p>
          <h1 style={s.title}>예약 정보를 확인하고
            <br />
            결제 준비를 진행하세요.
          </h1>
          <p style={s.desc}>예약 정보를 확인하고 결제 수단과 혜택을 한 번에 입력할 수 있도록 정리했습니다.</p>
        </div>
      </section>

      <div style={s.layout} className="tz-booking-layout">
        <form ref={formRef} onSubmit={handleSubmit} style={s.form}>
          <section style={s.sectionCard}>
            <div style={s.sectionHead}>
              <div>
                <p style={s.sectionEyebrow}>RESERVATION INFO</p>
                <h2 style={s.sectionTitle}>예약자 정보</h2>
              </div>
            </div>
            <div style={s.fieldGrid} className="tz-booking-double">
              <div>
                <label style={s.label}>이름</label>
                <input style={s.input} value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="예약자 이름" required />
              </div>
              <div>
                <label style={s.label}>연락처</label>
                <input style={s.input} value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="010-0000-0000" required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={s.label}>이메일</label>
                <input style={s.input} value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="name@example.com" required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={s.label}>요청 사항</label>
                <textarea
                  style={s.textarea}
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="늦은 체크인, 침대 타입 등 숙소에 전달할 요청 사항이 있으면 적어주세요."
                />
              </div>
            </div>
            <p style={s.inlineGuide}>예약 관련 안내와 변경 연락은 입력한 연락처와 이메일 기준으로 전달됩니다.</p>
          </section>

          <section style={s.sectionCard}>
            <div style={s.sectionHead}>
              <div>
                <p style={s.sectionEyebrow}>PAYMENT</p>
                <h2 style={s.sectionTitle}>결제 정보 입력</h2>
              </div>
            </div>
            <div style={s.methodGrid} className="tz-booking-methods">
              <button type="button" onClick={() => setPaymentMethod('CARD')} style={{ ...s.methodCard, ...(paymentMethod === 'CARD' ? s.methodCardActive : null) }}>
                <span style={s.methodTitle}>카드 결제</span>
                <span style={s.methodDesc}>국내 주요 카드로 결제할 수 있습니다.</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('BANK')} style={{ ...s.methodCard, ...(paymentMethod === 'BANK' ? s.methodCardActive : null) }}>
                <span style={s.methodTitle}>무통장입금</span>
                <span style={s.methodDesc}>입금 후 확인 절차를 거쳐 예약이 완료됩니다.</span>
              </button>
            </div>

            {paymentMethod === 'CARD' ? (
              <div style={{ ...s.fieldGrid, gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }} className="tz-booking-double">
                <div>
                  <label style={s.label}>카드사</label>
                  <select style={s.select} value={cardCompany} onChange={(e) => setCardCompany(e.target.value)}>
                    <option>신한카드</option>
                    <option>국민카드</option>
                    <option>현대카드</option>
                    <option>삼성카드</option>
                    <option>롯데카드</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>할부</label>
                  <select style={s.select} value={cardInstallment} onChange={(e) => setCardInstallment(e.target.value)}>
                    <option>일시불</option>
                    <option>2개월</option>
                    <option>3개월</option>
                    <option>6개월</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={s.label}>카드 번호</label>
                  <input style={s.input} value={cardNumber} onChange={(e) => setCardNumber(maskCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" />
                </div>
                <div>
                  <label style={s.label}>카드 소유자</label>
                  <input style={s.input} value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="홍길동" />
                </div>
                <div>
                  <label style={s.label}>유효기간</label>
                  <input style={s.input} value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" />
                </div>
              </div>
            ) : (
              <div style={s.fieldGrid} className="tz-booking-double">
                <div>
                  <label style={s.label}>입금 은행</label>
                  <select style={s.select} value={bankName} onChange={(e) => setBankName(e.target.value)}>
                    <option>국민은행</option>
                    <option>신한은행</option>
                    <option>하나은행</option>
                    <option>카카오뱅크</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>입금자명</label>
                  <input style={s.input} value={depositorName} onChange={(e) => setDepositorName(e.target.value)} placeholder="홍길동" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={s.label}>현금영수증 연락처</label>
                  <input style={s.input} value={cashReceiptPhone} onChange={(e) => setCashReceiptPhone(e.target.value)} placeholder="010-0000-0000" />
                </div>
              </div>
            )}

            <div style={s.paymentDivider} />

            <div style={s.sectionHeadCompact}>
              <div>
                <p style={s.sectionEyebrow}>BENEFITS</p>
                <h3 style={s.sectionSubTitle}>쿠폰 · 포인트 적용</h3>
              </div>
            </div>
            <div style={s.noticeBox}>사용 가능한 쿠폰과 포인트를 적용해 최종 결제 금액을 바로 확인할 수 있습니다.</div>
            <div style={{ ...s.fieldGrid, gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }} className="tz-booking-double">
              <div>
                <label style={s.label}>쿠폰 선택</label>
                <select style={s.select} value={selectedCouponNo} onChange={(e) => setSelectedCouponNo(e.target.value)}>
                  <option value="">적용 안 함</option>
                  {couponItems.filter((item) => item.status === 'ISSUED').map((item) => (
                    <option key={item.couponNo} value={item.couponNo}>{item.couponName} · {item.discountLabel}</option>
                  ))}
                </select>
                {selectedCoupon && basePrice < selectedCoupon.minOrderAmount ? (
                  <p style={s.errorHint}>이 쿠폰은 {selectedCoupon.minOrderAmount.toLocaleString()}원 이상에서 사용 가능합니다.</p>
                ) : null}
                {selectedCoupon && basePrice >= selectedCoupon.minOrderAmount ? (
                  <p style={s.successHint}>쿠폰 할인 {couponDiscount.toLocaleString()}원 적용 예정</p>
                ) : null}
              </div>
              <div>
                <label style={s.label}>포인트 사용</label>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  max={benefitSnapshot.mileageBalance}
                  step="100"
                  value={useMileage}
                  onChange={(e) => setUseMileage(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                />
                <div style={s.inlineRow}>
                  <span>보유 포인트 {benefitSnapshot.mileageBalance.toLocaleString()}P</span>
                  <button type="button" style={s.textButton} onClick={() => setUseMileage(Math.min(benefitSnapshot.mileageBalance, mileageCap))}>전액 사용</button>
                </div>
                <p style={s.successHint}>이번 예약 적립 예정 {expectedMileage.toLocaleString()}P</p>
              </div>
            </div>

            <p style={s.paymentHint}>선택한 결제 수단과 혜택 적용 내역은 오른쪽 결제 요약에서 바로 확인할 수 있습니다.</p>
          </section>

          <section style={s.sectionCard}>
            <div style={s.sectionHead}>
              <div>
                <p style={s.sectionEyebrow}>POLICY</p>
                <h2 style={s.sectionTitle}>취소 규정 및 동의</h2>
              </div>
            </div>
            <div style={s.policyCard}>
              <div style={s.policyRow}>
                <span>체크인 3일 전까지</span>
                <strong>전액 환불</strong>
              </div>
              <div style={s.policyRow}>
                <span>체크인 2일 전 ~ 1일 전</span>
                <strong>50% 환불</strong>
              </div>
              <div style={s.policyRow}>
                <span>체크인 당일 및 노쇼</span>
                <strong>환불 불가</strong>
              </div>
            </div>

            <div style={s.agreementList}>
              <label style={s.checkRow}>
                <input type="checkbox" checked={agreeCancelPolicy} onChange={(e) => setAgreeCancelPolicy(e.target.checked)} />
                <span>취소 및 환불 규정을 확인했습니다.</span>
              </label>
              <label style={s.checkRow}>
                <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
                <span>개인정보 수집 및 이용에 동의합니다.</span>
              </label>
              <label style={s.checkRow}>
                <input type="checkbox" checked={agreeThirdParty} onChange={(e) => setAgreeThirdParty(e.target.checked)} />
                <span>숙소 제공자에게 예약 정보 제공에 동의합니다.</span>
              </label>
            </div>
          </section>

          <div style={s.submitPanel}>
            <p style={s.submitHint}>오른쪽 결제 요약을 확인한 뒤 예약을 확정해 주세요.</p>
            <button type="submit" style={s.submitBtn}>예약 확정</button>
            {formError ? <p style={s.formError}>{formError}</p> : null}
          </div>
        </form>

        <div
          ref={summaryWrapRef}
          style={{
            ...s.summary,
            position: 'relative',
            ...(summaryFloating.enabled ? { minHeight: `${summaryFloating.height}px` } : null),
          }}
          className="tz-booking-summary"
        >
          <div
            ref={summaryCardRef}
            style={{
              ...s.summaryCard,
              ...(summaryFloating.enabled && summaryFloating.active && !summaryFloating.stopped
                ? {
                    position: 'fixed',
                    top: '92px',
                    left: `${summaryFloating.left}px`,
                    width: `${summaryFloating.width}px`,
                    maxHeight: 'calc(100vh - 116px)',
                    overflowY: 'auto',
                  }
                : null),
              ...(summaryFloating.enabled && summaryFloating.stopped
                ? {
                    position: 'absolute',
                    top: `${summaryFloating.stopTop}px`,
                    left: 0,
                    width: '100%',
                  }
                : null),
            }}
            className="tz-booking-summary-card"
          >
            {lodging.thumbnailUrl ? <img src={lodging.thumbnailUrl} alt={lodging.name} style={s.summaryImg} /> : null}
            <p style={s.summaryRegion}>{lodging.region}</p>
            <p style={s.summaryName}>{lodging.name}</p>

            <div style={s.summaryRows}>
              <div style={s.summaryRow}><span>일정</span><strong>{checkIn && checkOut ? `${checkIn} ~ ${checkOut}` : '선택된 일정 없음'}</strong></div>
              <div style={s.summaryRow}><span>투숙 인원</span><strong>{Number(guests) || 0}명</strong></div>
              <div style={s.summaryRowMuted}><span>총 숙박</span><strong>{nights > 0 ? `${nights}박` : '미정'}</strong></div>
              <div style={s.summaryRow}><span>숙박 요금</span><strong>{(lodging.pricePerNight || 0).toLocaleString()}원 × {nights || 0}박</strong></div>
              <div style={s.summaryRow}><span>기본 금액</span><strong>{basePrice.toLocaleString()}원</strong></div>
              <div style={s.summaryRowMuted}><span>쿠폰 할인</span><strong>-{couponDiscount.toLocaleString()}원</strong></div>
              <div style={s.summaryRowMuted}><span>포인트 사용</span><strong>-{appliedMileage.toLocaleString()}원</strong></div>
            </div>

            <div style={s.paymentSummaryCard}>
              <p style={s.paymentSummaryLabel}>결제 정보</p>
              <div style={s.paymentSummaryRow}>
                <span>수단</span>
                <strong>{paymentMethod === 'CARD' ? '카드 결제' : '무통장입금'}</strong>
              </div>
              <div style={s.paymentSummaryRow}>
                <span>상세</span>
                <strong>{paymentMethod === 'CARD' ? `${cardCompany} ${cardInstallment}` : `${bankName} / ${depositorName || '입금자명 미입력'}`}</strong>
              </div>
              <div style={s.paymentSummaryRow}>
                <span>연락 수단</span>
                <strong>{guestPhone || '연락처 미입력'}</strong>
              </div>
              <div style={s.paymentSummaryRow}>
                <span>취소 규정</span>
                <strong>최대 전액 환불 가능</strong>
              </div>
            </div>

            <div style={s.totalCard}>
              <div style={s.totalRow}>
                <span>총 결제 예정 금액</span>
                <strong>{totalPrice.toLocaleString()}원</strong>
              </div>
              <p style={s.summaryHint}>예약 완료 시 {expectedMileage.toLocaleString()}P 적립 예정</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: { maxWidth: MAX_WIDTH, margin: '0 auto', padding: '32px 24px 64px' },
  back: { fontSize: '14px', color: C.textSub, textDecoration: 'none', display: 'inline-block', marginBottom: '18px' },
  hero: { marginBottom: '28px' },
  heroMainWide: {
    padding: '30px 34px',
    borderRadius: '30px',
    background: 'linear-gradient(135deg, #FFF7F1 0%, #FFFFFF 52%, #F7F7FF 100%)',
    border: '1px solid #EEE3DD',
    boxShadow: '0 18px 42px rgba(15,23,42,0.06)',
  },
  stepBar: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' },
  stepItem: { borderRadius: '999px', background: '#F3F4F6', color: '#6B7280', fontSize: '13px', fontWeight: '800', padding: '8px 12px' },
  stepItemActive: { background: '#FFF1F1', color: C.primary },
  stepDivider: { width: '18px', height: '1px', background: C.border },
  eyebrow: { margin: '0 0 12px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.14em', color: C.primary },
  title: { margin: '0 0 12px', fontSize: 'clamp(32px, 4.8vw, 50px)', lineHeight: 1.06, color: C.text, fontWeight: '800' },
  desc: { margin: 0, maxWidth: '700px', fontSize: '16px', lineHeight: 1.85, color: C.textSub },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 360px)', gap: '24px', alignItems: 'start' },
  form: { minWidth: 0, display: 'grid', gap: '18px' },
  sectionCard: {
    padding: '26px',
    borderRadius: '28px',
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid #EEE4DE',
    boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
  },
  sectionHead: { marginBottom: '18px' },
  sectionHeadCompact: { marginTop: '8px', marginBottom: '16px' },
  sectionEyebrow: { margin: '0 0 8px', fontSize: '12px', color: C.primary, fontWeight: '800', letterSpacing: '0.1em' },
  sectionTitle: { margin: 0, fontSize: '24px', color: C.text, fontWeight: '800' },
  sectionSubTitle: { margin: 0, fontSize: '20px', color: C.text, fontWeight: '800' },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '700', color: C.text, marginBottom: '7px' },
  input: { width: '100%', minHeight: '52px', padding: '13px 14px', border: '1px solid #E7DDD6', borderRadius: '14px', fontSize: '15px', color: C.text, boxSizing: 'border-box', outline: 'none', background: '#fff' },
  select: {
    width: '100%',
    minHeight: '52px',
    padding: '13px 42px 13px 14px',
    border: '1px solid #E7DDD6',
    borderRadius: '14px',
    fontSize: '15px',
    color: C.text,
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fff',
    backgroundImage: 'linear-gradient(45deg, transparent 50%, #8A6B64 50%), linear-gradient(135deg, #8A6B64 50%, transparent 50%)',
    backgroundPosition: 'calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px)',
    backgroundSize: '6px 6px, 6px 6px',
    backgroundRepeat: 'no-repeat',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  },
  textarea: { width: '100%', minHeight: '104px', padding: '13px 14px', border: '1px solid #E7DDD6', borderRadius: '14px', fontSize: '15px', color: C.text, boxSizing: 'border-box', outline: 'none', background: '#fff', resize: 'vertical', fontFamily: 'inherit' },
  inlineGuide: { margin: '12px 0 0', fontSize: '13px', color: C.textSub, lineHeight: 1.7 },
  noticeBox: { marginBottom: '16px', borderRadius: '14px', background: '#FFF6EF', border: '1px solid #F5D9C8', padding: '12px 14px', fontSize: '13px', lineHeight: 1.7, color: '#9A3412', fontWeight: '700' },
  errorHint: { margin: '8px 0 0', fontSize: '12px', color: '#B91C1C', fontWeight: '700' },
  successHint: { margin: '8px 0 0', fontSize: '12px', color: '#4B5563', fontWeight: '700' },
  inlineRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px', color: C.textSub },
  textButton: { border: 'none', background: 'none', color: C.primary, fontSize: '12px', fontWeight: '800', cursor: 'pointer', padding: 0 },
  methodGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  methodCard: { border: '1px solid #E7DDD6', background: '#FFFCFB', borderRadius: '18px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', cursor: 'pointer' },
  methodCardActive: { borderColor: '#F1B3B3', background: '#FFF4F4', boxShadow: '0 0 0 1px rgba(240,90,92,0.12)' },
  methodTitle: { fontSize: '16px', color: C.text, fontWeight: '800' },
  methodDesc: { fontSize: '13px', color: C.textSub, lineHeight: 1.6 },
  paymentDivider: { height: '1px', background: '#F0E6E0', margin: '18px 0 20px' },
  paymentHint: { margin: '14px 0 0', fontSize: '13px', color: C.textSub, lineHeight: 1.7 },
  policyCard: { borderRadius: '18px', border: '1px solid #EDE2DB', background: '#FFFCFB', overflow: 'hidden' },
  policyRow: { display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '14px 16px', borderBottom: '1px solid #F1E7E0', fontSize: '14px', color: C.text },
  agreementList: { display: 'grid', gap: '10px', marginTop: '16px' },
  checkRow: { display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: C.text },
  submitPanel: { display: 'grid', gap: '12px' },
  submitHint: { margin: 0, fontSize: '13px', color: C.textSub, lineHeight: 1.7 },
  submitBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 12px 24px rgba(232,72,74,0.22)' },
  formError: { margin: 0, fontSize: '13px', color: '#DC2626', fontWeight: '700' },
  summary: { width: '100%', maxWidth: '360px', alignSelf: 'start' },
  summaryCard: { border: '1px solid #EEE4DE', borderRadius: '26px', padding: '20px', background: 'rgba(255,255,255,0.96)', boxShadow: '0 18px 40px rgba(15,23,42,0.06)' },
  summaryImg: { width: '100%', height: '156px', objectFit: 'cover', borderRadius: '18px', display: 'block', marginBottom: '12px' },
  summaryRegion: { fontSize: '12px', color: C.textSub, margin: '0 0 4px', fontWeight: '700' },
  summaryName: { fontSize: '20px', fontWeight: '800', color: C.text, margin: 0 },
  summaryRows: { display: 'grid', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #F1E7E0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px', color: C.text },
  summaryRowMuted: { display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', color: C.textSub },
  paymentSummaryCard: { marginTop: '14px', padding: '12px 13px', borderRadius: '18px', background: '#FFF6EF', border: '1px solid #F3DDD0' },
  paymentSummaryLabel: { margin: '0 0 8px', fontSize: '12px', color: '#9A3412', fontWeight: '800', letterSpacing: '0.08em' },
  paymentSummaryRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', color: C.text, marginTop: '6px' },
  totalCard: { marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #F1E7E0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '16px', color: C.text, fontWeight: '800' },
  summaryHint: { margin: '8px 0 0', fontSize: '12px', color: '#4B5563', fontWeight: '700', lineHeight: 1.45 },
  errorCard: { maxWidth: '720px', margin: '80px auto', padding: '32px', borderRadius: '24px', background: '#fff', border: '1px solid #EEE4DE', boxShadow: '0 18px 40px rgba(15,23,42,0.06)', textAlign: 'center' },
  errorTitle: { margin: '0 0 12px', fontSize: '28px', fontWeight: '800', color: C.text },
  errorText: { margin: '0 0 20px', fontSize: '15px', lineHeight: 1.7, color: C.textSub },
  errorActions: { display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' },
  ghostBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 18px', borderRadius: '999px', textDecoration: 'none', border: `1px solid ${C.border}`, background: '#fff', color: C.text, fontWeight: '700' },
  primaryPillBtn: { border: 'none', borderRadius: '999px', background: 'linear-gradient(135deg, #F05A5C 0%, #E8484A 100%)', color: '#fff', padding: '12px 18px', fontWeight: '800', cursor: 'pointer' },
};
