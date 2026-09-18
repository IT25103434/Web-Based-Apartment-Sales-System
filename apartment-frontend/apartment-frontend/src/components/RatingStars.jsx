export default function RatingStars({ rating = 0, size = 'text-sm' }) {
  const rounded = Math.round(rating)
  return (
    <span className={`${size} text-gold-500`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>{i <= rounded ? '★' : '☆'}</span>
      ))}
    </span>
  )
}
