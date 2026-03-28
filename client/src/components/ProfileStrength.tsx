import { useState } from 'react';
import { Link } from 'wouter';

interface StrengthItem {
  id: string;
  label: string;
  done: boolean;
  points: number;
  action: string;
  to: string;
}

interface ProfileStrengthProps {
  profile: any;
}

function StrengthItemRow({ item }: { item: StrengthItem }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        background: item.done ? '#00C4A0' : 'transparent',
        border: `2px solid ${item.done ? '#00C4A0' : 'rgba(255,255,255,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .3s',
      }}>
        {item.done && <span style={{ color: '#0A0A0A', fontSize: 10, fontWeight: 800 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: item.done ? 500 : 600, color: item.done ? '#6B6B6B' : 'var(--creme)', textDecoration: item.done ? 'line-through' : undefined }}>
          {item.label}
        </div>
      </div>
      {!item.done && (
        <Link href={item.to}
          style={{ fontSize: 11, color: '#00C4A0', fontWeight: 700, padding: '4px 10px', border: '1px solid rgba(0,196,160,0.3)', borderRadius: 6, transition: 'all .2s', whiteSpace: 'nowrap', textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,196,160,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
          {item.action}
        </Link>
      )}
    </div>
  );
}

export function ProfileStrength({ profile }: ProfileStrengthProps) {
  const [open, setOpen] = useState(false);

  const items: StrengthItem[] = [
    { id: 'photo',    label: 'Adicionar foto de perfil',    done: !!profile?.avatarUrl,                                   points: 20, action: 'Adicionar',  to: '/dashboard' },
    { id: 'bio',      label: 'Escrever sobre você',         done: !!(profile?.bio && profile.bio.length > 20),            points: 15, action: 'Escrever',   to: '/dashboard' },
    { id: 'city',     label: 'Informar sua cidade',         done: !!profile?.city,                                        points: 10, action: 'Informar',   to: '/dashboard' },
    { id: 'phone',    label: 'Adicionar telefone de contato', done: !!profile?.phone,                                     points: 15, action: 'Adicionar',  to: '/dashboard' },
    { id: 'cover',    label: 'Adicionar foto de capa',      done: !!profile?.coverUrl,                                    points: 10, action: 'Adicionar',  to: '/dashboard' },
    { id: 'cache',       label: 'Informar cachê de apresentação', done: !!(profile?.priceMin),                                points: 15, action: 'Informar', to: '/dashboard' },
    { id: 'duracao',     label: 'Informar duração de apresentação', done: !!(profile?.durationMin),                           points: 10, action: 'Informar', to: '/dashboard' },
    { id: 'cidades',     label: 'Informar cidades onde atua',       done: !!(profile?.cities),                                points: 10, action: 'Informar', to: '/dashboard' },
    { id: 'instrumentos',label: 'Informar instrumentos',            done: !!(profile?.instruments),                           points: 10, action: 'Informar', to: '/dashboard' },
    { id: 'instagram',label: 'Conectar Instagram',          done: !!profile?.instagramUrl,                               points: 15, action: 'Conectar',   to: '/dashboard' },
  ];

  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  const level = pct < 30  ? { name: 'Iniciante',      color: '#EF4444' }
    : pct < 60  ? { name: 'Básico',         color: '#F59E0B' }
    : pct < 80  ? { name: 'Intermediário',  color: '#3B82F6' }
    : pct < 100 ? { name: 'Avançado',       color: '#8B5CF6' }
    :             { name: '⭐ All-Star',     color: '#00C4A0' };

  const circumference = 2 * Math.PI * 22;

  return (
    <div style={{ background: 'var(--terra)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
      {/* Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--creme)', marginBottom: 2 }}>Força do Perfil</div>
          <div style={{ fontSize: 11, color: level.color, fontWeight: 700 }}>{level.name}</div>
        </div>
        <div style={{ position: 'relative', width: 52, height: 52 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle cx="26" cy="26" r="22" fill="none" stroke={level.color} strokeWidth="4"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--creme)' }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: level.color, borderRadius: 2, width: `${pct}%`, transition: 'width 1s ease' }} />
      </div>

      {pct < 100 && (
        <div style={{ fontSize: 12, color: 'var(--creme-50)', marginBottom: 12 }}>
          Perfis completos aparecem{' '}
          <span style={{ color: level.color, fontWeight: 700 }}>40x mais</span>{' '}
          nas buscas de contratantes
        </div>
      )}

      {/* Lista de itens */}
      {open && (
        <div>
          {items.map(item => <StrengthItemRow key={item.id} item={item} />)}
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{ fontSize: 12, color: '#00C4A0', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          Ver o que falta ({items.filter(i => !i.done).length} itens) ↓
        </button>
      )}
    </div>
  );
}
