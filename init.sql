-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS libros_db;

-- Creación del usuario con todos los privilegios
CREATE USER IF NOT EXISTS 'apalm'@'%' IDENTIFIED BY 'Appsweb2022+';
GRANT ALL PRIVILEGES ON libros_db.* TO 'apalm'@'%';
FLUSH PRIVILEGES;

-- Creación de la tabla
USE libros_db;
CREATE TABLE IF NOT EXISTS libros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  rating INT NOT NULL,
  genero VARCHAR(100) NOT NULL
);