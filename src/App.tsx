import { useEffect, useState, type FC } from "react";
import "./index.css";
import { SportsbookDemo } from "./SportsbookDemo";
import { StyleLab } from "./stylelab/StyleLab";

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash.replace(/^#/, "") || "/";
}

const App: FC = () => {
  const route = useHashRoute();
  if (route.startsWith("/sportsbook")) return <SportsbookDemo />;
  return <StyleLab />;
};

export default App;
