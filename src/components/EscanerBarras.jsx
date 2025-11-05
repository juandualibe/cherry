// src/components/EscanerBarras.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function EscanerBarras({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let html5QrCode = null;

    const iniciarEscaner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778
        };

        await html5QrCode.start(
          { facingMode: "environment" }, // Cámara trasera
          config,
          (decodedText, decodedResult) => {
            // Éxito al escanear
            if (onScan) {
              onScan(decodedText);
            }
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
      if (html5QrCode && escaneando) {
        html5QrCode.stop().catch(err => console.error("Error al detener escáner:", err));
      }
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        <h2>📷 Escanear Código de Barras</h2>
        
        {error && (
          <div style={{
            padding: '1rem',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div 
          id="reader" 
          style={{
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}
        ></div>

        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
          Acerca el código de barras del producto a la cámara
        </p>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            onClick={onClose}
            className="btn"
            style={{ backgroundColor: '#6c757d' }}
          >
            Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  );
}

export default EscanerBarras;