import React, { useMemo, useState } from "react";

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

function formatCouponNumber(value = "") {
  return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
}

function formatDate(value = "") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day} 등록`;
}

function getMonthsDiff(value = "") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 999;
  const now = new Date();
  return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
}

function HistoryListPage({ phoneNumber, historyItems = [], onBack }) {
  const [period, setPeriod] = useState("3개월");

  const filteredItems = useMemo(() => {
    const limit = period === "3개월" ? 3 : period === "6개월" ? 6 : 12;
    return historyItems.filter((item) => getMonthsDiff(item.registeredAt || item.createdAt) < limit);
  }, [historyItems, period]);

  return (
    <main className="page-content">
      <section className="history-summary">
        <h1 className="history-summary__title">
          {maskPhoneNumber(phoneNumber)} 번호로 등록된 쿠폰입니다.
        </h1>
        <p className="history-summary__desc">{`최근 ${period} 내역과 등록 상태를 확인할 수 있습니다.`}</p>
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
              <div className="history-card__top">
                <span className="history-card__category">{item.productCode || item.couponName || "쿠폰"}</span>
                <span
                  className={`history-card__status ${item.regResult !== "success" ? "history-card__status--refund" : ""}`}
                >
                  {item.regResult === "success" ? "등록 완료" : "실패"}
                </span>
              </div>
              <strong className="history-card__name">{item.productName || item.couponName || "등록 상품"}</strong>
              <p className="history-card__date">{formatDate(item.registeredAt || item.createdAt)}</p>
              <div className="history-card__meta">
                <span className="history-card__meta-item">쿠폰번호 {formatCouponNumber(item.couponNumber || "")}</span>
                {item.errorMsg ? <span className="history-card__meta-item">사유 {item.errorMsg}</span> : null}
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
