-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: pfe_bdd
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('super_admin','admin','enseignant','etudiant','entreprise') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expire` datetime DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users` (Password for all: password123)
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO users (id, first_name, last_name, email, password, role, is_active, created_at, created_by, phone) VALUES
(1, 'Ahmed', 'Benali', 'ahmed.benali@esi-sba.dz', '$2b$10$SfrNWHL1u8sIyN8JCvVQe.60Ud8L7cOy.W3vOJ5Fg4g2QgdwXy5pa', 'super_admin', 1, '2026-01-01 08:00:00', 1, '055000001'),
(2, 'Fatima', 'Zohra', 'fatima.zohra@esi-sba.dz', '$2b$10$5.yxvRQfUWEB0RZQOjnhJe2.wQGc865LpjMpafQHppAp24rzKp5je', 'admin', 1, '2026-01-01 08:00:00', 1, '055000002'),
(3, 'Mohamed', 'Bouzid', 'mohamed.bouzid@esi-sba.dz', '$2b$10$ozHoblfMnSp7D0u3.hUG7.YhQJbgqekyDQH.G5Sf/kN0wHwyue79K', 'admin', 1, '2026-01-01 08:00:00', 1, '055000003'),
(4, 'Karim', 'Haddad', 'karim.haddad@esi-sba.dz', '$2b$10$I7qaXwPF1/wUsX.z9x7ZB.ngRmS97j1b2G5d96MKzlKEXIFxrQ9dG', 'enseignant', 1, '2026-01-01 08:00:00', 1, '055000004'),
(5, 'Nadia', 'Khelifi', 'nadia.khelifi@esi-sba.dz', '$2b$10$4ZXSCKjniTdsPLdahPURh.CebEZagVWX5zKFTX9/GYaVHpbUv4xiW', 'enseignant', 1, '2026-01-01 08:00:00', 1, '055000005'),
(6, 'Sofiane', 'Mansouri', 'sofiane.mansouri@esi-sba.dz', '$2b$10$noqflKe2s24fCtGTcoquB.TEIh7xII9PV4KlH9E6fyZ2TY3WT63Qu', 'enseignant', 1, '2026-01-01 08:00:00', 1, '055000006'),
(7, 'Leila', 'Bouaziz', 'leila.bouaziz@esi-sba.dz', '$2b$10$9aWU43v4HtMPfgpgfwnJwuLO0Fk6T7H9i5s9hgogIZEQCkVjCq/QW', 'enseignant', 1, '2026-01-01 08:00:00', 1, '055000007'),
(8, 'Omar', 'Chebbi', 'omar.chebbi@esi-sba.dz', '$2b$10$0lFDf3ZoasUl3DwymPQK0uEUDseZT4arCGdOXfqij/30ofg2Y4ASq', 'enseignant', 1, '2026-01-01 08:00:00', 1, '055000008'),
(9, 'Samira', 'Guezmir', 'samira.guezmir@esi-sba.dz', '$2b$10$kt/BJFVJeXub7NJqyuJLSOtHbgsX/CaStJZovRy55aexNDdb3yYRC', 'entreprise', 1, '2026-01-01 08:00:00', 1, '055000009'),
(10, 'Walid', 'Touati', 'walid.touati@esi-sba.dz', '$2b$10$BJIWxfObcqtrIoy99RHuAuJ3N5Poaac6rzXZ1YbaDgPip43kj7una', 'entreprise', 1, '2026-01-01 08:00:00', 1, '0550000010'),
(11, 'Amina', 'Bensalem', 'amina.bensalem@esi-sba.dz', '$2b$10$Gxt.69ELt3Kz5lNQJak3wudy27Y0x0DEE3YODDDryCY49c9/hW.Yy', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000011'),
(12, 'Bilal', 'Mokhtari', 'bilal.mokhtari@esi-sba.dz', '$2b$10$CLwaSPpx1sImPL78lIDqmOzrL6Gn26pQs0UfjEsSohHPfCMb3ZihG', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000012'),
(13, 'Chaima', 'Hadjadj', 'chaima.hadjadj@esi-sba.dz', '$2b$10$XCErB8mkpQ7mwiHnvsZ9UO2UyAT8vuv0aVQ9Y1wZoKhmJkCbJ6kUe', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000013'),
(14, 'Djamel', 'Benmoussa', 'djamel.benmoussa@esi-sba.dz', '$2b$10$B4XDd5TsIoz1hB9pF3pPqOCZ/EqPXjW4AYrKX31ZO3NzCAUobWumm', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000014'),
(15, 'Ines', 'Kherbouche', 'ines.kherbouche@esi-sba.dz', '$2b$10$/RyeRFXmbTuG2U1meMKYreDeoZ9OowZAI4L32/psUeRs5eHFBOiZC', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000015'),
(16, 'Khaled', 'Saidani', 'khaled.saidani@esi-sba.dz', '$2b$10$eGChinsGo2F3xfj.S.OuFub0GED262SOXaR5YIqz89NnhVMeKLDbW', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000016'),
(17, 'Lydia', 'Boudiaf', 'lydia.boudiaf@esi-sba.dz', '$2b$10$W4Mt.D0pIdtIs.xZPGo3oO4uicj4Qr36KqpejhwgHu8oZgGqq6koa', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000017'),
(18, 'Mehdi', 'Zerrouki', 'mehdi.zerrouki@esi-sba.dz', '$2b$10$2BGhJiigOtqG3JQXDb0bKuWYRdA4mbg8a/1qH/jJlHDYVhryBkx4S', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000018'),
(19, 'Nour', 'Ait', 'nour.ait@esi-sba.dz', '$2b$10$nXq/bnDcK2ko5uOwOf17HeDYDePtdO7ynWMQv1GuwROQwUfupWaD2', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000019'),
(20, 'Oussama', 'Bellil', 'oussama.bellil@esi-sba.dz', '$2b$10$C9QZyncI7V85Ipt0AL.Yc.4inukK1rw8rBdGdnZWOyjX9STCJhwoG', 'etudiant', 1, '2026-01-01 08:00:00', 1, '0550000020');

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;


-- ===================================================================
-- 
-- +----+---------------------------+----------------+-------------------+
-- | ID | Email                     | Password       | Rôle             |
-- +----+---------------------------+----------------+-------------------+
-- | 1  | ahmed.benali@esi-sba.dz   | ahmed123       | super_admin       |
-- | 2  | fatima.zohra@esi-sba.dz   | fatima123      | admin             |
-- | 3  | mohamed.bouzid@esi-sba.dz | mohamed123     | admin             |
-- | 4  | karim.haddad@esi-sba.dz   | karim123       | enseignant        |
-- | 5  | nadia.khelifi@esi-sba.dz  | nadia123       | enseignant        |
-- | 6  | sofiane.mansouri@esi-sba.dz| sofiane123    | enseignant        |
-- | 7  | leila.bouaziz@esi-sba.dz  | leila123       | enseignant        |
-- | 8  | omar.chebbi@esi-sba.dz    | omar123        | enseignant        |
-- | 9  | samira.guezmir@esi-sba.dz | samira123      | entreprise        |
-- | 10 | walid.touati@esi-sba.dz   | walid123       | entreprise        |
-- | 11 | amina.bensalem@esi-sba.dz | amina123       | etudiant          |
-- | 12 | bilal.mokhtari@esi-sba.dz | bilal123       | etudiant          |
-- | 13 | chaima.hadjadj@esi-sba.dz | chaima123      | etudiant          |
-- | 14 | djamel.benmoussa@esi-sba.dz| djamel123     | etudiant          |
-- | 15 | ines.kherbouche@esi-sba.dz| ines123        | etudiant          |
-- | 16 | khaled.saidani@esi-sba.dz | khaled123      | etudiant          |
-- | 17 | lydia.boudiaf@esi-sba.dz  | lydia123       | etudiant          |
-- | 18 | mehdi.zerrouki@esi-sba.dz | mehdi123       | etudiant          |
-- | 19 | nour.ait@esi-sba.dz       | nour123        | etudiant          |
-- | 20 | oussama.bellil@esi-sba.dz | oussama123     | etudiant          |
-- +----+---------------------------+----------------+-------------------+
-- 
-- ===================================================================
--
-- Table structure for table `super_admin`
--

DROP TABLE IF EXISTS `super_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `super_admin` (
  `id` int NOT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `super_admin_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `super_admin`
--

LOCK TABLES `super_admin` WRITE;
/*!40000 ALTER TABLE `super_admin` DISABLE KEYS */;
INSERT INTO `super_admin` VALUES 
(1, 'Ahmed Benali', '{"can_view_all": true, "can_create_admin": true, "can_delete_users": true, "can_update_users": true, "can_create_etudiant": true, "can_create_enseignant": true, "can_create_entreprise": true, "can_assign_permissions": true}');
/*!40000 ALTER TABLE `super_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `administrator`
--

DROP TABLE IF EXISTS `administrator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrator` (
  `id` int NOT NULL,
  `permissions` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `administrator_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `administrator`
--

LOCK TABLES `administrator` WRITE;
/*!40000 ALTER TABLE `administrator` DISABLE KEYS */;
INSERT INTO `administrator` VALUES 
(2, '{"can_create_enseignant": true, "can_create_etudiant": true, "can_manage_projects": true}'),
(3, '{"can_create_etudiant": true, "can_view_all": true, "can_manage_teams": true}');
/*!40000 ALTER TABLE `administrator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher` (
  `id` int NOT NULL,
  `grade` varchar(100) DEFAULT NULL,
  `rank` enum('Professeur','Maître_de_conférences_A','Maître_de_conférences_B','Maître_Assistant_A','Maître_Assistant_B') DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `teacher_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES 
(4, 'Artificial Intelligence', 'Professeur'),
(5, 'Cybersecurity', 'Maître_de_conférences_A'),
(6, 'Web Development', 'Maître_de_conférences_B'),
(7, 'Software Engineering', 'Maître_Assistant_A'),
(8, 'Data Science', 'Maître_de_conférences_B');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `external_supervisor`
--

DROP TABLE IF EXISTS `external_supervisor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `external_supervisor` (
  `id` int NOT NULL,
  `organization` varchar(150) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `external_supervisor_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `external_supervisor`
--

LOCK TABLES `external_supervisor` WRITE;
/*!40000 ALTER TABLE `external_supervisor` DISABLE KEYS */;
INSERT INTO `external_supervisor` VALUES 
(9, 'Microsoft Algeria', 'Technical Manager', '0555000009', 'Cloud Solutions'),
(10, 'Google Algiers', 'Head of Engineering', '0555000010', 'Software Development');
/*!40000 ALTER TABLE `external_supervisor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `speciality`
--

DROP TABLE IF EXISTS `speciality`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `speciality` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `speciality`
--

LOCK TABLES `speciality` WRITE;
/*!40000 ALTER TABLE `speciality` DISABLE KEYS */;
INSERT INTO `speciality` VALUES 
(1, 'Informatique', 'INFO', 'Sciences de linformatique fondamentale'),
(2, 'Genie Logiciel', 'GL', 'Developpement et conception de logiciels'),
(3, 'Intelligence Artificielle', 'IA', 'Machine Learning et Data Science'),
(4, 'Reseaux et Telecommunications', 'RT', 'Infrastructure reseaux'),
(5, 'Systemes Embarques', 'SE', 'IoT et systemes temps reel'),
(6, 'Cybersecurite', 'CS', 'Securite informatique'),
(7, 'Cloud Computing', 'CC', 'Solutions cloud');

/*!40000 ALTER TABLE `speciality` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo`
--

DROP TABLE IF EXISTS `promo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `promo`
--

LOCK TABLES `promo` WRITE;
/*!40000 ALTER TABLE `promo` DISABLE KEYS */;
INSERT INTO `promo` VALUES 
(1, 'Promo 2023', 2023, '2022-09-01', '2023-06-30'),
(2, 'Promo 2024', 2024, '2023-09-01', '2024-06-30'),
(3, 'Promo 2025', 2025, '2024-09-01', '2025-06-30'),
(4, 'Promo 2026', 2026, '2025-09-01', '2026-06-30');
/*!40000 ALTER TABLE `promo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `id` int NOT NULL,
  `moyenne` decimal(4,2) DEFAULT NULL,
  `status` enum('ACTIVE','GRADUATED') DEFAULT NULL,
  `graduation_date` date DEFAULT NULL,
  `speciality_id` int DEFAULT NULL,
  `promo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `speciality_id` (`speciality_id`),
  KEY `promo_id` (`promo_id`),
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`),
  CONSTRAINT `student_ibfk_2` FOREIGN KEY (`speciality_id`) REFERENCES `speciality` (`id`),
  CONSTRAINT `student_ibfk_3` FOREIGN KEY (`promo_id`) REFERENCES `promo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES 
(11, 15.50, 'ACTIVE', NULL, 2, 4),
(12, 14.75, 'ACTIVE', NULL, 3, 4),
(13, 16.00, 'ACTIVE', NULL, 1, 4),
(14, 13.80, 'ACTIVE', NULL, 4, 4),
(15, 17.20, 'ACTIVE', NULL, 2, 4),
(16, 14.50, 'ACTIVE', NULL, 3, 4),
(17, 15.00, 'ACTIVE', NULL, 1, 4),
(18, 16.50, 'ACTIVE', NULL, 5, 4),
(19, 14.00, 'ACTIVE', NULL, 4, 4),
(20, 15.75, 'ACTIVE', NULL, 3, 4);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `max_students` int DEFAULT NULL,
  `status` enum('PENDING','VALIDATED','REJECTED','ASSIGNED','COMPLETED') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `teacher_id` int DEFAULT NULL,
  `external_supervisor_id` int DEFAULT NULL,
  `approval_comment` text,
  `rejection_reason` text,
  `speciality_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `external_supervisor_id` (`external_supervisor_id`),
  KEY `speciality_id` (`speciality_id`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`),
  CONSTRAINT `project_ibfk_2` FOREIGN KEY (`external_supervisor_id`) REFERENCES `external_supervisor` (`id`),
  CONSTRAINT `project_ibfk_3` FOREIGN KEY (`speciality_id`) REFERENCES `speciality` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES 
(1, 'AI-Powered Student Assistant', 'Developper un assistant intelligent pour aider les etudiants dans leur parcours academique', 4, 'VALIDATED', '2026-02-01 10:00:00', 4, NULL, 'Projet innovant', NULL, 3),
(2, 'Plateforme E-learning Interactive', 'Creation dune plateforme dpprentissage en ligne avec des fonctionnalites avancees', 3, 'VALIDATED', '2026-02-05 10:00:00', 5, NULL, 'Bien structure', NULL, 2),
(3, 'Application Mobile de Gestion de Projet', 'App mobile pour la gestion de projets PFE', 4, 'PENDING', '2026-02-10 10:00:00', 6, NULL, NULL, NULL, 2),
(4, 'Systeme de Reconnaissance Faciale', 'Systeme base sur lIA pour la reconnaissance faciale', 3, 'VALIDATED', '2026-02-15 10:00:00', 7, NULL, 'Technologie prometteuse', NULL, 3),
(5, 'loud Storage Solution', 'Solution de stockage cloud securisee', 5, 'PENDING', '2026-02-20 10:00:00', 8, NULL, NULL, NULL, 7),
(6, 'IoT Smart Home System', 'Systeme domotique base sur lIoT', 4, 'VALIDATED', '2026-02-25 10:00:00', 4, NULL, 'Application pratique', NULL, 5),
(7, 'Cyber Security Audit Tool', 'Outil daudit de securite pour entreprises', 3, 'REJECTED', '2026-03-01 10:00:00', 5, NULL, NULL, 'Projet trop ambitieux', 6),
(8, 'Big Data Analytics Platform', 'Platform d analyse de donnees massives', 4, 'VALIDATED', '2026-03-05 10:00:00', 6, 9, 'Collaboration entreprise interessante', NULL, 3),
(9, 'DevOps Pipeline Automator', 'Automatisation des pipelines CI/CD', 3, 'PENDING', '2026-03-10 10:00:00', 7, NULL, NULL, NULL, 2),
(10, 'E-commerce Recommender System', 'Systeme de recommandation pour site e-commerce', 4, 'ASSIGNED', '2026-03-15 10:00:00', 8, 10, 'Partnership avec Google', NULL, 3),
(11, 'Blockchain Voting System', 'Systeme de vote electronique base sur blockchain', 3, 'VALIDATED', '2026-03-20 10:00:00', 4, NULL, 'Innovant et securise', NULL, 6),
(12, 'AR Educational App', 'Application educative en realite augmentee', 4, 'PENDING', '2026-03-25 10:00:00', 5, NULL, NULL, NULL, 1),
(13, 'Hospital Management System', 'Systeme de gestion hospitaliere moderne', 5, 'COMPLETED', '2026-01-10 10:00:00', 6, 9, 'Projet termine avec succes', NULL, 2),
(14, 'Chatbot Customer Service', 'Chatbot intelligent pour service client', 3, 'ASSIGNED', '2026-01-15 10:00:00', 7, NULL, NULL, NULL, 3),
(15, 'Smart Parking Solution', 'Solution de parking intelligent', 4, 'VALIDATED', '2026-01-20 10:00:00', 8, NULL, 'Projet utile pour la ville', NULL, 5);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `leader_id` int DEFAULT NULL,
  `status` enum('FORMING','VALIDATED','COMPLETED') DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_id` (`project_id`),
  KEY `leader_id` (`leader_id`),
  CONSTRAINT `team_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `team_ibfk_2` FOREIGN KEY (`leader_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `team`
--

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_member`
--

DROP TABLE IF EXISTS `team_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  `joined_at` datetime DEFAULT NULL,
  `status` enum('PENDING','ACCEPTED') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `team_member_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
  CONSTRAINT `team_member_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `team_member`
--

LOCK TABLES `team_member` WRITE;
/*!40000 ALTER TABLE `team_member` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment`
--

DROP TABLE IF EXISTS `assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `project_id` int NOT NULL,
  `assigned_at` datetime NOT NULL,
  `mode` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_team` (`team_id`),
  UNIQUE KEY `uq_project` (`project_id`),
  CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
  CONSTRAINT `assignment_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `assignment`
--

LOCK TABLES `assignment` WRITE;
/*!40000 ALTER TABLE `assignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcement`
--

DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `audience` varchar(100) DEFAULT 'All users',
  `type` varchar(50) DEFAULT 'normal',
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `announcement_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `announcement`
--

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliverable`
--

DROP TABLE IF EXISTS `deliverable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliverable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `version` int DEFAULT NULL,
  `uploaded_at` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `team_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `fk_deliverable_team` (`team_id`),
  CONSTRAINT `deliverable_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `fk_deliverable_team` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `deliverable`
--

LOCK TABLES `deliverable` WRITE;
/*!40000 ALTER TABLE `deliverable` DISABLE KEYS */;
/*!40000 ALTER TABLE `deliverable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliverable_feedback`
--

DROP TABLE IF EXISTS `deliverable_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliverable_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deliverable_id` int DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `text` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'NEEDS_REVISION',
  PRIMARY KEY (`id`),
  KEY `deliverable_id` (`deliverable_id`),
  KEY `supervisor_id` (`supervisor_id`),
  CONSTRAINT `deliverable_feedback_ibfk_1` FOREIGN KEY (`deliverable_id`) REFERENCES `deliverable` (`id`),
  CONSTRAINT `deliverable_feedback_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `deliverable_feedback`
--

LOCK TABLES `deliverable_feedback` WRITE;
/*!40000 ALTER TABLE `deliverable_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `deliverable_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_conversation`
--

DROP TABLE IF EXISTS `group_conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_conversation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `group_type` enum('team','team_supervisor') NOT NULL,
  `supervisor_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_team_type` (`team_id`,`group_type`),
  KEY `supervisor_id` (`supervisor_id`),
  CONSTRAINT `group_conversation_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
  CONSTRAINT `group_conversation_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `group_conversation`
--

LOCK TABLES `group_conversation` WRITE;
/*!40000 ALTER TABLE `group_conversation` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_conversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_message`
--

DROP TABLE IF EXISTS `group_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` enum('image','file') DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `group_conversation_id` (`group_conversation_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `group_message_ibfk_1` FOREIGN KEY (`group_conversation_id`) REFERENCES `group_conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_message_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `group_message`
--

LOCK TABLES `group_message` WRITE;
/*!40000 ALTER TABLE `group_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meeting`
--

DROP TABLE IF EXISTS `meeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `topic` varchar(200) DEFAULT NULL,
  `feedback` text,
  `status` enum('SCHEDULED','COMPLETED','CANCELED','RESCHEDULED') DEFAULT 'SCHEDULED',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `meeting_team_fk` (`team_id`),
  KEY `meeting_user_fk` (`created_by`),
  CONSTRAINT `meeting_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `meeting_team_fk` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meeting_user_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `meeting`
--

LOCK TABLES `meeting` WRITE;
/*!40000 ALTER TABLE `meeting` DISABLE KEYS */;
/*!40000 ALTER TABLE `meeting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document`
--

DROP TABLE IF EXISTS `document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('Tutorial','Reference','Article','Material','Other') DEFAULT 'Other',
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `project_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `document_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`),
  CONSTRAINT `document_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `document`
--

LOCK TABLES `document` WRITE;
/*!40000 ALTER TABLE `document` DISABLE KEYS */;
/*!40000 ALTER TABLE `document` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` enum('INFO','ALERT','REMINDER') DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deadline_settings`
--

DROP TABLE IF EXISTS `deadline_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deadline_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deadline_date` date NOT NULL,
  `deadline_time` time NOT NULL,
  `send_reminder` tinyint(1) NOT NULL DEFAULT '0',
  `send_urgent` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `single_row` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `deadline_settings`
--

LOCK TABLES `deadline_settings` WRITE;
/*!40000 ALTER TABLE `deadline_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `deadline_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technology`
--

DROP TABLE IF EXISTS `technology`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technology` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `technology`
--

LOCK TABLES `technology` WRITE;
/*!40000 ALTER TABLE `technology` DISABLE KEYS */;
INSERT INTO `technology` VALUES 
(1, 'Python', '3.10'),
(2, 'React', '18.2'),
(3, 'Node.js', '18.0'),
(4, 'TensorFlow', '2.13'),
(5, 'Docker', '24.0'),
(6, 'Kubernetes', '1.28'),
(7, 'MongoDB', '6.0');
/*!40000 ALTER TABLE `technology` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_technology`
--

DROP TABLE IF EXISTS `project_technology`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_technology` (
  `project_id` int NOT NULL,
  `technology_id` int NOT NULL,
  PRIMARY KEY (`project_id`,`technology_id`),
  KEY `technology_id` (`technology_id`),
  CONSTRAINT `project_technology_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `project_technology_ibfk_2` FOREIGN KEY (`technology_id`) REFERENCES `technology` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_technology`
--

LOCK TABLES `project_technology` WRITE;
/*!40000 ALTER TABLE `project_technology` DISABLE KEYS */;
INSERT INTO `project_technology` VALUES 
(1, 4),
(1, 1),
(2, 2),
(2, 3),
(4, 4),
(4, 1),
(6, 3),
(6, 5),
(8, 5),
(8, 6),
(8, 7),
(10, 2),
(10, 3);
/*!40000 ALTER TABLE `project_technology` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `keyword`
--

DROP TABLE IF EXISTS `keyword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `keyword` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `keyword`
--

LOCK TABLES `keyword` WRITE;
/*!40000 ALTER TABLE `keyword` DISABLE KEYS */;
INSERT INTO `keyword` VALUES 
(1, 'Intelligence Artificielle'),
(2, 'Machine Learning'),
(3, 'Web Development'),
(4, 'Cloud Computing'),
(5, 'IoT'),
(6, 'Cybersecurite'),
(7, 'Blockchain'),
(8, 'Mobile Development');
/*!40000 ALTER TABLE `keyword` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_keyword`
--

DROP TABLE IF EXISTS `project_keyword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_keyword` (
  `project_id` int NOT NULL,
  `keyword_id` int NOT NULL,
  PRIMARY KEY (`project_id`,`keyword_id`),
  KEY `keyword_id` (`keyword_id`),
  CONSTRAINT `project_keyword_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `project_keyword_ibfk_2` FOREIGN KEY (`keyword_id`) REFERENCES `keyword` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_keyword`
--

LOCK TABLES `project_keyword` WRITE;
/*!40000 ALTER TABLE `project_keyword` DISABLE KEYS */;
INSERT INTO `project_keyword` VALUES 
(1, 1),
(1, 2),
(2, 3),
(4, 1),
(4, 2),
(6, 5),
(8, 4),
(10, 3),
(11, 7);
/*!40000 ALTER TABLE `project_keyword` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `evaluation`
--

DROP TABLE IF EXISTS `evaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `comments` text,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `evaluation_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `evaluation_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `evaluation`
--

LOCK TABLES `evaluation` WRITE;
/*!40000 ALTER TABLE `evaluation` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jury`
--

DROP TABLE IF EXISTS `jury`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jury` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `jury`
--

LOCK TABLES `jury` WRITE;
/*!40000 ALTER TABLE `jury` DISABLE KEYS */;
INSERT INTO `jury` VALUES 
(1, 'Jury Intelligence Artificielle'),
(2, 'Jury Genie Logiciel'),
(3, 'Jury IoT'),
(4, 'Jury Cloud Computing');
/*!40000 ALTER TABLE `jury` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jury_member`
--

DROP TABLE IF EXISTS `jury_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jury_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jury_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `role` enum('PRESIDENT','RAPPORTEUR','MEMBER') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `jury_id` (`jury_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `jury_member_ibfk_1` FOREIGN KEY (`jury_id`) REFERENCES `jury` (`id`),
  CONSTRAINT `jury_member_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `jury_member`
--

LOCK TABLES `jury_member` WRITE;
/*!40000 ALTER TABLE `jury_member` DISABLE KEYS */;
/*!40000 ALTER TABLE `jury_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int DEFAULT NULL,
  `receiver_id` int DEFAULT NULL,
  `content` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `message_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_message`
--

DROP TABLE IF EXISTS `project_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `project_message_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_message_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_message`
--

LOCK TABLES `project_message` WRITE;
/*!40000 ALTER TABLE `project_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES 
(1, 'Salle 101', 30, 'Batiment A, 1er etage'),
(2, 'Salle 102', 25, 'Batiment A, 1er etage'),
(3, 'Amphitheatre 1', 150, 'Batiment B, RDC'),
(4, 'Lab IoT', 20, 'Batiment C, 2eme etage'),
(5, 'Salle 305', 40, 'Batiment A, 3eme etage');
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soutenance`
--

DROP TABLE IF EXISTS `soutenance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `soutenance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `jury_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `room_name` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `status` enum('SCHEDULED','COMPLETED') DEFAULT NULL,
  `grade_oral` decimal(5,2) DEFAULT NULL,
  `grade_deliverables` decimal(5,2) DEFAULT NULL,
  `grade_demo` decimal(5,2) DEFAULT NULL,
  `grade_qa` decimal(5,2) DEFAULT NULL,
  `coef_oral`          DECIMAL(4,2) NOT NULL DEFAULT 1 ,
  `coef_deliverables`  DECIMAL(4,2) NOT NULL DEFAULT 1 ,
  `coef_demo`          DECIMAL(4,2) NOT NULL DEFAULT 1 ,
  `coef_qa`            DECIMAL(4,2) NOT NULL DEFAULT 1 ,
  `jury_observations` text DEFAULT NULL,
  `grade_status` enum('PENDING','NOTED','PUBLISHED') NOT NULL DEFAULT 'PENDING',
  `created_by` int DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `jury_notified` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_id` (`project_id`),
  KEY `jury_id` (`jury_id`),
  KEY `room_id` (`room_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `soutenance_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `soutenance_ibfk_2` FOREIGN KEY (`jury_id`) REFERENCES `jury` (`id`),
  CONSTRAINT `soutenance_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`),
  CONSTRAINT `soutenance_team_fk` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `soutenance`
--

LOCK TABLES `soutenance` WRITE;
/*!40000 ALTER TABLE `soutenance` DISABLE KEYS */;
/*!40000 ALTER TABLE `soutenance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soutenance_request`
--

DROP TABLE IF EXISTS `soutenance_request`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `soutenance_request` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `team_id`     INT          NOT NULL,
  `teacher_id`  INT          NOT NULL,
  `status`      ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `comment`     TEXT         DEFAULT NULL,
  `requested_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` DATETIME     DEFAULT NULL,
  `reviewed_by` INT          DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_team_request` (`team_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `sr_team_fk`    FOREIGN KEY (`team_id`)    REFERENCES `team`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `sr_teacher_fk` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `sr_reviewer_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `soutenance_request`
--

LOCK TABLES `soutenance_request` WRITE;
/*!40000 ALTER TABLE `soutenance_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `soutenance_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soutenance_jury`
--

DROP TABLE IF EXISTS `soutenance_jury`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `soutenance_jury` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `soutenance_id` INT          NOT NULL,
  `teacher_id`    INT NULL,
  `full_name`     VARCHAR(150) NOT NULL,
  `email`         VARCHAR(150) NOT NULL,
  `role`          ENUM('PRESIDENT','EXAMINER','INVITEUR') NOT NULL DEFAULT 'EXAMINER',
  `is_inviteur`   TINYINT(1) NOT NULL DEFAULT 0,
  `added_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `soutenance_id` (`soutenance_id`),
  kEY `teacher_id` (`teacher_id`),
  CONSTRAINT `sj_soutenance_fk` FOREIGN KEY (`soutenance_id`) REFERENCES `soutenance` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sj_teacher_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) 
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `soutenance_jury`
--

LOCK TABLES `soutenance_jury` WRITE;
/*!40000 ALTER TABLE `soutenance_jury` DISABLE KEYS */;
/*!40000 ALTER TABLE `soutenance_jury` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soutenance_result`
--

DROP TABLE IF EXISTS `soutenance_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `soutenance_result` (
  `id` int NOT NULL AUTO_INCREMENT,
  `soutenance_id` int DEFAULT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `pv` text,
  `submitted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `soutenance_id` (`soutenance_id`),
  CONSTRAINT `soutenance_result_ibfk_1` FOREIGN KEY (`soutenance_id`) REFERENCES `soutenance` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `soutenance_result`
--

LOCK TABLES `soutenance_result` WRITE;
/*!40000 ALTER TABLE `soutenance_result` DISABLE KEYS */;
/*!40000 ALTER TABLE `soutenance_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wish`
--

DROP TABLE IF EXISTS `wish`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wish` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `project_id` int DEFAULT NULL,
  `priority` int DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `status` enum('DRAFT','SUBMITTED') NOT NULL DEFAULT 'DRAFT',
  `team_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `project_id` (`project_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `wish_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `wish_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `wish_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wish_ibfk_4` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `wish`
--

LOCK TABLES `wish` WRITE;
/*!40000 ALTER TABLE `wish` DISABLE KEYS */;
/*!40000 ALTER TABLE `wish` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `archived_users`
--

DROP TABLE IF EXISTS `archived_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archived_users` (
  `id` int NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `archived_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `archived_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `archived_by` (`archived_by`),
  CONSTRAINT `archived_users_ibfk_1` FOREIGN KEY (`archived_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `archived_users`
--

LOCK TABLES `archived_users` WRITE;
/*!40000 ALTER TABLE `archived_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `archived_users` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;