# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Fuente de verdad: `REQUIREMENTS.md`

Antes de proponer cambios, **lee `REQUIREMENTS.md`** en la raíz del repo. Es el documento operativo del hackathon HackDays (12h) y contiene: visión, alcance funcional (RF-01..16 + RB-01..02), no funcionales (RNF-01..11), modelo de datos, plan de trabajo priorizado por hora, riesgos y fuera-de-alcance. Cualquier decisión de scope, arquitectura o priorización debe alinearse con ese documento. Si surge un cambio de scope durante el hackathon, refléjalo ahí mismo.

## Idioma

Todo en **español MX**: respuestas, commits, comentarios de código, copys de UI, mensajes de error. El usuario principal (Leonardo) y el equipo trabajan en español.

## Stack planeado

React (front) · PostgreSQL (DB) · Google Cloud (Cloud Run o App Engine) · Google OAuth · Google Maps JavaScript API · **Gemini API** (chatbot, feature central) · Google Cloud Storage (imágenes). No hay código aún; el repo arrancará durante el hackathon.

## Restricciones críticas que deben gobernar cualquier decisión

1. **El chatbot Gemini es el corazón del pitch** — apuntan a la categoría "Mejor uso de la API de Gemini". Si una decisión técnica pone en riesgo que el chatbot llegue funcional al demo, es la decisión equivocada. Ver sección 11 del `REQUIREMENTS.md`: a la hora 8, si el chatbot no funciona, se pausa todo lo demás.
2. **UX ULTRA fácil para usuarios 50+** — tipografía ≥18px, botones ≥48×48px, contraste WCAG AA, sin jerga técnica en copys, ≤3 toques por acción. No es opcional ni cosmético: es criterio de evaluación.
3. **Cachear respuestas comunes de Gemini** — la cuota gratuita puede agotarse durante la demo. No invocar la API en cada render ni en cada pregunta repetida.
4. **API keys siempre en variables de entorno**, nunca en el repo (Maps, OAuth, Gemini).
5. **Datos seedeados primero** — los flujos del ciudadano (mapa + chatbot) deben poder demostrarse aunque el alta de comerciante no esté terminada. Mantener un seed de 15–20 comercios reales de Durango siempre disponible.

## Equipo y forma de trabajo

2 personas (Leonardo + 1) sin experiencia previa en marketplaces, mapas ni Gemini. División tentativa: front (React + Maps + UI chatbot) y back (Postgres + endpoints + Gemini + OAuth), con apoyo cruzado. Tiempo total: **12 horas**. Cualquier sugerencia de arquitectura debe favorecer simplicidad y velocidad sobre elegancia.

## Comandos

Aún no existen — el código se escribirá durante el hackathon. Cuando se establezca el stack concreto (Node vs Python en backend, gestor de paquetes, etc.), actualizar esta sección con los comandos reales de instalación, desarrollo local, build y deploy a Google Cloud.
