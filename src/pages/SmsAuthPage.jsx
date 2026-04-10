import React, { useState } from "react";

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

function SmsAuthPage({ mode = "join", phoneNumber = "", onBack, onVerified }) {
  const [lookupPin, setLookupPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
  const pageTitle =
    mode === "join" ? "요금제 가입 전 조회 PIN을 확인하세요." : "등록 내역 조회를 위해 조회 PIN을 입력하세요.";
  const pageDesc =
    mode === "join"
      ? "등록 시 설정한 조회 PIN을 확인한 뒤 같은 휴대폰번호로 요금제 가입을 진행합니다."
      : "등록 시 설정한 조회 PIN을 확인하면 같은 휴대폰번호의 등록 내역을 조회할 수 있습니다.";

  const handleVerify = async () => {
    if (lookupPin.length !== 6 || isVerifying) return;

    setIsVerifying(true);
    setErrorMessage("");
    try {
      await onVerified({ lookupPin });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "PIN 확인 중 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="page-content">
      <section className="hero hero--compact">
        <p className="hero-badge">PIN AUTH</p>
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
          <input type="text" className="form-input" value={formattedPhoneNumber} readOnly />
          <p className="form-help">
            {mode === "join"
              ? "등록된 휴대폰번호로만 가입 확인을 진행할 수 있습니다."
              : "입력한 휴대폰번호와 등록 시 설정한 PIN이 일치해야 조회할 수 있습니다."}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="lookupPin" className="form-label">
            조회 PIN 입력
          </label>
          <input
            id="lookupPin"
            type="password"
            className="form-input"
            value={lookupPin}
            onChange={(event) => setLookupPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="등록 시 설정한 6자리 PIN을 입력하세요"
            maxLength={6}
            inputMode="numeric"
          />
          <p className="form-help">
            내부 테스트용 페이지에서는 SMS 대신 PIN으로 조회 및 가입 확인을 진행합니다.
          </p>
          {errorMessage ? <p className="form-help form-help--error">{errorMessage}</p> : null}
        </div>

        <div className="button-stack">
          <button
            type="button"
            className="btn-primary btn-primary--compact"
            disabled={lookupPin.length !== 6 || isVerifying}
            onClick={handleVerify}
          >
            {isVerifying ? "확인중..." : "PIN 확인"}
          </button>
          <button type="button" className="btn-secondary btn-secondary--compact" onClick={onBack}>
            이전으로
          </button>
        </div>
      </section>
    </main>
  );
}

export default SmsAuthPage;
