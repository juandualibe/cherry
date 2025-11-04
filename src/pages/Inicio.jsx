// src/pages/Inicio.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  obtenerProveedores,
  obtenerFacturasProveedor,
  obtenerPagosProveedor
} from '../services/api';
import * as XLSX from 'xlsx';

const calcularSaldoPendiente = (proveedorId, todasLasFacturas, todosLosPagos) => {
  const totalFacturas = todasLasFacturas
    .filter(f => f.proveedorId === proveedorId)
    .reduce((total, f) => total + f.monto, 0);
    
  const totalRechazos = todasLasFacturas
    .filter(f => f.proveedorId === proveedorId)
    .reduce((total, f) => total + (f.rechazo || 0), 0);
    
  const totalPagos = todosLosPagos
    .filter(p => p.proveedorId === proveedorId)
    .reduce((total, p) => total + p.monto, 0);

  return totalFacturas - totalRechazos - totalPagos;
};

const formatearFechaLocal = (fechaString) => {
  if (!fechaString) return '';
  const [año, mes, dia] = fechaString.split('T')[0].split('-');
  return `${dia}/${mes}/${año}`;
};

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

const tresDiasDespues = new Date(hoy);
tresDiasDespues.setDate(hoy.getDate() + 3);

const sieteDiasDespues = new Date(hoy);
sieteDiasDespues.setDate(hoy.getDate() + 7);


function Inicio() {
  const [alertasVencidas, setAlertasVencidas] = useState([]);
  const [alertasProximasVencer, setAlertasProximasVencer] = useState([]);
  const [alertasPorVencer, setAlertasPorVencer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backupExpandido, setBackupExpandido] = useState(false);
  const [generandoBackup, setGenerandoBackup] = useState(false);

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      const proveedores = await obtenerProveedores();
      
      // Cargar todas las facturas y pagos
      const todasLasFacturas = [];
      const todosLosPagos = [];
      
      for (const proveedor of proveedores) {
        const facturas = await obtenerFacturasProveedor(proveedor._id);
        const pagos = await obtenerPagosProveedor(proveedor._id);
        todasLasFacturas.push(...facturas);
        todosLosPagos.push(...pagos);
      }
      
      const alertasVencidasTemp = [];
      const alertasProximasVencerTemp = [];
      const alertasPorVencerTemp = [];

      for (const proveedor of proveedores) {
        const saldo = calcularSaldoPendiente(proveedor._id, todasLasFacturas, todosLosPagos);
        
        if (saldo <= 0) {
          continue;
        }

        const facturasProveedor = todasLasFacturas.filter(f => f.proveedorId === proveedor._id);
        
        let tieneVencidas = false;
        let tieneProximasVencer = false;
        let tienePorVencer = false;

        for (const factura of facturasProveedor) {
          if (factura.fechaVencimiento) {
            const [año, mes, dia] = factura.fechaVencimiento.split('T')[0].split('-');
            const fechaVenc = new Date(año, mes - 1, dia);

            if (fechaVenc < hoy) {
              tieneVencidas = true;
            } else if (fechaVenc >= hoy && fechaVenc <= tresDiasDespues) {
              tieneProximasVencer = true;
            } else if (fechaVenc > tresDiasDespues && fechaVenc <= sieteDiasDespues) {
              tienePorVencer = true;
            }
          }
        }

        const infoAlerta = {
          id: proveedor._id,
          nombre: proveedor.nombre,
          saldo: saldo
        };

        if (tieneVencidas) {
          alertasVencidasTemp.push(infoAlerta);
        } else if (tieneProximasVencer) {
          alertasProximasVencerTemp.push(infoAlerta);
        } else if (tienePorVencer) {
          alertasPorVencerTemp.push(infoAlerta);
        }
      }

      setAlertasVencidas(alertasVencidasTemp);
      setAlertasProximasVencer(alertasProximasVencerTemp);
      setAlertasPorVencer(alertasPorVencerTemp);
    } catch (error) {
      console.error('Error cargando alertas:', error);
      alert('Error al cargar las alertas. ¿Está el backend funcionando?');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarBackup = async () => {
    try {
      setGenerandoBackup(true);
      
      // Importar todas las funciones necesarias
      const { 
        obtenerClientes, 
        obtenerDeudasCliente,
        obtenerMeses,
        obtenerVentasMes,
        obtenerGastosMes
      } = await import('../services/api');
      
      // Cargar todos los datos
      const clientes = await obtenerClientes();
      const proveedores = await obtenerProveedores();
      const meses = await obtenerMeses();
      
      const todasLasDeudas = [];
      for (const cliente of clientes) {
        const deudas = await obtenerDeudasCliente(cliente._id);
        todasLasDeudas.push(...deudas);
      }
      
      const todasLasFacturas = [];
      const todosLosPagos = [];
      for (const proveedor of proveedores) {
        const facturas = await obtenerFacturasProveedor(proveedor._id);
        const pagos = await obtenerPagosProveedor(proveedor._id);
        todasLasFacturas.push(...facturas);
        todosLosPagos.push(...pagos);
      }
      
      const todasLasVentas = [];
      const todosLosGastos = [];
      for (const mes of meses) {
        const ventas = await obtenerVentasMes(mes.mesId);
        const gastos = await obtenerGastosMes(mes.mesId);
        todasLasVentas.push(...ventas);
        todosLosGastos.push(...gastos);
      }
      
      // Crear Excel
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Clientes
      const clientesData = clientes.map(c => ({
        Nombre: c.nombre,
        'Total Deuda': todasLasDeudas.filter(d => d.clienteId === c._id).reduce((sum, d) => sum + d.monto, 0)
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientesData), 'Clientes');
      
      // Hoja 2: Deudas
      const deudasData = todasLasDeudas.map(d => {
        const cliente = clientes.find(c => c._id === d.clienteId);
        return {
          Cliente: cliente?.nombre || 'Desconocido',
          Fecha: formatearFechaLocal(d.fecha),
          Monto: d.monto
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(deudasData), 'Deudas');
      
      // Hoja 3: Proveedores
      const proveedoresData = proveedores.map(p => ({
        Nombre: p.nombre,
        'Saldo Pendiente': calcularSaldoPendiente(p._id, todasLasFacturas, todosLosPagos)
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(proveedoresData), 'Proveedores');
      
      // Hoja 4: Facturas
      const facturasData = todasLasFacturas.map(f => {
        const proveedor = proveedores.find(p => p._id === f.proveedorId);
        return {
          Proveedor: proveedor?.nombre || 'Desconocido',
          Fecha: formatearFechaLocal(f.fecha),
          Vencimiento: formatearFechaLocal(f.fechaVencimiento),
          Numero: f.numero,
          Monto: f.monto,
          Rechazo: f.rechazo || 0
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(facturasData), 'Facturas');
      
      // Hoja 5: Pagos
      const pagosData = todosLosPagos.map(p => {
        const proveedor = proveedores.find(prov => prov._id === p.proveedorId);
        return {
          Proveedor: proveedor?.nombre || 'Desconocido',
          Fecha: formatearFechaLocal(p.fecha),
          Monto: p.monto
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pagosData), 'Pagos');
      
      // Hoja 6: Verdulería Meses
      const mesesData = meses.map(m => {
        const ventas = todasLasVentas.filter(v => v.mesId === m.mesId);
        const gastos = todosLosGastos.filter(g => g.mesId === m.mesId);
        const totalVentas = ventas.reduce((sum, v) => sum + v.venta, 0);
        const totalCostos = ventas.reduce((sum, v) => sum + v.costoMercaderia + v.gastos, 0);
        const totalGastosFijos = gastos.reduce((sum, g) => sum + (g.verduleria || 0), 0);
        return {
          Mes: m.nombre,
          'Total Ventas': totalVentas,
          'Total Costos': totalCostos,
          'Gastos Fijos': totalGastosFijos,
          'Resultado': totalVentas - totalCostos - totalGastosFijos
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mesesData), 'Verdulería Resumen');
      
      // Generar archivo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Backup_Cherry_${fecha}.xlsx`);
      
      alert('✅ Backup generado exitosamente');
      setBackupExpandido(false);
    } catch (error) {
      console.error('Error generando backup:', error);
      alert('Error al generar el backup');
    } finally {
      setGenerandoBackup(false);
    }
  };

  
  return (
    <div>
      <h1>🍒 Dashboard de Cherry</h1>
      <p>Resumen rápido de las cuentas a pagar a proveedores.</p>

      {/* SECCIÓN DE BACKUP COLAPSABLE */}
      <div style={{
        marginBottom: '2rem',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setBackupExpandido(!backupExpandido)}
          style={{
            width: '100%',
            padding: '1rem 1.5rem',
            background: backupExpandido ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
            color: backupExpandido ? 'white' : '#333',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '1.1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          <span>💾 Generar Backup Completo</span>
          <span style={{fontSize: '1.5rem', transition: 'transform 0.3s ease', transform: backupExpandido ? 'rotate(180deg)' : 'rotate(0deg)'}}>
            ▼
          </span>
        </button>
        
        {backupExpandido && (
          <div style={{
            padding: '1.5rem',
            background: 'white',
            borderTop: '2px solid #e0e0e0'
          }}>
            <p style={{color: '#666', marginBottom: '1rem'}}>
              📊 Descarga un archivo Excel con todos tus datos actuales de MongoDB:
            </p>
            <ul style={{color: '#666', marginBottom: '1.5rem', paddingLeft: '1.5rem'}}>
              <li>Clientes y deudas</li>
              <li>Proveedores, facturas y pagos</li>
              <li>Verdulería (ventas y gastos)</li>
            </ul>
            <button 
              onClick={handleGenerarBackup}
              disabled={generandoBackup}
              className="btn"
              style={{
                backgroundColor: '#28a745',
                fontSize: '1rem',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                cursor: generandoBackup ? 'not-allowed' : 'pointer',
                opacity: generandoBackup ? 0.7 : 1
              }}
            >
              {generandoBackup ? '⏳ Generando backup...' : '📥 Descargar Backup'}
            </button>
          </div>
        )}
      </div>

      {/* ALERTAS DE VENCIMIENTOS */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '2rem'}}>
        
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{color: '#dc3545'}}>🔴 Facturas Vencidas</h2>
          <div className="lista-container">
            {loading && <p>Calculando...</p>}
            {!loading && alertasVencidas.length === 0 && (
              <p>¡Buenas noticias! No hay facturas vencidas.</p>
            )}
            {alertasVencidas.map(alerta => (
              <div key={alerta.id} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '200px',
                padding: '1.5rem',
                borderLeft: '4px solid #dc3545'
              }}>
                <div>
                  <h3 style={{marginBottom: '1rem'}}>{alerta.nombre}</h3>
                  <p style={{marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666'}}>Saldo pendiente:</p>
                  <div className="total" style={{
                    fontSize: '1.8rem',
                    marginBottom: '1.5rem',
                    wordBreak: 'break-word'
                  }}>
                    ${alerta.saldo.toLocaleString('es-AR')}
                  </div>
                </div>
                <Link 
                  to="/proveedores" 
                  className="btn" 
                  style={{
                    marginTop: 'auto',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'block',
                    backgroundColor: '#dc3545'
                  }}
                >
                  Ir a Proveedores
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{color: '#ff8c00'}}>🟠 Próximas a Vencer (0-3 días)</h2>
          <div className="lista-container">
            {loading && <p>Calculando...</p>}
            {!loading && alertasProximasVencer.length === 0 && (
              <p>No hay vencimientos urgentes.</p>
            )}
            {alertasProximasVencer.map(alerta => (
              <div key={alerta.id} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '200px',
                padding: '1.5rem',
                borderLeft: '4px solid #ff8c00'
              }}>
                <div>
                  <h3 style={{marginBottom: '1rem'}}>{alerta.nombre}</h3>
                  <p style={{marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666'}}>Saldo pendiente:</p>
                  <div className="total" style={{
                    fontSize: '1.8rem',
                    marginBottom: '1.5rem',
                    wordBreak: 'break-word'
                  }}>
                    ${alerta.saldo.toLocaleString('es-AR')}
                  </div>
                </div>
                <Link 
                  to="/proveedores" 
                  className="btn" 
                  style={{
                    marginTop: 'auto',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'block',
                    backgroundColor: '#ff8c00'
                  }}
                >
                  Ir a Proveedores
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{color: '#ffc107'}}>🟡 Por Vencer (4-7 días)</h2>
          <div className="lista-container">
            {loading && <p>Calculando...</p>}
            {!loading && alertasPorVencer.length === 0 && (
              <p>No hay vencimientos en esta ventana.</p>
            )}
            {alertasPorVencer.map(alerta => (
              <div key={alerta.id} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '200px',
                padding: '1.5rem',
                borderLeft: '4px solid #ffc107'
              }}>
                <div>
                  <h3 style={{marginBottom: '1rem'}}>{alerta.nombre}</h3>
                  <p style={{marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666'}}>Saldo pendiente:</p>
                  <div className="total" style={{
                    fontSize: '1.8rem',
                    marginBottom: '1.5rem',
                    wordBreak: 'break-word'
                  }}>
                    ${alerta.saldo.toLocaleString('es-AR')}
                  </div>
                </div>
                <Link 
                  to="/proveedores" 
                  className="btn" 
                  style={{
                    marginTop: 'auto',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'block'
                  }}
                >
                  Ir a Proveedores
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inicio;