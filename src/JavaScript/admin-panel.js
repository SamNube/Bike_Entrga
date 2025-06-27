// Variables globales
const API_URL = 'http://localhost:3000/api'; // Ajusta según tu configuración
let productos = [];
let usuarioActual = null;

// Verificar si el usuario es administrador al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay un usuario en localStorage
    usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    
    // Si no hay usuario o el usuario no es administrador, redirigir al login
    if (!usuarioActual || usuarioActual.rol !== 'Administrador') {
        alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
        window.location.href = 'login.html';
        return;
    }
    
    // Si todo está bien, cargar el contenido del panel
    cargarProductos();
    
    // Resto del código de inicialización...
    document.getElementById('productoForm').addEventListener('submit', guardarProducto);
    document.getElementById('stockForm').addEventListener('submit', actualizarStock);
    document.getElementById('imagen').addEventListener('input', function() {
        const preview = document.getElementById('imagenPreview');
        const imageUrl = this.value.trim();

        if (imageUrl) {
            preview.src = imageUrl;
            preview.style.display = 'block';

            preview.onerror = function() {
                preview.style.display = 'none';
                showNotification('URL de imagen inválida', 'error');
            };
        } else {
            preview.style.display = 'none';
        }
    });
});

// Mostrar sección
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(function (section) {
        section.classList.remove('active');
    });

    // Desmarcar todos los elementos del menú
    document.querySelectorAll('.sidebar-menu li').forEach(function (item) {
        item.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    document.getElementById(sectionId).classList.add('active');

    // Marcar el elemento de menú seleccionado
    event.currentTarget.classList.add('active');
    
    // Si estamos en la sección de stock, cargamos la tabla de stock
    if (sectionId === 'stock') {
        cargarTablaStock();
        mostrarAlertasStock();
    }
}

// Mostrar modal de producto
function showProductModal(producto = null) {
    const modal = document.getElementById('productoModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productoForm');
    const productoId = document.getElementById('productoId');
    const nombre = document.getElementById('nombre');
    const precio = document.getElementById('precio');
    const stock = document.getElementById('stock');
    const imagen = document.getElementById('imagen');
    const imagenPreview = document.getElementById('imagenPreview');
    const descripcion = document.getElementById('descripcion');
    const categoria = document.getElementById('categoria');

    // Limpiar formulario primero
    form.reset();
    productoId.value = '';
    imagenPreview.style.display = 'none';
    
    // Eliminar cualquier mensaje o estilo previo
    const stockNote = document.getElementById('stock-edit-note');
    if (stockNote) {
        stockNote.remove();
    }
    
    // Resetear el estilo del campo stock
    stock.disabled = false;
    stock.style.backgroundColor = '';
    stock.style.cursor = '';

    if (producto) {
        // Editar producto existente
        modalTitle.textContent = 'Editar Producto';
        productoId.value = producto.id;
        nombre.value = producto.nombre;
        precio.value = producto.precio;
        stock.value = producto.stock || 10;
        imagen.value = producto.imagen;
        descripcion.value = producto.descripcion;
        categoria.value = producto.categoria || '';

        // Deshabilitar campo de stock y aplicar estilo visual
        stock.disabled = true;
        stock.style.backgroundColor = '#f2f2f2';
        stock.style.cursor = 'not-allowed';
        
        // Agregar mensaje informativo debajo del campo
        const stockFormGroup = stock.parentElement;
        const infoMessage = document.createElement('div');
        infoMessage.id = 'stock-edit-note';
        infoMessage.innerHTML = '<div style="color: #dc3545; margin-top: 5px; font-style: italic;"><i class="fas fa-info-circle"></i> El stock sólo puede modificarse desde la sección "Gestión de Stock"</div>';
        stockFormGroup.appendChild(infoMessage);

        // Mostrar vista previa de la imagen
        if (producto.imagen) {
            imagenPreview.src = producto.imagen;
            imagenPreview.style.display = 'block';
        }
    } else {
        // Nuevo producto
        modalTitle.textContent = 'Nuevo Producto';
        stock.value = 10;
        // Para nuevos productos, se permite establecer el stock inicial
    }

    modal.style.display = 'block';
}

// Cerrar modal de producto
function closeProductModal() {
    document.getElementById('productoModal').style.display = 'none';
}

// Mostrar modal para actualizar stock
function showStockModal(producto) {
    const modal = document.getElementById('stockModal');
    const stockProductoId = document.getElementById('stockProductoId');
    const stockProductoNombre = document.getElementById('stockProductoNombre');
    const stockCantidad = document.getElementById('stockCantidad');
    
    stockProductoId.value = producto.id;
    stockProductoNombre.textContent = producto.nombre;
    stockCantidad.value = producto.stock || 10;
    
    modal.style.display = 'block';
}

// Cerrar modal de stock
function closeStockModal() {
    document.getElementById('stockModal').style.display = 'none';
}

// Función para registrar una venta automática cuando el stock disminuye
async function registrarVentaAutomatica(productoId, cantidadAnterior, cantidadNueva) {
    if (cantidadNueva >= cantidadAnterior) return; // Solo si el stock disminuye
    
    const cantidadVendida = cantidadAnterior - cantidadNueva;
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) return;
    
    const ventaData = {
        id_usuario: usuarioActual.id,
        venta_total: producto.precio * cantidadVendida,
        productos: [{
            id: producto.id,
            cantidad: cantidadVendida,
            precio: producto.precio
        }]
    };
    
    try {
        const response = await fetch(`${API_URL}/ventas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ventaData)
        });
        
        if (!response.ok) {
            throw new Error('Error al registrar venta automática');
        }
        
        console.log('Venta automática registrada por disminución de stock');
    } catch (error) {
        console.error('Error al registrar venta automática:', error);
    }
}

// Actualizar stock de un producto
async function actualizarStock(event) {
    event.preventDefault();
    
    const id = document.getElementById('stockProductoId').value;
    const nuevoStock = parseInt(document.getElementById('stockCantidad').value);
    
    // Validar los límites de stock
    if (nuevoStock < 5 || nuevoStock > 20) {
        showNotification('El stock debe estar entre 5 y 20 unidades', 'error');
        return;
    }
    
    try {
        // Obtener el producto actual para comparar el stock
        const response = await fetch(`${API_URL}/productos/${id}`);
        if (!response.ok) throw new Error('Error al obtener datos del producto');
        
        const producto = await response.json();
        const stockAnterior = producto.stock || 10;
        
        // Actualizar el stock
        producto.stock = nuevoStock;
        const updateResponse = await fetch(`${API_URL}/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });
        
        if (!updateResponse.ok) throw new Error('Error al actualizar el stock');
        
        // Si el stock disminuyó, registrar venta automática
        if (nuevoStock < stockAnterior) {
            await registrarVentaAutomatica(id, stockAnterior, nuevoStock);
        }
        
        closeStockModal();
        cargarProductos();
        if (document.getElementById('stock').classList.contains('active')) {
            cargarTablaStock();
            mostrarAlertasStock();
        }
        showNotification('Stock actualizado correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Cargar productos desde la API
function cargarProductos() {
    fetch(`${API_URL}/productos`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }
            return response.json();
        })
        .then(data => {
            productos = data.filter(p => p.activo !== 0); // Solo productos activos
            window.productos = productos;
            renderizarProductos();
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al cargar productos: ' + error.message, 'error');
        });
}

// Renderizar productos en la tabla
function renderizarProductos() {
    const tabla = document.getElementById('productos-tabla');
    tabla.innerHTML = '';

    if (productos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay productos registrados</td></tr>';
        return;
    }

    productos.forEach(producto => {
        const fila = document.createElement('tr');
        
        const stockClass = (producto.stock < 5) ? 'stock-low' : 'stock-normal';

        fila.innerHTML = `
             <td>${producto.id}</td>
             <td><img src="${producto.imagen}" alt="${producto.nombre}" class="product-image"></td>
             <td>${producto.nombre}</td>
             <td>$${parseFloat(producto.precio).toFixed(2)}</td>
             <td><span class="${stockClass}">${producto.stock || 0}</span></td>
             <td>${producto.categoria || 'Sin categoría'}</td>
             <td class="action-buttons">
                 <button class="btn-view" onclick="verProducto(${producto.id})">
                     <i class="fas fa-eye"></i>
                 </button>
                 <button class="btn-edit" onclick="editarProducto(${producto.id})">
                     <i class="fas fa-edit"></i>
                 </button>
                 <button class="btn-delete" onclick="confirmarEliminarProducto(${producto.id})">
                     <i class="fas fa-trash"></i>
                 </button>
             </td>
         `;

        tabla.appendChild(fila);
    });
}

// Cargar tabla de gestión de stock
function cargarTablaStock() {
    const tabla = document.getElementById('stock-tabla');
    tabla.innerHTML = '';
    
    if (productos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos registrados</td></tr>';
        return;
    }
    
    productos.forEach(producto => {
        const fila = document.createElement('tr');
        
        const stockClass = (producto.stock < 5) ? 'stock-low' : 'stock-normal';
        
        fila.innerHTML = `
            <td>${producto.id}</td>
            <td><img src="${producto.imagen}" alt="${producto.nombre}" class="product-image"></td>
            <td>${producto.nombre}</td>
            <td><span class="${stockClass}">${producto.stock || 0}</span></td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="showStockModal(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
                    <i class="fas fa-edit"></i> Actualizar Stock
                </button>
            </td>
        `;
        
        tabla.appendChild(fila);
    });
}

// Mostrar alertas de stock bajo
function mostrarAlertasStock() {
    const alertContainer = document.getElementById('stockAlerts');
    alertContainer.innerHTML = '';
    
    const productosStockBajo = productos.filter(p => p.stock < 5);
    
    if (productosStockBajo.length === 0) {
        alertContainer.innerHTML = '<div class="stock-alert" style="background-color: #e8f5e9; border-left: 4px solid #4CAF50;">No hay productos con stock bajo actualmente.</div>';
        return;
    }
    
    productosStockBajo.forEach(producto => {
        const alerta = document.createElement('div');
        alerta.className = 'stock-alert';
        alerta.innerHTML = `
            <div>
                <strong>¡Alerta de Stock Bajo!</strong> 
                El producto "${producto.nombre}" tiene solo ${producto.stock || 0} unidades disponibles.
            </div>
            <button class="dismiss-btn" onclick="showStockModal(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
                Actualizar
            </button>
        `;
        alertContainer.appendChild(alerta);
    });
}

// Guardar producto (crear o actualizar)
function guardarProducto(event) {
    event.preventDefault();

    const productoId = document.getElementById('productoId').value;
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const imagen = document.getElementById('imagen').value;
    const descripcion = document.getElementById('descripcion').value;
    const categoria = document.getElementById('categoria').value;
    
    // Solo tomamos el valor del stock si es un nuevo producto
    let stock;
    if (!productoId) {
        stock = document.getElementById('stock').value;
        // Validar los límites de stock
        if (stock < 5 || stock > 20) {
            showNotification('El stock debe estar entre 5 y 20 unidades', 'error');
            return;
        }
    } else {
        // Si estamos editando, obtenemos el stock actual del producto
        const productoActual = productos.find(p => p.id == productoId);
        if (productoActual) {
            stock = productoActual.stock;
        } else {
            stock = document.getElementById('stock').value; // Fallback
        }
    }

    const producto = {
        nombre,
        precio,
        stock,
        imagen,
        descripcion,
        categoria
    };

    const url = productoId ? `${API_URL}/productos/${productoId}` : `${API_URL}/productos`;
    const method = productoId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar el producto');
            }
            return response.json();
        })
        .then(data => {
            closeProductModal();
            cargarProductos();
            showNotification(productoId ? 'Producto actualizado correctamente' : 'Producto creado correctamente', 'success');
            
            if (typeof window.actualizarCatalogo === 'function') {
                window.actualizarCatalogo();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error: ' + error.message, 'error');
        });
}

// Editar producto
function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        showProductModal(producto);
    } else {
        showNotification('Producto no encontrado', 'error');
    }
}

// Ver detalles de producto
async function verProducto(id) {
    // Obtiene los datos del producto desde la API
    const res = await fetch(`${API_URL}/productos/${id}`);
    const producto = await res.json();

    // Llena el contenido del modal
    const detalles = document.getElementById('productoDetalles');
    detalles.innerHTML = `
        <h2>${producto.nombre}</h2>
        <img src="${producto.imagen}" alt="${producto.nombre}" style="max-width:100%;margin-bottom:10px;">
        <p><strong>Precio:</strong> $${producto.precio}</p>
        <p><strong>Categoría:</strong> ${producto.categoria}</p>
        <p><strong>Descripción:</strong> ${producto.descripcion}</p>
    `;

    // Muestra el modal
    document.getElementById('verProductoModal').style.display = 'block';
}

// Cerrar el modal
function closeVerProductoModal() {
    document.getElementById('verProductoModal').style.display = 'none';
}

// Confirmar eliminación de producto
function confirmarEliminarProducto(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        eliminarProducto(id);
    }
}

// Eliminar producto
function eliminarProducto(id) {
    fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar el producto');
            }
            return response.json();
        })
        .then(data => {
            cargarProductos();
            showNotification('Producto eliminado correctamente', 'success');
            
            if (typeof window.actualizarCatalogo === 'function') {
                window.actualizarCatalogo();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error: ' + error.message, 'error');
        });
}

// Mostrar notificación
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification ' + type;
    notification.style.opacity = '1';

    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

// Función para generar reportes de ventas
async function generarReporteVentas() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    let url = `${API_URL}/ventas/filtrar?`;
    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}&`;

    const res = await fetch(url);
    const ventas = await res.json();

    // Obtener usuarios y detalles de venta para mostrar nombre y productos
    const usuariosRes = await fetch(`${API_URL}/usuarios`);
    const usuarios = await usuariosRes.json();

    const tabla = document.getElementById('reporte-ventas-tabla');
    tabla.innerHTML = '';

    for (const venta of ventas) {
        const usuario = usuarios.find(u => u.id === venta.id_usuario);
        const nombreCliente = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Desconocido';

        const detalleRes = await fetch(`${API_URL}/detalle_venta/${venta.id}`);
        const detalles = await detalleRes.json();

        const productosNombres = detalles.map(d => d.nombre).join(', ');
        const totalUnidades = detalles.reduce((sum, d) => sum + d.cantidad, 0);
        const precioUnitario = detalles.length > 0 ? detalles[0].precio_unitario : '-';

        // Pasar datos como JSON seguro para el modal
        const ventaData = encodeURIComponent(JSON.stringify(venta));
        const usuarioData = encodeURIComponent(JSON.stringify(usuario));
        const detallesData = encodeURIComponent(JSON.stringify(detalles));

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${venta.id}</td>
            <td>${formatearFecha(venta.fecha_venta)}</td>
            <td>${nombreCliente}</td>
            <td>${productosNombres}</td>
            <td>${totalUnidades}</td>
            <td>$${precioUnitario}</td>
            <td>$${venta.venta_total}</td>
            <td>
                <button class="btn-view" onclick="verDetalleVenta('${ventaData}','${usuarioData}','${detallesData}')">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    }

    // Llama aquí a la nueva función de productos más vendidos
    await cargarProductosMasVendidosPorHistorial();
}

// Modal para ver detalles de venta
function crearModalDetalleVenta() {
    if (document.getElementById('detalleVentaModal')) return; // Ya existe
    const modal = document.createElement('div');
    modal.id = 'detalleVentaModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" id="detalleVentaContenido" style="max-width:600px; position:relative;"></div>
    `;
    document.body.appendChild(modal);
    // Cerrar al hacer click fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) cerrarDetalleVentaModal();
    });
}

function cerrarDetalleVentaModal() {
    const modal = document.getElementById('detalleVentaModal');
    if (modal) modal.style.display = 'none';
}

async function verDetalleVenta(ventaStr, usuarioStr, detallesStr) {
    crearModalDetalleVenta();
    const modal = document.getElementById('detalleVentaModal');
    const contenido = document.getElementById('detalleVentaContenido');
    contenido.innerHTML = '<div style="padding:30px;text-align:center;">Cargando...</div>';
    modal.style.display = 'block';
    try {
        const venta = JSON.parse(decodeURIComponent(ventaStr));
        const usuario = JSON.parse(decodeURIComponent(usuarioStr));
        const detalles = JSON.parse(decodeURIComponent(detallesStr));
        let productosHtml = await Promise.all(detalles.map(async d => {
            let imagen = d.imagen;
            let descripcion = d.descripcion;
            // Si no hay imagen o descripción, intenta buscar en el catálogo (activos o inactivos)
            if (!imagen || !descripcion) {
                let prod = productos.find(p => p.id == d.id_producto);
                if (!prod) {
                    // Buscar en la API aunque esté inactivo
                    try {
                        const res = await fetch(`${API_URL}/productos/${d.id_producto}`);
                        if (res.ok) prod = await res.json();
                    } catch {}
                }
                if (!imagen && prod && prod.imagen) imagen = prod.imagen;
                if ((!descripcion || descripcion === '') && prod && prod.descripcion) descripcion = prod.descripcion;
            }
            return `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:12px;min-width:200px;">
                        <img src="${imagen || ''}" alt="${d.nombre}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;background:#f5f5f5;" onerror="this.onerror=null;this.src='https://cdn-icons-png.flaticon.com/512/2748/2748558.png';">
                        <div style="text-align:left;">
                            <div style="font-weight:600;font-size:15px;line-height:1.2;">${d.nombre}</div>
                            <div style="font-size:12px;color:#666;max-width:220px;white-space:normal;word-break:break-word;">${descripcion || '<span style=\'color:#bbb\'>(Sin descripción)</span>'}</div>
                        </div>
                    </div>
                </td>
                <td>${d.cantidad}</td>
                <td>$${parseFloat(d.precio_unitario).toFixed(2)}</td>
                <td>$${(d.cantidad * d.precio_unitario).toFixed(2)}</td>
            </tr>
            `;
        }));
        contenido.innerHTML = `
            <span class="close-modal" style="position:absolute;top:10px;right:20px;font-size:2rem;cursor:pointer;" onclick="cerrarDetalleVentaModal()">&times;</span>
            <h2 style="margin-bottom:10px;">Detalle de Venta #${venta.id}</h2>
            <div style="margin-bottom:10px;"><strong>Cliente:</strong> ${usuario ? usuario.nombre + ' ' + usuario.apellido : 'Desconocido'}</div>
            <div style="margin-bottom:10px;"><strong>Fecha:</strong> ${formatearFecha(venta.fecha_venta)}</div>
            <div style="margin-bottom:10px;"><strong>Total:</strong> $${venta.venta_total}</div>
            <table style="width:100%;border-collapse:collapse;margin-top:10px;">
                <thead>
                    <tr style="background:#f5f5f5;">
                        <th style="text-align:left;">Producto / Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHtml.join('')}
                </tbody>
            </table>
        `;
    } catch (err) {
        contenido.innerHTML = '<div style="padding:30px;text-align:center;color:red;">Error al cargar detalles de la venta.</div>';
    }
}

// Estilos para el modal de detalle de venta
(function(){
    const style = document.createElement('style');
    style.innerHTML = `
    .modal { display:none; position:fixed; z-index:9999; left:0; top:0; width:100vw; height:100vh; overflow:auto; background:rgba(0,0,0,0.4); }
    .modal-content { background:#fff; margin:60px auto; padding:30px 20px 20px 20px; border-radius:10px; box-shadow:0 2px 16px rgba(0,0,0,0.2); position:relative; }
    .modal-content table th, .modal-content table td { padding:8px 6px; border-bottom:1px solid #eee; text-align:center; }
    .modal-content table th { background:#f5f5f5; }
    .close-modal { color:#888; font-weight:bold; transition:color 0.2s; }
    .close-modal:hover { color:#e53935; }
    @media (max-width:700px) { .modal-content { width:95vw !important; padding:10px; } }
    `;
    document.head.appendChild(style);
})();

// Función para cargar productos más vendidos
async function cargarProductosMasVendidos() {
    let url = `${API_URL}/productos/mas-vendidos`;
    const res = await fetch(url);
    const productosMasVendidos = await res.json();

    // Obtener imagen y descripción incluso si el producto está inactivo o eliminado
    const productosHtml = await Promise.all(productosMasVendidos.map(async p => {
        let imagen = p.imagen;
        let descripcion = p.descripcion;
        // Si falta imagen o descripción, intenta buscar en el catálogo (activos o inactivos)
        if (!imagen || !descripcion) {
            let prod = productos.find(prod => prod.id == p.id);
            if (!prod) {
                // Buscar en la API aunque esté inactivo
                try {
                    const res = await fetch(`${API_URL}/productos/${p.id}`);
                    if (res.ok) prod = await res.json();
                } catch {}
            }
            if (!imagen && prod && prod.imagen) imagen = prod.imagen;
            if ((!descripcion || descripcion === '') && prod && prod.descripcion) descripcion = prod.descripcion;
        }
        return `
            <tr>
                <td>${p.id}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;min-width:180px;">
                        <img src="${imagen || ''}" alt="${p.nombre}" style="width:40px;height:40px;object-fit:cover;border-radius:5px;background:#f5f5f5;" onerror="this.onerror=null;this.src='https://cdn-icons-png.flaticon.com/512/2748/2748558.png';">
                        <span style="font-weight:600;">${p.nombre}</span>
                    </div>
                </td>
                <td style="max-width:250px;white-space:normal;word-break:break-word;font-size:13px;color:#555;">${descripcion || '<span style=\'color:#bbb\'>(Sin descripción)</span>'}</td>
                <td>${p.total_vendido}</td>
                <td>$${parseFloat(p.total).toFixed(2)}</td>
            </tr>
        `;
    }));

    const contenedor = document.getElementById('productos-mas-vendidos');
    contenedor.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Descripción</th>
                    <th>Unidades vendidas</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${productosHtml.length === 0
                    ? `<tr><td colspan="5" style="text-align:center;">No hay productos vendidos</td></tr>`
                    : productosHtml.join('')}
            </tbody>
        </table>
    `;
}

// Función para cerrar la sesión
function cerrarSesion() {
    // Eliminar datos de usuario del localStorage
    localStorage.removeItem('usuarioActual');
    // Redireccionar al login
    window.location.href = 'login.html';
}

// Nueva función para ver el producto más vendido
async function verProductoMasVendido() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    let url = `${API_URL}/productos/mas-vendidos?`;
    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}&`;

    const res = await fetch(url);
    const productos = await res.json();
    if (productos.length === 0) {
        showNotification('No hay productos vendidos en este periodo', 'error');
        return;
    }
    // Muestra el modal de detalles del producto más vendido
    verProducto(productos[0].id);
}

// Eliminar venta
// function eliminarVenta(id) {
//     if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
//         fetch(`${API_URL}/ventas/${id}`, {
//             method: 'DELETE'
//         })
//         .then(res => {
//             if (!res.ok) throw new Error('Error al eliminar la venta');
//             showNotification('Venta eliminada correctamente', 'success');
//             generarReporteVentas(); // Recarga el reporte
//         })
//         .catch(err => {
//             showNotification('No se pudo eliminar la venta', 'error');
//         });
//     }
// }

// Puedes colocar esto al inicio del archivo
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

// Productos más vendidos por historial de ventas (filtro por fechas)
async function cargarProductosMasVendidosPorHistorial() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    let url = `${API_URL}/ventas/filtrar?`;
    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}&`;

    // Obtener ventas filtradas
    const res = await fetch(url);
    const ventas = await res.json();

    // Acumulador de productos vendidos
    const productosVendidos = {};

    // Recorrer ventas y acumular productos vendidos
    for (const venta of ventas) {
        const detalleRes = await fetch(`${API_URL}/detalle_venta/${venta.id}`);
        const detalles = await detalleRes.json();
        for (const d of detalles) {
            if (!productosVendidos[d.id_producto]) {
                productosVendidos[d.id_producto] = {
                    id: d.id_producto,
                    nombre: d.nombre,
                    descripcion: d.descripcion || '',
                    imagen: d.imagen || '',
                    total_vendido: 0,
                    total: 0,
                    precio: d.precio_unitario
                };
            }
            productosVendidos[d.id_producto].total_vendido += d.cantidad;
            productosVendidos[d.id_producto].total += d.cantidad * d.precio_unitario;
        }
    }

    // Convertir a array y ordenar
    const productosArray = Object.values(productosVendidos);
    productosArray.sort((a, b) => b.total_vendido - a.total_vendido);

    // Aplicar lógica de respaldo para imagen y descripción
    const productosHtml = await Promise.all(productosArray.map(async p => {
        let imagen = p.imagen;
        let descripcion = p.descripcion;
        if (!imagen || !descripcion) {
            let prod = productos.find(prod => prod.id == p.id);
            if (!prod) {
                try {
                    const res = await fetch(`${API_URL}/productos/${p.id}`);
                    if (res.ok) prod = await res.json();
                } catch {}
            }
            if (!imagen && prod && prod.imagen) imagen = prod.imagen;
            if ((!descripcion || descripcion === '') && prod && prod.descripcion) descripcion = prod.descripcion;
        }
        return `
            <tr>
                <td>${p.id}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;min-width:180px;">
                        <img src="${imagen || ''}" alt="${p.nombre}" style="width:40px;height:40px;object-fit:cover;border-radius:5px;background:#f5f5f5;" onerror="this.onerror=null;this.src='https://cdn-icons-png.flaticon.com/512/2748/2748558.png';">
                        <span style="font-weight:600;">${p.nombre}</span>
                    </div>
                </td>
                <td style="max-width:250px;white-space:normal;word-break:break-word;font-size:13px;color:#555;">${descripcion || '<span style=\'color:#bbb\'>(Sin descripción)</span>'}</td>
                <td>${p.total_vendido}</td>
                <td>$${parseFloat(p.total).toFixed(2)}</td>
            </tr>
        `;
    }));

    // Renderizar tabla
    const contenedor = document.getElementById('productos-mas-vendidos');
    contenedor.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Descripción</th>
                    <th>Unidades vendidas</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${productosHtml.length === 0
                    ? `<tr><td colspan="5" style="text-align:center;">No hay productos vendidos en este periodo.</td></tr>`
                    : productosHtml.join('')}
            </tbody>
        </table>
    `;
}