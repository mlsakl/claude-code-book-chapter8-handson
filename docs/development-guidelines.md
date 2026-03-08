# 開発ガイドライン (Development Guidelines)

## コーディング規約

### 命名規則

#### 変数・関数

```typescript
// ✅ 良い例
const taskList = loadTasks();
function createBranchName(taskId: string, title: string): string { }
const isGitRepository = await gitService.isGitRepository();

// ❌ 悪い例
const data = load();
function make(id: string, t: string): string { }
const flag = await check();
```

**原則**:
- 変数: `camelCase`、名詞または名詞句
- 関数・メソッド: `camelCase`、動詞で始める（`create`, `get`, `update`, `delete`, `load`, `save`, `check`, `validate`）
- 定数: `UPPER_SNAKE_CASE`（例: `MAX_TASK_COUNT`, `DEFAULT_PRIORITY`）
- Boolean値: `is`, `has`, `should` で始める

#### クラス・インターフェース・型

```typescript
// クラス: PascalCase、名詞
class TaskManager { }
class GitService { }
class FileStorage { }

// インターフェース: PascalCase（I接頭辞なし）
interface Task { }
interface CreateTaskInput { }
interface ListFilter { }

// 型エイリアス: PascalCase
type TaskStatus = 'open' | 'in_progress' | 'completed' | 'archived';
type TaskPriority = 'high' | 'medium' | 'low';
```

### コードフォーマット

**インデント**: 2スペース

**行の長さ**: 最大100文字

**セミコロン**: あり

**クォート**: シングルクォート（`'`）

**例**:
```typescript
// ✅ 良い例
export class TaskManager {
  constructor(private readonly storage: FileStorage) {}

  createTask(input: CreateTaskInput): Task {
    const task: Task = {
      id: uuidv4(),
      title: input.title,
      status: 'open',
      priority: input.priority ?? 'medium',
      statusHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return task;
  }
}
```

### コメント規約

**JSDoc（公開APIに記述）**:
```typescript
/**
 * タスクを作成して永続化する
 *
 * @param input - タスク作成に必要な入力データ
 * @returns 作成されたタスク
 * @throws {ValidationError} タイトルが1〜200文字でない場合
 */
createTask(input: CreateTaskInput): Task { }
```

**インラインコメント（なぜそうするかを説明）**:
```typescript
// ✅ 良い例: 理由を説明
// アトミック書き込みのため一時ファイルを使用し、リネームで置き換える
fs.renameSync(tmpPath, targetPath);

// ❌ 悪い例: コードを見れば分かることを書く
// ファイルをリネームする
fs.renameSync(tmpPath, targetPath);
```

### 型安全性

**`any` の使用禁止**:
```typescript
// ❌ 禁止
function parseData(data: any): any { }

// ✅ 正しい
function parseData(data: unknown): Task {
  if (!isTask(data)) throw new ValidationError('Invalid data');
  return data;
}
```

**型アサション（`as`）は最小限に**:
```typescript
// ❌ 避ける
const task = data as Task;

// ✅ 型ガードを使う
function isTask(value: unknown): value is Task {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

### エラーハンドリング

**カスタムエラークラス**:
```typescript
// src/types/errors.ts
export class TaskCLIError extends Error {
  constructor(message: string, public readonly code: number = 1) {
    super(message);
    this.name = 'TaskCLIError';
  }
}

export class TaskNotFoundError extends TaskCLIError {
  constructor(id: string) {
    super(`タスクが見つかりません (ID: ${id})`);
    this.name = 'TaskNotFoundError';
  }
}

export class ValidationError extends TaskCLIError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class GitError extends TaskCLIError {
  constructor(message: string) {
    super(message, 2);
    this.name = 'GitError';
  }
}
```

**エラーハンドリングのパターン**:
```typescript
// CLIレイヤーでエラーをキャッチし、適切に表示
try {
  const task = taskManager.getTask(id);
  console.log(formatTask(task));
} catch (error) {
  if (error instanceof TaskNotFoundError) {
    console.error(chalk.red(`エラー: ${error.message}`));
    process.exit(1);
  } else if (error instanceof ValidationError) {
    console.error(chalk.red(`エラー: ${error.message}`));
    process.exit(1);
  } else {
    console.error(chalk.red('予期しないエラーが発生しました'));
    throw error; // 未知のエラーは上位に伝播
  }
}
```

---

## Git運用ルール

### ブランチ戦略

TaskCLI自体の開発では以下のブランチ戦略を使用する:

**ブランチ種別**:
- `main`: リリース可能な状態（直接コミット禁止）
- `develop`: 開発の最新状態
- `feature/[機能名]`: 新機能開発
- `fix/[修正内容]`: バグ修正
- `refactor/[対象]`: リファクタリング
- `docs/[ドキュメント名]`: ドキュメント更新

**フロー**:
```
main
  └─ develop
      ├─ feature/task-crud
      ├─ feature/git-integration
      └─ fix/file-storage-atomic-write
```

> **注**: TaskCLIで管理するプロジェクトのブランチは `feature/task-<id>-<title>` 形式（TaskCLI自動生成）

### コミットメッセージ規約

**フォーマット（Conventional Commits）**:
```
<type>(<scope>): <subject>

<body>（任意）

<footer>（任意）
```

**Type**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（フォーマット等）
- `refactor`: リファクタリング
- `test`: テストの追加・修正
- `chore`: ビルド、補助ツールの変更

**Scope（TaskCLIのコンポーネント）**:
- `cli`: CLIレイヤー
- `task`: TaskManager
- `git`: GitService
- `storage`: FileStorage
- `types`: 型定義
- `utils`: ユーティリティ

**例**:
```
feat(task): タスクのGitブランチ自動連携を実装

task start コマンドでタスクIDとタイトルから
feature/task-<id>-<title> 形式のブランチを自動作成・切り替えする。

- GitServiceクラスを新規追加
- createAndCheckoutBranch メソッドを実装
- task startコマンドにGitサービスを統合

Closes #12
```

### プルリクエストプロセス

**作成前チェックリスト**:
- [ ] `npm test` が全てパス
- [ ] `npm run lint` でエラーなし
- [ ] `npm run typecheck` でエラーなし
- [ ] セルフレビュー完了

**PRテンプレート**（`.github/pull_request_template.md`）:
```markdown
## 概要
[変更内容の簡潔な説明]

## 変更理由
[なぜこの変更が必要か]

## 変更内容
- [変更点1]
- [変更点2]

## テスト
- [ ] ユニットテスト追加・更新
- [ ] 統合テスト確認
- [ ] 手動テスト実施

## 関連Issue
Closes #[Issue番号]
```

**レビュープロセス**:
1. セルフレビュー
2. CI自動テスト実行（GitHub Actions）
3. レビュアーアサイン（最低1名）
4. フィードバック対応
5. 承認後、`develop` にSquash Merge

---

## テスト戦略

### テストピラミッド

```
        /E2E\          ← 少数（主要シナリオのみ）
       /統合テスト\     ← 中程度（レイヤー間の連携）
      /ユニットテスト\  ← 多数（全クラス・関数）
```

### カバレッジ目標

- **ユニットテスト**: 80%以上（`src/services/`, `src/storage/`, `src/utils/`）
- **統合テスト**: 主要フローをカバー
- **E2Eテスト**: 基本コマンド（add/list/show/start/done/delete）

### ユニットテスト

**ファイル配置**: `tests/unit/[対象ファイルと同構造].test.ts`

**テスト命名**: `[条件]_[期待結果]` または 日本語の説明文

```typescript
describe('TaskManager', () => {
  describe('createTask', () => {
    it('有効な入力でタスクを作成できる', () => {
      const storage = createMockStorage();
      const manager = new TaskManager(storage);

      const task = manager.createTask({ title: 'テストタスク' });

      expect(task.id).toMatch(/^[0-9a-f-]{36}$/); // UUID形式
      expect(task.title).toBe('テストタスク');
      expect(task.status).toBe('open');
      expect(task.priority).toBe('medium');
    });

    it('空のタイトルでValidationErrorをスローする', () => {
      const manager = new TaskManager(createMockStorage());

      expect(() => manager.createTask({ title: '' }))
        .toThrow(ValidationError);
    });

    it('200文字超のタイトルでValidationErrorをスローする', () => {
      const manager = new TaskManager(createMockStorage());
      const longTitle = 'a'.repeat(201);

      expect(() => manager.createTask({ title: longTitle }))
        .toThrow(ValidationError);
    });
  });
});
```

**モックの使い方**:
```typescript
// FileStorageをモック化（ユニットテスト）
function createMockStorage(): FileStorage {
  return {
    load: jest.fn().mockReturnValue({ version: '1.0.0', tasks: [] }),
    save: jest.fn(),
    isInitialized: jest.fn().mockReturnValue(true),
    initialize: jest.fn(),
    createBackup: jest.fn().mockReturnValue('.task/backup/tasks.json.bak'),
  } as unknown as FileStorage;
}
```

### 統合テスト

実際のファイルシステムを使用し、テスト後にクリーンアップ:

```typescript
describe('タスク操作フロー', () => {
  let tmpDir: string;
  let storage: FileStorage;
  let manager: TaskManager;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskcli-test-'));
    storage = new FileStorage(tmpDir);
    storage.initialize();
    manager = new TaskManager(storage);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('タスクを作成・取得・更新・削除できる', () => {
    const created = manager.createTask({ title: '統合テスト' });
    const found = manager.getTask(created.id);
    expect(found.title).toBe('統合テスト');

    const updated = manager.updateStatus(created.id, 'in_progress');
    expect(updated.status).toBe('in_progress');

    manager.deleteTask(created.id);
    expect(() => manager.getTask(created.id)).toThrow(TaskNotFoundError);
  });
});
```

### E2Eテスト

```typescript
import { execSync } from 'child_process';

describe('CLI E2E', () => {
  it('task add でタスクを追加できる', () => {
    const output = execSync('node dist/cli/index.js add "E2Eテスト"', {
      cwd: tmpDir,
    }).toString();

    expect(output).toContain('タスクを作成しました');
  });
});
```

---

## コードレビュー基準

### レビューポイント

**機能性**:
- [ ] PRDの要件・受け入れ条件を満たしているか
- [ ] エッジケースが考慮されているか（空文字、null、境界値）
- [ ] エラーハンドリングが適切か

**可読性**:
- [ ] 命名が本ガイドラインの規則に従っているか
- [ ] 複雑なロジックにコメントがあるか
- [ ] 1関数が1つの責務に集中しているか（30行以下を目安）

**保守性**:
- [ ] 重複コードがないか（DRY原則）
- [ ] レイヤー間の依存ルールを守っているか
- [ ] ファイルサイズが300行以下か

**セキュリティ**:
- [ ] GitHubトークン等の機密情報がハードコードされていないか
- [ ] ユーザー入力をバリデーションしているか
- [ ] `path.join()` を使ってパストラバーサルを防いでいるか

### レビューコメントの書き方

**優先度を明示する**:
- `[必須]`: マージブロッカー（バグ、セキュリティ問題）
- `[推奨]`: 修正を推奨（可読性、保守性）
- `[提案]`: 検討を促す（将来的な改善案）
- `[質問]`: 理解のための確認

**例**:
```markdown
[必須] GitHubトークンが環境変数でなくコードに直接書かれています。
`.task/config.json` または環境変数 `TASKCLI_GITHUB_TOKEN` で管理してください。

[推奨] この関数は50行あり、責務が多すぎます。
バリデーションと永続化を別メソッドに分割することを検討してください。

[提案] 将来的にSQLiteに移行する際に、ここをインターフェース化しておくと
差し替えが楽になります。今はそのままで問題ありません。
```

---

## 開発環境セットアップ

### 必要なツール

| ツール | バージョン | インストール方法 |
|--------|-----------|-----------------|
| Node.js | v18.0.0以上（v24.11.0推奨） | [nodejs.org](https://nodejs.org/) |
| npm | 11.x | Node.jsに同梱 |
| Git | 2.x以上 | [git-scm.com](https://git-scm.com/) |

### セットアップ手順

```bash
# 1. リポジトリのクローン
git clone <URL>
cd taskcli

# 2. 依存関係のインストール
npm install

# 3. TypeScriptのビルド
npm run build

# 4. グローバルリンク（開発用）
npm link

# 5. 動作確認
task --version
task --help
```

### npm スクリプト

```bash
npm run build      # TypeScriptのコンパイル（dist/に出力）
npm run dev        # ts-nodeで直接実行（開発時）
npm test           # Jestでテスト実行
npm run test:watch # テストをウォッチモードで実行
npm run test:cov   # カバレッジレポート付きでテスト
npm run lint       # ESLintによるコードチェック
npm run typecheck  # TypeScriptの型チェック（コンパイルなし）
```

### 推奨開発ツール

- **VSCode拡張機能**:
  - `dbaeumer.vscode-eslint`: ESLintの統合
  - `esbenp.prettier-vscode`: コードフォーマット
  - `ms-vscode.vscode-typescript-next`: TypeScript最新機能のサポート
- **Git hooks**（推奨）: `husky` + `lint-staged` でコミット前に自動Lint実行
