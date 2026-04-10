import React, { useState } from "react";
import AlertPopup from "../components/AlertPopup";
import NoticeCard from "../components/NoticeCard";
import NoticePopup from "../components/NoticePopup";
import PrivacyConsentPopup from "../components/PrivacyConsentPopup";
import PromoBanner from "../components/PromoBanner";
import promoBanner01 from "../assets/promo-banners/roaming-mobile-01.svg";
import promoBanner02 from "../assets/promo-banners/roaming-mobile-02.svg";

function formatCouponNumber(value = "") {
  return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
}

function formatPhoneNumber(value = "") {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return value;
}

function MainPage({ onSubmitRegister }) {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponNumber, setCouponNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const noticeItems = [
    "SKT 가입 고객만 등록 및 사용이 가능하며, 타사 고객은 구매 후 선물만 가능합니다.",
    "구매한 카드는 반드시 등록을 완료해야 T 로밍 서비스 이용 시 쿠폰 혜택이 적용됩니다.",
    "OnePass 및 baro GB 계열 쿠폰은 등록 후 해당 로밍 요금제에 가입해야 정상적으로 혜택이 적용됩니다.",
    "로밍 서비스 이용 전 해당 요금제의 가입 여부를 꼭 확인해 주세요.",
    "선불폰 및 한도요금제(Ting, Inee 등)는 T 로밍 서비스 이용이 제한될 수 있습니다.",
    "쿠폰 적용 순서는 baro GB 카드, OnePass 카드 > T 로밍쿠폰(차감형) > T 로밍 부가서비스 순입니다.",
    "카드 등록 후 로밍 비대상 요금제로 변경하거나 명의변경, 번호이동, 해지, 일시정지 시 쿠폰은 자동 소멸되어 이용할 수 없습니다.",
    "등록한 카드는 중도해지하거나 제3자에게 양도할 수 없습니다.",
    "등록한 카드는 등록일로부터 12개월 동안 사용할 수 있으며, 기간이 지나면 자동 소멸됩니다.",
    "개시일을 지정하는 요금제는 신청 시각부터 한국 시각 기준 24시간 단위로 적용되며, 종료 시점에 데이터 로밍이 자동 차단됩니다.",
    "데이터 로밍, 음성통화, SMS/MMS 발신을 1회 이상 사용한 경우 기본 제공 혜택 잔여분의 이월 및 환불은 불가합니다.",
    "환불은 고객센터를 통해 가능하며, 미등록 쿠폰 또는 사용되지 않은 카드에 한해 수수료 차감 후 처리될 수 있습니다. 프로모션 또는 이벤트로 지급된 쿠폰은 환불이 불가합니다.",
  ];
  const promoItems = [
    {
      id: "mobile-roaming",
      eyebrow: "T-Roaming Mobile",
      titleLines: ["여행 중에도 휴대폰으로", "바로 연결되는 로밍"],
      image: promoBanner01,
    },
    {
      id: "travel-phone",
      eyebrow: "Global Data Pass",
      titleLines: ["해외에서도 손안에서", "끊김 없이 데이터 연결"],
      image: promoBanner02,
    },
  ];
  const isEnabled =
    couponNumber.trim().length >= 8 &&
    couponNumber.trim().length <= 32 &&
    phoneNumber.trim().length >= 10 &&
    phoneNumber.trim().length <= 11 &&
    agreePrivacy;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isEnabled || isSubmitting) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmRegister = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitRegister({
        couponNumber,
        phoneNumber,
        agreePrivacy,
      });
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

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
              onChange={(event) => setCouponNumber(event.target.value.replace(/\D/g, ""))}
              placeholder="쿠폰 번호를 입력하세요"
              maxLength={32}
            />
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
              onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ""))}
              placeholder="등록할 휴대폰번호를 입력하세요"
              maxLength={11}
            />
            <p className="form-text">본인 휴대폰번호를 '-' 없이 입력해주세요.</p>
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
            <button type="submit" className="btn-primary" disabled={!isEnabled || isSubmitting}>
              {isSubmitting ? "처리중..." : "등록하기"}
            </button>
          </div>
        </form>
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

      <PromoBanner items={promoItems} />

      <AlertPopup
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="입력하신 정보를 확인해 주세요"
        description="아래 정보가 맞다면 등록하기를 눌러 등록을 진행해 주세요."
        rows={[
          { label: "휴대폰번호", value: formatPhoneNumber(phoneNumber) },
          { label: "쿠폰번호", value: formatCouponNumber(couponNumber) },
        ]}
        secondaryText="다시 입력"
        primaryText={isSubmitting ? "처리중..." : "등록하기"}
        onSecondary={() => setIsConfirmOpen(false)}
        onPrimary={handleConfirmRegister}
      />

      <NoticePopup
        open={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        items={noticeItems}
      />
      <PrivacyConsentPopup
        open={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        variant="register"
      />
    </main>
  );
}

export default MainPage;
