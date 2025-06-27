CREATE DATABASE tienda_online;
USE tienda_online;
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    email VARCHAR(100) unique,
    contrasena VARCHAR(100),
    rol ENUM('Administrador', 'Cliente') DEFAULT 'Cliente'
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    imagen VARCHAR(500),
    precio DECIMAL(10,2),
    categoria VARCHAR(100),
    descripcion TEXT,
    stock int default 10
);

CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha_venta DATE,
    estado_venta VARCHAR(50),
    venta_total DECIMAL(10,2),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE detalle_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT,
    id_venta INT,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    FOREIGN KEY (id_producto) REFERENCES productos(id),
    FOREIGN KEY (id_venta) REFERENCES ventas(id)
);

INSERT INTO usuarios (nombre, apellido, email, contrasena, rol) VALUES
('Sam', 'R', 'sam@bike.com', '12345678', 'Administrador'),
('maicol', 'D', 'maic@bike.com', '12345678', 'Administrador'),
('Tony', 'Stark', 'tony@Stark.com', 'IronMan123', 'Cliente');


INSERT INTO ventas (id_usuario, fecha_venta, estado_venta, venta_total) 
VALUES 
(1, '2023-05-15', 'Completada', 1250.75),
(2, '2023-05-16', 'Pendiente', 899.99),
(3, '2023-05-17', 'Cancelada', 450.50),
(1, '2023-05-18', 'Completada', 3200.00),
(4, '2023-05-19', 'En proceso', 175.25);

show tables ;
show databases ;
select * from usuarios;
select * from productos;
select * from ventas;
select * from detalle_venta;

ALTER TABLE detalle_venta DROP FOREIGN KEY detalle_venta_ibfk_2;
ALTER TABLE detalle_venta ADD CONSTRAINT detalle_venta_ibfk_2 FOREIGN KEY (id_venta) REFERENCES ventas(id) ON DELETE CASCADE;
ALTER TABLE productos ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE productos drop COLUMN caracteristicas ;
ALTER TABLE productos ADD COLUMN caracteristicas TEXT;
ALTER TABLE productos MODIFY imagen VARCHAR(255);

DROP DATABASE tienda_online;
DROP table ventas;
DROP table detalle_venta;
DROP table usuarios;
DROP table productos;

INSERT INTO ventas (id_usuario, fecha_venta, estado_venta, venta_total)
VALUES (1, '2025-04-12', 'Completada', 1500.00);


 INSERT INTO productos (nombre, imagen, precio, categoria, descripcion) VALUES
('Bicicleta en fibra de carbono con aleación de oro', 'https://d2yn9m4p3q9iyv.cloudfront.net/colnago/2023/c68-disc-gioiello-dura-ace-di2-9200-bike/thumbs/1000/665ac.webp', 15000.00, 'Oro Collection', 'Diseñada para quienes buscan lo extraordinario, esta bicicleta es una obra maestra tecnológica y artística. Su estructura ultraligera de fibra de carbono de alta resistencia garantiza un rendimiento excepcional, mientras que los detalles en aleación de oro 18k añaden un toque de sofisticación.'),
('24K GOLDEN PHOENIX MTB', 'https://goldgenie.com/wp-content/uploads/2024/11/24K-Gold-Mens-Racing-Bike.webp', 25000.00, 'Oro Collection', 'Esta no es una bicicleta, es una escultura rodante diseñada para redefinir el lujo extremo. Cada centímetro de su estructura y componentes está elaborado en oro de 24 quilates, trabajado con técnicas de joyería de alta precisión para combinar belleza y resistencia.'),
('TREK MADONE AUREUS VAULT 7', 'https://noticiclismo.com/wp-content/uploads/2020/05/Trek-Madone-7-Diamond-1.jpg', 18000.00, 'Oro Collection', 'Diseñada para ser un símbolo de estatus y arte móvil, esta bicicleta no solo rompe récords de rendimiento, sino también de opulencia. Cada componente ha sido reimaginado con materiales preciosos y detalles que desafían la imaginación.'),
('AURUMANIA ÉCLAT D\OR ROYALE', 'https://150954136.v2.pressablecdn.com/wp-content/uploads/2019/09/LuxuryToys-Malle-Bicyclette-Gold-Bike-Edition-Article02.jpg', 30000.00, 'Oro Collection', 'Una obra de arte donde el barroco francés se fusiona con la innovación moderna. Creada para quienes ven la movilidad como una declaración de poder y refinamiento, esta bicicleta no solo brilla, sino que narra una historia de artesanía europea y opulencia audaz.'),
('MONTANTE AUREO SPLENDORE', 'https://noticiclismo.com/wp-content/uploads/2020/05/Montante-Luxury-Gold-Collection-1.jpg', 22000.00, 'Oro Collection', 'Esta bicicleta no es un medio de transporte, es un objeto de culto diseñado para coleccionistas que buscan la perfección estética y la artesanía irrepetible. Cada componente fusiona lo clásico y lo vanguardista, con materiales que desafían la imaginación.'),
('Chrome Hearts Velociraptor XTR', 'https://noticiclismo.com/wp-content/uploads/2020/05/Chrome-Hearts-X-Cervelo-Mountain-Bike-1.jpg', 20000.00, 'Oro Collection', 'Esta bicicleta no es solo un híbrido, es una declaración de guerra contra lo convencional. Diseñada para coleccionistas que exigen lujo agresivo, combina el ADN custom de Harley Davidson, el streetwear oscuro de Chrome Hearts.'),
('FX PHANTOM CARBON NEXUS', 'https://media.trekbikes.com/image/upload/f_auto,fl_progressive:semi,q_auto,w_1920,h_1440,c_pad/FXSport6Carbon_22_35787_A_Primary', 12000.00, 'Silver Collection', 'Diseñada para ciclistas que no negocian con la excelencia, esta bicicleta es una extensión de tu ambición. Más que un equipo de ejercicio, es un laboratorio de biomecánica sobre ruedas, optimizado para romper límites personales y convertir cada pedalada en un paso hacia la grandeza.'),
('CHISEL XC RAZOR PRO', 'https://assets.specialized.com/i/specialized/91722-50_CHISEL-HT-COMP-LTSIL-SPCTFLR_HERO?$scom-pdp-gallery-image$&fmt=webp', 9500.00, 'Silver Collection', 'Diseñada para corredores de XC que exigen ligereza sin comprometer la resistencia, esta bicicleta hardtail redefine lo que significa ser una máquina de carreras todoterreno.'),
('TURBO HYPERION QUANTUM X', 'https://assets.specialized.com/i/specialized/95223-10_LEVO-PRO-CARBON-RSTDRED-REDWD_HERO-SQUARE?$scom-plp-product-image-square$&fmt=webp', 14000.00, 'Silver Collection', 'Diseñada para conquistar lo inalcanzable, esta bicicleta eléctrica es la evolución definitiva del Levo. Combina inteligencia artificial, materiales de ciencia ficción y un diseño que desafía los límites entre máquina y naturaleza.'),
('STR AETHER FLUX PRO', 'https://assets.specialized.com/i/specialized/96223-00_DIVERGE-STR-SW-FSTGRN-DKMOS-BLKPRL_HERO-SQUARE?$scom-plp-product-image-square$&fmt=webp', 11000.00, 'Silver Collection', 'Diseñada para exploradores que desafían las fronteras entre carretera y gravel, esta máquina no se limita a absorber impactos: los convierte en energía.'),
('STR HYPERFLUX TITAN PRO', 'https://assets.specialized.com/i/specialized/97224-10_AETHOS-PRO-UDI2-REDSKY-REDONYX_HERO-SQUARE?$scom-plp-product-image-square$&fmt=webp', 12500.00, 'Silver Collection', 'Diseñada para redefinir los límites entre velocidad y control, esta bicicleta convierte caminos rotos en autopistas y senderos técnicos en pistas de despegue.'),
('BCRUX VORTEX APEX PRO', 'https://assets.specialized.com/i/specialized/91423-10_CRUX-PRO-DPLAKEMET-GRNPRL_HERO-SQUARE?$scom-plp-product-image-square$&fmt=webp', 11500.00, 'Silver Collection', 'Diseñada para conquistar senderos, caminos y aventuras donde otras gravels se detienen. Esta máquina redefine la agilidad y el control.');