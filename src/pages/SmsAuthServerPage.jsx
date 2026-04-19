import React, { useEffect, useMemo, useState } from "react";
import { formatPhoneNumber } from "../lib/format";
import { requestMockSmsAuth, verifyMockSmsAuth } from "../lib/roamingApi";

const SMS_VERIFY_MAX_ATTEMPTS_MESSAGE = "인증번호 입력 가능 횟수를 초과했습니다. 인증번호를 다시 요청해주세요.";

function formatRemainingTime(seconds) {
  const minute = String(Math.floor(seconds / 60)).padStart(2, "0");
  const second = String(seconds % 60).padStart(2, "0");
  return `${minute}:${second}`;
}

function SmsAuthServerPage({ mode = "join", phoneNumber = "", onBack, onVerified }) {
  const [authCode, setAuthCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [requestId, setRequestId] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
  const purpose = mode === "join" ? "join" : "history";
  const pageTitleLines =
    mode === "join"
      ? ["요금제 가입을 위해", "SMS 인증을 진행하세요."]
      : ["등록 내역 조회를 위해", "SMS 인증을 진행하세요."];
  const pageDesc =
    mode === "join"
      ? "등록한 휴대폰번호로 인증번호를 요청하고 인증을 완료하면 요금제 가입이 진행됩니다."
      : "입력한 휴대폰번호로 인증번호를 요청하고 인증을 완료하면 등록 내역을 조회할 수 있습니다.";

  const remainingSeconds = useMemo(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt - now) / 1000));
  }, [expiresAt, now]);

  const isExpired = isCodeSent && remainingSeconds === 0;
  const isAttemptLocked = errorMessage === SMS_VERIFY_MAX_ATTEMPTS_MESSAGE;

  useEffect(() => {
    if (!expiresAt || isExpired) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(timer);
  }, [expiresAt, isExpired]);

  const handleRequestCode = async () => {
    if (isRequesting) return;

    setIsRequesting(true);
    setErrorMessage("");
    try {
      const result = await requestMockSmsAuth({
        phoneNumber,
        purpose,
      });

      setIsCodeSent(true);
      setAuthCode("");
      setRequestId(result.requestId);
      setExpiresAt(new Date(result.expiresAt).getTime());
      setNow(Date.now());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "인증번호 요청 중 오류가 발생했습니다.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerify = async () => {
    if (!isCodeSent || authCode.length !== 6 || isExpired || isAttemptLocked || isVerifying) return;

    setIsVerifying(true);
    setErrorMessage("");
    try {
      await verifyMockSmsAuth({
        phoneNumber,
        purpose,
        requestId,
        authCode,
      });

      await onVerified({ authCode, requestId });
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
          {pageTitleLines[0]}
          <br />
          {pageTitleLines[1]}
        </h1>
        <p className="hero-desc">{pageDesc}</p>
      </section>

      <section className="register-card">
        <div className="form-group">
          <label className="form-label">인증 휴대폰번호</label>
          <div className="sms-auth-row">
            <input type="text" className="form-input" value={formattedPhoneNumber} readOnly />
            <button type="button" className="btn-inline" onClick={handleRequestCode} disabled={isRequesting}>
              {isRequesting ? "요청중" : isCodeSent ? "재발송" : "인증번호 요청"}
            </button>
          </div>
          <p className="form-help">
            {mode === "join"
              ? "등록한 휴대폰번호로만 인증할 수 있습니다."
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
                ? "인증번호 입력 시간이 종료되었습니다. 인증번호 재발송을 클릭해 주세요."
                : isAttemptLocked
                  ? SMS_VERIFY_MAX_ATTEMPTS_MESSAGE
                : `${formatRemainingTime(remainingSeconds)} 내에 인증번호를 입력해주세요.`
              : "먼저 인증번호를 요청한 뒤 인증을 진행해주세요."}
          </p>
          {errorMessage ? <p className="form-help form-help--error">{errorMessage}</p> : null}
        </div>

        <div className="button-stack">
          <button
            type="button"
            className="btn-primary btn-primary--compact"
            disabled={!isCodeSent || authCode.length !== 6 || isExpired || isAttemptLocked || isVerifying}
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

export default SmsAuthServerPage;
