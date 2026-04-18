alter table roamingreg.coupon_registrations
  drop column if exists na_code,
  drop column if exists lookup_email,
  drop column if exists registration_request;

update roamingreg.coupon_registrations
set
  product_name = null,
  product_code = null,
  category = null,
  subscription_required = null
where reg_result = 'fail'
  and (
    product_name = '미확인 쿠폰'
    or category = 'UNKNOWN'
  );
