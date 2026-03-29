import React, { useState } from "react";

function HistoryListPage() {
  const [period, setPeriod] = useState("3개월");
  const historyItems = [
    {
      id: 1,
      category: "ONEPASS",
      status: "등록 완료",
      name: "OnePass 500",
      date: "2026.03.29 등록",
      couponNumber: "1111 2222 3333",
    },
    {
      id: 2,
      category: "BARO",
      status: "등록 완료",
      name: "baro 6GB",
      date: "2026.03.18 등록",
      couponNumber: "2222 3333 4444",
    },
    {
      id: 3,
      category: "금액권",
      status: "환불",
      name: "로밍 금액권 30,000원",
      date: "2026.02.11 등록",
      couponNumber: "3333 4444 5555",
    },
  ];

  return (
    <main className="page-content">
      <section className="history-summary">
        <h1 className="history-summary__title">
          010-12**-3456 번호로 등록된 쿠폰입니다.
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
        {historyItems.map((item) => (
          <article className="history-card" key={item.id}>
            <div className="history-card__top">
              <span className="history-card__category">{item.category}</span>
              <span
                className={`history-card__status ${
                  item.status === "환불" ? "history-card__status--refund" : ""
                }`}
              >
                {item.status}
              </span>
            </div>
            <strong className="history-card__name">{item.name}</strong>
            <p className="history-card__date">{item.date}</p>
            <div className="history-card__meta">
              <span className="history-card__meta-item">쿠폰번호 {item.couponNumber}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default HistoryListPage;
