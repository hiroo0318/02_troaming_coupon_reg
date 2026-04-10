import React, { useState } from "react";
import "./style.css";

import BottomNav from "./components/BottomNav";
import MainPage from "./pages/MainPage";
import JoinCompletePage from "./pages/JoinCompletePage";
import RegisterSuccessPage from "./pages/RegisterSuccessPage";
import RegisterFailPage from "./pages/RegisterFailPage";
import HistoryVerifyPage from "./pages/HistoryVerifyPage";
import HistoryListPage from "./pages/HistoryListPage";
import SmsAuthPage from "./pages/SmsAuthPage";

function App() {
  const [tab, setTab] = useState("register");
  const [page, setPage] = useState("home");
  const [successType, setSuccessType] = useState("onepass");
  const [successInfo, setSuccessInfo] = useState({
    couponNumber: "111122223333",
    phoneNumber: "01012345678",
  });
  const [smsAuthInfo, setSmsAuthInfo] = useState({
    mode: "join",
    phoneNumber: "01012345678",
  });
  const [joinInfo, setJoinInfo] = useState({
    type: "onepass",
    productName: "OnePass 500",
    joinOptionLabel: "기간형",
    detailLabel: "개시일",
    detailValue: "2026. 04. 10 (금)",
  });

  const goRegisterHome = () => {
    setTab("register");
    setPage("home");
  };

  const goRegisterSuccess = (type, payload) => {
    setTab("register");
    setSuccessType(type);
    if (payload) {
      setSuccessInfo(payload);
    }
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

  const goJoinSmsAuth = (payload) => {
    setTab("register");
    if (payload) {
      setJoinInfo(payload);
    }
    setSmsAuthInfo({
      mode: "join",
      phoneNumber: successInfo.phoneNumber,
    });
    setPage("smsAuth");
  };

  const goHistorySmsAuth = (phoneNumber) => {
    setTab("history");
    setSmsAuthInfo({
      mode: "history",
      phoneNumber,
    });
    setPage("smsAuth");
  };

  const handleSmsVerified = () => {
    if (smsAuthInfo.mode === "history") {
      goHistoryList();
      return;
    }

    setTab("register");
    setPage("joinComplete");
  };

  const renderPage = () => {
    if (tab === "register") {
      if (page === "home") {
        return <MainPage onGoSuccess={goRegisterSuccess} onGoFail={goRegisterFail} />;
      }

      if (page === "success") {
        return (
          <RegisterSuccessPage
            type={successType}
            successInfo={successInfo}
            onBackHome={goRegisterHome}
            onGoHistory={goHistoryList}
            onGoJoinAuth={goJoinSmsAuth}
          />
        );
      }

      if (page === "joinComplete") {
        return (
          <JoinCompletePage
            joinInfo={joinInfo}
            onBackHome={goRegisterHome}
            onGoHistory={goHistoryList}
          />
        );
      }

      if (page === "smsAuth") {
        return (
          <SmsAuthPage
            mode={smsAuthInfo.mode}
            phoneNumber={smsAuthInfo.phoneNumber}
            onBack={() => setPage("success")}
            onVerified={handleSmsVerified}
          />
        );
      }

      if (page === "fail") {
        return <RegisterFailPage onBackHome={goRegisterHome} />;
      }
    }

    if (tab === "history") {
      if (page === "historyVerify") {
        return <HistoryVerifyPage onVerified={goHistorySmsAuth} />;
      }

      if (page === "smsAuth") {
        return (
          <SmsAuthPage
            mode={smsAuthInfo.mode}
            phoneNumber={smsAuthInfo.phoneNumber}
            onBack={goHistoryVerify}
            onVerified={handleSmsVerified}
          />
        );
      }

      if (page === "historyList") {
        return <HistoryListPage phoneNumber={smsAuthInfo.phoneNumber} />;
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
