import React, { useState } from "react";
import "./style.css";

import BottomNav from "./components/BottomNav";
import MainPage from "./pages/MainPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterSuccessPage from "./pages/RegisterSuccessPage";
import RegisterFailPage from "./pages/RegisterFailPage";
import HistoryVerifyPage from "./pages/HistoryVerifyPage";
import HistoryListPage from "./pages/HistoryListPage";

function App() {
  const [tab, setTab] = useState("register");
  const [page, setPage] = useState("home");
  const [successType, setSuccessType] = useState("onepass");

  const goRegisterHome = () => {
    setTab("register");
    setPage("home");
  };

  const goRegisterForm = () => {
    setTab("register");
    setPage("register");
  };

  const goRegisterSuccess = (type) => {
    setTab("register");
    setSuccessType(type);
    setPage("success");
  };

  const goRegisterFail = () => {
    setTab("register");
    setPage("fail");
  };

  const goHistoryVerify = () => {
    setTab("history");
    setPage("historyVerify");
  };

  const goHistoryList = () => {
    setTab("history");
    setPage("historyList");
  };

  const renderPage = () => {
    if (tab === "register") {
      if (page === "home") {
        return (
          <MainPage
            onGoRegister={goRegisterForm}
            onGoSuccess={goRegisterSuccess}
            onGoFail={goRegisterFail}
          />
        );
      }

      if (page === "register") {
        return (
          <RegisterPage
            onBackHome={goRegisterHome}
            onGoSuccess={goRegisterSuccess}
            onGoFail={goRegisterFail}
          />
        );
      }

      if (page === "success") {
        return (
          <RegisterSuccessPage
            type={successType}
            onBackHome={goRegisterHome}
            onGoHistory={goHistoryList}
          />
        );
      }

      if (page === "fail") {
        return (
          <RegisterFailPage
            onRetry={goRegisterForm}
            onBackHome={goRegisterHome}
          />
        );
      }
    }

    if (tab === "history") {
      if (page === "historyVerify") {
        return <HistoryVerifyPage onVerified={goHistoryList} />;
      }

      if (page === "historyList") {
        return <HistoryListPage onBackVerify={goHistoryVerify} />;
      }
    }

    return null;
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        {renderPage()}
        <BottomNav
          tab={tab}
          onRegisterClick={goRegisterHome}
          onHistoryClick={goHistoryVerify}
        />
      </div>
    </div>
  );
}

export default App;
