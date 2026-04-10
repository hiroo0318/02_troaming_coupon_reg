import { supabase } from "./supabase";

async function invoke(action, payload) {
  const { data, error } = await supabase.functions.invoke("roaming-coupon-api-v6", {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    throw new Error(error.message || "Edge Function 호출에 실패했습니다.");
  }

  if (!data?.success) {
    throw new Error(data?.message || "요청 처리에 실패했습니다.");
  }

  return data;
}

export function submitRegistration(payload) {
  return invoke("register", payload);
}

export function lookupHistory(payload) {
  return invoke("history", payload);
}

export function requestMockSmsAuth(payload) {
  return invoke("mock-sms-send", payload);
}

export function verifyMockSmsAuth(payload) {
  return invoke("mock-sms-verify", payload);
}

export function subscribeRoamingProduct(payload) {
  return invoke("subscribe", payload);
}
