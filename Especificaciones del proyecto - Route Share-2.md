#### **Plan de pruebas**

#### **Taller de Ingeniería de Software**

1. # **Datos proyecto**

| Equipo evaluado n° | 4 |
| :---- | :---- |
| **Integrantes** | **Vicente Bravo, Sebastian Espinoza, Fernando Figueroa, German Oses, Joaquin Perez, Javier Poblete, Claudio Troncoso, Joshua Villavicencio.** |

**Nombre proyecto**

|  RouteShare  |
| :---- |

2. # **Descripción general del proyecto y cliente**

RouteShare es una plataforma de carpooling hiper-local diseñada para la comunidad de la PUCV. Su objetivo es conectar a estudiantes conductores con pasajeros que comparten rutas hacia o desde los campus del eje Avenida Brasil, optimizando costos, mejorando la seguridad mediante validación institucional y reduciendo la huella de carbono.

3. # **Plataforma de desarrollo** 

Software:   
\- Frontend móvil: Aplicación diseñada mediante entornos de desarrollo para dispositivos móviles, enfocada en la creación de interfaces de usuario interactivas y dinámicas.  
\-Backend: Componente lógico del servidor encargado del procesamiento de los datos, las reglas de negocio y la comunicación con los servicios del sistema.  
\-Base de datos: Sistema de almacenamiento relacional estructurado para garantizar la consistencia, orden y seguridad de toda la información de los usuarios y viajes.  
\-Seguridad: Encriptación de credenciales mediante algoritmos de encriptación segura y administración de sesiones a través de autenticación temporal y control de accesos.  
\-Panel web de administrador: Aplicación desarrollada en un entorno web estándar, orientada al control interno, gestión de solicitudes y visualización de datos.

Hardware:   
\-Desarrollo local: Equipos de cómputo personales estándar para la programación, compilación y emulación local del sistema, independientes del sistema operativo de escritorio utilizado.  
\-Despliegue: Servicios de infraestructura en la nube para el alojamiento permanente de la lógica del servidor y el almacenamiento centralizado de los datos.

4. # **Ambiente de operación del sistema**

Software: El sistema móvil requiere sistema operativo Android 8.0 o superior. Para el panel de administrador, se requiere un navegador web actualizado (Chrome, Firefox, Edge).

Hardware: Dispositivo móvil (físico o emulador) con al menos 2 GB de RAM.

Requisitos externos: Conexión a internet estable y sensor GPS activo en el dispositivo móvil, el cual actualizará la ubicación cada 10 segundos.

5. # **Acceso al sistema y credenciales de ingreso**

El sistema se divide en dos plataformas para su revisión:

Quien es la persona encargada de los problemas con la instalación de la app

Aplicación Móvil (Pasajero/Conductor): Se debe descargar el APK de prueba a través del siguiente enlace :(https://nube.pucv.cl/routeshare-test-apk)

Panel de Administración (Web): Acceder mediante la URL: \[https://admin.routeshare.test\](https://admin.routeshare.test)

Credenciales de acceso para evaluación:

Perfil Pasajero:  
\-Correo: pasajero.prueba@pucv.cl  
\-Contraseña: RouteShare2026\*

Perfil Conductor (Documentos en revisión/aprobados):  
\-Correo: conductor.prueba@pucv.cl  
\-Contraseña: RouteShare2026\*

Perfil Administrador:  
\-Correo: admin.sistema@pucv.cl  
\-Contraseña: AdminSeguro2026\*

6. # **Identificación de todos los requerimientos funcionales.[^1]**

| Identificador requerimiento funcional | Descripción de requerimiento funcional | Considerado en plan de pruebas |
| ----- | ----- | ----- |
| **RF-PSJ-1** | **Registrar usuario (pasajero): Registro con datos personales, validación de correo @pucv.cl vía OTP y creación de contraseña segura.** | **SÍ** |
| **RF-PSJ-2** | **Buscar viaje: Búsqueda de rutas disponibles ingresando origen, destino (eje Avenida Brasil), fecha y rango horario.** | **SÍ** |
| **RF-PSJ-3** | **Reservar asiento: Solicitud de asiento en un viaje publicado mostrando tarifa, identidad del conductor y reputación.** | **SÍ** |
| **RF-PSJ-4 / 5** | **Validación de Abordaje (PIN): Entrega de un PIN de 3 dígitos al pasajero al momento de reservar un asiento.** | **SÍ** |
| **RF-PSJ-6** | **Visualizar puntos de recogida seguros: Visualización de un mapa con "Zonas de recogida seguras" o puntos estratégicos.** | **NO** |
| **RF-PSJ-7** | **Sistema de Pagos y Custodia: Pagos bajo custodia (Escrow) que se liberan tras validar la llegada.** | **SÍ** |
| **RF-PSJ-8** | **Acceder a soporte y ayuda: Sección de reportes para publicar incidentes y recibir respuestas del administrador.** | **NO** |
| **RF-PSJ-9** | **Validar llegada del conductor: Confirmación mediante la app de que el conductor llegó al punto de encuentro.** | **SÍ** |
| **RF-PSJ-10** | **Reembolso y No-Show: Reembolso del pago al usuario tras 10 minutos de inasistencia del conductor al punto de recogida.** | **SÍ** |
| **RF-COND-1** | **Selección y cambio de rol a conductor: Intercambio de interfaz tras la validación de documentos por el administrador.** | **SÍ** |
| **RF-COND-2** | **Registro de conductor y vehículo: Carga de licencia de conducir, hoja de vida del conductor y padrón vehicular en PDF.** | **SÍ** |
| **RF-COND-3** | **Publicación de rutas y puntos de encuentro: Planificación de rutas hacia/desde la universidad definiendo horarios, asientos y zonas de recogida.** | **SÍ** |
| **RF-COND-4** | **Gestión de Reservas y Cupos: Aceptar o rechazar pasajeros, descontando o liberando asientos automáticamente.** | **SÍ** |
| **RF-COND-5** | **Validación de Abordaje (PIN): Interfaz para que el conductor ingrese el PIN de 3 dígitos y cambie el estado a "A bordo".** | **SÍ** |
| **RF-COND-6** | **Gestión del estado del viaje y confirmación de llegada: Inicio formal del viaje y finalización obligatoria para liberar fondos en custodia.** | **SÍ** |
| **RF-COND-7** | **Reporte de inasistencia (No-Show): Reporte de inasistencia tras 10 minutos para habilitar la cancelación.** | **SÍ** |
| **RF-COND-8** | **Calificación de pasajeros (Reputación bidireccional): Calificación del pasajero para alimentar el sistema de reputación.** | **NO** |
| **RF-ADMIN-1**  | **Validación sobre conductor y vehículo: Verificación y aprobación/rechazo manual de licencias, hojas de vida y padrones.** | **SÍ** |
| **RF-ADMIN-2**  | **Registro del administrador: Creación de cuenta restringida con correo institucional @pucv.cl y contraseña segura.** | **NO** |
| **RF-ADMIN-3**  | **Panel de Control Web (Dashboard): Interfaz web exclusiva con métricas, solicitudes pendientes y alertas.** | **SÍ** |
| **RF-ADMIN-4**  | **Gestión de reportes e incidentes: Visualización de tickets de soporte y cambio de estados (Pendiente, En revisión, Resuelto).** | **NO** |
| **RF-ADMIN-5**  | **Bloqueo y suspensión de usuarios: Capacidad de suspender temporal o permanentemente a usuarios infractores.** | **NO** |
| **RF-ADMIN-6**  | **Auditoría de pagos y reembolsos (Escrow): Auditoría del flujo de pagos y liberación o reembolso manual en caso de disputas.** | **NO**  |
| **RF-ADMIN-7**  | **Gestión de "Zonas Seguras": Configuración, adición o eliminación de puntos de encuentro estratégicos desde el panel web.**  | **NO**  |
| **RF-ADMIN-8**  | **Visualización y gestión de usuarios (Pasajeros): Listado general de usuarios, visualizando estado, reputación y datos validados.**  | **NO**  |
| **RF-ADMIN-9**  | **Monitoreo global de viajes e historial: Visualización de rutas publicadas en el eje Avenida Brasil, viajes activos e historial.**  | **NO**  |
| **RF-ADMIN-10**  | **Registro de auditoría integral (Logs): Registro automático de acciones críticas de administradores (fechas, responsables, entidades afectadas).**  | **NO**  |
| **RF-SIST-1**  | **Sistema de Pagos y Custodia: Retención del costo del viaje y liberación menos comisión (5-10%) al confirmar llegada.**  | **SÍ** |
| **RF-SIST-2**  | **Reembolso y No-Show: Monitoreo GPS en tiempo real y cancelación automática tras 10 minutos de espera, con devolución del 100%.**  | **SÍ** |

7. **Detalle Casos de Prueba** 

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P01 |
| **Requerimiento asociado:**  | RF-PSJ-1: Registrar usuario  |
| **Nombre de la prueba :** | Registro de Usuario Pasajero. |
| **Descripción de la prueba :** | El usuario debe poder crear una cuenta utilizando exclusivamente su correo institucional y validando su identidad vía OTP. |
| **Actores:** | Estudiante (Pasajero). |
| **Pre-condiciones:** | No tener una cuenta activa en el sistema y contar con acceso al correo @pucv.cl. |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
| El usuario selecciona "Registrarse" en la App móvil. 3\.    El usuario ingresa sus datos y un correo con       dominio @pucv.cl.  5\. El usuario ingresa el código OTP recibido.  | 2\. El sistema despliega el formulario de registro (Nombre, RUT, Correo, Contraseña). 4\.    El sistema valida el dominio y envía un código OTP de 6 dígitos al correo ingresado.  6\. El sistema verifica el código y crea la cuenta del usuario exitosamente.  |
| **Excepciones.** |  |
| Si el correo no pertenece al dominio @pucv.cl, el sistema bloquea el registro y muestra una alerta.  Si el OTP es incorrecto, el sistema informa del error y permite reintentar el ingreso.  |  |
| **Post-condiciones:** | El usuario queda registrado y puede iniciar sesión como pasajero.  |

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P02.1 |
| **Requerimiento asociado:**  | RF-COND-2: Registro de conductor y vehículo |
| **Nombre de la prueba :** | Carga de Documentos de Conductor y Vehículo.  |
| **Descripción de la prueba :** | El usuario con perfil pasajero debe poder cargar su documentación obligatoria en formato PDF para iniciar su postulación al rol de conductor. |
| **Actores:** | Estudiante (Pasajero). |
| **Pre-condiciones:** | Tener una cuenta activa con perfil Pasajero y no poseer un proceso de postulación activo o previo. |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
| El usuario selecciona la opción "Postular como Conductor" en la App móvil.       3\. El usuario adjunta los tres archivos correspondientes en formato PDF y presiona el botón "Enviar".     | 2\.  El sistema despliega el formulario de postulación solicitando obligatoriamente la Licencia de Conducir, Hoja de Vida y Padrón Vehicular. 4\. El sistema valida que los archivos cumplan con la extensión requerida, los almacena en el servidor, cambia el estado de la postulación a "Pendiente" y muestra un mensaje de éxito en pantalla.  |
| **Excepciones.** |  |
| Si alguno de los archivos cargados no pertenece al formato PDF o supera el peso máximo permitido, el sistema bloquea el envío y despliega una alerta indicando el error específico. |  |
| **Post-condiciones:** | Los documentos quedan guardados en la base de datos vinculados al perfil del usuario con estado "Pendiente". |

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P02.2  |
| **Requerimiento asociado:**  | RF-ADMIN-1: Validación sobre conductor y vehículo  |
| **Nombre de la prueba :** | Revisión y Aprobación de Documentos por el Administrador. |
| **Descripción de la prueba :** | El administrador del sistema debe ser capaz de auditar, visualizar y aprobar las solicitudes de documentos enviadas por los postulantes desde el panel web de control. |
| **Actores:** | Administrador. |
| **Pre-condiciones:** | Existen en la base de datos solicitudes de conductor en estado "Pendiente" con archivos PDF adjuntos legibles. |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
|        1.El administrador accede al Dashboard web e ingresa a la sección "Solicitudes Pendientes".       3\. El administrador selecciona la solicitud específica del usuario de prueba para auditarla. 5\. El administrador presiona el botón "Aprobar" tras verificar la vigencia y legalidad de todos los datos en los archivos.     | 2\.  El sistema despliega de forma ordenada la lista completa de los usuarios en espera de validación de documentos. 4\. El sistema abre el visor integrado de documentos PDF en pantalla y habilita de forma interactiva los botones de "Aprobar" y "Rechazar". 6\. El sistema actualiza el estado interno de la postulación a "Aprobado" y remueve automáticamente el registro de la lista de solicitudes pendientes en el panel.  |
| **Excepciones.** |  |
| Si el administrador presiona el botón "Rechazar", el sistema levanta una ventana emergente obligatoria exigiendo ingresar el motivo del rechazo (ej. "PDF ilegible") antes de procesar el cambio de estado. |  |
| **Post-condiciones:** | El registro de postulación del usuario pasa de forma permanente al estado "Aprobado" en la base de datos. |

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P02.3  |
| **Requerimiento asociado:**  | RF-COND-1: Selección y cambio de rol a conductor  |
| **Nombre de la prueba :** | Activación e Intercambio de Interfaz al Rol Conductor.  |
| **Descripción de la prueba :** | Un usuario que ha sido aprobado por la administración debe ver habilitadas las funciones de conductor en su aplicación móvil y poder alternar su entorno gráfico.  |
| **Actores:** | Estudiante (Pasajero / Conductor).  |
| **Pre-condiciones:** | El usuario cuenta con su postulación de conductor en estado "Aprobado" en la base de datos (Caso P02.2 exitoso).  |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
|       1\. El usuario abre la App móvil o realiza una acción de refresco de pantalla desde su sesión activa.        3\. El usuario presiona el botón de intercambio "Cambiar a modo Conductor".     | 2\.  El sistema consulta los privilegios actualizados del usuario, detecta el estado "Aprobado" e inyecta la opción "Cambiar a modo Conductor" en el menú de navegación. 4\. El sistema oculta el entorno de pasajero y despliega la interfaz de conductor, permitiendo el acceso a las funciones correspondientes a este rol.  |
| **Excepciones.** |  |
| Si ocurre un fallo de conectividad de red al intentar verificar los nuevos permisos con el servidor, el sistema mantiene la interfaz básica de pasajero y arroja un mensaje sugiriendo reintentar la sincronización en unos instantes. |  |
| **Post-condiciones:** | La sesión de la aplicación móvil queda operando de forma activa bajo las reglas y vistas del rol Conductor. |

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P03.1 |
| **Requerimiento asociado:**  | RF-PSJ-2: Buscar viaje |
| **Nombre de la prueba :** | Búsqueda de Rutas Disponibles hacia el Eje Avenida Brasil. |
| **Descripción de la prueba :** | El pasajero debe poder filtrar y visualizar los viajes programados por conductores ingresando parámetros geográficos y temporales específicos. |
| **Actores:** | Pasajero. |
| **Pre-condiciones:** | Debe existir al menos una ruta de viaje activa e ingresada en el sistema que coincida con el destino del eje Avenida Brasil y el rango horario buscado. |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
|      1\. El usuario ingresa al buscador de la App e introduce los datos requeridos: punto de origen, destino (eje Avenida Brasil), fecha y rango horario de salida.      3\. El usuario presiona el botón "Buscar".     | 2\. El sistema recibe los parámetros de filtrado y ejecuta la consulta sobre la colección de viajes activos.  4\. El sistema despliega en pantalla la lista de resultados coincidentes, detallando el valor de la tarifa, la identidad del conductor y su reputación. |
| **Excepciones.** |  |
|    1\. Si la base de datos no arroja registros que coincidan exactamente con los criterios de búsqueda provistos, el sistema muestra en la pantalla un mensaje informativo de "No se encontraron viajes disponibles" y sugiere flexibilizar las horas.  |  |
| **Post-condiciones:** | El pasajero visualiza en su pantalla la oferta de viajes disponibles sin alterar ningún dato en los servidores. |

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P03.2  |
| **Requerimiento asociado:**  | RF-PSJ-3: Reservar asiento  RF-COND-4: Gestión de Reservas y Cupos  |
| **Nombre de la prueba :** | Solicitud de Reserva y Bloqueo Preventivo de Cupo.  |
| **Descripción de la prueba :** | Al seleccionar una opción válida, el pasajero debe poder iniciar el proceso de apartado bloqueando temporalmente el asiento del vehículo para evitar problemas de sobreventa.  |
| **Actores:** | Pasajero. |
| **Pre-condiciones:** | El pasajero completó la búsqueda (P03.1) y ha seleccionado un viaje de la lista que posee asientos vacíos disponibles. |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
|      1\. El usuario presiona sobre el viaje de interés dentro de la lista de resultados mostrada.       3\. El usuario presiona el botón interactivo "Reservar Asiento".      | 2\. El sistema abre la vista detallada mostrando la tarifa, la identidad del conductor y su reputación.  4\. El sistema descuenta automáticamente un cupo de los asientos del vehículo en la base de datos y redirige a la pantalla de pago. |
| **Excepciones.** |  |
|    1\. Si otro usuario confirma una reserva en el último asiento libre un instante antes, el sistema cancela la acción, levanta una alerta informando que el viaje ya no cuenta con cupos disponibles y actualiza la lista del buscador. |  |
| **Post-condiciones:** | El cupo del vehículo queda disminuido de forma temporal a la espera de la confirmación del procesamiento monetario. |

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P03.3  |
| **Requerimiento asociado:**  | RF-PSJ-7: Sistema de Pagos y Custodia   RF-PSJ-4 / 5: Validación de Abordaje (PIN) RF-SIST-1: Sistema de Pagos y Custodia  |
| **Nombre de la prueba :** | Procesamiento de Pago en Custodia (Escrow) y Emisión de PIN.  |
| **Descripción de la prueba :** | El pasajero procesa el pago de la tarifa correspondiente, reteniendo los fondos en la cuenta de custodia del sistema y obteniendo su código de seguridad para el abordaje. |
| **Actores:** | Pasajero. |
| **Pre-condiciones:** | El usuario posee una pre-reserva activa con un cupo bloqueado de forma temporal (Caso P03.2 completado de manera exitosa). |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
|      1\. El usuario corrobora el resumen del cobro en la pantalla de pagos integrada y presiona "Confirmar y Pagar".      3\. El usuario aprueba la transacción de fondos de manera exitosa.    | 2\. El sistema gestiona la transacción por el monto exacto de la tarifa con la pasarela bancaria.  4\. El sistema confirma la recepción del pago, retiene los fondos en la cuenta de custodia (Escrow), valida definitivamente la reserva, genera un PIN de 3 dígitos para el pasajero y despliega la pantalla de éxito con dicho código. |
| **Excepciones.** |  |
|    1\. Si la entidad bancaria externa rechaza la transacción, el sistema informa del error en pantalla, cancela el flujo, libera inmediatamente el cupo reservado en el vehículo (restaurando el asiento disponible) y no genera ningún PIN. |  |
| **Post-condiciones:** | El dinero de la tarifa queda retenido bajo la custodia del sistema y el pasajero posee su PIN de validación. |

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P04 |
| **Requerimiento asociado:**  | RF-COND-5: Validación de Abordaje  RF-PSJ-4/5: Validación de Abordaje  |
| **Nombre de la prueba :** | Validación de Abordaje Mediante PIN de Seguridad.  |
| **Descripción de la prueba :** | El conductor debe verificar la identidad del pasajero e iniciar formalmente el viaje digitando en su interfaz el PIN numérico provisto por el usuario para cambiar su estado a "A bordo". |
| **Actores:** | Conductor y Pasajero.  |
| **Pre-condiciones:** | Ambas partes se encuentran en el punto de encuentro; el pasajero posee el PIN de 3 dígitos generado por la plataforma (P03.3 exitoso). |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
|    1\. El pasajero le dicta su código PIN de 3 dígitos al conductor.    3\. El conductor presiona el botón "Validar Abordaje".  | 2\. El conductor ingresa el PIN en la interfaz de "Pasajeros en espera" de su aplicación.  4\. El sistema verifica que el PIN ingresado coincida con el código de la reserva activa.  5\. El sistema confirma la validación y cambia el estado del pasajero a "A bordo". |
| **Excepciones.** |  |
|   1\. Si el PIN ingresado por el conductor no es correcto, el sistema muestra el mensaje "PIN Inválido" y mantiene al pasajero en estado "Pendiente". |  |
| **Post-condiciones:** | El pasajero cambia oficialmente al estado "A bordo" en el sistema para el viaje activo. |

| Identificación de la prueba. |  |
| ----- | ----- |
| **Identificador de la prueba :** | P05 |
| **Requerimiento asociado:**  | RF-SIST-2: Reembolso y No-Show  RF-PSJ-10: Reembolso y No-Show  RF-COND-7: Reporte de inasistencia  |
| **Nombre de la prueba :** | Cancelación Automática por No-Show (10 Minutos).  |
| **Descripción de la prueba :** | El sistema debe monitorear el tiempo y la ubicación GPS para cancelar automáticamente el servicio y reembolsar el 100% de los fondos al pasajero si el conductor no se presenta en el tiempo pactado.  |
| **Actores:** | Sistema (Automático).  |
| **Pre-condiciones:** | Se ha alcanzado la hora programada del viaje y el conductor no se encuentra en el punto de encuentro. |
| **Actividades**. |  |
| **Evento** | **Respuesta del Sistema** |
|   1\. El reloj del sistema detecta que han transcurrido 10 minutos desde la hora programada de inicio.   3\. El sistema ejecuta la rutina automática de cancelación por inasistencia.  | 2\. El sistema verifica mediante el monitoreo GPS en tiempo real que el conductor no está en el rango del punto de recogida.    4\. El sistema procesa la devolución del 100% de los fondos desde el Escrow al pasajero.  5\. El sistema libera el cupo del asiento y anula el servicio. |
| **Excepciones.** |  |
|   1\. Si el conductor llega al punto de encuentro dentro del margen de tolerancia de 10 minutos, la cancelación automática se desactiva. |  |
| **Post-condiciones:** | El pasajero recibe el reembolso de su dinero y el viaje queda cancelado en el sistema por incumplimiento. |

8. **Rúbrica plan de pruebas**

| Equipo evaluador n° |  |  |  |  |  |  |
| ----- | :---: | :---- | :---: | :---: | :---: | :---: |
| **Participan de la evaluación** |  |  |  |  |  |  |
| **Fecha** |  |  | **Hora inicio** |  | **Hora Término** |  |

| Aspecto | Muy bueno (4) | Bueno (3) | Suficiente (2) | Insuficiente (1) |
| :---: | :---: | :---: | :---: | :---: |
| **Completitud** | El plan de prueba abarca, como mínimo, un 70% de las principales funcionalidades del sistema, indicadas por el equipo evaluado. | El plan de prueba abarca, menos del 70% y más del 50% de las principales funcionalidades del sistema, indicadas por el equipo evaluado. | El plan de prueba abarca, menos del 50% y más del 30% de las principales funcionalidades del sistema, indicadas por el equipo evaluado | Con el plan de prueba presentado no se logra evaluar ninguna de las principales funcionalidades del sistema, indicadas por el equipo evaluado. |
|  **Coherencia** | Existe claridad y relación lógica entre, el caso de prueba de las principales funcionalidades del sistema de los casos de prueba presentados y la respuesta del sistema, como mínimo en un 70% de ellos. | Existe claridad y relación lógica entre, el caso de prueba de las principales funcionalidades del sistema de los casos de prueba presentados y la respuesta del sistema, en más de un 50% y menos de un 70%. | Existe claridad y relación lógica entre, el caso de prueba de las principales funcionalidades del sistema de los casos de prueba presentados y la respuesta del sistema, en más de un 30% y menos de un 50%. | Existe claridad y relación lógica entre, el caso de prueba de las principales funcionalidades del sistema de los casos de prueba presentados y la respuesta del sistema, en menos de un 30%. |
| **Funcionalidad** | Cada prueba descrita da como respuesta del sistema lo esperado, en más de un 70% de los casos planteados. | Cada prueba descrita da como respuesta del sistema lo esperado, en más de un 50% y menos de un 70%. | Cada prueba descrita da como respuesta del sistema lo esperado, en más de un 30% y menos de un 50%. | Cada prueba descrita da como respuesta del sistema lo esperado, en menos de un 30%. |
| **Diseño**    | El detalle de los casos de prueba que se deben realizar contiene el paso a paso de la ejecución de cada uno de estos, lo que permite verificar si el resultado es exitoso o fallido en más de un 70% de los casos. | El detalle de los casos de prueba que se deben realizar contiene el paso a paso de la ejecución de cada uno de estos, lo que permite verificar si el resultado es exitoso o fallido en un 50% o más y menos de un 70%. | El detalle de los casos de prueba que se deben realizar contiene el paso a paso de la ejecución de cada uno de estos, lo que permite verificar si el resultado es exitoso o fallido en un 30% o más y menos de un 50%. | El detalle de los casos de prueba que se deben realizar contiene el paso a paso de la ejecución de cada uno de estos, lo que permite verificar si el resultado es exitoso o fallido en menos de un 30%. |
| **Mensajes de interacción usuario/sistema** | Los mensajes de interacción usuario/sistema son consistentes con la funcionalidad del sistema que se está probando, en más de un 70%. | Los mensajes de interacción usuario/sistema son consistentes con la funcionalidad del sistema que se está probando, en un 50% o más y menos de un 70%. | Los mensajes de interacción usuario/sistema son consistentes con la funcionalidad del sistema que se está probando, en un 30% o más y menos de un 50%. | Los mensajes de interacción usuario/sistema son consistentes con la funcionalidad del sistema que se está probando, en menos de un 30%. |
| **Redacción** | La descripción de las pruebas es muy buena permitiéndole al equipo evaluador su completa comprensión, por lo que logra realizarlas en más de un 70% de los casos sin la necesidad de inferir. | La descripción de las pruebas permite al equipo evaluador una buena comprensión, por lo que logra realizarlas en un 50% o más de los casos sin la necesidad de inferir y menos de un 70%. | La descripción de las pruebas permite al equipo evaluador comprender de manera suficiente, por lo que logra realizarlas en un 30% o más de los casos sin la necesidad de inferir y menos de un 50%. | La descripción de las pruebas es insuficiente, no permite al equipo evaluador su comprensión, requiriendo la necesidad de inferir en más de un 30% de los casos. |

9. # **Errores/Mejoras detectados en el sistema (no considerados en los casos de prueba)[^2]**

| Funcionalidad del sistema | Error/mejoras detectadas |
| ----- | ----- |
|  |  |

10. # **Observaciones generales al plan de prueba ejecutado**

**\<**Agregar comentarios adicionales, que no fueron considerados en la rúbrica. Como, por ejemplo, a juicio del equipo evaluador, el plan de pruebas se encontraba bien diseñado. Mencionar fortalezas, debilidades, oportunidades de mejora del plan de prueba\> 

[^1]:  (agregar las filas que sean necesarias)

[^2]:  Agregar tantas filas como sean necesarias