import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

type PortalContext = {
  company: {
    display_name: string;
    profile_complete: boolean;
  };
  membership: {
    role: 'owner' | 'manager' | 'authorized';
    can_manage_company: boolean;
  };
};

type InviteSummary = {
  status: 'pending' | 'used' | 'expired' | 'revoked' | null;
  invite_email: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
} | null;

type Member = {
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
  invite: InviteSummary;
};

type ContractedService = {
  catalog_id: number;
  name: string;
  slug: string;
};

type PermissionRow = {
  catalog_id: number;
  company_service_id: number;
  slug: string;
  name: string;
  can_view: boolean;
};

type MemberForm = {
  member_user_id?: number;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'authorized';
  area: string;
  position_title: string;
  is_active: boolean;
};

const emptyMemberForm: MemberForm = {
  name: '',
  email: '',
  phone: '',
  role: 'authorized',
  area: '',
  position_title: '',
  is_active: true,
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

const roleLabels: Record<Member['role'], string> = {
  owner: 'Administrador cliente',
  manager: 'Gerente',
  authorized: 'Usuario autorizado',
};

export default function EmpresaUsersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<PortalContext | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [contractedServices, setContractedServices] = useState<ContractedService[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyMemberForm);
  const [permittedCatalogIds, setPermittedCatalogIds] = useState<number[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [contextRes, membersRes, servicesRes] = await Promise.all([
        fetch('/api/company_portal.php?action=portal_context', { credentials: 'include' }),
        fetch('/api/company_portal.php?action=list_company_members', { credentials: 'include' }),
        fetch('/api/company_portal.php?action=list_company_services', { credentials: 'include' }),
      ]);

      if (!contextRes.ok) {
        navigate('/');
        return;
      }

      const contextData = await contextRes.json();
      if (!contextData?.membership?.can_manage_company) {
        setContext(contextData);
        setMembers([]);
        setContractedServices([]);
        return;
      }

      const membersData = await membersRes.json();
      const servicesData = await servicesRes.json();

      setContext(contextData);
      setMembers(Array.isArray(membersData?.members) ? membersData.members : []);
      setContractedServices(
        Array.isArray(servicesData?.contracted_services)
          ? servicesData.contracted_services.map((service: any) => ({
              catalog_id: Number(service.catalog_id),
              name: String(service.name || ''),
              slug: String(service.slug || ''),
            }))
          : []
      );
    } catch {
      setToast('No fue posible cargar los usuarios autorizados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [navigate]);

  const ownerCount = useMemo(() => members.filter((member) => member.role === 'owner').length, [members]);
  const managerCount = useMemo(() => members.filter((member) => member.role === 'manager').length, [members]);
  const authorizedCount = useMemo(() => members.filter((member) => member.role === 'authorized').length, [members]);

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

  const openCreateModal = () => {
    setEditingMember(null);
    setForm(emptyMemberForm);
    setPermittedCatalogIds([]);
    setShowModal(true);
  };

  const openEditModal = async (member: Member) => {
    setEditingMember(member);
    setForm({
      member_user_id: member.member_user_id,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role === 'manager' ? 'manager' : 'authorized',
      area: member.area || '',
      position_title: member.position_title || '',
      is_active: member.is_active && member.user_is_active,
    });
    setPermittedCatalogIds([]);
    setShowModal(true);

    try {
      const res = await fetch(`/api/company_portal.php?action=get_company_member_permissions&member_user_id=${encodeURIComponent(member.member_user_id)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data?.permissions)) {
        setPermittedCatalogIds(
          data.permissions.filter((item: PermissionRow) => item.can_view).map((item: PermissionRow) => Number(item.catalog_id))
        );
      }
    } catch {
      // keep modal open with empty permissions if this request fails
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setForm(emptyMemberForm);
    setPermittedCatalogIds([]);
  };

  const togglePermission = (catalogId: number, checked: boolean) => {
    setPermittedCatalogIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, catalogId]));
      }
      return prev.filter((value) => value !== catalogId);
    });
  };

  const saveMember = async () => {
    const endpoint = editingMember ? 'update_company_member' : 'create_company_member';
    if (!form.name.trim() || !form.email.trim()) {
      setToast('Nombre y correo son obligatorios.');
      return;
    }
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch(`/api/company_portal.php?action=${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          member_user_id: form.member_user_id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          area: form.area,
          position_title: form.position_title,
          is_active: form.is_active,
          permitted_catalog_ids: permittedCatalogIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible guardar el usuario.');
      }
      setMembers(Array.isArray(data?.members) ? data.members : []);
      setToast(editingMember ? 'Usuario actualizado correctamente.' : 'Usuario creado y acceso enviado por correo.');
      closeModal();
    } catch (error: any) {
      setToast(error?.message || 'No fue posible guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const deactivateMember = async (member: Member) => {
    if (!window.confirm(`¿Deseas desactivar a ${member.name || member.email}?`)) return;
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=deactivate_company_member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ member_user_id: member.member_user_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible desactivar el usuario.');
      }
      setMembers(Array.isArray(data?.members) ? data.members : []);
      setToast('Usuario desactivado correctamente.');
    } catch (error: any) {
      setToast(error?.message || 'No fue posible desactivar el usuario.');
    }
  };

  const resendInvite = async (member: Member) => {
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=resend_company_member_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ member_user_id: member.member_user_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible reenviar la invitacion.');
      }
      setMembers(Array.isArray(data?.members) ? data.members : []);
      setToast('La invitacion se envio nuevamente al usuario.');
    } catch (error: any) {
      setToast(error?.message || 'No fue posible reenviar la invitacion.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, textAlign: 'center' }}>
          <p>Cargando...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ marginBottom: 16 }}>
            <button type="button" onClick={() => navigate('/empresa/dashboard')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              Volver al Portal Cliente
            </button>
          </div>

          {!context?.membership?.can_manage_company ? (
            <div style={{ padding: 18, borderRadius: 16, border: '1px solid #fde68a', background: '#fffbeb', color: '#92400e' }}>
              Este espacio solo esta disponible para el administrador cliente o para usuarios con rol gerente.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>Usuarios autorizados</h1>
                  <p style={{ margin: '6px 0 0', color: '#64748b', lineHeight: 1.7 }}>
                    Gestiona los accesos de tu equipo dentro del Portal Cliente de {context?.company?.display_name || 'tu empresa'}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateModal}
                  style={{ padding: '10px 16px', background: '#111827', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}
                >
                  Agregar usuario
                </button>
              </div>

              {toast ? (
                <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
                  {toast}
                </div>
              ) : null}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Administradores</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{ownerCount}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Gerentes</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{managerCount}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Usuarios autorizados</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{authorizedCount}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Servicios asignables</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{contractedServices.length}</div>
                </div>
              </div>

              <div style={{ padding: 16, borderRadius: 14, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', marginBottom: 20, lineHeight: 1.7 }}>
                Cada usuario autorizado puede ver solamente los servicios que le asignes. Si un usuario no tiene servicios asignados, su portal permanecera sin accesos visibles hasta que lo configures.
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Usuario</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Rol</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Area / Puesto</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Invitacion</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Ultima actualizacion</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => {
                      const inviteStatus = member.invite?.status || 'revoked';
                      const inviteColors = inviteStatusColors[inviteStatus] || inviteStatusColors.revoked;
                      return (
                        <tr key={member.membership_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: 12 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{member.name || '-'}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{member.email}</div>
                            <div style={{ marginTop: 6 }}>
                              <span style={{ padding: '4px 8px', borderRadius: 999, background: member.is_active && member.user_is_active ? '#dcfce7' : '#fee2e2', color: member.is_active && member.user_is_active ? '#166534' : '#991b1b', fontSize: 12, fontWeight: 700 }}>
                                {member.is_active && member.user_is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: 12 }}>{roleLabels[member.role] || member.role}</td>
                          <td style={{ padding: 12 }}>
                            {[member.area, member.position_title].filter(Boolean).join(' / ') || '-'}
                          </td>
                          <td style={{ padding: 12 }}>
                            <div>
                              <span style={{ padding: '4px 8px', borderRadius: 999, background: inviteColors.bg, color: inviteColors.text, fontSize: 12, fontWeight: 700 }}>
                                {inviteStatusLabels[inviteStatus] || 'Sin invitacion'}
                              </span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                              {member.invite ? formatDate(member.invite.created_at) : 'No enviada'}
                            </div>
                          </td>
                          <td style={{ padding: 12 }}>{formatDate(member.updated_at)}</td>
                          <td style={{ padding: 12 }}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {member.role !== 'owner' ? (
                                <>
                                  <button type="button" onClick={() => openEditModal(member)} style={{ padding: '8px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                                    Editar
                                  </button>
                                  <button type="button" onClick={() => resendInvite(member)} style={{ padding: '8px 12px', background: '#fff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                                    Reenviar acceso
                                  </button>
                                  <button type="button" onClick={() => deactivateMember(member)} style={{ padding: '8px 12px', background: '#fff', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                                    Desactivar
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: 12, color: '#64748b' }}>Cuenta principal del cliente</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      {showModal ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}>
          <div style={{ width: 'min(860px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 24px 60px rgba(15,23,42,0.28)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>{editingMember ? 'Editar usuario' : 'Nuevo usuario autorizado'}</h2>
                <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                  {editingMember ? 'Actualiza el rol, los datos y los servicios visibles para este usuario.' : 'Se enviara un acceso por correo al usuario para que active su ingreso al portal.'}
                </p>
              </div>
              <button type="button" onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#64748b' }}>x</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 18 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Nombre completo *</span>
                <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Correo de acceso *</span>
                <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Telefono</span>
                <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Rol</span>
                <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as 'manager' | 'authorized' }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
                  <option value="authorized">Usuario autorizado</option>
                  <option value="manager">Gerente</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Area</span>
                <input value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>Puesto</span>
                <input value={form.position_title} onChange={(event) => setForm((prev) => ({ ...prev, position_title: event.target.value }))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))} />
              <span>Usuario activo</span>
            </label>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 18 }}>Servicios visibles para este usuario</h3>
              {contractedServices.length === 0 ? (
                <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#64748b' }}>
                  Aun no hay servicios contratados activos para asignar.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
                  {contractedServices.map((service) => (
                    <label key={service.catalog_id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', background: '#f8fafc' }}>
                      <input
                        type="checkbox"
                        checked={permittedCatalogIds.includes(service.catalog_id)}
                        onChange={(event) => togglePermission(service.catalog_id, event.target.checked)}
                        style={{ marginTop: 4 }}
                      />
                      <span>
                        <strong style={{ display: 'block', marginBottom: 4 }}>{service.name}</strong>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{service.slug}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={closeModal} style={{ padding: '10px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button type="button" onClick={saveMember} disabled={saving} style={{ padding: '10px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {saving ? 'Guardando...' : editingMember ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
