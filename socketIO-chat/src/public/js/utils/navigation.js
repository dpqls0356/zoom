(function () {
  const currentPath = window.location.pathname;
  const navType = performance.getEntriesByType("navigation")[0]?.type;
  if (navType === "navigate") {
    const prev = sessionStorage.getItem("curPage");
    if (prev) {
      sessionStorage.setItem("prevPage", prev);
    }
    sessionStorage.setItem("curPage", currentPath);
  }
  console.log(sessionStorage.getItem("prevPage"));
  console.log(sessionStorage.getItem("curPage"));
})();
