import React from "react";

function RegisterSuccessPage({ type, onBackHome, onGoHistory }) {
  const contentMap = {
    onepass: {
      productName: "OnePass 500",
      productDesc: "매일 데이터 500MB + 무제한",
      title: "쿠폰 등록이 완료되었습니다!",
      desc: "성공적으로 OnePass 쿠폰이 등록되었습니다.",
      extraTitle: "이제 요금제 가입이 필요합니다",
      extraDesc:
        "OnePass 상품군은 개시일 설정 여부를 선택한 뒤 요금제 가입을 진행할 수 있습니다.",
      buttonText: "요금제 가입하기",
    },
    baro: {
      productName: "baro 6GB",
      productDesc: "baro 데이터 6GB",
      title: "쿠폰 등록이 완료되었습니다!",
      desc: "성공적으로 baro 쿠폰이 등록되었습니다.",
      extraTitle: "이제 요금제 가입이 필요합니다",
      extraDesc:
        "baro 상품군은 자동/수동 개시 옵션에 따라 후속 가입 절차를 진행할 수 있습니다.",
      buttonText: "baro 가입하기",
    },
    voucher: {
      productName: "로밍 금액권 30,000원",
      productDesc: "로밍 서비스 이용 가능한 금액권",
      title: "쿠폰 등록이 완료되었습니다!",
      desc: "성공적으로 로밍 금액권이 등록되었습니다.",
      extraTitle: "별도 요금제 가입이 필요하지 않습니다",
      extraDesc:
        "로밍 금액권 상품은 등록 완료 후 바로 이용 가능한 유형입니다.",
      buttonText: "등록내역 확인하기",
    },
  };

  const content = contentMap[type] || contentMap.onepass;

  return (
    <main className="page-content">
      <section className="result-hero result-hero--success">
        <div className="result-icon result-icon--success">✓</div>
        <h1 className="result-title">{content.title}</h1>
        <p className="result-desc">{content.desc}</p>
      </section>

      <section className="product-card">
        <div className="product-card__thumb"></div>
        <div className="product-card__content">
          <strong className="product-card__name">{content.productName}</strong>
          <p className="product-card__desc">{content.productDesc}</p>
        </div>
      </section>

      <section className="highlight-card">
        <strong className="highlight-card__title">{content.extraTitle}</strong>
        <p className="highlight-card__desc">{content.extraDesc}</p>
      </section>

      <div className="button-stack">
        <button
          type="button"
          className="btn-primary"
          onClick={type === "voucher" ? onGoHistory : onBackHome}
        >
          {content.buttonText}
        </button>

        <button type="button" className="btn-text" onClick={onBackHome}>
          나중에 하기
        </button>
      </div>
    </main>
  );
}

export default RegisterSuccessPage;