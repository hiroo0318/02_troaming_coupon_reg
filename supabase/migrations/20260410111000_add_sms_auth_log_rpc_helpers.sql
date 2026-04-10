create or replace function public.roaming_insert_sms_auth_log(payload jsonb)
returns roamingreg.sms_auth_logs
language plpgsql
security definer
set search_path = public, roamingreg
as $$
declare
  v_row roamingreg.sms_auth_logs;
begin
  insert into roamingreg.sms_auth_logs (
    phone_number,
    purpose,
    status,
    expires_at,
    attempt_count,
    verified_at,
    sent_at,
    auth_code_hash,
    request_id,
    provider_name,
    provider_message_id,
    verified_attempt_count,
    last_attempted_at,
    failure_reason,
    request_payload,
    response_payload
  ) values (
    payload->>'phone_number',
    payload->>'purpose',
    coalesce(payload->>'status', 'sent'),
    coalesce((payload->>'expires_at')::timestamptz, now() + interval '3 minutes'),
    coalesce((payload->>'attempt_count')::integer, 0),
    (payload->>'verified_at')::timestamptz,
    coalesce((payload->>'sent_at')::timestamptz, now()),
    payload->>'auth_code_hash',
    payload->>'request_id',
    payload->>'provider_name',
    payload->>'provider_message_id',
    coalesce((payload->>'verified_attempt_count')::integer, 0),
    (payload->>'last_attempted_at')::timestamptz,
    payload->>'failure_reason',
    payload->'request_payload',
    payload->'response_payload'
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.roaming_update_sms_auth_log(p_id bigint, payload jsonb)
returns roamingreg.sms_auth_logs
language plpgsql
security definer
set search_path = public, roamingreg
as $$
declare
  v_row roamingreg.sms_auth_logs;
begin
  update roamingreg.sms_auth_logs
     set status = coalesce(payload->>'status', status),
         expires_at = coalesce((payload->>'expires_at')::timestamptz, expires_at),
         attempt_count = coalesce((payload->>'attempt_count')::integer, attempt_count),
         verified_at = coalesce((payload->>'verified_at')::timestamptz, verified_at),
         auth_code_hash = coalesce(payload->>'auth_code_hash', auth_code_hash),
         provider_name = coalesce(payload->>'provider_name', provider_name),
         provider_message_id = coalesce(payload->>'provider_message_id', provider_message_id),
         verified_attempt_count = coalesce((payload->>'verified_attempt_count')::integer, verified_attempt_count),
         last_attempted_at = coalesce((payload->>'last_attempted_at')::timestamptz, last_attempted_at),
         failure_reason = case when payload ? 'failure_reason' then payload->>'failure_reason' else failure_reason end,
         request_payload = coalesce(payload->'request_payload', request_payload),
         response_payload = coalesce(payload->'response_payload', response_payload)
   where id = p_id
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.roaming_get_sms_auth_log_by_request_id(p_request_id text)
returns roamingreg.sms_auth_logs
language sql
security definer
set search_path = public, roamingreg
as $$
  select *
  from roamingreg.sms_auth_logs
  where request_id = p_request_id
  order by id desc
  limit 1;
$$;

grant execute on function public.roaming_insert_sms_auth_log(jsonb) to anon, authenticated, service_role;
grant execute on function public.roaming_update_sms_auth_log(bigint, jsonb) to anon, authenticated, service_role;
grant execute on function public.roaming_get_sms_auth_log_by_request_id(text) to anon, authenticated, service_role;
