# Durango.cerca.de.ti

Vitrina digital para los pequeños comercios de Durango, Dgo. — proyecto desarrollado en **12 horas** durante el hackathon HackDays, participando en la categoría **"Mejor uso de la API de Gemini"**.

## ¿Qué es?

Una plataforma donde los ciudadanos pueden descubrir negocios locales cerca de ellos a través de un mapa interactivo y un chatbot con inteligencia artificial, y donde los dueños de comercios pueden registrar y actualizar su ficha de negocio de manera sencilla.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL + Knex.js (migraciones y seeds) |
| Autenticación | Google OAuth 2.0 (`@react-oauth/google` + `google-auth-library`) |
| Mapas | Google Maps JavaScript API (`@react-google-maps/api`) |
| IA / Chatbot | Google Gemini 1.5 Flash |
| Subida de imágenes | Multer (almacenamiento local, servido como estático) |
| Enrutamiento | React Router v6 |

---

## Funcionalidades implementadas

### Para el ciudadano
- **Mapa interactivo** con marcadores de todos los comercios registrados; al tocar un pin aparece el nombre y categoría.
- **Chatbot Gemini** (botón flotante) que responde en lenguaje natural preguntas como "¿dónde puedo comprar herramientas baratas?" usando el contexto real de los comercios de la base de datos y la ubicación GPS del usuario.
- Navegación por tab bar inferior: Inicio, Mapa, Chat, Mi Negocio.

### Para el comerciante
- **Login con Google** — sin contraseña, un solo toque.
- **Formulario de registro y edición de negocio** con:
  - Nombre, descripción (hasta 280 caracteres), categoría, dirección en texto.
  - **Mini-mapa con pin arrastrable** para ubicar el negocio con precisión.
  - Horario en formato libre.
  - Datos de contacto: WhatsApp (validado a 10 dígitos), correo y nombre de usuario de Instagram.
  - **Subida de foto de perfil desde el dispositivo** (JPG/PNG/WebP, hasta 5 MB).
- Pantalla "Mi Negocio" para ver, editar o eliminar la ficha existente.

---

## Arquitectura del backend

```
backend/
├── src/
│   ├── app.js                    # Express + middlewares + rutas
│   ├── server.js                 # Arranque del servidor
│   ├── controllers/
│   │   ├── auth.controller.js    # Valida token Google → JWT
│   │   ├── comercios.controller.js  # CRUD de comercios con sanitización
│   │   ├── chat.controller.js    # Proxy hacia Gemini
│   │   └── upload.controller.js  # Multer + retorna URL pública
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── comercios.routes.js
│   │   ├── chat.routes.js
│   │   └── upload.routes.js
│   ├── services/
│   │   ├── gemini.service.js     # Construcción del mega-prompt + llamada a Gemini
│   │   └── auth.service.js
│   ├── middlewares/
│   │   └── auth.middleware.js    # Verificación de JWT
│   └── db/
│       ├── knexfile.js
│       ├── migrations/           # Estructura de tablas
│       └── seeds/                # 15-20 comercios reales de Durango
└── uploads/                      # Imágenes subidas (ignorado en git)
```

### Flujo del chatbot
1. El ciudadano escribe en lenguaje natural y el frontend envía la pregunta + coordenadas GPS.
2. El backend consulta todos los comercios de la base de datos.
3. Construye un prompt contextualizado: ubicación del usuario + lista de comercios + pregunta.
4. Gemini 1.5 Flash responde recomendando los negocios más relevantes con explicación.
5. La respuesta se cachea para no agotar la cuota durante la demo.

---

## Variables de entorno

Copia `.env.example` a `.env` en cada subcarpeta y completa los valores:

### `backend/.env`
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=durango_cerca_de_ti
DB_USER=<tu_usuario_postgres>
DB_PASSWORD=<tu_contraseña>
GOOGLE_CLIENT_ID=<id_de_tu_proyecto_google>
JWT_SECRET=<cadena_aleatoria_larga>
GEMINI_API_KEY=<tu_api_key_de_gemini>
```

### `frontend/.env`
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=<mismo_id_google>
VITE_GOOGLE_MAPS_API_KEY=<api_key_de_google_maps>
```

---

## Instalación y desarrollo local

### Requisitos previos
- Node.js 18+
- PostgreSQL corriendo localmente
- Cuenta de Google Cloud con Maps API, OAuth y Gemini API habilitadas

### Backend
```bash
cd backend
npm install

# Crear la base de datos (la primera vez)
createdb -U <tu_usuario> durango_cerca_de_ti

# Correr migraciones y cargar datos de ejemplo
npm run migrate
npm run seed

# Iniciar en modo desarrollo
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` y se conecta al backend en `http://localhost:3000`.

---

## Decisiones de diseño

- **UX para usuarios 50+**: tipografía ≥ 18 px, botones ≥ 48 × 48 px, contraste WCAG AA, máximo 3 toques por acción, copys sin jerga técnica.
- **Paleta**: azul marino (`#1e3f72`) + escala de grises, acordes a la identidad del Gobierno de Durango.
- **Tab bar inferior** para navegación principal en móvil.
- **Chatbot flotante** siempre accesible desde cualquier pantalla.
- **Datos seedeados primero**: el mapa y el chat funcionan aunque no haya comerciantes registrados todavía.
- **Sin contraseñas**: solo Google Login para reducir la fricción al mínimo.
