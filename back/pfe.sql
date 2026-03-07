
-- =========================
-- SPECIALITY
-- =========================
CREATE TABLE speciality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    code VARCHAR(20)
);

-- =========================
-- PROMO
-- =========================
CREATE TABLE promo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    year INT,
    start_date DATE,
    end_date DATE
);

-- =========================
-- USER (Parent)
-- =========================
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    role ENUM('super_admin','admin','enseignant','etudiant','entreprise'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES user(id)
);

-- =========================
-- STUDENT
-- =========================
CREATE TABLE student (
    id INT PRIMARY KEY,
    moyenne DECIMAL(4,2),
    status ENUM('ACTIVE','GRADUATED'),
    graduation_date DATE,
    speciality_id INT,
    promo_id INT,
    FOREIGN KEY (id) REFERENCES user(id),
    FOREIGN KEY (speciality_id) REFERENCES speciality(id),
    FOREIGN KEY (promo_id) REFERENCES promo(id)
);

-- =========================
-- TEACHER
-- =========================
CREATE TABLE teacher (
    id INT PRIMARY KEY,
    grade VARCHAR(100),
    FOREIGN KEY (id) REFERENCES user(id)
);

-- =========================
-- ADMIN
-- =========================
CREATE TABLE administrator (
    id INT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES user(id)
);

-- =========================
-- SUPER ADMIN
-- =========================
CREATE TABLE super_admin (
    id INT PRIMARY KEY,
    full_name VARCHAR(200),
    permissions JSON,
    FOREIGN KEY (id) REFERENCES user(id)
);

-- =========================
-- EXTERNAL SUPERVISOR
-- =========================
CREATE TABLE external_supervisor (
    id INT PRIMARY KEY,
    organization VARCHAR(150),
    position VARCHAR(100),
    phone VARCHAR(20),
    FOREIGN KEY (id) REFERENCES user(id)
);

-- =========================
-- ROOM
-- =========================
CREATE TABLE room (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    capacity INT,
    location VARCHAR(150)
);

-- =========================
-- PROJECT
-- =========================
CREATE TABLE project (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    max_students INT,
    status ENUM('PENDING','VALIDATED','ASSIGNED','COMPLETED'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    teacher_id INT,
    external_supervisor_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id),
    FOREIGN KEY (external_supervisor_id) REFERENCES external_supervisor(id)
);

-- =========================
-- TEAM
-- =========================
CREATE TABLE team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNIQUE,
    status ENUM('FORMING','VALIDATED','COMPLETED'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id)
);

-- =========================
-- TEAM MEMBER
-- =========================
CREATE TABLE team_member (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    student_id INT,
    joined_at DATETIME,
    status ENUM('PENDING','ACCEPTED'),
    FOREIGN KEY (team_id) REFERENCES team(id),
    FOREIGN KEY (student_id) REFERENCES student(id)
);

-- =========================
-- WISH
-- =========================
CREATE TABLE wish (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    project_id INT,
    priority INT,
    submitted_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (project_id) REFERENCES project(id)
);

-- =========================
-- KEYWORD
-- =========================
CREATE TABLE keyword (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE project_keyword (
    project_id INT,
    keyword_id INT,
    PRIMARY KEY(project_id, keyword_id),
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (keyword_id) REFERENCES keyword(id)
);

-- =========================
-- TECHNOLOGY
-- =========================
CREATE TABLE technology (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    version VARCHAR(50)
);

CREATE TABLE project_technology (
    project_id INT,
    technology_id INT,
    PRIMARY KEY(project_id, technology_id),
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (technology_id) REFERENCES technology(id)
);

-- =========================
-- MEETING
-- =========================
CREATE TABLE meeting (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    date DATETIME,
    topic VARCHAR(200),
    feedback TEXT,
    status ENUM('SCHEDULED','COMPLETED'),
    FOREIGN KEY (project_id) REFERENCES project(id)
);

-- =========================
-- DELIVERABLE
-- =========================
CREATE TABLE deliverable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    title VARCHAR(200),
    file_path VARCHAR(255),
    file_type VARCHAR(50),
    version INT,
    uploaded_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES project(id)
);

-- =========================
-- EVALUATION
-- =========================
CREATE TABLE evaluation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    teacher_id INT,
    score DECIMAL(5,2),
    comments TEXT,
    created_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (teacher_id) REFERENCES teacher(id)
);

-- =========================
-- JURY
-- =========================
CREATE TABLE jury (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

-- =========================
-- JURY MEMBER
-- =========================
CREATE TABLE jury_member (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jury_id INT,
    teacher_id INT,
    role ENUM('PRESIDENT','RAPPORTEUR','MEMBER'),
    FOREIGN KEY (jury_id) REFERENCES jury(id),
    FOREIGN KEY (teacher_id) REFERENCES teacher(id)
);

-- =========================
-- SOUTENANCE
-- =========================
CREATE TABLE soutenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNIQUE,
    jury_id INT,
    room_id INT,
    date DATE,
    time TIME,
    status ENUM('SCHEDULED','COMPLETED'),
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (jury_id) REFERENCES jury(id),
    FOREIGN KEY (room_id) REFERENCES room(id)
);

-- =========================
-- SOUTENANCE RESULT
-- =========================
CREATE TABLE soutenance_result (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soutenance_id INT UNIQUE,
    grade DECIMAL(5,2),
    pv TEXT,
    submitted_at DATETIME,
    FOREIGN KEY (soutenance_id) REFERENCES soutenance(id)
);

-- =========================
-- MESSAGE
-- =========================
CREATE TABLE message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES user(id),
    FOREIGN KEY (receiver_id) REFERENCES user(id)
);

-- =========================
-- NOTIFICATION
-- =========================
CREATE TABLE notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type ENUM('INFO','ALERT','REMINDER'),
    title VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id)
);