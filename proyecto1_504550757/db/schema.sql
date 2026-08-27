DROP TABLE IF EXISTS misiones;
DROP TABLE IF EXISTS agencias;
DROP TABLE IF EXISTS cohetes;

CREATE TABLE agencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  pais TEXT NOT NULL,
  anio_fundacion INTEGER NOT NULL,
  sitio_web TEXT,
  imagen_url TEXT
);

CREATE TABLE cohetes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  altura_m REAL NOT NULL,
  masa_despegue_kg REAL NOT NULL,
  imagen_url TEXT
);

CREATE TABLE misiones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  fecha_lanzamiento TEXT NOT NULL,
  destino TEXT NOT NULL,
  estado TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  agencia_id INTEGER NOT NULL REFERENCES agencias(id),
  cohete_id INTEGER NOT NULL REFERENCES cohetes(id)
);

CREATE INDEX idx_misiones_agencia ON misiones(agencia_id);
CREATE INDEX idx_misiones_cohete ON misiones(cohete_id);
