-- Agencias espaciales (entidad secundaria)
INSERT INTO agencias (id, nombre, pais, anio_fundacion, sitio_web, imagen_url) VALUES
  (1, 'NASA', 'Estados Unidos', 1958, 'https://www.nasa.gov', 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg'),
  (2, 'ESA (Agencia Espacial Europea)', 'Francia (sede en París)', 1975, 'https://www.esa.int', 'https://upload.wikimedia.org/wikipedia/commons/b/bd/European_Space_Agency_logo.svg'),
  (3, 'Roscosmos', 'Rusia', 1992, 'https://www.roscosmos.ru', 'https://upload.wikimedia.org/wikipedia/commons/d/da/Roscosmos_logo_ru.svg'),
  (4, 'ISRO', 'India', 1969, 'https://www.isro.gov.in', 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Indian_Space_Research_Organisation_Logo.svg'),
  (5, 'JAXA', 'Japón', 2003, 'https://www.jaxa.jp', 'https://upload.wikimedia.org/wikipedia/commons/8/85/Jaxa_logo.svg'),
  (6, 'SpaceX', 'Estados Unidos', 2002, 'https://www.spacex.com', 'https://upload.wikimedia.org/wikipedia/commons/d/de/SpaceX-Logo.svg'),
  (7, 'CNSA', 'China', 1993, 'http://www.cnsa.gov.cn', 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Insignia_of_CNSA.svg');

-- Cohetes / vehículos de lanzamiento (entidad secundaria)
INSERT INTO cohetes (id, nombre, fabricante, altura_m, masa_despegue_kg, imagen_url) VALUES
  (1, 'Saturn V', 'Boeing / North American Rockwell / Douglas (NASA)', 110.6, 2970000, 'https://upload.wikimedia.org/wikipedia/commons/1/16/Apollo_11_Launch_-_GPN-2000-000630.jpg'),
  (2, 'Falcon 9', 'SpaceX', 70, 549054, 'https://upload.wikimedia.org/wikipedia/commons/0/0e/CRS-9_mission_%2828348649546%29.jpg'),
  (3, 'Falcon Heavy', 'SpaceX', 70, 1420788, 'https://upload.wikimedia.org/wikipedia/commons/5/59/Falcon_Heavy_Demo_Mission_%2840126461851%29.jpg'),
  (4, 'Soyuz (2.1a)', 'RKK Energía / Progress Rocket Space Centre', 46.3, 312000, 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Soyuz_TMA-9_launch.jpg'),
  (5, 'Ariane 5', 'Arianespace / ESA', 52, 777000, 'https://upload.wikimedia.org/wikipedia/commons/d/d2/James_Webb_Space_Telescope_Launch_%28NHQ202112250022%29.jpg'),
  (6, 'Atlas V', 'United Launch Alliance', 58.3, 334500, 'https://upload.wikimedia.org/wikipedia/commons/b/be/Mars_2020_Perseverance_Launch_%28NHQ202007300008%29.jpg'),
  (7, 'Space Launch System (Block 1)', 'Boeing (NASA)', 98.1, 2608000, 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Artemis_I_Launch_%28NHQ202211160017%29.jpg'),
  (8, 'PSLV-XL', 'ISRO', 44.4, 320000, 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Mars_Orbitor_Mission_Launch.jpg'),
  (9, 'Long March 5', 'CASC (CNSA)', 57, 869000, 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Launch_of_Chang%27e_5.png'),
  (10, 'Titan IIIE-Centaur', 'Martin Marietta (NASA)', 48.5, 633000, 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Titan_3E_Centaur_launches_Voyager_2.jpg'),
  (11, 'LVM3 (GSLV Mk III)', 'ISRO', 43.4, 640000, 'https://upload.wikimedia.org/wikipedia/commons/c/c5/LVM3_M4%2C_Chandrayaan-3_-_Launch_vehicle_lifting_off_from_the_Second_Launch_Pad_%28SLP%29_of_SDSC-SHAR%2C_Sriharikota_%28edit%29.jpg'),
  (12, 'H-IIA', 'Mitsubishi Heavy Industries (JAXA)', 53, 289000, 'https://upload.wikimedia.org/wikipedia/commons/8/81/H-IIA_rocket_carrying_GPM_at_Tanegashima_%28201402270013HQ%29.jpg');

-- Misiones espaciales (entidad principal)
INSERT INTO misiones (id, nombre, fecha_lanzamiento, destino, estado, descripcion, imagen_url, agencia_id, cohete_id) VALUES
  (1, 'Apollo 11', '1969-07-16', 'Luna', 'completada', 'Primera misión tripulada en posar seres humanos en la Luna; Armstrong y Aldrin caminaron sobre la superficie lunar mientras Collins orbitaba en el módulo de mando.', 'https://upload.wikimedia.org/wikipedia/commons/1/16/Apollo_11_Launch_-_GPN-2000-000630.jpg', 1, 1),
  (2, 'Apollo 13', '1970-04-11', 'Luna', 'fallida', 'Una explosión en un tanque de oxígeno obligó a abortar el alunizaje; la tripulación regresó a salvo a la Tierra gracias a un rescate improvisado.', 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Apollo_13_liftoff-KSC-70PC-160HR.jpg', 1, 1),
  (3, 'Artemis I', '2022-11-16', 'Luna (órbita)', 'completada', 'Vuelo de prueba no tripulado de la cápsula Orion alrededor de la Luna, primer paso del programa Artemis.', 'https://upload.wikimedia.org/wikipedia/commons/6/66/Orion_Approaches_Moon_for_Outbound_Powered_Flyby.jpg', 1, 7),
  (4, 'Programa Apolo-Soyuz (ASTP)', '1975-07-15', 'Órbita terrestre baja', 'completada', 'Primer acoplamiento en órbita entre una nave estadounidense y una soviética, símbolo de distensión en plena Guerra Fría.', 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Illustration_of_the_Apollo-Soyuz_Test_Project_by_Davis_Meltzer_%289401759%29.jpg', 3, 4),
  (5, 'Soyuz MS-25', '2024-03-23', 'Estación Espacial Internacional', 'completada', 'Misión tripulada rusa de rotación de tripulación hacia la ISS.', 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Expedition_71_Soyuz_Blessing_%28NHQ202403200002%29.jpg', 3, 4),
  (6, 'Crew Dragon Demo-2', '2020-05-30', 'Estación Espacial Internacional', 'completada', 'Primer vuelo orbital tripulado operado por una empresa privada, parte del Programa de Tripulación Comercial de la NASA.', 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Crew_Dragon_Demo2_approaching_ISS.png', 1, 2),
  (7, 'Perseverance (Mars 2020)', '2020-07-30', 'Marte', 'en curso', 'Rover que busca signos de vida microbiana antigua en el cráter Jezero y recolecta muestras para un futuro retorno a la Tierra.', 'https://upload.wikimedia.org/wikipedia/commons/7/71/PIA24261-MarsPerseveranceRover-SHERLOC-CalibrationTarget-20201208.jpg', 1, 6),
  (8, 'Voyager 1', '1977-09-05', 'Espacio interestelar', 'en curso', 'Objeto hecho por el ser humano más lejano de la Tierra; cruzó al espacio interestelar en 2012 y sigue transmitiendo datos.', 'https://upload.wikimedia.org/wikipedia/commons/6/60/Voyager_spacecraft_model.png', 1, 10),
  (9, 'Voyager 2', '1977-08-20', 'Espacio interestelar', 'en curso', 'Única sonda en sobrevolar los cuatro gigantes gaseosos: Júpiter, Saturno, Urano y Neptuno.', 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Titan_3E_Centaur_launches_Voyager_2.jpg', 1, 10),
  (10, 'Chandrayaan-3', '2023-07-14', 'Luna (polo sur)', 'completada', 'India se convirtió en el cuarto país en alunizar de forma controlada y el primero en hacerlo cerca del polo sur lunar.', 'https://upload.wikimedia.org/wikipedia/commons/d/dc/VIKRAM%26PRAGYANMODEL.jpg', 4, 11),
  (11, 'Mangalyaan (Mars Orbiter Mission)', '2013-11-05', 'Marte', 'completada', 'Primera misión asiática en alcanzar la órbita marciana y una de las más económicas jamás realizadas.', 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Mars_Orbiter_Mission_-_India_-_ArtistsConcept.jpg', 4, 8),
  (12, 'Juno', '2011-08-05', 'Júpiter', 'en curso', 'Sonda en órbita polar que estudia la composición, el campo gravitatorio y la magnetosfera de Júpiter.', 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Illustration_of_Juno_spacecraft_at_Jupiter_%28PIA19639%29.jpg', 1, 6),
  (13, 'New Horizons', '2006-01-19', 'Plutón y Cinturón de Kuiper', 'en curso', 'Realizó el primer sobrevuelo cercano de Plutón en 2015 y del objeto Arrokoth en 2019.', 'https://upload.wikimedia.org/wikipedia/commons/a/ad/PIA19703-PlutoFlyby-NewHorizons-ArtistConcept-20150709.jpg', 1, 6),
  (14, 'Rosetta', '2004-03-02', 'Cometa 67P/Churyumov-Gerasimenko', 'completada', 'Primera misión en orbitar un núcleo cometario y posar un módulo (Philae) sobre su superficie.', 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Rosetta_and_Philae_at_comet_%2811206660686%29.jpg', 2, 5),
  (15, 'Chang''e 5', '2020-11-23', 'Luna', 'completada', 'Misión china de retorno de muestras lunares, la primera desde 1976.', 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Launch_of_Chang%27e_5.png', 7, 9),
  (16, 'Falcon Heavy Demo Flight', '2018-02-06', 'Órbita heliocéntrica', 'completada', 'Vuelo de prueba inaugural del Falcon Heavy; lanzó un Tesla Roadster como carga simbólica.', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Elon_Musk%27s_Tesla_Roadster_%2840110304192%29.jpg', 6, 3),
  (17, 'Hayabusa2', '2014-12-03', 'Asteroide Ryugu', 'completada', 'Recolectó muestras del asteroide Ryugu y las devolvió a la Tierra en una cápsula en 2020.', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Hayabusa2_dropping_off_sample_return_capsule.jpg', 5, 12);
