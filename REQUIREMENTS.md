# Durango.cerca.de.ti — Documento de Requerimientos

> Hackathon: HackDays — 12 horas
> Fecha: 2026-06-06
> Equipo: 2 personas (Leonardo + 1)
> Repo: Durango.cerca.de.ti

---

## 1. Contexto y visión

Vitrina digital local para los comercios de Durango, México. Una app web donde los pequeños negocios (tienditas, mercados, artesanos, talleres, restaurantes, servicios) tengan presencia digital sin necesidad de redes sociales complejas, y donde los ciudadanos descubran qué hay cerca de ellos mediante mapa y chatbot conversacional.

**Visión:** que cualquier persona en Durango pueda preguntar en lenguaje natural "¿dónde hay una ferretería cerca de mí?" y obtener una respuesta útil y local, mientras los comerciantes ganan alcance sin pelearse con la tecnología.

---

## 2. Problema que se resuelve

- Los micro y pequeños comercios de Durango son invisibles en internet: Google Maps los ignora, no tienen redes y los marketplaces grandes no los cubren.
- Los ciudadanos no saben qué hay a 3 cuadras de su casa y terminan yendo a grandes cadenas por desconocimiento.
- Las plataformas existentes son demasiado complejas para un dueño de 50+ años que apenas usa WhatsApp.

---

## 3. Usuarios objetivo

### 3.1 Comerciante (perfil primario)
- Dueño de micro/pequeño/mediano negocio en Durango.
- Edad típica: **50+ años**, no nativo digital.
- Usa WhatsApp, a veces Facebook, rara vez Instagram.
- Necesita una experiencia con **mínima fricción**: pocos pasos, botones grandes, lenguaje claro, sin jerga.
- Quiere: que la gente lo encuentre, tener un "perfil" simple, recibir contacto por WhatsApp.

### 3.2 Ciudadano
- Residente o visitante de Durango.
- Cualquier edad, usuario casual de mapas y buscadores.
- Quiere: descubrir comercios cercanos rápido, sin instalar nada, sin registrarse.

---

## 4. Objetivos del MVP

1. Que un comerciante pueda publicar su ficha en menos de 5 minutos, con Google Login.
2. Que un ciudadano abra la app, vea su ubicación y los comercios cercanos en mapa sin registrarse.
3. Que el ciudadano pueda **conversar con un chatbot** (Gemini) y recibir recomendaciones locales.
4. Tener una **demo en vivo funcional** al cierre de las 12 horas.

---

## 5. Categoría del hackathon

**MEJOR USO DE LA API DE GEMINI.**

Implicación de diseño: el chatbot no es un accesorio, es el **diferenciador central**. Toda decisión de priorización debe favorecer que el chatbot llegue al demo en su mejor forma.

---

## 6. Criterios de evaluación

1. **Impacto real en el alcance de los negocios** — el pitch debe mostrar cómo un comercio invisible se vuelve descubrible.
2. **ULTRA fácil de usar** — accesibilidad y simplicidad para usuarios no nativos digitales (50+).
3. **Uso destacado de Gemini** — el chatbot debe responder con calidad y contexto local.

---

## 7. Alcance funcional

### 7.1 Flujo del comerciante
- **RF-01**: Iniciar sesión con Google Login.
- **RF-02**: Crear ficha de comercio con los campos del punto 7.4.
- **RF-03**: Subir foto de perfil/logo y galería de fotos.
- **RF-04**: Editar su ficha posteriormente.
- **RF-05**: Ver vista previa de cómo lo verá un ciudadano.

### 7.2 Flujo del ciudadano
- **RF-06**: Al abrir la app, solicitar permiso de geolocalización.
- **RF-07**: Mostrar mapa centrado en su ubicación con pines de comercios cercanos.
- **RF-08**: Mostrar listado de comercios cercanos (alternativa al mapa).
- **RF-09**: Tocar un pin/ítem para abrir la ficha completa del comercio.
- **RF-10**: Desde la ficha, contactar por WhatsApp / correo / Instagram con un clic.
- **RF-11**: Acceder al chatbot desde cualquier pantalla.

### 7.3 Chatbot Gemini (feature central)
- **RF-12**: Interfaz de chat conversacional accesible desde botón flotante o pantalla dedicada.
- **RF-13**: Aceptar consultas en lenguaje natural en español ("ferreterías cerca de mí", "dónde como barato", "una tienda que venda hilo").
- **RF-14**: El backend envía a Gemini un prompt que incluye:
  - La pregunta del usuario.
  - La ubicación del usuario.
  - Lista (o subconjunto relevante) de comercios cargados en la DB con sus datos.
- **RF-15**: Gemini responde con recomendaciones contextualizadas en lenguaje natural, citando comercios concretos.
- **RF-16**: La respuesta debe linkear/referenciar las fichas para que el usuario pueda abrirlas.
- **RB-01**: Si no hay comercios relevantes, el chatbot debe decirlo honestamente, no inventar.
- **RB-02**: Cachear respuestas a preguntas frecuentes para no quemar cuota de la API durante la demo.

### 7.4 Ficha de comercio (modelo de datos)

Entidad `comercio`:
- `id` (UUID)
- `nombre` (string, requerido)
- `descripcion_breve` (text, máx. 280 caracteres)
- `colaboradores` (string o array — quiénes trabajan ahí)
- `ubicacion` (lat, lng) + `direccion_texto` (string)
- `horario` (estructura simple: días + apertura/cierre, o texto libre para MVP)
- `contacto_whatsapp` (string)
- `contacto_correo` (string)
- `contacto_instagram` (string)
- `foto_perfil_url` (string)
- `galeria_urls` (array de strings)
- `categoria` (string libre o enum simple: "ferretería", "comida", "artesanía", "servicios", etc.)
- `owner_google_id` (FK al usuario que lo creó)
- `created_at`, `updated_at`

Entidad `usuario`:
- `id`, `google_id`, `email`, `nombre`, `created_at`.

---

## 8. Requerimientos no funcionales

### 8.1 Usabilidad (ULTRA fácil — accesibilidad para 50+)
- **RNF-01**: Tipografía base mínimo 18px, botones de al menos 48x48px.
- **RNF-02**: Contraste alto (WCAG AA mínimo).
- **RNF-03**: Sin jerga técnica en copys; lenguaje coloquial mexicano.
- **RNF-04**: Cada acción del comerciante debe ser ≤ 3 toques desde la pantalla principal.
- **RNF-05**: Mensajes de error claros y accionables ("no encontramos tu ubicación, escribe tu colonia aquí").

### 8.2 Performance
- **RNF-06**: Carga inicial < 3 segundos en conexión móvil promedio.
- **RNF-07**: Respuesta del chatbot < 5 segundos (mostrar indicador "pensando…").

### 8.3 Seguridad básica
- **RNF-08**: Auth solo vía Google OAuth (no manejamos contraseñas).
- **RNF-09**: API keys (Maps, Gemini) en variables de entorno, nunca en el repo.
- **RNF-10**: Validación server-side de que solo el dueño puede editar su comercio.
- **RNF-11**: Subida de imágenes con límite de tamaño (ej. 5MB) y tipos permitidos.

---

## 9. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React |
| Backend / API | Node (o Python — definir en setup) sirviendo REST |
| Base de datos | PostgreSQL |
| Hosting | Google Cloud (Cloud Run o App Engine) |
| Auth | Google OAuth (Google Login) |
| Mapas | Google Maps JavaScript API |
| IA / Chatbot | Gemini API |
| Almacenamiento de imágenes | Google Cloud Storage |
| Repositorio | GitHub |

---

## 10. Equipo y roles

- **Leonardo** + 1 compañero.
- División tentativa: 1 frontend (React + Maps + UI del chatbot), 1 backend (PostgreSQL + endpoints + integración Gemini + OAuth).
- Apoyo cruzado cuando uno se atore.
- Pitch se construye en la última hora con quien esté menos saturado.

---

## 11. Plan de trabajo priorizado (12h)

El orden está pensado para que **si se acaba el tiempo, lo que sobreviva sea lo más valioso para el pitch** (chatbot Gemini = categoría que persiguen).

| # | Bloque | Tiempo | Quién | Notas |
|---|---|---|---|---|
| 1 | Setup base: repo, scaffold React, schema Postgres, deploy "hello world" en Google Cloud, API keys creadas (Maps + OAuth + Gemini) con billing activo | 1–2h | Ambos | **No saltarse el deploy temprano** |
| 2 | Seed de 15–20 comercios de prueba directo en DB | 30min | Backend | Permite trabajar features sin esperar al flujo de alta |
| 3 | **Chatbot Gemini funcionando sobre datos seedeados** | 3–4h | Backend (API) + Frontend (UI chat) | **CRÍTICO — categoría** |
| 4 | Mapa con Google Maps + pines + listado de comercios cercanos | 2–3h | Frontend | Sobre los mismos datos seedeados |
| 5 | Alta de comercio: Google Login + formulario + guardar en DB | 2–3h | Backend (OAuth + endpoint) + Frontend (form) | Si no llega, demo se hace con datos seedeados |
| 6 | Galería de fotos (upload a Cloud Storage) | 1h | Backend | Opcional si tiempo aprieta |
| 7 | Pulido UX (tipografía grande, copys claros, vacíos manejados) + preparación de demo y pitch | Tiempo restante | Ambos | Reservar mínimo 45min |

**Regla de oro:** a la hora 8, si el chatbot no funciona, dejar todo lo demás y arreglarlo.

---

## 12. Entregables

- **Aplicación web desplegada** y accesible vía URL pública.
- **Demo en vivo** ante el jurado.
- Repo en GitHub con README mínimo (cómo correr local + URL de demo).
- No se requiere documentación adicional ni video.

---

## 13. Riesgos y supuestos

### Riesgos
- **R-01**: Google Cloud billing no activado a tiempo bloquea Maps/Gemini. **Mitigación:** activar en los primeros 30 min.
- **R-02**: OAuth consent screen en modo testing rechaza al jurado. **Mitigación:** añadir emails de prueba desde temprano o publicar la app.
- **R-03**: Cuota gratuita de Gemini se agota durante la demo. **Mitigación:** cachear respuestas comunes; tener plan B con respuestas pregrabadas.
- **R-04**: Geolocalización del navegador denegada por el usuario. **Mitigación:** fallback a campo "escribe tu colonia" o centro de Durango por defecto.
- **R-05**: Equipo de 2 sin experiencia previa puede subestimar tiempo de integraciones. **Mitigación:** seguir el orden del plan, no saltarse el setup temprano.
- **R-06**: Subida de imágenes a Cloud Storage puede consumir más tiempo del previsto. **Mitigación:** marcar como opcional; en MVP aceptar URLs en lugar de upload si es necesario.

### Supuestos
- **S-01**: Los jurados podrán ver la app desde sus propios dispositivos (URL pública).
- **S-02**: Google Maps API en modo gratuito alcanza para la demo.
- **S-03**: La demo se hará con conexión a internet estable provista por la sede.
- **S-04**: Los comercios seedeados son suficientes para demostrar el chatbot, aunque la alta no esté terminada.

---

## 14. Fuera de alcance (post-hackathon)

- App móvil nativa (iOS/Android).
- Sistema de reseñas y calificaciones.
- Pagos en línea o reservas.
- Panel administrativo / moderación de contenido.
- Verificación de comercios (sello de "negocio verificado").
- Notificaciones push o por correo.
- Multi-idioma (solo español MX en MVP).
- Integración con redes sociales más allá de enlaces de contacto.
- Analytics avanzados para el comerciante.
- Soporte para múltiples ciudades (solo Durango en MVP).
