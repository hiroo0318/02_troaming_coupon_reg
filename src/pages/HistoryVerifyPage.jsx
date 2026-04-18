import React, { useEffect, useState } from "react";
import PrivacyConsentPopup from "../components/PrivacyConsentPopup";

function HistoryVerifyPage({ initialPhoneNumber = "", onVerified }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    setPhoneNumber(initialPhoneNumber);
    setAgreePrivacy(false);
  }, [initialPhoneNumber]);

  const isEnabled = phoneNumber.trim().length >= 10 && agreePrivacy;

  const handleLookup = () => {
    if (!isEnabled) return;
    onVerified({ phoneNumber, agreePrivacy });
  };

  return (
    <main className="page-content">
      <section className="hero hero--compact">
        <p className="hero-badge">HISTORY CHECK</p>
        <h1 className="hero-title hero-title--sm">
          등록 내역 조회를 위해
          <br />
          휴대폰번호를 입력하세요.
        </h1>
      </section>

      <section className="register-card">
        <div className="form-group">
          <label htmlFor="historyPhoneNumber" className="form-label">
            휴대폰번호
          </label>
          <input
            id="historyPhoneNumber"
            type="tel"
            className="form-input"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ""))}
            placeholder="휴대폰번호를 입력하세요"
            maxLength={11}
          />
        </div>

        <label className="agree-row agree-row--interactive">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(event) => setAgreePrivacy(event.target.checked)}
          />
          <span className="agree-row__check"></span>
          <span className="agree-row__label">
            개인정보 수집 및 이용 동의 <em>(필수)</em>
          </span>
          <button
            type="button"
            className="agree-row__link"
            onClick={(event) => {
              event.preventDefault();
              setIsPrivacyOpen(true);
            }}
          >
            상세보기
          </button>
        </label>

        <div className="button-area">
          <button
            type="button"
            className="btn-primary btn-primary--compact"
            onClick={handleLookup}
            disabled={!isEnabled}
          >
            다음
          </button>
        </div>
      </section>
      <PrivacyConsentPopup
        open={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        variant="history"
      />
    </main>
  );
}

export default HistoryVerifyPage;
