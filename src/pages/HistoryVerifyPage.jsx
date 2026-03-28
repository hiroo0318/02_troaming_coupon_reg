import React, { useState } from "react";

function HistoryVerifyPage({ onVerified }) {
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <main className="page-content">
      <section className="hero hero--compact">
        <p className="hero-badge">HISTORY CHECK</p>
        <h1 className="hero-title hero-title--sm">
          등록 내역 조회를 위해
          <br />
          휴대폰번호를 입력하세요.
        </h1>
        <p className="hero-desc">
          등록 시 사용한 휴대폰번호를 입력하면 최근 등록 내역을 확인할 수 있습니다.
        </p>
      </section>

      <section className="register-card">
        <div className="form-group">
          <label htmlFor="historyPhoneNumber" className="form-label">
            휴대폰 번호 입력
          </label>
          <input
            id="historyPhoneNumber"
            type="tel"
            className="form-input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="조회할 휴대폰번호를 입력하세요"
            maxLength={11}
          />
          <p className="form-help">본인 휴대폰번호를 '-' 없이 입력해주세요.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onVerified}
          disabled={phoneNumber.trim().length < 10}
        >
          내역 조회하기
        </button>
      </section>
    </main>
  );
}

export default HistoryVerifyPage;