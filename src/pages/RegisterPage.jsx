import React, { useState } from "react";

function RegisterPage({ onBackHome, onGoSuccess, onGoFail }) {
  const [couponNumber, setCouponNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const isEnabled =
    couponNumber.trim().length >= 11 &&
    phoneNumber.trim().length >= 10 &&
    agreePrivacy;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isEnabled) return;

    if (couponNumber.startsWith("111")) {
      onGoSuccess("onepass");
      return;
    }

    if (couponNumber.startsWith("222")) {
      onGoSuccess("baro");
      return;
    }

    if (couponNumber.startsWith("333")) {
      onGoSuccess("voucher");
      return;
    }

    onGoFail();
  };

  return (
    <main className="page-content">
      <section className="hero hero--compact">
        <p className="hero-badge">T-Roaming coupon</p>
        <h1 className="hero-title hero-title--sm">
          쿠폰 정보를 입력하고
          <br />
          등록을 진행하세요.
        </h1>
        <p className="hero-desc">
          쿠폰번호와 휴대폰번호를 입력한 뒤 동의 후 등록할 수 있습니다.
        </p>
      </section>

      <section className="register-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="couponNumber" className="form-label">
              쿠폰 번호 입력
            </label>
            <input
              id="couponNumber"
              type="text"
              className="form-input"
              value={couponNumber}
              onChange={(e) => setCouponNumber(e.target.value)}
              placeholder="11~12자리 번호를 입력하세요"
              maxLength={12}
            />
            <p className="form-help">예시: 111로 시작하면 OnePass 완료 화면이 표시됩니다.</p>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              휴대폰 번호 입력
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className="form-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="등록할 휴대폰번호를 입력하세요"
              maxLength={11}
            />
            <p className="form-help">본인 휴대폰번호를 '-' 없이 입력해주세요.</p>
          </div>

          <label className="agree-row agree-row--interactive">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
            />
            <span className="agree-row__check"></span>
            <span className="agree-row__label">
              개인정보 수집 및 이용 동의 <em>(필수)</em>
            </span>
            <span className="agree-row__link">약관 보기</span>
          </label>

          <div className="button-stack">
            <button type="submit" className="btn-primary" disabled={!isEnabled}>
              등록하기
            </button>
            <button type="button" className="btn-secondary" onClick={onBackHome}>
              메인으로 돌아가기
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default RegisterPage;