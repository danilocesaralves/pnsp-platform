import { useState } from 'react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    show:       '#7C3AED',
    evento:     '#7C3AED',
    producao:   '#2563EB',
    aula:       '#059669',
    parceria:   '#DC2626',
    vaga_grupo: '#D97706',
    servico:    '#D97706',
    outro:      '#6B6B6B',
  };
  const color = colors[type?.toLowerCase()] ?? '#6B6B6B';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
      background: `${color}20`, color, border: `1px solid ${color}40`,
      textTransform: 'uppercase', letterSpacing: '.06em',
    }}>
      {type?.replace(/_/g, ' ')}
    </span>
  );
}

function OppCard({ opp }: { opp: any }) {
  const [hov, setHov] = useState(false);

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff}min atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return `${Math.floor(diff / 1440)}d atrás`;
  };

  return (
    <Link href={`/oportunidades/${opp.id}`}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'block', padding: '16px 20px',
          background: hov ? 'rgba(255,255,255,0.03)' : 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          transition: 'background .15s', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#EDECEA', marginBottom: 4, lineHeight: 1.3 }}>
              {opp.title}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <TypeBadge type={opp.category} />
              {opp.city && <span style={{ fontSize: 11, color: 'rgba(237,236,234,0.5)' }}>📍 {opp.city}</span>}
              {opp.state && <span style={{ fontSize: 11, color: 'rgba(237,236,234,0.5)' }}>{opp.state}</span>}
            </div>
          </div>
          {hov && <span style={{ fontSize: 12, color: '#00C4A0', fontWeight: 600, flexShrink: 0 }}>Ver →</span>}
        </div>
        {opp.description && (
          <p style={{
            fontSize: 12, color: 'rgba(237,236,234,0.5)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8,
          }}>
            {opp.description}
          </p>
        )}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          {opp.createdAt ? timeAgo(opp.createdAt) : 'Recente'}
        </div>
      </div>
    </Link>
  );
}

export function OpportunityFeed() {
  const [filter, setFilter] = useState('todas');
  const { data: opps = [], isLoading } = trpc.opportunities.list.useQuery({ limit: 20 });

  const filters = ['todas', 'show', 'producao', 'aula', 'parceria', 'vaga_grupo'];

  const filtered = filter === 'todas'
    ? (opps as any[])
    : (opps as any[]).filter((o: any) => o.category === filter);

  const visible = filtered.slice(0, 10);

  return (
    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#EDECEA' }}>Oportunidades</div>
          <div style={{ fontSize: 11, color: 'rgba(237,236,234,0.5)', marginTop: 2 }}>Atualizando em tempo real</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
          <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 12px', borderRadius: 9999,
              border: `1px solid ${filter === f ? 'rgba(0,196,160,0.4)' : 'rgba(237,236,234,0.06)'}`,
              background: filter === f ? 'rgba(0,196,160,0.1)' : 'transparent',
              color: filter === f ? '#00C4A0' : 'rgba(237,236,234,0.5)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all .15s',
              textTransform: 'capitalize',
            }}
          >
            {f === 'todas' ? 'Todas' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div>
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '70%', borderRadius: 6 }} />
              <div className="skeleton" style={{ height: 10, width: '40%', borderRadius: 6 }} />
            </div>
          ))
        ) : visible.length > 0 ? (
          visible.map((o: any) => <OppCard key={o.id} opp={o} />)
        ) : (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 14, color: 'rgba(237,236,234,0.5)' }}>Nenhuma oportunidade ainda</div>
            <Link href="/criar-oportunidade">
              <span style={{ fontSize: 12, color: '#00C4A0', fontWeight: 600, marginTop: 8, display: 'inline-block' }}>
                Publicar a primeira →
              </span>
            </Link>
          </div>
        )}
      </div>

      {visible.length > 0 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <Link href="/oportunidades">
            <span style={{ fontSize: 12, color: '#00C4A0', fontWeight: 600 }}>
              Ver todas as oportunidades →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
