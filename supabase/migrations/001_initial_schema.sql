-- =============================================================
-- Tasting Form: Supabase Schema
-- 既存の isekadoproduction Supabase プロジェクトに追加
-- filling_schedules を「テイスティング対象」として参照
-- =============================================================

-- ----- ENUM TYPES -----

create type beer_color_enum as enum (
  'Straw',
  'Gold',
  'Light Amber',
  'Deep Amber/Copper',
  'Brown',
  'Black'
);

-- ----- PROFILES (Google Auth用) -----

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email       text,
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Google Auth時に自動作成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email, photo_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- トリガーが既存なら再作成
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----- PRODUCT TASTINGS -----
-- filling_schedules を参照（products テーブルは不要）

create table product_tastings (
  id              uuid primary key default gen_random_uuid(),
  taster_id       uuid not null references profiles(id) on delete cascade,
  filling_schedule_id uuid not null references filling_schedules(id) on delete cascade,

  -- === Appearance（外観）===
  head_color      smallint check (head_color between 1 and 5),
  foam_volume     smallint check (foam_volume between 0 and 4),
  head_retention  smallint check (head_retention between 1 and 5),
  beer_color      beer_color_enum,
  clarity         smallint check (clarity between 1 and 5),
  inappropriate_appearance text[] default '{}',
  appearance_comments text,

  -- === Aroma（香り）===
  malt_aroma              smallint check (malt_aroma between 0 and 3),
  hop_aroma               smallint check (hop_aroma between 0 and 3),
  fermentation_aroma      smallint check (fermentation_aroma between 0 and 3),
  inappropriate_aroma     text[] default '{}',
  aroma_comments          text,

  -- === Flavor & Taste（味）===
  sweetness               smallint check (sweetness between 1 and 5),
  bitterness              smallint check (bitterness between 1 and 5),
  sourness                smallint check (sourness between 1 and 5),
  malt_flavor             smallint check (malt_flavor between 1 and 5),
  hop_flavor              smallint check (hop_flavor between 1 and 5),
  fermentation_flavor     smallint check (fermentation_flavor between 1 and 5),
  balance                 smallint check (balance between 1 and 5),
  flavor_comments         text,

  -- === Mouthfeel（口当たり）===
  alcohol                 smallint check (alcohol between 1 and 5),
  carbonation             smallint check (carbonation between 1 and 5),
  body                    smallint check (body between 1 and 5),
  astringency             smallint check (astringency between 1 and 5),

  -- === Defects ===
  off_flavor              text[] default '{}',
  technical_defects       text[] default '{}',

  -- === Overall（総合）===
  overall                 smallint check (overall between 1 and 10),
  overall_comments        text,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_tastings_filling_schedule on product_tastings(filling_schedule_id);
create index idx_tastings_taster on product_tastings(taster_id);
create index idx_tastings_created on product_tastings(created_at desc);

-- ----- VIEW: テイスティング結果サマリー -----
-- filling_schedules → cellar_lots ← brews → beers でビール名を解決

create or replace view tasting_summary as
select
  fs.id as filling_schedule_id,
  fs.filling_date,
  fp.name as container,
  cl.name as cellar_lot_name,
  b.name as beer_name,
  count(pt.id) as tasting_count,
  round(avg(pt.overall)::numeric, 2) as avg_overall
from filling_schedules fs
left join filling_products fp on fp.id = fs.product_id
left join cellar_lots cl on cl.id = fs.cellar_lot_id
left join brews br on br.cellar_lot_id = cl.id
left join beers b on b.id = br.beer_id
left join product_tastings pt on pt.filling_schedule_id = fs.id
group by fs.id, fs.filling_date, fp.name, cl.name, b.name;

-- ----- ROW LEVEL SECURITY -----

alter table profiles enable row level security;
alter table product_tastings enable row level security;

create policy "Profiles are viewable by all authenticated users"
  on profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on profiles for update to authenticated using (auth.uid() = id);

create policy "Tastings are viewable by all authenticated users"
  on product_tastings for select to authenticated using (true);

create policy "Users can insert own tastings"
  on product_tastings for insert to authenticated
  with check (auth.uid() = taster_id);

create policy "Users can update own tastings"
  on product_tastings for update to authenticated
  using (auth.uid() = taster_id);

create policy "Users can delete own tastings"
  on product_tastings for delete to authenticated
  using (auth.uid() = taster_id);

-- ----- updated_at 自動更新トリガー -----

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at before update on product_tastings
  for each row execute function update_updated_at();
