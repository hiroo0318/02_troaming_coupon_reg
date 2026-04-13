import React, { useState } from "react";
import "./style.css";

import BottomNav from "./components/BottomNav";
import MainPage from "./pages/MainPage";
import JoinCompletePage from "./pages/JoinCompletePage";
import RegisterSuccessPage from "./pages/RegisterSuccessPage";
import RegisterFailPage from "./pages/RegisterFailPage";
import HistoryVerifyPage from "./pages/HistoryVerifyPage";
import HistoryListPage from "./pages/HistoryListPage";
import SmsAuthServerPage from "./pages/SmsAuthServerPage";
import { lookupHistory, submitRegistration, subscribeRoamingProduct } from "./lib/roamingApi";

function App() {
  const [tab, setTab] = useState("register");
  const [page, setPage] = useState("home");
  const [registerResult, setRegisterResult] = useState(null);
  const [joinInfo, setJoinInfo] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyPhoneNumber, setHistoryPhoneNumber] = useState("");
  const [historyRequest, setHistoryRequest] = useState({
    phoneNumber: "",
    agreePrivacy: false,
  });

  const goRegisterHome = () => {
    setTab("register");
    setPage("home");
  };

  const goHistoryVerify = (nextState) => {
    setTab("history");
    setPage("historyVerify");
    setHistoryRequest({
      phoneNumber: nextState?.phoneNumber ?? "",
      agreePrivacy: nextState?.agreePrivacy ?? false,
    });
  };

  const goHistoryList = () => {
    setTab("history");
    setPage("historyList");
  };

  const goJoinComplete = (payload) => {
    setJoinInfo(payload);
    setTab("register");
    setPage("joinComplete");
  };

  const handleRegisterSubmit = async ({ couponNumber, phoneNumber, agreePrivacy }) => {
    try {
      const result = await submitRegistration({
        couponNumber,
        phoneNumber,
        agreePrivacy,
      });

      setRegisterResult({
        ...result,
        failureStage: null,
      });

      if (result.regResult === "success") {
        setPage("success");
        return result;
      }

      setPage("fail");
      return result;
    } catch (error) {
      const fallbackResult = {
        couponNumber,
        phoneNumber,
        regResult: "fail",
        failureStage: "register",
        errorMsg: error instanceof Error ? error.message : "등록 처리 중 문제가 발생했습니다.",
        message: error instanceof Error ? error.message : "등록 처리 중 문제가 발생했습니다.",
      };

      setRegisterResult(fallbackResult);
      setPage("fail");
      return fallbackResult;
    }
  };

  const handleHistoryPrepare = ({ phoneNumber, agreePrivacy }) => {
    setHistoryRequest({
      phoneNumber,
      agreePrivacy,
    });
    setTab("history");
    setPage("historyPin");
  };

  const handleHistoryLookup = async () => {
    const result = await lookupHistory({
      phoneNumber: historyRequest.phoneNumber,
      agreePrivacy: historyRequest.agreePrivacy,
    });

    setHistoryPhoneNumber(historyRequest.phoneNumber);
    setHistoryItems(result.items ?? []);
    goHistoryList();
    return result;
  };

  const handleJoinAuthSuccess = async (payload) => {
    try {
      const subscribeResult = await subscribeRoamingProduct({
        registrationId: registerResult?.id,
        phoneNumber: registerResult?.phoneNumber,
        couponNumber: registerResult?.couponNumber,
        productCode: registerResult?.productCode,
        category: registerResult?.category,
        startMode: payload?.startMode,
        useYt: Boolean(payload?.useYt),
      });

      goJoinComplete({
        ...payload,
        phoneNumber: registerResult?.phoneNumber,
        alreadySubscribed: Boolean(subscribeResult?.alreadySubscribed),
        resultMessage: subscribeResult?.message,
        subscribeLogs: subscribeResult?.logs ?? [],
      });
    } catch (error) {
      // 요금제 가입 실패 → 실패 페이지로 이동
      setRegisterResult((prev) => ({
        ...prev,
        regResult: "fail",
        failureStage: "subscribe",
        errorMsg: error instanceof Error ? error.message : "요금제 가입 처리에 실패했습니다.",
        message: error instanceof Error ? error.message : "요금제 가입 처리에 실패했습니다.",
      }));
      setPage("fail");
    }
  };

  const renderPage = () => {
    if (tab === "register") {
      if (page === "home") {
        return <MainPage onSubmitRegister={handleRegisterSubmit} />;
      }

      if (page === "success") {
        return (
          <RegisterSuccessPage
            result={registerResult}
            onBackHome={goRegisterHome}
            onGoHistory={() =>
              registerResult?.phoneNumber
                ? handleHistoryPrepare({
                    phoneNumber: registerResult.phoneNumber,
                    agreePrivacy: true,
                  })
                : goHistoryVerify()
            }
            onGoJoinAuth={(payload) => {
              setJoinInfo(payload);
              setTab("register");
              setPage("joinAuth");
            }}
          />
        );
      }

      if (page === "joinAuth") {
        return (
          <SmsAuthServerPage
            mode="join"
            phoneNumber={registerResult?.phoneNumber || ""}
            onBack={() => setPage("success")}
            onVerified={() => handleJoinAuthSuccess(joinInfo)}
          />
        );
      }

      if (page === "joinComplete") {
        return (
          <JoinCompletePage
            joinInfo={joinInfo}
            onBackHome={goRegisterHome}
            onGoHistory={() =>
              registerResult?.phoneNumber
                ? handleHistoryPrepare({
                    phoneNumber: registerResult.phoneNumber,
                    agreePrivacy: true,
                  })
                : goHistoryVerify()
            }
          />
        );
      }

      if (page === "fail") {
        return <RegisterFailPage result={registerResult} onBackHome={goRegisterHome} />;
      }
    }

    if (tab === "history") {
      if (page === "historyVerify") {
        return (
          <HistoryVerifyPage
            initialPhoneNumber={historyRequest.phoneNumber}
            onVerified={handleHistoryPrepare}
          />
        );
      }

      if (page === "historyPin") {
        return (
          <SmsAuthServerPage
            mode="history"
            phoneNumber={historyRequest.phoneNumber}
            onBack={() => setPage("historyVerify")}
            onVerified={handleHistoryLookup}
          />
        );
      }

      if (page === "historyList") {
        return (
          <HistoryListPage
            phoneNumber={historyPhoneNumber}
            historyItems={historyItems}
            onBack={goHistoryVerify}
          />
        );
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
