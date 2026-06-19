import React, { useState } from 'react';
import { User, Save, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user.name, email: user.email });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const res = await fetch(`${API}/api/auth/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updated = await res.json();
                updateUser(updated);
                setStatus({ ok: true, msg: 'Profile updated.' });
            } else {
                setStatus({ ok: false, msg: 'Update failed.' });
            }
        } catch {
            setStatus({ ok: false, msg: 'Server error.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <User size={20} color="var(--accent)" />
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Profile</h1>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Manage your account details.</p>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', padding: '20px', background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '14px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)' }}>{user.name?.[0]?.toUpperCase() || 'U'}</span>
                </div>
                <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</div>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>ID #{user.id}</div>
                </div>
            </div>

            {/* Edit form */}
            <div style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
                <h2 style={{ margin: '0 0 18px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                        <input className="ft-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                        <input className="ft-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                </div>

                {status && (
                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: status.ok ? 'var(--green)' : 'var(--red)' }}>
                        {status.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {status.msg}
                    </div>
                )}

                <button className="ft-btn" onClick={handleSave} disabled={saving} style={{ marginTop: '18px' }}>
                    <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            {/* Sign out */}
            <div style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Sign Out</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>You'll need to sign in again to access your feed.</div>
                </div>
                <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '8px', color: 'var(--red)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'background 0.2s' }}>
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </div>
    );
}
