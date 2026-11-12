const listings = [
  {
    slug: "climate-resilience-urban-communities",
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
    slug: "ai-tools-accessible-learning",
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
    slug: "water-quality-catawba-river",
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
    slug: "stories-migration-american-south",
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
    slug: "community-health-food-access",
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
    slug: "robotics-sustainable-agriculture",
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
const listingsPage = document.querySelector(".listings-page");
const opportunityPage = document.querySelector("#opportunity-page");
const opportunityContent = document.querySelector("#opportunity-content");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

function cardMarkup(listing) {
  const opportunityUrl = `#opportunity/${listing.slug}`;
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
      <a class="card-link" href="${opportunityUrl}" aria-label="View details for ${listing.title}">View opportunity <span aria-hidden="true">→</span></a>
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

function opportunityMarkup(listing) {
  return `
    <header class="opportunity-heading">
      <p class="eyebrow">${listing.department}</p>
      <h1 id="opportunity-title">${listing.title}</h1>
      <p class="opportunity-faculty">Posted by <strong>${listing.faculty}</strong></p>
    </header>

    <div class="opportunity-layout">
      <article class="opportunity-details">
        <section aria-labelledby="about-title">
          <h2 id="about-title">About this opportunity</h2>
          <p>${listing.description}</p>
        </section>
        <section aria-labelledby="research-areas-title">
          <h2 id="research-areas-title">Research areas</h2>
          <ul class="area-tags" aria-label="Research areas">
            ${listing.areas.map((area) => `<li>${area}</li>`).join("")}
          </ul>
        </section>
        <section class="opportunity-facts" aria-label="Opportunity details">
          <div><span>Time commitment</span><strong>${listing.commitment}</strong></div>
          <div><span>Application deadline</span><strong>${formatDate(listing.deadline)}</strong></div>
          <div><span>Posted</span><strong>${formatDate(listing.posted)}</strong></div>
        </section>
      </article>

      <aside class="application-panel" aria-labelledby="apply-title">
        <h2 id="apply-title">Apply to this opportunity</h2>
        <p>Share a few details with ${listing.faculty} to get started.</p>
        <form class="application-form">
          <label for="applicant-name">Full name</label>
          <input id="applicant-name" name="name" autocomplete="name" required>

          <label for="applicant-email">Email address</label>
          <input id="applicant-email" name="email" type="email" autocomplete="email" required>

          <label for="applicant-major">Major or area of study</label>
          <input id="applicant-major" name="major" required>

          <label for="applicant-interest">Why are you interested?</label>
          <textarea id="applicant-interest" name="interest" rows="4" required></textarea>

          <button class="apply-button" type="submit">Submit application</button>
          <p class="application-note">This prototype does not send your application to the professor.</p>
          <p class="application-status" role="status" aria-live="polite"></p>
        </form>
      </aside>
    </div>
  `;
}

function renderRoute() {
  const route = window.location.hash;
  const match = route.match(/^#opportunity\/([a-z0-9-]+)$/);
  const listing = match && listings.find((item) => item.slug === match[1]);

  if (!listing) {
    if (route.startsWith("#opportunity/")) {
      window.location.hash = "";
      return;
    }

    listingsPage.hidden = false;
    opportunityPage.hidden = true;
    document.title = "Research Opportunities | Campus Portal";
    return;
  }

  opportunityContent.innerHTML = opportunityMarkup(listing);
  listingsPage.hidden = true;
  opportunityPage.hidden = false;
  document.title = `${listing.title} | Campus Research`;
}

searchInput.addEventListener("input", renderListings);
sortSelect.addEventListener("change", renderListings);
window.addEventListener("hashchange", renderRoute);

opportunityContent.addEventListener("submit", (event) => {
  if (!event.target.matches(".application-form")) return;
  event.preventDefault();

  const form = event.target;
  if (!form.reportValidity()) return;

  const status = form.querySelector(".application-status");
  status.textContent = "Your application is complete for this demo. It has not been sent to the professor.";
  form.querySelector(".apply-button").disabled = true;
  form.querySelector(".apply-button").textContent = "Application complete";
});

renderListings();
renderRoute();
