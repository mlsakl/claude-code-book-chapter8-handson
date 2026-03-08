# 要求内容

## 概要

TaskCLIユーザーが自分の名前・メールアドレス・GitHubユーザー名などの
プロフィール情報をターミナルから編集・確認できる機能を実装する。

## 背景

現在、TaskCLIは `.task/config.json` に設定データを保存する設計が
アーキテクチャで定義されているが、プロフィール管理の実装が存在しない。
GitHub Issues連携（P1機能）を見据えると、ユーザーのGitHubトークンや
ユーザー名を管理する基盤が必要。また、タスクのアサイン（P2機能）にも
ユーザー識別情報が必要になる。

## 実装対象の機能

### 1. プロフィール表示
- `task profile show` でユーザーのプロフィール情報を一覧表示する
- 未設定項目は「未設定」と表示する

### 2. プロフィール設定
- `task profile set <key> <value>` で個別項目を設定・更新する
- 設定可能な項目: `name`（氏名）、`email`（メールアドレス）、`github`（GitHubユーザー名）

### 3. プロフィールストレージ
- プロフィールデータを `.task/config.json` に保存する
- `ProfileManager` サービスクラスで管理する
- `ConfigStorage` でファイル読み書きを抽象化する

## 受け入れ条件

### プロフィール表示
- [ ] `task profile show` でname・email・githubの3項目が表示される
- [ ] 未設定の項目は「未設定」と表示される
- [ ] `.task/` が未初期化でも「未設定」として表示できる

### プロフィール設定
- [ ] `task profile set name "山田健二"` で名前を設定・更新できる
- [ ] `task profile set email "ken@example.com"` でメールを設定・更新できる
- [ ] `task profile set github "ken-yamada"` でGitHubユーザー名を設定できる
- [ ] 無効なキー（name/email/github以外）を指定した場合、エラーメッセージを表示する
- [ ] 空文字列を値として設定しようとした場合、エラーメッセージを表示する

### ストレージ
- [ ] プロフィール情報が `.task/config.json` に保存される
- [ ] `.task/` ディレクトリが存在しない場合、自動作成される

## 成功指標

- `task profile show` と `task profile set` が100ms以内に完了する
- 開発ガイドラインのコーディング規約に準拠している
- ユニットテストカバレッジ80%以上（ProfileManagerとConfigStorage）

## スコープ外

以下はこのフェーズでは実装しません:

- プロフィールの削除機能（`task profile unset`）
- プロフィールの全件クリア（`task profile reset`）
- GitHubトークンの設定（セキュリティ要件が別途必要）
- チームメンバーのプロフィール管理（P2機能）

## 参照ドキュメント

- `docs/product-requirements.md` - プロダクト要求定義書
- `docs/functional-design.md` - 機能設計書（FileStorage設計を参照）
- `docs/architecture.md` - アーキテクチャ設計書
- `docs/development-guidelines.md` - コーディング規約
