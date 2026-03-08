# 設計書

## アーキテクチャ概要

既存のレイヤードアーキテクチャに従い、3層構造で実装する。

```
CLIレイヤー (src/cli/commands/profile.ts)
    ↓
サービスレイヤー (src/services/ProfileManager.ts)
    ↓
データレイヤー (src/storage/ConfigStorage.ts)
    ↓
.task/config.json
```

## コンポーネント設計

### 1. UserProfile型 (src/types/index.ts)

**責務**:
- プロフィールデータの型定義

**実装の要点**:
- 全フィールドをオプショナルにする（未設定状態を許容）
- Config全体の型も定義する

```typescript
interface UserProfile {
  name?: string;    // 氏名
  email?: string;   // メールアドレス
  github?: string;  // GitHubユーザー名
}

interface Config {
  profile: UserProfile;
}

type ProfileKey = 'name' | 'email' | 'github';
```

### 2. ConfigStorage (src/storage/ConfigStorage.ts)

**責務**:
- `.task/config.json` の読み書き
- ディレクトリ自動作成

**実装の要点**:
- ファイルが存在しない場合はデフォルト値（空のprofile）を返す
- 書き込みはNode.js `fs` の同期APIを使用（CLIツールの即時応答のため）
- `.task/` ディレクトリが存在しない場合は自動作成する

```typescript
class ConfigStorage {
  constructor(private readonly basePath: string) {}
  load(): Config;
  save(config: Config): void;
}
```

### 3. ProfileManager (src/services/ProfileManager.ts)

**責務**:
- プロフィールのビジネスロジック
- バリデーション（有効なキーか、空文字列でないか）

**実装の要点**:
- 有効なProfileKeyのみ受け付ける
- 空文字列の値を拒否する
- ValidationErrorをスローする

```typescript
class ProfileManager {
  constructor(private readonly storage: ConfigStorage) {}
  getProfile(): UserProfile;
  setProfileField(key: ProfileKey, value: string): UserProfile;
}
```

### 4. CLIコマンド (src/cli/commands/profile.ts)

**責務**:
- `task profile show` コマンドの定義
- `task profile set <key> <value>` コマンドの定義
- 結果の表示

**実装の要点**:
- `profile` サブコマンドを Commander.js で定義
- 表示はシンプルなテキスト形式（chalk使用なし、依存追加を避ける）
- エラーは stderr に出力して process.exit(1)

## データフロー

### task profile show
```
1. profile show コマンド実行
2. ProfileManager.getProfile() を呼ぶ
3. ConfigStorage.load() で config.json を読む
4. UserProfile を返す
5. CLI が name/email/github を表示（未設定は「未設定」）
```

### task profile set name "山田健二"
```
1. profile set name "山田健二" コマンド実行
2. ProfileManager.setProfileField('name', '山田健二') を呼ぶ
3. バリデーション（有効なキーか、空文字でないか）
4. ConfigStorage.load() で既存設定を読む
5. name フィールドを更新
6. ConfigStorage.save() で書き込む
7. CLI が「プロフィールを更新しました: name = 山田健二」を表示
```

## エラーハンドリング戦略

### カスタムエラークラス

```typescript
// src/types/errors.ts として独立ファイルを作成
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### エラーハンドリングパターン

- `ProfileManager` は `ValidationError` をスローする
- CLIレイヤーでキャッチして stderr に表示し `process.exit(1)`

## テスト戦略

### ユニットテスト

- `ConfigStorage`: ファイル読み書き、ディレクトリ自動作成、ファイル未存在時のデフォルト値
- `ProfileManager`: getProfile、setProfileField（正常系・異常系）、バリデーション

### テストフレームワーク

- **vitest**（package.jsonで確認済み、Jestではない）
- ファイルシステムのモックは `vi.mock('fs')` または一時ディレクトリを使用

## 依存ライブラリ

新しいライブラリの追加なし。Node.js標準の `fs` と `path` モジュールのみ使用。

## ディレクトリ構造

```
src/
├── types/
│   ├── index.ts          # UserProfile, Config, ProfileKey 型を追加
│   └── errors.ts         # ValidationError クラス（新規）
├── storage/
│   └── ConfigStorage.ts  # 新規
├── services/
│   └── ProfileManager.ts # 新規
└── cli/
    └── commands/
        └── profile.ts    # 新規

tests/
├── unit/
│   ├── storage/
│   │   └── ConfigStorage.test.ts  # 新規
│   └── services/
│       └── ProfileManager.test.ts # 新規
```

## 実装の順序

1. `src/types/index.ts` に UserProfile, Config, ProfileKey 型を追加
2. `src/types/errors.ts` に ValidationError を実装
3. `src/storage/ConfigStorage.ts` を実装
4. `src/services/ProfileManager.ts` を実装
5. `src/cli/commands/profile.ts` を実装
6. `tests/unit/storage/ConfigStorage.test.ts` を実装
7. `tests/unit/services/ProfileManager.test.ts` を実装

## セキュリティ考慮事項

- GitHubトークンはこのフェーズでは扱わない（別途セキュリティ設計が必要）
- `config.json` の内容はプレーンテキスト（今回は個人情報のみ）

## パフォーマンス考慮事項

- 同期APIを使用して即座にレスポンスを返す（CLIツールの特性上）

## 将来の拡張性

- `Config` 型に `github.token` フィールドを追加することでP1のGitHub連携に対応可能
- `ProfileKey` の型を拡張することで設定項目を追加可能
