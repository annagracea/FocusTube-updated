import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

export default function Auth() {
    const { login } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        setError('');
        if (!form.email || !form.password) { setError('Email and password required.'); return; }
        if (mode === 'register' && !form.name) { setError('Name required.'); return; }

        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const res = await fetch(`${API}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
            login(data);
        } catch {
            setError('Cannot reach server. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in">

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div className="shield-pulse" style={{ background: 'var(--accent-dim)', borderRadius: '12px', padding: '10px', display: 'flex' }}>
                            <GraduationCap size={28} color="var(--accent)" />
                        </div>
                        <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>FocusTube</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Curated YouTube for intentional learners</p>
                </div>

                {/* Card */}
                <div style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '16px', padding: '32px' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'var(--navy)', borderRadius: '8px', padding: '4px', marginBottom: '28px' }}>
                        {['login', 'register'].map(m => (
                            <button key={m} onClick={() => { setMode(m); setError(''); }}
                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                                    background: mode === m ? 'var(--navy-card)' : 'transparent',
                                    color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                                    transition: 'all 0.2s' }}>
                                {m === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {mode === 'register' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
                                <input className="ft-input" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
                            </div>
                        )}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email</label>
                            <input className="ft-input" type="email" placeholder="you@university.edu" value={form.email} onChange={e => set('email', e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="ft-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                                    onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                    style={{ paddingRight: '40px' }} />
                                <button onClick={() => setShowPass(s => !s)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--red)' }}>
                                {error}
                            </div>
                        )}

                        <button className="ft-btn" onClick={handleSubmit} disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </div>
                </div>

                {/* Trust badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <ShieldCheck size={13} />
                    No recommendations. No Shorts. No autoplay.
                </div>
            </div>
        </div>
    );
}
