import React, { useMemo, useState } from "react";
import { formatCouponNumber } from "../lib/format";

function maskPhoneNumber(value = "") {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}**-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 4)}**-${digits.slice(6)}`;
  }

  return "010-12**-3456";
}

function formatDate(value = "") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

function getMonthsDiff(value = "") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 999;
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}

function formatUsageExpiryDate(value = "") {
  if (!value) return "-";
  const registeredAt = new Date(value);
  if (Number.isNaN(registeredAt.getTime())) return "-";

  const targetLastDay = new Date(
    registeredAt.getFullYear(),
    registeredAt.getMonth() + 13,
    0,
  );
  const month = String(targetLastDay.getMonth() + 1).padStart(2, "0");
  const day = String(targetLastDay.getDate()).padStart(2, "0");
  return `${targetLastDay.getFullYear()}.${month}.${day}`;
}

function formatPriceLabel(value = "") {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `${Number(digits).toLocaleString("ko-KR")}원`;
}

function resolveVoucherTitle(item = {}) {
  const candidates = [item.priceLabel, item.couponName, item.productName, item.productCode];

  for (const candidate of candidates) {
    const text = String(candidate ?? "").trim();
    if (!text) continue;

    const amountWithWon = text.match(/(\d[\d,]*)\s*원/);
    if (amountWithWon) {
      return `T 로밍쿠폰 ${formatPriceLabel(amountWithWon[1])}`;
    }

    const trailingDigits = text.match(/(\d[\d,]*)$/);
    if (trailingDigits) {
      return `T 로밍쿠폰 ${formatPriceLabel(trailingDigits[1])}`;
    }
  }

  return "T 로밍쿠폰";
}

function HistoryListPage({ phoneNumber, historyItems = [], onBack }) {
  const [period, setPeriod] = useState("3개월");

  const filteredItems = useMemo(() => {
    const limit = period === "3개월" ? 3 : period === "6개월" ? 6 : 12;
    return historyItems.filter(
      (item) => item.regResult === "success" && getMonthsDiff(item.registeredAt) <= limit,
    );
  }, [historyItems, period]);

  return (
    <main className="page-content">
      <section className="history-summary">
        <h1 className="history-summary__title">
          {maskPhoneNumber(phoneNumber)} 번호로 등록된 쿠폰입니다.
        </h1>
        <p className="history-summary__desc">{`최근 ${period} 내역을 확인할 수 있습니다.`}</p>
      </section>

      <section className="filter-chip-row">
        <button
          type="button"
          className={`filter-chip ${period === "3개월" ? "is-active" : ""}`}
          onClick={() => setPeriod("3개월")}
        >
          3개월
        </button>
        <button
          type="button"
          className={`filter-chip ${period === "6개월" ? "is-active" : ""}`}
          onClick={() => setPeriod("6개월")}
        >
          6개월
        </button>
        <button
          type="button"
          className={`filter-chip ${period === "1년" ? "is-active" : ""}`}
          onClick={() => setPeriod("1년")}
        >
          1년
        </button>
      </section>

      <section className="history-list">
        {filteredItems.length ? (
          filteredItems.map((item) => (
            <article className="history-card" key={item.id}>
              <strong className="history-card__name">
                {String(item.category ?? "") === "금액권"
                  ? resolveVoucherTitle(item)
                  : item.productName || "등록 상품"}
              </strong>
              <div className="history-card__meta history-card__meta--details">
                <div className="history-card__detail-row">
                  <span className="history-card__detail-label">등록일</span>
                  <span className="history-card__detail-value">{formatDate(item.registeredAt)}</span>
                </div>
                <div className="history-card__detail-row">
                  <span className="history-card__detail-label">사용 종료일</span>
                  <span className="history-card__detail-value">{formatUsageExpiryDate(item.registeredAt)}</span>
                </div>
                <div className="history-card__detail-row">
                  <span className="history-card__detail-label">쿠폰번호</span>
                  <span className="history-card__detail-value">
                    {formatCouponNumber(item.couponNumber || "")}
                  </span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <article className="history-card">
            <strong className="history-card__name">조회된 등록 내역이 없습니다.</strong>
            <p className="history-card__date">등록 후 이 화면에서 다시 확인할 수 있습니다.</p>
          </article>
        )}
      </section>

      <button type="button" className="btn-secondary btn-secondary--compact" onClick={onBack}>
        다시 조회하기
      </button>
    </main>
  );
}

export default HistoryListPage;
