import React from 'react';
import { X, ExternalLink, Clock } from 'lucide-react';

function formatDuration(secs) {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
}

export default function VideoPlayer({ video, onClose }) {
    if (!video) return null;
    const embedUrl = `https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1&autoplay=0&fs=1&iv_load_policy=3`;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ width: '100%', maxWidth: '960px', background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '16px', overflow: 'hidden' }}
                className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--navy-border)' }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>{video.channelTitle}</span>
                            {video.durationSeconds > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <Clock size={11} /> {formatDuration(video.durationSeconds)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--navy)', border: '1px solid var(--navy-border)', borderRadius: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '12px', fontWeight: 500 }}>
                            <ExternalLink size={13} /> Open in YouTube
                        </a>
                        <button onClick={onClose}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', background: 'var(--navy)', border: '1px solid var(--navy-border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
                <div style={{ aspectRatio: '16/9', background: '#000', width: '100%' }}>
                    <iframe style={{ width: '100%', height: '100%', border: 'none' }} src={embedUrl}
                        title={video.title} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--navy-border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--navy)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Focus mode active — comments, recommendations, and autoplay disabled</span>
                </div>
            </div>
        </div>
    );
}
