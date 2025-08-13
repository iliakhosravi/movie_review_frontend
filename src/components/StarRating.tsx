// src/components/StarRating.tsx
import { useState } from 'react'
import Icon from './Icon'

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  max?: number
  readOnly?: boolean
  className?: string
  size?: number
}

const StarRating = ({
  value,
  onChange,
  max = 10,
  readOnly = false,
  className = '',
  size = 20,
}: StarRatingProps) => {
  const [hover, setHover] = useState<number | null>(null)
  const active = hover ?? value

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const filled = n <= active
        return (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n}`}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => !readOnly && onChange?.(n)}
            disabled={readOnly}
            className={`transition-transform ${!readOnly ? 'hover:scale-110' : ''} disabled:cursor-default`}
            style={{ lineHeight: 0 }}
          >
            <Icon
              name="StarIcon"
              size={size}
              className={filled ? 'text-yellow-400' : 'text-gray-300'}
            />
          </button>
        )
      })}
      {!readOnly && (
        <span className="ml-2 text-sm text-gray-600">{(hover ?? value) || 0}/{max}</span>
      )}
    </div>
  )
}

export default StarRating
