// src/components/EscanerBarras.jsx

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function EscanerBarras({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [ultimoMensaje, setUltimoMensaje] = useState("");
  const ultimoCodigoProcesado = useRef(null);
  const timeoutProcesamiento = useRef(null);
  const inicializadoRef = useRef(false);

  // components/EscanerBarras.jsx

  useEffect(() => {
    if (inicializadoRef.current) return;
    inicializadoRef.current = true;

    // --- INICIO DEL CAMBIO ---

    // 1. Define una función para un qrbox flexible
    const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
      // Queremos un rectángulo ancho, ideal para códigos de barras.
      // Usamos el 85% del ancho de la vista.
      const qrboxWidth = Math.floor(viewfinderWidth * 0.85);
      
      // La altura puede ser menor, 30% del alto es suficiente
      // para capturar el código completo.
      const qrboxHeight = Math.floor(viewfinderHeight * 0.3);
      
      return { width: qrboxWidth, height: qrboxHeight };
    };

    // --- FIN DEL CAMBIO ---

    const iniciarEscaner = async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            
            // --- INICIO DEL CAMBIO ---
            // 2. Reemplaza el objeto fijo por la función
            qrbox: qrboxFunction,
            // --- FIN DEL CAMBIO ---
            
            aspectRatio: 1.777778
          },
          (codigo) => {
            if (ultimoCodigoProcesado.current === codigo) return;

            ultimoCodigoProcesado.current = codigo;
            setUltimoMensaje(`✓ Escaneado: ${codigo.substring(0, 13)}`);

            if (onScan) onScan(codigo);

            if (timeoutProcesamiento.current) {
              clearTimeout(timeoutProcesamiento.current);
            }
            
            timeoutProcesamiento.current = setTimeout(() => {
              ultimoCodigoProcesado.current = null;
              setUltimoMensaje('');
            }, 500); // Mantenemos el debounce de 500ms
          },
          () => {} // Ignorar errores de escaneo
        );
      } catch (err) {
        console.error("Error al iniciar:", err);
        setError('No se pudo acceder a la cámara');
      }
    };

    iniciarEscaner();

    return () => {
      if (timeoutProcesamiento.current) {
        clearTimeout(timeoutProcesamiento.current);
      }
      
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      inicializadoRef.current = false;
    };
  }, []); // El array de dependencias sigue vacío

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .catch(() => {})
        .finally(() => {
          scannerRef.current = null;
          onClose();
        });
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "0.5rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          maxWidth: "450px",
          width: "100%",
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            padding: "1rem",
            borderBottom: "2px solid #e0e0e0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem", textAlign: "center" }}>
            📷 Escáner de Códigos
          </h2>
        </div>

        <div
          style={{
            padding: "1rem",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {error && (
            <div
              style={{
                padding: "0.75rem",
                background: "#f8d7da",
                color: "#721c24",
                borderRadius: "8px",
                marginBottom: "1rem",
                width: "100%",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div
            id="reader"
            style={{
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "0.75rem",
              border: "3px solid #28a745",
            }}
          ></div>

          {ultimoMensaje && (
            <div
              style={{
                padding: "0.5rem 1rem",
                background: "#d4edda",
                color: "#155724",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                textAlign: "center",
                width: "100%",
              }}
            >
              {ultimoMensaje}
            </div>
          )}

          <p
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: "0.85rem",
              margin: "0.5rem 0",
              fontWeight: "600",
            }}
          >
            🎯 Centra el código y se escaneará automáticamente
          </p>
        </div>

        <div
          style={{
            padding: "1rem",
            borderTop: "2px solid #e0e0e0",
          }}
        >
          <button
            onClick={handleClose}
            className="btn"
            style={{
              backgroundColor: "#dc3545",
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            ✕ Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  );
}

export default EscanerBarras;
