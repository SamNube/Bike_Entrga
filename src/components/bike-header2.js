class BikeHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <nav class="barra-navegacion">
            <div class="primera-fila">
                <a href="index.html"><img src="../img/logocion.png" alt="Bike Store Logo" class="logo"></a>

                <!-- Hamburguesa antes del selector de tema para posicionamiento correcto -->
                <div class="hamburguesa">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>

            <div class="contenedor-busqueda">
                <input type="text" placeholder="¿Qué estás buscando?" class="input-busqueda">
                <button class="boton-busqueda">
                    <i class="fas fa-search"></i>
                </button>
            </div>
            <ul class="enlaces-nav">
                <!-- Elementos para el menú móvil -->
                <li class="elemento-menu-movil"><a href="index.html"><i class="fas fa-home"></i> Inicio</a></li>
                <li class="elemento-menu-movil"><a href="catalogofn.html"><i class="fas fa-bicycle"></i> Catálogo</a></li>
                <li class="elemento-menu-movil"><a href="nosotros.html"><i class="fas fa-users"></i> Nosotros</a></li>
                <!-- Fin de los elementos del menú móvil -->

                <li><a href="login.html" class="btn-sesion inicio-sesion"><i class="fas fa-user"></i> Inicia sesión</a></li>

                <li><a class="carrito"><i class="fas fa-shopping-cart"></i><span class="contador-carrito"
                            id="cartCounter"></span></a></li>
            </ul>
        </nav>

        <!-- Iconos de cabecera inferior -->
        <div class="iconos-cabecera-inferior">
            <a href="index.html"><i class="fas fa-home"></i> Inicio</a>
            <a href="catalogofn.html"><i class="fas fa-bicycle"></i> Catálogo</a>
            <a href="nosotros.html"><i class="fas fa-users"></i> Nosotros</a>
        </div>

    <!-- Carrito -->
<div id="modal-carrito" class="modal">
    <div class="modal-contenido">
        <div class="modal-encabezado">
            <h2><i class="fas fa-shopping-cart"></i> Mi Carrito</h2>
            <span class="cerrar-modal">&times;</span>
        </div>
        <div class="modal-cuerpo">
            <div id="lista-carrito" class="lista-carrito">
                <!-- Aquí se cargarán dinámicamente los productos del carrito -->
            </div>
            <div id="mensaje-carrito-vacio" class="mensaje-vacio">
                <i class="fas fa-shopping-cart"></i>
                <p>No tienes productos en el carrito</p>
                <p>Haz clic en "Añadir al Carrito" de cualquier producto para añadirlo.</p>
            </div>
            <div class="resumen-carrito">
                <div class="total-carrito">
                    <span>Total:</span>
                    <span id="precio-total">0€</span>
                </div>
            </div>
        </div>
        <div class="modal-pie">
            <button id="limpiar-carrito" class="boton-secundario">Vaciar carrito</button>
            <button id="proceder-compra" class="boton-primario">Proceder al pago</button>
            <button id="cerrar-modal-carrito" class="boton-secundario">Seguir comprando</button>
        </div>
    </div>
</div>

        `;

        // Verificar si el usuario está logueado y actualizar el botón
        this.actualizarBotonSesion();
        
        // Configurar evento para mostrar/ocultar el menú de usuario cuando está logueado
        this.configurarMenuUsuario();
    }

    actualizarBotonSesion() {
        const botonSesion = this.querySelector(".btn-sesion");
        if (!botonSesion) return;

        const usuarioGuardado = localStorage.getItem("usuarioActual");

        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            botonSesion.innerHTML = `<i class="fas fa-user"></i> ${usuario.nombre}`;
            botonSesion.href = "perfil.html"; // Opcionalmente redirigir a una página de perfil

            // Agregar menú desplegable para cerrar sesión
            botonSesion.classList.add("usuario-logueado");

            // Crear menú desplegable si no existe
            if (!this.querySelector(".menu-usuario")) {
                const menuUsuario = document.createElement("div");
                menuUsuario.className = "menu-usuario";
                menuUsuario.innerHTML = `
                    <ul>
                        <li><a href="#" class="btn-cerrar-sesion"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a></li>
                    </ul>
                `;

                // Insertarlo después del botón de sesión
                botonSesion.parentNode.appendChild(menuUsuario);

                // Agregar evento para cerrar sesión
                this.querySelector(".btn-cerrar-sesion").addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("usuarioActual");
                    localStorage.removeItem("token");
                    window.location.reload(); // Recargar la página para actualizar el estado
                });
            }
        } else {
            botonSesion.innerHTML = `<i class="fas fa-user"></i> Inicia sesión`;
            botonSesion.href = "login.html";
            botonSesion.classList.remove("usuario-logueado");

            // Eliminar menú desplegable si existe
            const menuUsuario = this.querySelector(".menu-usuario");
            if (menuUsuario) {
                menuUsuario.remove();
            }
        }
    }
    
    configurarMenuUsuario() {
        // Añadir evento click al botón de sesión cuando está logueado
        const botonSesion = this.querySelector(".btn-sesion");
        if (botonSesion) {
            botonSesion.addEventListener("click", (e) => {
                if (botonSesion.classList.contains("usuario-logueado")) {
                    // Solo prevenir navegación si está logueado para mostrar el menú
                    const menuUsuario = this.querySelector(".menu-usuario");
                    if (menuUsuario) {
                        e.preventDefault();
                        menuUsuario.classList.toggle("mostrar");
                    }
                }
            });
            
            // Cerrar el menú al hacer clic fuera
            document.addEventListener("click", (e) => {
                if (!botonSesion.contains(e.target)) {
                    const menuUsuario = this.querySelector(".menu-usuario");
                    if (menuUsuario && menuUsuario.classList.contains("mostrar")) {
                        menuUsuario.classList.remove("mostrar");
                    }
                }
            });
        }
    }
}

// Definir el elemento personalizado
customElements.define("bike-header2", BikeHeader);

// Agregar un evento para comprobar el estado de inicio de sesión cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // El resto del código DOMContentLoaded se mantiene igual
    
    // Variables para controlar el scroll
    let ultimoScroll = 0;
    const barraNavegacion = document.querySelector('.barra-navegacion');
    const iconosCabeceraInferior = document.querySelector('.iconos-cabecera-inferior');

    // Calcular altura total del header para el padding del body
    function ajustarPaddingBody() {
        const alturaHeader = barraNavegacion.offsetHeight +
            (iconosCabeceraInferior ? iconosCabeceraInferior.offsetHeight : 0);
        document.body.style.paddingTop = alturaHeader + 'px';

        // Ajustar la posición de iconos-cabecera-inferior
        if (iconosCabeceraInferior) {
            iconosCabeceraInferior.style.top = barraNavegacion.offsetHeight + 'px';
        }
    }

    // Llamar al ajuste inicial
    setTimeout(ajustarPaddingBody, 100); // Pequeño retraso para asegurar que los elementos estén renderizados

    // Volver a ajustar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', ajustarPaddingBody);

    // Función para controlar la visibilidad del header al hacer scroll
    window.addEventListener('scroll', function () {
        const scrollActual = window.pageYOffset || document.documentElement.scrollTop;

        // Si el scroll es mayor a 200px, aplicamos la lógica de ocultar/mostrar
        if (scrollActual > 200) {
            // Scroll hacia abajo = ocultar header
            if (scrollActual > ultimoScroll) {
                barraNavegacion.classList.add('header-oculto');
                if (iconosCabeceraInferior) {
                    iconosCabeceraInferior.classList.add('header-oculto');
                }
            }
            // Scroll hacia arriba = mostrar header
            else {
                barraNavegacion.classList.remove('header-oculto');
                if (iconosCabeceraInferior) {
                    iconosCabeceraInferior.classList.remove('header-oculto');
                }
            }
        }

        ultimoScroll = scrollActual;
    });
});