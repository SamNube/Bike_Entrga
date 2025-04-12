// catalogfin.js - Script para integrar los productos del admin panel con el catálogo

// Variables globales
let productosDelCatalogo = [];
let swiperInstances = []; // Para mantener referencia a las instancias de Swiper

document.addEventListener('DOMContentLoaded', function () {
    // Cargar todos los productos desde la API
    cargarProductosDelCatalogo();

    // Configurar el modal para más información
    configurarBotondeInformacion();

    // Verificar si hay cambios en los productos cada 30 segundos
    setInterval(verificarActualizaciones, 30000);
});

// Función para cargar productos desde la API
function cargarProductosDelCatalogo() {
    const API_URL = 'http://localhost:3000/api';

    fetch(`${API_URL}/productos`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar productos para el catálogo');
            }
            return response.json();
        })
        .then(data => {
            productosDelCatalogo = data;
            console.log('Productos cargados:', productosDelCatalogo);

            // Organizar productos por categoría
            const goldenProducts = productosDelCatalogo.filter(p => p.categoria === 'golden');
            const silverProducts = productosDelCatalogo.filter(p => p.categoria === 'silver');

            // Actualizar el catálogo existente si hay productos
            actualizarSliders(goldenProducts, silverProducts);
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
        });
}

// Verifica si hay actualizaciones en los productos
function verificarActualizaciones() {
    const API_URL = 'http://localhost:3000/api';
    
    fetch(`${API_URL}/productos`)
        .then(response => response.json())
        .then(newData => {
            // Verificar si hay cambios comparando con los datos actuales
            if (JSON.stringify(newData) !== JSON.stringify(productosDelCatalogo)) {
                console.log('Se detectaron cambios en los productos');
                productosDelCatalogo = newData;
                
                // Reorganizar productos por categoría
                const goldenProducts = productosDelCatalogo.filter(p => p.categoria === 'golden');
                const silverProducts = productosDelCatalogo.filter(p => p.categoria === 'silver');
                
                // Actualizar sliders
                actualizarSliders(goldenProducts, silverProducts);
            }
        })
        .catch(error => {
            console.error('Error al verificar actualizaciones:', error);
        });
}

// Función para actualizar los sliders con los productos de la base de datos
function actualizarSliders(goldenProducts, silverProducts) {
    try {
        // Destruir las instancias existentes de Swiper
        destruirSwipers();

        // Obtener los contenedores de slides
        const slidersWrapper = document.querySelectorAll('.swiper-wrapper');
        if (slidersWrapper.length < 2) {
            console.error('No se encontraron los contenedores de slides');
            return;
        }

        // Golden Collection (primer swiper)
        const goldenWrapper = slidersWrapper[0];

        // Solo reemplazar si hay productos en la base de datos para esta categoría
        if (goldenProducts && goldenProducts.length > 0) {
            goldenWrapper.innerHTML = ''; // Limpiar el contenedor

            // Agregar los nuevos productos
            goldenProducts.forEach(producto => {
                const slide = crearSlide(producto, 'golden');
                goldenWrapper.appendChild(slide);
            });
        }

        // Silver Collection (segundo swiper)
        if (slidersWrapper.length > 1) {
            const silverWrapper = slidersWrapper[1];

            // Solo reemplazar si hay productos en la base de datos para esta categoría
            if (silverProducts && silverProducts.length > 0) {
                silverWrapper.innerHTML = ''; // Limpiar el contenedor

                // Agregar los nuevos productos
                silverProducts.forEach(producto => {
                    const slide = crearSlide(producto, 'silver');
                    silverWrapper.appendChild(slide);
                });
            }
        }

        // Reiniciar Swiper para que funcione con los nuevos elementos
        inicializarSwipers();
    } catch (error) {
        console.error('Error al actualizar los sliders:', error);
    }
}

// Función para destruir todas las instancias de Swiper
function destruirSwipers() {
    // Buscar todas las instancias de Swiper
    const swiperElements = document.querySelectorAll('.swiper');
    
    // Destruir cada instancia si existe
    swiperElements.forEach(swiperElement => {
        if (swiperElement.swiper) {
            swiperElement.swiper.destroy(true, true);
        }
    });
    
    // Limpiar el array de instancias
    swiperInstances = [];
}

// Función para inicializar todas las instancias de Swiper
function inicializarSwipers() {
    if (typeof Swiper !== 'undefined') {
        const swiperElements = document.querySelectorAll('.mySwiper');
        
        swiperElements.forEach(swiperElement => {
            const swiper = new Swiper(swiperElement, {
                effect: "coverflow",
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: "auto",
                loop: true,
                coverflowEffect: {
                    depth: 500,
                    modifier: 1,
                    slideShadows: true,
                    rotate: 0,
                    stretch: 0
                }
            });
            
            // Guardar la instancia para poder destruirla después
            swiperInstances.push(swiper);
        });
    } else {
        console.error('Swiper no está definido. Asegúrate de incluir la biblioteca.');
    }
}

// Función para crear un nuevo slide para un producto
function crearSlide(producto, coleccion) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    slide.innerHTML = `
        <div class="icons">
            <img src="../img/logocion.png" alt="">
        </div>
        <div class="product-content">
            <div class="product-txt">
                <h3>${producto.nombre}</h3>
                <br>
                <p>${producto.descripcion}</p>
            </div>

            <div class="product-img">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
        </div>
        <a href="#" class="btn-1" data-producto-id="${producto.id}">Mas informacion</a>
    `;

    return slide;
}

// Configurar los botones de "Más información" para abrir el modal
function configurarBotondeInformacion() {
    // Quitar cualquier event listener anterior para evitar duplicados
    document.removeEventListener('click', manejarClicInformacion);
    
    // Agregar el nuevo event listener con delegación
    document.addEventListener('click', manejarClicInformacion);
}

// Función para manejar los clics en botones de más información
function manejarClicInformacion(event) {
    // Verificar si el clic fue en un botón o dentro de un botón
    const target = event.target;
    let boton = null;
    
    if (target.classList.contains('btn-1')) {
        boton = target;
    } else if (target.parentElement && target.parentElement.classList.contains('btn-1')) {
        boton = target.parentElement;
    }
    
    // Si encontramos un botón de información
    if (boton) {
        event.preventDefault();
        const productoId = parseInt(boton.getAttribute('data-producto-id'));
        
        if (!isNaN(productoId)) {
            mostrarModalProducto(productoId);
        } else {
            console.error('ID de producto inválido');
        }
    }
}

// Modal para mostrar detalles del producto
function mostrarModalProducto(productoId) {
    // Buscar el producto por ID
    const producto = productosDelCatalogo.find(p => p.id === productoId);

    if (!producto) {
        console.error('Producto no encontrado');
        return;
    }

    // Eliminar cualquier modal existente para evitar duplicados
    const existingModal = document.querySelector('.producto-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }

    // Crear el modal
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

    // Contenido del modal
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
        animation: fadeIn 0.3s ease;
    `;

    // Agregar botón de cerrar
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
    closeButton.onclick = function () {
        document.body.removeChild(modal);
    };

    // Crear contenido del producto
    const productoContent = document.createElement('div');
    productoContent.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    `;

    // Imagen del producto
    const productoImagen = document.createElement('div');
    productoImagen.style.cssText = `
        flex: 1;
        min-width: 300px;
    `;
    productoImagen.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; border-radius: 8px;">
    `;

    // Información del producto
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
        <p style="margin-bottom: 15px;">Precio estimado: $ ${producto.precio} </p>
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
    // Ensamblar el modal
    productoContent.appendChild(productoImagen);
    productoContent.appendChild(productoInfo);
    modalContent.appendChild(closeButton);
    modalContent.appendChild(productoContent);
    modal.appendChild(modalContent);

    // Agregar el modal al DOM
    document.body.appendChild(modal);

    // Agregar event listener para cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // Agregar animación CSS para el modal
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    
    // Solo agregar el estilo si no existe ya
    if (!document.querySelector('style[data-modal-animation]')) {
        styleElement.setAttribute('data-modal-animation', 'true');
        document.head.appendChild(styleElement);
    }
}

// Función para exportar para uso desde admin-panel.js
window.actualizarCatalogo = function() {
    cargarProductosDelCatalogo();
};