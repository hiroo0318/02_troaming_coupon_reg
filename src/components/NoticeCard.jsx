import React from "react";

function NoticeCard({ onOpenPopup }) {
  return (
    <section className="info-card info-card--notice">
      <div className="info-card__icon info-card__icon--blue" aria-hidden="true">
        i
      </div>

      <div className="info-card__content">
        <div className="info-card__head">
          <strong className="info-card__title">등록 전 확인하세요</strong>
          <button
            type="button"
            className="info-card__detail-btn"
            onClick={onOpenPopup}
          >
            상세보기
          </button>
        </div>

        <p className="info-card__desc">
          등록된 쿠폰은 취소가 불가하며, 유효기간 내에 사용하셔야 합니다. 타인에게 양도할 수
          없는 상품일 수 있습니다.
        </p>
      </div>
    </section>
  );
}

export default NoticeCard;
