# Durango.cerca.de.ti

# Backend

## 1. El Cerebro: Integración con Gemini (gemini.service.js)
  Esta es la funcionalidad estrella. En lugar de hacer una búsqueda simple por palabras clave, el backend utiliza Gemini 1.5 Flash.
   - Contexto Local: Al enviar una pregunta, el backend le "explica" a Gemini que es un experto en Durango.
   - Inyección de Datos: El backend extrae los comercios de la base de datos y se los pasa a Gemini junto con la pregunta y ubicación del usuario.
   - Resultado: Gemini no solo responde, sino que recomienda comercios específicos, explicando por qué son relevantes para el ciudadano.

## 2. Base de Datos: PostgreSQL + Knex (src/db)
  Elegimos PostgreSQL por su robustez y Knex.js para gestionar el esquema de forma profesional.
   - Tablas:
       - usuarios: Almacena a los dueños de negocios identificados por su google_id.
       - comercios: Almacena toda la información de la ficha (nombre, descripción, coordenadas lat/lng, links de WhatsApp e Instagram).
   - Migraciones: Permiten crear la estructura de la base de datos en cualquier entorno con un solo comando (npm run migrate).
   - Seeds: Datos de prueba listos para que el frontend pueda mostrar un mapa lleno de puntos desde el minuto uno.

## 3. Autenticación: Google Login (auth.service.js)
  Para cumplir con el requerimiento de "mínima fricción":
   - No manejamos contraseñas (mayor seguridad).
   - El backend recibe un token de Google del frontend, lo valida con la librería oficial google-auth-library, y si el usuario no existe en nuestra DB, lo
     crea automáticamente.

## 4. API REST: Puntos de Acceso (src/routes)
  La comunicación con el frontend se divide en tres áreas:
   - /api/comercios: CRUD completo (Crear, Leer, Actualizar, Borrar). El ciudadano solo usa el GET, mientras que el comerciante usa los demás para
     gestionar su ficha.
   - /api/chat: Recibe la consulta en lenguaje natural ("¿donde reparan zapatos?") y devuelve la respuesta procesada por la IA.
   - /api/auth: Gestiona el inicio de sesión único.

## 5. Flujo de Datos (Ejemplo del Chat)
   1. El Ciudadano escribe: "Tengo hambre, quiero algo típico y barato".
   2. El Frontend envía la frase y la ubicación GPS al backend.
   3. El Backend consulta la tabla comercios.
   4. El Backend construye un "Mega-Prompt" para Gemini: "Usuario en X ubicación pregunta Y. Aquí tienes 20 negocios de Durango. Recomienda los mejores".
   5. Gemini responde: "¡Hola! Te recomiendo 'Antojitos Doña Rosa', está a solo 2 cuadras de ti y sus gorditas son famosas...".
   6. El Backend entrega esa respuesta al Ciudadano.

  Tecnologías Clave Utilizadas:
   - Express.js: Para el servidor web.
   - dotenv: Para proteger tus API Keys (Maps, Gemini).
   - Cors: Para permitir que el frontend se conecte sin problemas.
   - Morgan: Para ver logs de las peticiones en tiempo real durante el desarrollo.