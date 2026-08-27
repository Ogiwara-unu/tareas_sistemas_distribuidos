-- Agencias espaciales (entidad secundaria)
INSERT INTO agencias (id, nombre, pais, anio_fundacion, sitio_web, imagen_url) VALUES
  (1, 'NASA', 'Estados Unidos', 1958, 'https://www.nasa.gov', 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg'),
  (2, 'ESA (Agencia Espacial Europea)', 'Francia (sede en París)', 1975, 'https://www.esa.int', 'https://upload.wikimedia.org/wikipedia/commons/b/bd/European_Space_Agency_logo.svg'),
  (3, 'Roscosmos', 'Rusia', 1992, 'https://www.roscosmos.ru', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Roscosmos'),
  (4, 'ISRO', 'India', 1969, 'https://www.isro.gov.in', 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Indian_Space_Research_Organisation_Logo.svg'),
  (5, 'JAXA', 'Japón', 2003, 'https://www.jaxa.jp', 'https://placehold.co/640x400/0b1220/8ab4ff?text=JAXA'),
  (6, 'SpaceX', 'Estados Unidos', 2002, 'https://www.spacex.com', 'https://upload.wikimedia.org/wikipedia/commons/d/de/SpaceX-Logo.svg'),
  (7, 'CNSA', 'China', 1993, 'http://www.cnsa.gov.cn', 'https://placehold.co/640x400/0b1220/8ab4ff?text=CNSA');

-- Cohetes / vehículos de lanzamiento (entidad secundaria)
INSERT INTO cohetes (id, nombre, fabricante, altura_m, masa_despegue_kg, imagen_url) VALUES
  (1, 'Saturn V', 'Boeing / North American Rockwell / Douglas (NASA)', 110.6, 2970000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=Saturn+V'),
  (2, 'Falcon 9', 'SpaceX', 70, 549054, 'https://placehold.co/640x400/0b1220/8ab4ff?text=Falcon+9'),
  (3, 'Falcon Heavy', 'SpaceX', 70, 1420788, 'https://placehold.co/640x400/0b1220/8ab4ff?text=Falcon+Heavy'),
  (4, 'Soyuz (2.1a)', 'RKK Energía / Progress Rocket Space Centre', 46.3, 312000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=Soyuz'),
  (5, 'Ariane 5', 'Arianespace / ESA', 52, 777000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=Ariane+5'),
  (6, 'Atlas V', 'United Launch Alliance', 58.3, 334500, 'https://placehold.co/640x400/0b1220/8ab4ff?text=Atlas+V'),
  (7, 'Space Launch System (Block 1)', 'Boeing (NASA)', 98.1, 2608000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=SLS'),
  (8, 'PSLV-XL', 'ISRO', 44.4, 320000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=PSLV'),
  (9, 'Long March 5', 'CASC (CNSA)', 57, 869000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=Long+March+5'),
  (10, 'Titan IIIE-Centaur', 'Martin Marietta (NASA)', 48.5, 633000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=Titan+IIIE'),
  (11, 'LVM3 (GSLV Mk III)', 'ISRO', 43.4, 640000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=LVM3'),
  (12, 'H-IIA', 'Mitsubishi Heavy Industries (JAXA)', 53, 289000, 'https://placehold.co/640x400/0b1220/8ab4ff?text=H-IIA');

-- Misiones espaciales (entidad principal)
INSERT INTO misiones (id, nombre, fecha_lanzamiento, destino, estado, descripcion, imagen_url, agencia_id, cohete_id) VALUES
  (1, 'Apollo 11', '1969-07-16', 'Luna', 'completada', 'Primera misión tripulada en posar seres humanos en la Luna; Armstrong y Aldrin caminaron sobre la superficie lunar mientras Collins orbitaba en el módulo de mando.', 'https://upload.wikimedia.org/wikipedia/commons/1/16/Apollo_11_Launch_-_GPN-2000-000630.jpg', 1, 1),
  (2, 'Apollo 13', '1970-04-11', 'Luna', 'fallida', 'Una explosión en un tanque de oxígeno obligó a abortar el alunizaje; la tripulación regresó a salvo a la Tierra gracias a un rescate improvisado.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Apollo+13', 1, 1),
  (3, 'Artemis I', '2022-11-16', 'Luna (órbita)', 'completada', 'Vuelo de prueba no tripulado de la cápsula Orion alrededor de la Luna, primer paso del programa Artemis.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Artemis+I', 1, 7),
  (4, 'Programa Apolo-Soyuz (ASTP)', '1975-07-15', 'Órbita terrestre baja', 'completada', 'Primer acoplamiento en órbita entre una nave estadounidense y una soviética, símbolo de distensión en plena Guerra Fría.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Apollo-Soyuz', 3, 4),
  (5, 'Soyuz MS-25', '2024-03-23', 'Estación Espacial Internacional', 'completada', 'Misión tripulada rusa de rotación de tripulación hacia la ISS.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Soyuz+MS-25', 3, 4),
  (6, 'Crew Dragon Demo-2', '2020-05-30', 'Estación Espacial Internacional', 'completada', 'Primer vuelo orbital tripulado operado por una empresa privada, parte del Programa de Tripulación Comercial de la NASA.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Crew+Dragon', 1, 2),
  (7, 'Perseverance (Mars 2020)', '2020-07-30', 'Marte', 'en curso', 'Rover que busca signos de vida microbiana antigua en el cráter Jezero y recolecta muestras para un futuro retorno a la Tierra.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Perseverance', 1, 6),
  (8, 'Voyager 1', '1977-09-05', 'Espacio interestelar', 'en curso', 'Objeto hecho por el ser humano más lejano de la Tierra; cruzó al espacio interestelar en 2012 y sigue transmitiendo datos.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Voyager+1', 1, 10),
  (9, 'Voyager 2', '1977-08-20', 'Espacio interestelar', 'en curso', 'Única sonda en sobrevolar los cuatro gigantes gaseosos: Júpiter, Saturno, Urano y Neptuno.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Voyager+2', 1, 10),
  (10, 'Chandrayaan-3', '2023-07-14', 'Luna (polo sur)', 'completada', 'India se convirtió en el cuarto país en alunizar de forma controlada y el primero en hacerlo cerca del polo sur lunar.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Chandrayaan-3', 4, 11),
  (11, 'Mangalyaan (Mars Orbiter Mission)', '2013-11-05', 'Marte', 'completada', 'Primera misión asiática en alcanzar la órbita marciana y una de las más económicas jamás realizadas.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Mangalyaan', 4, 8),
  (12, 'Juno', '2011-08-05', 'Júpiter', 'en curso', 'Sonda en órbita polar que estudia la composición, el campo gravitatorio y la magnetosfera de Júpiter.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Juno', 1, 6),
  (13, 'New Horizons', '2006-01-19', 'Plutón y Cinturón de Kuiper', 'en curso', 'Realizó el primer sobrevuelo cercano de Plutón en 2015 y del objeto Arrokoth en 2019.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=New+Horizons', 1, 6),
  (14, 'Rosetta', '2004-03-02', 'Cometa 67P/Churyumov-Gerasimenko', 'completada', 'Primera misión en orbitar un núcleo cometario y posar un módulo (Philae) sobre su superficie.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Rosetta', 2, 5),
  (15, 'Chang''e 5', '2020-11-23', 'Luna', 'completada', 'Misión china de retorno de muestras lunares, la primera desde 1976.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Chang-e+5', 7, 9),
  (16, 'Falcon Heavy Demo Flight', '2018-02-06', 'Órbita heliocéntrica', 'completada', 'Vuelo de prueba inaugural del Falcon Heavy; lanzó un Tesla Roadster como carga simbólica.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Falcon+Heavy+Demo', 6, 3),
  (17, 'Hayabusa2', '2014-12-03', 'Asteroide Ryugu', 'completada', 'Recolectó muestras del asteroide Ryugu y las devolvió a la Tierra en una cápsula en 2020.', 'https://placehold.co/640x400/0b1220/8ab4ff?text=Hayabusa2', 5, 12);
