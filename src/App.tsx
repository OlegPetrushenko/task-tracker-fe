import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Layout from "./layouts/Layout";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectKanban from "./pages/ProjectKanban";
import Profile from "./pages/Profile";
import ConfirmPage from "./pages/Confirm";
import TasksPage from "./pages/Tasks";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordSent from "./pages/ResetPasswordSent";
import NewPassword from "./pages/NewPassword";
import ConfirmInviteProject from "./pages/ConfirmInviteProject";
import ConfirmRegistration from "./pages/ConfirmRegistration";
import RestoreAuthOnStart from "./features/auth/components/RestoreAuthOnStart";

function App() {
  const location = useLocation();

  const publicPaths = [
    "/login",
    "/register",
    "/auth/confirm-registration",
    "/auth/reset-password",
    "/auth/reset-sent",
    "/auth/new-password",
  ];

  const shouldRestoreAuth = !publicPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div>
      {shouldRestoreAuth && <RestoreAuthOnStart />}
      <Layout>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={<Projects />} />          
          <Route path="/project/:projectId/kanban" element={<ProjectKanban />} />          
          <Route path="/profile" element={<Profile />} />         
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/reset-sent" element={<ResetPasswordSent />} />
          <Route path="/auth/new-password" element={<NewPassword />} />
          <Route path="/auth/confirm-project" element={<ConfirmInviteProject />} />
          <Route path="/auth/confirm-registration" element={<ConfirmRegistration />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
