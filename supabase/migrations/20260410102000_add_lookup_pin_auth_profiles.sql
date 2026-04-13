create table if not exists roamingreg.lookup_auth_profiles (
  id bigserial primary key,
  phone_number varchar(11) not null unique,
  email varchar(120),
  pin_hash varchar(128) not null,
  pin_length integer not null default 6,
  auth_method varchar(20) not null default 'pin',
  last_verified_purpose varchar(30),
  last_verified_at timestamptz,
  pin_set_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table roamingreg.coupon_registrations
  add column if not exists auth_profile_id bigint,
  add column if not exists lookup_email varchar(120),
  add column if not exists auth_method varchar(20) not null default 'pin';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coupon_registrations_auth_profile_id_fkey'
      and conrelid = 'roamingreg.coupon_registrations'::regclass
  ) then
    alter table roamingreg.coupon_registrations
      add constraint coupon_registrations_auth_profile_id_fkey
      foreign key (auth_profile_id)
      references roamingreg.lookup_auth_profiles(id);
  end if;
end $$;

create index if not exists idx_coupon_registrations_auth_profile_id
  on roamingreg.coupon_registrations(auth_profile_id);

create or replace function roamingreg.roaming_upsert_lookup_auth(payload jsonb)
returns roamingreg.lookup_auth_profiles
language plpgsql
security definer
set search_path = public, roamingreg
as $$
declare
  v_row roamingreg.lookup_auth_profiles;
begin
  insert into roamingreg.lookup_auth_profiles (
    phone_number,
    email,
    pin_hash,
    pin_length,
    auth_method,
    pin_set_at,
    updated_at
  )
  values (
    payload->>'phone_number',
    nullif(payload->>'email', ''),
    payload->>'pin_hash',
    coalesce((payload->>'pin_length')::integer, 6),
    coalesce(payload->>'auth_method', 'pin'),
    now(),
    now()
  )
  on conflict (phone_number) do update
    set email = coalesce(excluded.email, roamingreg.lookup_auth_profiles.email),
        pin_hash = excluded.pin_hash,
        pin_length = excluded.pin_length,
        auth_method = excluded.auth_method,
        pin_set_at = now(),
        updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function roamingreg.roaming_verify_lookup_auth(
  p_phone_number text,
  p_pin_hash text,
  p_purpose text default null
)
returns roamingreg.lookup_auth_profiles
language plpgsql
security definer
set search_path = public, roamingreg
as $$
declare
  v_row roamingreg.lookup_auth_profiles;
begin
  update roamingreg.lookup_auth_profiles
     set last_verified_at = now(),
         last_verified_purpose = coalesce(p_purpose, last_verified_purpose),
         updated_at = now()
   where phone_number = p_phone_number
     and pin_hash = p_pin_hash
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function roamingreg.roaming_upsert_lookup_auth(jsonb) to anon, authenticated, service_role;
grant execute on function roamingreg.roaming_verify_lookup_auth(text, text, text) to anon, authenticated, service_role;
