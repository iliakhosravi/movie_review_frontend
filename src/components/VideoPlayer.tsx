import React, { useEffect, useRef, useState } from 'react';
import { useUserStore } from '../store';

interface VideoPlayerProps {
  videoUrl: string;
  poster: string;
  movieId: number;
}

const getStorageKey = (userId: string | number | null, movieId: number) =>
  userId ? `movie-progress-${userId}-${movieId}` : `movie-progress-guest-${movieId}`;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, poster, movieId }) => {
  const user = useUserStore(s => s.user);
  const userId = user?.id ?? localStorage.getItem('userId') ?? 'guest';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [savedTime, setSavedTime] = useState<number | null>(null);
  const [shouldSeek, setShouldSeek] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const hasSeekedRef = useRef(false);

  // Save timeupdate to localStorage
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    localStorage.setItem(getStorageKey(userId, movieId), videoRef.current.currentTime.toString());
  };

  // Clear progress if video ended
  const handleEnded = () => {
    localStorage.removeItem(getStorageKey(userId, movieId));
  };

  // Seek to saved time if user chose to continue
  const seekToSavedTime = () => {
    if (!videoRef.current || savedTime === null || !shouldSeek || hasSeekedRef.current) return;
    const video = videoRef.current;
    if (savedTime < video.duration && video.duration > 0) {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        setShouldPlay(true);
      };
      video.addEventListener('seeked', onSeeked);
      video.currentTime = savedTime;
      hasSeekedRef.current = true;
    }
  };

  const handleLoadedMetadata = () => {
    seekToSavedTime();
  };

  // On mount and when user changes, check for saved time
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(userId, movieId));
    const time = saved ? parseFloat(saved) : null;
    setSavedTime(time && time > 0 ? time : null);
    setShowPrompt(!!(time && time > 0));
    setShouldSeek(false);
    setShouldPlay(false);
    hasSeekedRef.current = false;
  }, [movieId, userId]);

  // Extra effect to robustly seek to saved time
  useEffect(() => {
    if (!shouldSeek) return;
    const interval = setInterval(() => {
      if (videoRef.current && savedTime !== null && !hasSeekedRef.current) {
        if (videoRef.current.readyState >= 1 && videoRef.current.duration > 0) {
          seekToSavedTime();
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, [shouldSeek, savedTime]);

  // Play video only after user chooses
  useEffect(() => {
    if (shouldPlay && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setShouldPlay(false);
    }
  }, [shouldPlay]);

  const handleContinue = () => {
    setShowPrompt(false);
    setShouldSeek(true);
    setTimeout(() => {
      seekToSavedTime();
    }, 100);
  };

  const handleRestart = () => {
    setShowPrompt(false);
    setShouldSeek(false);
    hasSeekedRef.current = true;
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-full">
      {showPrompt && savedTime !== null && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center">
            <p className="mb-4 text-lg font-semibold text-gray-800">Continue watching from {formatTime(savedTime)}?</p>
            <div className="flex gap-4">
              <button onClick={handleContinue} className="px-4 py-2 rounded bg-yellow-400 text-yellow-900 font-bold shadow hover:bg-yellow-500">Continue</button>
              <button onClick={handleRestart} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300">Start from Beginning</button>
            </div>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        src={videoUrl}
        className="w-full h-full object-cover bg-black"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        autoPlay={false}
      />
    </div>
  );
};

export default VideoPlayer;
