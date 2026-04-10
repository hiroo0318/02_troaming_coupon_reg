import React, { useEffect, useState } from "react";

function PromoBanner({ items = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(items.length > 1);
  const hasMultiple = items.length > 1;

  useEffect(() => {
    setActiveIndex(0);
    setIsAutoPlay(items.length > 1);
  }, [items.length]);

  useEffect(() => {
    if (!hasMultiple || !isAutoPlay) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [hasMultiple, isAutoPlay, items.length]);

  if (!items.length) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <section className="promo-banner">
      <div
        className="promo-banner__track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="promo-banner__slide"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(7, 16, 36, 0.14), rgba(7, 16, 36, 0.42)), url("${item.image}")`,
            }}
          >
            <div className="promo-banner__dim"></div>
            <div className="promo-banner__text">
              <p className="promo-banner__eyebrow">{item.eyebrow}</p>
              <strong className="promo-banner__title">
                {item.titleLines.map((line) => (
                  <React.Fragment key={line}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </strong>
            </div>
          </article>
        ))}
      </div>

      {hasMultiple && (
        <div className="promo-banner__controls">
          <div className="promo-banner__nav">
            <button type="button" className="promo-banner__control" onClick={handlePrev} aria-label="이전 배너">
              ‹
            </button>
            <button type="button" className="promo-banner__control" onClick={handleNext} aria-label="다음 배너">
              ›
            </button>
          </div>

          <div className="promo-banner__dots" aria-label="배너 페이지">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`promo-banner__dot ${index === activeIndex ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`${index + 1}번 배너`}
              />
            ))}
          </div>

          <button
            type="button"
            className="promo-banner__toggle"
            onClick={() => setIsAutoPlay((prev) => !prev)}
            aria-label={isAutoPlay ? "자동 전환 정지" : "자동 전환 재생"}
          >
            <span className={`promo-banner__toggle-icon ${isAutoPlay ? "is-pause" : "is-play"}`} />
          </button>
        </div>
      )}
    </section>
  );
}

export default PromoBanner;
