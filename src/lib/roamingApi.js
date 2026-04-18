import { supabase } from "./supabase";

// External IF calls can require a VPN/company-network origin, so the frontend
// can switch between Supabase Edge and a localhost bridge with env vars.
const apiMode = import.meta.env.VITE_API_MODE ?? "supabase";
const localBridgeUrl = (import.meta.env.VITE_LOCAL_BRIDGE_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");

async function invokeLocalBridge(action, payload) {
  const response = await fetch(`${localBridgeUrl}/api/roaming`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Local bridge 호출에 실패했습니다.");
  }

  if (!data?.success) {
    throw new Error(data?.message || "요청 처리에 실패했습니다.");
  }

  return data;
}

async function invoke(action, payload) {
  // Internal testers can route requests through their own PC by using the
  // localhost bridge instead of the deployed Edge Function.
  if (apiMode === "local-bridge") {
    return invokeLocalBridge(action, payload);
  }

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
