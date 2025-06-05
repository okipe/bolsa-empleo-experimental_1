// Sample data for demonstration
const jobsData = [
    {
        id: 1,
        title: "Desarrollador Senior iOS",
        company: "Amazon",
        location: "Remoto",
        salary: "S/. 4,000 - S/. 12,000",
        applicants: 14,
        type: "remote",
        experience: "senior",
        tags: ["Kotlin", "iOS Developer", "Software Engineer"],
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
        posted: "2 días",
        featured: false,
    },
    // Add more jobs here...
];

// DOM Elements
const heroSearchInput = document.getElementById("heroSearchInput");
const heroSearchBtn = document.getElementById("heroSearchBtn");
const jobListings = document.getElementById("jobListings");
const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
const clearFiltersBtn = document.querySelector(".clear-filters");

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    animateJobCards();
});

function setupEventListeners() {
    // Hero search functionality
    heroSearchBtn.addEventListener("click", handleSearch);
    heroSearchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            handleSearch();
        }
    });

    // Filter functionality
    filterCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleFilterChange);
    });

    // Clear filters
    clearFiltersBtn.addEventListener("click", function (e) {
        e.preventDefault();
        clearAllFilters();
    });

    // Bookmark functionality
    setupBookmarkListeners();
}

function handleSearch() {
    const searchTerm = heroSearchInput.value.trim();
    if (searchTerm) {
        console.log("Searching for:", searchTerm);
        // Implement search logic here
        filterJobs({ search: searchTerm });
    }
}

function handleFilterChange(e) {
    const filterType = e.target
        .closest(".filter-section")
        .querySelector(".filter-section-title").textContent;
    const filterValue = e.target.id;
    const isChecked = e.target.checked;

    console.log(
        `Filter changed: ${filterType} - ${filterValue} - ${isChecked}`
    );

    // Update UI immediately
    updateFilterUI();

    // Apply filters
    applyFilters();
}

function updateFilterUI() {
    // Update filter counts and visual feedback
    filterCheckboxes.forEach((checkbox) => {
        const parent = checkbox.closest(".filter-option");
        if (checkbox.checked) {
            parent.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
            parent.style.borderRadius = "6px";
        } else {
            parent.style.backgroundColor = "transparent";
        }
    });
}

function applyFilters() {
    const activeFilters = {
        locations: [],
        types: [],
        experience: [],
        salary: [],
        specialties: [],
    };

    // Collect active filters
    filterCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const section = checkbox.closest(".filter-section");
            const sectionTitle = section.querySelector(
                ".filter-section-title"
            ).textContent;

            switch (sectionTitle) {
                case "Ubicaciones":
                    activeFilters.locations.push(checkbox.id);
                    break;
                case "Tipo de Trabajo":
                    activeFilters.types.push(checkbox.id);
                    break;
                case "Nivel de Experiencia":
                    activeFilters.experience.push(checkbox.id);
                    break;
                case "Salario Esperado":
                    activeFilters.salary.push(checkbox.id);
                    break;
                case "Especialidades de Trabajo":
                    activeFilters.specialties.push(checkbox.id);
                    break;
            }
        }
    });

    console.log("Active filters:", activeFilters);

    // Apply filters to job listings
    filterJobs(activeFilters);
}

function filterJobs(filters) {
    // Simulate filtering - in real app, this would filter the actual job data
    const jobCards = document.querySelectorAll(".job-card");

    jobCards.forEach((card, index) => {
        // Simple animation while filtering
        card.style.opacity = "0.5";

        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateX(0)";
        }, index * 100);
    });

    // Update results count
    const resultsCount = document.querySelector(".results-count");
    const resultsText = filters.search
        ? `Resultados para "${filters.search}"`
        : "Desarrollador Senior iOS";
    resultsCount.textContent = resultsText;
}

function clearAllFilters() {
    filterCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
        const parent = checkbox.closest(".filter-option");
        parent.style.backgroundColor = "transparent";
    });

    // Clear salary inputs
    document.querySelectorAll(".salary-input").forEach((input) => {
        input.value = "";
    });

    // Reset search
    heroSearchInput.value = "";

    // Refresh job listings
    filterJobs({});

    console.log("All filters cleared");
}

function setupBookmarkListeners() {
    document.querySelectorAll(".bookmark-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();

            const icon = this.querySelector("i");
            const isBookmarked = icon.classList.contains("bi-bookmark-fill");

            if (isBookmarked) {
                icon.className = "bi bi-bookmark";
                this.style.color = "var(--text-muted)";
                this.style.borderColor = "var(--border-color)";
            } else {
                icon.className = "bi bi-bookmark-fill";
                this.style.color = "var(--primary-color)";
                this.style.borderColor = "var(--primary-color)";
            }

            // Add animation
            this.style.transform = "scale(0.9)";
            setTimeout(() => {
                this.style.transform = "scale(1)";
            }, 150);
        });
    });
}

function animateJobCards() {
    const cards = document.querySelectorAll(".job-card");

    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
            card.style.transition = "all 0.5s ease";
        }, index * 100);
    });
}

// Apply button tracking
document.querySelectorAll(".btn-apply").forEach((btn) => {
    btn.addEventListener("click", function (e) {
        e.preventDefault();

        const jobTitle =
            this.closest(".job-card").querySelector(".job-title").textContent;
        console.log(`Application click tracked: ${jobTitle}`);

        // Add visual feedback
        this.innerHTML = '<i class="bi bi-check-circle"></i> Aplicando...';
        this.style.background = "var(--success-color)";

        setTimeout(() => {
            // Simulate redirect to external application
            window.open("#", "_blank");

            // Reset button
            setTimeout(() => {
                this.innerHTML =
                    '<i class="bi bi-box-arrow-up-right"></i> Aplicar Ahora';
                this.style.background = "var(--primary-color)";
            }, 1000);
        }, 500);
    });
});

// Responsive behavior
function handleResize() {
    const width = window.innerWidth;

    if (width < 992) {
        // Mobile/tablet adjustments
        document.querySelectorAll(".filter-sidebar").forEach((sidebar) => {
            sidebar.style.position = "static";
        });
    } else {
        // Desktop adjustments
        document.querySelectorAll(".filter-sidebar").forEach((sidebar) => {
            sidebar.style.position = "sticky";
        });
    }
}

window.addEventListener("resize", handleResize);
handleResize(); // Initial call

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    });
});
