import React from "react";

const consentContentMap = {
  register: {
    purpose: "쿠폰 등록을 위해 본인 확인 및 등록 처리에 필요한 정보를 수집합니다.",
    impact: "동의하지 않을 경우 쿠폰 등록 서비스 이용이 제한될 수 있습니다.",
    rows: [
      {
        item: "휴대폰번호",
        purpose: "본인 확인 및 등록 결과 확인",
        retention: "관련 법령 및 내부 정책에 따른 보관 기간까지",
      },
      {
        item: "쿠폰번호",
        purpose: "쿠폰 유효성 확인 및 등록 처리",
        retention: "처리 목적 달성 후 지체 없이 파기",
      },
      {
        item: "접속 정보",
        purpose: "부정 이용 방지 및 오류 대응",
        retention: "관련 법령 및 내부 정책에 따른 보관 기간까지",
      },
    ],
  },
  join: {
    purpose: "등록된 쿠폰에 맞는 요금제 가입과 개시 설정 반영을 위해 정보를 수집합니다.",
    impact: "동의하지 않을 경우 요금제 가입 서비스 이용이 제한될 수 있습니다.",
    rows: [
      {
        item: "휴대폰번호",
        purpose: "가입 대상 회선 확인 및 가입 처리",
        retention: "관련 법령 및 내부 정책에 따른 보관 기간까지",
      },
      {
        item: "쿠폰번호 / 상품 코드",
        purpose: "쿠폰 매핑 상품 확인 및 가입 처리",
        retention: "처리 목적 달성 후 지체 없이 파기",
      },
      {
        item: "개시 방식 / 개시일",
        purpose: "가입 옵션 반영 및 개시 시점 설정",
        retention: "처리 목적 달성 후 지체 없이 파기",
      },
    ],
  },
  history: {
    purpose: "등록 내역 조회를 위해 본인 확인 및 조회 처리에 필요한 정보를 수집합니다.",
    impact: "동의하지 않을 경우 등록 내역 조회 서비스 이용이 제한될 수 있습니다.",
    rows: [
      {
        item: "휴대폰번호",
        purpose: "본인 확인 및 등록 내역 조회",
        retention: "관련 법령 및 내부 정책에 따른 보관 기간까지",
      },
      {
        item: "접속 정보",
        purpose: "부정 조회 방지 및 오류 대응",
        retention: "관련 법령 및 내부 정책에 따른 보관 기간까지",
      },
    ],
  },
};

function PrivacyConsentPopup({ open, onClose, variant = "register" }) {
  React.useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const content = consentContentMap[variant] || consentContentMap.register;

  return (
    <div className="layer-popup" role="dialog" aria-modal="true" aria-labelledby="privacyConsentTitle">
      <button
        type="button"
        className="layer-popup__dim"
        aria-label="팝업 닫기"
        onClick={onClose}
      ></button>

      <div className="layer-popup__panel">
        <div className="layer-popup__head">
          <strong id="privacyConsentTitle" className="full-layer__title">
            개인정보 수집 및 이용동의
          </strong>
          <button
            type="button"
            className="layer-popup__close"
            aria-label="팝업 닫기"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="layer-popup__body">
          <p className="full-layer__lead">{content.purpose}</p>

          <section className="consent-table-card">
            <table className="consent-table">
              <thead>
                <tr>
                  <th>수집 항목</th>
                  <th>이용 목적</th>
                  <th>보유 기간</th>
                </tr>
              </thead>
              <tbody>
                {content.rows.map((row) => (
                  <tr key={row.item}>
                    <td>{row.item}</td>
                    <td>{row.purpose}</td>
                    <td>{row.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="consent-impact-card">
            <strong className="consent-impact-card__title">미동의 시 안내</strong>
            <p className="consent-impact-card__desc">{content.impact}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyConsentPopup;
