# リポジトリ構造定義書 (Repository Structure Document)

## プロジェクト構造

```
taskcli/
├── src/                          # ソースコード
│   ├── cli/                      # CLIレイヤー（ユーザー入力・表示）
│   │   ├── index.ts              # エントリポイント
│   │   └── commands/             # 各コマンド定義
│   │       ├── init.ts
│   │       ├── add.ts
│   │       ├── list.ts
│   │       ├── show.ts
│   │       ├── start.ts
│   │       ├── done.ts
│   │       ├── delete.ts
│   │       └── status.ts
│   ├── services/                 # サービスレイヤー（ビジネスロジック）
│   │   ├── TaskManager.ts
│   │   └── GitService.ts
│   ├── storage/                  # データレイヤー（永続化）
│   │   └── FileStorage.ts
│   ├── types/                    # 共有型定義
│   │   └── index.ts
│   └── utils/                    # ユーティリティ関数
│       ├── formatter.ts          # テーブル表示・カラーフォーマット
│       └── validator.ts          # 入力バリデーション
├── tests/                        # テストコード
│   ├── unit/                     # ユニットテスト
│   │   ├── services/
│   │   │   ├── TaskManager.test.ts
│   │   │   └── GitService.test.ts
│   │   ├── storage/
│   │   │   └── FileStorage.test.ts
│   │   └── utils/
│   │       ├── formatter.test.ts
│   │       └── validator.test.ts
│   ├── integration/              # 統合テスト
│   │   └── task-workflow.test.ts
│   └── e2e/                      # E2Eテスト
│       └── cli-commands.test.ts
├── docs/                         # プロジェクトドキュメント
│   ├── ideas/
│   │   └── initial-requirements.md
│   ├── product-requirements.md
│   ├── functional-design.md
│   ├── architecture.md
│   ├── repository-structure.md   # 本ドキュメント
│   ├── development-guidelines.md
│   └── glossary.md
├── dist/                         # TypeScriptビルド出力（gitignore対象）
├── .task/                        # TaskCLIデータ（gitignore対象の設定のみ）
│   └── .gitkeep
├── .steering/                    # 作業単位のドキュメント
├── package.json
├── tsconfig.json
├── jest.config.ts
├── .gitignore
└── README.md
```

---

## ディレクトリ詳細

### src/cli/ （CLIレイヤー）

**役割**: ユーザー入力の受付・パース・バリデーション、実行結果の表示

**配置ファイル**:
- `index.ts`: Commander.jsのセットアップ、コマンド登録のエントリポイント
- `commands/*.ts`: 各CLIコマンドの定義ファイル

**命名規則**:
- コマンドファイル: `kebab-case.ts`（例: `add.ts`, `list.ts`, `show.ts`）
- コマンドファイル名はCLIコマンド名と一致させる

**依存関係**:
- 依存可能: `src/services/`、`src/types/`、`src/utils/`
- 依存禁止: `src/storage/`（データレイヤーへの直接アクセス禁止）

**例**:
```
src/cli/
├── index.ts
└── commands/
    ├── init.ts      # task init
    ├── add.ts       # task add
    └── list.ts      # task list
```

---

### src/services/ （サービスレイヤー）

**役割**: ビジネスロジックの実装（タスクCRUD、ステータス管理、Git操作）

**配置ファイル**:
- `TaskManager.ts`: タスクの作成・一覧・更新・削除ロジック
- `GitService.ts`: Gitリポジトリ操作（ブランチ作成・切り替え等）

**命名規則**:
- クラスファイル: `PascalCase.ts`（例: `TaskManager.ts`, `GitService.ts`）
- クラス名とファイル名を一致させる

**依存関係**:
- 依存可能: `src/storage/`、`src/types/`、`src/utils/`
- 依存禁止: `src/cli/`（上位レイヤーへの依存禁止）

---

### src/storage/ （データレイヤー）

**役割**: `.task/tasks.json` の読み書き、バックアップ管理

**配置ファイル**:
- `FileStorage.ts`: JSONファイルの読み書き、アトミック書き込み、バックアップ

**命名規則**:
- クラスファイル: `PascalCase.ts`

**依存関係**:
- 依存可能: `src/types/`、Node.js標準モジュール（`fs`, `path`）
- 依存禁止: `src/cli/`、`src/services/`（上位レイヤーへの依存禁止）

---

### src/types/ （型定義）

**役割**: プロジェクト全体で使用する共有型定義

**配置ファイル**:
- `index.ts`: `Task`, `TaskStatus`, `TaskPriority`, `TaskStore`, `StatusChange` 等の型定義

**命名規則**:
- 型/インターフェース: `PascalCase`
- 型エイリアス: `PascalCase`

**依存関係**:
- 依存可能: なし（他のsrcファイルに依存しない）
- 全レイヤーから参照可能

---

### src/utils/ （ユーティリティ）

**役割**: 複数のレイヤーから使用される純粋関数・ヘルパー

**配置ファイル**:
- `formatter.ts`: テーブル表示のフォーマット、カラーコーディング
- `validator.ts`: 入力値のバリデーション（タイトル長チェック等）

**命名規則**:
- ファイル: `camelCase.ts`
- 関数: `camelCase`

**依存関係**:
- 依存可能: `src/types/`
- 依存禁止: `src/cli/`、`src/services/`、`src/storage/`

---

### tests/ （テストディレクトリ）

#### tests/unit/

**役割**: 個々のクラス・関数の単体テスト（外部依存をモック化）

**構造**: `src/` のディレクトリ構造を反映
```
tests/unit/
├── services/
│   ├── TaskManager.test.ts
│   └── GitService.test.ts
├── storage/
│   └── FileStorage.test.ts
└── utils/
    ├── formatter.test.ts
    └── validator.test.ts
```

**命名規則**: `[テスト対象ファイル名].test.ts`

#### tests/integration/

**役割**: 複数コンポーネントを組み合わせた統合テスト（実際のファイルシステムを使用）

**構造**:
```
tests/integration/
└── task-workflow.test.ts    # init→add→start→done のフルフロー
```

#### tests/e2e/

**役割**: 実際のCLIコマンドを実行するエンドツーエンドテスト

**構造**:
```
tests/e2e/
└── cli-commands.test.ts     # CLIコマンドの入出力・終了コード検証
```

---

### docs/ （ドキュメントディレクトリ）

**配置ドキュメント**:
- `ideas/initial-requirements.md`: 壁打ち・ブレストの成果物（更新不要）
- `product-requirements.md`: プロダクト要求定義書
- `functional-design.md`: 機能設計書
- `architecture.md`: アーキテクチャ設計書
- `repository-structure.md`: リポジトリ構造定義書（本ドキュメント）
- `development-guidelines.md`: 開発ガイドライン
- `glossary.md`: 用語集

---

## ファイル配置規則

### ソースファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|------------|--------|---------|-----|
| CLIコマンド定義 | `src/cli/commands/` | `kebab-case.ts` | `add.ts`, `list.ts` |
| サービスクラス | `src/services/` | `PascalCase.ts` | `TaskManager.ts` |
| ストレージクラス | `src/storage/` | `PascalCase.ts` | `FileStorage.ts` |
| 型定義 | `src/types/` | `index.ts` | `index.ts` |
| ユーティリティ関数 | `src/utils/` | `camelCase.ts` | `formatter.ts` |

### テストファイル

| テスト種別 | 配置先 | 命名規則 | 例 |
|-----------|--------|---------|-----|
| ユニットテスト | `tests/unit/[対応ディレクトリ]/` | `[対象].test.ts` | `TaskManager.test.ts` |
| 統合テスト | `tests/integration/` | `[機能]-[対象].test.ts` | `task-workflow.test.ts` |
| E2Eテスト | `tests/e2e/` | `[シナリオ].test.ts` | `cli-commands.test.ts` |

### 設定ファイル（プロジェクトルート）

| ファイル | 用途 |
|---------|------|
| `package.json` | パッケージ定義・スクリプト |
| `tsconfig.json` | TypeScriptコンパイラ設定 |
| `jest.config.ts` | Jestテスト設定 |
| `.gitignore` | Git除外設定 |

---

## 命名規則

### ディレクトリ名
- レイヤーディレクトリ: 複数形、`kebab-case`（例: `services/`, `commands/`）
- 機能ディレクトリ: 単数形、`kebab-case`

### ファイル名
- クラスファイル: `PascalCase.ts`（例: `TaskManager.ts`, `FileStorage.ts`）
- ユーティリティ関数ファイル: `camelCase.ts`（例: `formatter.ts`, `validator.ts`）
- CLIコマンドファイル: `kebab-case.ts`（例: `add.ts`, `show.ts`）
- テストファイル: `[対象].test.ts`

### コード内命名規則
- クラス名: `PascalCase`
- 関数・メソッド名: `camelCase`
- 定数: `UPPER_SNAKE_CASE`
- 型・インターフェース: `PascalCase`（例: `TaskStatus`, `CreateTaskInput`）
- 型エイリアス: `PascalCase`

---

## 依存関係のルール

### レイヤー間の依存

```
CLIレイヤー（src/cli/）
    ↓ 依存OK
サービスレイヤー（src/services/）
    ↓ 依存OK
データレイヤー（src/storage/）
```

全レイヤーから参照可能:
- `src/types/`（型定義）
- `src/utils/`（ユーティリティ）

**禁止される依存**:
- `src/storage/` → `src/services/` ❌
- `src/storage/` → `src/cli/` ❌
- `src/services/` → `src/cli/` ❌

### 循環依存の禁止

```typescript
// ❌ 禁止: 循環依存
// TaskManager.ts
import { FileStorage } from '../storage/FileStorage';
// FileStorage.ts
import { TaskManager } from '../services/TaskManager'; // 循環依存！

// ✅ 正しい: 共通の型定義を src/types/ に配置
// types/index.ts
export interface Task { /* ... */ }
// TaskManager.ts
import { Task } from '../types';
// FileStorage.ts
import { Task } from '../types';
```

---

## 特殊ディレクトリ

### .steering/ （ステアリングファイル）

**役割**: 特定の開発作業における「今回何をするか」を定義

**構造**:
```
.steering/
└── [YYYYMMDD]-[task-name]/
    ├── requirements.md    # 今回の作業の要求内容
    ├── design.md          # 変更内容の設計
    └── tasklist.md        # タスクリスト
```

**命名規則**: `20250115-add-user-profile` 形式

### .claude/ （Claude Code設定）

**役割**: Claude Code設定とカスタマイズ

**構造**:
```
.claude/
├── skills/                # 各種スキル定義
└── agents/                # サブエージェント定義
```

---

## 除外設定（.gitignore）

```gitignore
# ビルド出力
dist/

# パッケージ
node_modules/

# TypeScript
*.tsbuildinfo

# テストカバレッジ
coverage/

# ログ
*.log

# OS
.DS_Store

# TaskCLIの設定（トークンが含まれる可能性）
.task/config.json

# バックアップ
.task/backup/

# 作業ファイル
.steering/

# その他
*.tmp
```

---

## スケーリング戦略

### 機能の追加

| 規模 | 方針 | 例 |
|------|------|-----|
| 小規模（コマンド追加） | 既存ディレクトリに配置 | `src/cli/commands/archive.ts` |
| 中規模（GitHub連携） | サービスレイヤーに新クラス追加 | `src/services/GitHubService.ts` |
| 大規模（チーム機能） | サブディレクトリで分離 | `src/services/team/` |

### ファイルサイズの管理

- 1ファイル300行以下を推奨
- 300〜500行: リファクタリングを検討
- 500行以上: 責務ごとに分割
