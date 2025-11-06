// src/components/EscanerBarras.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function EscanerBarras({ onScan, onClose }) {
  const html5QrCodeRef = useRef(null);
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState('');
  const [ultimoMensaje, setUltimoMensaje] = useState('');
  const ultimoCodigoProcesado = useRef(null);
  const timeoutProcesamiento = useRef(null);

  useEffect(() => {
    const iniciarEscaner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;
        
        const config = {
          fps: 15, // Aumentamos FPS para más fluidez
          qrbox: { width: 280, height: 180 }, // Área más grande
          aspectRatio: 1.777778,
          disableFlip: false
        };

        await html5QrCode.start(
          { facingMode: "environment" }, // Cámara trasera
          config,
          (decodedText, decodedResult) => {
            // Evitar procesar el mismo código en los últimos 2 segundos
            if (ultimoCodigoProcesado.current === decodedText) {
              return;
            }

            // Marcar como procesado
            ultimoCodigoProcesado.current = decodedText;
            
            // Mostrar feedback visual
            setUltimoMensaje(`✓ Escaneado: ${decodedText.substring(0, 13)}`);

            // Llamar al callback
            if (onScan) {
              onScan(decodedText);
            }

            // Limpiar después de 2 segundos para permitir el mismo código de nuevo
            if (timeoutProcesamiento.current) {
              clearTimeout(timeoutProcesamiento.current);
            }
            
            timeoutProcesamiento.current = setTimeout(() => {
              ultimoCodigoProcesado.current = null;
              setUltimoMensaje('');
            }, 2000);
          },
          (errorMessage) => {
            // Error silencioso (sigue buscando)
          }
        );

        setEscaneando(true);
      } catch (err) {
        console.error("Error al iniciar escáner:", err);
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
      }
    };

    iniciarEscaner();

    // Cleanup al desmontar
    return () => {
      if (timeoutProcesamiento.current) {
        clearTimeout(timeoutProcesamiento.current);
      }
      
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop()
          .then(() => {
            html5QrCodeRef.current = null;
          })
          .catch(err => console.error("Error al detener escáner:", err));
      }
    };
  }, []);

  const handleClose = async () => {
    // Detener el escáner antes de cerrar
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.error('Error al detener:', e);
      }
    }
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '0.5rem'
      }}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '450px',
          width: '100%',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header fijo */}
        <div style={{
          padding: '1rem',
          borderBottom: '2px solid #e0e0e0',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', textAlign: 'center' }}>
            📷 Escáner de Códigos
          </h2>
        </div>

        {/* Contenido */}
        <div style={{
          padding: '1rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0
        }}>
          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#f8d7da',
              color: '#721c24',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              width: '100%',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div 
            id="reader" 
            style={{
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '0.75rem',
              border: '3px solid #667eea'
            }}
          ></div>

          {/* Feedback visual */}
          {ultimoMensaje && (
            <div style={{
              padding: '0.5rem 1rem',
              background: '#d4edda',
              color: '#155724',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              textAlign: 'center',
              width: '100%'
            }}>
              {ultimoMensaje}
            </div>
          )}

          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '0.8rem',
            margin: '0.25rem 0',
            lineHeight: '1.4'
          }}>
            🎯 Centra el código de barras en el cuadro
          </p>
        </div>

        {/* Footer fijo */}
        <div style={{
          padding: '1rem',
          borderTop: '2px solid #e0e0e0',
          flexShrink: 0
        }}>
          <button 
            onClick={handleClose}
            className="btn"
            style={{ 
              backgroundColor: '#dc3545',
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ✕ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EscanerBarras;