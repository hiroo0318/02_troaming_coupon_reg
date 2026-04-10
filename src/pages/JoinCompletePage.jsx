import React from "react";

function JoinCompletePage({ joinInfo, onBackHome, onGoHistory }) {
  const alreadySubscribed = Boolean(joinInfo?.alreadySubscribed);
  const title = alreadySubscribed ? "해당 요금제가 이미 가입되어 있습니다." : "요금제 가입이 완료되었습니다.";
  const description =
    joinInfo?.resultMessage ||
    (alreadySubscribed
      ? "선택한 로밍 요금제가 이미 가입된 상태로 확인되었습니다."
      : "선택한 로밍 요금제 가입이 정상적으로 완료되었습니다.");

  return (
    <main className="page-content">
      <section className="result-hero result-hero--success">
        <div className="result-icon result-icon--success">✓</div>
        <h1 className="result-title">{title}</h1>
        <p className="result-desc">{description}</p>
      </section>

      <section className="info-card info-card--notice success-info-card">
        <div className="info-card__content">
          <strong className="info-card__title">{alreadySubscribed ? "가입 확인 정보" : "가입 완료 정보"}</strong>
          <div className="success-info-list">
            <div className="success-info-item">
              <span className="success-info-item__label">상품명</span>
              <strong className="success-info-item__value">{joinInfo?.productName}</strong>
            </div>
            <div className="success-info-item">
              <span className="success-info-item__label">가입 유형</span>
              <strong className="success-info-item__value">{joinInfo?.joinOptionLabel}</strong>
            </div>
            <div className="success-info-item">
              <span className="success-info-item__label">{joinInfo?.detailLabel}</span>
              <strong className="success-info-item__value">{joinInfo?.detailValue}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="info-card info-card--notice">
        <div className="info-card__content">
          <strong className="info-card__title">가입 내역은 T world에서 확인할 수 있습니다</strong>
          <p className="info-card__desc">
            T world 또는 모바일 T world의 T 로밍 메뉴에서 가입한 요금제와 이용 상태를 확인해 주세요.
          </p>
        </div>
      </section>

      <div className="button-stack">
        <button type="button" className="btn-primary btn-primary--compact" onClick={onGoHistory}>
          등록내역 확인하기
        </button>
        <button type="button" className="btn-secondary btn-secondary--compact" onClick={onBackHome}>
          메인으로 이동
        </button>
      </div>
    </main>
  );
}

export default JoinCompletePage;
