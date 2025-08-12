import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

interface LateInputProps {
  value: string
  onChange: (v: string) => void
  onDebouncedChange: (v: string) => void
  debounce?: number
}

const LateInput = ({
  value,
  onChange,
  onDebouncedChange,
  debounce = 500,
}: LateInputProps) => {
  const [progress, setProgress] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastValueRef = useRef<string>(value)

  useEffect(() => {
    if (lastValueRef.current === value) return
    lastValueRef.current = value

    if (timerRef.current) clearTimeout(timerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
    
    setProgress(0)
    let start = Date.now()
    
    progressRef.current = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - start) / debounce) * 100))
    }, 30)

    timerRef.current = setTimeout(() => {
      setProgress(100)
      onDebouncedChange(value)
      if (progressRef.current) clearInterval(progressRef.current)
    }, debounce)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [value, debounce, onDebouncedChange])

  return (
    <div className="search-container">
      <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input"
          placeholder="Search movies..."
        />
        
        {/* Search Icon */}
        <div className={`absolute right-4 top-2/5 -translate-y-1/2 transition-transform duration-300 ${isFocused ? 'scale-110' : ''}`}>
          <Icon name="SearchIcon" size={20} className="h-5 w-5 text-gray-400" />
        </div>

        {/* Progress Bar */}
      {(progress > 0 && progress < 100) && (
          <>
            <div className="absolute bottom-0 left-0 h-0.5 bg-gray-200 w-full rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400/20 animate-pulse"
                style={{ width: `${progress}%` }}
        />
            </div>
          </>
      )}
      </div>
    </div>
  )
}

export default LateInput
