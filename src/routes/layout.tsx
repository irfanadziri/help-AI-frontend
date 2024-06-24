import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

const Layout: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    (async () => setUserInfo(await Auth.currentUserInfo()))();
  }, []);

  const handleSignOutClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    await Auth.signOut();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div
        className="bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      >
        <Navigation
          userInfo={userInfo}
          handleSignOutClick={handleSignOutClick}
        />
        <div className="container mt-32 p-72">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
