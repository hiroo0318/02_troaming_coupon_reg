alter table if exists roamingreg.coupon_products
  add column if not exists product_desc text,
  add column if not exists price_label varchar(50),
  add column if not exists guide_title varchar(120),
  add column if not exists guide_desc text,
  add column if not exists button_text varchar(60),
  add column if not exists feature_data jsonb not null default '{}'::jsonb;

create or replace function roamingreg.roaming_find_coupon_type(p_coupon_code text)
returns table (
  coupon_code text,
  coupon_name text,
  product_code text,
  product_name text,
  category text,
  product_desc text,
  price_label text,
  guide_title text,
  guide_desc text,
  button_text text,
  feature_data jsonb
)
language sql
security definer
set search_path = public, roamingreg
as $$
  select
    cp.coupon_code,
    cp.coupon_name,
    cp.product_code,
    cp.product_name,
    cp.category,
    cp.product_desc,
    cp.price_label,
    cp.guide_title,
    cp.guide_desc,
    cp.button_text,
    coalesce(cp.feature_data, '{}'::jsonb) as feature_data
  from roamingreg.coupon_products cp
  where cp.coupon_code = p_coupon_code
  limit 1
$$;

grant execute on function roamingreg.roaming_find_coupon_type(text) to anon, authenticated, service_role;
