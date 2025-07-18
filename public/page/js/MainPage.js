function App() { 
  const [currentPage, setCurrentPage] = React.useState("overview");
  const [key, setKey] = React.useState("");

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get("k");
    const pageParam = urlParams.get("page");
    
    if (keyParam) {
      setKey(keyParam);
    }

    if (pageParam) {
      setCurrentPage(pageParam);
    } else {
      setCurrentPage("overview");
    }
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);

    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*\.html$/, "/MainPage.html");
    const newUrl = `${baseUrl}?page=${page}${key ? `&k=${encodeURIComponent(key)}` : ""}`;
    
    window.history.pushState({}, "", newUrl);
  };

  
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "grades":
        return React.createElement(GradesPageContent, { keyValue: key });
      case "study-plan":
        return React.createElement(StudyPlanPageContent, { keyValue: key });
      case "overview":
      default:
        return React.createElement(OverviewPageContent, { keyValue: key });
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "grades":
        return "Xem Điểm";
      case "study-plan":
        return "Kế hoạch học tập";
      case "overview":
      default:
        return "Tổng quan";
    }
  };

  return React.createElement(
    LayoutWithNavigation,
    {
      title: getPageTitle(),
      currentPage: currentPage,
      onNavigate: navigateTo,
      onOpenStudyPlan: () => navigateTo("study-plan"), 
    },
    renderCurrentPage()
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));