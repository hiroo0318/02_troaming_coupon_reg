import React, { useEffect, useMemo, useState } from "react";

const AUTH_EXPIRE_SECONDS = 180;
const DEMO_AUTH_CODE = import.meta.env.VITE_FIXED_AUTH_CODE || "123456";

function formatPhoneNumber(value = "") {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return value;
}

function formatRemainingTime(seconds) {
  const minute = String(Math.floor(seconds / 60)).padStart(2, "0");
  const second = String(seconds % 60).padStart(2, "0");
  return `${minute}:${second}`;
}

function SmsAuthMockPage({ mode = "join", phoneNumber = "", onBack, onVerified }) {
  const [authCode, setAuthCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
  const pageTitle =
    mode === "join" ? "요금제 가입을 위해 SMS 인증을 진행하세요." : "등록 내역 조회를 위해 SMS 인증을 진행하세요.";
  const pageDesc =
    mode === "join"
      ? "등록된 휴대폰번호로 인증번호를 발송해 본인 확인 후 가입을 진행합니다."
      : "입력한 휴대폰번호로 인증번호를 발송해 본인 확인 후 등록 내역을 조회합니다.";

  const remainingSeconds = useMemo(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt - now) / 1000));
  }, [expiresAt, now]);

  const isExpired = isCodeSent && remainingSeconds === 0;

  useEffect(() => {
    if (!expiresAt || isExpired) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(timer);
  }, [expiresAt, isExpired]);

  const handleRequestCode = () => {
    setIsCodeSent(true);
    setAuthCode("");
    setErrorMessage("");
    setNow(Date.now());
    setExpiresAt(Date.now() + AUTH_EXPIRE_SECONDS * 1000);
  };

  const handleVerify = async () => {
    if (!isCodeSent || authCode.length !== 6 || isExpired || isVerifying) return;

    setIsVerifying(true);
    setErrorMessage("");
    try {
      const expiredAtSubmit = !expiresAt || Date.now() >= expiresAt;

      if (expiredAtSubmit) {
        throw new Error("만료된 인증번호입니다. 인증번호를 다시 요청해주세요.");
      }

      if (authCode !== DEMO_AUTH_CODE) {
        throw new Error("인증번호를 다시 확인해주세요.");
      }

      await onVerified({ authCode });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "인증 확인 중 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="page-content">
      <section className="hero hero--compact">
        <p className="hero-badge">SMS AUTH</p>
        <h1 className="hero-title hero-title--sm">
          {pageTitle.split(" ").slice(0, -2).join(" ")}
          <br />
          {pageTitle.split(" ").slice(-2).join(" ")}
        </h1>
        <p className="hero-desc">{pageDesc}</p>
      </section>

      <section className="register-card">
        <div className="form-group">
          <label className="form-label">인증 휴대폰번호</label>
          <div className="sms-auth-row">
            <input type="text" className="form-input" value={formattedPhoneNumber} readOnly />
            <button type="button" className="btn-inline" onClick={handleRequestCode}>
              {isCodeSent ? "재발송" : "인증번호 요청"}
            </button>
          </div>
          <p className="form-help">
            {mode === "join"
              ? "등록된 휴대폰번호로만 인증할 수 있습니다."
              : "입력한 휴대폰번호로 인증번호를 발송합니다."}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="authCode" className="form-label">
            인증번호 입력
          </label>
          <input
            id="authCode"
            type="text"
            className="form-input"
            value={authCode}
            onChange={(event) => setAuthCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6자리 인증번호를 입력하세요"
            maxLength={6}
            inputMode="numeric"
          />
          <p className="form-help">
            {isCodeSent
              ? isExpired
                ? "만료된 인증번호입니다. 인증번호를 재발송해주세요."
                : `${formatRemainingTime(remainingSeconds)} 내에 인증번호를 입력해주세요.`
              : "먼저 인증번호를 요청한 후 확인을 진행해주세요."}
          </p>
          {errorMessage ? <p className="form-help form-help--error">{errorMessage}</p> : null}
        </div>

        <div className="button-stack">
          <button
            type="button"
            className="btn-primary btn-primary--compact"
            disabled={!isCodeSent || authCode.length !== 6 || isExpired || isVerifying}
            onClick={handleVerify}
          >
            {isVerifying ? "확인중..." : mode === "join" ? "가입 진행" : "인증 확인"}
          </button>
          <button type="button" className="btn-secondary btn-secondary--compact" onClick={onBack}>
            이전으로
          </button>
        </div>
      </section>
    </main>
  );
}

export default SmsAuthMockPage;
