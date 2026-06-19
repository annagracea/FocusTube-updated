import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, ShieldCheck, TrendingUp, Calendar, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

export default function Analytics() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalMinutes: 0, todayMinutes: 0, chartData: [], weeklyData: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/analytics/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setStats({
                    totalMinutes: parseInt(data.totalMinutes) || 0,
                    todayMinutes: parseInt(data.todayMinutes) || 0,
                    chartData: (data.chartData || []).map(d => ({ name: d.name, minutes: parseInt(d.value) || 0 })),
                    weeklyData: data.weeklyData || []
                });
                setLoading(false);
            }).catch(() => setLoading(false));
    }, [user.id]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px', color: 'var(--text-muted)' }}>
            <Loader size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '13px' }}>Loading your analytics…</span>
        </div>
    );

    const totalHours = (stats.totalMinutes / 60).toFixed(1);
    const avgDaily = stats.weeklyData.length > 0
        ? Math.round(stats.weeklyData.reduce((a, b) => a + (parseInt(b.minutes) || 0), 0) / 7)
        : 0;

    const tooltipStyle = {
        background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)'
    };

    return (
        <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <TrendingUp size={20} color="var(--accent)" />
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Focus Analytics</h1>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Your intentional viewing habits — every minute here is content you chose.</p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                    { icon: <Clock size={18} color="var(--accent)" />, value: `${totalHours}h`, label: 'Total Focus Time', bg: 'var(--accent-dim)', border: 'rgba(79,142,247,0.3)' },
                    { icon: <Calendar size={18} color="var(--green)" />, value: `${stats.todayMinutes}m`, label: 'Watched Today', bg: 'var(--green-dim)', border: 'rgba(63,185,80,0.3)' },
                    { icon: <TrendingUp size={18} color="var(--amber)" />, value: `${avgDaily}m`, label: '7-Day Daily Avg', bg: 'rgba(210,153,34,0.15)', border: 'rgba(210,153,34,0.3)' },
                    { icon: <ShieldCheck size={18} color="var(--green)" />, value: '0', label: 'Algorithmic Videos', bg: 'var(--green-dim)', border: 'rgba(63,185,80,0.3)' },
                ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', flexShrink: 0 }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', fontFamily: 'var(--mono)' }}>{s.value}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* Channel distribution */}
                <div className="stat-card">
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '20px' }}>Time by Channel</div>
                    {stats.chartData.length === 0 ? (
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)', border: '1px dashed var(--navy-border)', borderRadius: '8px' }}>
                            No watch history yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--navy-hover)' }} />
                                <Bar dataKey="minutes" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Weekly trend */}
                <div className="stat-card">
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '20px' }}>7-Day Trend (minutes)</div>
                    {stats.weeklyData.length === 0 ? (
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)', border: '1px dashed var(--navy-border)', borderRadius: '8px' }}>
                            Watch more to see trends
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={stats.weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--navy-border)' }} />
                                <Line type="monotone" dataKey="minutes" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Focus pledge */}
            <div style={{ marginTop: '24px', background: 'var(--green-dim)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={18} color="var(--green)" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--green)', lineHeight: 1.5 }}>
                    <strong>Zero algorithmic exposure.</strong> Every video you've watched here was from a channel you consciously approved. No rabbit holes, no recommendations, no Shorts.
                </p>
            </div>
        </div>
    );
}
