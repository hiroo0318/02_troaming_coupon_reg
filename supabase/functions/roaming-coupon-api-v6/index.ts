import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

function requireEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
  }
  return value;
}

const APIHUB_URL =
  Deno.env.get("ROAMING_APIHUB_URL") ??
  "https://gwcoupon.sktcoupon.co.kr/gateway/apihubCspSend.api";
const APIHUB_IF_CODE = Deno.env.get("ROAMING_APIHUB_IF_CODE") ?? "UKEY0002";
const SERVICE_INFO_API_CODE = Deno.env.get("ROAMING_SERVICE_INFO_API_CODE") ?? "ISICS00021";
const SUBSCRIPTION_API_CODE = Deno.env.get("ROAMING_SUBSCRIPTION_API_CODE") ?? "IMASH00043";
const COUPON_REGISTER_URL =
  Deno.env.get("ROAMING_COUPON_REGISTER_URL") ?? "https://ifcoupon.sktcoupon.co.kr/v1.1/regist.do";
const COUPON_ISSU_NO = Deno.env.get("ROAMING_COUPON_ISSU_NO") ?? "RF";
const COUPON_CUST_NO = requireEnv("ROAMING_COUPON_CUST_NO");
const COUPON_AUTH_KEY = requireEnv("ROAMING_COUPON_AUTH_KEY");
const COUPON_AES_KEY = requireEnv("ROAMING_COUPON_AES_KEY");
const SERVICE_INFO_AES_KEY = requireEnv("ROAMING_SERVICE_INFO_AES_KEY");
const SERVICE_INFO_AES_IV = "ABCDEFGHIJKLMNOP";
const FIXED_SMS_AUTH_CODE = Deno.env.get("ROAMING_FIXED_AUTH_CODE") ?? "123456";
const SMS_AUTH_EXPIRE_SECONDS = 180;
const SMS_VERIFY_MAX_ATTEMPTS = 5;
const SUBSCRIBE_MAX_ATTEMPTS = 3;
const EXTERNAL_API_TIMEOUT_MS = 15000;

// NA 코드 그룹 상수 (해지/필터링용)
const ONEPASS_NA_CODES = [
  "NA00003196", "NA00004088", // onepass_500
  "NA00006486", "NA00006487", // onepass_vip
  "NA00006744", "NA00006745", // onepass_data_vip
];
const BARO_ACTIVE_NA_CODE = "NA00007678";
const BARO_LEVEL1_NA_CODES = ["NA00007668"];
const BARO_LEVEL2_NA_CODES = ["NA00007675", "NA00007676"];
const BARO_LEVEL3_NA_CODES = [
  "NA00008288", "NA00008289", // baro_3gb
  "NA00008290", "NA00008291", // baro_6gb
  "NA00008292", "NA00008293", // baro_12gb
  "NA00008294", "NA00008295", // baro_24gb
];
const NA_CANCEL_NAMES: Record<string, string> = {
  NA00007668: "baro 요금제 대표",
  NA00007675: "baro 구독 자동형",
  NA00007676: "baro 구독 수동형",
  NA00008288: "baro 3G",      NA00008289: "baro YT 4G",
  NA00008290: "baro 6GB",     NA00008291: "baro YT 7GB",
  NA00008292: "baro 12GB",    NA00008293: "baro YT 13GB",
  NA00008294: "baro 24GB",    NA00008295: "baro YT 25GB",
  NA00003196: "T로밍 OnePass 500",        NA00004088: "T로밍 OnePass 500 기간형",
  NA00006486: "OnePass VIP",              NA00006487: "OnePass VIP 기간형",
  NA00006744: "OnePass Data VIP",         NA00006745: "OnePass Data VIP 기간형",
};

type JsonMap = Record<string, unknown>;
type RpcRow = Record<string, unknown>;

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

function sanitizePhoneNumber(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 11);
}

function sanitizeCouponNumber(value: unknown) {
  return String(value ?? "").trim().slice(0, 32);
}

function sanitizeStartMode(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized || null;
}

function requiresSubscription(category: string | null, productCode: string | null) {
  const normalizedCategory = String(category ?? "").trim().toUpperCase();
  const normalizedProductCode = String(productCode ?? "").trim().toLowerCase();

  if (normalizedCategory === "금액권") return false;
  if (normalizedCategory === "ONEPASS") return true;
  if (normalizedCategory === "BARO") return true;
  if (normalizedProductCode.startsWith("baro_charge_")) return true;

  return false;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function extractTagValue(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match?.[1]?.trim() ?? null;
}

function normalizeApiHubText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const xmlStart = trimmed.indexOf("<?xml");
  if (xmlStart >= 0) {
    return trimmed.slice(xmlStart);
  }

  const responseStart = trimmed.indexOf("<RESPONSE>");
  if (responseStart >= 0) {
    return trimmed.slice(responseStart);
  }

  return trimmed;
}

function extractWrappedResultField(text: string, fieldName: string) {
  const match = text.match(new RegExp(`${fieldName}=([^,}\\r\\n]+)`, "i"));
  return match?.[1]?.trim() ?? null;
}

function extractHeaderValue(xml: string, tagName: string) {
  const header = extractTagValue(xml, "HEADER");
  if (!header) return null;
  return extractTagValue(header, tagName);
}

function extractBodyValue(xml: string, tagName: string) {
  const body = extractTagValue(xml, "BODY");
  if (!body) return null;
  return extractTagValue(body, tagName);
}

function decodeHtml(value: string | null) {
  return value?.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") ?? null;
}

function parseKnownNaCodes(text: string | null) {
  if (!text) return [];
  const matches = text.match(/NA\d{8}/g);
  return matches ? Array.from(new Set(matches)) : [];
}

function parseBirthDate(value: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return null;

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6)) - 1;
  const day = Number(digits.slice(6, 8));
  const date = new Date(Date.UTC(year, month, day));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isAdult(birthDate: Date | null) {
  if (!birthDate) return null;

  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth();
  const dayDiff = today.getUTCDate() - birthDate.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 18;
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function hexToBytes(value: string) {
  const normalized = value.replace(/^0x/i, "");
  const bytes = new Uint8Array(normalized.length / 2);

  for (let index = 0; index < normalized.length; index += 2) {
    bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
  }

  return bytes;
}

function stripPkcs7Padding(bytes: Uint8Array) {
  if (!bytes.length) return bytes;
  const padLength = bytes[bytes.length - 1];
  if (padLength <= 0 || padLength > 16 || padLength > bytes.length) {
    return bytes;
  }
  for (let i = bytes.length - padLength; i < bytes.length; i += 1) {
    if (bytes[i] !== padLength) {
      return bytes;
    }
  }
  return bytes.slice(0, bytes.length - padLength);
}

async function decryptServiceInfoField(value: string | null) {
  if (!value) return value;

  try {
    const hexString = new TextDecoder().decode(base64ToBytes(value)).trim();
    const cipherBytes = hexToBytes(hexString);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SERVICE_INFO_AES_KEY),
      { name: "AES-CBC" },
      false,
      ["decrypt"],
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: new TextEncoder().encode(SERVICE_INFO_AES_IV) },
      cryptoKey,
      cipherBytes,
    );

    return new TextDecoder().decode(stripPkcs7Padding(new Uint8Array(decrypted))).trim();
  } catch {
    return value;
  }
}

async function encryptCouponNumber(value: string) {
  const iv = new Uint8Array(16);
  // Coupon IF expects the provided AES key string itself as the raw AES-256 key,
  // not the hex-decoded bytes of that string.
  const couponKeyBytes = new TextEncoder().encode(COUPON_AES_KEY.trim());
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    couponKeyBytes,
    { name: "AES-CBC" },
    false,
    ["encrypt"],
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    new TextEncoder().encode(value),
  );

  const bytes = new Uint8Array(encrypted);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function callRpc(name: string, args: JsonMap) {
  const { data, error } = await supabaseAdmin.schema("roamingreg").rpc(name, args);

  if (error) {
    throw new Error(`${name} 호출 실패: ${error.message}`);
  }

  return data;
}

async function callApiHub(apiCode: string, cspParam: JsonMap) {
  const body = new URLSearchParams({
    ifCode: APIHUB_IF_CODE,
    apiCode,
    cspParam: JSON.stringify(cspParam),
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXTERNAL_API_TIMEOUT_MS);

  try {
    const response = await fetch(APIHUB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: controller.signal,
    });

    const rawText = await response.text();
    const text = normalizeApiHubText(rawText);
    const wrappedResultMessage = extractWrappedResultField(rawText, "resultMsg");
    const wrappedResultCode = extractWrappedResultField(rawText, "resultCd");

    return {
      ok: response.ok,
      status: response.status,
      text: rawText,
      header: {
        responseCode: decodeHtml(extractHeaderValue(text, "RESPONSE_CODE")),
        resultCode:
          decodeHtml(extractHeaderValue(text, "RESULT_CODE")) ??
          decodeHtml(wrappedResultCode),
        result: decodeHtml(extractHeaderValue(text, "RESULT")),
        resultMessage:
          decodeHtml(extractHeaderValue(text, "RESULT_MESSAGE")) ??
          decodeHtml(wrappedResultMessage),
      },
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("외부 연동 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function callCouponRegistration(couponNumber: string, phoneNumber: string) {
  const encryptedCouponNumber = await encryptCouponNumber(couponNumber);
  const requestBody = {
    issu_no: COUPON_ISSU_NO,
    cust_no: COUPON_CUST_NO,
    auth_key: COUPON_AUTH_KEY,
    pin_no: encryptedCouponNumber,
    tel_no: phoneNumber,
    rt_format: "JSON",
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXTERNAL_API_TIMEOUT_MS);
  let response: Response;
  let text: string;

  try {
    response = await fetch(COUPON_REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    text = await response.text();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("쿠폰 등록 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  let parsedJson: JsonMap | null = null;

  try {
    parsedJson = JSON.parse(text);
  } catch {
    parsedJson = null;
  }

  const couponCode =
    parsedJson?.PRD_CD ??
    parsedJson?.prd_cd ??
    parsedJson?.PIN_NO ??
    parsedJson?.pin_no ??
    parsedJson?.coupon_code ??
    parsedJson?.couponCode ??
    extractTagValue(text, "PRD_CD") ??
    extractTagValue(text, "prd_cd") ??
    extractTagValue(text, "PIN_NO") ??
    extractTagValue(text, "pin_no") ??
    extractTagValue(text, "COUPON_CODE") ??
    extractTagValue(text, "coupon_code");
  const couponName =
    parsedJson?.PRD_NM ??
    parsedJson?.prd_nm ??
    parsedJson?.coupon_name ??
    parsedJson?.couponName ??
    extractTagValue(text, "PRD_NM") ??
    extractTagValue(text, "prd_nm") ??
    extractTagValue(text, "COUPON_NAME") ??
    extractTagValue(text, "coupon_name");
  const resultCode =
    String(
      parsedJson?.RETURNCODE ??
        parsedJson?.returnCode ??
        parsedJson?.result_code ??
        parsedJson?.resultCode ??
        extractTagValue(text, "RESULT_CODE") ??
        extractTagValue(text, "RETURNCODE") ??
        extractTagValue(text, "result_code") ??
        "",
    ) || null;
  const resultMessage =
    String(
      parsedJson?.RETURNMSG ??
        parsedJson?.returnMsg ??
        parsedJson?.result_message ??
        parsedJson?.resultMessage ??
        extractTagValue(text, "RESULT_MESSAGE") ??
        extractTagValue(text, "RETURNMSG") ??
        extractTagValue(text, "result_message") ??
        "",
    ) || null;
  const tradeId =
    String(
      parsedJson?.TRADE_ID ??
        parsedJson?.trade_id ??
        extractTagValue(text, "TRADE_ID") ??
        extractTagValue(text, "trade_id") ??
        "",
    ) || null;

  // 쿠폰 등록 API 성공 기준은 RETURNCODE "00" 하나만 허용합니다.
  const isBusinessSuccess = resultCode === "00";

  return {
    ok: response.ok && isBusinessSuccess,
    status: response.status,
    raw: text,
    requestBody,
    couponCode,
    couponName,
    resultCode,
    resultMessage,
    tradeId,
  };
}

async function fetchServiceInfo(phoneNumber: string) {
  const response = await callApiHub(SERVICE_INFO_API_CODE, {
    SVC_NUM: phoneNumber,
  });

  const prodListRaw = extractBodyValue(response.text, "PROD_ID_LIST");
  const birthRaw = extractBodyValue(response.text, "SSN_BIRTH_DT");
  const prodList = await decryptServiceInfoField(prodListRaw);
  const birthDateValue = await decryptServiceInfoField(birthRaw);
  const birthDate = parseBirthDate(birthDateValue);
  const resultMessage = response.header.resultMessage ?? "";
  const noLineFound = resultMessage.includes("조회된 회선 정보가 없습니다.");
  const hasSubscriberEvidence = Boolean(prodListRaw || birthRaw || response.header.responseCode);
  const isSktSubscriber = hasSubscriberEvidence && !noLineFound;

  return {
    ...response,
    prodListRaw,
    prodList,
    birthDateValue,
    birthDate,
    isSktSubscriber,
    isAdult: isSktSubscriber ? isAdult(birthDate) : null,
    existingNaCodes: parseKnownNaCodes(prodList),
  };
}

async function insertRegistration(payload: JsonMap) {
  return (await callRpc("roaming_insert_registration", { payload })) as RpcRow;
}

async function updateRegistration(id: number, payload: JsonMap) {
  return (await callRpc("roaming_update_registration", { p_id: id, payload })) as RpcRow;
}

async function insertPlanLog(payload: JsonMap) {
  return (await callRpc("roaming_insert_plan_log", { payload })) as RpcRow;
}

async function cancelSingleNaCode(params: {
  registrationId: number;
  phoneNumber: string;
  couponNumber: string;
  productCode: string;
  naCode: string;
  existingNaCodes: string[];
}): Promise<RpcRow> {
  const { registrationId, phoneNumber, couponNumber, productCode, naCode, existingNaCodes } = params;
  const naName = NA_CANCEL_NAMES[naCode] ?? naCode;

  const apiResponse = await callApiHub(SUBSCRIPTION_API_CODE, {
    OP_CD: "C",
    SVC_NUM: phoneNumber,
    PROD_ID: naCode,
    FREE_USE_DAY: "0",
  });

  const isSuccess =
    apiResponse.ok &&
    apiResponse.header.resultCode === "00" &&
    apiResponse.header.result === "S";

  const log = await insertPlanLog({
    registration_id: registrationId,
    phone_number: phoneNumber,
    coupon_number: couponNumber,
    product_code: productCode,
    na_code: naCode,
    na_name: naName,
    step_action: "cancel",
    api_name: SUBSCRIPTION_API_CODE,
    existing_na_codes: existingNaCodes,
    request_payload: { OP_CD: "C", SVC_NUM: phoneNumber, PROD_ID: naCode, FREE_USE_DAY: "0" },
    response_payload: { text: apiResponse.text, header: apiResponse.header },
    sub_result: isSuccess ? "success" : "fail",
    error_code: isSuccess ? null : apiResponse.header.responseCode,
    error_msg: isSuccess ? null : apiResponse.header.resultMessage,
    result_message: apiResponse.header.resultMessage,
  });

  if (!isSuccess) {
    throw new Error(
      `기존 요금제 해지 실패 (${naCode}): ${apiResponse.header.resultMessage ?? "알 수 없는 오류"}`,
    );
  }

  return log;
}

async function cancelExistingNaCodes(params: {
  registrationId: number;
  phoneNumber: string;
  couponNumber: string;
  productCode: string;
  codesToCancel: string[];
  existingNaCodes: string[];
}): Promise<RpcRow[]> {
  const { codesToCancel, existingNaCodes } = params;
  const logs: RpcRow[] = [];

  for (const naCode of codesToCancel) {
    if (!existingNaCodes.includes(naCode)) continue;
    logs.push(await cancelSingleNaCode({ ...params, naCode }));
  }

  return logs;
}

async function findCouponType(couponCode: string | null) {
  if (!couponCode) return null;
  return (await callRpc("roaming_find_coupon_type", { p_coupon_code: couponCode })) as RpcRow | null;
}

async function getNaCodeRows(productCode: string) {
  return ((await callRpc("roaming_get_na_code_rows", { p_product_code: productCode })) ?? []) as RpcRow[];
}

async function getHistory(phoneNumber: string) {
  return ((await callRpc("roaming_get_history", { p_phone_number: phoneNumber })) ?? []) as RpcRow[];
}

async function insertSmsAuthLog(payload: JsonMap) {
  return (await callRpc("roaming_insert_sms_auth_log", { payload })) as RpcRow;
}

async function updateSmsAuthLog(id: number, payload: JsonMap) {
  return (await callRpc("roaming_update_sms_auth_log", { p_id: id, payload })) as RpcRow;
}

async function getSmsAuthLogByRequestId(requestId: string) {
  return (await callRpc("roaming_get_sms_auth_log_by_request_id", {
    p_request_id: requestId,
  })) as RpcRow | null;
}

function uniqueCodes(values: string[]) {
  return Array.from(new Set(values));
}

function getRowCode(row: RpcRow) {
  return String(row.na_code ?? "");
}

function getRowLevel(row: RpcRow) {
  return Number(row.na_level ?? 0);
}

function getExistingCodes(existingNaCodes: string[], codeGroup: string[]) {
  return codeGroup.filter((code) => existingNaCodes.includes(code));
}

async function insertInfoPlanLog(payload: JsonMap) {
  return await insertPlanLog({
    sub_result: "success",
    ...payload,
  });
}

async function insertPrerequisiteFailPlanLog(payload: JsonMap) {
  return await insertPlanLog({
    sub_result: "fail",
    step_action: "prerequisite_failed",
    api_name: SUBSCRIPTION_API_CODE,
    ...payload,
  });
}

async function subscribeSingleNaCodeWithRetry(params: {
  registrationId: number;
  phoneNumber: string;
  couponNumber: string;
  productCode: string;
  row: RpcRow;
  existingNaCodes: string[];
}): Promise<{ logs: RpcRow[]; succeeded: boolean; errorMessage: string | null }> {
  const { registrationId, phoneNumber, couponNumber, productCode, row, existingNaCodes } = params;
  const logs: RpcRow[] = [];
  let errorMessage: string | null = null;

  for (let attempt = 1; attempt <= SUBSCRIBE_MAX_ATTEMPTS; attempt += 1) {
    const apiResponse = await callApiHub(SUBSCRIPTION_API_CODE, {
      OP_CD: "S",
      SVC_NUM: phoneNumber,
      PROD_ID: row.na_code,
      FREE_USE_DAY: "0",
    });
    const isSuccess =
      apiResponse.ok &&
      apiResponse.header.resultCode === "00" &&
      apiResponse.header.result === "S";

    const resultMessage = apiResponse.header.resultMessage ?? "요금제 가입 처리에 실패했습니다.";
    errorMessage = resultMessage;

    logs.push(
      await insertPlanLog({
        registration_id: registrationId,
        phone_number: phoneNumber,
        coupon_number: couponNumber,
        product_code: productCode,
        na_level: row.na_level,
        na_code: row.na_code,
        na_name: row.na_name,
        start_mode: row.start_mode,
        step_action: attempt === 1 ? "subscribe" : "subscribe_retry",
        api_name: SUBSCRIPTION_API_CODE,
        existing_na_codes: existingNaCodes,
        request_payload: {
          OP_CD: "S",
          SVC_NUM: phoneNumber,
          PROD_ID: row.na_code,
          FREE_USE_DAY: "0",
          attempt_no: attempt,
          max_attempts: SUBSCRIBE_MAX_ATTEMPTS,
        },
        response_payload: {
          text: apiResponse.text,
          header: apiResponse.header,
        },
        sub_result: isSuccess ? "success" : "fail",
        error_code: isSuccess ? null : apiResponse.header.responseCode,
        error_msg: isSuccess ? null : resultMessage,
        result_message: isSuccess
          ? resultMessage
          : `${resultMessage} (${attempt}/${SUBSCRIBE_MAX_ATTEMPTS}회 시도)`,
      }),
    );

    if (isSuccess) {
      return { logs, succeeded: true, errorMessage: null };
    }
  }

  return { logs, succeeded: false, errorMessage };
}

async function rollbackSubscribedNaCodes(params: {
  registrationId: number;
  phoneNumber: string;
  couponNumber: string;
  productCode: string;
  rowsToRollback: RpcRow[];
  existingNaCodes: string[];
}): Promise<{ logs: RpcRow[]; failedCodes: string[] }> {
  const { registrationId, phoneNumber, couponNumber, productCode, rowsToRollback, existingNaCodes } = params;
  const logs: RpcRow[] = [];
  const failedCodes: string[] = [];

  for (const row of [...rowsToRollback].reverse()) {
    const naCode = getRowCode(row);
    const naName = String(row.na_name ?? naCode);
    const apiResponse = await callApiHub(SUBSCRIPTION_API_CODE, {
      OP_CD: "C",
      SVC_NUM: phoneNumber,
      PROD_ID: naCode,
      FREE_USE_DAY: "0",
    });
    const isSuccess =
      apiResponse.ok &&
      apiResponse.header.resultCode === "00" &&
      apiResponse.header.result === "S";

    logs.push(
      await insertPlanLog({
        registration_id: registrationId,
        phone_number: phoneNumber,
        coupon_number: couponNumber,
        product_code: productCode,
        na_level: row.na_level,
        na_code: naCode,
        na_name: naName,
        start_mode: row.start_mode,
        step_action: "rollback_cancel",
        api_name: SUBSCRIPTION_API_CODE,
        existing_na_codes: existingNaCodes,
        request_payload: {
          OP_CD: "C",
          SVC_NUM: phoneNumber,
          PROD_ID: naCode,
          FREE_USE_DAY: "0",
          rollback: true,
        },
        response_payload: {
          text: apiResponse.text,
          header: apiResponse.header,
        },
        sub_result: isSuccess ? "rollback_success" : "rollback_fail",
        error_code: isSuccess ? null : apiResponse.header.responseCode,
        error_msg: isSuccess ? null : apiResponse.header.resultMessage,
        result_message: isSuccess
          ? `${naName} 롤백 해지가 완료되었습니다.`
          : `${naName} 롤백 해지에 실패했습니다.`,
      }),
    );

    if (!isSuccess) {
      failedCodes.push(naCode);
    }
  }

  return { logs, failedCodes };
}

async function subscribeProduct(params: {
  registrationId: number;
  phoneNumber: string;
  couponNumber: string;
  productCode: string;
  category: string;
  startMode?: string | null;
  existingNaCodes: string[];
}) {
  const { registrationId, phoneNumber, couponNumber, productCode, category, startMode, existingNaCodes } = params;
  const allRows = await getNaCodeRows(productCode);
  const naType = "normal";
  const targetRows = allRows.filter((row) => {
    if (String(row.na_type ?? "normal") !== naType) {
      return false;
    }

    const rowStartMode = row.start_mode ? String(row.start_mode) : null;
    if (!rowStartMode || rowStartMode === "fixed") {
      return true;
    }

    return rowStartMode === (startMode ?? null);
  });
  const logs: RpcRow[] = [];

  if (!targetRows.length) {
    throw new Error("가입 대상 NA 코드 구성을 찾지 못했습니다.");
  }

  const cancelParams = { registrationId, phoneNumber, couponNumber, productCode, existingNaCodes };
  const targetCodes = targetRows.map(getRowCode);
  const existingOnepassCodes = getExistingCodes(existingNaCodes, ONEPASS_NA_CODES);
  const existingBaroLevel2Codes = getExistingCodes(existingNaCodes, BARO_LEVEL2_NA_CODES);
  const existingBaroLevel3Codes = getExistingCodes(existingNaCodes, BARO_LEVEL3_NA_CODES);

  let codesToCancel: string[] = [];
  let rowsToSubscribe: RpcRow[] = [];
  let alreadySubscribed = false;
  let resultMessage = "요금제 가입이 완료되었습니다.";

  if (category === "ONEPASS") {
    const targetCodeSet = new Set(targetCodes);
    const matchedTargetCodes = targetCodes.filter((code) => existingNaCodes.includes(code));
    const otherOnepassCodes = existingOnepassCodes.filter((code) => !targetCodeSet.has(code));

    if (matchedTargetCodes.length === targetCodes.length && otherOnepassCodes.length === 0) {
      alreadySubscribed = true;
      resultMessage = "해당 OnePass 요금제가 이미 가입되어 있습니다.";
      logs.push(
        await insertInfoPlanLog({
          registration_id: registrationId,
          phone_number: phoneNumber,
          coupon_number: couponNumber,
          product_code: productCode,
          na_code: targetCodes[0] ?? null,
          na_name: targetRows[0]?.na_name ?? null,
          start_mode: startMode,
          step_action: "already_subscribed",
          api_name: SUBSCRIPTION_API_CODE,
          existing_na_codes: existingNaCodes,
          result_message: resultMessage,
        }),
      );
      return { logs, alreadySubscribed, message: resultMessage };
    }

    codesToCancel = otherOnepassCodes;
    const existingAfterCancel = new Set(existingNaCodes.filter((code) => !codesToCancel.includes(code)));
    rowsToSubscribe = targetRows.filter((row) => !existingAfterCancel.has(getRowCode(row)));
  } else if (category === "BARO") {
    const level1Rows = targetRows.filter((row) => getRowLevel(row) === 1);
    const level2Rows = targetRows.filter((row) => getRowLevel(row) === 2);
    const level3Rows = targetRows.filter((row) => getRowLevel(row) === 3);
    const targetLevel2Code = level2Rows[0] ? getRowCode(level2Rows[0]) : null;
    const targetLevel3Code = level3Rows[0] ? getRowCode(level3Rows[0]) : null;
    const sameLevel2Only =
      Boolean(targetLevel2Code) &&
      existingBaroLevel2Codes.length > 0 &&
      existingBaroLevel2Codes.every((code) => code === targetLevel2Code);
    const sameLevel3Only =
      Boolean(targetLevel3Code) &&
      existingBaroLevel3Codes.length > 0 &&
      existingBaroLevel3Codes.every((code) => code === targetLevel3Code);
    const hasAllTargetCodes = targetCodes.every((code) => existingNaCodes.includes(code));

    if (existingOnepassCodes.length === 0 && hasAllTargetCodes && sameLevel2Only && sameLevel3Only) {
      alreadySubscribed = true;
      resultMessage = "해당 baro 요금제가 이미 가입되어 있습니다.";
      logs.push(
        await insertInfoPlanLog({
          registration_id: registrationId,
          phone_number: phoneNumber,
          coupon_number: couponNumber,
          product_code: productCode,
          na_code: targetLevel3Code,
          na_name: level3Rows[0]?.na_name ?? null,
          start_mode: startMode,
          step_action: "already_subscribed",
          api_name: SUBSCRIPTION_API_CODE,
          existing_na_codes: existingNaCodes,
          result_message: resultMessage,
        }),
      );
      return { logs, alreadySubscribed, message: resultMessage };
    }

    codesToCancel.push(...existingOnepassCodes);

    const hasSameOptionDifferentData =
      Boolean(targetLevel2Code) &&
      existingBaroLevel2Codes.includes(targetLevel2Code) &&
      existingBaroLevel3Codes.some((code) => code !== targetLevel3Code);
    const hasDifferentOptionSameData =
      Boolean(targetLevel3Code) &&
      existingBaroLevel3Codes.includes(targetLevel3Code) &&
      existingBaroLevel2Codes.some((code) => code !== targetLevel2Code);

    if (hasSameOptionDifferentData) {
      codesToCancel.push(...existingBaroLevel3Codes.filter((code) => code !== targetLevel3Code));
    } else if (hasDifferentOptionSameData) {
      codesToCancel.push(...existingBaroLevel2Codes.filter((code) => code !== targetLevel2Code));
    } else {
      codesToCancel.push(...existingBaroLevel3Codes.filter((code) => code !== targetLevel3Code));
      codesToCancel.push(...existingBaroLevel2Codes.filter((code) => code !== targetLevel2Code));
    }

    codesToCancel = uniqueCodes(codesToCancel);
    const existingAfterCancel = new Set(existingNaCodes.filter((code) => !codesToCancel.includes(code)));
    rowsToSubscribe = [...level1Rows, ...level2Rows, ...level3Rows].filter(
      (row) => !existingAfterCancel.has(getRowCode(row)),
    );
  } else {
    const existingAfterCancel = new Set(existingNaCodes);
    rowsToSubscribe = targetRows.filter((row) => !existingAfterCancel.has(getRowCode(row)));
  }

  // --- 기존 요금제 해지 ---
  if (codesToCancel.length) {
    const level3First = codesToCancel.filter((code) => BARO_LEVEL3_NA_CODES.includes(code));
    const level2Second = codesToCancel.filter((code) => BARO_LEVEL2_NA_CODES.includes(code));
    const level1Third = codesToCancel.filter((code) => BARO_LEVEL1_NA_CODES.includes(code));
    const onepassLast = codesToCancel.filter((code) => ONEPASS_NA_CODES.includes(code));
    const orderedCancelCodes = [
      ...level3First,
      ...level2Second,
      ...level1Third,
      ...onepassLast,
    ];

    logs.push(...await cancelExistingNaCodes({ ...cancelParams, codesToCancel: orderedCancelCodes }));
  }

  // --- 요금제 가입 ---
  const subscribedRows: RpcRow[] = [];

  for (const row of rowsToSubscribe) {
    const subscribeResult = await subscribeSingleNaCodeWithRetry({
      registrationId,
      phoneNumber,
      couponNumber,
      productCode,
      row,
      existingNaCodes,
    });
    logs.push(...subscribeResult.logs);

    if (subscribeResult.succeeded) {
      subscribedRows.push(row);
      continue;
    }

    if (category === "BARO" && subscribedRows.length) {
      const rollbackResult = await rollbackSubscribedNaCodes({
        registrationId,
        phoneNumber,
        couponNumber,
        productCode,
        rowsToRollback: subscribedRows,
        existingNaCodes,
      });
      logs.push(...rollbackResult.logs);

      if (rollbackResult.failedCodes.length) {
        throw new Error(
          "baro 요금제 가입 처리 중 오류가 발생했습니다. 자동 복구를 시도했지만 일부 단계 정리에 실패했습니다. 고객센터를 통해 가입 상태를 확인해 주세요.",
        );
      }

      throw new Error(
        "baro 요금제 가입 처리 중 오류가 발생하여 자동 복구를 완료했습니다. T world에서 다시 처음부터 가입해 주세요.",
      );
    }

    throw new Error(subscribeResult.errorMessage ?? "요금제 가입 처리에 실패했습니다.");
  }

  return {
    logs,
    alreadySubscribed,
    message: resultMessage,
  };
}

function mapRegistrationResponse(row: RpcRow, logs: RpcRow[] = []) {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    couponNumber: row.coupon_number,
    couponCode: row.coupon_code,
    couponName: row.coupon_name,
    productCode: row.product_code,
    productName: row.product_name,
    category: row.category,
    subscriptionRequired: Boolean(row.subscription_required),
    regResult: row.reg_result,
    status: row.status,
    message:
      row.reg_result === "success"
        ? "쿠폰 등록이 완료되었습니다."
        : row.error_msg ?? row.service_check_message ?? "등록 처리에 실패했습니다.",
    errorCode: row.error_code,
    errorMsg: row.error_msg,
    registeredAt: row.registered_at,
    createdAt: row.created_at,
    productDesc: row.product_desc ?? null,
    priceLabel: row.price_label ?? null,
    guideTitle: row.guide_title ?? null,
    guideDesc: row.guide_desc ?? null,
    buttonText: row.button_text ?? null,
    featureData: row.feature_data ?? null,
    logs: logs.map((log) => ({
      id: log.id,
      stepAction: log.step_action,
      naCode: log.na_code,
      naName: log.na_name,
      subResult: log.sub_result,
      resultMessage: log.result_message,
      errorMsg: log.error_msg,
      attemptedAt: log.attempted_at,
    })),
  };
}

async function handleRegister(payload: JsonMap) {
  const couponNumber = sanitizeCouponNumber(payload.couponNumber);
  const phoneNumber = sanitizePhoneNumber(payload.phoneNumber);
  const agreePrivacy = Boolean(payload.agreePrivacy);
  let hasResolvedProduct = false;

  assert(agreePrivacy, "개인정보 동의가 필요합니다.");
  assert(couponNumber.length >= 8, "쿠폰번호를 확인해 주세요.");
  assert(phoneNumber.length >= 10, "휴대폰 번호를 확인해 주세요.");

  const registration = await insertRegistration({
    phone_number: phoneNumber,
    coupon_number: couponNumber,
    category: "UNKNOWN",
    product_name: "미확인 쿠폰",
    subscription_required: false,
    status: "처리중",
    reg_result: "pending",
    service_check_result: "pending",
    registered_at: new Date().toISOString(),
  });

  try {
    const serviceInfo = await fetchServiceInfo(phoneNumber);
    const servicePassed =
      serviceInfo.isSktSubscriber === true &&
      (serviceInfo.isAdult === true || serviceInfo.isAdult === null);

    const serviceCheckedRegistration = await updateRegistration(Number(registration.id), {
      service_check_result: servicePassed ? "success" : "fail",
      service_check_code: serviceInfo.header.resultCode ?? serviceInfo.header.responseCode,
      service_check_message: serviceInfo.header.resultMessage,
      is_skt_subscriber: serviceInfo.isSktSubscriber,
      is_adult: serviceInfo.isAdult,
      service_checked_at: new Date().toISOString(),
      service_info_response: {
        text: serviceInfo.text,
        header: serviceInfo.header,
        prodList: serviceInfo.prodList,
        birthDateValue: serviceInfo.birthDateValue,
      },
    });

    if (!serviceInfo.isSktSubscriber) {
      const updated = await updateRegistration(Number(registration.id), {
        reg_result: "fail",
        status: "등록실패",
        error_msg: "T 로밍쿠폰은 SKT 가입자만 이용할 수 있습니다.",
        category: null,
        product_name: null,
        product_code: null,
        subscription_required: null,
        registered_at: new Date().toISOString(),
      });

      return {
        success: true,
        ...mapRegistrationResponse({
          ...serviceCheckedRegistration,
          ...updated,
        }),
        message: "T 로밍쿠폰은 SKT 가입자만 이용할 수 있습니다.",
      };
    }

    if (serviceInfo.isAdult === false) {
      const updated = await updateRegistration(Number(registration.id), {
        reg_result: "fail",
        status: "등록실패",
        error_msg: "T 로밍쿠폰은 만 18세 이상부터 이용 가능합니다.",
        category: null,
        product_name: null,
        product_code: null,
        subscription_required: null,
        registered_at: new Date().toISOString(),
      });

      return {
        success: true,
        ...mapRegistrationResponse(updated),
        message: "T 로밍쿠폰은 만 18세 이상부터 이용 가능합니다.",
      };
    }

    const couponResponse = await callCouponRegistration(couponNumber, phoneNumber);
    const resolvedCouponCode =
      couponResponse.couponCode ||
      (/^ROM[A-Z0-9]+$/i.test(couponNumber) ? couponNumber : null);

    // 쿠폰 등록 API 결과를 먼저 DB에 기록
    let updatedRegistration = await updateRegistration(Number(registration.id), {
      registration_response: {
        raw: couponResponse.raw,
        resultCode: couponResponse.resultCode,
        resultMessage: couponResponse.resultMessage,
        tradeId: couponResponse.tradeId,
      },
      reg_result: couponResponse.ok ? "success" : "fail",
      status: couponResponse.ok ? "등록완료" : "등록실패",
      error_code: couponResponse.ok ? null : couponResponse.resultCode,
      error_msg: couponResponse.ok ? null : couponResponse.resultMessage,
      registered_at: new Date().toISOString(),
    });

    // 쿠폰 등록 API 실패 → couponType 조회 전에 early return
    if (!couponResponse.ok) {
      updatedRegistration = await updateRegistration(Number(registration.id), {
        category: null,
        product_name: null,
        product_code: null,
        subscription_required: null,
      });

      return {
        success: true,
        ...mapRegistrationResponse(updatedRegistration),
        message: couponResponse.resultMessage ?? "쿠폰 등록 API 처리에 실패했습니다.",
      };
    }

    // 등록 성공 → 상품 매핑 조회
    const couponType = await findCouponType(resolvedCouponCode);

    if (!couponType?.product_code || !couponType?.product_name || !couponType?.category) {
      throw new Error("쿠폰 상품 매핑 정보를 찾을 수 없습니다.");
    }

    const productCode = couponType?.product_code ?? null;
    const productName = couponType?.product_name ?? null;
    const category = couponType?.category ?? null;
    const subscriptionRequired = requiresSubscription(category, productCode);
    hasResolvedProduct = true;

    updatedRegistration = await updateRegistration(Number(registration.id), {
      coupon_code: couponType?.coupon_code ?? resolvedCouponCode,
      coupon_name: couponType?.coupon_name ?? couponResponse.couponName,
      product_code: productCode,
      product_name: productName,
      category,
      subscription_required: subscriptionRequired,
    });

    return {
      success: true,
      ...mapRegistrationResponse(updatedRegistration),
      productDesc: couponType?.product_desc ?? null,
      priceLabel: couponType?.price_label ?? null,
      guideTitle: couponType?.guide_title ?? null,
      guideDesc: couponType?.guide_desc ?? null,
      buttonText: couponType?.button_text ?? null,
      featureData: couponType?.feature_data ?? null,
      message: "쿠폰 등록이 완료되었습니다.",
    };
  } catch (error) {
    const updated = await updateRegistration(Number(registration.id), {
      reg_result: "fail",
      status: "등록실패",
      error_msg: error instanceof Error ? error.message : "등록 처리 중 오류가 발생했습니다.",
      ...(hasResolvedProduct
        ? {}
        : {
            category: null,
            product_name: null,
            product_code: null,
            subscription_required: null,
          }),
      registered_at: new Date().toISOString(),
    });

    return {
      success: true,
      ...mapRegistrationResponse(updated),
      message: updated.error_msg,
    };
  }
}

async function handleSubscribe(payload: JsonMap) {
  const registrationId = Number(payload.registrationId);
  const phoneNumber = sanitizePhoneNumber(payload.phoneNumber);
  const couponNumber = sanitizeCouponNumber(payload.couponNumber);
  const productCode = String(payload.productCode ?? "").trim();
  const category = String(payload.category ?? "").trim().toUpperCase();
  const startMode = sanitizeStartMode(payload.startMode);

  assert(Number.isFinite(registrationId) && registrationId > 0, "가입 대상 등록 정보가 없습니다.");
  assert(phoneNumber.length >= 10, "휴대폰 번호를 확인해 주세요.");
  assert(couponNumber.length >= 8, "쿠폰번호를 확인해 주세요.");
  assert(productCode, "가입할 상품 정보를 확인해 주세요.");
  assert(category && category !== "금액권", "가입이 필요한 상품만 처리할 수 있습니다.");

  if (category === "BARO" && !productCode.startsWith("baro_charge_")) {
    assert(["auto", "manual"].includes(startMode ?? ""), "baro 개시 방식을 확인해 주세요.");
  }

  if (category === "ONEPASS") {
    assert(["basic", "period"].includes(startMode ?? ""), "OnePass 유형을 확인해 주세요.");
    if (startMode === "period") {
      throw new Error("OnePass 기간형 요금제 가입은 현재 준비중입니다.");
    }
  }

  const serviceInfo = await fetchServiceInfo(phoneNumber);
  if (!serviceInfo.isSktSubscriber) {
    throw new Error("T 로밍쿠폰은 SKT 가입자만 이용할 수 있습니다.");
  }

  if (serviceInfo.isAdult === false) {
    throw new Error("T 로밍쿠폰은 만 18세 이상부터 이용 가능합니다.");
  }

  if (productCode.startsWith("baro_charge_") && !serviceInfo.existingNaCodes.includes(BARO_ACTIVE_NA_CODE)) {
    await insertPrerequisiteFailPlanLog({
      registration_id: registrationId,
      phone_number: phoneNumber,
      coupon_number: couponNumber,
      product_code: productCode,
      na_code: BARO_ACTIVE_NA_CODE,
      na_name: "baro 활성화",
      existing_na_codes: serviceInfo.existingNaCodes,
      result_message: "baro 1/2/3GB 충전 상품은 baro 활성화 요금제 가입 후 이용할 수 있습니다.",
      error_msg: "baro 1/2/3GB 충전 상품은 baro 활성화 요금제 가입 후 이용할 수 있습니다.",
    });
    throw new Error("baro 1/2/3GB 충전 상품은 baro 활성화 요금제 가입 후 이용할 수 있습니다.");
  }

  const subscriptionResult = await subscribeProduct({
    registrationId,
    phoneNumber,
    couponNumber,
    productCode,
    category,
    startMode,
    existingNaCodes: serviceInfo.existingNaCodes,
  });

  return {
    success: true,
    registrationId,
    phoneNumber,
    productCode,
    category,
    alreadySubscribed: subscriptionResult.alreadySubscribed,
    message: subscriptionResult.message,
    logs: subscriptionResult.logs.map((log) => ({
      id: log.id,
      stepAction: log.step_action,
      naCode: log.na_code,
      naName: log.na_name,
      subResult: log.sub_result,
      resultMessage: log.result_message,
      errorMsg: log.error_msg,
      attemptedAt: log.attempted_at,
    })),
  };
}

async function handleHistory(payload: JsonMap) {
  const phoneNumber = sanitizePhoneNumber(payload.phoneNumber);
  const agreePrivacy = Boolean(payload.agreePrivacy);

  assert(agreePrivacy, "개인정보 동의가 필요합니다.");
  assert(phoneNumber.length >= 10, "휴대폰 번호를 확인해 주세요.");

  const data = await getHistory(phoneNumber);

  return {
    success: true,
    items: data.map((row) => mapRegistrationResponse(row)),
  };
}

async function handleMockSmsSend(payload: JsonMap) {
  const phoneNumber = sanitizePhoneNumber(payload.phoneNumber);
  const purpose = String(payload.purpose ?? "history");

  assert(phoneNumber.length >= 10, "휴대폰 번호를 확인해 주세요.");
  assert(["history", "join"].includes(purpose), "유효하지 않은 인증 목적입니다.");

  const requestId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SMS_AUTH_EXPIRE_SECONDS * 1000).toISOString();

  await insertSmsAuthLog({
    phone_number: phoneNumber,
    purpose,
    status: "sent",
    expires_at: expiresAt,
    sent_at: new Date().toISOString(),
    request_id: requestId,
    provider_name: "mock-fixed-code",
    verified_attempt_count: 0,
    request_payload: {
      phoneNumber,
      purpose,
    },
    response_payload: {
      mock: true,
      expiresAt,
    },
  });

  return {
    success: true,
    requestId,
    expiresAt,
    phoneNumber,
  };
}

async function handleMockSmsVerify(payload: JsonMap) {
  const phoneNumber = sanitizePhoneNumber(payload.phoneNumber);
  const purpose = String(payload.purpose ?? "history");
  const requestId = String(payload.requestId ?? "").trim();
  const authCode = String(payload.authCode ?? "").replace(/\D/g, "").slice(0, 6);

  assert(phoneNumber.length >= 10, "휴대폰 번호를 확인해 주세요.");
  assert(["history", "join"].includes(purpose), "유효하지 않은 인증 목적입니다.");
  assert(requestId, "인증 요청 정보가 없습니다. 인증번호를 다시 요청해주세요.");
  assert(authCode.length === 6, "인증번호 6자리를 입력해 주세요.");

  const log = await getSmsAuthLogByRequestId(requestId);
  assert(log?.id, "인증 요청 정보가 없습니다. 인증번호를 다시 요청해주세요.");
  assert(String(log.phone_number ?? "") === phoneNumber, "인증 요청 정보가 일치하지 않습니다.");
  assert(String(log.purpose ?? "") === purpose, "인증 요청 정보가 일치하지 않습니다.");

  const currentAttempts = Number(log.verified_attempt_count ?? 0);
  if (currentAttempts >= SMS_VERIFY_MAX_ATTEMPTS) {
    await updateSmsAuthLog(Number(log.id), {
      status: "sent",
      verified_attempt_count: currentAttempts,
      last_attempted_at: new Date().toISOString(),
      failure_reason: "max_attempts_exceeded",
    });

    throw new Error("인증번호 입력 가능 횟수를 초과했습니다. 인증번호를 다시 요청해주세요.");
  }

  const nextAttempts = currentAttempts + 1;
  const nowIso = new Date().toISOString();
  const expired = !log.expires_at || new Date(String(log.expires_at)).getTime() <= Date.now();

  if (expired) {
    await updateSmsAuthLog(Number(log.id), {
      status: "expired",
      verified_attempt_count: nextAttempts,
      last_attempted_at: nowIso,
      failure_reason: "expired_code",
    });

    throw new Error("만료된 인증번호입니다. 인증번호를 다시 요청해주세요.");
  }

  if (authCode !== FIXED_SMS_AUTH_CODE) {
    const hasReachedMax = nextAttempts >= SMS_VERIFY_MAX_ATTEMPTS;
    await updateSmsAuthLog(Number(log.id), {
      status: hasReachedMax ? "sent" : "sent",
      verified_attempt_count: nextAttempts,
      last_attempted_at: nowIso,
      failure_reason: hasReachedMax ? "max_attempts_exceeded" : "invalid_code",
    });

    throw new Error(
      hasReachedMax
        ? "인증번호 입력 가능 횟수를 초과했습니다. 인증번호를 다시 요청해주세요."
        : "인증번호를 다시 확인해주세요.",
    );
  }

  await updateSmsAuthLog(Number(log.id), {
    status: "verified",
    verified_attempt_count: nextAttempts,
    last_attempted_at: nowIso,
    verified_at: nowIso,
    failure_reason: null,
  });

  return {
    success: true,
    requestId,
    phoneNumber,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const payload = (await request.json()) as JsonMap;
    const action = String(payload.action ?? "");

    if (action === "register") {
      return json(await handleRegister(payload));
    }

    if (action === "history") {
      return json(await handleHistory(payload));
    }

    if (action === "subscribe") {
      return json(await handleSubscribe(payload));
    }

    if (action === "mock-sms-send") {
      return json(await handleMockSmsSend(payload));
    }

    if (action === "mock-sms-verify") {
      return json(await handleMockSmsVerify(payload));
    }

    return json(
      {
        success: false,
        message: "지원하지 않는 action입니다.",
      },
      { status: 400 },
    );
  } catch (error) {
    return json(
      {
        success: false,
        message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
});
