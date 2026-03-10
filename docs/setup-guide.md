# Tasting Form セットアップガイド

## アーキテクチャ

- **Supabase**: `agcgomsgdcougjqjvaqq`（isekadoproduction）をfilling-recorderと共用
- **テイスティング対象**: `filling_schedules` テーブルを直接参照（`products`テーブル不要）
- **ビール名解決**: `filling_schedules` → `cellar_lots` ← `brews` → `beers`
- **認証**: Google OAuth（@kadoyahonten.co.jp ドメイン制限）

## 1. スキーマ適用

既にfilling-recorderのテーブルが存在する同じSupabaseプロジェクトに、tasting用テーブルを追加する。

1. Supabase Dashboard → 左メニュー **SQL Editor**
2. `supabase/migrations/001_initial_schema.sql` の内容を貼り付けて **Run**
3. 追加されるもの:
   - `beer_color_enum` 型
   - `profiles` テーブル（Google Auth連携）
   - `product_tastings` テーブル（`filling_schedules` をFK参照）
   - `tasting_summary` ビュー
   - RLSポリシー
   - トリガー（`handle_new_user`, `update_updated_at`）

## 2. Google OAuth設定（Supabase側）

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Google** を展開して有効化
3. **Callback URL** をコピー（`https://agcgomsgdcougjqjvaqq.supabase.co/auth/v1/callback`）

## 3. Google Cloud Console でOAuthクライアント作成

1. [Google Cloud Console](https://console.cloud.google.com) → 既存プロジェクト（inventory-managerと同じでOK）
2. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Tasting Form`
5. **Authorized redirect URIs** に手順2-3のCallback URLを追加
6. **Create** → **Client ID** と **Client Secret** を取得

## 4. OAuthクライアント情報をSupabaseに登録

1. Supabase Dashboard → Authentication → Providers → Google
2. **Client ID** と **Client Secret** を貼り付け
3. **Save**

## 5. ローカル動作確認

`.env.local` は作成済み（filling-recorderと同じSupabase URL/key）。

```bash
cd C:/Users/user/claude/tasting-form
npm run dev
```

- `http://localhost:3000` → ログイン画面
- Google ログイン → テイスティングフォーム表示
- 充填記録のドロップダウンにfilling_schedulesのデータが表示される

## 6. Vercelデプロイ

1. GitHubにリポジトリ作成 → push
2. [vercel.com](https://vercel.com) → **Add New Project** → リポジトリインポート
3. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://agcgomsgdcougjqjvaqq.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = （filling-recorderと同じanon key）
4. **Deploy**
5. デプロイ後:
   - Google Cloud Console → Authorized redirect URIs に `https://your-app.vercel.app/auth/callback` 追加
   - Supabase → Authentication → URL Configuration → **Redirect URLs** に同URL追加

## 7. データ移行

既存AppSheetのProduct Tasting ~468レコードを移行する場合:

1. Google SheetsからCSVエクスポート
2. 旧Product Listの各製品を `filling_schedules` のどのIDに対応させるかマッピング
3. マッピング確定後、INSERTスクリプトで `product_tastings` に投入
4. People写真4枚 → Supabase Storage `profile-photos` バケット
