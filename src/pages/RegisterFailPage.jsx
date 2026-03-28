import React from "react";

function RegisterFailPage({ onRetry, onBackHome }) {
  return (
    <main className="page-content">
      <section className="result-hero result-hero--fail">
        <div className="result-icon result-icon--fail">!</div>
        <h1 className="result-title">쿠폰 등록에 실패하였습니다.</h1>
        <p className="result-desc">
          이미 등록된 쿠폰이거나 유효하지 않은 번호입니다.
        </p>
      </section>

      <section className="info-card info-card--danger">
        <div className="info-card__icon info-card__icon--red" aria-hidden="true">
          !
        </div>
        <div className="info-card__content">
          <strong className="info-card__title">도움이 필요하신가요?</strong>
          <p className="info-card__desc">
            번호를 다시 확인해 주시거나, 고객센터(114)로 문의해 주세요.
          </p>
        </div>
      </section>

      <div className="button-stack">
        <button type="button" className="btn-primary" onClick={onRetry}>
          다시 시도하기
        </button>
        <button type="button" className="btn-secondary" onClick={onBackHome}>
          메인으로 이동
        </button>
      </div>
    </main>
  );
}

export default RegisterFailPage;