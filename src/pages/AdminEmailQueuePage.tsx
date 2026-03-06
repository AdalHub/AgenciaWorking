import { useEffect, useState } from 'react';

type EmailRow = {
  id: number;
  recipient_email: string;
  subject: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  retry_count: number;
};

export default function AdminEmailQueuePage() {
  const [items, setItems] = useState<EmailRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<number | null>(null);
  const [retryAllLoading, setRetryAllLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const perPage = 50;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/studies.php?action=list_email_queue&${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setItems([]);
          setTotal(0);
        } else {
          setItems(d.items || []);
          setTotal(d.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter, refreshKey]);

  const handleRetry = (id: number) => {
    setRetrying(id);
    fetch('/api/studies.php?action=retry_email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setToast(d.error);
        else {
          setToast('Reencolado');
          setItems((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'queued', retry_count: 0 } : row)));
        }
      })
      .finally(() => setRetrying(null));
  };

  const handleRetryAllFailed = () => {
    setRetryAllLoading(true);
    fetch('/api/studies.php?action=retry_all_failed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setToast(d.error);
        else {
          setToast(`Reencolados: ${d.updated ?? 0}`);
          setPage(1);
          setRefreshKey((k) => k + 1);
        }
      })
      .finally(() => setRetryAllLoading(false));
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return d;
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      queued: { bg: '#f3f4f6', text: '#374151' },
      sent: { bg: '#d1fae5', text: '#065f46' },
      failed: { bg: '#fee2e2', text: '#991b1b' },
    };
    const s = colors[status] || { bg: '#f3f4f6', text: '#374151' };
    return <span style={{ padding: '4px 8px', borderRadius: 6, background: s.bg, color: s.text, fontSize: 12 }}>{status}</span>;
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
        <div style={{ maxWidth: 1000, width: '100%', boxSizing: 'border-box' }}>
          <h1 style={{ marginBottom: 16 }}>Cola de correo</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <label>
              Estado:{' '}
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '6px 10px', borderRadius: 6 }}>
                <option value="">Todos</option>
                <option value="queued">En cola</option>
                <option value="sent">Enviado</option>
                <option value="failed">Fallido</option>
              </select>
            </label>
            <button onClick={handleRetryAllFailed} disabled={retryAllLoading} style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: retryAllLoading ? 'not-allowed' : 'pointer' }}>
              Reintentar todos los fallidos
            </button>
          </div>
          {loading ? (
            <p>Cargando…</p>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: 12 }}>Destinatario</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Asunto</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Creado</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Enviado</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Reintentos</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: 12 }}>{row.recipient_email}</td>
                      <td style={{ padding: 12, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.subject}>{row.subject}</td>
                      <td style={{ padding: 12 }}>{statusBadge(row.status)}</td>
                      <td style={{ padding: 12 }}>{formatDate(row.created_at)}</td>
                      <td style={{ padding: 12 }}>{formatDate(row.sent_at)}</td>
                      <td style={{ padding: 12 }}>{row.retry_count ?? 0}</td>
                      <td style={{ padding: 12 }}>
                        {row.status === 'failed' && (
                          <button onClick={() => handleRetry(row.id)} disabled={retrying === row.id} style={{ padding: '4px 10px', fontSize: 12, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 4, cursor: retrying === row.id ? 'not-allowed' : 'pointer' }}>
                            {retrying === row.id ? '…' : 'Reintentar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>Anterior</button>
              <span style={{ fontSize: 14 }}>Página {page} de {totalPages} ({total} total)</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>Siguiente</button>
            </div>
          )}
        </div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: 12, background: '#111', color: '#fff', borderRadius: 8 }}>{toast}</div>}
    </>
  );
}
