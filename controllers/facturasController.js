const pool = require('../config/db');

exports.crear = async (req, res) => {
  const { numero_factura, id_cliente, cliente_identificacion, metodo_pago, monto_recibido, cambio, detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: 'La factura debe contener al menos un detalle' });
  }

  if (!metodo_pago || !['efectivo', 'transferencia'].includes(metodo_pago)) {
    return res.status(400).json({ error: 'Método de pago inválido' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let facturaNumero = numero_factura;
    if (!facturaNumero) {
      const hoy = new Date();
      const fecha = `${hoy.getFullYear()}${String(hoy.getMonth()+1).padStart(2,'0')}${String(hoy.getDate()).padStart(2,'0')}`;
      const ultimaFactura = await client.query(
        "SELECT numero_factura FROM factura_cabecera WHERE numero_factura LIKE $1 ORDER BY id_factura DESC LIMIT 1",
        [`FAC-${fecha}-%`]
      );
      let consecutivo = 1;
      if (ultimaFactura.rows.length > 0) {
        const ultimo = ultimaFactura.rows[0].numero_factura;
        consecutivo = parseInt(ultimo.split('-')[2]) + 1;
      }
      facturaNumero = `FAC-${fecha}-${String(consecutivo).padStart(4,'0')}`;
    }

    const subtotal = detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_unitario), 0);

    let clienteId = null;
    let clienteInfo = cliente_identificacion || 'N/A';
    let clienteNombre = '';

    if (id_cliente) {
      const clienteCheck = await client.query(
        'SELECT id_cliente, cedula, nombre FROM clientes WHERE id_cliente = $1',
        [id_cliente]
      );
      if (clienteCheck.rows.length > 0) {
        clienteId = id_cliente;
        clienteInfo = clienteCheck.rows[0].cedula;
        clienteNombre = clienteCheck.rows[0].nombre || '';
      }
    }

    const cajeroId = req.user ? req.user.id_usuario : null;

    const facturaResult = await client.query(
      `INSERT INTO factura_cabecera (numero_factura, id_cliente, cliente_identificacion, cliente_nombre, id_cajero, subtotal, total_pagar, metodo_pago, monto_recibido, cambio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [facturaNumero, clienteId, clienteInfo, clienteNombre, cajeroId, subtotal, subtotal, metodo_pago, monto_recibido || null, cambio || null]
    );
    const factura = facturaResult.rows[0];
    const idFactura = factura.id_factura;

    const productosReabastecer = [];

    for (const detalle of detalles) {
      const stockCheck = await client.query(
        'SELECT stock_actual, stock_minimo, nombre, codigo_barra, precio_venta FROM productos WHERE id_producto = $1 AND estado = TRUE',
        [detalle.id_producto]
      );

      if (stockCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Producto con ID ${detalle.id_producto} no encontrado` });
      }

      const producto = stockCheck.rows[0];
      if (producto.stock_actual < detalle.cantidad) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_actual}, Solicitado: ${detalle.cantidad}`
        });
      }

      await client.query(
        `INSERT INTO factura_detalle (id_factura, id_producto, nombre_producto, codigo_barra, cantidad, precio_unitario_historico, subtotal_item)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [idFactura, detalle.id_producto, producto.nombre, producto.codigo_barra, detalle.cantidad, producto.precio_venta, detalle.cantidad * producto.precio_venta]
      );

      const updateResult = await client.query(
        `UPDATE productos
         SET stock_actual = stock_actual - $1
         WHERE id_producto = $2 AND estado = TRUE
         RETURNING stock_actual, stock_minimo, nombre`,
        [detalle.cantidad, detalle.id_producto]
      );

      if (updateResult.rows.length > 0) {
        const p = updateResult.rows[0];
        if (p.stock_actual <= p.stock_minimo) {
          productosReabastecer.push({
            nombre: p.nombre,
            stock_actual: p.stock_actual,
            stock_minimo: p.stock_minimo
          });
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      factura,
      alerta_reorden: productosReabastecer.length > 0,
      productos_reabastecer: productosReabastecer
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM factura_cabecera ORDER BY id_factura DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const facturaResult = await pool.query(
      `SELECT * FROM factura_cabecera WHERE id_factura = $1`,
      [id]
    );

    if (facturaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const detallesResult = await pool.query(
      `SELECT * FROM factura_detalle WHERE id_factura = $1`,
      [id]
    );

    res.json({
      factura: facturaResult.rows[0],
      detalles: detallesResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.estadisticas = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const ventasHoy = await pool.query(
      'SELECT COUNT(*) AS total, COALESCE(SUM(total_pagar), 0) AS monto FROM factura_cabecera WHERE fecha_emision >= CURRENT_DATE'
    );

    const ventasMes = await pool.query(
      'SELECT COUNT(*) AS total, COALESCE(SUM(total_pagar), 0) AS monto FROM factura_cabecera WHERE fecha_emision >= $1',
      [inicioMes]
    );

    const totalVentas = await pool.query(
      'SELECT COUNT(*) AS total, COALESCE(SUM(total_pagar), 0) AS monto FROM factura_cabecera'
    );

    const productosMasVendidos = await pool.query(
      `SELECT nombre_producto AS nombre, SUM(cantidad) AS total_vendido
       FROM factura_detalle
       GROUP BY nombre_producto
       ORDER BY total_vendido DESC
       LIMIT 10`
    );

    res.json({
      ventas_hoy: {
        total: parseInt(ventasHoy.rows[0].total),
        monto: parseFloat(ventasHoy.rows[0].monto)
      },
      ventas_mes: {
        total: parseInt(ventasMes.rows[0].total),
        monto: parseFloat(ventasMes.rows[0].monto)
      },
      total_ventas: {
        total: parseInt(totalVentas.rows[0].total),
        monto: parseFloat(totalVentas.rows[0].monto)
      },
      productos_mas_vendidos: productosMasVendidos.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
