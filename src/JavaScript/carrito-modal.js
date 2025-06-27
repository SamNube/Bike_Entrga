// Funciones para el carrito

// Elementos del DOM - usando selectores agrupados donde es posible
const elements = {
  carritoBtnElement: document.querySelector('.carrito'),
  modalCarritoElement: document.getElementById('modal-carrito'),
  listaCarritoElement: document.getElementById('lista-carrito'),
  mensajeCarritoVacioElement: document.getElementById('mensaje-carrito-vacio'),
  precioTotalElement: document.getElementById('precio-total'),
  contadorCarritoElement: document.getElementById('cartCounter')
};

// Obtener botones
const btns = {
  cerrarModalCarritoBtn: elements.modalCarritoElement.querySelector('.cerrar-modal'),
  cerrarModalCarritoBtnSecundario: document.getElementById('cerrar-modal-carrito'),
  limpiarCarritoBtn: document.getElementById('limpiar-carrito'),
  procederCompraBtn: document.getElementById('proceder-compra')
};

// Estado del carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Formatear precio en COP
const formatCOP = amount => {
  // Usar NumberFormat para formatear el número con separadores de miles
  const formattedNumber = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  // Agregar el símbolo de moneda y formato consistente con el modal de productos
  return `$${formattedNumber} COP`;
};

// Guardar carrito en localStorage
const guardarCarritoEnLocalStorage = () => localStorage.setItem('carrito', JSON.stringify(carrito));

// Actualizar contador del carrito
const actualizarContadorCarrito = () => {
  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
  elements.contadorCarritoElement.textContent = cantidadTotal;
  elements.contadorCarritoElement.style.display = cantidadTotal > 0 ? 'inline-block' : 'none';
};

// Función para mostrar una notificación
const mostrarNotificacion = (mensaje, tipo = 'info') => {
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion ${tipo}`;
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);

  setTimeout(() => notificacion.classList.add('mostrar'), 10);
  setTimeout(() => {
    notificacion.classList.remove('mostrar');
    setTimeout(() => document.body.removeChild(notificacion), 300);
  }, 2000);
};

// Verificar stock disponible
const verificarStockDisponible = (productoId, cantidadSolicitada = 1) => {
  // Obtener productos del catálogo
  const productos = obtenerProductosCatalogo();
  const producto = productos.find(p => p.id === productoId);

  if (!producto) {
    return { disponible: false, mensaje: 'Producto no encontrado' };
  }

  // Verificar cuántas unidades ya tiene en el carrito
  const itemEnCarrito = carrito.find(item => item.id === productoId);
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  // Calcular la cantidad total si se agregara la cantidad solicitada
  const cantidadTotal = cantidadEnCarrito + cantidadSolicitada;

  // Verificar si hay suficiente stock
  if (cantidadTotal > producto.stock) {
    return {
      disponible: false,
      mensaje: `Solo quedan ${producto.stock} unidades disponibles (${cantidadEnCarrito} en tu carrito)`
    };
  }

  return { disponible: true };
};

// Funciones para manejar el carrito
const operacionesCarrito = {
  // Añadir al carrito
  agregarAlCarrito: (id, nombre, imagen) => {
    // Verificar stock antes de agregar
    const verificacion = verificarStockDisponible(id, 1);

    if (!verificacion.disponible) {
      mostrarNotificacion(verificacion.mensaje, 'error');
      return false;
    }

    // Obtener el precio actualizado del catálogo
    const productos = obtenerProductosCatalogo();
    const productoCatalogo = productos.find(p => p.id === id);

    if (!productoCatalogo) {
      mostrarNotificacion('Producto no encontrado en el catálogo', 'error');
      return false;
    }

    const precio = parseFloat(productoCatalogo.precio).toFixed(2); // Usar el precio del catálogo

    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
      productoExistente.cantidad += 1;
    } else {
      carrito.push({ id, nombre, imagen, precio, cantidad: 1 });
    }

    mostrarNotificacion(`${nombre} añadido al carrito`);
    guardarCarritoEnLocalStorage();
    actualizarContadorCarrito();

    if (elements.modalCarritoElement.classList.contains('activo')) {
      operacionesCarrito.renderizarCarrito();
    }

    return true;
  },

  // Incrementar cantidad
  incrementarCantidad: id => {
    // Verificar stock antes de incrementar
    const verificacion = verificarStockDisponible(id, 1);

    if (!verificacion.disponible) {
      mostrarNotificacion(verificacion.mensaje, 'error');
      return false;
    }

    const producto = carrito.find(item => item.id === id);
    if (producto) {
      producto.cantidad += 1;
      guardarCarritoEnLocalStorage();
      operacionesCarrito.renderizarCarrito();
      actualizarContadorCarrito();
      return true;
    }
    return false;
  },

  // Decrementar cantidad
  decrementarCantidad: id => {
    const producto = carrito.find(item => item.id === id);
    if (producto) {
      if (producto.cantidad > 1) {
        producto.cantidad -= 1;
      } else {
        operacionesCarrito.eliminarDelCarrito(id);
        return true;
      }
      guardarCarritoEnLocalStorage();
      operacionesCarrito.renderizarCarrito();
      actualizarContadorCarrito();
      return true;
    }
    return false;
  },

  // Eliminar del carrito
  eliminarDelCarrito: id => {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarritoEnLocalStorage();
    operacionesCarrito.renderizarCarrito();
    actualizarContadorCarrito();
    return true;
  },

  // Renderizar carrito
  renderizarCarrito: () => {
    if (carrito.length === 0) {
      elements.listaCarritoElement.style.display = 'none';
      elements.mensajeCarritoVacioElement.style.display = 'block';
      elements.precioTotalElement.textContent = formatCOP(0);
      return;
    }

    elements.listaCarritoElement.style.display = 'block';
    elements.mensajeCarritoVacioElement.style.display = 'none';
    elements.listaCarritoElement.innerHTML = '';

    let total = 0;

    // Obtener productos del catálogo para verificar stock
    const productos = obtenerProductosCatalogo();

    carrito.forEach(productoCarrito => {
      const subtotal = productoCarrito.precio * productoCarrito.cantidad;
      total += subtotal;

      // Verificar stock disponible para mostrar advertencias
      const productoEnCatalogo = productos.find(p => p.id === productoCarrito.id);
      const stockDisponible = productoEnCatalogo ? productoEnCatalogo.stock : 0;
      const esUltimaUnidad = stockDisponible <= productoCarrito.cantidad;

      const itemHTML = document.createElement('div');
      itemHTML.className = 'item-carrito';

      // Agregar clase si es la última unidad disponible
      if (esUltimaUnidad) {
        itemHTML.classList.add('stock-bajo');
      }

      itemHTML.innerHTML = `
        <img src="${productoCarrito.imagen}" alt="${productoCarrito.nombre}">
        <div class="info-producto">
          <h4>${productoCarrito.nombre}</h4>
          <p class="precio-producto">${formatCOP(productoCarrito.precio)} x ${productoCarrito.cantidad} = ${formatCOP(subtotal)}</p>
          ${esUltimaUnidad ? '<p class="stock-advertencia">¡Últimas unidades disponibles!</p>' : ''}
        </div>
        <div class="controles-carrito">
          <div class="cantidad-control">
            <button class="decrementar" data-id="${productoCarrito.id}">-</button>
            <span>${productoCarrito.cantidad}</span>
            <button class="incrementar" data-id="${productoCarrito.id}" ${stockDisponible <= productoCarrito.cantidad ? 'disabled' : ''}>+</button>
          </div>
          <button class="eliminar-producto" data-id="${productoCarrito.id}"><i class="fas fa-trash"></i></button>
        </div>
      `;

      elements.listaCarritoElement.appendChild(itemHTML);
    });

    elements.precioTotalElement.textContent = formatCOP(total);
  },

  // Mostrar modal
  mostrarModalCarrito: () => {
    operacionesCarrito.renderizarCarrito();
    elements.modalCarritoElement.classList.add('activo');
    elements.modalCarritoElement.style.display = 'block';
  },

  // Convertir precio USD a COP (estimado)
  convertirUSDaCOP: (usdPrecio) => {
    // Tasa de cambio estimada (ajustar según necesidad)
    const tasaCambio = 4000;
    return Math.round(parseFloat(usdPrecio) * tasaCambio);
  }
};

// Event listener para los botones de control del carrito
elements.listaCarritoElement.addEventListener('click', event => {
  const target = event.target;

  if (target.classList.contains('incrementar') && !target.disabled) {
    const id = parseInt(target.dataset.id);
    operacionesCarrito.incrementarCantidad(id);
  } else if (target.classList.contains('decrementar')) {
    const id = parseInt(target.dataset.id);
    operacionesCarrito.decrementarCantidad(id);
  } else if (target.classList.contains('eliminar-producto') || target.closest('.eliminar-producto')) {
    const button = target.classList.contains('eliminar-producto') ? target : target.closest('.eliminar-producto');
    const id = parseInt(button.dataset.id);
    operacionesCarrito.eliminarDelCarrito(id);
  }
});

// Inicializar el contador
actualizarContadorCarrito();

// Event Listeners - usando el patrón de delegación de eventos cuando es posible
elements.carritoBtnElement.addEventListener('click', operacionesCarrito.mostrarModalCarrito);
btns.cerrarModalCarritoBtn.addEventListener('click', () => elements.modalCarritoElement.classList.remove('activo'));
btns.cerrarModalCarritoBtnSecundario.addEventListener('click', () => elements.modalCarritoElement.classList.remove('activo'));

// Limpiar carrito
btns.limpiarCarritoBtn.addEventListener('click', () => {
  if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
    carrito = [];
    guardarCarritoEnLocalStorage();
    operacionesCarrito.renderizarCarrito();
    actualizarContadorCarrito();
  }
});

// Proceder al pago
btns.procederCompraBtn.addEventListener('click', () => {
  if (carrito.length > 0) {
    // Verificar stock disponible para todos los productos antes de proceder
    let todoDisponible = true;
    const productos = obtenerProductosCatalogo();

    for (const itemCarrito of carrito) {
      const productoEnCatalogo = productos.find(p => p.id === itemCarrito.id);

      if (!productoEnCatalogo || productoEnCatalogo.stock < itemCarrito.cantidad) {
        todoDisponible = false;
        mostrarNotificacion(`No hay suficiente stock de "${itemCarrito.nombre}". Por favor, ajusta tu carrito.`, 'error');
        break;
      }
    }

    if (todoDisponible) {
      alert('Redirigiendo al proceso de pago...');
      // Aquí iría la redirección al checkout
    }
  } else {
    alert('Tu carrito está vacío. Añade productos antes de proceder al pago.');
  }
});

// NUEVO: Integración con el catálogo de productos

// Función para obtener productos del catálogo
function obtenerProductosCatalogo() {
  // Verifica si la variable existe en el ámbito global
  if (typeof productosDelCatalogo !== 'undefined') {
    return productosDelCatalogo;
  } else if (typeof window.productosDelCatalogo !== 'undefined') {
    return window.productosDelCatalogo;
  } else if (typeof window.productos !== 'undefined') {
    // Intenta usar los productos del admin panel si están disponibles
    return window.productos;
  } else {
    console.warn('No se encontraron productos en el catálogo');
    return [];
  }
}

// Event listener para botones "Añadir al carrito" en el modal de producto
document.addEventListener('click', event => {
  // Solo actúa si es un botón con texto "Añadir al carrito" o clase específica
  const target = event.target;
  const isAddToCartButton = target.textContent.includes('Añadir al carrito') ||
    target.innerHTML.includes('fa-shopping-cart');

  if (event.target.closest('.producto-modal button') && isAddToCartButton && !event.target.disabled) {
    // Buscar el modal que contiene el botón
    const modal = event.target.closest('.producto-modal');
    if (modal) {
      // Obtener el título del producto desde el modal
      const titulo = modal.querySelector('h2').textContent;
      // Buscar el producto en el catálogo
      const productos = obtenerProductosCatalogo();
      const producto = productos.find(p => p.nombre === titulo);

      if (producto) {
        // Verificar stock disponible
        if (producto.stock <= 0) {
          mostrarNotificacion('Este producto está agotado', 'error');
          return;
        }

        // Convertir precio USD a COP para mantener consistencia
        const precioCOP = operacionesCarrito.convertirUSDaCOP(producto.precio);

        // Intentar agregar al carrito
        const agregado = operacionesCarrito.agregarAlCarrito(
          producto.id,
          producto.nombre,
          producto.imagen,
          precioCOP
        );

        // Cerrar el modal solo si se agregó correctamente
        if (agregado) {
          document.body.removeChild(modal);
        }
      }
    }
  }
});

// Event listener para botones "Añadir al carrito" en tarjetas de productos
document.addEventListener('click', event => {
  const productBtn = event.target.closest('.producto button');
  if (productBtn && !productBtn.disabled) {
    const producto = productBtn.closest('.producto');

    // Intentar obtener el ID del producto
    let productoId;
    // Buscar si tiene un atributo de ID
    if (producto.dataset.id) {
      productoId = parseInt(producto.dataset.id);
    } else {
      // Si no tiene ID, usar un índice como fallback
      productoId = Array.from(document.querySelectorAll('.producto')).indexOf(producto) + 1;
    }

    // Verificar stock disponible
    const productos = obtenerProductosCatalogo();
    const productoInfo = productos.find(p => p.id === productoId);

    if (productoInfo && productoInfo.stock <= 0) {
      mostrarNotificacion('Este producto está agotado', 'error');
      return;
    }

    const productoNombre = producto.querySelector('h3').textContent;
    const productoImagenSrc = producto.querySelector('img').src;

    // Extraer el precio
    const precioText = producto.querySelector('.precio').textContent;
    const precioCOP = parseFloat(precioText.replace(/[^\d,\.]/g, '').replace(/\./g, '').replace(',', '.'));

    operacionesCarrito.agregarAlCarrito(productoId, productoNombre, productoImagenSrc, precioCOP);
  }
});

// Integración con los botones en slides de Swiper
document.addEventListener('click', event => {
  // Si el clic es en un botón "Añadir al carrito" en cualquier lugar
  const addCartBtn = event.target.closest('button:not([disabled])');

  if (addCartBtn && addCartBtn.textContent.includes('Añadir al carrito')) {
    event.preventDefault();

    // Subir en el DOM para encontrar el contenedor del producto
    const contenedor = addCartBtn.closest('[data-producto-id]') ||
      addCartBtn.closest('.swiper-slide') ||
      addCartBtn.closest('.modal-content');

    if (contenedor) {
      let productoId;

      // Intenta obtener el ID del producto
      if (contenedor.dataset.productoId) {
        productoId = parseInt(contenedor.dataset.productoId);
      } else if (contenedor.dataset.id) {
        productoId = parseInt(contenedor.dataset.id);
      } else {
        // Intentar obtener el nombre y buscarlo en el catálogo
        const nombreProducto = contenedor.querySelector('h3, h2')?.textContent?.trim();
        if (nombreProducto) {
          const productos = obtenerProductosCatalogo();
          const producto = productos.find(p => p.nombre === nombreProducto);
          if (producto) {
            productoId = producto.id;
          }
        }
      }

      if (!productoId) {
        console.warn('No se pudo determinar el ID del producto');
        return;
      }

      // Buscar el producto en el catálogo
      const productos = obtenerProductosCatalogo();
      const producto = productos.find(p => p.id === productoId);

      if (producto) {
        // Verificar stock
        if (producto.stock <= 0) {
          mostrarNotificacion('Este producto está agotado', 'error');
          return;
        }

        // Verificar si ya tiene el máximo en el carrito
        const itemEnCarrito = carrito.find(item => item.id === productoId);
        if (itemEnCarrito && itemEnCarrito.cantidad >= producto.stock) {
          mostrarNotificacion(`No hay más unidades disponibles de este producto`, 'error');
          return;
        }

        // Convertir precio USD a COP
        const precioCOP = operacionesCarrito.convertirUSDaCOP(producto.precio);

        // Agregar al carrito
        operacionesCarrito.agregarAlCarrito(
          producto.id,
          producto.nombre,
          producto.imagen,
          precioCOP
        );
      }
    }
  }
});

// Event listeners para modal del carrito
document.addEventListener("DOMContentLoaded", () => {
  // La mayoría de esta funcionalidad ya está cubierta por los listeners anteriores
  // Mantenemos esto para compatibilidad con el código existente
  elements.carritoBtnElement.addEventListener('click', () => {
    elements.modalCarritoElement.style.display = 'block';
  });

  const btnCerrarCarrito = document.getElementById("cerrar-modal-carrito");
  const btnCerrarX = elements.modalCarritoElement.querySelector(".cerrar-modal");

  if (btnCerrarCarrito) {
    btnCerrarCarrito.addEventListener("click", () => {
      elements.modalCarritoElement.style.display = "none";
    });
  }
  if (btnCerrarX) {
    btnCerrarX.addEventListener("click", () => {
      elements.modalCarritoElement.style.display = "none";
    });
  }

  // Agregar estilos para advertencias de stock
  agregarEstilosDeStockBajo();

  const carritoPendiente = localStorage.getItem('carritoPendiente');
  if (carritoPendiente) {
    carrito = JSON.parse(carritoPendiente);
    guardarCarritoEnLocalStorage();
    localStorage.removeItem('carritoPendiente');
    mostrarNotificacion('Carrito restaurado. Puedes continuar con tu compra.', 'success');
    operacionesCarrito.renderizarCarrito();
  }
});

// Función para agregar estilos CSS para advertencias de stock
function agregarEstilosDeStockBajo() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .stock-advertencia {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
      font-weight: bold;
    }
    
    .stock-bajo {
      border-left: 3px solid #e74c3c;
      background-color: rgba(231, 76, 60, 0.05);
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  // Añadir estilos solo si no existen ya
  if (!document.querySelector('style[data-stock-styles]')) {
    styleElement.setAttribute('data-stock-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

// Modificar la función finalizarCompra para añadir confirmación previa
function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarNotificacion('Tu carrito está vacío', 'error');
    return;
  }

  // Verificar si el usuario está autenticado
  const token = localStorage.getItem('token');
  const usuarioActual = localStorage.getItem('usuarioActual');

  if (!token || !usuarioActual) {
    // Guardar el estado del carrito en localStorage
    localStorage.setItem('carritoPendiente', JSON.stringify(carrito));
    mostrarNotificacion('Por favor inicia sesión para finalizar la compra', 'info');

    // Redirigir al login después de un breve retraso
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  // Si el usuario está autenticado, proceder con la compra
  mostrarConfirmacionCompra();
}

// Nueva función para mostrar el modal de confirmación de compra
function mostrarConfirmacionCompra(total) {
  const modalConfirmacion = document.createElement('div');
  modalConfirmacion.className = 'modal-confirmacion';

  modalConfirmacion.innerHTML = `
    <div class="confirmacion-compra">
      <h2>Confirmar Compra</h2>
      <p>Estás a punto de finalizar tu compra por un total de ${formatCOP(total)}.</p>
      <p>¿Deseas proceder al pago?</p>
      <div class="botones-confirmacion">
        <button id="cancelar-compra" class="btn-secundario">Cancelar</button>
        <button id="confirmar-compra" class="btn-primario">Sí, finalizar compra</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalConfirmacion);
  agregarEstilosConfirmacion();

  // Event listeners para los botones
  modalConfirmacion.querySelector('#cancelar-compra').addEventListener('click', () =>
    document.body.removeChild(modalConfirmacion));

  modalConfirmacion.querySelector('#confirmar-compra').addEventListener('click', () => {
    document.body.removeChild(modalConfirmacion);
    procesarCompraFinal();
  });
}

// Modificar la función procesarCompraFinal en carrito-modal.js
function procesarCompraFinal() {
  // Generar número de factura y fecha
  const numeroFactura = 'F-' + Date.now().toString().slice(-6);
  const fecha = new Date().toLocaleDateString('es-CO');
  let total = 0;

  // Obtener productos actualizados del catálogo
  const productos = obtenerProductosCatalogo();
  let productosActualizados = [...productos];

  // Array para almacenar los productos que necesitan actualización de stock
  const productosParaActualizar = [];

  // Procesar cada item del carrito
  for (const item of carrito) {
    const index = productosActualizados.findIndex(p => p.id === item.id);

    if (index !== -1) {
      // Guardar el producto para actualizar su stock en la API
      const productoActualizado = { ...productosActualizados[index] };
      productoActualizado.stock -= item.cantidad;

      // Actualizar en el array local
      productosActualizados[index].stock -= item.cantidad;

      // Agregar a la lista de productos para actualizar en la API
      productosParaActualizar.push(productoActualizado);
    }

    const subtotal = item.precio * item.cantidad;
    total += subtotal;
  }

  // NUEVO: Registrar la venta en la base de datos
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
  if (usuarioActual && usuarioActual.id) {
    fetch('http://localhost:3000/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: usuarioActual.id,
        venta_total: total,
        productos: carrito.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio
        }))
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.id_venta) {
        console.log('Venta registrada en la base de datos:', data.id_venta);
      } else {
        mostrarNotificacion('No se pudo registrar la venta en la base de datos', 'error');
      }
    })
    .catch(err => {
      console.error('Error al registrar venta:', err);
      mostrarNotificacion('Error al registrar la venta en la base de datos', 'error');
    });
  }

  // Inicio del HTML de la factura
  let facturaHTML = `
    <div class="factura">
      <div class="factura-header">
        <h2>Factura de Compra</h2>
        <p><strong>N° Factura:</strong> ${numeroFactura}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
      </div>
      <div class="factura-detalles">
        <h3>Productos:</h3>
        <table>
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
          <tbody>
  `;

  // Procesar cada item del carrito
  for (const item of carrito) {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    facturaHTML += `
      <tr>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${formatCOP(item.precio)}</td>
        <td>${formatCOP(subtotal)}</td>
      </tr>
    `;
  }

  // Completar HTML de la factura
  facturaHTML += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right"><strong>Total:</strong></td>
              <td><strong>${formatCOP(total)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="factura-footer">
        <p>¡Gracias por tu compra!</p>
        <button id="cerrar-factura">Cerrar</button>
        <button id="imprimir-factura">Imprimir</button>
      </div>
    </div>
  `;

  // NUEVO: Actualizar el stock en la API para cada producto
  productosParaActualizar.forEach(producto => {
    actualizarStockEnAPI(producto);
  });

  // Crear y mostrar modal de la factura
  const modalFactura = document.createElement('div');
  modalFactura.className = 'modal-factura';
  modalFactura.innerHTML = facturaHTML;
  document.body.appendChild(modalFactura);
  modalFactura.style.display = 'flex';

  // Configurar evento para cerrar factura
  modalFactura.querySelector('#cerrar-factura').addEventListener('click', () => {
    if (document.body.contains(modalFactura)) document.body.removeChild(modalFactura);
  });

  // Configurar evento para imprimir factura
  modalFactura.querySelector('#imprimir-factura').addEventListener('click', () => {
    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>Factura ${numeroFactura}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .factura { max-width: 800px; margin: 0 auto; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              .factura-footer button { display: none; }
            </style>
          </head>
          <body>${modalFactura.innerHTML}</body>
        </html>
      `);
      ventanaImpresion.document.close();
      setTimeout(() => ventanaImpresion.print(), 500);
    }
  });

  // Actualizar el catálogo y localStorage
  if (typeof window.productosDelCatalogo !== 'undefined') window.productosDelCatalogo = productosActualizados;
  else if (typeof window.productos !== 'undefined') window.productos = productosActualizados;

  localStorage.setItem('productos', JSON.stringify(productosActualizados));

  // Limpiar carrito y cerrar modal
  carrito = [];
  guardarCarritoEnLocalStorage();
  actualizarContadorCarrito();

  elements.modalCarritoElement.classList.remove('activo');
  elements.modalCarritoElement.style.display = 'none';

  mostrarNotificacion('¡Compra realizada con éxito!', 'success');
}

// NUEVA FUNCIÓN: Actualizar el stock en la API
function actualizarStockEnAPI(producto) {
  const API_URL = 'http://localhost:3000/api'; // Usar la misma URL que en admin-panel.js

  fetch(`${API_URL}/productos/${producto.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(producto)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al actualizar el stock del producto');
      }
      return response.json();
    })
    .then(data => {
      console.log(`Stock actualizado para producto ${producto.nombre}: ${producto.stock} unidades`);

      // Si la página actual es el panel de administración, actualizar la vista
      if (document.getElementById('productos-tabla') || document.getElementById('stock-tabla')) {
        // Recargar los productos en el panel de administración si estamos en esa página
        if (typeof cargarProductos === 'function') {
          cargarProductos();
        }

        // Actualizar la vista de stock si está visible
        if (document.getElementById('stock').classList.contains('active')) {
          if (typeof cargarTablaStock === 'function') {
            cargarTablaStock();
          }
          if (typeof mostrarAlertasStock === 'function') {
            mostrarAlertasStock();
          }
        }
      }
    })
    .catch(error => {
      console.error('Error al actualizar stock en API:', error);
      mostrarNotificacion('Error al actualizar el inventario, pero la compra se realizó correctamente', 'error');
    });
}
// Funciones para agregar estilos
function agregarEstilosConfirmacion() {
  if (document.querySelector('style[data-confirmacion-styles]')) return;

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-confirmacion-styles', 'true');
  styleElement.textContent = `
    .modal-confirmacion {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, 0.7); display: flex;
      justify-content: center; align-items: center; z-index: 1100;
    }
    .confirmacion-compra {
      background-color: white; border-radius: 8px; padding: 25px;
      max-width: 500px; width: 90%; text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .confirmacion-compra h2 {
      margin-top: 0; color: #333; margin-bottom: 20px;
    }
    .botones-confirmacion {
      display: flex; justify-content: center; gap: 15px; margin-top: 25px;
    }
    .btn-primario {
      background-color: #4CAF50; border: none; color: white;
      padding: 12px 20px; text-align: center; text-decoration: none;
      display: inline-block; font-size: 16px; cursor: pointer;
      border-radius: 4px; font-weight: bold;
    }
    .btn-secundario {
      background-color: #f44336; border: none; color: white;
      padding: 12px 20px; text-align: center; text-decoration: none;
      display: inline-block; font-size: 16px; cursor: pointer; border-radius: 4px;
    }
    .btn-primario:hover { background-color: #45a049; }
    .btn-secundario:hover { background-color: #d32f2f; }
  `;

  document.head.appendChild(styleElement);
}

function agregarEstilosFactura() {
  if (document.querySelector('style[data-factura-styles]')) return;

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-factura-styles', 'true');
  styleElement.textContent = `
    .modal-factura {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, 0.7); display: flex;
      justify-content: center; align-items: center; z-index: 1000;
    }
    .factura {
      background-color: white; border-radius: 8px; padding: 20px;
      max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;
    }
    .factura-header {
      border-bottom: 1px solid #ddd; margin-bottom: 15px; padding-bottom: 15px;
    }
    .factura-header h2 { margin-top: 0; color: #333; }
    .factura table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .factura th, .factura td {
      padding: 8px; text-align: left; border-bottom: 1px solid #ddd;
    }
    .factura th { background-color: #f8f8f8; }
    .factura-footer { margin-top: 20px; text-align: center; }
    .factura-footer button {
      background-color: #4CAF50; border: none; color: white;
      padding: 10px 15px; text-align: center; text-decoration: none;
      display: inline-block; font-size: 14px; margin: 4px 2px;
      cursor: pointer; border-radius: 4px;
    }
    .factura-footer button#cerrar-factura { background-color: #f44336; }
    .notificacion.success { background-color: #4CAF50; color: white; }
  `;

  document.head.appendChild(styleElement);
}

// Inicializar estilos y eventos
document.addEventListener('DOMContentLoaded', () => {
  agregarEstilosConfirmacion();
  agregarEstilosFactura();

  // Modificar el botón proceder-compra
  if (btns.procederCompraBtn) {
    const nuevoBoton = btns.procederCompraBtn.cloneNode(true);
    btns.procederCompraBtn.parentNode.replaceChild(nuevoBoton, btns.procederCompraBtn);
    btns.procederCompraBtn = nuevoBoton;
    btns.procederCompraBtn.addEventListener('click', finalizarCompra);
  }
});


