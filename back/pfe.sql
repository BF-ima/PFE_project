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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrator`
--

LOCK TABLES `administrator` WRITE;
/*!40000 ALTER TABLE `administrator` DISABLE KEYS */;
INSERT INTO `administrator` VALUES (54,'{\"Gestion des projets PFE\": true}');
/*!40000 ALTER TABLE `administrator` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement`
--

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
INSERT INTO `announcement` VALUES (1,'ttttttttttttttt','tttttttttttttttttttttt','Students','normal',48,'2026-05-21 18:14:27'),(2,'jjjjjjjjjjjjj','jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj','Supervisors','important',1,'2026-05-21 18:15:43'),(3,'ppppppppppp','ppppppppppppppp','Students','normal',48,'2026-05-21 20:20:25');
/*!40000 ALTER TABLE `announcement` ENABLE KEYS */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archived_users`
--

LOCK TABLES `archived_users` WRITE;
/*!40000 ALTER TABLE `archived_users` DISABLE KEYS */;
INSERT INTO `archived_users` VALUES (46,'marwa','marwa','marwa@esi-sba.dz','etudiant','0787878787','2026-04-17 20:07:52',1),(54,'souzi','souzi','souzi@esi-sba.dz','admin','787898980','2026-04-27 00:43:01',1),(65,'soumi','soumi','soumi@esi-sba.dz','etudiant','787898980','2026-04-27 00:45:41',1),(67,'sssss','sssss','s.sssss@esi-sba.dz','etudiant','sssss','2026-04-27 00:45:28',1),(69,'tuuuu','uuuuuuuuuuu','uu@esi-sba.dz','enseignant','00000000','2026-04-16 19:57:35',1);
/*!40000 ALTER TABLE `archived_users` ENABLE KEYS */;
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
  UNIQUE KEY `uq_team_project` (`team_id`,`project_id`),
  KEY `assignment_ibfk_2` (`project_id`),
  CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
  CONSTRAINT `assignment_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment`
--

LOCK TABLES `assignment` WRITE;
/*!40000 ALTER TABLE `assignment` DISABLE KEYS */;
INSERT INTO `assignment` VALUES (113,78,29,'2026-04-19 22:51:26','average'),(117,81,31,'2026-04-20 17:34:28','manual'),(121,83,31,'2026-04-20 23:49:28','manual'),(122,87,34,'2026-05-19 18:58:26','direct'),(123,88,36,'2026-05-19 19:12:43','direct'),(124,89,37,'2026-05-19 23:31:02','direct'),(125,90,38,'2026-05-19 23:44:16','direct'),(126,91,39,'2026-05-20 00:44:43','direct'),(127,92,40,'2026-05-20 01:03:42','direct'),(128,93,41,'2026-05-20 09:02:17','direct'),(129,96,45,'2026-05-21 17:06:02','direct');
/*!40000 ALTER TABLE `assignment` ENABLE KEYS */;
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
  `type` varchar(50) NOT NULL DEFAULT 'wish_submission',
  PRIMARY KEY (`id`),
  UNIQUE KEY `single_row` (`id`),
  UNIQUE KEY `uq_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deadline_settings`
--

LOCK TABLES `deadline_settings` WRITE;
/*!40000 ALTER TABLE `deadline_settings` DISABLE KEYS */;
INSERT INTO `deadline_settings` VALUES (33,'2026-05-28','00:00:00',0,0,'2026-05-20 02:01:58','2026-05-21 15:04:53','wish_submission'),(35,'2026-05-22','08:08:00',0,0,'2026-05-21 15:06:22','2026-05-21 15:11:08','project_submission');
/*!40000 ALTER TABLE `deadline_settings` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliverable`
--

LOCK TABLES `deliverable` WRITE;
/*!40000 ALTER TABLE `deliverable` DISABLE KEYS */;
INSERT INTO `deliverable` VALUES (3,29,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776634517/deliverables/1776666966529-138333014','application/pdf',1,'2026-04-19 23:36:09','PENDING',NULL),(4,29,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776634867/deliverables/1776667316050-970035736','application/pdf',2,'2026-04-19 23:41:59','PENDING',NULL),(5,29,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776634922/deliverables/1776667371684-191482176','application/pdf',3,'2026-04-19 23:42:54','PENDING',NULL),(6,29,'Defense Presentation','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776634982/deliverables/1776667432179-556103143','application/pdf',1,'2026-04-19 23:43:55','PENDING',NULL),(7,29,'Source Code Repository','https://github.com/BF-ima/PFE_project/branches','url',1,'2026-04-19 23:47:44','PENDING',NULL),(8,29,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776642723/deliverables/1776675173150-72119141','application/pdf',4,'2026-04-20 01:52:55','PENDING',NULL),(9,31,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776727116/deliverables/1776759567000-666570562','application/pdf',1,'2026-04-21 01:19:29','PENDING',NULL),(10,31,'Defense Presentation','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776727128/deliverables/1776759579861-669361996','application/pdf',1,'2026-04-21 01:19:42','NEEDS_REVISION',NULL),(11,31,'Source Code Repository','https://github.com/BF-ima/PFE_project.git','url',1,'2026-04-21 01:20:26','APPROVED',NULL),(12,31,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776727208/deliverables/1776759658570-977687953','application/pdf',2,'2026-04-21 01:21:01','APPROVED',NULL),(13,31,'Defense Presentation','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776727507/deliverables/1776759950881-252752074','application/pdf',2,'2026-04-21 01:26:00','PENDING',NULL),(14,31,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776729627/deliverables/1776762078824-938557147','application/pdf',1,'2026-04-21 02:01:22','APPROVED',81),(15,31,'Source Code Repository','https://github.com/BF-ima/PFE_project.git','url',1,'2026-04-21 02:01:41','APPROVED',81),(16,31,'Defense Presentation','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776729667/deliverables/1776762118728-965161559','application/pdf',1,'2026-04-21 02:02:00','APPROVED',81),(17,31,'TD4_gestion_projet_ESI_2026 (2).pdf','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776764093/deliverables/1776796544240-843940686','Reference',3,'2026-04-21 11:35:46','PENDING',NULL),(18,31,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776768175/deliverables/1776800626187-984316437','application/pdf',1,'2026-04-21 12:43:48','NEEDS_REVISION',83),(19,31,'Source Code Repository','https://github.com/BF-ima/PFE_project.git','url',1,'2026-04-21 12:44:01','APPROVED',83),(20,31,'Defense Presentation','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776768201/deliverables/1776800652995-56908259','application/pdf',1,'2026-04-21 12:44:15','APPROVED',83),(21,31,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776768292/deliverables/1776800743102-931003106','application/pdf',2,'2026-04-21 12:45:46','APPROVED',83),(22,40,'Final Report','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1779347462/deliverables/1779379929120-955902696','application/pdf',1,'2026-05-21 09:12:11','NEEDS_REVISION',92),(23,45,'Source Code Repository','https://github.com/BF-ima/PFE_project','url',1,'2026-05-21 17:08:57','PENDING',96);
/*!40000 ALTER TABLE `deliverable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliverable_deadline`
--

DROP TABLE IF EXISTS `deliverable_deadline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliverable_deadline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `deliverable_type` varchar(50) NOT NULL,
  `deadline_date` date NOT NULL,
  `deadline_time` time NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_team_type_sprint` (`team_id`,`deliverable_type`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliverable_deadline`
--

LOCK TABLES `deliverable_deadline` WRITE;
/*!40000 ALTER TABLE `deliverable_deadline` DISABLE KEYS */;
INSERT INTO `deliverable_deadline` VALUES (1,92,'Source Code Repository','2026-05-22','14:13:00',48,'2026-05-21 20:13:18','2026-05-21 20:13:44'),(4,81,'Final Report','2026-05-22','13:49:00',48,'2026-05-21 20:45:03','2026-05-21 20:45:03');
/*!40000 ALTER TABLE `deliverable_deadline` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliverable_feedback`
--

LOCK TABLES `deliverable_feedback` WRITE;
/*!40000 ALTER TABLE `deliverable_feedback` DISABLE KEYS */;
INSERT INTO `deliverable_feedback` VALUES (1,12,48,'nice','2026-04-21 01:22:15','APPROVED'),(2,11,48,'ok','2026-04-21 01:23:54','APPROVED'),(3,10,48,'ok','2026-04-21 01:24:05','APPROVED'),(4,10,48,'no','2026-04-21 01:24:17','NEEDS_REVISION'),(5,14,48,'ok','2026-04-21 02:02:40','APPROVED'),(6,15,48,'ok','2026-04-21 02:02:49','APPROVED'),(7,16,48,'ok','2026-04-21 02:02:57','APPROVED'),(8,18,48,'no nnnnnnnnnnn','2026-04-21 12:44:48','NEEDS_REVISION'),(9,19,48,'ok','2026-04-21 12:44:57','APPROVED'),(10,20,48,'ok','2026-04-21 12:45:05','APPROVED'),(11,21,48,'ok','2026-04-21 12:46:17','APPROVED'),(12,22,34,'hhhhh','2026-05-21 09:13:39','NEEDS_REVISION');
/*!40000 ALTER TABLE `deliverable_feedback` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document`
--

LOCK TABLES `document` WRITE;
/*!40000 ALTER TABLE `document` DISABLE KEYS */;
INSERT INTO `document` VALUES (1,'TD4_gestion_projet_ESI_2026 (2).pdf','Article','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776765457/documents/1776797908617-166061414',284454,48,NULL,'2026-04-21 11:58:31'),(2,'TD5-XSLTXQUERY-2025-2026.pdf','Material','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776767099/documents/1776799551095-249264433',319480,48,31,'2026-04-21 12:25:53'),(3,'sports_apps_software.pptx','Article','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776768009/documents/1776800460140-762845005',166755,48,NULL,'2026-04-21 12:41:02'),(4,'Cours 5-Les techniques de planification_2025-26 (1).pdf','Article','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776768136/documents/1776800587859-904671331',421361,48,31,'2026-04-21 12:43:10'),(5,'Cours 5-Les techniques de planification_2025-26 (1).pdf','Material','https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776768846/documents/1776801297601-298998564',421361,48,31,'2026-04-21 12:55:00');
/*!40000 ALTER TABLE `document` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation`
--

LOCK TABLES `evaluation` WRITE;
/*!40000 ALTER TABLE `evaluation` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluation` ENABLE KEYS */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `external_supervisor`
--

LOCK TABLES `external_supervisor` WRITE;
/*!40000 ALTER TABLE `external_supervisor` DISABLE KEYS */;
INSERT INTO `external_supervisor` VALUES (34,'ppppp','pppppp',NULL,'AI');
/*!40000 ALTER TABLE `external_supervisor` ENABLE KEYS */;
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
  UNIQUE KEY `uq_team_type_supervisor` (`team_id`,`group_type`,`supervisor_id`),
  KEY `group_conversation_ibfk_2` (`supervisor_id`),
  CONSTRAINT `group_conversation_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
  CONSTRAINT `group_conversation_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_conversation`
--

LOCK TABLES `group_conversation` WRITE;
/*!40000 ALTER TABLE `group_conversation` DISABLE KEYS */;
INSERT INTO `group_conversation` VALUES (52,78,'team',NULL,'2026-04-16 17:28:22'),(55,81,'team',NULL,'2026-04-17 20:58:50'),(56,82,'team',NULL,'2026-04-19 22:08:40'),(57,78,'team_supervisor',70,'2026-04-19 22:51:26'),(58,81,'team_supervisor',48,'2026-04-20 14:59:05'),(59,83,'team',NULL,'2026-04-20 17:28:05'),(60,83,'team_supervisor',48,'2026-04-20 17:32:29'),(61,84,'team',NULL,'2026-04-21 12:51:50'),(62,85,'team',NULL,'2026-04-26 15:58:52'),(63,86,'team',NULL,'2026-04-30 19:11:08'),(64,87,'team',NULL,'2026-05-19 18:57:56'),(65,88,'team',NULL,'2026-05-19 19:12:21'),(66,89,'team',NULL,'2026-05-19 23:29:47'),(67,89,'team_supervisor',48,'2026-05-19 23:31:02'),(69,90,'team',NULL,'2026-05-19 23:42:54'),(70,90,'team_supervisor',48,'2026-05-19 23:44:16'),(72,91,'team',NULL,'2026-05-20 00:43:28'),(73,91,'team_supervisor',48,'2026-05-20 00:44:43'),(76,87,'team_supervisor',34,'2026-05-20 00:58:52'),(77,88,'team_supervisor',34,'2026-05-20 00:58:52'),(78,89,'team_supervisor',34,'2026-05-20 00:58:52'),(79,90,'team_supervisor',34,'2026-05-20 00:58:52'),(80,91,'team_supervisor',34,'2026-05-20 00:58:52'),(83,92,'team',NULL,'2026-05-20 01:01:29'),(84,92,'team_supervisor',48,'2026-05-20 01:03:42'),(85,92,'team_supervisor',34,'2026-05-20 01:03:42'),(86,93,'team',NULL,'2026-05-20 08:56:49'),(87,93,'team_supervisor',48,'2026-05-20 09:02:17'),(88,93,'team_supervisor',34,'2026-05-20 09:02:17'),(90,95,'team',NULL,'2026-05-21 12:45:42'),(91,96,'team',NULL,'2026-05-21 15:23:49'),(92,96,'team_supervisor',48,'2026-05-21 17:06:02'),(93,96,'team_supervisor',34,'2026-05-21 17:06:02');
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_message`
--

LOCK TABLES `group_message` WRITE;
/*!40000 ALTER TABLE `group_message` DISABLE KEYS */;
INSERT INTO `group_message` VALUES (8,58,48,'hello',NULL,NULL,1,'2026-04-20 15:00:12'),(9,58,73,'https://res.cloudinary.com/dbwd1ofvu/raw/upload/v1776690027/chat_uploads/1776722477661-244927080','Cours 5-Les techniques de planification_2025-26 (1).pdf','file',1,'2026-04-20 15:01:20'),(10,62,76,'hiiiii',NULL,NULL,1,'2026-04-26 17:36:42'),(11,62,76,'how are you',NULL,NULL,1,'2026-04-26 17:36:49'),(12,62,78,'helloooo',NULL,NULL,1,'2026-04-26 17:37:18'),(13,62,78,'im good',NULL,NULL,1,'2026-04-26 17:37:27'),(14,62,76,'what do think about raport?',NULL,NULL,1,'2026-04-26 17:55:34'),(15,62,78,'yes i like it',NULL,NULL,1,'2026-04-26 18:07:38'),(16,62,76,'ok',NULL,NULL,1,'2026-04-26 18:08:47'),(17,84,85,'hello',NULL,NULL,1,'2026-05-20 01:07:39'),(18,85,85,'hiiiiii',NULL,NULL,1,'2026-05-20 01:09:08'),(19,88,34,'helloooooooooo',NULL,NULL,1,'2026-05-20 09:07:54'),(20,88,86,'hiiiiiiiiii',NULL,NULL,1,'2026-05-20 09:08:26'),(21,88,86,'hhhhhhhhhhhhhhhhhhhhhh',NULL,NULL,1,'2026-05-20 09:11:21'),(22,87,86,'hhhhhhhhhhhhhhhhhhhhhhhhhh',NULL,NULL,1,'2026-05-20 09:11:31');
/*!40000 ALTER TABLE `group_message` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jury`
--

LOCK TABLES `jury` WRITE;
/*!40000 ALTER TABLE `jury` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jury_member`
--

LOCK TABLES `jury_member` WRITE;
/*!40000 ALTER TABLE `jury_member` DISABLE KEYS */;
/*!40000 ALTER TABLE `jury_member` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keyword`
--

LOCK TABLES `keyword` WRITE;
/*!40000 ALTER TABLE `keyword` DISABLE KEYS */;
/*!40000 ALTER TABLE `keyword` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting`
--

LOCK TABLES `meeting` WRITE;
/*!40000 ALTER TABLE `meeting` DISABLE KEYS */;
INSERT INTO `meeting` VALUES (1,31,83,'2026-04-23 11:00:00','Salle 1',NULL,48,'cahier de charge',NULL,'COMPLETED'),(2,31,83,'2026-04-23 14:00:00',NULL,'https://github.com/BF-ima/PFE_project.git',48,'rapport',NULL,'CANCELED'),(3,31,81,'2026-05-20 10:00:00','Amphi A',NULL,48,'cahier de charge',NULL,'SCHEDULED'),(4,40,92,'2026-05-21 10:00:00',NULL,'https://github.com/BF-ima/PFE_project',34,'conseption',NULL,'COMPLETED'),(5,40,92,'2026-05-22 08:50:00','Amphi A',NULL,48,'important',NULL,'SCHEDULED');
/*!40000 ALTER TABLE `meeting` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (12,33,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is tomorrow at 15:12. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 15:12:00'),(13,46,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is tomorrow at 15:12. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 15:12:00'),(14,65,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is tomorrow at 15:12. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 15:12:00'),(15,67,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is tomorrow at 15:12. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 15:12:00'),(16,68,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is tomorrow at 15:12. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 15:12:00'),(17,73,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is tomorrow at 15:12. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 15:12:00'),(18,33,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 17:44. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 15:42:41'),(19,46,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 17:44. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 15:42:41'),(20,65,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 17:44. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 15:42:41'),(21,67,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 17:44. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 15:42:41'),(22,68,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 17:44. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 15:42:41'),(23,73,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 17:44. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 15:42:41'),(24,33,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 17:44). Submit your preferences immediately!',1,'2026-04-18 15:44:00'),(25,46,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 17:44). Submit your preferences immediately!',1,'2026-04-18 15:44:00'),(26,65,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 17:44). Submit your preferences immediately!',0,'2026-04-18 15:44:00'),(27,67,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 17:44). Submit your preferences immediately!',0,'2026-04-18 15:44:00'),(28,68,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 17:44). Submit your preferences immediately!',0,'2026-04-18 15:44:00'),(29,73,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 17:44). Submit your preferences immediately!',1,'2026-04-18 15:44:00'),(30,33,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 16:37. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 16:35:34'),(31,46,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 16:37. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 16:35:34'),(32,65,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 16:37. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 16:35:34'),(33,67,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 16:37. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 16:35:34'),(34,68,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 16:37. Make sure to submit your preferences before it\'s too late!',0,'2026-04-18 16:35:34'),(35,73,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-18 at 16:37. Make sure to submit your preferences before it\'s too late!',1,'2026-04-18 16:35:34'),(36,33,'ALERT','🚨 Urgent: Deadline Very Soon!','The project preference submission deadline is at 16:37 today. Submit your preferences immediately!',1,'2026-04-18 16:35:34'),(37,46,'ALERT','🚨 Urgent: Deadline Very Soon!','The project preference submission deadline is at 16:37 today. Submit your preferences immediately!',1,'2026-04-18 16:35:34'),(38,65,'ALERT','🚨 Urgent: Deadline Very Soon!','The project preference submission deadline is at 16:37 today. Submit your preferences immediately!',0,'2026-04-18 16:35:34'),(39,67,'ALERT','🚨 Urgent: Deadline Very Soon!','The project preference submission deadline is at 16:37 today. Submit your preferences immediately!',0,'2026-04-18 16:35:34'),(40,68,'ALERT','🚨 Urgent: Deadline Very Soon!','The project preference submission deadline is at 16:37 today. Submit your preferences immediately!',0,'2026-04-18 16:35:34'),(41,73,'ALERT','🚨 Urgent: Deadline Very Soon!','The project preference submission deadline is at 16:37 today. Submit your preferences immediately!',1,'2026-04-18 16:35:34'),(42,68,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:33. Make sure to submit your preferences before it\'s too late!',0,'2026-04-19 21:31:27'),(43,46,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:33. Make sure to submit your preferences before it\'s too late!',1,'2026-04-19 21:31:27'),(44,73,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:33. Make sure to submit your preferences before it\'s too late!',1,'2026-04-19 21:31:27'),(45,65,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:33. Make sure to submit your preferences before it\'s too late!',0,'2026-04-19 21:31:27'),(46,67,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:33. Make sure to submit your preferences before it\'s too late!',0,'2026-04-19 21:31:27'),(47,68,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:50. Make sure to submit your preferences before it\'s too late!',0,'2026-04-19 21:48:30'),(48,46,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:50. Make sure to submit your preferences before it\'s too late!',1,'2026-04-19 21:48:30'),(49,73,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:50. Make sure to submit your preferences before it\'s too late!',1,'2026-04-19 21:48:30'),(50,65,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:50. Make sure to submit your preferences before it\'s too late!',0,'2026-04-19 21:48:30'),(51,67,'REMINDER','⏰ Deadline Reminder','The project preference submission deadline is on 2026-04-19 at 23:50. Make sure to submit your preferences before it\'s too late!',0,'2026-04-19 21:48:30'),(52,68,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 23:50). Submit your preferences immediately!',0,'2026-04-19 21:50:00'),(53,46,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 23:50). Submit your preferences immediately!',1,'2026-04-19 21:50:00'),(54,73,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 23:50). Submit your preferences immediately!',1,'2026-04-19 21:50:00'),(55,65,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 23:50). Submit your preferences immediately!',0,'2026-04-19 21:50:00'),(56,67,'ALERT','🚨 Urgent: Deadline in 2 Hours!','The project preference submission deadline is in 2 hours (at 23:50). Submit your preferences immediately!',0,'2026-04-19 21:50:00'),(57,33,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"rrrrrr\" (Choice #1).',1,'2026-04-19 22:53:22'),(58,33,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"rrrrrr\" (Choice #1).',0,'2026-04-20 17:32:40'),(59,73,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"rrrrrr\".',1,'2026-04-20 17:32:40'),(60,74,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"qwqw\" (Choice #1).',0,'2026-04-20 17:32:40'),(61,33,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"rrrrrr\" (Choice #1).',0,'2026-04-20 17:34:32'),(62,73,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"qwqw\" (Choice #1).',1,'2026-04-20 17:34:32'),(63,74,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"qwqw\" (Choice #1).',0,'2026-04-20 17:34:32'),(64,73,'INFO',NULL,'New deadline set: Final Report  due on 2026-05-22 at 13:49',1,'2026-05-21 13:45:03'),(65,34,'INFO','Project Validated','Your project \"khorchef\" has been validated by the administration.',0,'2026-05-21 17:06:02'),(66,34,'INFO','New Deliverable Submitted','A team has submitted a new Source Code Repository URL for your project.',0,'2026-05-21 17:08:57');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
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
  `assigned_student_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `external_supervisor_id` (`external_supervisor_id`),
  KEY `speciality_id` (`speciality_id`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`),
  CONSTRAINT `project_ibfk_2` FOREIGN KEY (`external_supervisor_id`) REFERENCES `external_supervisor` (`id`),
  CONSTRAINT `project_ibfk_3` FOREIGN KEY (`speciality_id`) REFERENCES `speciality` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (6,'ai agent','mini projet',4,'VALIDATED','2026-03-22 15:44:51',48,NULL,NULL,NULL,NULL,NULL),(7,'web app','simple web site ...........',6,'VALIDATED','2026-03-22 17:20:16',48,NULL,NULL,NULL,NULL,NULL),(12,'qqqqqqqqqqqq','wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',2,'VALIDATED','2026-03-22 23:22:04',48,NULL,NULL,NULL,NULL,NULL),(27,'projet','pppppppppppppppppppppp',4,'VALIDATED','2026-04-13 20:14:27',48,NULL,NULL,NULL,NULL,NULL),(28,'ooooooo','tttttttttttttttt',3,'VALIDATED','2026-04-14 15:26:30',48,NULL,'pppppppppp',NULL,NULL,NULL),(29,'rrrrrr','tttttttttttt',3,'VALIDATED','2026-04-16 16:14:52',70,NULL,NULL,NULL,NULL,NULL),(31,'ggggggggggg','hhhhhhhhhhhhhh',2,'ASSIGNED','2026-04-17 19:28:46',48,NULL,NULL,NULL,8,NULL),(32,'projet pfe','ok',4,'VALIDATED','2026-05-19 16:46:09',48,34,NULL,NULL,9,NULL),(33,'projet aide','yep\n',5,'VALIDATED','2026-05-19 17:18:19',48,NULL,NULL,NULL,10,NULL),(34,'lalalala','lalalalala',1,'ASSIGNED','2026-05-19 18:53:41',48,34,NULL,NULL,9,'k.messaoud@esi-sba.dz'),(35,'hahahahah','hahahahahaah',1,'PENDING','2026-05-19 19:06:54',48,34,NULL,NULL,9,'k.messaoud@esi-sba.dz'),(36,'popoopop','popopopo',1,'ASSIGNED','2026-05-19 19:11:46',48,34,NULL,NULL,9,'hafsa@esi-sba.dz'),(37,'kokokokoo','kokokokok',1,'ASSIGNED','2026-05-19 23:29:25',48,34,NULL,NULL,9,'maria@esi-sba.dz'),(38,'yoyoyoyoyooooooy','yoyoyoyoy',1,'ASSIGNED','2026-05-19 23:43:57',48,34,NULL,NULL,9,'fazi@esi-sba.dz'),(39,'iwiwiwiw','wiwiwiw',1,'ASSIGNED','2026-05-20 00:44:18',48,34,NULL,NULL,9,'batoul@esi-sba.dz'),(40,'gtgtgtgt','gtgtgt',1,'ASSIGNED','2026-05-20 01:03:22',48,34,NULL,NULL,9,'katy@esi-sba.dz'),(41,'projet de fin d\'etude','tttttttttttt',1,'ASSIGNED','2026-05-20 09:01:14',48,34,NULL,NULL,9,'s.tounsi@esi-sba.dz'),(42,'ddddddddddddd','eeeeeeeeeeeeeeeeeee',3,'REJECTED','2026-05-20 11:09:00',48,NULL,NULL,'hhhhhhhhh',9,NULL),(43,'gggggggggggg','rrrrrrrrrrrrrrrrrrr',6,'VALIDATED','2026-05-20 11:09:21',48,NULL,NULL,NULL,8,NULL),(44,'project','hhhhhhhhhhhhhhhhhh',1,'PENDING','2026-05-20 23:30:06',48,34,NULL,NULL,9,'k.messaoud@esi-sba.dz'),(45,'khorchef','kkkkkkkkkkkkk',1,'ASSIGNED','2026-05-21 17:05:32',48,34,NULL,NULL,9,'khorchef@esi-sba.dz');
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_keyword`
--

LOCK TABLES `project_keyword` WRITE;
/*!40000 ALTER TABLE `project_keyword` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_keyword` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_message`
--

LOCK TABLES `project_message` WRITE;
/*!40000 ALTER TABLE `project_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_message` ENABLE KEYS */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_technology`
--

LOCK TABLES `project_technology` WRITE;
/*!40000 ALTER TABLE `project_technology` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_technology` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo`
--

LOCK TABLES `promo` WRITE;
/*!40000 ALTER TABLE `promo` DISABLE KEYS */;
INSERT INTO `promo` VALUES (1,NULL,2023,NULL,NULL),(2,NULL,2024,NULL,NULL),(3,NULL,2025,NULL,NULL),(4,NULL,2026,NULL,NULL),(5,'Promo 2023',2023,'2022-09-01','2023-06-30'),(6,'Promo 2024',2024,'2023-09-01','2024-06-30'),(7,'Promo 2025',2025,'2024-09-01','2025-06-30');
/*!40000 ALTER TABLE `promo` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
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
  `jury_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `status` enum('SCHEDULED','COMPLETED') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_id` (`project_id`),
  KEY `jury_id` (`jury_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `soutenance_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `soutenance_ibfk_2` FOREIGN KEY (`jury_id`) REFERENCES `jury` (`id`),
  CONSTRAINT `soutenance_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `soutenance`
--

LOCK TABLES `soutenance` WRITE;
/*!40000 ALTER TABLE `soutenance` DISABLE KEYS */;
/*!40000 ALTER TABLE `soutenance` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `soutenance_result`
--

LOCK TABLES `soutenance_result` WRITE;
/*!40000 ALTER TABLE `soutenance_result` DISABLE KEYS */;
/*!40000 ALTER TABLE `soutenance_result` ENABLE KEYS */;
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `speciality`
--

LOCK TABLES `speciality` WRITE;
/*!40000 ALTER TABLE `speciality` DISABLE KEYS */;
INSERT INTO `speciality` VALUES (1,'Informatique',NULL),(2,'Génie Logiciel',NULL),(3,'Intelligence Artificielle',NULL),(4,'Réseaux et Télécommunications',NULL),(5,'Systèmes Embarqués',NULL),(6,'Informatique','INFO'),(7,'Réseaux et Télécommunications','RT'),(8,'Intelligence Artificielle','IA'),(9,'Génie Logiciel','GL'),(10,'Systèmes Informatiques','SI');
/*!40000 ALTER TABLE `speciality` ENABLE KEYS */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (33,13.40,'ACTIVE',NULL,3,5),(46,17.00,'ACTIVE',NULL,NULL,NULL),(65,13.23,'ACTIVE',NULL,1,5),(67,14.00,'ACTIVE',NULL,1,6),(68,14.00,'ACTIVE',NULL,3,5),(73,17.00,'ACTIVE',NULL,8,6),(74,16.00,'ACTIVE',NULL,8,5),(75,15.00,'ACTIVE',NULL,8,5),(76,12.00,'ACTIVE',NULL,8,5),(77,14.00,'ACTIVE',NULL,9,6),(78,14.00,'ACTIVE',NULL,8,5),(79,14.00,'ACTIVE',NULL,9,1),(80,13.00,'ACTIVE',NULL,9,1),(81,15.00,'ACTIVE',NULL,9,1),(82,17.00,'ACTIVE',NULL,9,1),(83,17.00,'ACTIVE',NULL,9,1),(84,15.00,'ACTIVE',NULL,9,1),(85,17.00,'ACTIVE',NULL,9,1),(86,16.00,'ACTIVE',NULL,9,1),(87,12.00,'ACTIVE',NULL,9,1),(89,18.00,'ACTIVE',NULL,9,1);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `super_admin` VALUES (1,'Super Admin','{\"can_view_all\": true, \"can_create_admin\": true, \"can_delete_users\": true, \"can_update_users\": true, \"can_create_etudiant\": true, \"can_create_enseignant\": true, \"can_create_entreprise\": true, \"can_assign_permissions\": true}');
/*!40000 ALTER TABLE `super_admin` ENABLE KEYS */;
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
  `rank` enum('A','B','C') DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `teacher_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES (4,'AI',NULL),(5,'isi',NULL),(39,'ai',NULL),(48,'ai',NULL),(69,'aweb',NULL),(70,'ww',NULL),(72,'ai','A'),(88,'ai','A');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
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
  KEY `team_leader_fk` (`leader_id`),
  CONSTRAINT `team_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `team_leader_fk` FOREIGN KEY (`leader_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team`
--

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` VALUES (78,NULL,33,'FORMING','2026-04-16 17:28:22'),(81,NULL,73,'FORMING','2026-04-17 20:58:50'),(82,NULL,46,'FORMING','2026-04-19 22:08:40'),(83,NULL,74,'FORMING','2026-04-20 17:28:05'),(84,NULL,75,'FORMING','2026-04-21 12:51:49'),(85,NULL,76,'FORMING','2026-04-26 15:58:52'),(86,NULL,67,'FORMING','2026-04-30 19:11:08'),(87,NULL,79,'FORMING','2026-05-19 18:57:56'),(88,NULL,80,'FORMING','2026-05-19 19:12:21'),(89,NULL,81,'FORMING','2026-05-19 23:29:47'),(90,NULL,82,'FORMING','2026-05-19 23:42:54'),(91,NULL,84,'FORMING','2026-05-20 00:43:28'),(92,NULL,85,'FORMING','2026-05-20 01:01:29'),(93,NULL,86,'FORMING','2026-05-20 08:56:49'),(95,NULL,87,'FORMING','2026-05-21 12:45:42'),(96,NULL,89,'FORMING','2026-05-21 15:23:49');
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
  `status` enum('PENDING','ACCEPTED','REJECTED') NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `team_member_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
  CONSTRAINT `team_member_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_member`
--

LOCK TABLES `team_member` WRITE;
/*!40000 ALTER TABLE `team_member` DISABLE KEYS */;
INSERT INTO `team_member` VALUES (115,78,33,'2026-04-16 17:28:22','ACCEPTED'),(118,81,73,'2026-04-17 20:58:50','ACCEPTED'),(119,82,46,'2026-04-19 22:08:40','ACCEPTED'),(120,83,74,'2026-04-20 17:28:05','ACCEPTED'),(121,84,75,'2026-04-21 12:51:50','ACCEPTED'),(122,85,76,'2026-04-26 15:58:52','ACCEPTED'),(123,85,68,'2026-04-26 16:03:17','REJECTED'),(124,85,78,'2026-04-26 17:24:37','ACCEPTED'),(125,86,67,'2026-04-30 19:11:08','ACCEPTED'),(126,87,79,'2026-05-19 18:57:56','ACCEPTED'),(127,88,80,'2026-05-19 19:12:21','ACCEPTED'),(128,89,81,'2026-05-19 23:29:47','ACCEPTED'),(129,90,82,'2026-05-19 23:42:54','ACCEPTED'),(130,91,84,'2026-05-20 00:43:28','ACCEPTED'),(131,92,85,'2026-05-20 01:01:29','ACCEPTED'),(132,93,86,'2026-05-20 08:56:49','ACCEPTED'),(134,95,87,'2026-05-21 12:45:42','ACCEPTED'),(135,96,89,'2026-05-21 15:23:49','ACCEPTED');
/*!40000 ALTER TABLE `team_member` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technology`
--

LOCK TABLES `technology` WRITE;
/*!40000 ALTER TABLE `technology` DISABLE KEYS */;
/*!40000 ALTER TABLE `technology` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,NULL,'superadmin@example.com','$2b$12$gmeIrlv3dKTtG4Z4EoU0w.fuAWT8oubmcmGItthykQVZx/6jzKJS6','super_admin',1,'2026-03-12 14:31:12',NULL,'5a82cbcc43882f00880c2a3e230db83ffb0e842a90bbe3e553c8b76640972d1e','2026-03-12 16:23:48',NULL),(4,'asmaa','babeker','a.babeker@esi-sba.dz','$2b$12$eGEZBvbL6viBU/o8QfSqhO8q9FzXSwDJijfYFm82Dj3/KJHpvshHK','enseignant',1,'2026-03-13 01:08:57',1,NULL,NULL,'0671188221'),(5,'wafaa','rahmoune','w.rahmoune@esi-sba.dz','$2b$12$qA3HgBcKTHBxARzJ8mULq.Y.MKUj36ZLIJp4VUOLHmub.0fE3ooK.','enseignant',1,'2026-03-13 01:26:45',1,NULL,NULL,'0612233445'),(33,'radjaa','turki','r.turki@esi-sba.dz','$2b$12$iiRbDM4Uz0UeUfVa7pKjLejBcxzlxGfqm/m0SfNfjZQbKV4M5yD7W','etudiant',1,'2026-03-13 16:05:34',1,NULL,NULL,'0675757575'),(34,'omar','sahnoun','o.sahnoun@esi-sba.dz','$2b$12$2xM09PRDT0lz4vUSo4Xqje4yA6iE5fvbAvRZMjeXHiaQwnGzTes1q','entreprise',1,'2026-03-13 16:07:16',1,NULL,NULL,'0565656565'),(39,'ahlem','ahlem','ahlem@esi-sba.dz','$2b$12$NRMKjREb1OXSUs2My8NYhO0HWIm29rdPxN8AtW4i9Ozg1n4EvXSzK','enseignant',1,'2026-03-13 16:23:01',1,NULL,NULL,'070909898'),(46,'marwa','marwa','marwa@esi-sba.dz','$2b$12$ZgC0A5HCbqOcSY1hvjDGyeI87hXYYfgOt8RFnPw3yyIQfcopJ6Y8S','etudiant',1,'2026-03-13 16:42:51',1,NULL,NULL,'0787878787'),(48,'soumia','slimane turki','s.slimaneturki@esi-sba.dz','$2b$12$u6o5in..qRGq2it2Xechqu6Qo1qH8sC1adw99JXxq.2TCfMwUSota','enseignant',1,'2026-03-13 16:45:19',1,NULL,NULL,'0676655443'),(54,'souzi','souzi','souzi@esi-sba.dz','$2b$12$KcSrBrhVkKDuBZ8U/8y9vu1LdrjmgtAhYV4S00pxDtyFkXevIzIJ6','admin',0,'2026-03-15 03:05:26',1,NULL,NULL,'787898980'),(65,'soumi','soumi','soumi@esi-sba.dz','$2b$12$ORYIn9eMEtbqFDfiOlj8KuHCsrS3GBcMgXwAOeCi890QpvlGPY68O','etudiant',0,'2026-03-17 23:09:31',1,NULL,NULL,'787898980'),(67,'sssss','sssss','s.sssss@esi-sba.dz','$2b$12$/nYKVTFYKl6HcrpDP/WUXOfqFWL.IU2VAGKvBTqTXPt3w0vInkNKe','etudiant',0,'2026-04-03 01:24:41',1,NULL,NULL,'sssss'),(68,'asmaa','asmaa','asmaa@esi-sba.dz','$2b$12$B0.oHfEafmAetdKdROcBG.AtPhcgzVASUzQ75F4bPoICOg3DQ5pL.','etudiant',1,'2026-04-13 20:12:28',1,NULL,NULL,'2222222222'),(69,'tuuuu','uuuuuuuuuuu','uu@esi-sba.dz','$2b$12$lFkw3O6n1Etp5McBpd3U/.4oAjXRU3nRGK2RO2DCEh.MqbOQg0JgC','enseignant',0,'2026-04-14 15:21:54',1,NULL,NULL,'00000000'),(70,'tttttttttttttttt','ooooooooooooo','tt@esi-sba.dz','$2b$12$JJCXXy1A8B0cgkoA2H.eG.rhQo0nYwvp.9QumbqKa3T/BlMQtaNdq','enseignant',1,'2026-04-16 16:13:29',1,NULL,NULL,'222222222'),(72,'walid','walid','walid@esi-sba.dz','$2b$12$5hzzJlJ0TsU0tvwpvcAHEubbee7lZkTrVGGYo5dd0uK6zHLXhncky','enseignant',1,'2026-04-16 19:47:45',1,NULL,NULL,NULL),(73,'fifi','fifi','fifi@esi-sba.dz','$2b$12$dDKkCJUD8yFODDWyir84JOzG1/jmRztwUEnBLme3dIkuakICUbVye','etudiant',1,'2026-04-17 20:12:15',1,NULL,NULL,'123321123'),(74,'jojo','jojo','jojo@esi-sba.dz','$2b$12$hg2LBZZhNi1xLWEZrKhdj.vr.I94oUERDkSRICOYPktBPMjkFTjKW','etudiant',1,'2026-04-20 17:27:31',1,NULL,NULL,NULL),(75,'malek','rahmoune','m.rahmoune@esi-sba.dz','$2b$12$vVG/zeL13Gw2gq7e6qIuqenunwIcRSkTAI9H8HsddW2.ZKcwZDzBu','etudiant',1,'2026-04-21 12:50:50',1,NULL,NULL,NULL),(76,'fatima','fatima','fatima@esi-sba.dz','$2b$12$K7QOws2Mkz49QLp2449yYe5rXHptGwvsiBzklvkWZl/m0L9PeWHpu','etudiant',1,'2026-04-26 15:58:00',1,NULL,NULL,'1234567890'),(77,'samila','salima','salima@esi-sba.dz','$2b$12$XYqQJ23MuHv1WdenLI5MNe16xU3elh5mdlf8O.uikEQbdEmL7m/C6','etudiant',1,'2026-04-26 16:35:49',1,NULL,NULL,NULL),(78,'latifa','latifa','latifa@esi-sba.dz','$2b$12$mkb5VHNGTS.fl4pOuRSmc.x1fBEtILEnaQhxiEITOtyoueK9txLWS','etudiant',1,'2026-04-26 17:23:25',1,NULL,NULL,NULL),(79,'messaoud','ikram','k.messaoud@esi-sba.dz','$2b$12$eKe7EZNmGSTy6QRRCDVT1.rRMtzrLT83PJnWCRxKB9IXAcYZhA3zu','etudiant',1,'2026-05-19 18:51:49',1,NULL,NULL,'0673377336'),(80,'hafsa','hafsa','hafsa@esi-sba.dz','$2b$12$Au9phoVElPy4585mGxhhgueB9ZJqSulxxAeOtpDhrVF.xAWzgrUvG','etudiant',1,'2026-05-19 19:10:29',1,NULL,NULL,NULL),(81,'maria','maria','maria@esi-sba.dz','$2b$12$N3inDRs8UqCkmzDGC.v6rO8Si8zDkjCnd7.x2i8LvW1RhS3T3cCna','etudiant',1,'2026-05-19 23:27:26',1,NULL,NULL,NULL),(82,'faiza','fazi','fazi@esi-sba.dz','$2b$12$6IP9dh6e8Q5nKoCqfe/RtuDVuQuMMJ3NL3BJMeJR6jJu.gUke8ko.','etudiant',1,'2026-05-19 23:42:24',1,NULL,NULL,NULL),(83,'zahra','zahra','zahar@esi-sba.dz','$2b$12$R9HjOoTw5.Jq/GssYHHRLeU1m5WCUZspiYlbqF2QH1GhwaRGCJiEC','etudiant',1,'2026-05-20 00:40:33',1,NULL,NULL,NULL),(84,'batoul','batoul','batoul@esi-sba.dz','$2b$12$E6l8TNmnN5f2mFijFBXoU.tqi3YP1pLMUp5ljafs4LjjjTSeNnMtC','etudiant',1,'2026-05-20 00:43:00',1,NULL,NULL,NULL),(85,'katia','katy','katy@esi-sba.dz','$2b$12$cF2yElAEzeDkEK/vy43aOuoP6Ct6m8VmsaSEO/JvkPFH5mu6hSJIS','etudiant',1,'2026-05-20 01:01:00',1,NULL,NULL,NULL),(86,'tounsi','samy','s.tounsi@esi-sba.dz','$2b$12$QZ5mWQzxXoRzB4R3c6pQT.k2RueQX2QFXsSiJCu1cbl7u3y8RhZaa','etudiant',1,'2026-05-20 08:56:02',1,NULL,NULL,NULL),(87,'vbvbbbbbbbb','bbbbbbb','b.vvv@esi-sba.dz','$2b$12$Ca.niRKi2ZoK9qd9.8gca.Kx8dhqTKxM3SvdeI6seV93v/hXf1RMi','etudiant',1,'2026-05-21 08:08:50',1,NULL,NULL,NULL),(88,'batata','batata','batata@esi-sba.dz','$2b$12$QWC0hPY8IArOMEa6LPaQ4unprTWCG0zon5BnigrSoy50V3BxmkwUO','enseignant',1,'2026-05-21 15:18:22',1,NULL,NULL,NULL),(89,'khorchef','khorchef','khorchef@esi-sba.dz','$2b$12$U405eGy49VnOLVyU/cmQhuoi9oE5tD2pGUfY3Cr.eQMhmOncv1d9u','etudiant',1,'2026-05-21 15:20:53',1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=196 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wish`
--

LOCK TABLES `wish` WRITE;
/*!40000 ALTER TABLE `wish` DISABLE KEYS */;
INSERT INTO `wish` VALUES (178,NULL,29,1,'2026-04-16 20:00:22','SUBMITTED',78),(179,NULL,28,2,'2026-04-16 20:00:22','SUBMITTED',78),(180,NULL,27,3,'2026-04-16 20:00:22','SUBMITTED',78),(181,NULL,12,4,'2026-04-16 20:00:22','SUBMITTED',78),(182,NULL,7,5,'2026-04-16 20:00:22','SUBMITTED',78),(183,NULL,6,6,'2026-04-16 20:00:22','SUBMITTED',78),(192,NULL,31,1,'2026-04-20 14:58:10','SUBMITTED',81),(193,NULL,31,1,'2026-04-20 17:31:04','SUBMITTED',83);
/*!40000 ALTER TABLE `wish` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-21 20:42:53
