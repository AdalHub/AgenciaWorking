import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type InviteSummary = {
  status: 'pending' | 'used' | 'expired' | 'revoked' | null;
  invite_email: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
} | null;

type ClientRow = {
  company_user_id: number;
  display_name: string;
  access_email: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notification_email: string;
  is_active: boolean;
  profile_complete: boolean;
  member_count: number;
  active_service_count: number;
  invite: InviteSummary;
};

type ServiceCatalogItem = {
  catalog_id: number;
  slug: string;
  name: string;
  short_description: string;
};

const inviteStatusLabels: Record<string, string> = {
  pending: 'Invitacion pendiente',
  used: 'Acceso activado',
  expired: 'Invitacion vencida',
  revoked: 'Invitacion revocada',
};

const inviteStatusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#b45309' },
  used: { bg: '#dcfce7', text: '#166534' },
  expired: { bg: '#fee2e2', text: '#991b1b' },
  revoked: { bg: '#f3f4f6', text: '#374151' },
};

type NewClientForm = {
  company_name: string;
  access_email: string;
  legal_name: string;
  trade_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notification_email: string;
};

const emptyNewClientForm: NewClientForm = {
  company_name: '',
  access_email: '',
  legal_name: '',
  trade_name: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  notification_email: '',
};

export default function AdminClientsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceCatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState<NewClientForm>(emptyNewClientForm);
  const [selectedServices, setSelectedServices] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [clientsRes, catalogRes] = await Promise.all([
        fetch('/api/company_portal.php?action=list_clients', { credentials: 'include' }),
        fetch('/api/company_portal.php?action=list_service_catalog', { credentials: 'include' }),
      ]);
      const clientsData = await clientsRes.json();
      const catalogData = await catalogRes.json();
      setClients(Array.isArray(clientsData?.clients) ? clientsData.clients : []);
      setServiceCatalog(Array.isArray(catalogData?.services) ? catalogData.services : []);
    } catch {
      setToast('No fue posible cargar los clientes del portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) =>
      [client.display_name, client.access_email, client.contact_name, client.contact_email]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [clients, search]);

  const serviceSelections = useMemo(
    () => serviceCatalog.filter((service) => selectedServices[service.catalog_id]),
    [serviceCatalog, selectedServices]
  );

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

  const createClient = async () => {
    if (!newClient.company_name.trim() || !newClient.access_email.trim()) {
      setToast('Empresa y correo principal de acceso son obligatorios.');
      return;
    }
    setSaving(true);
    setToast(null);
    try {
      const services = serviceCatalog
        .filter((service) => selectedServices[service.catalog_id])
        .map((service) => ({
          catalog_id: service.catalog_id,
          enabled: true,
          status: 'pendiente',
        }));

      const res = await fetch('/api/company_portal.php?action=create_client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newClient,
          services,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible crear el cliente.');
      }

      setShowNewClient(false);
      setNewClient(emptyNewClientForm);
      setSelectedServices({});
      setToast('Cliente creado. Se emitio el acceso de activacion por correo.');
      await load();
      if (data?.company_user_id) {
        navigate(`/admin/clients/${data.company_user_id}`);
      }
    } catch (error: any) {
      setToast(error?.message || 'No fue posible crear el cliente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1240, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Clientes del Portal</h1>
          <p style={{ margin: '6px 0 0', color: '#64748b' }}>
            Alta manual de empresas, seguimiento de activacion y gestion inicial de servicios contratados.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewClient(true)}
          style={{ padding: '10px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
        >
          Nuevo cliente
        </button>
      </div>

      {toast ? (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
          {toast}
        </div>
      ) : null}

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por empresa, correo o contacto"
          style={{ width: '100%', maxWidth: 420, padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}
        />
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Empresa</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Acceso principal</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Contacto</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Perfil</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Servicios</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Usuarios</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Invitacion</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>Cargando...</td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No hay clientes registrados todavia.</td>
              </tr>
            ) : filteredClients.map((client) => {
              const inviteStatus = client.invite?.status || 'revoked';
              const inviteColors = inviteStatusColors[inviteStatus] || inviteStatusColors.revoked;
              return (
                <tr key={client.company_user_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{client.display_name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>ID empresa: {client.company_user_id}</div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ padding: '4px 8px', borderRadius: 999, background: client.is_active ? '#dcfce7' : '#fee2e2', color: client.is_active ? '#166534' : '#991b1b', fontSize: 12, fontWeight: 700 }}>
                        {client.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>{client.access_email}</td>
                  <td style={{ padding: 12 }}>
                    <div>{client.contact_name || '-'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{client.contact_email || client.contact_phone || '-'}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{ padding: '4px 8px', borderRadius: 999, background: client.profile_complete ? '#dcfce7' : '#fef3c7', color: client.profile_complete ? '#166534' : '#b45309', fontSize: 12, fontWeight: 700 }}>
                      {client.profile_complete ? 'Completo' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{client.active_service_count}</td>
                  <td style={{ padding: 12 }}>{client.member_count}</td>
                  <td style={{ padding: 12 }}>
                    <div>
                      <span style={{ padding: '4px 8px', borderRadius: 999, background: inviteColors.bg, color: inviteColors.text, fontSize: 12, fontWeight: 700 }}>
                        {inviteStatusLabels[inviteStatus] || 'Sin invitacion'}
                      </span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                      {client.invite ? formatDate(client.invite.created_at) : 'No enviada'}
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/clients/${client.company_user_id}`)}
                      style={{ padding: '8px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showNewClient ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}>
          <div style={{ width: 'min(860px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 24px 60px rgba(15,23,42,0.28)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>Nuevo cliente del portal</h2>
                <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                  Se creara la cuenta empresa y se enviara el acceso de activacion al correo principal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewClient(false);
                  setNewClient(emptyNewClientForm);
                  setSelectedServices({});
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#64748b' }}
              >
                x
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 18 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Nombre de empresa *</span>
                <input value={newClient.company_name} onChange={(event) => setNewClient((prev) => ({ ...prev, company_name: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Correo principal de acceso *</span>
                <input type="email" value={newClient.access_email} onChange={(event) => setNewClient((prev) => ({ ...prev, access_email: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Razon social</span>
                <input value={newClient.legal_name} onChange={(event) => setNewClient((prev) => ({ ...prev, legal_name: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Nombre comercial</span>
                <input value={newClient.trade_name} onChange={(event) => setNewClient((prev) => ({ ...prev, trade_name: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Contacto principal</span>
                <input value={newClient.contact_name} onChange={(event) => setNewClient((prev) => ({ ...prev, contact_name: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Correo de contacto</span>
                <input type="email" value={newClient.contact_email} onChange={(event) => setNewClient((prev) => ({ ...prev, contact_email: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Telefono de contacto</span>
                <input value={newClient.contact_phone} onChange={(event) => setNewClient((prev) => ({ ...prev, contact_phone: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Correo de notificaciones</span>
                <input type="email" value={newClient.notification_email} onChange={(event) => setNewClient((prev) => ({ ...prev, notification_email: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
            </div>

            <div style={{ marginBottom: 18 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 18 }}>Servicios a habilitar desde el inicio</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                {serviceCatalog.map((service) => (
                  <label key={service.catalog_id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', background: '#f8fafc' }}>
                    <input
                      type="checkbox"
                      checked={!!selectedServices[service.catalog_id]}
                      onChange={(event) => setSelectedServices((prev) => ({ ...prev, [service.catalog_id]: event.target.checked }))}
                      style={{ marginTop: 4 }}
                    />
                    <span>
                      <strong style={{ display: 'block', marginBottom: 4 }}>{service.name}</strong>
                      <span style={{ color: '#64748b', fontSize: 13 }}>{service.short_description}</span>
                    </span>
                  </label>
                ))}
              </div>
              {serviceSelections.length > 0 ? (
                <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 13 }}>
                  Se activaran {serviceSelections.length} servicio(s) en estatus pendiente.
                </p>
              ) : null}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setShowNewClient(false);
                  setNewClient(emptyNewClientForm);
                  setSelectedServices({});
                }}
                style={{ padding: '10px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={createClient}
                disabled={saving}
                style={{ padding: '10px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}
              >
                {saving ? 'Creando...' : 'Crear cliente'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
