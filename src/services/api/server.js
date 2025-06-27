// Importamos las dependencias necesarias para el servidor
const express = require("express"); // Framework para crear aplicaciones web y APIs en Node.js
const mysql = require("mysql2"); // Cliente para conectarse y trabajar con bases de datos MySQL
const cors = require("cors"); // Middleware para permitir solicitudes entre distintos dominios (Cross-Origin Resource Sharing)

// Creamos una instancia de Express
const app = express(); // Inicializamos la aplicación de Express

// Configuración de middleware
app.use(express.json()); // Middleware que permite recibir y procesar datos en formato JSON en las peticiones
app.use(cors()); // Habilita CORS para que el servidor pueda recibir peticiones de otros orígenes (como un frontend en otro puerto o dominio)

// Configuración de la conexión a MySQL
const pool = mysql.createPool({ // Creamos un "pool" de conexiones a la base de datos MySQL para manejar múltiples conexiones de forma eficiente
    host: "localhost", // Dirección del servidor de base de datos (en este caso, local)
    user: "root", // Usuario de la base de datos
    password: "root", // Contraseña del usuario
    database: "tienda_online", // Nombre de la base de datos que vamos a usar
    waitForConnections: true, // Si no hay conexiones disponibles, espera en vez de dar error
    connectionLimit: 10, // Número máximo de conexiones simultáneas
    queueLimit: 0 // Número máximo de conexiones en cola (0 significa sin límite)
});

// JWT
const jwt = require('jsonwebtoken'); // Importa el módulo 'jsonwebtoken', que se utiliza para crear y verificar tokens JWT para la autenticación de usuarios

const JWT_SECRET = 'tu_clave_secreta_muy_segura';

// ==== CRUD USUARIOS ====

// Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
    pool.query("SELECT * FROM usuarios", (error, resultados) => {
        if (error) {
            console.error("Error al obtener usuarios:", error);
            return res.status(500).json({ message: "Error al obtener usuarios", error });
        }
        res.json(resultados);
    });
});

// Crear usuario
app.post('/api/usuarios', (req, res) => {
    const { nombre, apellido, email, contrasena, rol = 'Cliente' } = req.body;
    if (!nombre || !apellido || !email || !contrasena) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    const sql = "INSERT INTO usuarios (nombre, apellido, email, contrasena, rol) VALUES (?, ?, ?, ?, ?)";
    pool.query(sql, [nombre, apellido, email, contrasena, rol], (error, resultado) => {
        if (error) {
            console.error("Error al registrar usuario:", error);
            return res.status(500).json({ message: "Error al registrar usuario", error });
        }
        res.json({ message: "Usuario registrado correctamente", id: resultado.insertId });
    });
});

// Actualizar usuario
app.put('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, contrasena, rol } = req.body;
    if (!nombre || !apellido || !email || !contrasena) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const sql = "UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, contrasena = ?, rol = ? WHERE id = ?";
    pool.query(sql, [nombre, apellido, email, contrasena, rol, id], (error, resultado) => {
        if (error) {
            console.error("Error al actualizar usuario:", error);
            return res.status(500).json({ message: "Error al actualizar usuario", error });
        }
        res.json({ message: "Usuario actualizado correctamente" });
    });
});

// Eliminar usuario
app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM usuarios WHERE id = ?";

    pool.query(sql, [id], (error, resultado) => {
        if (error) {
            console.error("Error al eliminar usuario:", error);
            return res.status(500).json({ message: "Error al eliminar usuario", error });
        }
        res.json({ message: "Usuario eliminado correctamente" });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ? AND contrasena = ?";
    pool.query(sql, [email, contrasena], (error, resultados) => {
        if (error) {
            console.error("Error al validar el inicio de sesión:", error);
            return res.status(500).json({ message: "Error al validar el inicio de sesión", error });
        }
        if (resultados.length > 0) {
            const usuario = resultados[0];
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({ 
                message: "Inicio de sesión exitoso",
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    email: usuario.email,
                    rol: usuario.rol
                }
            });
        } else {
            res.status(401).json({ message: "Correo electrónico o contraseña incorrectos" });
        }
    });
});

// Middleware para verificar tokens
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }
    
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.usuario = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado' });
    }
}

// Ruta protegida
app.get('/api/perfil', verificarToken, (req, res) => {
    res.json({ 
        message: 'Datos de perfil', 
        usuario: req.usuario 
    });
});

// Obtener usuario por ID
app.get('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM usuarios WHERE id = ?";
    
    pool.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error("Error al obtener usuario:", error);
            return res.status(500).json({ message: "Error al obtener usuario", error });
        }
        
        if (resultados.length > 0) {
            res.json(resultados[0]);
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    });
});

// ==== CRUD PRODUCTOS ====

// Obtener productos
app.get('/api/productos', (req, res) => {
    pool.query("SELECT * FROM productos", (error, resultados) => {
        if (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ message: "Error al obtener productos", error });
        }
        res.json(resultados);
    });
});

// Crear producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, imagen, descripcion, categoria, stock = 10 } = req.body;
    if (!nombre || !precio || !imagen || !descripcion || !categoria) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const sql = "INSERT INTO productos (nombre, precio, imagen, descripcion, categoria, stock) VALUES (?, ?, ?, ?, ?, ?)";
    pool.query(sql, [nombre, precio, imagen, descripcion, categoria, stock], (error, resultado) => {
        if (error) {
            console.error("Error al crear el producto:", error);
            return res.status(500).json({ message: "Error al crear el producto", error });
        }
        res.json({ message: "Producto registrado correctamente", id: resultado.insertId });
    });
});

// Actualizar producto
app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, imagen, descripcion, categoria, stock } = req.body;

    if (!nombre || !precio || !imagen || !descripcion || !categoria) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const sql = "UPDATE productos SET nombre = ?, precio = ?, imagen = ?, descripcion = ?, categoria = ?, stock = ? WHERE id = ?";
    pool.query(sql, [nombre, precio, imagen, descripcion, categoria, stock, id], (error, resultado) => {
        if (error) {
            console.error("Error al actualizar productos:", error);
            return res.status(500).json({ message: "Error al actualizar productos", error });
        }
        res.json({ message: "Producto actualizado correctamente" });
    });
});

// Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    // Eliminación lógica
    pool.query("UPDATE productos SET activo = 0 WHERE id = ?", [id], (error, resultado) => {
        if (error) {
            return res.status(500).json({ error: "Error al eliminar el producto" });
        }
        res.json({ mensaje: "Producto eliminado (lógicamente)" });
    });
});

// Obtener producto por ID
app.get('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM productos WHERE id = ?";
    
    pool.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error("Error al obtener producto:", error);
            return res.status(500).json({ message: "Error al obtener producto", error });
        }
        
        if (resultados.length > 0) {
            res.json(resultados[0]);
        } else {
            res.status(404).json({ message: "Producto no encontrado" });
        }
    });
});

// Actualizar solo el stock
app.patch('/api/productos/:id/stock', (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (stock === undefined) {
        return res.status(400).json({ message: "El campo stock es obligatorio" });
    }
    
    const sql = "UPDATE productos SET stock = ? WHERE id = ?";
    pool.query(sql, [stock, id], (error, resultado) => {
        if (error) {
            console.error("Error al actualizar el stock:", error);
            return res.status(500).json({ message: "Error al actualizar el stock", error });
        }
        
        if (resultado.affectedRows > 0) {
            res.json({ message: "Stock actualizado correctamente" });
        } else {
            res.status(404).json({ message: "Producto no encontrado" });
        }
    });
});

// ==== CRUD VENTAS ====

// Obtener todas las ventas
app.get('/api/ventas', (req, res) => {
    pool.query("SELECT * FROM ventas", (error, resultados) => {
        if (error) {
            console.error("Error al obtener ventas:", error);
            return res.status(500).json({ message: "Error al obtener ventas", error });
        }
        res.json(resultados);
    });
});

// Registrar una venta
app.post('/api/ventas', (req, res) => {
    const { id_usuario, venta_total, productos } = req.body;
    const fecha_venta = new Date();
    const estado_venta = 'Completada';

    if (!id_usuario || !venta_total || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ message: "Datos de venta incompletos" });
    }

    // Insertar en ventas
    const sqlVenta = "INSERT INTO ventas (id_usuario, fecha_venta, estado_venta, venta_total) VALUES (?, ?, ?, ?)";
    pool.query(sqlVenta, [id_usuario, fecha_venta, estado_venta, venta_total], (error, resultadoVenta) => {
        if (error) {
            console.error("Error al registrar venta:", error);
            return res.status(500).json({ message: "Error al registrar venta", error });
        }
        const id_venta = resultadoVenta.insertId;

        // Obtener datos históricos de los productos
        const ids = productos.map(p => p.id);
        pool.query("SELECT * FROM productos WHERE id IN (?)", [ids], (err, productosDB) => {
            if (err) {
                return res.status(500).json({ message: "Error al obtener productos", error: err });
            }
            // Mapear productos con sus datos históricos
            const productosMap = {};
            productosDB.forEach(p => { productosMap[p.id] = p; });

            const valores = productos.map(p => [
                p.id,
                id_venta,
                p.cantidad,
                p.precio
            ]);
            const sqlDetalle = "INSERT INTO detalle_venta (id_producto, id_venta, cantidad, precio_unitario) VALUES ?";
            pool.query(sqlDetalle, [valores], (errorDetalle) => {
                if (errorDetalle) {
                    console.error("Error al registrar detalle de venta:", errorDetalle);
                    return res.status(500).json({ message: "Error al registrar detalle de venta", error: errorDetalle });
                }
                res.json({ message: "Venta registrada correctamente", id_venta });
            });
        });
    });
});

// Obtener ventas por usuario y rango de fechas
app.get('/api/ventas/filtrar', (req, res) => {
    const { id_usuario, fechaInicio, fechaFin } = req.query;
    let sql = "SELECT * FROM ventas WHERE 1=1";
    const params = [];
    if (id_usuario) {
        sql += " AND id_usuario = ?";
        params.push(id_usuario);
    }
    if (fechaInicio) {
        sql += " AND fecha_venta >= ?";
        params.push(fechaInicio);
    }
    if (fechaFin) {
        sql += " AND fecha_venta <= ?";
        params.push(fechaFin);
    }
    pool.query(sql, params, (error, resultados) => {
        if (error) {
            console.error("Error al filtrar ventas:", error);
            return res.status(500).json({ message: "Error al filtrar ventas", error });
        }
        res.json(resultados);
    });
});

// Productos más vendidos en un periodo
app.get('/api/productos/mas-vendidos', (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    let sql = `
        SELECT 
            dv.id_producto AS id,
            dv.nombre,
            dv.descripcion,
            dv.imagen,
            SUM(dv.cantidad) AS total_vendido,
            SUM(dv.cantidad * dv.precio_unitario) AS total
        FROM detalle_venta dv
        JOIN ventas v ON dv.id_venta = v.id
        WHERE v.estado_venta = 'Completada'
    `;
    const params = [];
    if (fechaInicio) {
        sql += " AND v.fecha_venta >= ?";
        params.push(fechaInicio);
    }
    if (fechaFin) {
        sql += " AND v.fecha_venta <= ?";
        params.push(fechaFin);
    }
    sql += " GROUP BY dv.id_producto, dv.nombre, dv.descripcion, dv.imagen ORDER BY total_vendido DESC";
    pool.query(sql, params, (error, resultados) => {
        if (error) {
            console.error("Error al obtener productos más vendidos:", error);
            return res.status(500).json({ message: "Error al obtener productos más vendidos", error });
        }
        res.json(resultados);
    });
});

// Obtener detalle de venta por ID de venta
app.get('/api/detalle_venta/:id_venta', (req, res) => {
    const { id_venta } = req.params;
    const sql = `
        SELECT dv.*, p.nombre 
        FROM detalle_venta dv
        JOIN productos p ON dv.id_producto = p.id
        WHERE dv.id_venta = ?
    `;
    pool.query(sql, [id_venta], (error, resultados) => {
        if (error) {
            console.error("Error al obtener detalle de venta:", error);
            return res.status(500).json({ message: "Error al obtener detalle de venta", error });
        }
        res.json(resultados);
    });
});

// // Eliminar una venta y sus detalles
// app.delete('/api/ventas/:id', (req, res) => {
//     const { id } = req.params;
//     // Primero elimina los detalles de venta asociados
//     pool.query("DELETE FROM detalle_venta WHERE id_venta = ?", [id], (errorDetalle) => {
//         if (errorDetalle) {
//             console.error("Error al eliminar detalle de venta:", errorDetalle);
//             return res.status(500).json({ message: "Error al eliminar detalle de venta", error: errorDetalle });
//         }
//         // Luego elimina la venta
//         pool.query("DELETE FROM ventas WHERE id = ?", [id], (errorVenta) => {
//             if (errorVenta) {
//                 console.error("Error al eliminar venta:", errorVenta);
//                 return res.status(500).json({ message: "Error al eliminar venta", error: errorVenta });
//             }
//             res.json({ message: "Venta eliminada correctamente" });
//         });
//     });
// });

// INICIAR EL SERVIDOR GENERAL

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
    console.log('Servidor corriendo en el puerto:', puerto);
});