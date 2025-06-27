// Archivo: search.js - Versión corregida para evitar conflictos

(function() {
    // Encapsulamos todo el código en una función autoejecutable para evitar conflictos

    document.addEventListener('DOMContentLoaded', function () {
        // Esperar a que se cargue el componente header
        setTimeout(configurarBarraBusqueda, 500);
        
        // Si el usuario cambia de página, configurar de nuevo
        window.addEventListener('load', configurarBarraBusqueda);
    });

    function configurarBarraBusqueda() {
        const inputBusqueda = document.querySelector('.input-busqueda');
        const botonBusqueda = document.querySelector('.boton-busqueda');
        
        if (!inputBusqueda || !botonBusqueda) {
            console.error('No se encontraron los elementos de búsqueda');
            return;
        }
        
        // Manejar la búsqueda cuando se hace clic en el botón
        botonBusqueda.addEventListener('click', function() {
            realizarBusqueda(inputBusqueda.value);
        });
        
        // Manejar la búsqueda cuando se presiona Enter
        inputBusqueda.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                realizarBusqueda(inputBusqueda.value);
            }
        });
    }

    function realizarBusqueda(termino) {
        // Validar que hay un término de búsqueda
        if (!termino || termino.trim() === '') {
            mostrarNotificacionBusqueda('Por favor ingresa un término de búsqueda');
            return;
        }
        
        termino = termino.trim().toLowerCase();
        console.log('Buscando:', termino);
        
        // Verificar si tenemos productos cargados
        if (!window.productosDelCatalogo || window.productosDelCatalogo.length === 0) {
            // Si no tenemos productos localmente, intentar cargarlos
            cargarProductosYBuscar(termino);
            return;
        }
        
        // Realizar la búsqueda en los productos ya cargados
        const resultados = window.productosDelCatalogo.filter(producto => 
            producto.nombre.toLowerCase().includes(termino) || 
            producto.descripcion.toLowerCase().includes(termino) ||
            producto.categoria.toLowerCase().includes(termino)
        );
        
        mostrarResultadosBusqueda(resultados, termino);
    }

    function cargarProductosYBuscar(termino) {
        // URL de la API
        const API_URL = 'http://localhost:3000/api';
        
        // Mostrar loader
        mostrarNotificacionBusqueda('Cargando productos...');
        
        // Cargar los productos desde la API
        fetch(`${API_URL}/productos`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar productos');
                }
                return response.json();
            })
            .then(data => {
                // Guardar los productos en variable global
                window.productosDelCatalogo = data;
                
                // Ahora realizar la búsqueda
                const resultados = window.productosDelCatalogo.filter(producto => 
                    producto.nombre.toLowerCase().includes(termino) || 
                    producto.descripcion.toLowerCase().includes(termino) ||
                    producto.categoria.toLowerCase().includes(termino)
                );
                
                mostrarResultadosBusqueda(resultados, termino);
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                mostrarNotificacionBusqueda('Error al cargar productos. Intenta de nuevo más tarde.');
            });
    }

    function mostrarResultadosBusqueda(resultados, termino) {
        // Eliminar cualquier modal de resultados existente
        const modalExistente = document.getElementById('modal-resultados-busqueda');
        if (modalExistente) {
            document.body.removeChild(modalExistente);
        }
        
        // Crear modal para mostrar resultados
        const modal = document.createElement('div');
        modal.id = 'modal-resultados-busqueda';
        modal.className = 'modal-busqueda';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        // Contenido del modal
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 900px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: fadeIn 0.3s ease;
        `;
        
        // Botón para cerrar
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #323232;
        `;
        closeButton.onclick = function() {
            document.body.removeChild(modal);
        };
        
        // Título del modal
        const titulo = document.createElement('h3');
        titulo.style.cssText = `
            color: #D4AF37;
            margin-bottom: 20px;
            border-bottom: 2px solid #D4AF37;
            padding-bottom: 10px;
        `;
        
        if (resultados.length > 0) {
            titulo.textContent = `Resultados para "${termino}" (${resultados.length} productos)`;
        } else {
            titulo.textContent = `No se encontraron resultados para "${termino}"`;
        }
        
        // Contenedor de resultados
        const contenedorResultados = document.createElement('div');
        contenedorResultados.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
        `;
        
        // Mostrar cada resultado
        if (resultados.length > 0) {
            resultados.forEach(producto => {
                const tarjeta = document.createElement('div');
                tarjeta.style.cssText = `
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: transform 0.2s;
                    cursor: pointer;
                `;
                tarjeta.onmouseover = function() {
                    this.style.transform = 'scale(1.03)';
                    this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                };
                tarjeta.onmouseout = function() {
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = 'none';
                };
                tarjeta.onclick = function() {
                    // Verificar si la función mostrarModalProducto existe en el scope global
                    if (typeof window.mostrarModalProducto === 'function') {
                        window.mostrarModalProducto(producto.id);
                    } else if (typeof mostrarModalProducto === 'function') {
                        mostrarModalProducto(producto.id);
                    } else {
                        // Como fallback, crear nuestra propia implementación básica
                        mostrarDetallesProducto(producto);
                    }
                };
                
                // Contenido de la tarjeta
                tarjeta.innerHTML = `
                    <div style="height: 150px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #f9f9f9;">
                        <img src="${producto.imagen}" alt="${producto.nombre}" style="max-width: 100%; max-height: auto;">
                    </div>
                    <div style="padding: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">${producto.nombre}</h4>
                        <p style="margin: 0; color: #D4AF37; font-weight: bold;">$${producto.precio}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #777;">
                            ${producto.categoria === 'golden' ? 'Golden Collection' : 'Silver Collection'}
                        </p>
                    </div>
                `;
                
                contenedorResultados.appendChild(tarjeta);
            });
        } else {
            // Mensaje si no hay resultados
            const mensaje = document.createElement('div');
            mensaje.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 30px;
                color: #777;
            `;
            mensaje.innerHTML = `
                <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <p>No se encontraron productos que coincidan con tu búsqueda.</p>
                <p>Prueba con otros términos o navega por nuestras colecciones.</p>
            `;
            contenedorResultados.appendChild(mensaje);
        }
        
        // Ensamblar el modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(titulo);
        modalContent.appendChild(contenedorResultados);
        modal.appendChild(modalContent);
        
        // Agregar el modal al DOM
        document.body.appendChild(modal);
        
        // Agregar event listener para cerrar al hacer clic fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Implementación de fallback por si la función original no está disponible
    function mostrarDetallesProducto(producto) {
        const modal = document.createElement('div');
        modal.className = 'producto-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        `;

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #323232;
        `;
        closeButton.onclick = function() {
            document.body.removeChild(modal);
        };

        const productoContent = document.createElement('div');
        productoContent.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        `;

        const productoImagen = document.createElement('div');
        productoImagen.style.cssText = `
            flex: 1;
            min-width: 300px;
        `;
        productoImagen.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; border-radius: 8px;">
        `;

        const productoInfo = document.createElement('div');
        productoInfo.style.cssText = `
            flex: 1;
            min-width: 300px;
        `;
        productoInfo.innerHTML = `
            <h2 style="color: #D4AF37; margin-bottom: 15px;">${producto.nombre}</h2>
            <div class="producto-categoria" style="margin-bottom: 10px; font-size: 14px; color: #777;">
                Categoría: ${producto.categoria === 'golden' ? 'Golden Collection' : 'Silver Collection'}
            </div>
            <div class="producto-descripcion" style="margin-bottom: 25px; line-height: 1.6; color: black;">
                ${producto.descripcion}
            </div>
            <div class="producto-contacto">
                <p style="margin-bottom: 15px;">Precio: $ ${producto.precio} </p>
                <p style="margin-bottom: 15px; ${producto.stock <= 5 ? 'color: #e74c3c;' : 'color: #2ecc71;'}">
                    ${producto.stock > 0 
                    ? `Stock disponible: ${producto.stock} unidades${producto.stock <= 5 ? ' (¡Últimas unidades!)' : ''}` 
                    : '<span style="color: #e74c3c; font-weight: bold;">Agotado</span>'}
                </p>
                <button style="
                display: inline-block;
                background-color: ${producto.stock > 0 ? '#D4AF37' : '#cccccc'};
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 4px;
                border: none;
                cursor: ${producto.stock > 0 ? 'pointer' : 'not-allowed'};
                font-size: 16px;"
                ${producto.stock <= 0 ? 'disabled' : ''}>
                <i class="fa fa-shopping-cart"></i> ${producto.stock > 0 ? 'Añadir al carrito' : 'Agotado'}
                </button>
            </div>
        `;

        productoContent.appendChild(productoImagen);
        productoContent.appendChild(productoInfo);
        modalContent.appendChild(closeButton);
        modalContent.appendChild(productoContent);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Cambié el nombre de la función para evitar conflictos
    function mostrarNotificacionBusqueda(mensaje) {
        // Verificar si ya existe una notificación
        let notificacion = document.querySelector('.notificacion-busqueda');
        
        if (!notificacion) {
            notificacion = document.createElement('div');
            notificacion.className = 'notificacion-busqueda';
            notificacion.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background-color: #333;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                z-index: 1100;
                animation: slideInNotif 0.3s ease;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(notificacion);
        }
        
        // Actualizar el mensaje
        notificacion.textContent = mensaje;
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.style.animation = 'slideOutNotif 0.3s ease';
                setTimeout(() => {
                    if (notificacion.parentNode) {
                        document.body.removeChild(notificacion);
                    }
                }, 300);
            }
        }, 3000);
    }

    // Agregar animaciones CSS con nombres únicos para evitar conflictos
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInNotif {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideOutNotif {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(50px); }
        }
        
        .modal-busqueda {
            backdrop-filter: blur(3px);
        }
    `;

    // Solo agregar el estilo si no existe ya (con un ID único)
    if (!document.querySelector('style[data-search-animation-unique]')) {
        styleElement.setAttribute('data-search-animation-unique', 'true');
        document.head.appendChild(styleElement);
    }

    // Exponer la función para que pueda ser utilizada por otros scripts
    window.buscarProductos = realizarBusqueda;
})(); // Función autoejecutable para encapsular el código