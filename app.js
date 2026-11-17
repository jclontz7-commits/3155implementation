const menuButton = document.querySelector(".menu-button");
const closeButton = document.querySelector(".menu-close");
const menu = document.querySelector("#explore-menu");
const backdrop = document.querySelector(".menu-backdrop");
const homeScreen = document.querySelector("#home-screen");
const listingsScreen = document.querySelector("#listings-screen");
const searchInput = document.querySelector("#listing-search");
const areaFilter = document.querySelector("#area-filter");
const resultsStatus = document.querySelector("#results-status");
const noResults = document.querySelector("#no-results");
const listingCards = [...document.querySelectorAll(".listing-card")];
const researchListingsButton = document.querySelector("#research-listings");
const backHomeButton = document.querySelector("#back-home");

function openListings() {
  homeScreen.hidden = true;
  listingsScreen.hidden = false;
  document.title = "Research Listings | Campus Research";
  updateListings();
  searchInput.focus();
}

function openHome() {
  listingsScreen.hidden = true;
  homeScreen.hidden = false;
  searchInput.value = "";
  areaFilter.value = "";
  document.title = "Student Home | Campus Research";
  updateListings();
  researchListingsButton.focus();
}

function updateListings() {
  if (listingsScreen.hidden) {
    return;
  }

  const searchTerms = searchInput.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const selectedArea = areaFilter.value;
  let visibleCount = 0;

  for (const card of listingCards) {
    const areas = card.dataset.area.split(", ");
    const searchableText = `${card.dataset.search} ${card.dataset.area}`.toLocaleLowerCase();
    const matchesSearch = searchTerms.every((term) => searchableText.includes(term));
    const matchesArea = !selectedArea || areas.includes(selectedArea);
    const isVisible = matchesSearch && matchesArea;

    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  }

  noResults.hidden = visibleCount > 0;
  resultsStatus.textContent = visibleCount === 1
    ? "1 research listing"
    : `${visibleCount} research listings`;
}

for (const area of new Set(listingCards.flatMap((card) => card.dataset.area.split(", ")))) {
  const option = document.createElement("option");
  option.value = area;
  option.textContent = area;
  areaFilter.append(option);
}

function setMenuOpen(isOpen) {
  menu.hidden = !isOpen;
  backdrop.hidden = !isOpen;
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

  if (isOpen) {
    closeButton.focus();
  } else {
    menuButton.focus();
  }
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

closeButton.addEventListener("click", () => setMenuOpen(false));
backdrop.addEventListener("click", () => setMenuOpen(false));

menu.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (link) {
    setMenuOpen(false);

    if (link.hash === "#research-listings") {
      openListings();
    } else if (link.hash === "#home") {
      openHome();
    }
  }
});

researchListingsButton.addEventListener("click", openListings);
backHomeButton.addEventListener("click", openHome);
searchInput.addEventListener("input", () => {
  if (listingsScreen.hidden) {
    openListings();
    return;
  }

  updateListings();
});
areaFilter.addEventListener("change", updateListings);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) {
    setMenuOpen(false);
  }
});
