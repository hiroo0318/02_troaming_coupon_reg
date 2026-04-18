create or replace function roamingreg.roaming_insert_registration(payload jsonb)
returns roamingreg.coupon_registrations
language plpgsql
security definer
set search_path = public, roamingreg
as $$
declare
  v_row roamingreg.coupon_registrations;
begin
  insert into roamingreg.coupon_registrations (
    phone_number,
    coupon_number,
    category,
    product_name,
    status,
    reg_result,
    registered_at,
    coupon_code,
    coupon_name,
    error_code,
    error_msg,
    product_code,
    subscription_required,
    service_check_result,
    service_check_code,
    service_check_message,
    service_checked_at,
    service_info_response,
    registration_response,
    is_skt_subscriber,
    is_adult,
    auth_profile_id,
    auth_method
  )
  values (
    payload->>'phone_number',
    payload->>'coupon_number',
    payload->>'category',
    payload->>'product_name',
    coalesce(payload->>'status', '처리중'),
    coalesce(payload->>'reg_result', 'pending'),
    coalesce(nullif(payload->>'registered_at', '')::timestamptz, now()),
    payload->>'coupon_code',
    payload->>'coupon_name',
    payload->>'error_code',
    payload->>'error_msg',
    payload->>'product_code',
    case
      when payload ? 'subscription_required' then (payload->>'subscription_required')::boolean
      else null
    end,
    payload->>'service_check_result',
    payload->>'service_check_code',
    payload->>'service_check_message',
    nullif(payload->>'service_checked_at', '')::timestamptz,
    payload->'service_info_response',
    payload->'registration_response',
    case
      when payload ? 'is_skt_subscriber' then (payload->>'is_skt_subscriber')::boolean
      else null
    end,
    case
      when payload ? 'is_adult' then (payload->>'is_adult')::boolean
      else null
    end,
    nullif(payload->>'auth_profile_id', '')::bigint,
    coalesce(payload->>'auth_method', 'pin')
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function roamingreg.roaming_insert_registration(jsonb) to anon, authenticated, service_role;
