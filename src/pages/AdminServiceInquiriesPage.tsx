import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../lib/getErrorMessage';

type InquiryStatus = 'pendiente' | 'en_proceso' | 'disponible' | 'completado';

type InquiryAttachment = {
  attachment_id: number;
  inquiry_id: number;
  original_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number;
  uploaded_at: string;
};

type InquiryRow = {
  inquiry_id: number;
  company_user_id: number;
  requested_by_user_id: number;
  service_catalog_id: number | null;
  service_slug: string | null;
  service_name_snapshot: string;
  requester_name: string;
  requester_title: string | null;
  requester_email: string;
  requester_phone: string | null;
  request_message: string;
  status: InquiryStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  company_display_name: string;
  requested_by_name: string | null;
  requested_by_email: string | null;
  attachment_count?: number;
  attachments?: InquiryAttachment[];
};

const STATUS_LABELS: Record<InquiryStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  disponible: 'Disponible',
  completado: 'Completado',
};

const STATUS_COLORS: Record<InquiryStatus, { bg: string; text: string }> = {
  pendiente: { bg: '#fef3c7', text: '#b45309' },
  en_proceso: { bg: '#dbeafe', text: '#1d4ed8' },
  disponible: { bg: '#e0f2fe', text: '#0369a1' },
  completado: { bg: '#dcfce7', text: '#166534' },
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function bytesLabel(bytes: number): string {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminServiceInquiriesPage() {
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [detail, setDetail] = useState<InquiryRow | null>(null);
  const [detailStatus, setDetailStatus] = useState<InquiryStatus>('pendiente');
  const [detailNotes, setDetailNotes] = useState('');

  const load = useCallback(async (selectedId?: number | null) => {
    setLoading(true);
    try {
      const url = new URL('/api/company_portal.php', window.location.origin);
      url.searchParams.set('action', 'list_service_inquiries');
      if (statusFilter) {
        url.searchParams.set('status', statusFilter);
      }
      const res = await fetch(url.toString(), { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible cargar las solicitudes.');
      }
      const nextRows = Array.isArray(data?.inquiries) ? data.inquiries : [];
      setInquiries(nextRows);
      const nextSelectedId = selectedId ?? null;
      if (nextSelectedId) {
        const exists = nextRows.some((row: InquiryRow) => row.inquiry_id === nextSelectedId);
        if (!exists) {
          setSelectedInquiryId(null);
          setDetail(null);
        }
      }
    } catch (error: unknown) {
      setToast(getErrorMessage(error, 'No fue posible cargar las solicitudes del portal.'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return inquiries;
    return inquiries.filter((row) =>
      [
        row.company_display_name,
        row.service_name_snapshot,
        row.requester_name,
        row.requester_email,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [inquiries, search]);

  const openDetail = async (inquiryId: number) => {
    setSelectedInquiryId(inquiryId);
    setDetailLoading(true);
    setToast(null);
    try {
      const res = await fetch(`/api/company_portal.php?action=get_service_inquiry&inquiry_id=${inquiryId}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data?.inquiry) {
        throw new Error(data?.error || 'No fue posible cargar la solicitud.');
      }
      setDetail(data.inquiry);
      setDetailStatus(data.inquiry.status || 'pendiente');
      setDetailNotes(data.inquiry.admin_notes || '');
    } catch (error: unknown) {
      setToast(getErrorMessage(error, 'No fue posible cargar el detalle.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const saveDetail = async () => {
    if (!detail) return;
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=update_service_inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          inquiry_id: detail.inquiry_id,
          status: detailStatus,
          admin_notes: detailNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.inquiry) {
        throw new Error(data?.error || 'No fue posible actualizar la solicitud.');
      }
      setDetail(data.inquiry);
      await load(detail.inquiry_id);
      setToast('Solicitud actualizada.');
    } catch (error: unknown) {
      setToast(getErrorMessage(error, 'No fue posible actualizar la solicitud.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1280, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Solicitudes del Portal Cliente</h1>
          <p style={{ margin: '6px 0 0', color: '#64748b' }}>
            Aqui Working puede revisar las solicitudes de informacion o cotizacion enviadas desde el portal de empresa.
          </p>
        </div>
      </div>

      {toast ? (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
          {toast}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)', gap: 18 }}>
        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por empresa, servicio o solicitante"
              style={{ flex: '1 1 280px', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
            >
              <option value="">Todos los estatus</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ padding: 20, color: '#64748b' }}>Cargando solicitudes...</div>
          ) : filteredRows.length === 0 ? (
            <div style={{ padding: 20, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#64748b' }}>
              No hay solicitudes registradas con los filtros actuales.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredRows.map((row) => {
                const statusStyle = STATUS_COLORS[row.status] || STATUS_COLORS.pendiente;
                const isSelected = row.inquiry_id === selectedInquiryId;
                return (
                  <button
                    key={row.inquiry_id}
                    type="button"
                    onClick={() => openDetail(row.inquiry_id)}
                    style={{
                      textAlign: 'left',
                      border: isSelected ? '1px solid #2563eb' : '1px solid #e5e7eb',
                      background: isSelected ? '#eff6ff' : '#fff',
                      borderRadius: 14,
                      padding: 14,
                      cursor: 'pointer',
                      display: 'grid',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{row.company_display_name}</div>
                      <span style={{ padding: '5px 10px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.text, fontSize: 12, fontWeight: 700 }}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{row.service_name_snapshot}</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>
                      {row.requester_name} · {row.requester_email}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#64748b', fontSize: 12 }}>
                      <span>Creada: {formatDate(row.created_at)}</span>
                      <span>Adjuntos: {row.attachment_count || 0}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
          {detailLoading ? (
            <div style={{ padding: 20, color: '#64748b' }}>Cargando detalle...</div>
          ) : !detail ? (
            <div style={{ padding: 20, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#64748b' }}>
              Selecciona una solicitud para ver el detalle y registrar seguimiento.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: 22, color: '#0f172a' }}>{detail.service_name_snapshot}</h2>
                <div style={{ color: '#64748b' }}>{detail.company_display_name}</div>
              </div>

              <div style={{ display: 'grid', gap: 8, padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                <div><strong>Solicitante:</strong> {detail.requester_name}</div>
                <div><strong>Puesto:</strong> {detail.requester_title || '-'}</div>
                <div><strong>Correo:</strong> {detail.requester_email}</div>
                <div><strong>Telefono:</strong> {detail.requester_phone || '-'}</div>
                <div><strong>Fecha:</strong> {formatDate(detail.created_at)}</div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Necesidad reportada</div>
                <div style={{ padding: 14, borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {detail.request_message}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Adjuntos</div>
                {detail.attachments && detail.attachments.length > 0 ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {detail.attachments.map((attachment) => (
                      <div key={attachment.attachment_id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>{attachment.original_name}</div>
                          <div style={{ color: '#64748b', fontSize: 12 }}>
                            {bytesLabel(attachment.size_bytes)} · {formatDate(attachment.uploaded_at)}
                          </div>
                        </div>
                        <a
                          href={`/api/company_portal.php?action=download_service_inquiry_attachment&attachment_id=${attachment.attachment_id}`}
                          style={{ padding: '8px 12px', background: '#111827', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          Descargar
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#64748b' }}>
                    Esta solicitud no incluye archivos adjuntos.
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Estatus interno</span>
                  <select
                    value={detailStatus}
                    onChange={(event) => setDetailStatus(event.target.value as InquiryStatus)}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Notas internas</span>
                  <textarea
                    value={detailNotes}
                    onChange={(event) => setDetailNotes(event.target.value)}
                    rows={6}
                    placeholder="Seguimiento interno, acuerdos, acciones pendientes..."
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', resize: 'vertical' }}
                  />
                </label>

                <button
                  type="button"
                  onClick={saveDetail}
                  disabled={saving}
                  style={{ padding: '10px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                >
                  {saving ? 'Guardando...' : 'Guardar seguimiento'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
