import { Outlet } from "react-router-dom";
import { useTitle } from "../../hooks/TitleProvider";
import Header from "../commons/Header";
import Sidebar from "../commons/Sidebar";
import { useEffect } from "react";

export default function Layout() {
  const { title } = useTitle();
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <div className="flex-1 overflow-auto hide-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const scrollbarStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;             /* Chrome, Safari and Opera */
  }
`;

const styleElement = document.createElement('style');
styleElement.textContent = scrollbarStyles;
document.head.appendChild(styleElement);
