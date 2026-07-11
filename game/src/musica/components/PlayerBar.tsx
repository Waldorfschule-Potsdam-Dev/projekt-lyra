import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { formatTime } from '../data/songs';

interface Props {
  onExpand?: () => void;
}

export default function PlayerBar({ onExpand }: Props) {
  const {
    currentSong, isPlaying, currentTime, duration,
    togglePlay, next, seek,
  } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();

  if (!currentSong) return null;
  const liked = isLiked(currentSong.id);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  return (
    <div className="sp-player" onClick={onExpand}>
      <div className="sp-player-row">
        <img src={currentSong.cover} alt="" className="sp-player-cover" />
        <div className="sp-player-info">
          <div className="sp-player-title">{currentSong.title}</div>
          <div className="sp-player-artist">{currentSong.artist}</div>
        </div>
        <div className="sp-player-controls" onClick={(e) => e.stopPropagation()}>
          <button
            className="sp-iconbtn"
            style={{ background: 'transparent', width: 28, height: 28 }}
            onClick={() => toggleLike(currentSong.id)}
            aria-label="Gefällt mir"
          >
            <Heart size={16} fill={liked ? '#1DB954' : 'none'} color={liked ? '#1DB954' : '#fff'} />
          </button>
          <button
            className="sp-playbtn"
            style={{ width: 32, height: 32 }}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Abspielen'}
          >
            {isPlaying ? <Pause size={14} fill="#000" /> : <Play size={14} fill="#000" style={{ marginLeft: 1 }} />}
          </button>
          <button
            className="sp-iconbtn"
            style={{ background: 'transparent', width: 28, height: 28 }}
            onClick={next}
            aria-label="Weiter"
          >
            <SkipForward size={16} fill="#fff" />
          </button>
        </div>
      </div>
      <div className="sp-player-progress" onClick={onSeek}>
        <div className="sp-player-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="sp-progress-time">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}