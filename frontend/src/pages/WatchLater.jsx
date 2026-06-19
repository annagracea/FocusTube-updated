import React, { useState } from 'react';
import { Bookmark, Trash2, Play } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function WatchLater({ watchLater, onRemove }) {
    const [activeVideo, setActiveVideo] = useState(null);

    const toVideo = (w) => ({
        videoId: w.video_id,
        title: w.video_title,
        thumbnail: w.thumbnail,
        channelTitle: w.channel_title,
        channelId: w.channel_id,
        publishedAt: w.published_at,
        durationSeconds: 0
    });

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Bookmark size={20} color="var(--accent)" />
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Watch Later</h1>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    {watchLater.length} saved {watchLater.length === 1 ? 'video' : 'videos'} — watch on your schedule
                </p>
            </div>

            {watchLater.length === 0 ? (
                <div style={{ background: 'var(--navy-card)', border: '1px dashed var(--navy-border)', borderRadius: '16px', padding: '64px 32px', textAlign: 'center' }}>
                    <Bookmark size={28} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nothing saved yet</p>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Bookmark videos from your feed to watch at a focused time.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {watchLater.map((item) => (
                        <div key={item.video_id || item.videoId} style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '12px', display: 'flex', gap: '16px', padding: '14px', alignItems: 'center', transition: 'border-color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--navy-border)'}>

                            {/* Thumbnail */}
                            <div style={{ position: 'relative', flexShrink: 0, width: '140px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', background: '#000' }}
                                onClick={() => setActiveVideo(toVideo(item))}>
                                <img src={item.thumbnail} alt={item.video_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0)', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                                    <Play size={20} color="#fff" fill="#fff" style={{ opacity: 0.9 }} />
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                    onClick={() => setActiveVideo(toVideo(item))}>{item.video_title}</h3>
                                <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>{item.channel_title}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Saved {timeAgo(item.saved_at || new Date())}</div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <button className="ft-btn-ghost" onClick={() => setActiveVideo(toVideo(item))} style={{ padding: '7px 12px', fontSize: '12px' }}>
                                    <Play size={13} /> Watch
                                </button>
                                <button className="ft-btn-danger" onClick={() => onRemove(item.video_id || item.videoId)} title="Remove">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeVideo && <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />}
        </div>
    );
}
