import React from "react";

function HistoryListPage({ onBackVerify }) {
  const historyItems = [];

  return (
    <main className="page-content">
      <section className="history-summary">
        <h1 className="history-summary__title">
          010-12**-3456 번호로 등록된 쿠폰입니다.
        </h1>
        <p className="history-summary__desc">최근 1년 내역이 노출됩니다.</p>
      </section>

      <section className="filter-chip-row">
        <button type="button" className="filter-chip is-active">
          1년
        </button>
        <button type="button" className="filter-chip">
          6개월
        </button>
        <button type="button" className="filter-chip">
          3개월
        </button>
      </section>

      <section className="history-list">
        {historyItems.map((item) => (
          <article className="history-card" key={item.id}>
            <div className="history-card__top">
              <span className="history-card__category">{item.category}</span>
              <span className="history-card__status">{item.status}</span>
            </div>
            <strong className="history-card__name">{item.name}</strong>
            <p className="history-card__date">{item.date}</p>
          </article>
        ))}
      </section>

      <button type="button" className="btn-secondary" onClick={onBackVerify}>
        조회 번호 다시 입력
      </button>
    </main>
  );
}

export default HistoryListPage;
