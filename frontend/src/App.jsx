import React, { useState, useEffect } from 'react';
import { GraduationCap, LayoutDashboard, Shield, BarChart3, Bookmark, User, LogOut, Clock } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Firewall from './pages/Firewall';
import Analytics from './pages/Analytics';
import WatchLater from './pages/WatchLater';
import Profile from './pages/Profile';

const API = 'http://localhost:5000';

function AppShell() {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState('dashboard');
    const [watchLater, setWatchLater] = useState([]);
    const [todayMinutes, setTodayMinutes] = useState(0);

    // Load watch later from backend
    useEffect(() => {
        if (!user) return;
        fetch(`${API}/api/watchlater/${user.id}`)
            .then(r => r.json())
            .then(d => setWatchLater(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, [user]);

    // Load today stats
    useEffect(() => {
        if (!user) return;
        fetch(`${API}/api/analytics/${user.id}`)
            .then(r => r.json())
            .then(d => setTodayMinutes(parseInt(d.todayMinutes) || 0))
            .catch(() => {});
    }, [user, tab]);

    const toggleWatchLater = async (video) => {
        const exists = watchLater.find(w => w.video_id === video.videoId);
        if (exists) {
            await fetch(`${API}/api/watchlater/${user.id}/${video.videoId}`, { method: 'DELETE' });
            setWatchLater(w => w.filter(x => x.video_id !== video.videoId));
        } else {
            const res = await fetch(`${API}/api/watchlater`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id, videoId: video.videoId, videoTitle: video.title,
                    thumbnail: video.thumbnail, channelTitle: video.channelTitle,
                    channelId: video.channelId, publishedAt: video.publishedAt
                })
            });
            if (res.ok) {
                const saved = await res.json();
                if (saved && saved.video_id) setWatchLater(w => [saved, ...w]);
            }
        }
    };

    const removeWatchLater = async (videoId) => {
        await fetch(`${API}/api/watchlater/${user.id}/${videoId}`, { method: 'DELETE' });
        setWatchLater(w => w.filter(x => x.video_id !== videoId));
    };

    if (!user) return <Auth />;

    const navItems = [
        { id: 'dashboard', label: 'Home Feed', icon: <LayoutDashboard size={16} /> },
        { id: 'watchlater', label: 'Watch Later', icon: <Bookmark size={16} />, badge: watchLater.length || null },
        { id: 'firewall', label: 'Channel Firewall', icon: <Shield size={16} /> },
        { id: 'analytics', label: 'Focus Analytics', icon: <BarChart3 size={16} /> },
        { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy)' }}>

            {/* Sidebar */}
            <aside style={{ width: '240px', background: 'var(--navy-mid)', borderRight: '1px solid var(--navy-border)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50 }}>

                {/* Logo */}
                <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--navy-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="shield-pulse" style={{ background: 'var(--accent-dim)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                            <GraduationCap size={20} color="var(--accent)" />
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>FocusTube</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Intentional Learning</div>
                        </div>
                    </div>
                </div>

                {/* Daily stat */}
                <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--navy-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={13} color="var(--accent)" />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Today: </span>
                    <span className="mono" style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{todayMinutes}m focused</span>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
                    <div className="section-label" style={{ padding: '4px 8px', marginBottom: '6px' }}>Navigation</div>
                    {navItems.map(item => (
                        <button key={item.id} className={`nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
                            {item.icon}
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.badge ? (
                                <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '10px', fontWeight: 700, minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                                    {item.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </nav>

                {/* User footer */}
                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--navy-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{user.name?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                        </div>
                        <button onClick={logout}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px', borderRadius: '6px', transition: 'color 0.2s' }}
                            title="Sign out"
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, marginLeft: '240px', minHeight: '100vh' }}>
                {tab === 'dashboard' && <Dashboard watchLater={watchLater} onToggleWatchLater={toggleWatchLater} />}
                {tab === 'watchlater' && <WatchLater watchLater={watchLater} onRemove={removeWatchLater} />}
                {tab === 'firewall' && <Firewall />}
                {tab === 'analytics' && <Analytics />}
                {tab === 'profile' && <Profile />}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppShell />
        </AuthProvider>
    );
}
