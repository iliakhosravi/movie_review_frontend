import { useEffect, useState } from 'react'

const formatTime = (seconds: number) => {
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  let str = ''
  if (d > 0) str += `${d} day${d > 1 ? 's' : ''} `
  if (h > 0) str += `${h} h `
  if (m > 0) str += `${m} m `
  str += `${s} s`
  return str.trim()
}

const Timer = ({ seconds }: { seconds: number }) => {
  const [count, setCount] = useState(seconds)
  useEffect(() => {
    if (count <= 0) return
    const t = setTimeout(() => setCount(count - 1), 1000)
    return () => clearTimeout(t)
  }, [count])
  if (count <= 0)
    return (
      <span className="inline-block px-8 py-3 rounded-full bg-yellow-400 text-black font-extrabold text-xl tracking-wide shadow text-center transition-all">
        Now available!
      </span>
    )
  return (
    <span className="inline-block px-8 py-3 rounded-full bg-black border border-yellow-400 text-yellow-400 font-extrabold text-xl tracking-wide shadow text-center transition-all">
      It will be started in {formatTime(count)}
    </span>
  )
}

export default Timer
