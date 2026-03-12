import RatingStars from './RatingStars';
import { C } from '../../styles/tokens';

export default function ReviewCard({ review, onDelete }) {
  return (
    <article style={s.item}>
      <div style={s.header}>
        <div>
          <p style={s.author}>{review.authorName}</p>
          <div style={s.ratingRow}>
            <RatingStars value={review.rating} size={15} />
            <span style={s.date}>{review.createdAt}</span>
          </div>
        </div>
        <div style={s.headerActions}>
          {review.imageUrls?.length ? <span style={s.photoHint}>사진 포함 리뷰</span> : null}
          {review.canDelete && onDelete ? (
            <button type="button" style={s.deleteBtn} onClick={() => onDelete(review.reviewId)}>
              삭제
            </button>
          ) : null}
        </div>
      </div>
      <p style={s.content}>{review.content}</p>
      {review.imageUrls?.length ? (
        <div style={s.mediaRow}>
          {review.imageUrls.map((url, index) => (
            <div key={`${review.reviewId}-${index}`} style={s.thumbWrap}>
              <img src={url} alt="" style={s.image} />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

const s = {
  item: {
    padding: '18px 0 20px',
    borderBottom: `1px solid ${C.borderLight}`,
    maxWidth: '1040px',
    width: '100%',
  },
  header: { display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', marginBottom: '10px' },
  headerActions: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' },
  author: { margin: '0 0 6px', fontSize: '14px', color: C.text, fontWeight: 800 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  date: { fontSize: '12px', color: C.textSub, fontWeight: 600 },
  photoHint: { fontSize: '12px', color: C.textSub, fontWeight: 700, whiteSpace: 'nowrap' },
  deleteBtn: {
    border: 'none',
    borderRadius: '999px',
    background: 'transparent',
    color: '#D54B4D',
    fontSize: '12px',
    fontWeight: 800,
    padding: '4px 0',
    cursor: 'pointer',
  },
  content: { margin: 0, fontSize: '15px', color: '#374151', lineHeight: 1.8, maxWidth: '940px' },
  mediaRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' },
  thumbWrap: {
    width: '164px',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#F3F4F6',
  },
  image: { width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', background: '#F3F4F6' },
};
