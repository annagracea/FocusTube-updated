import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, Key, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

export default function Firewall() {
    const { user } = useAuth();
    const [channels, setChannels] = useState([]);
    const [form, setForm] = useState({ channelId: '', channelName: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadChannels = async () => {
        try {
            const res = await fetch(`${API}/api/channels/${user.id}`);
            const data = await res.json();
            setChannels(Array.isArray(data) ? data : []);
        } catch { setChannels([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadChannels(); }, [user.id]);

    const handleAdd = async () => {
        if (!form.channelId.trim() || !form.channelName.trim()) { showToast('Both fields required.', 'error'); return; }
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/channels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, channelId: form.channelId.trim(), channelName: form.channelName.trim(), thumbnail: '' })
            });
            if (res.ok) { setForm({ channelId: '', channelName: '' }); await loadChannels(); showToast('Channel added to your allowlist.'); }
            else { showToast('Failed to add channel.', 'error'); }
        } catch { showToast('Server error.', 'error'); }
        finally { setSaving(false); }
    };

    const handleRemove = async (channelId, channelName) => {
        if (!window.confirm(`Remove "${channelName}" from your allowlist?`)) return;
        try {
            await fetch(`${API}/api/channels/${user.id}/${channelId}`, { method: 'DELETE' });
            await loadChannels();
            showToast(`"${channelName}" removed.`);
        } catch { showToast('Failed to remove.', 'error'); }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '860px', margin: '0 auto' }}>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 200, background: toast.type === 'error' ? 'rgba(248,81,73,0.15)' : 'rgba(63,185,80,0.15)', border: `1px solid ${toast.type === 'error' ? 'var(--red)' : 'var(--green)'}`, borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: toast.type === 'error' ? 'var(--red)' : 'var(--green)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                    className="animate-fade-in">
                    {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Shield size={20} color="var(--accent)" />
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Channel Firewall</h1>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    Only videos from allowlisted channels appear in your feed. Content from all other channels is blocked.
                </p>
            </div>

            {/* Info box */}
            <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(79,142,247,0.3)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', fontSize: '13px', color: 'var(--accent)' }}>
                <strong>How to find a Channel ID:</strong> Visit the channel on YouTube → About tab → Share → Copy Channel ID. It looks like <span className="mono" style={{ fontSize: '12px' }}>UCxxxxxxxxxxxxxxxxxxxxxxxx</span>
            </div>

            {/* Add form */}
            <div style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '14px', padding: '24px', marginBottom: '28px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Add a Channel</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Channel ID</label>
                        <input className="ft-input mono" placeholder="UCxxxxxxxxxxxxxxxxxxxxx"
                            value={form.channelId} onChange={e => setForm(f => ({ ...f, channelId: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()} style={{ fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Display Name</label>
                        <input className="ft-input" placeholder="e.g., 3Blue1Brown"
                            value={form.channelName} onChange={e => setForm(f => ({ ...f, channelName: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                    </div>
                </div>
                <button className="ft-btn" onClick={handleAdd} disabled={saving}>
                    {saving ? <Loader size={14} /> : <Plus size={14} />}
                    {saving ? 'Adding…' : 'Add to Allowlist'}
                </button>
            </div>

            {/* Channel list */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span className="section-label">Approved Channels</span>
                    <span className="badge">{channels.length} channel{channels.length !== 1 ? 's' : ''}</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><Loader size={20} className="animate-spin" /></div>
                ) : channels.length === 0 ? (
                    <div style={{ background: 'var(--navy-card)', border: '1px dashed var(--navy-border)', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
                        <Shield size={28} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>No channels allowlisted yet</p>
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Add a channel above to start building your focused feed.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {channels.map((chan, i) => (
                            <div key={chan.id} className="animate-slide-in" style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: `${i * 30}ms` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Key size={15} color="var(--accent)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{chan.name}</div>
                                        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', userSelect: 'all' }}>{chan.id}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--green)', background: 'var(--green-dim)', padding: '3px 8px', borderRadius: '20px', fontWeight: 600 }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)' }} />
                                        Active
                                    </div>
                                    <button className="ft-btn-danger" onClick={() => handleRemove(chan.id, chan.name)} title="Remove channel">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
