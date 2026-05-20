# BabyLog - 新生児育児記録アプリ

新生児の授乳・搾乳・ミルク・尿・便を1時間単位で記録し、グラフで可視化できる Web アプリです。

## 技術スタック

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **グラフ**: Recharts
- **状態管理**: React Context + SWR
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **ホスティング**: Vercel

## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd baby-tracker
pnpm install
```

### 2. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 「New Project」をクリックして新しいプロジェクトを作成
3. プロジェクト名・パスワード・リージョン（東京推奨: ap-northeast-1）を設定
4. プロジェクトが作成されたら「Settings」→「API」を開く
5. 以下の値をコピーする:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、上記の値を設定:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. データベースマイグレーションの実行

Supabase CLI をインストールしてマイグレーションを実行:

```bash
# Supabase CLI のインストール
brew install supabase/tap/supabase

# Supabase にログイン
supabase login

# プロジェクトとリンク（プロジェクトの Reference ID は Dashboard で確認）
supabase link --project-ref <your-project-ref>

# マイグレーションを実行
supabase db push
```

または、Supabase Dashboard の「SQL Editor」で `supabase/migrations/` 内の SQL ファイルを順番に実行してください。

### 5. Google OAuth の設定（任意）

1. Supabase Dashboard →「Authentication」→「Providers」→「Google」を有効化
2. Google Cloud Console でプロジェクトを作成して OAuth 2.0 クライアントを作成
3. Authorized redirect URIs に `https://<your-project>.supabase.co/auth/v1/callback` を追加
4. Client ID と Client Secret を Supabase に設定

### 6. 開発サーバーの起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) を開いてアプリを確認できます。

## デプロイ (Vercel)

1. [Vercel](https://vercel.com) にリポジトリを接続
2. 環境変数に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
3. デプロイ実行

Supabase の「Authentication」→「URL Configuration」で以下を設定:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/login/       # ログインページ
│   ├── (app)/
│   │   ├── daily/          # デイリー記録画面
│   │   ├── summary/        # サマリ・グラフ画面
│   │   └── layout.tsx      # 下部ナビ含む共通レイアウト
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui コンポーネント
│   ├── daily/              # マトリクス、入力モーダル
│   └── summary/            # グラフ
├── lib/
│   ├── supabase/           # Supabase クライアント
│   ├── types.ts            # 型定義
│   └── utils.ts
└── hooks/                  # カスタムフック
```

## 利用可能なスクリプト

```bash
pnpm dev      # 開発サーバー起動
pnpm build    # プロダクションビルド
pnpm start    # プロダクションサーバー起動
pnpm lint     # ESLint 実行
```
