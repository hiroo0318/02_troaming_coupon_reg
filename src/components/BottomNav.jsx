import React from "react";

function BottomNav({ tab, onRegisterClick, onHistoryClick }) {
  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      <button
        type="button"
        className={`bottom-nav__item ${tab === "register" ? "is-active" : ""}`}
        onClick={onRegisterClick}
      >
        <span className="bottom-nav__icon bottom-nav__icon--register" aria-hidden="true"></span>
        <span className="bottom-nav__text">Register</span>
      </button>

      <button
        type="button"
        className={`bottom-nav__item ${tab === "history" ? "is-active" : ""}`}
        onClick={onHistoryClick}
      >
        <span className="bottom-nav__icon bottom-nav__icon--history" aria-hidden="true"></span>
        <span className="bottom-nav__text">History</span>
      </button>
    </nav>
  );
}

export default BottomNav;