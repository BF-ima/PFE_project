

-- Users table (base table for authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'enseignant', 'etudiant', 'entreprise') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Super admin table (only one record)
CREATE TABLE super_admin (
    id INT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admins table (regular admins created by super admin)
CREATE TABLE admins (
    id INT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    permissions JSON NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Enseignants (Teachers) table
CREATE TABLE enseignants (
    id INT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    specialization VARCHAR(255),
    hire_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Étudiants (Students) table
CREATE TABLE etudiants (
    id INT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    classe VARCHAR(100),
    enrollment_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Entreprises (Companies) table
CREATE TABLE entreprises (
    id INT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    registration_number VARCHAR(100),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE projects (
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(255),
 description TEXT,
 technologies TEXT,
 speciality VARCHAR(100),
 teacher_id INT,
 max_students INT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_views (
 id INT AUTO_INCREMENT PRIMARY KEY,
 student_id INT,
 project_id INT,
 viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255),
leader_id INT,
status ENUM('forming','submitted','assigned') DEFAULT 'forming',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
id INT AUTO_INCREMENT PRIMARY KEY,
team_id INT,
student_id INT,
joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishes (
id INT AUTO_INCREMENT PRIMARY KEY,
team_id INT,
project_id INT,
priority INT
);

CREATE TABLE deliverables (
id INT AUTO_INCREMENT PRIMARY KEY,
team_id INT,
title VARCHAR(255),
file_path VARCHAR(255),
version INT,
uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from enseignants
 




