import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import ReactMarkdown from 'react-markdown'
import './App.css'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function App() {
  const [sesiones, setSesiones] = useState(() => {
    const guardadas = localStorage.getItem('historial-taller-agentes');
    if (guardadas) return JSON.parse(guardadas);
    return [{ id: Date.now(), titulo: 'Nuevo Chat', mensajes: [] }];
  });
  
  const [idActiva, setIdActiva] = useState(sesiones[0]?.id || Date.now());
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const finalChatRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('historial-taller-agentes', JSON.stringify(sesiones));
  }, [sesiones]);

  const chatActivo = sesiones.find(s => s.id === idActiva) || sesiones[0];
  const mensajes = chatActivo ? chatActivo.mensajes : [];

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const actualizarMensajes = (nuevosMensajes) => {
    setSesiones(prev => prev.map(sesion => {
      if (sesion.id === idActiva) {
        const titulo = nuevosMensajes.length === 1 
          ? nuevosMensajes[0].texto.substring(0, 25) + "..." 
          : sesion.titulo;
        return { ...sesion, titulo, mensajes: nuevosMensajes };
      }
      return sesion;
    }));
  };

  const iniciarNuevoChat = () => {
    const nuevaSesion = { id: Date.now(), titulo: 'Nuevo Chat', mensajes: [] };
    setSesiones([nuevaSesion, ...sesiones]);
    setIdActiva(nuevaSesion.id);
  };

  // NUEVO: Función para borrar un chat específico
  const borrarChat = (e, idBorrar) => {
    e.stopPropagation(); // Evita que se seleccione el chat al intentar borrarlo
    const sesionesRestantes = sesiones.filter(s => s.id !== idBorrar);
    
    if (sesionesRestantes.length === 0) {
      const nuevaSesion = { id: Date.now(), titulo: 'Nuevo Chat', mensajes: [] };
      setSesiones([nuevaSesion]);
      setIdActiva(nuevaSesion.id);
    } else {
      setSesiones(sesionesRestantes);
      if (idActiva === idBorrar) setIdActiva(sesionesRestantes[0].id);
    }
  };

  // NUEVO: Copiar texto al portapapeles
  const copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto);
    alert("¡Respuesta copiada!");
  };

  const iniciarMicrofono = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tu navegador no soporta esta función.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.onstart = () => setEscuchando(true);
    recognition.onend = () => setEscuchando(false);
    recognition.onresult = (event) => setPregunta(event.results[0][0].transcript);
    recognition.start();
  };

  const enviarPregunta = async (e) => {
    e.preventDefault();
    if (!pregunta.trim()) return;

    const textoUsuario = pregunta;
    setPregunta('');
    setCargando(true);

    const msjsActualizados = [...mensajes, { rol: 'usuario', texto: textoUsuario }];
    actualizarMensajes(msjsActualizados);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: "Eres un agente inteligente creado para un taller universitario. Tu rol es asistir a estudiantes en temas de ingeniería y tecnología usando formato Markdown (usa negritas, listas y bloques de código para que se vea bien)."
      });

      const result = await model.generateContent(textoUsuario);
      const textoRespuesta = result.response.text();

      actualizarMensajes([...msjsActualizados, { rol: 'agente', texto: textoRespuesta }]);

      await supabase.from('conversaciones').insert([
        { pregunta: textoUsuario, respuesta: textoRespuesta }
      ]);

    } catch (error) {
      console.error("Error:", error);
      actualizarMensajes([...msjsActualizados, { rol: 'agente', texto: "⚠️ Error de conexión." }]);
    }
    setCargando(false);
  };

  return (
    <div className="layout-completo">
      
      {/* Sidebar Oscuro Premium */}
      <aside className="sidebar">
        <button className="btn-nuevo-chat" onClick={iniciarNuevoChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo Chat
        </button>
        
        <div className="historial-lista">
          <p className="titulo-seccion">TUS SESIONES</p>
          {sesiones.map(sesion => (
            <div 
              key={sesion.id} 
              className={`item-historial ${sesion.id === idActiva ? 'activo' : ''}`}
              onClick={() => setIdActiva(sesion.id)}
            >
              <span className="truncate">💬 {sesion.titulo}</span>
              {/* Botón de Borrar */}
              <button className="btn-borrar" onClick={(e) => borrarChat(e, sesion.id)} title="Borrar chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <div className="dot-online"></div> Taller de Innovación
        </div>
      </aside>

      {/* Área Principal */}
      <main className="chat-area">
        <header className="cabecera-top">
          <h2>Nexus AI - Asistente Técnico</h2>
        </header>

        <div className="ventana-chat">
          {mensajes.length === 0 ? (
            <div className="pantalla-bienvenida">
              <div className="logo-agente">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h1>Hola, ¿Qué construiremos hoy?</h1>
              <p className="descripcion-intro">
                Soy tu agente inteligente. Puedo ayudarte a escribir código, resolver problemas de circuitos o explicarte conceptos complejos de ingeniería.
              </p>
            </div>
          ) : (
            <div className="lista-mensajes">
              {mensajes.map((msg, index) => (
                <div key={index} className={`mensaje-fila ${msg.rol}`}>
                  {msg.rol === 'agente' && (
                    <div className="avatar-agente">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                    </div>
                  )}
                  
                  <div className={`burbuja ${msg.rol}`}>
                    {/* Renderizado Markdown para el agente, texto normal para el usuario */}
                    {msg.rol === 'agente' ? (
                      <div className="markdown-content">
                      <ReactMarkdown>{msg.texto}</ReactMarkdown>
                    </div>
                    ) : (
                      msg.texto
                    )}
                    
                    {/* Botón de Copiar solo en respuestas del agente */}
                    {msg.rol === 'agente' && (
                      <button className="btn-copiar" onClick={() => copiarTexto(msg.texto)} title="Copiar respuesta">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {cargando && (
                <div className="mensaje-fila agente">
                  <div className="avatar-agente pulse">...</div>
                  <div className="burbuja agente escribiendo">Generando respuesta de alta calidad...</div>
                </div>
              )}
              <div ref={finalChatRef} />
            </div>
          )}
        </div>

        {/* Zona de Input Mejorada */}
        <div className="zona-input-contenedor">
          <form onSubmit={enviarPregunta} className="formulario-input">
            <button 
              type="button" 
              className={`btn-microfono ${escuchando ? 'escuchando' : ''}`}
              onClick={iniciarMicrofono}
              title="Dictar por voz"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
            <input
              type="text"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Pregunta sobre React, Circuitos, Inteligencia Artificial..."
              disabled={cargando}
            />
            <button type="submit" className="btn-enviar" disabled={cargando || !pregunta.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <p className="disclaimer-text">Nexus AI puede cometer errores. Verifica el código antes de implementarlo en producción.</p>
        </div>
      </main>
    </div>
  )
}

export default App