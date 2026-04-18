import React, { useEffect, useMemo, useState } from "react";
import AlertPopup from "../components/AlertPopup";
import PrivacyConsentPopup from "../components/PrivacyConsentPopup";
import { formatCouponNumber, formatPhoneNumber } from "../lib/format";
import baro3GbThumb from "../assets/coupon-thumbnails/baro-3gb.png";
import baro6GbThumb from "../assets/coupon-thumbnails/baro-6gb.png";
import baro12GbThumb from "../assets/coupon-thumbnails/baro-12gb.png";
import baro24GbThumb from "../assets/coupon-thumbnails/baro-24gb.png";
import onePass500Thumb from "../assets/coupon-thumbnails/onepass-500.png";
import onePassVipThumb from "../assets/coupon-thumbnails/onepass-vip.png";
import onePassDataVipThumb from "../assets/coupon-thumbnails/onepass-data-vip.png";
import voucherThumb from "../assets/coupon-thumbnails/voucher.png";

const PRODUCT_THUMB_MAP = {
  onepass_500: onePass500Thumb,
  onepass_vip: onePassVipThumb,
  onepass_data_vip: onePassDataVipThumb,
  baro_3gb: baro3GbThumb,
  baro_6gb: baro6GbThumb,
  baro_12gb: baro12GbThumb,
  baro_24gb: baro24GbThumb,
};

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

function buildOnePassSummary(productCode, productName) {
  const normalizedCode = String(productCode ?? "").toLowerCase();

  if (normalizedCode === "onepass_500") {
    return {
      tiles: [
        {
          icon: "◔",
          title: "데이터량",
          value: "500MB 제공 후 제한 속도로 계속 이용",
        },
        {
          icon: "◎",
          title: "대상 국가",
          value: "세계 주요 국가",
        },
      ],
      meta: ["baro 통화 포함", "문자 기본 제공"],
    };
  }

  if (normalizedCode === "onepass_vip") {
    return {
      tiles: [
        {
          icon: "◔",
          title: "데이터량",
          value: "무제한 (일 5GB 후 최대 400Kbps)",
        },
        {
          icon: "◎",
          title: "대상 국가",
          value: "세계 주요 국가",
        },
      ],
      meta: ["baro 통화 포함", "문자 기본 제공"],
    };
  }

  if (normalizedCode === "onepass_data_vip") {
    return {
      tiles: [
        {
          icon: "◔",
          title: "데이터량",
          value: "무제한 (일 5GB 후 최대 400Kbps)",
        },
        {
          icon: "◎",
          title: "대상 국가",
          value: "세계 주요 국가",
        },
      ],
      meta: ["baro 통화 이용 가능", "문자 기본 제공"],
    };
  }

  return {
    tiles: [
      {
        icon: "◔",
        title: "데이터량",
        value: productName,
      },
      {
        icon: "◎",
        title: "대상 국가",
        value: "세계 주요 국가",
      },
    ],
    meta: ["baro 통화 포함", "문자 기본 제공"],
  };
}

function buildBaroSummary(productCode) {
  const normalizedCode = String(productCode ?? "").toLowerCase();

  if (normalizedCode === "baro_3gb") {
    return {
      items: [
        { icon: "◎", title: "전세계 190개국 지원", desc: "여행지 어디서나 끊김 없는 연결" },
        { icon: "◔", title: "데이터 3GB 제공", desc: "30일 동안 여유롭게 사용하세요" },
        { icon: "◡", title: "baro 통화 무제한", desc: "T전화 앱 이용 시 고음질 무료 통화" },
      ],
    };
  }

  if (normalizedCode === "baro_6gb") {
    return {
      items: [
        { icon: "◎", title: "전세계 190개국 지원", desc: "여행지 어디서나 끊김 없는 연결" },
        { icon: "◔", title: "데이터 6GB 제공", desc: "30일 동안 넉넉하게 사용하세요" },
        { icon: "◡", title: "baro 통화 무제한", desc: "T전화 앱 이용 시 고음질 무료 통화" },
      ],
    };
  }

  if (normalizedCode === "baro_12gb") {
    return {
      items: [
        { icon: "◎", title: "전세계 190개국 지원", desc: "여행지 어디서나 끊김 없는 연결" },
        { icon: "◔", title: "데이터 12GB 제공", desc: "30일 동안 넉넉하게 사용하세요" },
        { icon: "◡", title: "baro 통화 무제한", desc: "T전화 앱 이용 시 고음질 무료 통화" },
      ],
    };
  }

  if (normalizedCode === "baro_24gb") {
    return {
      items: [
        { icon: "◎", title: "전세계 190개국 지원", desc: "여행지 어디서나 끊김 없는 연결" },
        { icon: "◔", title: "데이터 24GB 제공", desc: "30일 동안 넉넉하게 사용하세요" },
        { icon: "◡", title: "baro 통화 무제한", desc: "T전화 앱 이용 시 고음질 무료 통화" },
      ],
    };
  }

  if (normalizedCode.startsWith("baro_charge_")) {
    const amount = normalizedCode.replace("baro_charge_", "").toUpperCase();
    return {
      items: [
        { icon: "◎", title: "전세계 190개국 지원", desc: "여행지 어디서나 데이터를 충전하세요" },
        { icon: "◔", title: `데이터 ${amount} 충전`, desc: "기존 baro 요금제에 바로 추가됩니다" },
        { icon: "◡", title: "즉시 가입 처리", desc: "인증 후 바로 충전 가입이 진행됩니다" },
      ],
    };
  }

  return {
    items: [
      { icon: "◎", title: "전세계 190개국 지원", desc: "여행지 어디서나 끊김 없는 연결" },
      { icon: "◔", title: "baro 전용 혜택", desc: "상품별 데이터 혜택이 적용됩니다" },
      { icon: "◡", title: "baro 통화 이용", desc: "T전화 앱 이용 시 통화 혜택을 확인하세요" },
    ],
  };
}

function buildContent(type, result) {
  const productCode = String(result?.productCode ?? "").toLowerCase();
  const productName = result?.productName || "등록 상품";
  const couponCode = result?.couponCode || "-";

  if (type === "onepass") {
    const onePassSummary = buildOnePassSummary(productCode, productName);

    return {
      title: "쿠폰 등록이 완료되었습니다.",
      productName,
      productDesc: null,
      guideTitle: "이제 요금제 가입을 진행해 주세요",
      guideDesc:
        "등록한 OnePass 쿠폰 혜택을 적용하려면 먼저 요금제 가입이 필요합니다.<br />요금제 가입을 위해 원하는 유형을 선택한 뒤 가입하기 버튼을 눌러 주세요.",
      buttonText: "요금제 가입하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "onepass",
      summaryTiles: onePassSummary.tiles,
      productMeta: onePassSummary.meta,
      productThumb: PRODUCT_THUMB_MAP[productCode] || onePass500Thumb,
    };
  }

  if (type === "baro") {
    const baroSummary = buildBaroSummary(productCode);

    return {
      title: "쿠폰 등록이 완료되었습니다.",
      productName,
      productDesc: null,
      guideTitle: "요금제 가입",
      guideDesc:
        "등록한 baro 쿠폰 혜택을 적용하려면 먼저 요금제 가입이 필요합니다.<br />요금제 가입을 위해 개시 방식을 선택한 뒤 가입하기 버튼을 눌러 주세요.",
      buttonText: "요금제 가입하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "baro",
      summaryItems: baroSummary.items,
      productThumb: PRODUCT_THUMB_MAP[productCode] || baro6GbThumb,
    };
  }

  if (type === "baro_charge") {
    const baroSummary = buildBaroSummary(productCode);

    return {
      title: "쿠폰 등록이 완료되었습니다.",
      productName,
      productDesc: null,
      guideTitle: "충전 가입을 진행해 주세요",
      guideDesc: "등록한 충전형 baro 쿠폰 혜택을 이용하려면 인증을 완료한 뒤 바로 요금제 가입을 진행해 주세요.",
      buttonText: "충전 가입하기",
      cardLabel: "등록 완료 쿠폰",
      cardMode: "baro",
      summaryItems: baroSummary.items,
      productThumb: PRODUCT_THUMB_MAP[productCode] || baro6GbThumb,
    };
  }

  return {
    title: "쿠폰 등록이 완료되었습니다.",
    productName,
    productDesc: result?.message || "금액권 쿠폰이 정상 등록되어 바로 사용할 수 있습니다.",
    guideTitle: "금액권 등록이 완료되었습니다",
    guideDesc:
      "별도 요금제 가입 없이 T 로밍 서비스 이용 시 등록된 금액권에서 우선 차감됩니다.",
    buttonText: "등록내역 확인하기",
    cardLabel: "등록 완료 쿠폰",
    cardMode: "voucher",
    productMeta: ["등록 즉시 사용 가능", "추가 가입 절차 없음"],
    voucherNotes: [
      "해외 로밍 이용 요금 결제 시 등록된 금액권에서 우선 차감됩니다.",
      "금액권 정보와 사용 내역은 등록 내역 화면에서 확인할 수 있습니다.",
    ],
    productThumb: voucherThumb,
  };
}

function RegisterSuccessPage({ result, onBackHome, onGoHistory, onGoJoinAuth }) {
  const type = useMemo(() => resolveType(result), [result]);
  const content = useMemo(() => buildContent(type, result), [result, type]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxSelectableDate = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60),
    [today],
  );
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
        detailValue: "인증 완료 후 즉시 충전 가입 처리",
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
          ? "해외 접속 시 바로 사용 시작"
          : "원하는 시점에 직접 사용 시작",
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
              {content.productDesc ? <p className="product-card__desc">{content.productDesc}</p> : null}
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
              <div className="product-card__tile-grid product-card__tile-grid--summary">
                {content.summaryTiles.map((item) => (
                  <div key={item.title} className="product-card__feature-tile product-card__feature-tile--summary">
                    <span className="product-card__feature-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="product-card__feature-title product-card__feature-title--summary">
                      {item.title}
                    </span>
                    <strong className="product-card__feature-value">{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className="product-card__meta-list product-card__meta-list--onepass">
                {content.productMeta.map((item) => (
                  <span key={item} className="product-card__meta-chip">
                    {item}
                  </span>
                ))}
              </div>
            </>
          ) : null}

          {content.cardMode === "baro" ? (
            <div className="product-card__summary-list">
              {content.summaryItems.map((item) => (
                <div key={item.title} className="product-card__summary-item">
                  <span className="product-card__summary-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div className="product-card__summary-copy">
                    <strong className="product-card__summary-title">{item.title}</strong>
                    <p className="product-card__summary-desc">{item.desc}</p>
                  </div>
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
          </div>
        </div>
      </section>

      {(type === "onepass" || type === "baro" || type === "baro_charge") ? (
        <section className="highlight-card">
          <strong className="highlight-card__title">{content.guideTitle}</strong>
          <p
            className="highlight-card__desc"
            dangerouslySetInnerHTML={{ __html: content.guideDesc }}
          />
        </section>
      ) : null}

      {type === "onepass" ? (
        <section className="join-card">
          <div className="join-card__head">
            <strong className="join-card__title">OnePass 유형 선택</strong>
          </div>

          <p className="join-card__subtext">
            OnePass 요금제 가입을 위해 기본형 또는 기간형 중 원하는 유형을 선택해 주세요.
          </p>

          <div className="segmented-control segmented-control--spaced">
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

          <p className="join-card__notice">
            {onePassStartMode === "period"
              ? "기간형은 선택한 개시일 기준으로 혜택이 적용됩니다."
              : "기본형은 첫 데이터 사용 시점부터 혜택이 자동 적용됩니다."}
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
            <strong className="join-card__title">baro 요금제 시작 옵션</strong>
          </div>

          <div className="option-grid">
            <button
              type="button"
              className={`option-tile ${baroStartMode === "auto" ? "is-active" : ""}`}
              onClick={() => setBaroStartMode("auto")}
            >
              <strong className="option-tile__title">자동 개시</strong>
              <span className="option-tile__desc">
                현재 선택한 데이터 용량을 출국할 때마다 자동 적용
              </span>
            </button>

            <button
              type="button"
              className={`option-tile ${baroStartMode === "manual" ? "is-active" : ""}`}
              onClick={() => setBaroStartMode("manual")}
            >
              <strong className="option-tile__title">수동 개시</strong>
              <span className="option-tile__desc">
                출국할 때마다 필요한 데이터 용량을 직접 선택해 사용
              </span>
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
            충전형 baro 쿠폰은 개시 방식 선택 없이 인증 후 바로 가입이 진행됩니다.
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
