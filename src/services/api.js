// src/services/api.js

const API_URL = 'https://wrong-devonna-dualibesoft-528f87f1.koyeb.app/api';

// ==================== CLIENTES ====================

export const obtenerClientes = async () => {
  const response = await fetch(`${API_URL}/clientes`);
  if (!response.ok) throw new Error('Error al obtener clientes');
  return await response.json();
};

export const crearCliente = async (nombre) => {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  return await response.json();
};

export const eliminarCliente = async (id) => {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar cliente');
  return await response.json();
};

export const obtenerDeudasCliente = async (clienteId) => {
  const response = await fetch(`${API_URL}/clientes/${clienteId}/deudas`);
  if (!response.ok) throw new Error('Error al obtener deudas');
  return await response.json();
};

export const agregarDeuda = async (clienteId, fecha, monto) => {
  const response = await fetch(`${API_URL}/clientes/${clienteId}/deudas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fecha, monto }),
  });
  if (!response.ok) throw new Error('Error al agregar deuda');
  return await response.json();
};

export const eliminarDeuda = async (deudaId) => {
  const response = await fetch(`${API_URL}/clientes/deudas/${deudaId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar deuda');
  return await response.json();
};

export const editarDeuda = async (deudaId, fecha, monto) => {
  const response = await fetch(`${API_URL}/clientes/deudas/${deudaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fecha, monto }),
  });
  if (!response.ok) throw new Error('Error al editar deuda');
  return await response.json();
};

// ==================== PROVEEDORES ====================

export const obtenerProveedores = async () => {
  const response = await fetch(`${API_URL}/proveedores`);
  if (!response.ok) throw new Error('Error al obtener proveedores');
  return await response.json();
};

export const crearProveedor = async (nombre) => {
  const response = await fetch(`${API_URL}/proveedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  });
  if (!response.ok) throw new Error('Error al crear proveedor');
  return await response.json();
};

export const eliminarProveedor = async (id) => {
  const response = await fetch(`${API_URL}/proveedores/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar proveedor');
  return await response.json();
};

export const obtenerFacturasProveedor = async (proveedorId) => {
  const response = await fetch(`${API_URL}/proveedores/${proveedorId}/facturas`);
  if (!response.ok) throw new Error('Error al obtener facturas');
  return await response.json();
};

export const agregarFactura = async (proveedorId, factura) => {
  const response = await fetch(`${API_URL}/proveedores/${proveedorId}/facturas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(factura),
  });
  if (!response.ok) throw new Error('Error al agregar factura');
  return await response.json();
};

export const editarFactura = async (facturaId, factura) => {
  const response = await fetch(`${API_URL}/proveedores/facturas/${facturaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(factura),
  });
  if (!response.ok) throw new Error('Error al editar factura');
  return await response.json();
};

export const eliminarFactura = async (facturaId) => {
  const response = await fetch(`${API_URL}/proveedores/facturas/${facturaId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar factura');
  return await response.json();
};

export const obtenerPagosProveedor = async (proveedorId) => {
  const response = await fetch(`${API_URL}/proveedores/${proveedorId}/pagos`);
  if (!response.ok) throw new Error('Error al obtener pagos');
  return await response.json();
};

export const agregarPago = async (proveedorId, pago) => {
  const response = await fetch(`${API_URL}/proveedores/${proveedorId}/pagos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pago),
  });
  if (!response.ok) throw new Error('Error al agregar pago');
  return await response.json();
};

export const editarPago = async (pagoId, pago) => {
  const response = await fetch(`${API_URL}/proveedores/pagos/${pagoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pago),
  });
  if (!response.ok) throw new Error('Error al editar pago');
  return await response.json();
};

export const eliminarPago = async (pagoId) => {
  const response = await fetch(`${API_URL}/proveedores/pagos/${pagoId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar pago');
  return await response.json();
};

// ==================== VERDULERÍA ====================

export const obtenerMeses = async () => {
  const response = await fetch(`${API_URL}/verduleria/meses`);
  if (!response.ok) throw new Error('Error al obtener meses');
  return await response.json();
};

export const crearMes = async (mesId, nombre) => {
  const response = await fetch(`${API_URL}/verduleria/meses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mesId, nombre }),
  });
  if (!response.ok) throw new Error('Error al crear mes');
  return await response.json();
};

export const eliminarMes = async (mesId) => {
  const response = await fetch(`${API_URL}/verduleria/meses/${mesId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar mes');
  return await response.json();
};

export const obtenerVentasMes = async (mesId) => {
  const response = await fetch(`${API_URL}/verduleria/meses/${mesId}/ventas`);
  if (!response.ok) throw new Error('Error al obtener ventas');
  return await response.json();
};

export const agregarVenta = async (mesId, venta) => {
  const response = await fetch(`${API_URL}/verduleria/meses/${mesId}/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(venta),
  });
  if (!response.ok) throw new Error('Error al agregar venta');
  return await response.json();
};

export const editarVenta = async (ventaId, venta) => {
  const response = await fetch(`${API_URL}/verduleria/ventas/${ventaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(venta),
  });
  if (!response.ok) throw new Error('Error al editar venta');
  return await response.json();
};

export const eliminarVenta = async (ventaId) => {
  const response = await fetch(`${API_URL}/verduleria/ventas/${ventaId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar venta');
  return await response.json();
};

export const obtenerGastosMes = async (mesId) => {
  const response = await fetch(`${API_URL}/verduleria/meses/${mesId}/gastos`);
  if (!response.ok) throw new Error('Error al obtener gastos');
  return await response.json();
};

export const agregarGasto = async (mesId, gasto) => {
  const response = await fetch(`${API_URL}/verduleria/meses/${mesId}/gastos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gasto),
  });
  if (!response.ok) throw new Error('Error al agregar gasto');
  return await response.json();
};

export const editarGasto = async (gastoId, gasto) => {
  const response = await fetch(`${API_URL}/verduleria/gastos/${gastoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gasto),
  });
  if (!response.ok) throw new Error('Error al editar gasto');
  return await response.json();
};

export const eliminarGasto = async (gastoId) => {
  const response = await fetch(`${API_URL}/verduleria/gastos/${gastoId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar gasto');
  return await response.json();
};