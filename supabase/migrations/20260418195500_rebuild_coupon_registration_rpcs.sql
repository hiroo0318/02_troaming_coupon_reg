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
    nullif(payload->>'registered_at', '')::timestamptz,
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

create or replace function roamingreg.roaming_update_registration(p_id bigint, payload jsonb)
returns roamingreg.coupon_registrations
language plpgsql
security definer
set search_path = public, roamingreg
as $$
declare
  v_row roamingreg.coupon_registrations;
begin
  update roamingreg.coupon_registrations
     set phone_number = case when payload ? 'phone_number' then payload->>'phone_number' else phone_number end,
         coupon_number = case when payload ? 'coupon_number' then payload->>'coupon_number' else coupon_number end,
         category = case when payload ? 'category' then payload->>'category' else category end,
         product_name = case when payload ? 'product_name' then payload->>'product_name' else product_name end,
         status = case when payload ? 'status' then payload->>'status' else status end,
         reg_result = case when payload ? 'reg_result' then payload->>'reg_result' else reg_result end,
         registered_at = case
           when payload ? 'registered_at' then nullif(payload->>'registered_at', '')::timestamptz
           else registered_at
         end,
         coupon_code = case when payload ? 'coupon_code' then payload->>'coupon_code' else coupon_code end,
         coupon_name = case when payload ? 'coupon_name' then payload->>'coupon_name' else coupon_name end,
         error_code = case when payload ? 'error_code' then payload->>'error_code' else error_code end,
         error_msg = case when payload ? 'error_msg' then payload->>'error_msg' else error_msg end,
         product_code = case when payload ? 'product_code' then payload->>'product_code' else product_code end,
         subscription_required = case
           when payload ? 'subscription_required' then (payload->>'subscription_required')::boolean
           else subscription_required
         end,
         service_check_result = case
           when payload ? 'service_check_result' then payload->>'service_check_result'
           else service_check_result
         end,
         service_check_code = case
           when payload ? 'service_check_code' then payload->>'service_check_code'
           else service_check_code
         end,
         service_check_message = case
           when payload ? 'service_check_message' then payload->>'service_check_message'
           else service_check_message
         end,
         service_checked_at = case
           when payload ? 'service_checked_at' then nullif(payload->>'service_checked_at', '')::timestamptz
           else service_checked_at
         end,
         service_info_response = case
           when payload ? 'service_info_response' then payload->'service_info_response'
           else service_info_response
         end,
         registration_response = case
           when payload ? 'registration_response' then payload->'registration_response'
           else registration_response
         end,
         is_skt_subscriber = case
           when payload ? 'is_skt_subscriber' then (payload->>'is_skt_subscriber')::boolean
           else is_skt_subscriber
         end,
         is_adult = case
           when payload ? 'is_adult' then (payload->>'is_adult')::boolean
           else is_adult
         end,
         auth_profile_id = case
           when payload ? 'auth_profile_id' then nullif(payload->>'auth_profile_id', '')::bigint
           else auth_profile_id
         end,
         auth_method = case
           when payload ? 'auth_method' then coalesce(nullif(payload->>'auth_method', ''), 'pin')
           else auth_method
         end
   where id = p_id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function roamingreg.roaming_insert_registration(jsonb) to anon, authenticated, service_role;
grant execute on function roamingreg.roaming_update_registration(bigint, jsonb) to anon, authenticated, service_role;
