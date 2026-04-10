import React, { useEffect } from "react";

function AlertPopup({
  open,
  onClose,
  title,
  description,
  rows = [],
  primaryText = "확인",
  secondaryText,
  onPrimary,
  onSecondary,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="alert-popup" role="dialog" aria-modal="true" aria-labelledby="alertPopupTitle">
      <button
        type="button"
        className="alert-popup__dim"
        aria-label="팝업 닫기"
        onClick={onClose}
      ></button>

      <div className="alert-popup__panel">
        <strong id="alertPopupTitle" className="alert-popup__title">
          {title}
        </strong>
        {description ? <p className="alert-popup__desc">{description}</p> : null}

        {rows.length > 0 ? (
          <div className="alert-popup__info">
            {rows.map((row) => (
              <div key={row.label} className="alert-popup__row">
                <span className="alert-popup__label">{row.label}</span>
                <strong className="alert-popup__value">{row.value}</strong>
              </div>
            ))}
          </div>
        ) : null}

        <div className="alert-popup__actions">
          {secondaryText ? (
            <button
              type="button"
              className="btn-secondary btn-secondary--compact"
              onClick={onSecondary || onClose}
            >
              {secondaryText}
            </button>
          ) : null}
          <button
            type="button"
            className="btn-primary btn-primary--compact"
            onClick={onPrimary}
          >
            {primaryText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertPopup;
