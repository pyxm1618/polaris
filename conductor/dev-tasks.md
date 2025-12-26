# 目标拆解模块 - 开发任务清单

> 创建日期：2025-12-26
> 预估总工时：**80-100小时**

## 开发优先级说明

| 优先级 | 说明 |
|-------|------|
| P0 | 核心基础设施，阻塞后续开发 |
| P1 | 主流程必须，MVP必需 |
| P2 | 体验增强，可后续迭代 |

---

## Phase 1: 基础设施层 (P0)

### 1.1 数据库迁移
- [ ] 创建 `north_stars` 表
- [ ] 创建 `goals` 表
- [ ] 创建 `projects` 表 (新增 `primary_domain`)
- [ ] 创建 `goal_project_relations` 关联表
- [ ] 创建 `tasks` 表 (新结构)
- [ ] 创建 `user_preferences` 表
- [ ] 创建 `domains` 表
- [ ] 创建 `wizard_drafts` 草稿表

**估时**：4h | **依赖**：无

### 1.2 智谱GLM接口封装
- [ ] 创建 `/server/utils/glm.ts` 封装类
- [ ] 实现通用 System Prompt 模板
- [ ] 实现 JSON 输出解析
- [ ] 错误处理与重试机制

**估时**：4h | **依赖**：无

---

## Phase 2: API层 (P1)

### 2.1 AI辅助接口
- [ ] `POST /api/wizard/ai/clarify` 愿景澄清
- [ ] `POST /api/wizard/ai/suggest-goals` 目标建议
- [ ] `POST /api/wizard/ai/generate-tasks` 任务生成
- [ ] `POST /api/wizard/ai/recommend-projects` 项目推荐

**估时**：8h | **依赖**：1.2

### 2.2 草稿管理接口
- [ ] `GET /api/wizard/draft` 获取草稿
- [ ] `PUT /api/wizard/draft` 保存草稿
- [ ] `DELETE /api/wizard/draft` 删除草稿

**估时**：3h | **依赖**：1.1

### 2.3 核心CRUD接口
- [ ] `GET/POST /api/projects`
- [ ] `GET/POST /api/domains`
- [ ] `POST /api/tasks`
- [ ] `PUT /api/tasks/:id/reorder`
- [ ] `POST /api/wizard/save` 完整保存

**估时**：6h | **依赖**：1.1

### 2.4 可行性分析接口
- [ ] `GET /api/analysis/feasibility` 计算总工时vs可用时间

**估时**：3h | **依赖**：2.3

---

## Phase 3: UI层 - 向导流程 (P1)

### 3.1 向导框架
- [ ] 步骤条组件 (Stepper)
- [ ] 草稿恢复弹窗
- [ ] 状态管理 (Pinia store)
- [ ] 自动保存Hook

**估时**：6h | **依赖**：2.2

### 3.2 Step1 战略定向
- [ ] 北极星输入框
- [ ] AI思考动画
- [ ] 澄清问题气泡
- [ ] 目标卡片选择器

**估时**：8h | **依赖**：3.1, 2.1

### 3.3 Step2 项目映射
- [ ] Goals列表组件
- [ ] Projects卡片墙
- [ ] 关联交互
- [ ] AI推荐弹出菜单
- [ ] 项目搜索/新建

**估时**：10h | **依赖**：3.1, 2.1, 2.3

### 3.4 Step3 任务拆解 ⭐核心
- [ ] 双栏布局框架
- [ ] 任务编辑器（左侧）
  - [ ] 按模块分组显示
  - [ ] 拖拽排序
  - [ ] 估时编辑
  - [ ] 总估时统计
- [ ] AI助手侧边栏（右侧）
  - [ ] 聊天输入
  - [ ] 功能推荐卡片

**估时**：16h | **依赖**：3.1, 2.1, 2.3

### 3.5 Step4 现实校验
- [ ] 仪表盘组件
- [ ] 工时对比可视化
- [ ] 参数调节滑块
- [ ] AI建议展示

**估时**：8h | **依赖**：3.1, 2.4

### 3.6 Step5 启航
- [ ] 规划总览
- [ ] 确认保存
- [ ] 跳转驾驶舱

**估时**：4h | **依赖**：3.1, 2.3

---

## Phase 4: 增强功能 (P2)

### 4.1 域管理
- [ ] 域列表页
- [ ] 自定义域创建

**估时**：3h

### 4.2 冲突调整AI
- [ ] 调用场景5 Prompt
- [ ] 方案展示UI

**估时**：4h

---

## 工时汇总

| Phase | 内容 | 估时 |
|-------|-----|-----|
| Phase 1 | 基础设施 | 8h |
| Phase 2 | API层 | 20h |
| Phase 3 | UI层 | 52h |
| Phase 4 | 增强功能 | 7h |
| **合计** | | **87h** |

---

## 建议开发顺序

```
Week 1: Phase 1 全部 + Phase 2.1-2.2
Week 2: Phase 2.3-2.4 + Phase 3.1-3.2
Week 3: Phase 3.3-3.4
Week 4: Phase 3.5-3.6 + Phase 4
```
