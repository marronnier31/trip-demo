import RatingStars from './RatingStars';
import { C } from '../../styles/tokens';

export default function ReviewComposer({
  user,
  canWrite,
  reason,
  rating,
  content,
  selectedImages,
  onRatingChange,
  onContentChange,
  onImageChange,
  onLogin,
  onSubmit,
}) {
  if (!user) {
    return (
      <div style={s.noticeBox}>
        <p style={s.noticeTitle}>리뷰를 남기려면 로그인이 필요합니다.</p>
        <p style={s.noticeDesc}>예약 완료 후 숙소 리뷰를 작성할 수 있습니다.</p>
        <button type="button" style={s.noticeBtn} onClick={onLogin}>로그인하고 리뷰 쓰기</button>
      </div>
    );
  }

  if (!canWrite) {
    return (
      <div style={s.noticeBox}>
        <p style={s.noticeTitle}>투숙 완료 후 리뷰를 작성할 수 있습니다.</p>
        <p style={s.noticeDesc}>
          {reason === 'COMPLETED_BOOKING_REQUIRED'
            ? '완료된 예약이 확인되면 별점과 사진 리뷰를 남길 수 있습니다.'
            : reason === 'ALREADY_REVIEWED'
              ? '이미 이 숙소에 리뷰를 작성했습니다. 기존 리뷰를 확인해 주세요.'
            : '현재는 리뷰를 작성할 수 없는 상태입니다.'}
        </p>
      </div>
    );
  }

  return (
    <form style={s.form} onSubmit={onSubmit}>
      <div style={s.header}>
        <div>
          <h3 style={s.title}>리뷰 작성</h3>
          <p style={s.sub}>별점과 사진으로 숙소 경험을 남겨주세요.</p>
        </div>
        <div style={s.scoreBox}>
          <RatingStars value={rating} size={22} interactive onChange={onRatingChange} />
          <span style={s.scoreLabel}>{rating}점</span>
        </div>
      </div>

      <textarea
        style={s.textarea}
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="객실 상태, 위치, 체크인 경험 등 실제 후기를 남겨주세요."
        rows={5}
      />

      <div style={s.uploadRow}>
        <label style={s.fileLabel}>
          사진 추가
          <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={onImageChange} />
        </label>
        <span style={s.fileHint}>최대 5장</span>
      </div>

      {selectedImages.length ? (
        <div style={s.previewGrid}>
          {selectedImages.map((image) => (
            <div key={image.id} style={s.previewCard}>
              <img src={image.url} alt={image.name} style={s.previewImage} />
              <p style={s.previewName}>{image.name}</p>
            </div>
          ))}
        </div>
      ) : null}

      <button type="submit" style={s.submitBtn}>리뷰 등록</button>
    </form>
  );
}

const s = {
  noticeBox: {
    borderTop: `1px solid ${C.borderLight}`,
    borderBottom: `1px solid ${C.borderLight}`,
    padding: '20px 0',
    background: 'transparent',
  },
  noticeTitle: { margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: C.text },
  noticeDesc: { margin: 0, fontSize: '14px', color: C.textSub, lineHeight: 1.6 },
  noticeBtn: {
    marginTop: '16px',
    border: 'none',
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${C.primary} 0%, #E31C5F 100%)`,
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
    padding: '12px 16px',
    cursor: 'pointer',
  },
  form: {
    borderTop: `1px solid ${C.borderLight}`,
    borderBottom: `1px solid ${C.borderLight}`,
    padding: '22px 0',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  header: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' },
  title: { margin: 0, fontSize: '20px', fontWeight: 800, color: C.text },
  sub: { margin: '6px 0 0', fontSize: '13px', color: C.textSub },
  scoreBox: { display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' },
  scoreLabel: { fontSize: '14px', color: C.text, fontWeight: 800 },
  textarea: {
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '14px',
    color: C.text,
    resize: 'vertical',
    outline: 'none',
    lineHeight: 1.6,
    background: '#FCFCFC',
  },
  uploadRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    background: '#fff',
    color: C.text,
    fontSize: '13px',
    fontWeight: 700,
    padding: '10px 14px',
    cursor: 'pointer',
  },
  fileHint: { fontSize: '12px', color: C.textSub, fontWeight: 600 },
  previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' },
  previewCard: { borderRadius: '12px', border: `1px solid ${C.borderLight}`, background: '#FAFAFA', overflow: 'hidden' },
  previewImage: { width: '100%', height: '96px', objectFit: 'cover', display: 'block' },
  previewName: { margin: 0, padding: '8px 10px', fontSize: '11px', color: C.textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  submitBtn: {
    alignSelf: 'flex-end',
    border: 'none',
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${C.primary} 0%, #E31C5F 100%)`,
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
    padding: '12px 20px',
    cursor: 'pointer',
  },
};
