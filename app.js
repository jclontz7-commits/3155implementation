const listings = [
  {
    title: "Climate Resilience in Urban Communities",
    department: "Geography & Earth Sciences",
    faculty: "Dr. Maya Thompson",
    description: "Study how neighborhoods adapt to extreme heat and changing weather through community data and field research.",
    areas: ["Climate", "Community research"],
    posted: "2026-10-28",
    deadline: "2026-12-05",
    commitment: "5–8 hours / week",
  },
  {
    title: "AI Tools for Accessible Learning",
    department: "Computer Science",
    faculty: "Dr. Daniel Kim",
    description: "Explore how thoughtful AI tools can make course materials and learning experiences more accessible to every student.",
    areas: ["Artificial intelligence", "Accessibility"],
    posted: "2026-10-24",
    deadline: "2026-11-30",
    commitment: "6 hours / week",
  },
  {
    title: "Water Quality in the Catawba River",
    department: "Biological Sciences",
    faculty: "Dr. Olivia Reed",
    description: "Collect and analyze water samples to understand the health of local waterways and surrounding ecosystems.",
    areas: ["Environment", "Fieldwork"],
    posted: "2026-10-20",
    deadline: "2026-12-12",
    commitment: "4–6 hours / week",
  },
  {
    title: "Stories of Migration in the American South",
    department: "History",
    faculty: "Dr. Javier Morales",
    description: "Help build a digital archive of oral histories documenting migration and community life across the region.",
    areas: ["History", "Digital humanities"],
    posted: "2026-10-16",
    deadline: "2026-11-25",
    commitment: "5 hours / week",
  },
  {
    title: "Community Health and Food Access",
    department: "Public Health Sciences",
    faculty: "Dr. Aisha Patel",
    description: "Partner with local organizations to map food access and understand its relationship to community health.",
    areas: ["Public health", "Community research"],
    posted: "2026-10-10",
    deadline: "2026-12-18",
    commitment: "6–8 hours / week",
  },
  {
    title: "Robotics for Sustainable Agriculture",
    department: "Mechanical Engineering",
    faculty: "Dr. Noah Williams",
    description: "Prototype small-scale robotic systems that help growers monitor crops and use resources efficiently.",
    areas: ["Robotics", "Sustainability"],
    posted: "2026-10-04",
    deadline: "2027-01-08",
    commitment: "8 hours / week",
  },
];

const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const listingsContainer = document.querySelector("#listings");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

function cardMarkup(listing) {
  return `
    <article class="listing-card">
      <div class="card-topline">
        <span class="department">${listing.department}</span>
        <span class="posted-date">Posted ${formatDate(listing.posted)}</span>
      </div>
      <h2>${listing.title}</h2>
      <p class="faculty">${listing.faculty}</p>
      <p class="description">${listing.description}</p>
      <ul class="area-tags" aria-label="Research areas">
        ${listing.areas.map((area) => `<li>${area}</li>`).join("")}
      </ul>
      <div class="card-footer">
        <span class="commitment">${listing.commitment}</span>
        <span class="deadline">Apply by ${formatDate(listing.deadline)}</span>
      </div>
    </article>
  `;
}

function getVisibleListings() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filtered = listings.filter((listing) => {
    const searchableText = [
      listing.title,
      listing.department,
      listing.faculty,
      listing.description,
      ...listing.areas,
    ].join(" ").toLocaleLowerCase();

    return searchableText.includes(query);
  });

  switch (sortSelect.value) {
    case "title-asc":
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "deadline":
      filtered.sort((a, b) => a.deadline.localeCompare(b.deadline));
      break;
    default:
      filtered.sort((a, b) => b.posted.localeCompare(a.posted));
  }

  return filtered;
}

function renderListings() {
  const visibleListings = getVisibleListings();
  const count = visibleListings.length;

  listingsContainer.innerHTML = visibleListings.map(cardMarkup).join("");
  resultsCount.textContent = `${count} ${count === 1 ? "opportunity" : "opportunities"}`;
  emptyState.hidden = count !== 0;
  listingsContainer.hidden = count === 0;
}

searchInput.addEventListener("input", renderListings);
sortSelect.addEventListener("change", renderListings);

renderListings();
