import plus from "@assets/images/icons/plus.svg";
import MenuButton from "@components/ui/MenuButton";
import { useMediaQuery } from "react-responsive";
import { useNavigate, useLocation } from "react-router";

export default function AppBarMobile() {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const navigate = useNavigate();
  const location = useLocation();

  const unavailable = () => alert("Unavailable Page");

  if (!isMobile) return null;

  const isHome = location.pathname.startsWith("/main");
  const isProfile = location.pathname === "/profile";

  return (
    <menu
      className={[
        "flex justify-between items-center",
        "bg-base-white border border-primary-black-20 rounded-full",
        "px-6 py-3",
        "fixed bottom-3 left-4 right-4 max-w-120 mx-auto z-10",
      ].join(" ")}
    >
      <MenuButton icon="home" active={isHome} onClick={() => navigate("/main")} />
      <MenuButton icon="explore" onClick={unavailable} />

      <button
        onClick={() => navigate("/createhabit")}
        className="w-10 h-10 bg-blue-gradient rounded-full p-2.5 mx-2"
      >
        <img src={plus} alt="add" />
      </button>

      <MenuButton icon="activity" dot onClick={unavailable} />
      <MenuButton icon="profile" active={isProfile} onClick={() => navigate("/profile")} />
    </menu>
  );
}
