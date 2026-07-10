import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

const API = '/api';

type PortalContext = {
  current_user: {
    id: number;
    email: string;
    name: string;
    account_type: string;
    is_profile_complete: boolean;
    is_active: boolean;
  };
  company: {
    company_user_id: number;
    display_name: string;
    has_profile: boolean;
    profile_complete: boolean;
  };
  membership: {
    member_user_id: number;
    role: 'owner' | 'manager' | 'authorized';
    can_manage_company: boolean;
    area: string | null;
    position_title: string | null;
  };
  counts: {
    contracted_services: number;
    available_services: number;
  };
};

type StudyMetrics = {
  total_studies: number;
  open_studies: number;
  concluded_studies: number;
  cancelled_studies: number;
  service_status: 'pendiente' | 'en_proceso' | 'disponible' | 'completado';
};

type CompanyService = {
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
  study_metrics?: StudyMetrics;
};

const PORTAL_STATUS_LABELS: Record<CompanyService['status'], string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  disponible: 'Disponible',
  completado: 'Completado',
};

const PORTAL_STATUS_COLORS: Record<CompanyService['status'], { bg: string; text: string }> = {
  pendiente: { bg: '#f3f4f6', text: '#374151' },
  en_proceso: { bg: '#dbeafe', text: '#1d4ed8' },
  disponible: { bg: '#fef3c7', text: '#b45309' },
  completado: { bg: '#dcfce7', text: '#166534' },
};

function roleLabel(role: PortalContext['membership']['role']): string {
  if (role === 'owner') return 'Administrador cliente';
  if (role === 'manager') return 'Gerente';
  return 'Usuario autorizado';
}

export default function EmpresaDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<PortalContext | null>(null);
  const [contractedServices, setContractedServices] = useState<CompanyService[]>([]);
  const [availableServices, setAvailableServices] = useState<CompanyService[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [contextRes, servicesRes] = await Promise.all([
          fetch(`${API}/company_portal.php?action=portal_context`, { credentials: 'include' }),
          fetch(`${API}/company_portal.php?action=list_company_services`, { credentials: 'include' }),
        ]);

        if (!contextRes.ok || !servicesRes.ok) {
          navigate('/');
          return;
        }

        const contextData = await contextRes.json();
        const serviceData = await servicesRes.json();

        setContext(contextData);
        setContractedServices(Array.isArray(serviceData?.contracted_services) ? serviceData.contracted_services : []);
        setAvailableServices(Array.isArray(serviceData?.available_services) ? serviceData.available_services : []);
      } catch {
        setError('No fue posible cargar el Portal Cliente en este momento.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const profileLabel = useMemo(() => {
    if (!context) return 'Pendiente';
    return context.company.profile_complete ? 'Completo' : 'Incompleto';
  }, [context]);

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

  if (!context) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48 }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ padding: 20, borderRadius: 16, border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b' }}>
              {error || 'No fue posible cargar el Portal Cliente.'}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          {!context.company.profile_complete && (
            <div
              style={{
                marginBottom: 24,
                padding: 16,
                background: '#fef9c3',
                border: '1px solid #facc15',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span>Completa el perfil de tu empresa para habilitar todas las funciones del portal.</span>
              <Link
                to="/empresa/onboarding"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 14px',
                  background: '#f59e0b',
                  color: '#111827',
                  fontWeight: 800,
                  textDecoration: 'none',
                  borderRadius: 10,
                  border: '1px solid #d97706',
                }}
              >
                Completar perfil
              </Link>
            </div>
          )}

          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>Portal Cliente</h1>
              <span style={{ padding: '6px 12px', borderRadius: 999, background: '#e0f2fe', color: '#0f766e', fontSize: 13, fontWeight: 700 }}>
                {roleLabel(context.membership.role)}
              </span>
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.15rem', color: '#1e293b' }}>{context.company.display_name}</h2>
            <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>
              Desde aqui podras revisar los servicios contratados de tu empresa y visualizar los servicios disponibles para futuras solicitudes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 28 }}>
            <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Servicios contratados</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{context.counts.contracted_services}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Servicios disponibles</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{context.counts.available_services}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Perfil de empresa</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: context.company.profile_complete ? '#166534' : '#b45309' }}>{profileLabel}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Tipo de acceso</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{roleLabel(context.membership.role)}</div>
            </div>
          </div>

          {context.membership.can_manage_company ? (
            <section style={{ marginBottom: 28 }}>
              <div style={{ padding: 18, borderRadius: 18, border: '1px solid #e5e7eb', background: '#fff', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#0f172a' }}>Usuarios autorizados</h3>
                  <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>
                    Crea accesos para tu equipo y define que servicios puede consultar cada persona dentro del portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/empresa/users')}
                  style={{
                    background: '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Administrar usuarios
                </button>
              </div>
            </section>
          ) : null}

          {error ? (
            <div style={{ marginBottom: 20, padding: 16, borderRadius: 14, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
              {error}
            </div>
          ) : null}

          <section style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Servicios contratados</h3>
                <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                  Servicios habilitados actualmente para tu empresa.
                </p>
              </div>
            </div>

            {contractedServices.length === 0 ? (
              <div style={{ padding: 18, borderRadius: 16, border: '1px solid #e5e7eb', background: '#fff', color: '#64748b' }}>
                Aun no hay servicios activos para esta cuenta.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {contractedServices.map((service) => {
                  const statusStyle = PORTAL_STATUS_COLORS[service.status] || PORTAL_STATUS_COLORS.pendiente;
                  const isStudies = service.slug === 'estudios-socioeconomicos';
                  return (
                    <article key={service.slug} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, display: 'grid', gap: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>{service.name}</h4>
                          <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>{service.short_description}</p>
                        </div>
                        <span style={{ padding: '6px 10px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.text, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {PORTAL_STATUS_LABELS[service.status] || service.status}
                        </span>
                      </div>

                      {isStudies && service.study_metrics ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                          <div style={{ padding: 12, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <div style={{ fontSize: 12, color: '#1d4ed8', marginBottom: 6 }}>Estudios activos</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{service.study_metrics.open_studies}</div>
                          </div>
                          <div style={{ padding: 12, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: 12, color: '#166534', marginBottom: 6 }}>Concluidos</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{service.study_metrics.concluded_studies}</div>
                          </div>
                          <div style={{ padding: 12, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                            <div style={{ fontSize: 12, color: '#c2410c', marginBottom: 6 }}>Cancelados</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{service.study_metrics.cancelled_studies}</div>
                          </div>
                        </div>
                      ) : null}

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {service.service_type === 'module_link' && service.module_route ? (
                          <button
                            type="button"
                            onClick={() => navigate(service.module_route || '/empresa/services/estudios')}
                            style={{
                              background: '#111827',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 10,
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            Ingresar al sistema
                          </button>
                        ) : service.service_type === 'workspace' ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/empresa/services/${service.slug}`)}
                            style={{
                              background: '#111827',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 10,
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            Abrir espacio documental
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            style={{
                              background: '#e5e7eb',
                              color: '#6b7280',
                              border: 'none',
                              borderRadius: 10,
                              padding: '10px 14px',
                              cursor: 'not-allowed',
                              fontWeight: 700,
                            }}
                          >
                            Espacio en preparacion
                          </button>
                        )}
                        {service.notes ? (
                          <span style={{ alignSelf: 'center', fontSize: 13, color: '#64748b' }}>{service.notes}</span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Servicios disponibles para contratar</h3>
              <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                Estos servicios aun no estan activos para tu empresa y podran conectarse al futuro flujo de solicitud comercial del portal.
              </p>
            </div>

            {availableServices.length === 0 ? (
              <div style={{ padding: 18, borderRadius: 16, border: '1px solid #e5e7eb', background: '#fff', color: '#64748b' }}>
                No hay servicios adicionales visibles en este momento.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {availableServices.map((service) => (
                  <article key={service.slug} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, display: 'grid', gap: 14 }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>{service.name}</h4>
                      <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>{service.short_description}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ padding: '6px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 700 }}>
                        Disponible
                      </span>
                      <button
                        type="button"
                        disabled
                        style={{
                          background: '#e5e7eb',
                          color: '#6b7280',
                          border: 'none',
                          borderRadius: 10,
                          padding: '10px 14px',
                          cursor: 'not-allowed',
                          fontWeight: 700,
                        }}
                      >
                        Solicitud proxima etapa
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
