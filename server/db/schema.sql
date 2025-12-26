/* 
  Polaris Database Schema v2.0 (Turso/SQLite)
  目标拆解模块 - 新架构
  
  更新说明：
  - 将原 goals 表重命名为 north_stars（北极星）
  - 新增 goals 表（季度目标）
  - 重构 projects 表
  - 新增 goal_project_relations 关联表
  - 重构 tasks 表结构
  - 新增 user_preferences 表
  - 增强 domains 表（添加 description）
  - 新增 wizard_drafts 草稿表
*/

-- ============================================
-- L1: 北极星 (North Stars)
-- ============================================
CREATE TABLE IF NOT EXISTS north_stars (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,          -- 年度愿景描述
  year INTEGER NOT NULL,        -- e.g. 2026
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================
-- L2: 季度/阶段性目标 (Goals)
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  north_star_id TEXT NOT NULL,  -- 关联北极星
  title TEXT NOT NULL,          -- 季度/阶段性目标
  target_date TEXT,             -- ISO Date "2026-03-31" (季度锚点)
  status TEXT DEFAULT 'active', -- active, completed, dropped
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (north_star_id) REFERENCES north_stars(id) ON DELETE CASCADE
);

-- ============================================
-- L3: 项目 (Projects) - 长期资产
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  primary_domain TEXT NOT NULL, -- 主域：product_design, dev, test, growth, etc.
  description TEXT,
  status TEXT DEFAULT 'active', -- active, archived, completed
  total_estimated_hours INTEGER DEFAULT 0, -- 任务估时自动汇总
  is_template INTEGER DEFAULT 0, -- SQLite: 0=false, 1=true
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================
-- 目标与项目关联表 (N:M)
-- ============================================
CREATE TABLE IF NOT EXISTS goal_project_relations (
  goal_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (goal_id, project_id),
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- L4: 任务 (Tasks) - 原子执行单元
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,        -- 冗余字段方便查询
  name TEXT NOT NULL,
  domain TEXT,                  -- 若空则继承 project.primary_domain
  estimated_hours INTEGER DEFAULT 1,
  
  -- 排序与依赖
  sequence_order INTEGER DEFAULT 0, -- 在项目内的排序 (隐式依赖)
  
  -- 执行状态
  status TEXT DEFAULT 'todo',   -- todo, in_progress, done
  scheduled_date TEXT,          -- 具体排期日期 YYYY-MM-DD
  
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================
-- 用户偏好设置
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  weekly_hours_limit INTEGER DEFAULT 40,
  max_parallel_projects INTEGER DEFAULT 3,
  granularity_preference TEXT DEFAULT 'day', -- week, day, session
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================
-- 域 (Domains) - 用户自定义域
-- ============================================
CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,           -- 域名称，如"产品设计"
  description TEXT,             -- 域描述，如"包括需求分析、原型设计等"
  color TEXT,                   -- 显示颜色 (hex)
  icon TEXT,                    -- Lucide icon name (可选)
  is_preset INTEGER DEFAULT 0,  -- SQLite: 0=false, 1=true
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================
-- 向导草稿 (Wizard Drafts)
-- ============================================
CREATE TABLE IF NOT EXISTS wizard_drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- 每用户只保留一个进行中的草稿
  current_step INTEGER DEFAULT 1, -- 当前步骤 1-5
  data TEXT NOT NULL,           -- JSON: {northStar, goals, projects, tasks, preferences}
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================
-- 索引优化
-- ============================================
CREATE INDEX IF NOT EXISTS idx_goals_north_star ON goals(north_star_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_user ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_user ON wizard_drafts(user_id);

-- ============================================
-- 预设域数据初始化脚本
-- ============================================
-- 注意：预设域应在用户首次登录时插入，user_id 为该用户的ID
/*
INSERT INTO domains (id, user_id, name, description, color, is_preset) VALUES
  ('preset_product_design', '{user_id}', '产品设计', '需求分析、原型设计、UI/UX', '#8B5CF6', 1),
  ('preset_dev', '{user_id}', '技术研发', '前端开发、后端开发、数据库', '#3B82F6', 1),
  ('preset_test', '{user_id}', '测试', '单元测试、集成测试、性能测试', '#10B981', 1),
  ('preset_growth', '{user_id}', '运营推广', '内容运营、用户增长、数据分析', '#F59E0B', 1),
  ('preset_learning', '{user_id}', '学习知识', '技术学习、行业研究', '#EF4444', 1),
  ('preset_data_analysis', '{user_id}', '数据分析', '数据采集、分析报告', '#6366F1', 1),
  ('preset_leisure', '{user_id}', '休闲娱乐', '放松、兴趣爱好', '#EC4899', 1);
*/
