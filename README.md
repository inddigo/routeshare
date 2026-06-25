# RouteShare

RouteShare es una aplicación móvil diseñada para coordinar y compartir rutas entre conductores y pasajeros. La plataforma permite a los usuarios ofrecer viajes disponibles o buscar y reservar asientos en rutas ya publicadas.

## Tecnologías principales

- Frontend: React Native / React
- Backend y Base de Datos: Supabase (PostgreSQL)
- Pagos: Integración con MercadoPago
- Ubicación y Mapas: Servicios de geolocalización, enrutamiento (ORS)

## Estructura del proyecto

- src/: Contiene el código fuente de la aplicación móvil (pantallas, componentes compartidos, navegación y servicios).
- backend/: Lógica adicional del servidor y configuraciones de Prisma.
- supabase/: Edge Functions de Supabase (pagos, notificaciones push, webhooks).
- database/migrations/: Migraciones SQL para la estructura de la base de datos en Supabase.
- android/ e ios/: Proyectos nativos correspondientes a cada plataforma.

## Requisitos previos

- Node.js (versión LTS recomendada)
- React Native CLI
- Entorno de desarrollo para Android (Android Studio) o iOS (Xcode)
- Proyecto de Supabase configurado y base de datos inicializada

## Instalación y ejecución

1. Instalar las dependencias del proyecto:
   npm install

2. Configurar las variables de entorno. Asegúrate de definir las credenciales para Supabase y MercadoPago.

3. Para ejecutar la aplicación en desarrollo:
   - En Android:
     npm run android
   - En iOS:
     npm run ios

## Base de datos

Las migraciones de la base de datos se encuentran en la carpeta database/migrations/. Estas incluyen la configuración de roles de usuario, políticas de seguridad (RLS), sistema de escrow para los pagos y manejo de calificaciones.
