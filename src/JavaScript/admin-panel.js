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

        // Mostrar vista previa de la imagen
        if (producto.imagen) {
            imagenPreview.src = producto.imagen;
            imagenPreview.style.display = 'block';
        }
    } else {
        // Nuevo producto
        modalTitle.textContent = 'Nuevo Producto';
        stock.value = 10;
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
            productos = data.map(producto => ({
                ...producto,
                precio: parseFloat(producto.precio).toFixed(2) // Asegurar formato consistente
            }));
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
    const stock = document.getElementById('stock').value;
    const imagen = document.getElementById('imagen').value;
    const descripcion = document.getElementById('descripcion').value;
    const categoria = document.getElementById('categoria').value;
    
    // Validar los límites de stock
    if (stock < 5 || stock > 20) {
        showNotification('El stock debe estar entre 5 y 20 unidades', 'error');
        return;
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
function verProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        const modal = document.getElementById('verProductoModal');
        const detalles = document.getElementById('productoDetalles');
        
        const stockClass = (producto.stock < 5) ? 'stock-low' : 'stock-normal';

        detalles.innerHTML = `
             <div style="display: flex; margin-bottom: 20px;">
                 <div style="flex: 1;">
                     <img src="${producto.imagen}" alt="${producto.nombre}" style="max-width: 100%; border-radius: 5px;">
                 </div>
                 <div style="flex: 2; padding-left: 20px;">
                     <h3>${producto.nombre}</h3>
                     <p><strong>Precio:</strong> $${parseFloat(producto.precio).toFixed(2)}</p>
                     <p><strong>Stock:</strong> <span class="${stockClass}">${producto.stock || 0} unidades</span></p>
                     <p><strong>Categoría:</strong> ${producto.categoria || 'Sin categoría'}</p>
                     <p><strong>Descripción:</strong></p>
                     <p>${producto.descripcion}</p>
                 </div>
             </div>
             <div style="text-align: right;">
                 <button class="btn-edit" onclick="editarProducto(${producto.id}); closeVerProductoModal();">
                     <i class="fas fa-edit"></i> Editar
                 </button>
             </div>
         `;

        modal.style.display = 'block';
    } else {
        showNotification('Producto no encontrado', 'error');
    }
}

// Cerrar modal de ver producto
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

// Función para cerrar la sesión
function cerrarSesion() {
    // Eliminar datos de usuario del localStorage
    localStorage.removeItem('usuarioActual');
    // Redireccionar al login
    window.location.href = 'login.html';
}