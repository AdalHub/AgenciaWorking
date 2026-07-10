import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyProfileForm from '../components/Company/CompanyProfileForm';
import type { CompanyProfileData } from '../components/Company/CompanyProfileForm';
import { getErrorMessage } from '../lib/getErrorMessage';

type ClientInvite = {
  status: 'pending' | 'used' | 'expired' | 'revoked' | null;
  invite_email: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
} | null;

type ClientMember = {
  membership_id: number;
  member_user_id: number;
  role: 'owner' | 'manager' | 'authorized';
  area: string | null;
  position_title: string | null;
  is_active: boolean;
  user_is_active: boolean;
  email: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

type ClientService = {
  catalog_id: number;
  company_service_id: number | null;
  slug: string;
  name: string;
  short_description: string;
  service_type: 'workspace' | 'module_link';
  module_route: string | null;
  public_service_slug: string | null;
  sort_order: number;
  status: 'pendiente' | 'en_proceso' | 'disponible' | 'completado';
  enabled_at: string | null;
  completed_at: string | null;
  notes: string | null;
  is_contracted: boolean;
};

type ClientDetail = {
  company_user_id: number;
  display_name: string;
  access_email: string;
  company_name: string;
  is_active: boolean;
  profile_complete: boolean;
  profile: CompanyProfileData | null;
  invite: ClientInvite;
  services: {
    contracted: ClientService[];
    available: ClientService[];
    all: ClientService[];
  };
  members: ClientMember[];
};

type ServiceDraft = {
  catalog_id: number;
  enabled: boolean;
  status: ClientService['status'];
  notes: string;
};

const statusLabels: Record<ClientService['status'], string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  disponible: 'Disponible',
  completado: 'Completado',
};

const inviteStatusLabels: Record<string, string> = {
  pending: 'Invitacion pendiente',
  used: 'Acceso activado',
  expired: 'Invitacion vencida',
  revoked: 'Invitacion revocada',
};

const roleLabels: Record<ClientMember['role'], string> = {
  owner: 'Administrador cliente',
  manager: 'Gerente',
  authorized: 'Usuario autorizado',
};

export default function AdminClientDetailPage() {
  const navigate = useNavigate();
  const { companyUserId } = useParams();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingServices, setSavingServices] = useState(false);
  const [resendingInvite, setResendingInvite] = useState(false);
  const [accessEmail, setAccessEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [serviceDrafts, setServiceDrafts] = useState<Record<number, ServiceDraft>>({});

  const load = useCallback(async () => {
    if (!companyUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/company_portal.php?action=get_client&company_user_id=${encodeURIComponent(companyUserId)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data?.client) {
        throw new Error(data?.error || 'No fue posible cargar el cliente.');
      }
      const detail = data.client as ClientDetail;
      setClient(detail);
      setAccessEmail(detail.access_email || '');
      setCompanyName(detail.company_name || detail.display_name || '');
      setIsActive(detail.is_active);
      const nextDrafts: Record<number, ServiceDraft> = {};
      (detail.services.all || []).forEach((service) => {
        nextDrafts[service.catalog_id] = {
          catalog_id: service.catalog_id,
          enabled: !!service.is_contracted,
          status: service.status || 'pendiente',
          notes: service.notes || '',
        };
      });
      setServiceDrafts(nextDrafts);
    } catch (error: unknown) {
      setToast(getErrorMessage(error, 'No fue posible cargar el cliente.'));
    } finally {
      setLoading(false);
    }
  }, [companyUserId]);

  useEffect(() => {
    load();
  }, [load]);

  const serviceRows = useMemo(() => client?.services.all || [], [client]);

  const formatDate = (value: string | null | undefined) => {
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
  };

  const saveProfile = async (profileData: CompanyProfileData) => {
    if (!client) return;
    setSavingProfile(true);
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=update_client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_user_id: client.company_user_id,
          company_name: companyName,
          access_email: accessEmail,
          is_active: isActive,
          ...profileData,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.client) {
        throw new Error(data?.error || 'No fue posible guardar el cliente.');
      }
      setClient(data.client);
      setToast('Datos del cliente actualizados.');
    } catch (error: unknown) {
      setToast(getErrorMessage(error, 'No fue posible guardar el cliente.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const saveServices = async () => {
    if (!client) return;
    setSavingServices(true);
    setToast(null);
    try {
      const payload = Object.values(serviceDrafts).map((draft) => ({
        catalog_id: draft.catalog_id,
        enabled: draft.enabled,
        status: draft.status,
        notes: draft.notes,
      }));
      const res = await fetch('/api/company_portal.php?action=save_client_services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_user_id: client.company_user_id,
          services: payload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.client) {
        throw new Error(data?.error || 'No fue posible guardar los servicios.');
      }
      setClient(data.client);
      const nextDrafts: Record<number, ServiceDraft> = {};
      (data.client.services.all || []).forEach((service: ClientService) => {
        nextDrafts[service.catalog_id] = {
          catalog_id: service.catalog_id,
          enabled: !!service.is_contracted,
          status: service.status || 'pendiente',
          notes: service.notes || '',
        };
      });
      setServiceDrafts(nextDrafts);
      setToast('Servicios del cliente actualizados.');
    } catch (error: unknown) {
      setToast(getErrorMessage(error, 'No fue posible guardar los servicios.'));
    } finally {
      setSavingServices(false);
    }
  };

  const resendInvite = async () => {
    if (!client) return;
    setResendingInvite(true);
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=resend_client_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_user_id: client.company_user_id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.client) {
        throw new Error(data?.error || 'No fue posible reenviar la invitacion.');
      }
      setClient(data.client);
      setToast('La invitacion fue reenviada al correo principal de acceso.');
    } catch (error: unknown) {
      setToast(getErrorMessage(error, 'No fue posible reenviar la invitacion.'));
    } finally {
      setResendingInvite(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Cargando...</div>;
  }

  if (!client) {
    return (
      <div style={{ padding: 24 }}>
        <button type="button" onClick={() => navigate('/admin/clients')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>
          Volver a clientes
        </button>
        <div style={{ padding: 16, borderRadius: 12, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
          No fue posible cargar la informacion del cliente.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1160, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 18 }}>
        <button type="button" onClick={() => navigate('/admin/clients')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
          Volver a clientes
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{client.display_name}</h1>
          <p style={{ margin: '6px 0 0', color: '#64748b' }}>
            Administra el acceso principal, el perfil de empresa y los servicios habilitados para este cliente.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ padding: '8px 12px', borderRadius: 999, background: client.is_active ? '#dcfce7' : '#fee2e2', color: client.is_active ? '#166534' : '#991b1b', fontSize: 13, fontWeight: 700 }}>
            {client.is_active ? 'Cuenta activa' : 'Cuenta inactiva'}
          </span>
          <span style={{ padding: '8px 12px', borderRadius: 999, background: client.profile_complete ? '#dcfce7' : '#fef3c7', color: client.profile_complete ? '#166534' : '#b45309', fontSize: 13, fontWeight: 700 }}>
            {client.profile_complete ? 'Perfil completo' : 'Perfil pendiente'}
          </span>
        </div>
      </div>

      {toast ? (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
          {toast}
        </div>
      ) : null}

      <section style={{ marginBottom: 20, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 20 }}>Acceso principal e invitacion</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Nombre interno de empresa</span>
            <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Correo principal de acceso</span>
            <input type="email" value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            <span>Cuenta activa</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              {client.invite?.status ? inviteStatusLabels[client.invite.status] || 'Sin invitacion' : 'Sin invitacion registrada'}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Ultimo envio: {client.invite ? formatDate(client.invite.created_at) : 'No enviado'}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Vence: {client.invite ? formatDate(client.invite.expires_at) : '-'}
            </div>
          </div>
          <button
            type="button"
            onClick={resendInvite}
            disabled={resendingInvite}
            style={{ padding: '10px 16px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, cursor: resendingInvite ? 'not-allowed' : 'pointer', fontWeight: 700 }}
          >
            {resendingInvite ? 'Enviando...' : 'Reenviar invitacion'}
          </button>
        </div>
      </section>

      <section style={{ marginBottom: 20, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 20 }}>Perfil de empresa</h2>
        <p style={{ margin: '0 0 16px', color: '#64748b' }}>
          Los datos de acceso de arriba tambien se guardan al actualizar el perfil.
        </p>
        <CompanyProfileForm
          initialData={client.profile || undefined}
          onSave={saveProfile}
          onCancel={() => navigate('/admin/clients')}
          cancelLabel="Volver"
          saveLabel={savingProfile ? 'Guardando...' : 'Guardar cliente'}
          stickyBar={false}
        />
      </section>

      <section style={{ marginBottom: 20, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Servicios contratados y disponibles</h2>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>
              Working puede activar o pausar servicios para este cliente sin tocar el modulo existente de estudios.
            </p>
          </div>
          <button
            type="button"
            onClick={saveServices}
            disabled={savingServices}
            style={{ padding: '10px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: savingServices ? 'not-allowed' : 'pointer', fontWeight: 700 }}
          >
            {savingServices ? 'Guardando...' : 'Guardar servicios'}
          </button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Servicio</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Activo</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Estatus</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Notas</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Workspace</th>
              </tr>
            </thead>
            <tbody>
              {serviceRows.map((service) => {
                const draft = serviceDrafts[service.catalog_id] || {
                  catalog_id: service.catalog_id,
                  enabled: !!service.is_contracted,
                  status: service.status,
                  notes: service.notes || '',
                };
                return (
                  <tr key={service.catalog_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{service.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{service.short_description}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <input
                        type="checkbox"
                        checked={draft.enabled}
                        onChange={(event) =>
                          setServiceDrafts((prev) => ({
                            ...prev,
                            [service.catalog_id]: {
                              ...draft,
                              enabled: event.target.checked,
                            },
                          }))
                        }
                      />
                    </td>
                    <td style={{ padding: 12 }}>
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setServiceDrafts((prev) => ({
                            ...prev,
                            [service.catalog_id]: {
                              ...draft,
                              status: event.target.value as ClientService['status'],
                            },
                          }))
                        }
                        style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db' }}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: 12 }}>
                      <input
                        value={draft.notes}
                        onChange={(event) =>
                          setServiceDrafts((prev) => ({
                            ...prev,
                            [service.catalog_id]: {
                              ...draft,
                              notes: event.target.value,
                            },
                          }))
                        }
                        placeholder="Notas internas del servicio"
                        style={{ width: '100%', minWidth: 220, padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db' }}
                      />
                    </td>
                    <td style={{ padding: 12 }}>
                      {service.is_contracted && service.company_service_id && service.service_type === 'workspace' ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/clients/${client.company_user_id}/services/${service.slug}`)}
                          style={{
                            padding: '8px 12px',
                            background: '#111827',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Administrar
                        </button>
                      ) : service.service_type === 'module_link' ? (
                        <span style={{ fontSize: 12, color: '#64748b' }}>Se gestiona desde su modulo</span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#64748b' }}>Activa el servicio para abrirlo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 20 }}>Usuarios vinculados</h2>
        <p style={{ margin: '0 0 16px', color: '#64748b' }}>
          Esta primera fase solo muestra los usuarios ya ligados a la empresa. La gestion completa de usuarios autorizados sera la siguiente etapa del backlog.
        </p>
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Correo</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Rol</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Area / Puesto</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {client.members.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                    No hay usuarios vinculados todavia.
                  </td>
                </tr>
              ) : client.members.map((member) => (
                <tr key={member.membership_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700 }}>{member.name || '-'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{member.phone || '-'}</div>
                  </td>
                  <td style={{ padding: 12 }}>{member.email}</td>
                  <td style={{ padding: 12 }}>{roleLabels[member.role] || member.role}</td>
                  <td style={{ padding: 12 }}>
                    {[member.area, member.position_title].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td style={{ padding: 12 }}>{formatDate(member.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
