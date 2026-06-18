import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api';
const FETCH_OPTIONS = { credentials: 'include' as RequestCredentials };
const CLIENT_PROGRESS_TEXT = 'Proceso de verificacion en curso';
const CLIENT_PENDING_INFO_TEXT =
  'Detalle del estudio: Todos los candidatos han sido invitados a completar su estudio socioeconomico. Actualmente, nos encontramos en espera de que inicien o concluyan su captura.';
const CLIENT_INFO_TEXT =
  'Detalle del estudio: Uno o mas candidatos han completado la informacion requerida. Actualmente, el estudio se encuentra en proceso de revision y validacion por parte de nuestro equipo.';
const CLIENT_FINAL_INFO_TEXT =
  'Detalle del estudio: Este estudio ya cuenta con informes finales disponibles para consulta y descarga en el portal. Puede revisar el detalle de cada candidato y descargar su informe correspondiente.';

type Study = {
  id: number;
  company_name: string;
  status: string;
  updated_at?: string;
};

type Invitation = {
  id: number;
  candidate_name?: string;
  candidate_email?: string;
  status: string;
  is_cancelled?: number;
  sent_at?: string;
  opened_at?: string;
  completed_at?: string;
};

type DownloadableDocument = {
  label: string;
  file_path: string;
  name: string;
};

type ClientReport = {
  downloadable_documents?: DownloadableDocument[];
  supporting_documents?: DownloadableDocument[];
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
  if (!value) return '-';
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

function downloadFilenameFromResponse(response: Response, fallback: string): string {
  const disposition = response.headers.get('content-disposition') || '';
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }
  const basicMatch = disposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] || fallback;
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

function isInvitationCancelledForCompany(studyStatus: string, invitation: Invitation): boolean {
  return (invitation.is_cancelled ?? 0) === 1 || (studyStatus === 'concluido' && invitation.status !== 'completed');
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
      title: 'Revision de informacion',
      subtitle: current > 1 ? 'Completado' : current === 1 ? 'En curso' : 'Etapa siguiente',
    },
    {
      title: 'Validacion interna',
      subtitle: current > 2 ? 'Completado' : current === 2 ? 'En curso' : 'Etapa siguiente',
    },
    {
      title: 'Informe disponible',
      subtitle: current === 3 ? 'Disponible' : 'Se mostrara al concluir',
    },
  ];

  return baseSteps.map((step, index) => ({
    ...step,
    state: index < current ? 'completed' : index === current ? 'current' : 'upcoming',
  }));
}

function getCandidateStatusPills(studyStatus: string, invitation: Invitation) {
  if (isInvitationCancelledForCompany(studyStatus, invitation)) {
    return [{ label: 'Cancelado', bg: '#fee2e2', text: '#991b1b' }];
  }
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

function getInvitationLastUpdated(study: Study, invitation: Invitation): string | null {
  if (study.status === 'concluido' && invitation.status !== 'completed') {
    return study.updated_at || invitation.opened_at || invitation.sent_at || null;
  }
  if ((invitation.is_cancelled ?? 0) === 1) {
    return invitation.completed_at || invitation.opened_at || invitation.sent_at || null;
  }
  if (invitation.status === 'completed') {
    return invitation.completed_at || invitation.opened_at || invitation.sent_at || null;
  }
  if (invitation.status === 'in_progress') {
    return invitation.opened_at || invitation.sent_at || null;
  }
  return invitation.sent_at || null;
}

function getCandidateCurrentStatus(studyStatus: string, invitation: Invitation) {
  if (isInvitationCancelledForCompany(studyStatus, invitation)) {
    return { label: 'Cancelado', bg: '#fee2e2', text: '#991b1b' };
  }
  if (studyStatus === 'concluido' && invitation.status === 'completed') {
    return { label: 'Informe disponible', bg: '#dbeafe', text: '#1d4ed8' };
  }
  if (studyStatus === 'en_validacion' && invitation.status === 'completed') {
    return { label: 'Validacion interna', bg: '#e0f2fe', text: '#075985' };
  }
  if (invitation.status === 'completed') {
    return { label: CLIENT_PROGRESS_TEXT, bg: '#fef3c7', text: '#b45309' };
  }
  return { label: 'Registro del candidato', bg: '#e5e7eb', text: '#475569' };
}

function getCandidateProgressTag(studyStatus: string, invitation: Invitation) {
  if (isInvitationCancelledForCompany(studyStatus, invitation)) {
    return { label: 'Cancelado', bg: '#fee2e2', text: '#991b1b' };
  }
  if (studyStatus === 'concluido' && invitation.status === 'completed') {
    return { label: 'Estudio concluido', bg: '#dcfce7', text: '#166534' };
  }
  if (studyStatus === 'en_validacion' && invitation.status === 'completed') {
    return { label: 'Revision final', bg: '#ede9fe', text: '#6d28d9' };
  }
  if (invitation.status === 'completed') {
    return { label: 'Captura completada', bg: '#dcfce7', text: '#166534' };
  }
  return { label: 'Informacion pendiente', bg: '#fef3c7', text: '#b45309' };
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
  const [downloadableDocuments, setDownloadableDocuments] = useState<DownloadableDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
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
          const firstCompleted = nextInvitations.find((inv: Invitation) => inv.status === 'completed' && !isInvitationCancelledForCompany(studyRes.status, inv));
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

  useEffect(() => {
    if (!selectedInvId || !study || study.status !== 'concluido' || selectedInv?.status !== 'completed' || isInvitationCancelledForCompany(study.status, selectedInv)) {
      setDownloadableDocuments([]);
      setDocumentsLoading(false);
      return;
    }

    setDocumentsLoading(true);
    fetch(`${API}/studies.php?action=get_company_client_report&invitation_id=${selectedInvId}${tokenParam}`, FETCH_OPTIONS)
      .then((r) => r.json())
      .then((data: ClientReport & { error?: string }) => {
        if (data?.error) {
          setDownloadableDocuments([]);
          return;
        }
        const docs = Array.isArray(data?.downloadable_documents)
          ? data.downloadable_documents
          : Array.isArray(data?.supporting_documents)
            ? data.supporting_documents
            : [];
        setDownloadableDocuments(docs);
      })
      .catch(() => setDownloadableDocuments([]))
      .finally(() => setDocumentsLoading(false));
  }, [selectedInv?.status, selectedInvId, study, tokenParam]);

  const studyStatus = study?.status ?? '';
  const cancelledCount = invitations.filter((inv) => isInvitationCancelledForCompany(studyStatus, inv)).length;
  const completedCount = invitations.filter((inv) => inv.status === 'completed' && !isInvitationCancelledForCompany(studyStatus, inv)).length;
  const totalCount = invitations.length;
  const inProcessCount = Math.max(totalCount - completedCount - cancelledCount, 0);
  const reportAvailableCount = study?.status === 'concluido' ? completedCount : 0;
  const generalStatus = study ? getGeneralClientStatus(study, invitations) : { label: 'Registro del candidato', bg: '#e5e7eb', text: '#475569' };
  const selectedProgressSteps = selectedInv ? getProgressSteps(study?.status ?? '', selectedInv.status) : [];
  const selectedCandidatePills = selectedInv ? getCandidateStatusPills(study?.status ?? '', selectedInv) : [];
  const topInfoText = study?.status === 'concluido'
    ? CLIENT_FINAL_INFO_TEXT
    : completedCount > 0
      ? CLIENT_INFO_TEXT
      : CLIENT_PENDING_INFO_TEXT;

  const documentDownloadApiUrl = (filePath: string) =>
    `${API}/studies.php?action=download_document&file_path=${encodeURIComponent(filePath)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

  const handleDownloadInformeCandidato = () => {
    if (!selectedInvId || !selectedInv || selectedInv.status !== 'completed' || !study || isInvitationCancelledForCompany(study.status, selectedInv)) return;

    const url = `${API}/studies.php?action=download_pdf&invitation_id=${selectedInvId}&_ts=${Date.now()}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    fetch(url, { ...FETCH_OPTIONS, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setToast(data?.error || 'No disponible');
          return;
        }

        const filename = downloadFilenameFromResponse(response, `estudio-${selectedInvId}.pdf`);
        const blob = await response.blob();
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(href);
      })
      .catch(() => setToast('No disponible'));
  };

  const handleDownloadInformeEstudio = async () => {
    const completedInvitations = invitations.filter((inv) => inv.status === 'completed' && !isInvitationCancelledForCompany(studyStatus, inv));
    if (completedInvitations.length === 0) {
      setToast('No hay colaboradores completados para descargar.');
      return;
    }

    setToast(`Preparando ${completedInvitations.length} informe${completedInvitations.length === 1 ? '' : 's'} final${completedInvitations.length === 1 ? '' : 'es'} para descarga.`);
    let successCount = 0;

    for (const [index, inv] of completedInvitations.entries()) {
      try {
        const url = `${API}/studies.php?action=download_pdf&invitation_id=${inv.id}&_ts=${Date.now()}-${index}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
        const response = await fetch(url, { ...FETCH_OPTIONS, cache: 'no-store' });
        if (!response.ok) {
          continue;
        }

        const filename = downloadFilenameFromResponse(response, `estudio-${inv.id}.pdf`);
        const blob = await response.blob();
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(href), 1500);
        successCount += 1;
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      } catch {
        // Continue downloading the remaining reports even if one fails.
      }
    }

    if (successCount === 0) {
      setToast('No fue posible descargar los informes finales disponibles.');
      return;
    }

    if (successCount < completedInvitations.length) {
      setToast(`Se descargaron ${successCount} de ${completedInvitations.length} informes finales disponibles.`);
      return;
    }

    setToast(`Descargando ${successCount} informe${successCount === 1 ? '' : 's'} final${successCount === 1 ? '' : 'es'}.`);
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
            {study.company_name} - Estudio Socioeconomico
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
                Descargar todos los informes finales
              </button>
            ) : (
              <span style={{ padding: '8px 12px', background: '#fef3c7', color: '#92400e', borderRadius: 8, fontSize: 13 }}>
                El informe final estara disponible al concluir el estudio.
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
          <strong>Detalle del estudio:</strong> {topInfoText.replace('Detalle del estudio: ', '')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Candidatos en proceso</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{inProcessCount}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Capturas completadas</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{completedCount}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Informes disponibles</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: reportAvailableCount > 0 ? '#166534' : '#0f172a' }}>{reportAvailableCount}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Candidatos cancelados</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: cancelledCount > 0 ? '#991b1b' : '#0f172a' }}>{cancelledCount}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <section style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, color: '#0f172a' }}>Colaboradores del estudio</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                  {completedCount} de {totalCount} colaboradores completados
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: '#475569' }}>Candidato / Estudio</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: '#475569' }}>Estatus actual</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: '#475569' }}>Avance</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: '#475569' }}>Ultima actualizacion</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, color: '#475569' }}>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => {
                    const currentStatus = getCandidateCurrentStatus(study.status, inv);
                    const progressTag = getCandidateProgressTag(study.status, inv);
                    const lastUpdated = getInvitationLastUpdated(study, inv);
                    const isSelected = selectedInvId === inv.id;
                    const actionLabel = isInvitationCancelledForCompany(study.status, inv)
                      ? 'Ver detalle'
                      : study.status === 'concluido' && inv.status === 'completed'
                        ? 'Ver informe'
                        : 'Ver detalle';

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvId(inv.id)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#f8fbff' : '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                            {inv.candidate_name?.trim() || inv.candidate_email || 'Sin nombre'}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{study.company_name}</div>
                        </td>
                        <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: 999, background: currentStatus.bg, color: currentStatus.text, fontSize: 12, fontWeight: 700 }}>
                            {currentStatus.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: 999, background: progressTag.bg, color: progressTag.text, fontSize: 12, fontWeight: 700 }}>
                            {progressTag.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', verticalAlign: 'top', fontSize: 14, color: '#334155' }}>{formatDate(lastUpdated)}</td>
                        <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedInvId(inv.id);
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: isSelected ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                              background: isSelected ? '#1d4ed8' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#0f172a',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {actionLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
            {!selectedInv ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Selecciona un colaborador para consultar el avance del estudio.</p>
            ) : (
              <>
                <section style={{ marginBottom: 22, border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, background: '#ffffff' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                    {selectedInv.candidate_name?.trim() || selectedInv.candidate_email || 'Sin nombre'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: selectedInv.completed_at ? 12 : 0 }}>
                    {selectedCandidatePills.map((pill) => (
                      <span key={pill.label} style={{ padding: '6px 10px', borderRadius: 999, background: pill.bg, color: pill.text, fontSize: 13, fontWeight: 700 }}>
                        {pill.label}
                      </span>
                    ))}
                  </div>
                  {getInvitationLastUpdated(study, selectedInv) ? (
                    <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid #e5e7eb', fontSize: 14, color: '#334155' }}>
                      <strong>Ultima actualizacion:</strong> {formatDate(getInvitationLastUpdated(study, selectedInv))}
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

                {isInvitationCancelledForCompany(study.status, selectedInv) ? (
                  <section style={{ display: 'grid', gap: 12 }}>
                    <div style={{ padding: 14, borderRadius: 12, background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', lineHeight: 1.6 }}>
                      Este candidato fue marcado como cancelado o no concluyo su captura antes del cierre del estudio. Su informe final no se encuentra disponible.
                    </div>
                  </section>
                ) : study.status === 'concluido' && selectedInv.status === 'completed' ? (
                  <section style={{ display: 'grid', gap: 16 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={handleDownloadInformeCandidato}
                        style={{ padding: '10px 16px', background: '#1e40af', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Descargar informe final del candidato
                      </button>
                      <span style={{ fontSize: 13, color: '#64748b' }}>El informe final de este candidato ya se encuentra disponible para consulta y descarga.</span>
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: 16, color: '#0f172a' }}>Documentos adjuntos disponibles</h4>
                      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
                        Aqui puede descargar los archivos adjuntos del candidato y del analista que se conservan fuera del PDF final.
                      </p>
                      {documentsLoading ? (
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Cargando documentos...</p>
                      ) : downloadableDocuments.length > 0 ? (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {downloadableDocuments.map((doc, index) => (
                            <div
                              key={`${doc.file_path}-${index}`}
                              style={{
                                display: 'flex',
                                gap: 12,
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                padding: 12,
                                borderRadius: 10,
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 220 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{doc.label}</div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>{doc.name}</div>
                              </div>
                              <a
                                href={documentDownloadApiUrl(doc.file_path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '8px 14px',
                                  background: '#0f766e',
                                  color: '#ffffff',
                                  borderRadius: 8,
                                  textDecoration: 'none',
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                Descargar
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>No hay documentos adjuntos adicionales para este candidato.</p>
                      )}
                    </div>
                  </section>
                ) : (
                  <div style={{ paddingTop: 16, borderTop: '1px solid #e5e7eb', fontSize: 13, color: '#64748b' }}>
                    El informe final se habilitara una vez concluida la validacion interna.
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
