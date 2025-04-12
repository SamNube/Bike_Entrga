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

    const sql = "UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, contrasena = ?, rol = ? WHERE id_usuario = ?";
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
    const sql = "DELETE FROM usuarios WHERE id_usuario = ?";

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
                    id: usuario.id_usuario, 
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
                    id: usuario.id_usuario,
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
    const sql = "SELECT * FROM usuarios WHERE id_usuario = ?";
    
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
    const sql = "DELETE FROM productos WHERE id = ?";

    pool.query(sql, [id], (error, resultado) => {
        if (error) {
            console.error("Error al eliminar producto:", error);
            return res.status(500).json({ message: "Error al eliminar producto", error });
        }
        res.json({ message: "Producto eliminado correctamente" });
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

// ==== VENTAS Y DETALLES DE VENTA ====

// Registrar nueva venta con sus detalles
app.post('/api/ventas', verificarToken, (req, res) => {
    const { items, total } = req.body;
    const id_usuario = req.usuario.id;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "El carrito está vacío o no tiene un formato válido" });
    }
    
    // Iniciar transacción
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error al conectar a la base de datos:", err);
            return res.status(500).json({ message: "Error al conectar a la base de datos", error: err });
        }
        
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error("Error al iniciar transacción:", err);
                return res.status(500).json({ message: "Error al procesar la venta", error: err });
            }
            
            // Fecha actual
            const fecha_actual = new Date().toISOString().split('T')[0];
            
            // Insertar en tabla ventas
            const sqlVenta = "INSERT INTO ventas (id_usuario, fecha_venta, estado_venta, venta_total) VALUES (?, ?, ?, ?)";
            connection.query(sqlVenta, [id_usuario, fecha_actual, 'Completada', total], (error, resultadoVenta) => {
                if (error) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error("Error al registrar la venta:", error);
                        res.status(500).json({ message: "Error al registrar la venta", error });
                    });
                }
                
                const id_venta = resultadoVenta.insertId;
                const detallesVenta = [];
                
                // Preparar los detalles de venta
                items.forEach(item => {
                    detallesVenta.push([
                        item.id,
                        id_venta,
                        item.cantidad,
                        item.precio
                    ]);
                });
                
                // Insertar en tabla detalle_venta
                const sqlDetalle = "INSERT INTO detalle_venta (id_producto, id_venta, cantidad, precio_unitario) VALUES ?";
                connection.query(sqlDetalle, [detallesVenta], (error, resultadoDetalle) => {
                    if (error) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error("Error al registrar los detalles de la venta:", error);
                            res.status(500).json({ message: "Error al registrar los detalles de la venta", error });
                        });
                    }
                    
                    // Actualizar stock de productos
                    const actualizacionesStock = items.map(item => {
                        return new Promise((resolve, reject) => {
                            const sqlStock = "UPDATE productos SET stock = stock - ? WHERE id = ?";
                            connection.query(sqlStock, [item.cantidad, item.id], (error, resultado) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(resultado);
                                }
                            });
                        });
                    });
                    
                    Promise.all(actualizacionesStock)
                        .then(() => {
                            // Confirmar transacción
                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error("Error al confirmar la transacción:", err);
                                        res.status(500).json({ message: "Error al confirmar la venta", error: err });
                                    });
                                }
                                
                                connection.release();
                                res.json({ 
                                    message: "Venta registrada correctamente", 
                                    id_venta, 
                                    fecha: fecha_actual 
                                });
                            });
                        })
                        .catch(error => {
                            return connection.rollback(() => {
                                connection.release();
                                console.error("Error al actualizar el stock:", error);
                                res.status(500).json({ message: "Error al actualizar el stock de productos", error });
                            });
                        });
                });
            });
        });
    });
});

// Obtener todas las ventas
app.get('/api/ventas', verificarToken, (req, res) => {
    // Si el usuario es administrador, obtiene todas las ventas
    // Si es cliente, solo obtiene sus propias ventas
    const id_usuario = req.usuario.id;
    const rol = req.usuario.rol;
    
    let sql;
    let params = [];
    
    if (rol === 'Administrador') {
        sql = `
            SELECT v.*, u.nombre, u.apellido 
            FROM ventas v 
            JOIN usuarios u ON v.id_usuario = u.id_usuario 
            ORDER BY v.fecha_venta DESC
        `;
    } else {
        sql = `
            SELECT v.*, u.nombre, u.apellido 
            FROM ventas v 
            JOIN usuarios u ON v.id_usuario = u.id_usuario 
            WHERE v.id_usuario = ? 
            ORDER BY v.fecha_venta DESC
        `;
        params = [id_usuario];
    }
    
    pool.query(sql, params, (error, resultados) => {
        if (error) {
            console.error("Error al obtener ventas:", error);
            return res.status(500).json({ message: "Error al obtener ventas", error });
        }
        res.json(resultados);
    });
});

// Obtener detalles de una venta específica
app.get('/api/ventas/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id;
    const rol = req.usuario.rol;
    
    // Comprobar si el usuario tiene acceso a esta venta
    const sqlVerificar = `
        SELECT id FROM ventas 
        WHERE id = ? ${rol !== 'Administrador' ? 'AND id_usuario = ?' : ''}
    `;
    
    const paramsVerificar = rol !== 'Administrador' ? [id, id_usuario] : [id];
    
    pool.query(sqlVerificar, paramsVerificar, (error, resultadosVerificar) => {
        if (error) {
            console.error("Error al verificar acceso a la venta:", error);
            return res.status(500).json({ message: "Error al verificar acceso a la venta", error });
        }
        
        if (resultadosVerificar.length === 0) {
            return res.status(403).json({ message: "No tienes permiso para ver esta venta" });
        }
        
        // Obtener detalles de la venta
        const sql = `
            SELECT v.*, u.nombre, u.apellido,
                   dv.id as detalle_id, dv.cantidad, dv.precio_unitario,
                   p.nombre as producto_nombre, p.imagen as producto_imagen
            FROM ventas v
            JOIN usuarios u ON v.id_usuario = u.id_usuario
            JOIN detalle_venta dv ON v.id = dv.id_venta
            JOIN productos p ON dv.id_producto = p.id
            WHERE v.id = ?
        `;
        
        pool.query(sql, [id], (error, resultados) => {
            if (error) {
                console.error("Error al obtener detalles de la venta:", error);
                return res.status(500).json({ message: "Error al obtener detalles de la venta", error });
            }
            
            if (resultados.length === 0) {
                return res.status(404).json({ message: "Venta no encontrada" });
            }
            
            // Formatear los resultados
            const venta = {
                id: resultados[0].id,
                id_usuario: resultados[0].id_usuario,
                nombre_cliente: `${resultados[0].nombre} ${resultados[0].apellido}`,
                fecha_venta: resultados[0].fecha_venta,
                estado_venta: resultados[0].estado_venta,
                venta_total: resultados[0].venta_total,
                detalles: resultados.map(item => ({
                    detalle_id: item.detalle_id,
                    producto_id: item.id_producto,
                    producto_nombre: item.producto_nombre,
                    producto_imagen: item.producto_imagen,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    subtotal: item.cantidad * item.precio_unitario
                }))
            };
            
            res.json(venta);
        });
    });
});

// Actualizar estado de la venta (solo para administradores)
app.patch('/api/ventas/:id/estado', verificarToken, (req, res) => {
    const { id } = req.params;
    const { estado_venta } = req.body;
    const rol = req.usuario.rol;
    
    if (rol !== 'Administrador') {
        return res.status(403).json({ message: "Solo los administradores pueden cambiar el estado de las ventas" });
    }
    
    if (!estado_venta) {
        return res.status(400).json({ message: "El estado de la venta es obligatorio" });
    }
    
    const sql = "UPDATE ventas SET estado_venta = ? WHERE id = ?";
    pool.query(sql, [estado_venta, id], (error, resultado) => {
        if (error) {
            console.error("Error al actualizar el estado de la venta:", error);
            return res.status(500).json({ message: "Error al actualizar el estado de la venta", error });
        }
        
        if (resultado.affectedRows > 0) {
            res.json({ message: "Estado de venta actualizado correctamente" });
        } else {
            res.status(404).json({ message: "Venta no encontrada" });
        }
    });
});

// INICIAR EL SERVIDOR GENERAL

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
    console.log('Servidor corriendo en el puerto:', puerto);
});