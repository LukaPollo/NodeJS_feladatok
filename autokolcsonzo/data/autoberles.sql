-- =====================================================
-- 41. feladat - Autókölcsönző (autó <- bérlés -> ügyfél)
-- Importálás: phpMyAdmin -> Importálás -> ez a fájl
-- Újra importálva visszaáll az eredeti állapot.
-- Az adatok kitaláltak. A kezdet és a vég napja is a bérléshez tartozik.
-- =====================================================

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS `autoberles` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `autoberles`;

DROP TABLE IF EXISTS `berlesek`;
DROP TABLE IF EXISTS `ugyfelek`;
DROP TABLE IF EXISTS `autok`;

CREATE TABLE `autok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rendszam` varchar(10) NOT NULL,
  `marka` varchar(30) NOT NULL,
  `modell` varchar(30) NOT NULL,
  `kategoria` enum('kicsi','közép','egyterű') NOT NULL,
  `napidij` int(11) NOT NULL COMMENT 'Ft / nap',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_autok_rendszam` (`rendszam`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `ugyfelek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `jogositvany_ervenyes` date NOT NULL COMMENT 'eddig a napig érvényes',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `berlesek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `auto_id` int(11) NOT NULL,
  `ugyfel_id` int(11) NOT NULL,
  `kezdet` date NOT NULL,
  `veg` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_berlesek_auto` (`auto_id`),
  KEY `fk_berlesek_ugyfel` (`ugyfel_id`),
  CONSTRAINT `fk_berlesek_auto` FOREIGN KEY (`auto_id`) REFERENCES `autok` (`id`),
  CONSTRAINT `fk_berlesek_ugyfel` FOREIGN KEY (`ugyfel_id`) REFERENCES `ugyfelek` (`id`),
  CONSTRAINT `chk_berlesek_datum` CHECK (`veg` >= `kezdet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

INSERT INTO `autok` (`id`, `rendszam`, `marka`, `modell`, `kategoria`, `napidij`) VALUES
(1, 'AA-AA-101', 'Suzuki', 'Swift', 'kicsi', 9000),
(2, 'AA-AA-102', 'Toyota', 'Yaris', 'kicsi', 9500),
(3, 'AB-CD-201', 'Skoda', 'Octavia', 'közép', 14000),
(4, 'AB-CD-202', 'Volkswagen', 'Golf', 'közép', 13500),
(5, 'AE-EF-301', 'Ford', 'Galaxy', 'egyterű', 21000),
(6, 'AE-EF-302', 'Opel', 'Zafira', 'egyterű', 19500);

INSERT INTO `ugyfelek` (`id`, `nev`, `email`, `jogositvany_ervenyes`) VALUES
(1, 'Kovács Bence', 'bence.kovacs@pelda.hu', '2030-05-01'),
(2, 'Szabó Lilla', 'lilla.szabo@pelda.hu', '2027-03-15'),
(3, 'Tóth Gergely', 'gergely.toth@pelda.hu', '2026-12-10'),
(4, 'Nagy Réka', 'reka.nagy@pelda.hu', '2029-08-20'),
(5, 'Varga Máté', 'mate.varga@pelda.hu', '2031-01-01');

INSERT INTO `berlesek` (`id`, `auto_id`, `ugyfel_id`, `kezdet`, `veg`) VALUES
(1, 1, 1, '2026-09-01', '2026-09-05'),
(2, 3, 2, '2026-09-10', '2026-09-12'),
(3, 5, 4, '2026-09-20', '2026-09-27'),
(4, 1, 3, '2026-10-03', '2026-10-04'),
(5, 4, 1, '2026-10-10', '2026-10-16'),
(6, 3, 4, '2026-10-20', '2026-10-22'),
(7, 2, 2, '2026-11-14', '2026-11-18'),
(8, 5, 1, '2026-11-15', '2026-11-21'),
(9, 3, 3, '2026-11-28', '2026-12-02');
