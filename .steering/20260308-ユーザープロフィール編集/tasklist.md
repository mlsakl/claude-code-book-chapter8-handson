# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 「時間の都合により別タスクとして実施予定」は禁止
- 「実装が複雑すぎるため後回し」は禁止
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

---

## フェーズ1: 型定義とエラークラス

- [x] `src/types/index.ts` に型を追加
  - [x] `UserProfile` インターフェース（name, email, github の Optional フィールド）
  - [x] `Config` インターフェース（profile フィールドを持つ）
  - [x] `ProfileKey` 型エイリアス（'name' | 'email' | 'github'）

- [x] `src/types/errors.ts` を新規作成
  - [x] `ValidationError` クラスを実装（Error を継承）

## フェーズ2: ストレージ層

- [x] `src/storage/ConfigStorage.ts` を新規作成
  - [x] `load()` メソッド（ファイル未存在時はデフォルト Config を返す）
  - [x] `save(config: Config)` メソッド（.task/ ディレクトリ自動作成）

## フェーズ3: サービス層

- [x] `src/services/ProfileManager.ts` を新規作成
  - [x] `getProfile()` メソッド（ConfigStorage から読み込む）
  - [x] `setProfileField(key: ProfileKey, value: string)` メソッド
    - [x] 空文字列バリデーション（ValidationError をスロー）
    - [x] プロフィール更新と保存

## フェーズ4: CLIコマンド

- [x] `src/cli/commands/profile.ts` を新規作成
  - [x] `profile show` サブコマンド（name/email/github を表示）
  - [x] `profile set <key> <value>` サブコマンド
    - [x] 無効なキーのバリデーション（ValidationError をキャッチして表示）
    - [x] 成功時メッセージ表示

## フェーズ5: テスト

- [x] `tests/unit/storage/ConfigStorage.test.ts` を新規作成
  - [x] `load()`: ファイル未存在時にデフォルト値を返す
  - [x] `load()`: 既存ファイルの内容を返す
  - [x] `save()`: ファイルに正しく書き込む
  - [x] `save()`: `.task/` ディレクトリを自動作成する

- [x] `tests/unit/services/ProfileManager.test.ts` を新規作成
  - [x] `getProfile()`: 空のプロフィールを返す（未設定時）
  - [x] `getProfile()`: 設定済みプロフィールを返す
  - [x] `setProfileField()`: nameを正常に設定できる
  - [x] `setProfileField()`: emailを正常に設定できる
  - [x] `setProfileField()`: githubを正常に設定できる
  - [x] `setProfileField()`: 空文字列でValidationErrorをスローする

## フェーズ6: 品質チェックと修正

- [x] すべてのテストが通ることを確認
  - [x] `npm test`
- [x] リントエラーがないことを確認
  - [x] `npm run lint`
- [x] 型エラーがないことを確認
  - [x] `npm run typecheck`

## フェーズ7: ドキュメント更新

- [x] 実装後の振り返り（このファイルの下部に記録）

---

## 実装後の振り返り

### 実装完了日
2026-03-08

### 計画と実績の差分

**計画と異なった点**:
- 計画時は `src/types/errors.ts` に `ValidationError` のみを定義する予定だったが、`docs/development-guidelines.md` のエラー階層定義に従い `TaskCLIError` 基底クラスを追加した
- CLIコマンド(`profile.ts`)を当初 `ConfigStorage` を直接インスタンス化する設計にしたが、アーキテクチャのレイヤー依存ルール違反のため、`ProfileManager` を引数で受け取る設計に修正した
- `ConfigStorage.save()` をシンプルな `writeFileSync` で実装したが、アーキテクチャのアトミック書き込み要件に従いリネーム方式 + `chmod 600` に変更した

**新たに必要になったタスク**:
- バリデーターの指摘を受け、`ProfileManager` の無効キーテストケースを追加
- テストに Given/When/Then コメントスタイルを追加してプロジェクト既存パターンと統一

### 学んだこと

**技術的な学び**:
- テストフレームワークが `docs/architecture.md` には Jest と記載されているが、実際のプロジェクトは Vitest を使用している。実装前に `package.json` を確認することが重要
- `process.cwd()` をデフォルト引数に使うことで、テスト時に一時ディレクトリを渡せる柔軟な設計が可能
- アトミック書き込みは `renameSync` をOSのアトミック操作として利用することで実現できる

**プロセス上の改善点**:
- implementation-validator サブエージェントがアーキテクチャ仕様との差分を的確に検出してくれた。スペックドリブンな開発の効果を実感した
- CLIレイヤーの依存関係ルール（データレイヤーへの直接アクセス禁止）は実装時に意識しにくいため、レビュー工程での検出が重要

### 次回への改善提案
- `docs/architecture.md` の技術スタック（Jest）と実際の `package.json`（Vitest）の不一致を修正する
- CLIレイヤーの依存関係ルールを CLAUDE.md または development-guidelines.md に注意事項として追記する
- CLIコマンドのユニットテスト（`vi.spyOn` によるコンソール出力・プロセス終了コードの検証）を次の実装サイクルで追加することを検討
