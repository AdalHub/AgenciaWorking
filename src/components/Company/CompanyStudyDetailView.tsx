import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api';
const FETCH_OPTIONS = { credentials: 'include' as RequestCredentials };
const CLIENT_PROGRESS_TEXT = 'Proceso de verificación en curso';
const CLIENT_INFO_TEXT =
  'Detalle del estudio: El candidato ha completado la información requerida. Actualmente, el estudio se encuentra en proceso de revisión y validación por parte de nuestro equipo.';

type Study = {
  id: number;
  company_name: string;
  status: string;
};

type Invitation = {
  id: number;
  candidate_name?: string;
  candidate_email?: string;
  status: string;
  completed_at?: string;
};

type ProgressState = 'completed' | 'current' | 'upcoming';

type ProgressStep = {
  title: string;
  subtitle: string;
  state: ProgressState;
};

type Props = {
  studyId: number;
  token?: string | null;
  backLink?: ReactNode;
  isMagicLink?: boolean;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return String(value);
  }
}

function getGeneralClientStatus(study: Study, invitations: Invitation[]) {
  if (study.status === 'concluido') {
    return { label: 'Informe disponible', bg: '#dcfce7', text: '#166534' };
  }
  if (study.status === 'cancelado') {
    return { label: 'Estudio cancelado', bg: '#fee2e2', text: '#991b1b' };
  }
  if (invitations.some((inv) => inv.status === 'completed') || study.status === 'en_proceso' || study.status === 'en_validacion') {
    return { label: CLIENT_PROGRESS_TEXT, bg: '#fef3c7', text: '#b45309' };
  }
  return { label: 'Registro del candidato', bg: '#e5e7eb', text: '#475569' };
}

function getCurrentProgressStep(studyStatus: string, invitationStatus?: string): number {
  if (studyStatus === 'concluido') return 3;
  if (invitationStatus !== 'completed') return 0;
  if (studyStatus === 'en_validacion') return 2;
  return 1;
}

function getProgressSteps(studyStatus: string, invitationStatus?: string): ProgressStep[] {
  const current = getCurrentProgressStep(studyStatus, invitationStatus);
  const baseSteps = [
    {
      title: 'Registro del candidato',
      subtitle: current > 0 ? 'Completado' : current === 0 ? 'Etapa actual' : 'Pendiente',
    },
    {
      title: 'Revisión de información',
      subtitle: current > 1 ? 'Completado' : current === 1 ? 'En curso' : 'Etapa siguiente',
    },
    {
      title: 'Validación interna',
      subtitle: current > 2 ? 'Completado' : current === 2 ? 'En curso' : 'Etapa siguiente',
    },
    {
      title: 'Informe disponible',
      subtitle: current === 3 ? 'Disponible' : 'Se mostrará al concluir',
    },
  ];

  return baseSteps.map((step, index) => ({
    ...step,
    state: index < current ? 'completed' : index === current ? 'current' : 'upcoming',
  }));
}

function getCandidateStatusPills(studyStatus: string, invitation: Invitation) {
  if (invitation.status === 'completed') {
    return [
      { label: 'Captura completada', bg: '#dcfce7', text: '#166534' },
      studyStatus === 'concluido'
        ? { label: 'Informe disponible', bg: '#dbeafe', text: '#1d4ed8' }
        : { label: CLIENT_PROGRESS_TEXT, bg: '#fef3c7', text: '#b45309' },
    ];
  }

  if (invitation.status === 'in_progress') {
    return [{ label: 'Registro del candidato', bg: '#dbeafe', text: '#1d4ed8' }];
  }

  return [{ label: 'Registro del candidato', bg: '#e5e7eb', text: '#475569' }];
}

function ProgressMarker({ state }: { state: ProgressState }) {
  const borderColor = state === 'completed' ? '#16a34a' : state === 'current' ? '#60a5fa' : '#d1d5db';
  const background = state === 'completed' ? '#16a34a' : state === 'current' ? '#2563eb' : '#ffffff';

  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: `2px solid ${borderColor}`,
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 900,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {state === 'completed' ? '✓' : state === 'current' ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff', display: 'block' }} /> : null}
    </div>
  );
}

export default function CompanyStudyDetailView({ studyId, token, backLink }: Props) {
  const navigate = useNavigate();
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';

  const [study, setStudy] = useState<Study | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);
  const [finalPdfAvailable, setFinalPdfAvailable] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!studyId) return;
    setLoading(true);

    Promise.all([
      fetch(`${API}/studies.php?action=get_study&id=${studyId}${tokenParam}`, FETCH_OPTIONS).then((r) => r.json()),
      fetch(`${API}/studies.php?action=list_invitations&study_id=${studyId}${tokenParam}`, FETCH_OPTIONS).then((r) => r.json()),
    ])
      .then(([studyRes, invRes]) => {
        if (studyRes?.error) {
          if (!token) navigate('/empresa/dashboard');
          return;
        }

        const nextInvitations = Array.isArray(invRes?.invitations) ? invRes.invitations : [];
        setStudy(studyRes);
        setInvitations(nextInvitations);

        if (nextInvitations.length > 0) {
          const firstCompleted = nextInvitations.find((inv: Invitation) => inv.status === 'completed');
          setSelectedInvId((prev) => prev ?? firstCompleted?.id ?? nextInvitations[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, studyId, token, tokenParam]);

  useEffect(() => {
    if (!studyId || !study || study.status !== 'concluido') {
      setFinalPdfAvailable(false);
      return;
    }

    fetch(`${API}/studies.php?action=pdf_status_study&study_id=${studyId}${tokenParam}`, FETCH_OPTIONS)
      .then((r) => r.json())
      .then((data) => setFinalPdfAvailable(Boolean(data?.available)))
      .catch(() => setFinalPdfAvailable(false));
  }, [study, studyId, tokenParam]);

  const selectedInv = useMemo(() => invitations.find((inv) => inv.id === selectedInvId) ?? null, [invitations, selectedInvId]);
  const completedCount = invitations.filter((inv) => inv.status === 'completed').length;
  const totalCount = invitations.length;
  const generalStatus = study ? getGeneralClientStatus(study, invitations) : { label: 'Registro del candidato', bg: '#e5e7eb', text: '#475569' };
  const selectedProgressSteps = selectedInv ? getProgressSteps(study?.status ?? '', selectedInv.status) : [];
  const selectedCandidatePills = selectedInv ? getCandidateStatusPills(study?.status ?? '', selectedInv) : [];

  const handleDownloadInformeCandidato = () => {
    if (!selectedInvId || selectedInv?.status !== 'completed') return;

    const url = `${API}/studies.php?action=download_pdf&invitation_id=${selectedInvId}&_ts=${Date.now()}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    fetch(url, { ...FETCH_OPTIONS, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setToast(data?.error || 'No disponible');
          return;
        }

        const blob = await response.blob();
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `informe-cliente-${selectedInvId}-${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(href);
      })
      .catch(() => setToast('No disponible'));
  };

  const handleDownloadInformeEstudio = () => {
    const completedInvitations = invitations.filter((inv) => inv.status === 'completed');
    if (completedInvitations.length === 0) {
      setToast('No hay colaboradores completados para descargar.');
      return;
    }

    setToast(`Descargando ${completedInvitations.length} PDF${completedInvitations.length === 1 ? '' : 's'} por colaborador.`);
    completedInvitations.forEach((inv, index) => {
      window.setTimeout(() => {
        const link = document.createElement('a');
        link.href = `${API}/studies.php?action=download_pdf&invitation_id=${inv.id}&_ts=${Date.now()}-${index}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
        link.download = `informe-cliente-${inv.id}-${Date.now()}-${index}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 250);
    });
  };

  if (loading || !study) {
    return (
      <main style={{ minHeight: '60vh', padding: 24, textAlign: 'center' }}>
        <p>Cargando...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '65vh', paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
        {backLink != null ? <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>{backLink}</div> : null}

        <div style={{ marginBottom: 18, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: 32, fontWeight: 800 }}>
            {study.company_name} · Estudio Socioeconómico
          </h2>
          <span style={{ padding: '6px 12px', borderRadius: 999, background: generalStatus.bg, color: generalStatus.text, fontSize: 13, fontWeight: 700 }}>
            {generalStatus.label}
          </span>
          {study.status === 'concluido' ? (
            finalPdfAvailable ? (
              <button
                type="button"
                onClick={handleDownloadInformeEstudio}
                style={{
                  padding: '8px 16px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Descargar informe final
              </button>
            ) : (
              <span style={{ padding: '8px 12px', background: '#fef3c7', color: '#92400e', borderRadius: 8, fontSize: 13 }}>
                El informe final estará disponible al concluir el estudio
              </span>
            )
          ) : null}
        </div>

        <div
          style={{
            padding: 16,
            background: '#eff6ff',
            borderRadius: 12,
            marginBottom: 18,
            border: '1px solid #93c5fd',
            color: '#1e3a5f',
            lineHeight: 1.6,
          }}
        >
          <strong>Detalle del estudio:</strong> {CLIENT_INFO_TEXT.replace('Detalle del estudio: ', '')}
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 320, maxWidth: '100%', flexShrink: 0, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16 }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>
              {completedCount} de {totalCount} colaboradores completados
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {invitations.map((inv) => {
                const pills = getCandidateStatusPills(study.status, inv);
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => setSelectedInvId(inv.id)}
                    style={{
                      textAlign: 'left',
                      padding: 14,
                      borderRadius: 14,
                      border: selectedInvId === inv.id ? '2px solid #93c5fd' : '1px solid #e5e7eb',
                      background: selectedInvId === inv.id ? '#f8fbff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                      {inv.candidate_name?.trim() || inv.candidate_email || 'Anónimo'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: inv.completed_at ? 8 : 0 }}>
                      {pills.map((pill) => (
                        <span key={pill.label} style={{ padding: '4px 8px', borderRadius: 999, background: pill.bg, color: pill.text, fontSize: 12, fontWeight: 700 }}>
                          {pill.label}
                        </span>
                      ))}
                    </div>
                    {inv.completed_at ? <div style={{ fontSize: 12, color: '#64748b' }}>Fecha de conclusión: {formatDate(inv.completed_at)}</div> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 280, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
            {!selectedInv ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Selecciona un colaborador para consultar el avance del estudio.</p>
            ) : (
              <>
                <section style={{ marginBottom: 22, border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, background: '#ffffff' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                    {selectedInv.candidate_name?.trim() || selectedInv.candidate_email || 'Anónimo'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: selectedInv.completed_at ? 12 : 0 }}>
                    {selectedCandidatePills.map((pill) => (
                      <span key={pill.label} style={{ padding: '6px 10px', borderRadius: 999, background: pill.bg, color: pill.text, fontSize: 13, fontWeight: 700 }}>
                        {pill.label}
                      </span>
                    ))}
                  </div>
                  {selectedInv.completed_at ? (
                    <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid #e5e7eb', fontSize: 14, color: '#334155' }}>
                      <strong>Fecha de conclusión:</strong> {formatDate(selectedInv.completed_at)}
                    </div>
                  ) : null}
                </section>

                <section style={{ marginBottom: 22 }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 18, color: '#0f172a' }}>Estatus del estudio</h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {selectedProgressSteps.map((step, index) => {
                      const titleColor = step.state === 'completed' ? '#166534' : step.state === 'current' ? '#0f172a' : '#475569';
                      const subtitleColor = step.state === 'completed' ? '#4b5563' : step.state === 'current' ? '#2563eb' : '#9ca3af';

                      return (
                        <div key={step.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ display: 'grid', justifyItems: 'center' }}>
                            <ProgressMarker state={step.state} />
                            {index < selectedProgressSteps.length - 1 ? <div style={{ width: 2, minHeight: 28, background: '#d1d5db', marginTop: 4 }} /> : null}
                          </div>
                          <div style={{ paddingTop: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: titleColor }}>{step.title}</div>
                            <div style={{ fontSize: 13, color: subtitleColor }}>{step.subtitle}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {study.status === 'concluido' && selectedInv.status === 'completed' ? (
                  <section style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleDownloadInformeCandidato}
                      style={{ padding: '10px 16px', background: '#1e40af', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
                    >
                      Descargar informe final del candidato
                    </button>
                    <span style={{ fontSize: 13, color: '#64748b' }}>El informe final ya se encuentra disponible.</span>
                  </section>
                ) : (
                  <div style={{ paddingTop: 16, borderTop: '1px solid #e5e7eb', fontSize: 13, color: '#64748b' }}>
                    El informe final se habilitará una vez concluida la validación interna.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {toast ? (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: 12, background: '#111827', color: '#ffffff', borderRadius: 8, zIndex: 50 }}>
          {toast}
          <button type="button" onClick={() => setToast(null)} style={{ marginLeft: 12, color: '#93c5fd', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>
      ) : null}
    </main>
  );
}
