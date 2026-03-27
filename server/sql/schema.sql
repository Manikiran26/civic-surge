CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(255),
  role VARCHAR(32) NOT NULL DEFAULT 'citizen',
  home_location POINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) NOT NULL PRIMARY KEY,
  external_id VARCHAR(120) UNIQUE,
  name VARCHAR(240) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(120) NOT NULL,
  location_label VARCHAR(200),
  geo_precision VARCHAR(120) DEFAULT 'point',
  description TEXT,
  project_type VARCHAR(80) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'unknown',
  budget_amount DECIMAL(16, 2),
  budget_currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  budget_display VARCHAR(80) DEFAULT 'unknown',
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  timeline_display VARCHAR(160) DEFAULT 'unknown',
  completion_percent DECIMAL(5, 2),
  impact TEXT,
  source_name VARCHAR(120) NOT NULL,
  source_url TEXT NOT NULL,
  source_date DATETIME NULL,
  latitude DECIMAL(9, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,
  geofence_radius_m INT NOT NULL DEFAULT 1500,
  location POINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  SPATIAL INDEX idx_projects_location (location),
  INDEX idx_projects_status (status),
  INDEX idx_projects_type (project_type),
  INDEX idx_projects_external_id (external_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36),
  project_id CHAR(36),
  title VARCHAR(240) NOT NULL,
  body TEXT NOT NULL,
  channel VARCHAR(32) NOT NULL DEFAULT 'in_app',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_project_id (project_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) NOT NULL PRIMARY KEY,
  project_id CHAR(36),
  user_id CHAR(36),
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  attachment_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reports_status (status),
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB;
