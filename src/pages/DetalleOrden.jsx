// src/pages/DetalleOrden.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  obtenerOrden,
  obtenerProductosOrden,
  obtenerProveedores,
  agregarProductoOrden,
  eliminarProductoOrden,
  actualizarOrden
} from '../services/api';

const formatearFechaLocal = (fechaString) => {
  if (!fechaString) return '';
  const [año, mes, dia] = fechaString.split('T')[0].split('-');
  return `${dia}/${mes}/${año}`;
};

function DetalleOrden() {
  const { ordenId } = useParams();
  const navigate = useNavigate();

  const [orden, setOrden] = useState(null);
  const [productos, setProductos] = useState([]);
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para agregar producto
  const [nombreProducto, setNombreProducto] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [ordenId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ordenData, productosData, proveedoresData] = await Promise.all([
        obtenerOrden(ordenId),
        obtenerProductosOrden(ordenId),
        obtenerProveedores()
      ]);

      setOrden(ordenData);
      setProductos(productosData);
      
      const prov = proveedoresData.find(p => p._id === ordenData.proveedorId);
      setProveedor(prov);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarProducto = async (e) => {
    e.preventDefault();
    
    if (!nombreProducto.trim() || !codigoBarras.trim() || !cantidad || !precio) {
      alert('Por favor completa todos los campos');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    const precioNum = parseFloat(precio);

    if (cantidadNum <= 0 || precioNum <= 0) {
      alert('La cantidad y el precio deben ser mayores a 0');
      return;
    }

    try {
      const nuevoProducto = await agregarProductoOrden(ordenId, {
        nombre: nombreProducto.trim(),
        codigoBarras: codigoBarras.trim(),
        cantidadPedida: cantidadNum,
        precioUnitario: precioNum
      });

      setProductos([...productos, nuevoProducto]);

      // Limpiar formulario
      setNombreProducto('');
      setCodigoBarras('');
      setCantidad('');
      setPrecio('');

      // Recargar la orden para actualizar el total
      const ordenActualizada = await obtenerOrden(ordenId);
      setOrden(ordenActualizada);

      alert('✅ Producto agregado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar producto');
    }
  };

  const handleEliminarProducto = async (productoId) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este producto?');
    if (!confirmar) return;

    try {
      await eliminarProductoOrden(productoId);
      setProductos(productos.filter(p => p._id !== productoId));

      // Recargar la orden para actualizar el total
      const ordenActualizada = await obtenerOrden(ordenId);
      setOrden(ordenActualizada);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar producto');
    }
  };

  const calcularProgreso = () => {
    if (productos.length === 0) return 0;
    const totalRecibido = productos.reduce((sum, p) => sum + p.cantidadRecibida, 0);
    const totalPedido = productos.reduce((sum, p) => sum + p.cantidadPedida, 0);
    return totalPedido > 0 ? Math.round((totalRecibido / totalPedido) * 100) : 0;
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: { bg: '#ffc107', color: '#000' },
      recibiendo: { bg: '#17a2b8', color: '#fff' },
      completada: { bg: '#28a745', color: '#fff' },
      cancelada: { bg: '#dc3545', color: '#fff' }
    };
    const style = estilos[estado] || estilos.pendiente;
    
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color
      }}>
        {estado.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Cargando orden...</p>
      </div>
    );
  }

  if (!orden) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Orden no encontrada</p>
        <button className="btn" onClick={() => navigate('/ordenes')}>
          Volver a Órdenes
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>📦 {orden.numero}</h1>
          <p style={{ margin: '0.5rem 0', color: '#666' }}>
            {proveedor?.nombre || 'Proveedor desconocido'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/ordenes')} style={{ backgroundColor: '#6c757d' }}>
          ← Volver
        </button>
      </div>

      {/* INFO DE LA ORDEN */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Estado</p>
            <div style={{ marginTop: '0.5rem' }}>
              {getEstadoBadge(orden.estado)}
            </div>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Fecha</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: '600', fontSize: '1.1rem' }}>
              {formatearFechaLocal(orden.fecha)}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: '600', fontSize: '1.1rem' }}>
              ${orden.total.toLocaleString('es-AR')}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Progreso</p>
            <p style={{ margin: '0.5rem 0 0 0', fontWeight: '600', fontSize: '1.1rem' }}>
              {calcularProgreso()}%
            </p>
          </div>
        </div>

        {orden.observaciones && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>
              📝 {orden.observaciones}
            </p>
          </div>
        )}
      </div>

      {/* FORMULARIO AGREGAR PRODUCTO */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ marginTop: 0 }}>Agregar Producto</h3>
        <form onSubmit={handleAgregarProducto} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          <input
            type="text"
            value={nombreProducto}
            onChange={(e) => setNombreProducto(e.target.value)}
            placeholder="Nombre del producto"
            required
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input
            type="text"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            placeholder="Código de barras"
            required
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Cantidad"
            min="1"
            required
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <input
            type="number"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Precio unitario"
            min="0.01"
            required
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" className="btn">
            + Agregar
          </button>
        </form>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ marginTop: 0 }}>Productos ({productos.length})</h3>
        
        {productos.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            No hay productos en esta orden. Agrega el primer producto arriba.
          </p>
        )}

        {productos.length > 0 && (
          <table className="tabla-detalles">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
                <th>Recibido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(producto => (
                <tr key={producto._id}>
                  <td style={{ fontWeight: '600' }}>{producto.nombre}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {producto.codigoBarras}
                  </td>
                  <td>{producto.cantidadPedida}</td>
                  <td>${producto.precioUnitario.toLocaleString('es-AR')}</td>
                  <td style={{ fontWeight: '600' }}>
                    ${(producto.cantidadPedida * producto.precioUnitario).toLocaleString('es-AR')}
                  </td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      backgroundColor: producto.recibido ? '#d4edda' : '#fff3cd',
                      color: producto.recibido ? '#155724' : '#856404'
                    }}>
                      {producto.cantidadRecibida}/{producto.cantidadPedida}
                    </span>
                  </td>
                  <td className="tabla-acciones">
                    <button
                      onClick={() => handleEliminarProducto(producto._id)}
                      className="btn-eliminar"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* BOTÓN ESCANEAR (próximamente) */}
      {productos.length > 0 && (
        <div style={{
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <button
            className="btn"
            style={{
              backgroundColor: '#28a745',
              fontSize: '1.1rem',
              padding: '1rem 2rem'
            }}
            onClick={() => alert('📷 El escáner se agregará en el siguiente paso')}
          >
            📷 Escanear Productos
          </button>
        </div>
      )}
    </div>
  );
}

export default DetalleOrden;