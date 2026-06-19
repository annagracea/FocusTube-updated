import React from 'react';
import { Bookmark, BookmarkCheck, Play } from 'lucide-react';

function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtDur(secs) {
    if (!secs) return null;
    const m = Math.floor(secs / 60), s = secs % 60, h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m%60).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
}

export default function VideoCard({ video, onWatch, onSaveWatchLater, isSaved }) {
    return (
        <div className="video-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', aspectRatio: '16/9', cursor: 'pointer', background: '#000' }} onClick={() => onWatch(video)}>
                <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {/* Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(79,142,247,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                        className="play-btn">
                        <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: '2px' }} />
                    </div>
                </div>
                {/* Duration badge */}
                {video.durationSeconds > 0 && (
                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '11px', fontFamily: 'var(--mono)', fontWeight: 500, padding: '2px 6px', borderRadius: '4px' }}>
                        {fmtDur(video.durationSeconds)}
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => onWatch(video)}>{video.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{video.channelTitle}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{timeAgo(video.publishedAt)}</div>
                    </div>
                    <button onClick={() => onSaveWatchLater(video)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? 'var(--accent)' : 'var(--text-muted)', padding: '4px', display: 'flex', borderRadius: '6px', transition: 'color 0.2s, background 0.2s' }}
                        title={isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
