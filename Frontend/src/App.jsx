import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// =============================================
// AUTH
// =============================================

import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/Signup";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import Onboarding from "./features/auth/pages/Onboarding";

// =============================================
// DASHBOARD
// =============================================

import DashboardLayout from "./features/dashboard/layout/DashboardLayout";
import Overview from "./features/dashboard/pages/Overview";
import Profile from "./features/dashboard/pages/Profile";
import ResumeAnalyzer from "./features/dashboard/pages/ResumeAnalyzer";

// =============================================
// INTERVIEW
// =============================================

import MockInterview from "./features/interview/pages/MockInterview";
import InterviewSetup from "./features/interview/pages/InterviewSetup";
import DeviceCheck from "./features/interview/pages/DeviceCheck";
import InterviewRoom from "./features/interview/pages/InterviewRoom";
import InterviewComplete from "./features/interview/pages/InterviewComplete";

function App() {
  return (
    <Routes>
      {/* =========================================
          ROOT
      ========================================= */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* =========================================
          AUTH
      ========================================= */}

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/onboarding"
        element={<Onboarding />}
      />

      {/* =========================================
          DASHBOARD
      ========================================= */}

      <Route
        path="/dashboard"
        element={<DashboardLayout />}
      >
        {/* /dashboard */}

        <Route
          index
          element={<Overview />}
        />

        {/* /dashboard/profile */}

        <Route
          path="profile"
          element={<Profile />}
        />

        {/* /dashboard/resume */}

        <Route
          path="resume"
          element={<ResumeAnalyzer />}
        />

        {/* /dashboard/interview */}

        <Route
          path="interview"
          element={<MockInterview />}
        />

        {/* =====================================
            DASHBOARD FALLBACK
        ====================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Route>

      {/* =========================================
          FULL SCREEN INTERVIEW FLOW
      ========================================= */}

      <Route
        path="/interview/setup"
        element={<InterviewSetup />}
      />

      <Route
        path="/interview/device-check"
        element={<DeviceCheck />}
      />

      <Route
        path="/interview/room"
        element={<InterviewRoom />}
      />

      <Route
        path="/interview/complete"
        element={<InterviewComplete />}
      />

      {/* =========================================
          GLOBAL FALLBACK
      ========================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;