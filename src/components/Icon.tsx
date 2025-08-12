import React from 'react'

// Import icons individually to avoid issues
import ReactIcon from '../icons/react.svg?react'
import GridIcon from '../icons/grid.svg?react'
import ListIcon from '../icons/list.svg?react'
import StarIcon from '../icons/star.svg?react'
import UserIcon from '../icons/user.svg?react'
import SearchIcon from '../icons/search.svg?react'
import CloseIcon from '../icons/close.svg?react'
import PlayIcon from '../icons/play.svg?react'
import PauseIcon from '../icons/pause.svg?react'
import VolumeIcon from '../icons/volume.svg?react'
import MuteIcon from '../icons/mute.svg?react'
import FullscreenIcon from '../icons/fullscreen.svg?react'
import SettingsIcon from '../icons/settings.svg?react'
import HomeIcon from '../icons/home.svg?react'
import MovieIcon from '../icons/movie.svg?react'
import HeartIcon from '../icons/heart.svg?react'
import ShareIcon from '../icons/share.svg?react'
import DownloadIcon from '../icons/download.svg?react'
import InfoIcon from '../icons/info.svg?react'
import WarningIcon from '../icons/warning.svg?react'
import ErrorIcon from '../icons/error.svg?react'
import SuccessIcon from '../icons/success.svg?react'

const Icons = {
  ReactIcon,
  GridIcon,
  ListIcon,
  StarIcon,
  UserIcon,
  SearchIcon,
  CloseIcon,
  PlayIcon,
  PauseIcon,
  VolumeIcon,
  MuteIcon,
  FullscreenIcon,
  SettingsIcon,
  HomeIcon,
  MovieIcon,
  HeartIcon,
  ShareIcon,
  DownloadIcon,
  InfoIcon,
  WarningIcon,
  ErrorIcon,
  SuccessIcon,
}

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof Icons
  size?: number | string
  className?: string
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  className = '', 
  ...props 
}) => {
  const IconComponent = Icons[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={className}
      {...props}
    />
  )
}

export default Icon 