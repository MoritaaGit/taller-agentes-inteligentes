# 🤖 Nexus AI - Taller: Crea tu propio Agente Inteligente

¡Bienvenido al repositorio del proyecto **Nexus AI**! Este proyecto fue desarrollado como parte de un taller práctico diseñado para estudiantes de ingeniería, enfocado en la creación, integración y despliegue de agentes inteligentes modernos.

La aplicación es un chat interactivo de alto nivel que combina el procesamiento de lenguaje natural de Google con una arquitectura web robusta y escalable.

## 🚀 Características Principales

- **Cerebro de IA:** Integración con el modelo `gemini-3-flash-preview` de Google AI Studio.
- **Memoria en la Nube:** Registro automático de conversaciones en tiempo real mediante **Supabase**.
- **Persistencia Local:** Sistema de múltiples sesiones guardadas en el navegador (`localStorage`) para evitar la pérdida de datos al recargar.
- **Interfaz Premium:** Diseño minimalista inspirado en plataformas SaaS, con modo oscuro y renderizado de **Markdown** para código y listas.
- **Interacción por Voz:** Dictado de preguntas integrado mediante la Web Speech API.
- **Totalmente Responsivo:** Diseñado para ocupar el 100% de la pantalla con un flujo de usuario fluido.

## 🛠️ Stack Tecnológico

* **Frontend:** React + Vite
* **IA:** Google Generative AI API
* **Base de Datos:** Supabase (PostgreSQL)
* **Estilos:** CSS3 Puro (Custom Properties & Flexbox/Grid)
* **Despliegue:** Vercel
* **IDE:** GitHub Codespaces

## 📋 Estructura del Taller

El proyecto se divide en 5 fases críticas de ingeniería:

1.  **Fase 0 - Entorno:** Configuración de GitHub Codespaces como entorno de desarrollo en la nube.
2.  **Fase 1 - El Cerebro:** Configuración de instrucciones de sistema y obtención de API Keys en Google AI Studio.
3.  **Fase 2 - La Memoria:** Creación de una base de datos en Supabase y desactivación estratégica de RLS para prototipado rápido.
4.  **Fase 3 - El Cuerpo:** Desarrollo del Frontend usando React y técnicas de *Prompt Engineering* para la generación de código.
5.  **Fase 4 - El Mundo:** Despliegue continuo en Vercel con configuración de variables de entorno y directorio raíz.

## ⚙️ Configuración Local

Si deseas ejecutar este proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/taller-agente-ia.git](https://github.com/tu-usuario/taller-agente-ia.git)
    cd mi-agente
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    npm install @google/generative-ai @supabase/supabase-js react-markdown
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` en la carpeta raíz del proyecto y añade tus credenciales:
    ```env
    VITE_GEMINI_API_KEY="TU_LLAVE_DE_GOOGLE"
    VITE_SUPABASE_URL="TU_URL_DE_SUPABASE"
    VITE_SUPABASE_ANON_KEY="TU_LLAVE_ANON_DE_SUPABASE"
    ```

4.  **Ejecutar:**
    ```bash
    npm run dev
    ```

## 🔐 Seguridad y Notas

Este proyecto es una herramienta educativa. Para su uso en producción, se recomienda:
* Activar **Row Level Security (RLS)** en Supabase.
* Mover las llamadas a la API de Gemini a un Backend (Node.js/Python) para ocultar las API Keys del cliente.
* Implementar autenticación de usuarios.

---
Desarrollado con ❤️ para el taller de Agentes Inteligentes.
