import React from "react";

function RegisterFailPage({ result, onBackHome }) {
  const isJoinFailure = result?.failureStage === "subscribe";
  const title = isJoinFailure ? "요금제 가입에 실패하였습니다." : "쿠폰 등록에 실패하였습니다.";
  const description =
    result?.errorMsg ||
    result?.message ||
    (isJoinFailure ? "요금제 가입 처리 중 문제가 발생했습니다." : "등록 처리 중 문제가 발생했습니다.");

  return (
    <main className="page-content">
      <section className="result-hero result-hero--fail">
        <div className="result-icon result-icon--fail">!</div>
        <h1 className="result-title">{title}</h1>
        <p className="result-desc">{description}</p>
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
        <button type="button" className="btn-secondary btn-secondary--compact" onClick={onBackHome}>
          메인으로 이동
        </button>
      </div>
    </main>
  );
}

export default RegisterFailPage;
