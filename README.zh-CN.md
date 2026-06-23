# Code Mentor

Code Mentor 是一个本地优先的代码知识点讲解助手。MVP 主要帮助用户理解 Python、C++、SQL 和算法相关知识点，提供结构化讲解、示例、概念对比、追问、笔记和复习状态。

这个项目第一版不以刷题为核心，而是以“把一个知识点讲清楚”为核心。

核心流程：

```text
输入学习意图
-> 生成结构化知识点讲解
-> 在专注阅读页查看内容
-> 针对知识点追问、换说法、举例或对比
-> 本地保存笔记、收藏和复习状态
```

## 技术栈

- 前端：React、Vite、TypeScript、React Router、Vitest
- 后端：FastAPI、SQLModel、SQLite、Pydantic、pytest
- LLM：DeepSeek OpenAI-compatible API
- 存储：本地 SQLite
- 账号系统：MVP 不做账号和权限

## 项目结构

```text
.
|-- backend/                 # FastAPI 后端
|   |-- app/
|   |   |-- api/             # FastAPI 路由，保持薄层
|   |   |-- db/              # SQLite engine/session/init
|   |   |-- llm/             # DeepSeek client、PromptBuilder、ContextBuilder
|   |   |-- models/          # SQLModel 数据表
|   |   |-- schemas/         # Pydantic 请求/响应 schema
|   |   `-- services/        # 业务逻辑
|   |-- tests/               # pytest 测试
|   `-- pyproject.toml
|-- docs/
|   |-- api-contract.md      # 前后端共享接口契约
|   |-- backend-design.md    # 后端设计说明
|   `-- frontend-design.md   # 前端设计说明
`-- frontend/                # React 前端
    |-- src/
    |   |-- api/             # typed API client 和契约类型
    |   |-- test/            # 测试 fixture 和 fetch mock
    |   |-- App.tsx
    |   `-- styles.css
    |-- package.json
    `-- vite.config.ts
```

## 环境要求

- Python 3.11+
- Node.js 20+
- npm

## 后端启动

在项目根目录执行：

```powershell
cd backend
python -m pip install -e .[dev]
```

运行测试：

```powershell
python -m pytest
```

启动 API 服务：

```powershell
python -m uvicorn app.main:app --reload
```

默认后端地址：

```text
http://localhost:8000
```

## 前端启动

在项目根目录执行：

```powershell
cd frontend
npm.cmd install
```

运行测试：

```powershell
npm.cmd test -- --run
```

构建：

```powershell
npm.cmd run build
```

启动开发服务器：

```powershell
npm.cmd run dev
```

默认前端地址：

```text
http://localhost:5173
```

前端默认请求：

```text
http://localhost:8000/api
```

如需覆盖 API 地址：

```powershell
$env:VITE_API_BASE_URL="http://localhost:8000/api"
```

## DeepSeek 配置

后端通过 DeepSeek OpenAI-compatible API 调用模型。

配置环境变量：

```powershell
$env:DEEPSEEK_API_KEY="your_key"
$env:DEEPSEEK_BASE_URL="https://api.deepseek.com"
$env:DEEPSEEK_MODEL="deepseek-v4-flash"
```

也可以直接编辑本地后端配置文件：

```text
backend/.env
```

`backend/.env.example` 是模板文件。`backend/.env` 已被 git 忽略，不会提交真实 API key。

测试默认使用 fake LLM，不需要真实 DeepSeek API key。

## 主要 API

完整接口契约见：

[docs/api-contract.md](docs/api-contract.md)

核心接口：

- `POST /api/lessons`
- `GET /api/lessons/{id}`
- `GET /api/lessons?limit=20`
- `PATCH /api/lessons/{id}`
- `POST /api/lessons/{id}/actions`
- `POST /api/lessons/{id}/ask`
- `POST /api/notes`
- `GET /api/notes?lesson_id=...`
- `GET /api/profile`

## 设计原则

- 本地优先，MVP 只服务单用户。
- `Lesson` 是核心资源，不把系统设计成普通聊天应用。
- Lesson 内容使用结构化 JSON，不存整段 Markdown。
- FastAPI router 保持薄层，业务逻辑放在 services。
- LLM 调用必须通过 `LLMClient`。
- Prompt 拼接集中在 `PromptBuilder` 和 `ContextBuilder`。
- 预留未来流式输出和 RAG 的扩展点，但 MVP 不实现。
- 前端快捷操作放在标题区域，不遮挡正文阅读。

## 验证命令

后端测试：

```powershell
cd backend
python -m pytest
```

前端测试：

```powershell
cd frontend
npm.cmd test -- --run
```

前端构建：

```powershell
cd frontend
npm.cmd run build
```

## MVP 限制

- 不做用户账号。
- 不做流式输出。
- 不做 RAG 或文档上传。
- 不做代码执行沙箱。
- 不做多用户数据隔离。

这些限制是第一版的主动取舍，目的是先把本地知识点讲解闭环做稳定。
