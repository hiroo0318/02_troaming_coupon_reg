import React, { useState } from "react";
import NoticeCard from "../components/NoticeCard";
import NoticePopup from "../components/NoticePopup";

function MainPage({ onGoRegister, onGoSuccess, onGoFail }) {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const noticeItems = [];

  return (
    <main className="page-content">
      <section className="hero">
        <p className="hero-badge">T-Roaming coupon</p>
        <h1 className="hero-title">
          준비하신 쿠폰을
          <br />
          <span>지금 등록하세요.</span>
        </h1>
        <p className="hero-desc">
          보유하신 T로밍 쿠폰 번호를 입력하시면 바로 로밍 혜택을 받으실 수 있습니다.
        </p>
      </section>

      <section className="register-card">
        <div className="form-group">
          <label className="form-label">쿠폰 번호 입력</label>
          <div className="input-wrap">
            <input
              type="text"
              className="form-input"
              placeholder="11~12자리 번호를 입력하세요"
              readOnly
            />
            <span className="input-icon" aria-hidden="true"></span>
          </div>
          <p className="form-text">하이픈(-) 없이 숫자만 입력해주세요.</p>
        </div>

        <div className="form-group">
          <label className="form-label">휴대폰 번호 입력</label>
          <input
            type="text"
            className="form-input"
            placeholder="등록할 휴대폰번호를 입력하세요"
            readOnly
          />
          <p className="form-text">본인 휴대폰번호를 '-' 없이 입력해주세요.</p>
        </div>

        <div className="agree-list">
          <div className="agree-item">
            <span className="agree-check" aria-hidden="true"></span>
            <span className="agree-label">
              개인정보 수집 및 이용 동의 <em>(필수)</em>
            </span>
            <button type="button" className="agree-link">
              약관 보기
            </button>
          </div>
        </div>

        <div className="button-area">
          <button type="button" className="btn-primary" onClick={onGoRegister}>
            등록하기
          </button>
        </div>

        <div className="dev-button-row">
          <button type="button" className="btn-chip" onClick={() => onGoSuccess("onepass")}>
            완료(OnePass)
          </button>
          <button type="button" className="btn-chip" onClick={() => onGoSuccess("baro")}>
            완료(baro)
          </button>
          <button type="button" className="btn-chip" onClick={() => onGoSuccess("voucher")}>
            완료(금액권)
          </button>
          <button type="button" className="btn-chip btn-chip--ghost" onClick={onGoFail}>
            실패
          </button>
        </div>
      </section>

      <NoticeCard onOpenPopup={() => setIsNoticeOpen(true)} />

      <section className="info-card info-card--help">
        <div className="info-card__icon info-card__icon--purple" aria-hidden="true">
          ?
        </div>
        <div className="info-card__content">
          <strong className="info-card__title">도움이 필요하신가요?</strong>
          <p className="info-card__desc">
            쿠폰 번호가 올바르지 않거나 등록이 되지 않는 경우 고객센터(114)로 문의해주세요.
          </p>
        </div>
      </section>

      <section className="promo-banner">
        <div className="promo-banner__dim"></div>
        <div className="promo-banner__text">
          <p className="promo-banner__eyebrow">T-Roaming Anywhere</p>
          <strong className="promo-banner__title">
            전 세계 어디서나
            <br />
            끊김 없는 연결
          </strong>
        </div>
      </section>

      <NoticePopup
        open={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        items={noticeItems}
      />
    </main>
  );
}

export default MainPage;
