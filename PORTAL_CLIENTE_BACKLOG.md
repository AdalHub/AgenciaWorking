# Portal Cliente Working - Backlog Tecnico

Last updated: 2026-07-09

## 1. Objetivo real del feature

Construir un `Portal Cliente` privado y escalable encima de los sistemas ya existentes de Agencia Working, sin rehacer el modulo de estudios ni romper los flujos actuales de:

- login de empresa
- invitacion y activacion por correo
- perfil de empresa
- dashboard actual de estudios
- detalle de estudios
- descarga de PDFs finales

El portal nuevo debe servir para tres cosas al mismo tiempo:

1. dar seguimiento a servicios ya contratados
2. mostrar otros servicios disponibles para cotizacion
3. permitir control documental y de accesos por empresa

## 2. Regla principal: construir encima de lo existente

Este feature no debe sustituir los sistemas actuales. Debe montarse encima de ellos.

### Sistemas que ya existen y se deben reutilizar

- `api/user_auth.php`
  - login de usuario/empresa
  - activacion de cuenta de empresa por invitacion
  - reset de password de empresa
- `api/studies.php`
  - perfil de empresa por `action=company_profile`
  - estudios, invitaciones, PDFs, vista cliente y vista admin
- rutas frontend ya activas
  - `/empresa/setup`
  - `/empresa/reset-password`
  - `/empresa/onboarding`
  - `/empresa/dashboard`
  - `/empresa/studies/:id`
  - `/estudios/view`
- tablas actuales
  - `users`
  - `company_invites`
  - `company_profiles`
  - `studies`
  - `study_company_recipients`
  - `study_invitations`

### Reglas de compatibilidad

- No mover logica de estudios a otro archivo si ya funciona.
- No duplicar la base de datos de estudios.
- No crear otro sistema paralelo de cuentas de empresa.
- El acceso de empresa creado por correo debe seguir funcionando igual.
- El nuevo portal debe reconocer a la empresa existente y colgarse de esa cuenta.
- Los usuarios autorizados nuevos deben pertenecer a una empresa ya existente, no reemplazarla.

## 3. Lo que el cliente realmente esta pidiendo

Traducido a modulos funcionales, el cliente pidio esto:

### A. Acceso visible al portal

Cambiar el acceso publico visible a `Portal Cliente`, sin quitar los tres caminos actuales:

- comprar servicio
- portal para empresas
- ingresar con codigo

### B. Portal principal de empresa

Cuando una empresa entre, debe ver:

- servicios contratados
- servicios disponibles para contratar
- su contexto de empresa
- acceso al modulo ya existente de estudios cuando ese servicio este activo

### C. Admin de Working debe poder crear clientes manualmente

Working necesita una pantalla interna para:

- crear una cuenta empresa manualmente
- asignarle servicios activos
- reenviar el correo de activacion
- editar datos basicos de ese cliente

### D. El cliente administrador debe poder crear usuarios autorizados

Esto no significa crear otra empresa. Significa:

- un administrador cliente principal ya existe
- ese administrador crea otros usuarios de su misma empresa
- esos usuarios ven solo ciertos servicios o carpetas

### E. Cada servicio contratado necesita su propio espacio

Un servicio puede ser:

- un `workspace` documental propio
- o un `module_link`, como Estudios Socioeconomicos

### F. Cotizacion / solicitud de nuevos servicios

La empresa debe poder pedir informes o cotizacion de servicios no contratados.

Eso debe:

- guardarse en base de datos
- enviarse por correo a Working
- verse despues en admin

### G. REPSE / BPO

No es un portal aparte. Es un servicio mas dentro del portal, pero con una estructura sugerida de carpetas y documentos.

## 4. Interpretacion correcta de carpetas y subcarpetas

El cliente no esta pidiendo tablas separadas para `carpeta` y `subcarpeta`.

La forma correcta y escalable es:

- una sola tabla jerarquica de nodos
- cada nodo puede tener `parent_node_id`
- si `parent_node_id` es `NULL`, es carpeta raiz
- si tiene valor, es subcarpeta de otro nodo

Esto permite:

- carpetas ilimitadas
- subcarpetas ilimitadas
- cualquier profundidad futura
- permisos por nodo

## 5. Arquitectura aditiva recomendada

## Backend nuevo

- `api/company_portal.php`

Este archivo debe concentrar lo nuevo del Portal Cliente para no seguir inflando `api/studies.php`.

## Backend existente que se conserva

- `api/user_auth.php`
- `api/studies.php`

## Frontend existente que se conserva

- `src/pages/EmpresaSetupPage.tsx`
- `src/pages/EmpresaResetPasswordPage.tsx`
- `src/pages/EmpresaOnboarding.tsx`
- `src/pages/EmpresaStudyDetailPage.tsx`
- `src/components/Company/CompanyStudyDetailView.tsx`

## Frontend nuevo o refactor ligero

- `src/pages/EmpresaDashboard.tsx`
- `src/pages/EmpresaStudiesDashboard.tsx`
- `src/components/Company/CompanyStudiesDashboardPanel.tsx`
- futuras pantallas admin de clientes

## 6. Modelo de datos exacto

Todo esto es aditivo. No sustituye tablas actuales.

### 6.1 `company_user_members`

Relaciona usuarios empresa con su empresa raiz.

Columnas:

- `id`
- `company_user_id`
- `member_user_id`
- `role` -> `owner | manager | authorized`
- `area`
- `position_title`
- `is_active`
- `created_by_user_id`
- `created_at`
- `updated_at`

Uso:

- una empresa raiz ya existente queda como `owner`
- luego puede tener managers o usuarios autorizados

### 6.2 `service_catalog`

Catalogo maestro de servicios de Working.

Columnas:

- `id`
- `slug`
- `name`
- `short_description`
- `service_type` -> `workspace | module_link`
- `module_route`
- `public_service_slug`
- `is_visible`
- `is_active`
- `sort_order`
- `created_at`
- `updated_at`

Uso:

- sirve para mostrar contratados y disponibles
- el servicio de estudios vive aqui como `module_link`

### 6.3 `company_services`

Que servicios tiene activos una empresa.

Columnas:

- `id`
- `company_user_id`
- `service_catalog_id`
- `status` -> `pendiente | en_proceso | disponible | completado`
- `is_active`
- `enabled_at`
- `completed_at`
- `notes`
- `created_by_user_id`
- `created_at`
- `updated_at`

Uso:

- Working activa manualmente servicios por cliente
- el portal solo muestra como contratados los servicios activos aqui

### 6.4 `company_service_nodes`

Carpetas y subcarpetas de un servicio.

Columnas:

- `id`
- `company_service_id`
- `parent_node_id`
- `name`
- `description`
- `status`
- `sort_order`
- `is_active`
- `created_by_user_id`
- `created_at`
- `updated_at`

Uso:

- estructura documental ilimitada

### 6.5 `company_service_documents`

Documentos asociados a carpetas o a un servicio.

Columnas:

- `id`
- `company_service_id`
- `node_id`
- `original_name`
- `storage_path`
- `mime_type`
- `size_bytes`
- `status`
- `uploaded_by_user_id`
- `uploaded_at`
- `updated_at`
- `is_active`

Uso:

- historial basico de quien subio y cuando

### 6.6 `company_service_permissions`

Permisos por usuario autorizado.

Columnas:

- `id`
- `company_service_id`
- `node_id`
- `member_user_id`
- `can_view`
- `can_download`
- `created_at`
- `updated_at`

Uso:

- si `node_id` es `NULL`, permiso a nivel servicio
- si `node_id` tiene valor, permiso a nivel carpeta/subcarpeta

### 6.7 `service_inquiries`

Solicitudes de informacion o cotizacion.

Columnas:

- `id`
- `company_user_id`
- `requested_by_user_id`
- `service_catalog_id`
- `requester_name`
- `requester_title`
- `requester_email`
- `requester_phone`
- `service_name_snapshot`
- `request_message`
- `status`
- `admin_notes`
- `created_at`
- `updated_at`

### 6.8 `service_inquiry_attachments`

Adjuntos de una solicitud.

Columnas:

- `id`
- `inquiry_id`
- `original_name`
- `storage_path`
- `mime_type`
- `size_bytes`
- `uploaded_at`

## 7. Endpoints exactos

## 7.1 Endpoints existentes que se deben seguir usando

### `api/user_auth.php`

- `action=company-invite-status`
- `action=company-activate`
- flujo de activacion de empresa
- flujo de reset de password

### `api/studies.php`

- `action=company_profile` GET/POST
- toda la logica de estudios
- toda la logica de PDFs finales

## 7.2 Endpoints nuevos en `api/company_portal.php`

### Ya iniciados

- `GET action=portal_context`
- `GET action=list_service_catalog`
- `GET action=list_company_services`

### Siguiente grupo: admin de clientes

- `GET action=list_clients`
  - auth: admin
  - devuelve listado de empresas raiz
- `GET action=get_client&company_user_id=...`
  - auth: admin
  - devuelve empresa, perfil, servicios activos, miembros
- `POST action=create_client`
  - auth: admin
  - crea o reutiliza `users.account_type=company`
  - genera invitacion usando el mecanismo actual
  - opcionalmente precarga servicios
- `POST action=update_client`
  - auth: admin
  - actualiza datos base de la empresa
- `POST action=resend_client_invite`
  - auth: admin
  - revoca invitacion pendiente y emite otra
- `POST action=save_client_services`
  - auth: admin
  - activa o desactiva servicios del cliente
  - actualiza `company_services`

### Grupo: usuarios autorizados

- `GET action=list_company_members`
  - auth: empresa owner/manager o admin
- `POST action=create_company_member`
  - auth: empresa owner/manager o admin
  - crea usuario company y lo cuelga en `company_user_members`
  - envia invitacion de activacion o reset
- `POST action=update_company_member`
- `POST action=deactivate_company_member`
- `GET action=get_company_member_permissions`
- `POST action=save_company_member_permissions`

### Grupo: carpetas y documentos

- `GET action=list_service_nodes`
- `POST action=create_service_node`
- `POST action=update_service_node`
- `POST action=archive_service_node`
- `GET action=list_service_documents`
- `POST action=upload_service_document`
- `POST action=update_service_document`
- `POST action=archive_service_document`
- `GET action=download_service_document`

### Grupo: cotizaciones

- `POST action=create_service_inquiry`
  - auth: empresa
  - guarda en DB
  - envia correo a:
    - `veroteran@agenciaworking.com`
    - `admin@agenciaworking.com`
- `GET action=list_service_inquiries`
  - auth: admin
- `GET action=get_service_inquiry`
  - auth: admin

## 8. Rutas frontend exactas

## 8.1 Rutas existentes que deben quedarse

- `/empresa/setup`
- `/empresa/reset-password`
- `/empresa/onboarding`
- `/empresa/studies/:id`
- `/estudios/view`

## 8.2 Rutas ya refactorizadas o en uso para el portal

- `/empresa/dashboard`
  - nuevo home del Portal Cliente
- `/empresa/services/estudios`
  - dashboard extraido del modulo actual de estudios

## 8.3 Rutas nuevas recomendadas

- `/empresa/services/:slug`
  - workspace de cada servicio contratado que no sea estudios
- `/empresa/users`
  - gestion de usuarios autorizados por la empresa
- `/admin/clients`
  - listado de clientes empresa
- `/admin/clients/:companyUserId`
  - detalle de cliente, servicios y miembros
- `/admin/service-inquiries`
  - inbox de cotizaciones

## 9. Como se conecta con Estudios sin romper nada

El modulo de Estudios no debe migrarse.

La integracion correcta es:

1. `service_catalog` contiene el item `estudios-socioeconomicos`
2. ese item tiene `service_type = module_link`
3. cuando la empresa tiene estudios activos o Working le activa ese servicio, aparece en `company_services`
4. el boton del portal manda a `/empresa/services/estudios`
5. esa ruta sigue mostrando el sistema ya existente de estudios
6. el detalle sigue entrando a `/empresa/studies/:id`
7. las descargas siguen saliendo de `api/studies.php`

Eso mantiene compatibilidad total con el sistema actual.

## 10. Lo que significa "la empresa puede agregar usuarios"

Esto es importante aclararlo:

- no estan pidiendo multiempresa
- no estan pidiendo subcuentas nuevas independientes
- estan pidiendo que la empresa cliente tenga un administrador principal
- ese administrador pueda crear usuarios internos de su organizacion
- esos usuarios vean solo ciertos servicios o carpetas

Casos de uso:

- RH ve estudios y reclutamiento
- Compras ve REPSE / BPO
- Gerencia ve todo

## 11. Fases tecnicas recomendadas

Este orden es el mas seguro para no romper el sistema actual.

### Fase 1. Fundacion y compatibilidad

Objetivo:

- crear la capa nueva sin tocar estudios

Tareas:

- mantener `Portal Cliente` visible en header
- crear `api/company_portal.php`
- crear tablas nuevas
- sembrar `service_catalog`
- backfill de owners en `company_user_members`

Riesgo:

- bajo, porque es aditivo

### Fase 2. Home del Portal Cliente

Objetivo:

- separar el dashboard de estudios del home general

Tareas:

- `/empresa/dashboard` como home portal
- `/empresa/services/estudios` como acceso al modulo actual
- mantener estudios funcionando igual

Riesgo:

- bajo si las rutas de estudios no cambian

### Fase 3. Admin interno de clientes

Objetivo:

- permitir a Working crear empresas manualmente

Tareas:

- `/admin/clients`
- `/admin/clients/:companyUserId`
- `list_clients`
- `get_client`
- `create_client`
- `resend_client_invite`
- `save_client_services`

Dependencias:

- reutilizar invitacion actual
- no crear passwords manualmente desde admin

### Fase 4. Usuarios autorizados del cliente

Objetivo:

- permitir gestion de accesos internos del cliente

Tareas:

- `/empresa/users`
- CRUD de miembros
- permisos por servicio

Riesgo:

- medio, porque toca autorizacion

### Fase 5. Carpetas, subcarpetas y documentos

Objetivo:

- crear el workspace documental de servicios no estudios

Tareas:

- nodos jerarquicos
- carga y descarga
- estatus
- permisos por nodo

Riesgo:

- medio, por manejo de archivos y permisos

### Fase 6. Cotizaciones

Objetivo:

- convertir el portal en herramienta comercial

Tareas:

- formulario por servicio disponible
- adjuntos
- correo
- inbox admin

Riesgo:

- bajo a medio

### Fase 7. REPSE / BPO template

Objetivo:

- ofrecer estructura base reusable

Tareas:

- plantilla opcional de carpetas al activar servicio
- edicion manual por Working

Riesgo:

- bajo

## 12. Orden de implementacion recomendado

Si el objetivo es no romper nada, el orden exacto deberia ser:

1. terminar y validar `api/company_portal.php` base
2. dejar estable `/empresa/dashboard` y `/empresa/services/estudios`
3. construir admin de clientes
4. activar servicios por cliente
5. crear miembros autorizados
6. permisos por servicio
7. carpetas/subcarpetas
8. documentos
9. cotizaciones
10. inbox admin
11. REPSE / BPO template

No conviene empezar por carpetas o permisos antes de tener claro:

- como se crea la empresa
- quien es owner
- que servicios tiene activos

## 13. Estado actual del trabajo

### Ya hecho

- acceso visible `Portal Cliente`
- backlog tecnico dentro del repo
- `api/company_portal.php` creado como capa nueva
- tablas base nuevas creadas en codigo
- `service_catalog` sembrado
- backfill de owner memberships
- extraccion del dashboard de estudios a `/empresa/services/estudios`
- `/empresa/dashboard` convertido en home del Portal Cliente
- servicio de Estudios conectado como `module_link`

### Hecho pero pendiente de validacion PHP runtime

- helpers de invitacion y compatibilidad en `api/company_portal.php`
- lecturas de contexto y servicios desde el portal

Nota:

- aqui no se pudo correr `php.exe`, asi que la validacion backend final debe hacerse en un entorno con PHP instalado

## 14. Backlog de tickets

| ID | Ticket | Estado | Nota |
| --- | --- | --- | --- |
| PC-001 | Hacer visible el acceso publico `Portal Cliente`. | Complete | Ya implementado en header. |
| PC-002 | Crear backlog tecnico del portal dentro del repo. | Complete | Este archivo es la fuente de verdad. |
| PC-003 | Crear `api/company_portal.php` con tablas, seed y endpoints base. | In progress | Codigo agregado; falta validacion PHP runtime. |
| PC-004 | Extraer el dashboard de estudios a `/empresa/services/estudios`. | Complete | Mantiene el modulo existente. |
| PC-005 | Convertir `/empresa/dashboard` en home del Portal Cliente. | In progress | Frontend listo; falta validacion end-to-end con backend. |
| PC-006 | Crear admin de clientes para alta manual de empresas. | In progress | Endpoints backend y pantallas admin creadas; falta validacion runtime PHP en entorno con `php.exe`. |
| PC-007 | Permitir activar servicios por cliente desde admin. | In progress | Guardado de servicios y editor admin implementados; falta validacion runtime PHP en entorno con `php.exe`. |
| PC-008 | Agregar usuarios autorizados por empresa. | In progress | Endpoints backend, pagina `/empresa/users`, invitacion por correo y gestion basica de miembros implementados; falta validacion runtime PHP. |
| PC-009 | Agregar permisos por servicio y carpeta. | In progress | Permisos por servicio y carpeta ya integrados en codigo; falta validacion runtime PHP end-to-end. |
| PC-010 | Crear workspaces documentales por servicio. | In progress | CRUD base de carpetas/subcarpetas y vistas frontend ya integradas; falta validacion runtime PHP y permisos granulares por carpeta. |
| PC-011 | Crear carga y descarga de documentos. | In progress | Subida, listado, descarga y archivado implementados en codigo; falta validacion runtime PHP y refinamientos de permisos granulares. |
| PC-012 | Crear formulario de solicitud de cotizacion. | In progress | Flujo empresa + guardado + correo interno ya implementados; falta validacion runtime PHP end-to-end y pulido funcional. |
| PC-013 | Crear inbox admin para solicitudes. | In progress | Ruta y vista admin ya implementadas con detalle, estatus y notas; falta validacion runtime PHP end-to-end. |
| PC-014 | Agregar estructura sugerida REPSE / BPO. | In progress | Plantilla base editable ya sembrada en codigo; falta validacion runtime PHP end-to-end. |

## 15. Proxima implementacion recomendada

La siguiente entrega mas segura es:

1. terminar `PC-003`
2. consolidar `PC-008`
3. avanzar `PC-009`
4. consolidar `PC-010`
5. consolidar `PC-011`
6. consolidar `PC-012`
7. consolidar `PC-013`
8. construir `PC-014`

Es decir:

- cerrar validacion runtime del backend nuevo
- terminar la gestion de usuarios autorizados con pruebas funcionales
- extender permisos desde nivel servicio hacia carpetas/subcarpetas
- validar runtime del workspace documental ya integrado
- validar runtime del flujo de solicitud de cotizacion e inbox admin
- agregar la plantilla sugerida REPSE / BPO sobre el workspace documental

Eso desbloquea todo lo demas sin tocar el modulo de estudios.

## 16. Progreso verificado en esta iteracion

- Se agregaron helpers admin y endpoints nuevos en `api/company_portal.php` para:
  - `list_clients`
  - `get_client`
  - `create_client`
  - `update_client`
  - `resend_client_invite`
  - `save_client_services`
- Se abrio `list_service_catalog` para uso admin sin romper su uso actual por empresa.
- Se agrego el listado admin de clientes en `src/pages/AdminClientsPage.tsx`.
- Se agrego el detalle admin de cliente en `src/pages/AdminClientDetailPage.tsx`.
- Se conectaron las nuevas rutas:
  - `/admin/clients`
  - `/admin/clients/:companyUserId`
- Se agrego la entrada `Clientes portal` al menu admin.

## 17. Verificacion actual

- `tsc -b` paso correctamente usando el runtime local de Node.
- `vite build` paso correctamente y `dist` fue regenerado.
- La validacion runtime de `api/company_portal.php` sigue pendiente en un entorno con `php.exe`, porque esta maquina no lo tiene disponible en PATH.
- La validacion runtime de los cambios recientes en `api/studies.php` tambien sigue pendiente en un entorno con `php.exe`.

## 18. Progreso verificado en la iteracion actual

- Se agregaron endpoints nuevos en `api/company_portal.php` para gestion de usuarios autorizados:
  - `list_company_members`
  - `create_company_member`
  - `update_company_member`
  - `deactivate_company_member`
  - `resend_company_member_invite`
  - `get_company_member_permissions`
  - `save_company_member_permissions`
- Se implemento la pagina `src/pages/EmpresaUsersPage.tsx`.
- Se conecto la nueva ruta `/empresa/users`.
- Se agrego el acceso a `Usuarios autorizados` desde:
  - el dropdown del header
  - el menu movil
  - el home del Portal Cliente para usuarios con rol administrador cliente o gerente
- Se implemento filtrado de servicios visibles para usuarios con rol `authorized`, basado en `company_service_permissions`.
- Se extendio `api/studies.php` para que el acceso a estudios tambien contemple la membresia hacia la empresa raiz a traves de `company_user_members`, con el fin de soportar usuarios autorizados dentro del modulo existente.

## 19. Progreso verificado en la iteracion 2026-07-01

- Se termino la integracion frontend del workspace documental compartido en `src/components/Company/ServiceWorkspacePanel.tsx`.
- Se conecto la nueva ruta de empresa:
  - `/empresa/services/:slug`
- Se conecto la nueva ruta admin para gestionar el workspace de un cliente:
  - `/admin/clients/:companyUserId/services/:slug`
- Se agregaron las paginas:
  - `src/pages/EmpresaServiceWorkspacePage.tsx`
  - `src/pages/AdminClientServiceWorkspacePage.tsx`
- Se actualizo `src/pages/EmpresaDashboard.tsx` para que los servicios contratados de tipo `workspace` abran su espacio documental real y ya no queden como boton deshabilitado.
- Se actualizo `src/pages/AdminClientDetailPage.tsx` para que Working pueda abrir el workspace de cada servicio activo directamente desde el detalle del cliente.
- Quedo integrada la capa backend ya existente en `api/company_portal.php` para:
  - `get_company_service`
  - `list_service_nodes`
  - `create_service_node`
  - `update_service_node`
  - `archive_service_node`
  - `list_service_documents`
  - `upload_service_document`
  - `update_service_document`
  - `archive_service_document`
  - `download_service_document`

## 20. Verificacion actualizada

- `tsc -b` paso correctamente despues de integrar las nuevas rutas y paginas del workspace.
- `vite build` paso correctamente y `dist` fue regenerado el `2026-07-01`.
- La validacion runtime de `api/company_portal.php` sigue pendiente en un entorno con `php.exe`, porque esta maquina no lo tiene disponible en PATH.
- La validacion runtime de los endpoints documentales nuevos tambien sigue pendiente por la misma razon.

## 21. Progreso verificado en la iteracion 2026-07-09

- Se agregaron endpoints nuevos en `api/company_portal.php` para el flujo comercial del portal:
  - `create_service_inquiry`
  - `list_service_inquiries`
  - `get_service_inquiry`
  - `update_service_inquiry`
  - `download_service_inquiry_attachment`
- El endpoint de empresa ya guarda la solicitud en `service_inquiries`, conserva adjuntos opcionales en `service_inquiry_attachments` y dispara correo interno a Working.
- Se conecto el formulario de solicitud desde `src/pages/EmpresaDashboard.tsx` sobre la seccion de servicios disponibles para contratar.
- Se cambio el boton deshabilitado de servicios disponibles por una accion real de `Solicitar informacion`.
- Se agrego la nueva vista admin `src/pages/AdminServiceInquiriesPage.tsx`.
- Se conecto la nueva ruta admin:
  - `/admin/service-inquiries`
- Se agrego el acceso `Solicitudes portal` al menu admin para revisar:
  - detalle de la solicitud
  - adjuntos
  - estatus
  - notas internas

## 22. Verificacion actualizada en 2026-07-09

- `tsc -b` paso correctamente despues de integrar el flujo de solicitudes e inbox admin.
- `vite build` paso correctamente y `dist` fue regenerado el `2026-07-09`.
- La validacion runtime de `api/company_portal.php` sigue pendiente en un entorno con `php.exe`, porque esta maquina no lo tiene disponible en PATH.
- La validacion end-to-end del envio real por SMTP y del guardado runtime de adjuntos del inbox tambien sigue pendiente por la misma limitacion local.

## 23. Progreso verificado en la iteracion 2026-07-09

- Se agrego una plantilla base REPSE / BPO en `api/company_portal.php` para el servicio:
  - `specialized-services-repse-bpo`
- La plantilla se siembra de forma automatica al activar el servicio desde admin y no duplica carpetas existentes.
- La misma plantilla tambien se autocorrige al abrir un workspace REPSE / BPO ya existente, para cubrir clientes activados antes de este cambio.
- Las carpetas base sembradas actualmente son:
  - `Cumplimiento REPSE`
  - `Documentacion REPSE para clientes`
  - `Contratos`
  - `Evidencia documental mensual`
  - `Documentos solicitados para auditoria del cliente`
- Se agrego una nota visible en `src/components/Company/ServiceWorkspacePanel.tsx` para indicar que el servicio usa una estructura base editable.
- La edicion manual por Working sigue aprovechando el mismo workspace documental ya existente, sin crear otro flujo paralelo.

## 24. Verificacion actualizada en 2026-07-09

- `tsc -b` paso correctamente despues de integrar la plantilla base REPSE / BPO.
- `vite build` paso correctamente y `dist` fue regenerado el `2026-07-09`.
- La validacion runtime de `api/company_portal.php` para el sembrado automatico de carpetas REPSE sigue pendiente en un entorno con `php.exe`, porque esta maquina no lo tiene disponible en PATH.

## 25. Progreso verificado en la iteracion 2026-07-09

- Se extendio `api/company_portal.php` para que los permisos de usuarios autorizados ya no sean solo por servicio, sino tambien por carpeta:
  - `portal_member_permissions_payload`
  - `portal_member_permission_nodes_payload`
  - `portal_save_member_permissions`
  - `portal_member_node_access`
- El endpoint `get_company_member_permissions` ahora tambien puede entregar una plantilla vacia para nuevos usuarios y devuelve servicios con sus carpetas activas.
- Los endpoints del workspace ahora filtran contenido segun permisos granulares:
  - `list_service_nodes`
  - `list_service_documents`
  - `download_service_document`
- Se actualizo `src/pages/EmpresaUsersPage.tsx` para que el administrador cliente pueda:
  - asignar servicios visibles
  - limitar el acceso a carpetas especificas dentro de cada servicio
  - mantener acceso total al servicio cuando no se marcan carpetas internas

## 26. Verificacion actualizada en 2026-07-09

- `tsc -b` paso correctamente despues de integrar permisos por carpeta en el portal.
- `vite build` paso correctamente y `dist` fue regenerado el `2026-07-09`.
- La validacion runtime de `api/company_portal.php` para el guardado y filtrado efectivo de permisos por carpeta sigue pendiente en un entorno con `php.exe`, porque esta maquina no lo tiene disponible en PATH.
