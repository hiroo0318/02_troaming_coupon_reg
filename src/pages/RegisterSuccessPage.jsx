import React, { useEffect, useMemo, useState } from "react";
import AlertPopup from "../components/AlertPopup";
import PrivacyConsentPopup from "../components/PrivacyConsentPopup";
import baro3GbThumb from "../assets/coupon-thumbnails/baro-3gb.png";
import baro6GbThumb from "../assets/coupon-thumbnails/baro-6gb.png";
import baro12GbThumb from "../assets/coupon-thumbnails/baro-12gb.png";
import baro24GbThumb from "../assets/coupon-thumbnails/baro-24gb.png";
import onePass500Thumb from "../assets/coupon-thumbnails/onepass-500.png";
import onePassVipThumb from "../assets/coupon-thumbnails/onepass-vip.png";
import onePassDataVipThumb from "../assets/coupon-thumbnails/onepass-data-vip.png";
import voucherThumb from "../assets/coupon-thumbnails/voucher.png";

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

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ key: `empty-${index}`, empty: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ key: `day-${day}`, day, empty: false });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}`, empty: true });
  }

  return cells;
}

function isSameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function resolveType(result) {
  const category = String(result?.category ?? "").toUpperCase();
  const productCode = String(result?.productCode ?? "").toLowerCase();

  if (category === "BARO") {
    return productCode.startsWith("baro_charge_") ? "baro_charge" : "baro";
  }
  if (category === "ONEPASS") return "onepass";
  if (category === "금액권") return "voucher";
  if (productCode.startsWith("baro_charge_")) return "baro_charge";
  if (productCode.startsWith("baro")) return "baro";
  if (productCode.startsWith("onepass")) return "onepass";
  return "voucher";
}

function buildContent(type, result, productThumbMap) {
  const productCode = String(result?.productCode ?? "").toLowerCase();
  const productName = result?.productName || "등록 상품";
  const couponCode = result?.couponCode || "-";

  if (type === "onepass") {
    return {
      title: "쿠폰 등록이 완료되었습니다.",
      productName,
      productDesc:
        result?.message || "등록한 쿠폰에 맞는 OnePass 요금제를 이어서 가입할 수 있습니다.",
      guideTitle: "이제 요금제 가입을 진행해 주세요.",
      guideDesc:
        "기본형 또는 기간형 중 원하는 유형을 선택한 뒤 인증을 완료하면 요금제 가입이 진행됩니다.",
      buttonText: "요금제 가입하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "onepass",
      featureTiles: [
        { title: "상품명", value: productName },
        { title: "쿠폰 코드", value: couponCode },
      ],
      productMeta: ["가입 후 바로 사용 가능", "권종별 가입 옵션 선택 가능"],
      productThumb: productThumbMap[productCode] || onePass500Thumb,
    };
  }

  if (type === "baro") {
    return {
      title: "쿠폰 등록이 완료되었습니다.",
      productName,
      productDesc:
        result?.message || "등록한 쿠폰에 맞는 baro 요금제를 선택해서 가입할 수 있습니다.",
      guideTitle: "개시 방식을 선택해 주세요.",
      guideDesc:
        "자동 개시 또는 수동 개시 중 원하는 방식을 선택한 뒤 인증을 완료하면 요금제 가입이 진행됩니다.",
      buttonText: "요금제 가입하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "baro",
      featureList: [
        { title: "상품명", desc: productName },
        { title: "쿠폰 코드", desc: couponCode },
        { title: "가입 방식", desc: "자동 개시 또는 수동 개시 중 선택 가능" },
      ],
      productThumb: productThumbMap[productCode] || baro6GbThumb,
    };
  }

  if (type === "baro_charge") {
    return {
      title: "쿠폰 등록이 완료되었습니다.",
      productName,
      productDesc:
        result?.message || "등록한 충전형 쿠폰으로 즉시 데이터 충전 가입을 진행할 수 있습니다.",
      guideTitle: "충전 가입을 진행해 주세요.",
      guideDesc:
        "충전형 baro 쿠폰은 개시 방식 선택 없이 인증 후 바로 가입 처리됩니다.",
      buttonText: "충전 가입하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "baro",
      featureList: [
        { title: "상품명", desc: productName },
        { title: "쿠폰 코드", desc: couponCode },
        { title: "처리 방식", desc: "개시 방식 선택 없이 즉시 충전 가입 처리" },
      ],
      productThumb: productThumbMap[productCode] || baro6GbThumb,
    };
  }

  return {
    title: "쿠폰 등록이 완료되었습니다.",
    productName,
    productDesc: result?.message || "금액권 쿠폰이 정상 등록되어 바로 사용할 수 있습니다.",
    guideTitle: "금액권 등록이 완료되었습니다.",
    guideDesc:
      "별도 요금제 가입 없이 T로밍 서비스 이용 시 등록된 금액권에서 우선 차감됩니다.",
    buttonText: "등록내역 확인하기",
    cardLabel: "등록 완료 쿠폰",
    cardMode: "voucher",
    productMeta: ["등록 즉시 사용 가능", "후속 가입 절차 없음"],
    voucherNotes: [
      "해외 로밍 이용 요금 결제 시 등록된 금액권에서 우선 차감됩니다.",
      "금액권 정보와 사용 내역은 등록 내역 화면에서 확인할 수 있습니다.",
    ],
    productThumb: voucherThumb,
  };
}

function RegisterSuccessPage({ result, onBackHome, onGoHistory, onGoJoinAuth }) {
  const type = useMemo(() => resolveType(result), [result]);
  const today = startOfDay(new Date());
  const maxSelectableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);
  const [onePassStartMode, setOnePassStartMode] = useState("basic");
  const [baroStartMode, setBaroStartMode] = useState("auto");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isPreparingAlertOpen, setIsPreparingAlertOpen] = useState(false);
  const [onePassSelectedDate, setOnePassSelectedDate] = useState(today);
  const [onePassVisibleMonth, setOnePassVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [isThumbError, setIsThumbError] = useState(false);

  const productThumbMap = {
    onepass_500: onePass500Thumb,
    onepass_vip: onePassVipThumb,
    onepass_data_vip: onePassDataVipThumb,
    baro_3gb: baro3GbThumb,
    baro_6gb: baro6GbThumb,
    baro_12gb: baro12GbThumb,
    baro_24gb: baro24GbThumb,
  };

  const content = useMemo(
    () => buildContent(type, result, productThumbMap),
    [result, type],
  );

  useEffect(() => {
    setIsThumbError(false);
    setAgreePrivacy(false);
  }, [type, result?.productCode]);

  const couponNumberText = formatCouponNumber(result?.couponNumber || "");
  const phoneNumberText = formatPhoneNumber(result?.phoneNumber || "");
  const isJoinActionEnabled = type === "voucher" || type === "baro_charge" || agreePrivacy;

  const calendarDays = buildCalendarDays(onePassVisibleMonth).map((item) => {
    if (item.empty) return item;

    const itemDate = new Date(
      onePassVisibleMonth.getFullYear(),
      onePassVisibleMonth.getMonth(),
      item.day,
    );
    const isDisabled =
      itemDate.getTime() < today.getTime() || itemDate.getTime() > maxSelectableDate.getTime();

    return {
      ...item,
      selected:
        item.day === onePassSelectedDate.getDate() &&
        isSameMonth(onePassVisibleMonth, onePassSelectedDate),
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
      if (onePassStartMode === "period") {
        setIsPreparingAlertOpen(true);
        return;
      }

      onGoJoinAuth({
        type,
        productName: content.productName,
        joinOptionLabel: "기본형",
        detailLabel: "적용 시점",
        detailValue: "첫 데이터 사용 시점부터 자동 적용",
        startMode: onePassStartMode,
        useYt: false,
      });
      return;
    }

    if (type === "baro_charge") {
      onGoJoinAuth({
        type,
        productName: content.productName,
        joinOptionLabel: "즉시 충전",
        detailLabel: "처리 방식",
        detailValue: "인증 완료 후 즉시 충전 가입",
        startMode: null,
        useYt: false,
      });
      return;
    }

    onGoJoinAuth({
      type,
      productName: content.productName,
      joinOptionLabel: baroStartMode === "auto" ? "자동 개시" : "수동 개시",
      detailLabel: "개시 방식",
      detailValue:
        baroStartMode === "auto"
          ? "해외 도착 후 바로 사용 가능"
          : "원하는 시점에 직접 개시",
      startMode: baroStartMode,
      useYt: false,
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

          {content.cardMode === "onepass" ? (
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
          ) : null}

          {content.cardMode === "baro" ? (
            <div className="product-card__info-list">
              {content.featureList.map((item) => (
                <div key={item.title} className="product-card__info-item">
                  <strong className="product-card__info-title">{item.title}</strong>
                  <p className="product-card__info-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : null}

          {content.cardMode === "voucher" ? (
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
          ) : null}
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
            {result?.couponCode ? (
              <div className="success-info-item">
                <span className="success-info-item__label">쿠폰 코드</span>
                <strong className="success-info-item__value">{result.couponCode}</strong>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="highlight-card">
        <strong className="highlight-card__title">{content.guideTitle}</strong>
        <p className="highlight-card__desc">{content.guideDesc}</p>
      </section>

      {type === "onepass" ? (
        <section className="join-card">
          <div className="join-card__head">
            <strong className="join-card__title">OnePass 유형 선택</strong>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-control__button ${
                  onePassStartMode === "basic" ? "is-active" : ""
                }`}
                onClick={() => setOnePassStartMode("basic")}
              >
                기본형
              </button>
              <button
                type="button"
                className={`segmented-control__button ${
                  onePassStartMode === "period" ? "is-active" : ""
                }`}
                onClick={() => setOnePassStartMode("period")}
              >
                기간형
              </button>
            </div>
          </div>

          <p className="join-card__subtext">
            {onePassStartMode === "period"
              ? "선택한 개시일 기준으로 OnePass 혜택이 적용됩니다."
              : "첫 데이터 사용 시점부터 OnePass 혜택이 자동 적용됩니다."}
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
      ) : null}

      {type === "baro" ? (
        <section className="join-card">
          <div className="join-card__head join-card__head--stack">
            <strong className="join-card__title">baro 개시 방식 선택</strong>
            <p className="join-card__subtext">
              자동 개시는 해외 도착 후 바로 사용 가능하고, 수동 개시는 원하는 시점에 직접 개시할 수 있습니다.
            </p>
          </div>

          <div className="option-grid">
            <button
              type="button"
              className={`option-tile ${baroStartMode === "auto" ? "is-active" : ""}`}
              onClick={() => setBaroStartMode("auto")}
            >
              <strong className="option-tile__title">자동 개시</strong>
              <span className="option-tile__desc">해외 도착 후 바로 사용 시작</span>
            </button>

            <button
              type="button"
              className={`option-tile ${baroStartMode === "manual" ? "is-active" : ""}`}
              onClick={() => setBaroStartMode("manual")}
            >
              <strong className="option-tile__title">수동 개시</strong>
              <span className="option-tile__desc">원하는 시점에 직접 사용 시작</span>
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
      ) : null}

      {type === "baro_charge" ? (
        <section className="join-card">
          <strong className="join-card__title">충전형 가입 안내</strong>
          <p className="join-card__hint">
            충전형 baro 쿠폰은 개시 방식 선택 없이 인증 후 바로 가입 처리가 진행됩니다.
          </p>
          <p className="join-card__notice">
            내부 시연용 화면에서는 인증 완료 후 곧바로 충전 가입 API를 호출합니다.
          </p>
        </section>
      ) : null}

      <div className="button-stack button-stack--floating">
        <button
          type="button"
          className="btn-primary btn-primary--compact"
          onClick={handlePrimaryAction}
          disabled={!isJoinActionEnabled}
        >
          {content.buttonText}
        </button>
        <button type="button" className="btn-secondary btn-secondary--compact" onClick={onBackHome}>
          메인으로 이동
        </button>
      </div>

      <PrivacyConsentPopup
        open={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        variant="join"
      />
      <AlertPopup
        open={isPreparingAlertOpen}
        onClose={() => setIsPreparingAlertOpen(false)}
        title="준비중입니다"
        description="OnePass 기간형 요금제 가입은 현재 준비중입니다."
        primaryText="확인"
        onPrimary={() => setIsPreparingAlertOpen(false)}
      />
    </main>
  );
}

export default RegisterSuccessPage;
