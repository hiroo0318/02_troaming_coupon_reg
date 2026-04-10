import React, { useEffect, useState } from "react";
import baro6GbThumb from "../assets/coupon-thumbnails/baro-6gb.png";
import onePass500Thumb from "../assets/coupon-thumbnails/onepass-500.png";
import voucherThumb from "../assets/coupon-thumbnails/voucher.png";
import PrivacyConsentPopup from "../components/PrivacyConsentPopup";

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

function formatCalendarMonth(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function formatSelectedDate(date) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}. ${month}. ${day} (${weekdays[date.getDay()]})`;
}

function buildCalendarDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ key: `empty-${index}`, empty: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: `day-${day}`,
      day,
      selected: day === date.getDate(),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}`, empty: true });
  }

  return cells;
}

function isSameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function RegisterSuccessPage({ type, successInfo, onBackHome, onGoHistory, onGoJoinAuth }) {
  const today = startOfDay(new Date());
  const maxSelectableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);
  const [onePassStartMode, setOnePassStartMode] = useState("period");
  const [baroStartMode, setBaroStartMode] = useState("auto");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [onePassSelectedDate, setOnePassSelectedDate] = useState(today);
  const [onePassVisibleMonth, setOnePassVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [isThumbError, setIsThumbError] = useState(false);

  const contentMap = {
    onepass: {
      productName: "OnePass 500",
      productDesc: "매일 데이터 500MB + 무제한",
      title: "쿠폰 등록이 완료되었습니다!",
      guideTitle: "이제 요금제 가입이 필요합니다",
      guideDesc:
        "OnePass 상품군은 기본형 또는 기간형을 선택한 뒤 요금제 가입을 진행할 수 있습니다.",
      buttonText: "요금제 가입하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "onepass",
      featureTiles: [
        { title: "매일 데이터", value: "500MB + 무제한" },
        { title: "대상 국가", value: "주요 국가 이용 가능" },
      ],
      productMeta: ["Baro 통화 포함", "문자 기본 제공"],
      productThumb: onePass500Thumb,
    },
    baro: {
      productName: "baro 6GB",
      productDesc: "데이터 6GB, 30일 동안 넉넉하게 사용",
      title: "쿠폰 등록이 완료되었습니다!",
      guideTitle: "이제 요금제 가입이 필요합니다",
      guideDesc:
        "등록된 쿠폰에 맞는 baro 요금제를 자동 개시 또는 수동 개시 방식으로 가입할 수 있습니다.",
      buttonText: "가입하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "baro",
      featureList: [
        { title: "전세계 190개국 지원", desc: "여행지 어디서나 끊김 없는 연결" },
        { title: "데이터 6GB 제공", desc: "30일 동안 넉넉하게 사용" },
        { title: "baro 통화 혜택", desc: "쿠폰에 맞는 요금제 기준으로 적용" },
      ],
      productThumb: baro6GbThumb,
    },
    voucher: {
      productName: "로밍 금액권 30,000원",
      productDesc: "로밍 서비스 이용 가능한 금액권",
      title: "쿠폰 등록이 완료되었습니다!",
      guideTitle: "금액권이 정상 등록되었습니다",
      guideDesc:
        "별도 요금제 가입 없이 T 로밍 서비스 이용 시 등록된 금액권에서 우선 차감되어 사용됩니다.",
      buttonText: "등록내역 확인하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "voucher",
      productMeta: ["등록 즉시 사용 가능", "후속 가입 불필요"],
      voucherNotes: [
        "해외 로밍 이용 요금 결제 시 등록된 금액권에서 우선 차감됩니다.",
        "금액권 정보와 사용 내역은 등록 내역 화면에서 확인할 수 있습니다.",
      ],
      productThumb: voucherThumb,
    },
  };

  const content = contentMap[type] || contentMap.onepass;
  useEffect(() => {
    setIsThumbError(false);
  }, [type]);
  const isJoinActionEnabled = type === "voucher" || agreePrivacy;
  const couponNumberText = formatCouponNumber(successInfo?.couponNumber || "");
  const phoneNumberText = formatPhoneNumber(successInfo?.phoneNumber || "");
  const calendarDays = buildCalendarDays(onePassVisibleMonth).map((item) => {
    if (item.empty) return item;

    const itemDate = new Date(
      onePassVisibleMonth.getFullYear(),
      onePassVisibleMonth.getMonth(),
      item.day,
    );
    const itemTime = itemDate.getTime();
    const isDisabled = itemTime < today.getTime() || itemTime > maxSelectableDate.getTime();

    return {
      ...item,
      selected:
        item.day === onePassSelectedDate.getDate() && isSameMonth(onePassVisibleMonth, onePassSelectedDate),
      disabled: isDisabled,
    };
  });
  const canGoPrevMonth =
    onePassVisibleMonth.getFullYear() > today.getFullYear() ||
    (onePassVisibleMonth.getFullYear() === today.getFullYear() &&
      onePassVisibleMonth.getMonth() > today.getMonth());
  const canGoNextMonth =
    onePassVisibleMonth.getFullYear() < maxSelectableDate.getFullYear() ||
    (onePassVisibleMonth.getFullYear() === maxSelectableDate.getFullYear() &&
      onePassVisibleMonth.getMonth() < maxSelectableDate.getMonth());

  const handlePrimaryAction = () => {
    if (type === "voucher") {
      onGoHistory();
      return;
    }

    if (type === "onepass") {
      onGoJoinAuth({
        type,
        productName: content.productName,
        joinOptionLabel: onePassStartMode === "period" ? "기간형" : "기본형",
        detailLabel: onePassStartMode === "period" ? "개시일" : "적용 시점",
        detailValue:
          onePassStartMode === "period"
            ? formatSelectedDate(onePassSelectedDate)
            : "현지 첫 데이터 사용 시점",
      });
      return;
    }

    onGoJoinAuth({
      type,
      productName: content.productName,
      joinOptionLabel: baroStartMode === "auto" ? "자동 개시" : "수동 개시",
      detailLabel: "개시 방식",
      detailValue:
        baroStartMode === "auto" ? "현지 도착 시 자동 시작" : "원하는 시점에 직접 시작",
    });
  };

  return (
    <main className="page-content page-content--success">
      <section className="result-hero result-hero--success">
        <div className="result-icon result-icon--success">✓</div>
        <h1 className="result-title">{content.title}</h1>
      </section>

      <section className="product-card product-card--registered">
        <div className="product-card__content">
          <div className="product-card__top">
            <div className="product-card__copy">
              <p className="product-card__eyebrow">{content.cardLabel}</p>
              <strong className="product-card__name">{content.productName}</strong>
              <p className="product-card__desc">{content.productDesc}</p>
            </div>

            <div className={`product-card__thumb ${isThumbError ? "is-fallback" : ""}`}>
              {!isThumbError ? (
                <img
                  src={content.productThumb}
                  alt=""
                  className="product-card__thumb-image"
                  onError={() => setIsThumbError(true)}
                />
              ) : (
                <span className="product-card__thumb-fallback">{content.productName}</span>
              )}
            </div>
          </div>

          {content.cardMode === "onepass" && (
            <>
              <div className="product-card__tile-grid">
                {content.featureTiles.map((item) => (
                  <div key={item.title} className="product-card__feature-tile">
                    <span className="product-card__feature-title">{item.title}</span>
                    <strong className="product-card__feature-value">{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className="product-card__meta-list">
                {content.productMeta.map((item) => (
                  <span key={item} className="product-card__meta-chip">
                    {item}
                  </span>
                ))}
              </div>
            </>
          )}

          {content.cardMode === "baro" && (
            <div className="product-card__info-list">
              {content.featureList.map((item) => (
                <div key={item.title} className="product-card__info-item">
                  <strong className="product-card__info-title">{item.title}</strong>
                  <p className="product-card__info-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {content.cardMode === "voucher" && (
            <>
              <div className="product-card__meta-list">
                {content.productMeta.map((item) => (
                  <span key={item} className="product-card__meta-chip">
                    {item}
                  </span>
                ))}
              </div>

              <div className="product-card__info-list">
                {content.voucherNotes.map((item) => (
                  <div key={item} className="product-card__info-item">
                    <p className="product-card__info-desc product-card__info-desc--strong">{item}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="info-card info-card--notice success-info-card">
        <div className="info-card__content">
          <strong className="info-card__title">등록 정보</strong>
          <div className="success-info-list">
            <div className="success-info-item">
              <span className="success-info-item__label">쿠폰번호</span>
              <strong className="success-info-item__value">{couponNumberText}</strong>
            </div>
            <div className="success-info-item">
              <span className="success-info-item__label">휴대폰번호</span>
              <strong className="success-info-item__value">{phoneNumberText}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="highlight-card">
        <strong className="highlight-card__title">{content.guideTitle}</strong>
        <p className="highlight-card__desc">{content.guideDesc}</p>
      </section>

      {type === "onepass" && (
        <section className="join-card">
          <div className="join-card__head">
            <strong className="join-card__title">OnePass 유형 선택</strong>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-control__button ${
                  onePassStartMode === "period" ? "is-active" : ""
                }`}
                onClick={() => setOnePassStartMode("period")}
              >
                기간형
              </button>
              <button
                type="button"
                className={`segmented-control__button ${
                  onePassStartMode === "basic" ? "is-active" : ""
                }`}
                onClick={() => setOnePassStartMode("basic")}
              >
                기본형
              </button>
            </div>
          </div>

          <p className="join-card__subtext">
            {onePassStartMode === "period"
              ? "선택한 개시일부터 OnePass 혜택이 적용됩니다."
              : "현지에서 처음 데이터를 사용한 시점부터 OnePass 혜택이 적용됩니다."}
          </p>

          {onePassStartMode === "period" ? (
            <div className="calendar-card">
              <div className="calendar-card__head">
                <strong className="calendar-card__month">
                  {formatCalendarMonth(onePassVisibleMonth)}
                </strong>
                <div className="calendar-card__nav">
                  <button
                    type="button"
                    className="calendar-card__arrow"
                    aria-label="이전 달"
                    onClick={() =>
                      canGoPrevMonth &&
                      setOnePassVisibleMonth(
                        new Date(
                          onePassVisibleMonth.getFullYear(),
                          onePassVisibleMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    disabled={!canGoPrevMonth}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="calendar-card__arrow"
                    aria-label="다음 달"
                    onClick={() =>
                      canGoNextMonth &&
                      setOnePassVisibleMonth(
                        new Date(
                          onePassVisibleMonth.getFullYear(),
                          onePassVisibleMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    disabled={!canGoNextMonth}
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="calendar-card__week">
                <span>일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
              </div>

              <div className="calendar-card__days">
                {calendarDays.map((item) =>
                  item.empty ? (
                    <span key={item.key} className="calendar-card__day calendar-card__day--empty" />
                  ) : (
                    <button
                      key={item.key}
                      type="button"
                      className={`calendar-card__day ${item.selected ? "is-active" : ""} ${
                        item.disabled ? "is-disabled" : ""
                      }`}
                      disabled={item.disabled}
                      onClick={() =>
                        setOnePassSelectedDate(
                          new Date(
                            onePassVisibleMonth.getFullYear(),
                            onePassVisibleMonth.getMonth(),
                            item.day,
                          ),
                        )
                      }
                    >
                      {item.day}
                    </button>
                  ),
                )}
              </div>

              <div className="calendar-card__footer">
                <span className="calendar-card__label">선택한 개시일</span>
                <strong className="calendar-card__value">
                  {formatSelectedDate(onePassSelectedDate)}
                </strong>
              </div>
            </div>
          ) : null}

          <label className="agree-row agree-row--interactive join-card__agree">
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
        </section>
      )}

      {type === "baro" && (
        <section className="join-card">
          <div className="join-card__head join-card__head--stack">
            <strong className="join-card__title">로밍 개시 방법 선택</strong>
            <p className="join-card__subtext">
              자동 개시는 현지 도착 시 바로 시작되고, 수동 개시는 원하는 시점에 직접 시작할 수 있습니다.
            </p>
          </div>

          <div className="option-grid">
            <button
              type="button"
              className={`option-tile ${baroStartMode === "auto" ? "is-active" : ""}`}
              onClick={() => setBaroStartMode("auto")}
            >
              <strong className="option-tile__title">자동 개시</strong>
              <span className="option-tile__desc">현지 도착 시 자동 시작</span>
            </button>

            <button
              type="button"
              className={`option-tile ${baroStartMode === "manual" ? "is-active" : ""}`}
              onClick={() => setBaroStartMode("manual")}
            >
              <strong className="option-tile__title">수동 개시</strong>
              <span className="option-tile__desc">원하는 시점에 직접 시작</span>
            </button>
          </div>

          <label className="agree-row agree-row--interactive join-card__agree">
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
        </section>
      )}

      <div className="button-stack button-stack--floating">
        <button
          type="button"
          className="btn-primary btn-primary--compact"
          onClick={handlePrimaryAction}
          disabled={!isJoinActionEnabled}
        >
          {content.buttonText}
        </button>
      </div>
      <PrivacyConsentPopup
        open={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        variant="join"
      />
    </main>
  );
}

export default RegisterSuccessPage;
