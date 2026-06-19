import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronLeft, ChevronRight, X, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';

const API = 'http://localhost:5000';

export default function Dashboard({ watchLater, onToggleWatchLater }) {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [activeVideo, setActiveVideo] = useState(null);
    const [searchQ, setSearchQ] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);

    const loadFeed = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/feed/${user.id}?page=${p}`);
            const data = await res.json();
            setVideos(data.videos || []);
            setHasMore(data.hasMore || false);
            setTotal(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => { loadFeed(page); }, [page]);

    const handleSearch = async () => {
        if (!searchQ.trim()) { setSearchResults(null); return; }
        setSearching(true);
        try {
            const res = await fetch(`${API}/api/search/${user.id}?q=${encodeURIComponent(searchQ)}`);
            const data = await res.json();
            setSearchResults(data);
        } catch { setSearchResults([]); }
        finally { setSearching(false); }
    };

    const clearSearch = () => { setSearchQ(''); setSearchResults(null); };

    const handleWatch = async (video) => {
        setActiveVideo(video);
        try {
            await fetch(`${API}/api/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, channelId: video.channelId, channelName: video.channelTitle, videoId: video.videoId, videoTitle: video.title, duration: Math.round(video.durationSeconds / 60) || 10 })
            });
        } catch {}
    };

    const displayVideos = searchResults !== null ? searchResults : videos;
    const isSearchMode = searchResults !== null;

    return (
        <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Your Feed</h1>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {isSearchMode ? `Search results for "${searchQ}"` : `${total} videos from your approved channels — chronological, no algorithm`}
                        </p>
                    </div>
                    <button className="ft-btn-ghost" onClick={() => loadFeed(page)} style={{ flexShrink: 0 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Search bar */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="ft-input" placeholder="Search within your approved channels only…"
                            value={searchQ} onChange={e => setSearchQ(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            style={{ paddingLeft: '36px', paddingRight: searchQ ? '36px' : '12px' }} />
                        {searchQ && (
                            <button onClick={clearSearch} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button className="ft-btn" onClick={handleSearch} disabled={searching}>
                        {searching ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
                        Search
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px', color: 'var(--text-muted)' }}>
                    <Loader size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '13px' }}>Loading your curated feed…</span>
                </div>
            ) : displayVideos.length === 0 ? (
                <div style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '16px', padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>{isSearchMode ? '🔍' : '📚'}</div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isSearchMode ? 'No results found' : 'Your feed is empty'}
                    </h3>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
                        {isSearchMode ? `No videos matching "${searchQ}" in your approved channels.` : 'Go to Channel Firewall and add some educational channels to get started.'}
                    </p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {displayVideos.map(video => (
                            <VideoCard key={video.videoId} video={video}
                                onWatch={handleWatch}
                                onSaveWatchLater={onToggleWatchLater}
                                isSaved={watchLater.some(w => w.video_id === video.videoId || w.videoId === video.videoId)} />
                        ))}
                    </div>

                    {/* Pagination — deliberate, no infinite scroll */}
                    {!isSearchMode && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
                            <button className="ft-btn-ghost" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                <ChevronLeft size={15} /> Previous
                            </button>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                                Page {page}
                            </span>
                            <button className="ft-btn-ghost" onClick={() => setPage(p => p + 1)} disabled={!hasMore}>
                                Next <ChevronRight size={15} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {activeVideo && <VideoPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />}
        </div>
    );
}
