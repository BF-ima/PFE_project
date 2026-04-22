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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement`
--

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcement` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment`
--

LOCK TABLES `assignment` WRITE;
/*!40000 ALTER TABLE `assignment` DISABLE KEYS */;
INSERT INTO `assignment` VALUES (112,76,6,'2026-04-14 22:08:55','manual');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `single_row` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deadline_settings`
--

LOCK TABLES `deadline_settings` WRITE;
/*!40000 ALTER TABLE `deadline_settings` DISABLE KEYS */;
INSERT INTO `deadline_settings` VALUES (1,'2026-04-30','00:00:00',0,0,'2026-04-16 22:07:24','2026-04-16 22:07:24');
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
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `deliverable_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliverable`
--

LOCK TABLES `deliverable` WRITE;
/*!40000 ALTER TABLE `deliverable` DISABLE KEYS */;
/*!40000 ALTER TABLE `deliverable` ENABLE KEYS */;
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
  UNIQUE KEY `uq_team_type` (`team_id`,`group_type`),
  KEY `supervisor_id` (`supervisor_id`),
  CONSTRAINT `group_conversation_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`),
  CONSTRAINT `group_conversation_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_conversation`
--

LOCK TABLES `group_conversation` WRITE;
/*!40000 ALTER TABLE `group_conversation` DISABLE KEYS */;
INSERT INTO `group_conversation` VALUES (24,57,'team',NULL,'2026-04-13 20:12:59'),(25,57,'team_supervisor',48,'2026-04-13 20:16:47'),(41,71,'team',NULL,'2026-04-14 17:50:37'),(49,76,'team',NULL,'2026-04-14 21:57:33'),(50,76,'team_supervisor',48,'2026-04-14 21:58:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_message`
--

LOCK TABLES `group_message` WRITE;
/*!40000 ALTER TABLE `group_message` DISABLE KEYS */;
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
  `date` datetime DEFAULT NULL,
  `topic` varchar(200) DEFAULT NULL,
  `feedback` text,
  `status` enum('SCHEDULED','COMPLETED') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `meeting_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting`
--

LOCK TABLES `meeting` WRITE;
/*!40000 ALTER TABLE `meeting` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (8,46,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"ai agent\" (Choice #1).',1,'2026-04-14 21:58:31'),(9,46,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"ai agent\" (Choice #1).',1,'2026-04-14 22:00:14'),(10,46,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"web app\" (Choice #2).',1,'2026-04-14 22:02:24'),(11,46,'INFO','🎉 Project Assignment Result','Your team has been assigned to the project: \"ai agent\" (Choice #1).',1,'2026-04-14 22:09:04');
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
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `external_supervisor_id` (`external_supervisor_id`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`),
  CONSTRAINT `project_ibfk_2` FOREIGN KEY (`external_supervisor_id`) REFERENCES `external_supervisor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (6,'ai agent','mini projet',4,'ASSIGNED','2026-03-22 15:44:51',48,NULL,NULL,NULL),(7,'web app','simple web site ...........',6,'VALIDATED','2026-03-22 17:20:16',48,NULL,NULL,NULL),(12,'qqqqqqqqqqqq','wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',2,'VALIDATED','2026-03-22 23:22:04',48,NULL,NULL,NULL),(13,'ttttttttttttt','gggggggggggggggggggggggggg',4,'REJECTED','2026-03-23 23:06:42',48,NULL,NULL,'jjjjjjjj'),(24,'aaaaaaa','aaaaaaaaaaaaaaaaaaa',1,'REJECTED','2026-03-24 00:55:29',48,NULL,NULL,'xxxxxxx'),(25,'lllllllllllllllllllllllllllllllllllllllllll','lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',2,'REJECTED','2026-03-24 01:37:53',48,NULL,NULL,'hhhhhhhhh'),(26,'mvmvmvmv','mnmnmnmnnnnnnnnnnnnnnnnnnnnnn',4,'REJECTED','2026-04-01 13:24:00',48,NULL,NULL,'hhhhhhhhhhh'),(27,'projet','pppppppppppppppppppppp',4,'VALIDATED','2026-04-13 20:14:27',48,NULL,NULL,NULL),(28,'ooooooo','tttttttttttttttt',3,'VALIDATED','2026-04-14 15:26:30',48,NULL,'pppppppppp',NULL),(29,'rrrrrr','tttttttttttt',3,'VALIDATED','2026-04-16 16:14:52',70,NULL,NULL,NULL);
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
INSERT INTO `student` VALUES (33,13.40,'ACTIVE',NULL,3,5),(46,17.00,'ACTIVE',NULL,5,5),(65,13.23,'ACTIVE',NULL,1,5),(67,14.00,'ACTIVE',NULL,1,6),(68,14.00,'ACTIVE',NULL,3,5);
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
  PRIMARY KEY (`id`),
  CONSTRAINT `teacher_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES (4,'AI'),(5,'isi'),(39,'ai'),(48,'ai'),(69,'aweb'),(70,'ww');
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
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team`
--

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` VALUES (54,NULL,46,'FORMING','2026-04-11 15:02:18'),(57,NULL,68,'FORMING','2026-04-13 20:12:59'),(69,NULL,46,'FORMING','2026-04-14 15:29:49'),(71,NULL,33,'FORMING','2026-04-14 17:50:37'),(74,NULL,46,'FORMING','2026-04-14 19:33:12'),(76,NULL,46,'FORMING','2026-04-14 21:57:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_member`
--

LOCK TABLES `team_member` WRITE;
/*!40000 ALTER TABLE `team_member` DISABLE KEYS */;
INSERT INTO `team_member` VALUES (93,57,68,'2026-04-13 20:12:59','ACCEPTED'),(108,71,33,'2026-04-14 17:50:37','ACCEPTED'),(113,76,46,'2026-04-14 21:57:33','ACCEPTED');
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
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,NULL,'superadmin@example.com','$2b$12$gmeIrlv3dKTtG4Z4EoU0w.fuAWT8oubmcmGItthykQVZx/6jzKJS6','super_admin',1,'2026-03-12 14:31:12',NULL,'5a82cbcc43882f00880c2a3e230db83ffb0e842a90bbe3e553c8b76640972d1e','2026-03-12 16:23:48',NULL),(4,'asmaa','babeker','a.babeker@esi-sba.dz','$2b$12$eGEZBvbL6viBU/o8QfSqhO8q9FzXSwDJijfYFm82Dj3/KJHpvshHK','enseignant',1,'2026-03-13 01:08:57',1,NULL,NULL,'0671188221'),(5,'wafaa','rahmoune','w.rahmoune@esi-sba.dz','$2b$12$qA3HgBcKTHBxARzJ8mULq.Y.MKUj36ZLIJp4VUOLHmub.0fE3ooK.','enseignant',1,'2026-03-13 01:26:45',1,NULL,NULL,'0612233445'),(33,'radjaa','turki','r.turki@esi-sba.dz','$2b$12$iiRbDM4Uz0UeUfVa7pKjLejBcxzlxGfqm/m0SfNfjZQbKV4M5yD7W','etudiant',1,'2026-03-13 16:05:34',1,NULL,NULL,'0675757575'),(34,'omar','sahnoun','o.sahnoun@esi-sba.dz','$2b$12$2xM09PRDT0lz4vUSo4Xqje4yA6iE5fvbAvRZMjeXHiaQwnGzTes1q','entreprise',1,'2026-03-13 16:07:16',1,NULL,NULL,'0565656565'),(39,'ahlem','ahlem','ahlem@esi-sba.dz','$2b$12$NRMKjREb1OXSUs2My8NYhO0HWIm29rdPxN8AtW4i9Ozg1n4EvXSzK','enseignant',1,'2026-03-13 16:23:01',1,NULL,NULL,'070909898'),(46,'marwa','marwa','marwa@esi-sba.dz','$2b$12$ZgC0A5HCbqOcSY1hvjDGyeI87hXYYfgOt8RFnPw3yyIQfcopJ6Y8S','etudiant',1,'2026-03-13 16:42:51',1,NULL,NULL,'0787878787'),(48,'soumia','slimane turki','s.slimaneturki@esi-sba.dz','$2b$12$u6o5in..qRGq2it2Xechqu6Qo1qH8sC1adw99JXxq.2TCfMwUSota','enseignant',1,'2026-03-13 16:45:19',1,NULL,NULL,'0676655443'),(54,'souzi','souzi','souzi@esi-sba.dz','$2b$12$KcSrBrhVkKDuBZ8U/8y9vu1LdrjmgtAhYV4S00pxDtyFkXevIzIJ6','admin',1,'2026-03-15 03:05:26',1,NULL,NULL,'787898980'),(65,'soumi','soumi','soumi@esi-sba.dz','$2b$12$ORYIn9eMEtbqFDfiOlj8KuHCsrS3GBcMgXwAOeCi890QpvlGPY68O','etudiant',1,'2026-03-17 23:09:31',1,NULL,NULL,'787898980'),(67,'sssss','sssss','s.sssss@esi-sba.dz','$2b$12$/nYKVTFYKl6HcrpDP/WUXOfqFWL.IU2VAGKvBTqTXPt3w0vInkNKe','etudiant',1,'2026-04-03 01:24:41',1,NULL,NULL,'sssss'),(68,'asmaa','asmaa','asmaa@esi-sba.dz','$2b$12$B0.oHfEafmAetdKdROcBG.AtPhcgzVASUzQ75F4bPoICOg3DQ5pL.','etudiant',1,'2026-04-13 20:12:28',1,NULL,NULL,'2222222222'),(69,'tuuuu','uuuuuuuuuuu','uu@esi-sba.dz','$2b$12$lFkw3O6n1Etp5McBpd3U/.4oAjXRU3nRGK2RO2DCEh.MqbOQg0JgC','enseignant',1,'2026-04-14 15:21:54',1,NULL,NULL,'00000000'),(70,'tttttttttttttttt','ooooooooooooo','tt@esi-sba.dz','$2b$12$JJCXXy1A8B0cgkoA2H.eG.rhQo0nYwvp.9QumbqKa3T/BlMQtaNdq','enseignant',1,'2026-04-16 16:13:29',1,NULL,NULL,'222222222');
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
) ENGINE=InnoDB AUTO_INCREMENT=178 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wish`
--

LOCK TABLES `wish` WRITE;
/*!40000 ALTER TABLE `wish` DISABLE KEYS */;
INSERT INTO `wish` VALUES (32,NULL,7,1,'2026-04-13 17:01:28','DRAFT',54),(33,NULL,6,2,'2026-04-13 17:01:28','DRAFT',54),(34,NULL,12,3,'2026-04-13 17:01:28','DRAFT',54),(41,NULL,27,1,'2026-04-13 20:16:01','DRAFT',57),(118,NULL,7,1,'2026-04-14 15:34:18','DRAFT',69),(119,NULL,12,2,'2026-04-14 15:34:18','DRAFT',69),(120,NULL,27,3,'2026-04-14 15:34:18','DRAFT',69),(121,NULL,28,4,'2026-04-14 15:34:18','DRAFT',69),(122,NULL,6,5,'2026-04-14 15:34:18','DRAFT',69),(139,NULL,27,1,'2026-04-14 17:53:26','DRAFT',71),(140,NULL,6,2,'2026-04-14 17:53:26','DRAFT',71),(141,NULL,12,3,'2026-04-14 17:53:26','DRAFT',71),(142,NULL,28,4,'2026-04-14 17:53:26','DRAFT',71),(153,NULL,6,1,'2026-04-14 19:33:54','DRAFT',74),(154,NULL,7,2,'2026-04-14 19:33:54','DRAFT',74),(155,NULL,12,3,'2026-04-14 19:33:54','DRAFT',74),(156,NULL,27,4,'2026-04-14 19:33:54','DRAFT',74),(157,NULL,28,5,'2026-04-14 19:33:54','DRAFT',74),(173,NULL,6,1,'2026-04-14 21:58:01','SUBMITTED',76),(174,NULL,7,2,'2026-04-14 21:58:01','SUBMITTED',76),(175,NULL,12,3,'2026-04-14 21:58:01','SUBMITTED',76),(176,NULL,27,4,'2026-04-14 21:58:01','SUBMITTED',76),(177,NULL,28,5,'2026-04-14 21:58:01','SUBMITTED',76);
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

-- Dump completed on 2026-04-16 16:30:06
