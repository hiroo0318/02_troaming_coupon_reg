import React, { useEffect } from "react";

function NoticePopup({ open, onClose, items = [] }) {
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
    <div className="layer-popup" role="dialog" aria-modal="true" aria-labelledby="noticeTitle">
      <button
        type="button"
        className="layer-popup__dim"
        aria-label="팝업 닫기"
        onClick={onClose}
      ></button>

      <div className="layer-popup__panel">
        <div className="layer-popup__head">
          <strong id="noticeTitle" className="layer-popup__title">
            이용 유의사항
          </strong>
          <button
            type="button"
            className="layer-popup__close"
            aria-label="팝업 닫기"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="layer-popup__body">
          <ul className="popup-list">
            {items.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NoticePopup;
