import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Layout from "./layouts/Layout";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import ConfirmPage from "./pages/Confirm";
import TasksPage from "./pages/Tasks";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordSent from "./pages/ResetPasswordSent";
import NewPassword from "./pages/NewPassword";
import ConfirmInviteProject from "./pages/ConfirmInviteProject";
import RestoreAuthOnStart from "./features/auth/components/RestoreAuthOnStart";

function App() {
  return (
    <div>
      <nav></nav>
      <Layout>
          <RestoreAuthOnStart />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={<Projects />} />          
          <Route path="/profile" element={<Profile />} />         
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/reset-sent" element={<ResetPasswordSent />} />
          <Route path="/auth/new-password" element={<NewPassword />} />
          <Route path="/auth/confirm-project" element={<ConfirmInviteProject />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
