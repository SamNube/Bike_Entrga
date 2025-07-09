// Variables globales
const API_URL = 'http://localhost:3000/api';
let usuarios = [];
let usuarioActual = null;

// Verificar si el usuario es superusuario al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual || usuarioActual.rol !== 'SuperUsuario') {
        alert('Acceso denegado. Solo los superusuarios pueden acceder a esta página.');
        window.location.href = 'login.html';
        return;
    }
    cargarUsuarios();
    document.getElementById('usuarioForm').addEventListener('submit', guardarUsuario);
});

// Mostrar sección (solo hay una, pero se deja por si se amplía)
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(function (section) {
        section.classList.remove('active');
    });
    document.querySelectorAll('.sidebar-menu li').forEach(function (item) {
        item.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Cargar administradores desde la API
function cargarUsuarios() {
    fetch(`${API_URL}/usuarios`)
        .then(response => response.json())
        .then(data => {
            usuarios = data.filter(u => u.rol === 'Administrador');
            renderizarUsuarios();
        })
        .catch(error => {
            showNotification('Error al cargar administradores: ' + error.message, 'error');
        });
}

// Renderizar administradores en la tabla
function renderizarUsuarios() {
    const tabla = document.getElementById('usuarios-tabla');
    tabla.innerHTML = '';
    if (usuarios.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay administradores registrados</td></tr>';
        return;
    }
    usuarios.forEach(usuario => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.apellido}</td>
            <td>${usuario.email}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editarUsuario(${usuario.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="confirmarEliminarUsuario(${usuario.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

// Mostrar modal para crear/editar administrador
function showUserModal(usuario = null) {
    const modal = document.getElementById('usuarioModal');
    const modalTitle = document.getElementById('modalUserTitle');
    const form = document.getElementById('usuarioForm');
    form.reset();
    document.getElementById('usuarioId').value = '';
    if (usuario) {
        modalTitle.textContent = 'Editar Administrador';
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('nombreUsuario').value = usuario.nombre;
        document.getElementById('apellidoUsuario').value = usuario.apellido;
        document.getElementById('emailUsuario').value = usuario.email;
        document.getElementById('contrasenaUsuario').value = usuario.contrasena;
    } else {
        modalTitle.textContent = 'Nuevo Administrador';
    }
    modal.style.display = 'block';
}

// Cerrar modal de usuario
function closeUserModal() {
    document.getElementById('usuarioModal').style.display = 'none';
}

// Guardar administrador (crear o actualizar)
function guardarUsuario(event) {
    event.preventDefault();
    const usuarioId = document.getElementById('usuarioId').value;
    const nombre = document.getElementById('nombreUsuario').value;
    const apellido = document.getElementById('apellidoUsuario').value;
    const email = document.getElementById('emailUsuario').value;
    const contrasena = document.getElementById('contrasenaUsuario').value;
    const usuario = { nombre, apellido, email, contrasena, rol: 'Administrador' };
    const url = usuarioId ? `${API_URL}/usuarios/${usuarioId}` : `${API_URL}/usuarios`;
    const method = usuarioId ? 'PUT' : 'POST';
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    })
    .then(async response => {
        if (!response.ok) {
            const data = await response.json();
            if (response.status === 409) {
                throw new Error('El email ya existe. Por favor, usa otro.');
            }
            throw new Error(data.message || 'Error al guardar el administrador');
        }
        return response.json();
    })
    .then(data => {
        closeUserModal();
        cargarUsuarios();
        showNotification(usuarioId ? 'Administrador actualizado correctamente' : 'Administrador creado correctamente', 'success');
    })
    .catch(error => {
        showNotification(error.message, 'error');
    });
}

// Editar administrador
function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
        showUserModal(usuario);
    } else {
        showNotification('Administrador no encontrado', 'error');
    }
}

// Confirmar eliminación de administrador
function confirmarEliminarUsuario(id) {
    if (confirm('¿Está seguro de que desea eliminar este administrador?')) {
        eliminarUsuario(id);
    }
}

// Eliminar administrador
function eliminarUsuario(id) {
    fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Error al eliminar el administrador');
            return response.json();
        })
        .then(data => {
            cargarUsuarios();
            showNotification('Administrador eliminado correctamente', 'success');
        })
        .catch(error => {
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

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    window.location.href = 'login.html';
}