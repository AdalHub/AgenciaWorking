import { useEffect, useMemo, useState } from 'react';

type WorkspaceMode = 'company' | 'admin';

type ServiceWorkspace = {
  company_service_id: number;
  company_user_id: number;
  catalog_id: number;
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
};

type ServiceNode = {
  id: number;
  company_service_id: number;
  parent_node_id: number | null;
  name: string;
  description: string | null;
  status: 'pendiente' | 'en_proceso' | 'disponible' | 'completado';
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ServiceDocument = {
  id: number;
  company_service_id: number;
  node_id: number | null;
  node_name: string | null;
  original_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number;
  status: 'pendiente' | 'en_proceso' | 'disponible' | 'completado';
  uploaded_by_user_id: number | null;
  uploaded_at: string;
  updated_at: string;
};

type Props = {
  mode: WorkspaceMode;
  slug: string;
  companyUserId?: number | null;
  backLabel: string;
  onBack: () => void;
};

const statusLabels: Record<ServiceWorkspace['status'], string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  disponible: 'Disponible',
  completado: 'Completado',
};

const statusColors: Record<ServiceWorkspace['status'], { bg: string; text: string }> = {
  pendiente: { bg: '#f3f4f6', text: '#374151' },
  en_proceso: { bg: '#dbeafe', text: '#1d4ed8' },
  disponible: { bg: '#fef3c7', text: '#b45309' },
  completado: { bg: '#dcfce7', text: '#166534' },
};

type TreeNode = ServiceNode & { depth: number };

function bytesLabel(bytes: number): string {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

function buildTreeRows(nodes: ServiceNode[]): TreeNode[] {
  const byParent = new Map<number | null, ServiceNode[]>();
  nodes.forEach((node) => {
    const key = node.parent_node_id ?? null;
    const list = byParent.get(key) || [];
    list.push(node);
    byParent.set(key, list);
  });
  byParent.forEach((list) => list.sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id)));

  const result: TreeNode[] = [];
  const visit = (parentId: number | null, depth: number) => {
    (byParent.get(parentId) || []).forEach((node) => {
      result.push({ ...node, depth });
      visit(node.id, depth + 1);
    });
  };
  visit(null, 0);
  return result;
}

export default function ServiceWorkspacePanel({ mode, slug, companyUserId, backLabel, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [service, setService] = useState<ServiceWorkspace | null>(null);
  const [nodes, setNodes] = useState<ServiceNode[]>([]);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [folderStatus, setFolderStatus] = useState<ServiceWorkspace['status']>('pendiente');
  const [uploadStatus, setUploadStatus] = useState<ServiceWorkspace['status']>('disponible');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [submittingFolder, setSubmittingFolder] = useState(false);
  const [uploading, setUploading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('slug', slug);
    if (mode === 'admin' && companyUserId) {
      params.set('company_user_id', String(companyUserId));
    }
    return params.toString();
  }, [mode, slug, companyUserId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [serviceRes, nodesRes, docsRes] = await Promise.all([
        fetch(`/api/company_portal.php?action=get_company_service&${query}`, { credentials: 'include' }),
        fetch(`/api/company_portal.php?action=list_service_nodes&${query}`, { credentials: 'include' }),
        fetch(`/api/company_portal.php?action=list_service_documents&${query}`, { credentials: 'include' }),
      ]);

      const serviceData = await serviceRes.json();
      const nodesData = await nodesRes.json();
      const docsData = await docsRes.json();

      if (!serviceRes.ok || !nodesRes.ok || !docsRes.ok) {
        throw new Error(serviceData?.error || nodesData?.error || docsData?.error || 'No fue posible cargar el workspace.');
      }

      setService(serviceData?.service || null);
      setCompanyName(serviceData?.company?.display_name || '');
      setCanManage(!!serviceData?.membership?.can_manage || !!nodesData?.can_manage || !!docsData?.can_manage);
      setNodes(Array.isArray(nodesData?.nodes) ? nodesData.nodes : []);
      setDocuments(Array.isArray(docsData?.documents) ? docsData.documents : []);
    } catch (err: any) {
      setError(err?.message || 'No fue posible cargar el workspace del servicio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [query]);

  const treeRows = useMemo(() => buildTreeRows(nodes), [nodes]);
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const filteredDocuments = useMemo(() => {
    if (selectedNodeId === null) return documents;
    return documents.filter((doc) => doc.node_id === selectedNodeId);
  }, [documents, selectedNodeId]);

  const refreshNodes = async () => {
    const res = await fetch(`/api/company_portal.php?action=list_service_nodes&${query}`, { credentials: 'include' });
    const data = await res.json();
    if (res.ok) setNodes(Array.isArray(data?.nodes) ? data.nodes : []);
  };

  const refreshDocuments = async () => {
    const res = await fetch(`/api/company_portal.php?action=list_service_documents&${query}`, { credentials: 'include' });
    const data = await res.json();
    if (res.ok) setDocuments(Array.isArray(data?.documents) ? data.documents : []);
  };

  const createFolder = async () => {
    if (!folderName.trim()) {
      setToast('El nombre de la carpeta es obligatorio.');
      return;
    }
    setSubmittingFolder(true);
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=create_service_node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_user_id: companyUserId,
          slug,
          parent_node_id: selectedNodeId,
          name: folderName,
          description: folderDescription,
          status: folderStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible crear la carpeta.');
      }
      setNodes(Array.isArray(data?.nodes) ? data.nodes : []);
      setFolderName('');
      setFolderDescription('');
      setFolderStatus('pendiente');
      setToast('Carpeta guardada correctamente.');
    } catch (err: any) {
      setToast(err?.message || 'No fue posible crear la carpeta.');
    } finally {
      setSubmittingFolder(false);
    }
  };

  const renameNode = async (node: ServiceNode) => {
    const nextName = window.prompt('Nuevo nombre de la carpeta', node.name);
    if (nextName === null) return;
    const trimmed = nextName.trim();
    if (!trimmed) return;
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=update_service_node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_user_id: companyUserId,
          slug,
          node_id: node.id,
          parent_node_id: node.parent_node_id,
          name: trimmed,
          description: node.description || '',
          status: node.status,
          sort_order: node.sort_order,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible actualizar la carpeta.');
      }
      setNodes(Array.isArray(data?.nodes) ? data.nodes : []);
      setToast('Carpeta actualizada.');
    } catch (err: any) {
      setToast(err?.message || 'No fue posible actualizar la carpeta.');
    }
  };

  const archiveNode = async (node: ServiceNode) => {
    if (!window.confirm(`¿Deseas archivar la carpeta "${node.name}" y su contenido?`)) return;
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=archive_service_node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_user_id: companyUserId,
          slug,
          node_id: node.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible archivar la carpeta.');
      }
      setNodes(Array.isArray(data?.nodes) ? data.nodes : []);
      setDocuments(Array.isArray(data?.documents) ? data.documents : []);
      if (selectedNodeId === node.id) setSelectedNodeId(null);
      setToast('Carpeta archivada.');
    } catch (err: any) {
      setToast(err?.message || 'No fue posible archivar la carpeta.');
    }
  };

  const uploadDocument = async () => {
    if (!uploadFile) {
      setToast('Selecciona un archivo primero.');
      return;
    }
    setUploading(true);
    setToast(null);
    try {
      const formData = new FormData();
      formData.append('slug', slug);
      if (mode === 'admin' && companyUserId) {
        formData.append('company_user_id', String(companyUserId));
      }
      if (selectedNodeId !== null) {
        formData.append('node_id', String(selectedNodeId));
      }
      formData.append('status', uploadStatus);
      formData.append('file', uploadFile);
      const res = await fetch('/api/company_portal.php?action=upload_service_document', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible subir el archivo.');
      }
      setDocuments(Array.isArray(data?.documents) ? data.documents : []);
      setUploadFile(null);
      setUploadStatus('disponible');
      const input = document.getElementById('service-workspace-file') as HTMLInputElement | null;
      if (input) input.value = '';
      setToast('Archivo cargado correctamente.');
    } catch (err: any) {
      setToast(err?.message || 'No fue posible subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const archiveDocument = async (documentId: number) => {
    if (!window.confirm('¿Deseas archivar este archivo?')) return;
    setToast(null);
    try {
      const res = await fetch('/api/company_portal.php?action=archive_service_document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_user_id: companyUserId,
          slug,
          document_id: documentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible archivar el archivo.');
      }
      setDocuments(Array.isArray(data?.documents) ? data.documents : []);
      setToast('Archivo archivado.');
    } catch (err: any) {
      setToast(err?.message || 'No fue posible archivar el archivo.');
    }
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Cargando workspace...</div>;
  }

  if (error || !service) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0, justifySelf: 'start' }}>
          {backLabel}
        </button>
        <div style={{ padding: 18, borderRadius: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
          {error || 'No fue posible cargar el workspace del servicio.'}
        </div>
      </div>
    );
  }

  const workspaceStatusStyle = statusColors[service.status] || statusColors.pendiente;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0, justifySelf: 'start' }}>
        {backLabel}
      </button>

      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{companyName}</div>
            <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', color: '#0f172a' }}>{service.name}</h1>
            <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>{service.short_description}</p>
          </div>
          <span style={{ padding: '8px 12px', borderRadius: 999, background: workspaceStatusStyle.bg, color: workspaceStatusStyle.text, fontSize: 13, fontWeight: 700 }}>
            {statusLabels[service.status] || service.status}
          </span>
        </div>

        {service.notes ? (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#475569' }}>
            <strong style={{ display: 'block', marginBottom: 4, color: '#0f172a' }}>Notas del servicio</strong>
            {service.notes}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Carpetas activas</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{nodes.length}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Documentos disponibles</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{documents.length}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Vista actual</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{selectedNode ? selectedNode.name : 'General del servicio'}</div>
          </div>
        </div>
      </section>

      {toast ? (
        <div style={{ padding: 12, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
          {toast}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) minmax(0, 1fr)', gap: 18 }}>
        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 20, color: '#0f172a' }}>Carpetas y subcarpetas</h2>
          <button
            type="button"
            onClick={() => setSelectedNodeId(null)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 10,
              border: selectedNodeId === null ? '1px solid #2563eb' : '1px solid #e5e7eb',
              background: selectedNodeId === null ? '#eff6ff' : '#fff',
              cursor: 'pointer',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            General del servicio
          </button>
          <div style={{ display: 'grid', gap: 8 }}>
            {treeRows.length === 0 ? (
              <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#64748b' }}>
                Todavia no hay carpetas creadas.
              </div>
            ) : treeRows.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  paddingLeft: 12 + (node.depth * 16),
                  borderRadius: 10,
                  border: selectedNodeId === node.id ? '1px solid #2563eb' : '1px solid #e5e7eb',
                  background: selectedNodeId === node.id ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{node.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{statusLabels[node.status] || node.status}</div>
              </button>
            ))}
          </div>

          {canManage ? (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #e5e7eb', display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: '#0f172a' }}>
                {selectedNode ? `Nueva subcarpeta en ${selectedNode.name}` : 'Nueva carpeta raiz'}
              </h3>
              <input value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="Nombre de carpeta" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              <textarea value={folderDescription} onChange={(event) => setFolderDescription(event.target.value)} placeholder="Descripcion breve (opcional)" rows={3} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', resize: 'vertical' }} />
              <select value={folderStatus} onChange={(event) => setFolderStatus(event.target.value as ServiceWorkspace['status'])} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button type="button" onClick={createFolder} disabled={submittingFolder} style={{ padding: '10px 14px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, cursor: submittingFolder ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {submittingFolder ? 'Guardando...' : 'Guardar carpeta'}
              </button>

              {selectedNode ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => renameNode(selectedNode)} style={{ padding: '9px 12px', background: '#fff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                    Renombrar seleccionada
                  </button>
                  <button type="button" onClick={() => archiveNode(selectedNode)} style={{ padding: '9px 12px', background: '#fff', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                    Archivar seleccionada
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>Documentos</h2>
              <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                {selectedNode ? `Mostrando archivos dentro de ${selectedNode.name}.` : 'Mostrando todos los archivos disponibles del servicio.'}
              </p>
            </div>
            <button type="button" onClick={async () => { await refreshNodes(); await refreshDocuments(); setToast('Contenido actualizado.'); }} style={{ padding: '9px 12px', background: '#fff', color: '#0f172a', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
              Actualizar
            </button>
          </div>

          {canManage ? (
            <div style={{ marginBottom: 18, padding: 14, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb', display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: '#0f172a' }}>Adjuntar documento</h3>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Carpeta destino: <strong>{selectedNode ? selectedNode.name : 'General del servicio'}</strong>
              </div>
              <input id="service-workspace-file" type="file" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }} />
              <select value={uploadStatus} onChange={(event) => setUploadStatus(event.target.value as ServiceWorkspace['status'])} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button type="button" onClick={uploadDocument} disabled={uploading} style={{ padding: '10px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {uploading ? 'Subiendo...' : 'Subir archivo'}
              </button>
            </div>
          ) : null}

          {filteredDocuments.length === 0 ? (
            <div style={{ padding: 18, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#64748b' }}>
              No hay documentos disponibles en esta vista.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredDocuments.map((doc) => {
                const docStatus = statusColors[doc.status] || statusColors.disponible;
                return (
                  <article key={doc.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>{doc.original_name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                          {doc.node_name ? `Carpeta: ${doc.node_name}` : 'General del servicio'}
                        </div>
                      </div>
                      <span style={{ padding: '6px 10px', borderRadius: 999, background: docStatus.bg, color: docStatus.text, fontSize: 12, fontWeight: 700 }}>
                        {statusLabels[doc.status] || doc.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#64748b' }}>
                      <span>Tamaño: {bytesLabel(doc.size_bytes)}</span>
                      <span>Cargado: {formatDate(doc.uploaded_at)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a
                        href={`/api/company_portal.php?action=download_service_document&document_id=${doc.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '9px 12px', background: '#111827', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}
                      >
                        Descargar
                      </a>
                      {canManage ? (
                        <button type="button" onClick={() => archiveDocument(doc.id)} style={{ padding: '9px 12px', background: '#fff', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                          Archivar
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
