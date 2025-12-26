# 目标拆解模块 - 技术架构设计

## 1. 数据库 Schema 设计 (Turso/SQLite)

基于 `libSQL`，所有 ID 建议使用 UUIDv4。

### 1.1 Goals / NorthStar
```sql
CREATE TABLE north_stars (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,          -- 年度愿景描述
  year INTEGER NOT NULL,        -- e.g. 2026
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  north_star_id TEXT NOT NULL,  -- 关联L1
  title TEXT NOT NULL,          -- 季度/阶段性目标
  target_date TEXT,             -- ISO Date "2026-03-31" (用于季度锚点)
  status TEXT DEFAULT 'active', -- active, completed, dropped
  created_at INTEGER NOT NULL,
  FOREIGN KEY (north_star_id) REFERENCES north_stars(id)
);
```

### 1.2 Projects (长期资产)
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  primary_domain TEXT NOT NULL, -- 预设: dev, design, growth, etc.
  description TEXT,
  status TEXT DEFAULT 'active', -- active, archived, completed
  total_estimated_hours INTEGER DEFAULT 0, -- 任务估时自动汇总
  is_template BOOLEAN DEFAULT 0, -- 是否为预设模版项目
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 关联表: 目标与项目的多对多关系
CREATE TABLE goal_project_relations (
  goal_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  PRIMARY KEY (goal_id, project_id),
  FOREIGN KEY (goal_id) REFERENCES goals(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### 1.3 Tasks (原子执行单元)
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,        -- 冗余字段方便查询
  name TEXT NOT NULL,
  domain TEXT,                  -- 若空则继承project.primary_domain
  estimated_hours INTEGER DEFAULT 1,
  
  -- 排序与依赖
  sequence_order INTEGER DEFAULT 0, -- 在项目内的排序 (隐式依赖)
  
  -- 执行状态
  status TEXT DEFAULT 'todo',   -- todo, in_progress, done
  scheduled_date TEXT,          -- 具体排期日期 YYYY-MM-DD
  
  created_at INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### 1.4 User Preferences
```sql
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  weekly_hours_limit INTEGER DEFAULT 40,
  max_parallel_projects INTEGER DEFAULT 3,
  granularity_preference TEXT DEFAULT 'day', -- week, day, session
  updated_at INTEGER NOT NULL
);
```

### 1.5 Domains (用户自定义域)
```sql
CREATE TABLE domains (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,           -- 域名称，如"产品设计"
  description TEXT,             -- 域描述，如"包括需求分析、原型设计等"
  color TEXT,                   -- 可选：显示颜色 (hex)
  is_preset BOOLEAN DEFAULT 0,  -- 是否为系统预设域
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 预设域枚举 (用于UI展示和数据初始化)
-- product_design, dev, test, growth, learning, data_analysis, leisure
```

### 1.6 Wizard Drafts (向导草稿)
```sql
CREATE TABLE wizard_drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- 每用户只保留一个进行中的草稿
  current_step INTEGER DEFAULT 1, -- 当前步骤 1-5
  data TEXT NOT NULL,           -- JSON: {northStar, goals, projects, tasks, preferences}
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

---

## 2. API 接口设计 (Nuxt Server Routes)

### 2.1 Wizard 流程接口
| Method | Path | Description | Payload |
|--------|------|-------------|---------|
| POST | `/api/wizard/ai/clarify` | 场景1：愿景澄清 | `{ northStar }` |
| POST | `/api/wizard/ai/suggest-goals` | 场景2：目标建议 | `{ northStar, clarification }` |
| POST | `/api/wizard/ai/recommend-projects` | 场景6：项目推荐 | `{ goalTitle, existingProjects }` |
| POST | `/api/wizard/ai/generate-tasks` | 场景3：任务生成 | `{ project, deliverable, features, granularity }` |
| POST | `/api/wizard/save` | 保存完整规划 | `{ NorthStar, Goals, Projects, Tasks }` |

### 2.2 草稿管理接口
| Method | Path | Description | Payload |
|--------|------|-------------|---------|
| GET | `/api/wizard/draft` | 获取当前用户草稿 | - |
| PUT | `/api/wizard/draft` | 保存/更新草稿 | `{ currentStep, data }` |
| DELETE | `/api/wizard/draft` | 删除草稿（确认后） | - |

### 2.3 核心 CRUD
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | 获取项目列表 (支持搜索) |
| POST | `/api/projects` | 创建项目 |
| GET | `/api/domains` | 获取域列表（含预设+自定义）|
| POST | `/api/domains` | 创建自定义域 |
| POST | `/api/tasks` | 创建/追加任务 |
| PUT | `/api/tasks/:id/reorder` | 调整任务顺序 |
| GET | `/api/analysis/feasibility` | 可行性计算 |

---

## 3. UI 交互设计 (Wizard Flow)

采用 **全屏沉浸式步骤条 (Stepper)** 设计。

### 草稿恢复机制
- **进入逻辑**: 用户点击"开始规划"时，先检查是否有未完成草稿
- **恢复弹窗**: 如有草稿，显示"检测到未完成的规划，是否继续？"
  - "继续规划" → 跳转到 `current_step`，恢复所有数据
  - "重新开始" → 删除草稿，从 Step 1 开始
- **自动保存**: 每步完成后自动调用 `PUT /api/wizard/draft` 保存进度

### Step 1: 战略定向 (Strategy)
- **UI**: 居中大输入框 "你的年度北极星是什么？"
- **Interaction**: 输入后，AI loading 气泡浮现，展示"我在思考..."，随后可能弹出澄清问题气泡，或直接展示建议的 Goals 卡片供用户勾选。

### Step 2: 项目映射 (Mapping)
- **UI**: 左侧是 Goals 列表，右侧是关联的 Projects 卡片墙。
- **Interaction**: 
  - 点击 Goal，右侧高亮关联 Project
  - 点击 "+添加支撑项目"，弹出菜单：
    1. **AI推荐** (优先展示) - 调用场景6 Prompt
    2. **搜索已有项目** - 关键词搜索
    3. **创建新项目** - 弹出项目创建表单

### Step 3: 任务拆解 (Decomposition) - **重头戏**
- **Layout**: 双栏布局。
    - **左侧 (70%)**: 任务编辑器。按 "功能模块" 分组的列表。支持拖拽排序、点击编辑估时。
    - **右侧 (30%)**: AI 助手 (Chat + Suggestions)。
- **Interaction**: 
    - 顶部选择 "交付物类型"。
    - 助手栏推荐 "常见功能"，点击即添加到左侧。
    - 左侧列表实时显示 "总估时"，并有进度条暗示 "复杂度"。

### Step 4: 现实校验 (Reality Check)
- **UI**: 仪表盘样式。
    - "你的计划需要：2400小时" vs "你的可用时间：2000小时"。
    - 红色警示区域。
- **Interaction**: 调整下方的 "每周投入滑块" 或 "并行项目数"，实时看仪表盘变化。
- **AI Suggestion**: 底部弹出 "建议方案：将项目C延后至Q3"。

### Step 5: 启航 (Launch)
- **UI**: 生成一份漂亮的 "Manifesto" (宣言) 海报，列出北极星和首月行动计划。
- **Action**: "进入驾驶舱"。
