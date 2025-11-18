# devin-verification-e2e

E2Eテスト環境とDocker Compose統合環境を提供するリポジトリです。

## 概要

このリポジトリは以下を提供します：

1. **Docker Compose統合環境**: フロントエンド、バックエンド、在庫サービスモックを統合した開発・テスト環境
2. **E2Eテストスイート**: （今後実装予定）

## Docker Compose環境

### 構成

以下の4つのサービスで構成されています：

- **frontend**: Next.jsフロントエンドアプリケーション（ポート3000）
- **backend**: Spring Bootバックエンドサービス（ポート8080）
- **postgres**: PostgreSQLデータベース（ポート5432）
- **inventory-mock**: GraphQL在庫サービスモック（ポート8085）

### 前提条件

- Docker Desktop または Docker Engine + Docker Compose がインストールされていること
- `devin-verification-frontend` リポジトリが `../devin-verification-frontend` に配置されていること
- `devin-verification-backend-category-service` リポジトリが `../devin-verification-backend-category-service` に配置されていること

### セットアップ

1. 環境変数ファイルを作成：

```bash
cp .env.e2e.example .env.e2e
```

2. 必要に応じて `.env.e2e` を編集してデータベース認証情報を変更

### 起動方法

#### 全サービスを起動

```bash
docker-compose -f docker-compose.e2e.yml up
```

バックグラウンドで起動する場合：

```bash
docker-compose -f docker-compose.e2e.yml up -d
```

#### 特定のサービスのみ起動

```bash
# フロントエンドと在庫モックのみ
docker-compose -f docker-compose.e2e.yml up frontend inventory-mock

# バックエンドと依存サービス
docker-compose -f docker-compose.e2e.yml up backend
```

#### ビルドから実行

```bash
docker-compose -f docker-compose.e2e.yml up --build
```

### アクセス

起動後、以下のURLでアクセスできます：

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080/api/v1
- **在庫サービスモック（GraphQL）**: http://localhost:8085/graphql
- **在庫サービスモック（GraphiQL）**: http://localhost:8085/graphql （ブラウザでアクセス）
- **PostgreSQL**: localhost:5432

### 停止方法

```bash
# 停止（コンテナは保持）
docker-compose -f docker-compose.e2e.yml stop

# 停止してコンテナを削除
docker-compose -f docker-compose.e2e.yml down

# ボリュームも含めて完全削除
docker-compose -f docker-compose.e2e.yml down -v
```

### ログ確認

```bash
# 全サービスのログ
docker-compose -f docker-compose.e2e.yml logs -f

# 特定サービスのログ
docker-compose -f docker-compose.e2e.yml logs -f frontend
docker-compose -f docker-compose.e2e.yml logs -f backend
docker-compose -f docker-compose.e2e.yml logs -f inventory-mock
```

### トラブルシューティング

#### ポートが既に使用されている

他のサービスがポート3000、8080、8085、5432を使用している場合、それらを停止してください。

```bash
# ポート使用状況確認（macOS/Linux）
lsof -i :3000
lsof -i :8080
lsof -i :8085
lsof -i :5432
```

#### ビルドエラー

キャッシュをクリアして再ビルド：

```bash
docker-compose -f docker-compose.e2e.yml build --no-cache
```

#### データベース接続エラー

PostgreSQLが完全に起動するまで待機してください。ヘルスチェックが設定されているため、通常は自動的に待機します。

## 在庫サービスモック

### 概要

GraphQLベースの在庫サービスモックサーバーです。バックエンドからの在庫照会リクエストに応答します。

### GraphQLスキーマ

```graphql
type AvailabilityInfo {
  inStock: Boolean!
  estimatedDeliveryDays: Int
}

type Query {
  getProductAvailability(productId: String!): AvailabilityInfo
}
```

### クエリ例

```graphql
query {
  getProductAvailability(productId: "iphone-15-pro-128gb") {
    inStock
    estimatedDeliveryDays
  }
}
```

### 失敗シミュレーション

エラーハンドリングをテストするため、環境変数 `SIMULATE_FAILURE=true` を設定することで、在庫サービスの失敗をシミュレートできます。

```bash
SIMULATE_FAILURE=true docker-compose -f docker-compose.e2e.yml up inventory-mock
```

または `.env.e2e` ファイルで設定：

```
SIMULATE_FAILURE=true
```

### モックデータ

以下の製品IDに対してモックデータが定義されています：

- `iphone-15-pro-128gb`: 在庫あり、配送3日
- `iphone-15-pro-256gb`: 在庫あり、配送2日
- `iphone-15-pro-max-256gb`: 在庫なし
- `iphone-15-128gb`: 在庫あり、配送1日
- `iphone-15-plus-256gb`: 在庫あり、配送2日

その他の製品IDの場合、デフォルトで在庫あり（配送5日）を返します。

## 開発ワークフロー

### ローカル開発

1. Docker Compose環境を起動
2. フロントエンドまたはバックエンドのコードを変更
3. 変更を反映するためにサービスを再起動：

```bash
docker-compose -f docker-compose.e2e.yml restart frontend
# または
docker-compose -f docker-compose.e2e.yml restart backend
```

### E2Eテスト実行

（今後実装予定）

## 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `DB_NAME` | `ahamo_category_db` | PostgreSQLデータベース名 |
| `DB_USERNAME` | `ahamo_user` | PostgreSQLユーザー名 |
| `DB_PASSWORD` | `ahamo_password` | PostgreSQLパスワード |
| `SIMULATE_FAILURE` | `false` | 在庫サービス失敗シミュレーション |

## ネットワーク構成

全サービスは `ahamo-e2e-network` ブリッジネットワーク上で動作します。サービス間通信は以下のホスト名で行われます：

- `frontend` → `backend:8080`
- `backend` → `postgres:5432`
- `backend` → `inventory-mock:8085`

## ボリューム

- `postgres_data`: PostgreSQLデータの永続化

## ヘルスチェック

各サービスにヘルスチェックが設定されており、依存関係の順序が保証されます：

1. `postgres` → `inventory-mock` → `backend` → `frontend`

## 注意事項

- バックエンドリポジトリ（`devin-verification-backend-category-service`）が存在しない場合、バックエンドサービスは起動できません
- フロントエンドのDockerfileは `output: 'standalone'` モードを使用しています
- 初回起動時はイメージのビルドに時間がかかります

## 関連リポジトリ

- [devin-verification-frontend](https://github.com/satoshi-watanabe-0001/devin-verification-frontend)
- [devin-verification-backend-category-service](https://github.com/satoshi-watanabe-0001/devin-verification-backend-category-service)
