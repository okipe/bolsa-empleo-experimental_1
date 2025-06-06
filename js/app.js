// Global variables
let allJobs = [];
let filteredJobs = [];
let taxonomies = {};
let currentPage = 1;
const jobsPerPage = 5;

// DOM Elements
const heroSearchInput = document.getElementById("heroSearchInput");
const heroSearchBtn = document.getElementById("heroSearchBtn");
const jobListings = document.getElementById("jobListings");
const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
const clearFiltersBtn = document.querySelector(".clear-filters");
const carreraSelect = document.getElementById("carreraSelect");
const ubicacionSelect = document.getElementById("ubicacionSelect"); // 🆕 Nuevo dropdown de ubicaciones
const sortSelect = document.getElementById("sortSelect");
const salaryMinInput = document.getElementById("salaryMin");
const salaryMaxInput = document.getElementById("salaryMax");
const applySalaryBtn = document.getElementById("applySalaryRange");
const clearSalaryBtn = document.getElementById("clearSalaryRange");

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
    loadJobsData();
});

// Load jobs data from JSON
async function loadJobsData() {
    try {
        console.log("Loading jobs data...");
        const response = await fetch("./data/jobs.json"); // 🔧 Path corregido para la carpeta data

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allJobs = data.jobs;
        taxonomies = data.taxonomies;
        filteredJobs = [...allJobs];

        console.log("Jobs loaded successfully:", allJobs.length);

        // Initialize after data is loaded
        setupEventListeners();
        updateFilterCounts();
        updateStats();
        renderJobs();
        animateJobCards();
    } catch (error) {
        console.error("Error loading jobs data:", error);
        showError(
            "Error al cargar las oportunidades. Por favor, intenta más tarde."
        );
    }
}

function setupEventListeners() {
    // Hero search functionality
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener("click", handleSearch);
    }

    if (heroSearchInput) {
        heroSearchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                handleSearch();
            }
        });
    }

    // Filter functionality
    filterCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleFilterChange);
    });

    // Career/Specialty dropdown
    if (carreraSelect) {
        carreraSelect.addEventListener("change", handleFilterChange);
    }

    // 🆕 Location dropdown event listener
    if (ubicacionSelect) {
        ubicacionSelect.addEventListener("change", handleFilterChange);
    }

    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener("change", handleSort);
    }

    // Salary range buttons
    if (applySalaryBtn) {
        applySalaryBtn.addEventListener("click", applySalaryRange);
    }

    if (clearSalaryBtn) {
        clearSalaryBtn.addEventListener("click", clearSalaryRange);
    }

    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", function (e) {
            e.preventDefault();
            clearAllFilters();
        });
    }
}

function handleSearch() {
    const searchTerm = heroSearchInput?.value?.trim() || "";
    console.log("Searching for:", searchTerm);
    applyFilters();
}

function handleFilterChange(e) {
    console.log("Filter changed");
    updateFilterUI();
    applyFilters();
}

function handleSort() {
    const sortBy = sortSelect?.value || "recent";
    console.log("Sorting by:", sortBy);

    filteredJobs.sort((a, b) => {
        switch (sortBy) {
            case "recent":
                return (
                    new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
                );
            case "salary":
                return (
                    (b.salario.max || b.salario.min) -
                    (a.salario.max || a.salario.min)
                );
            case "type":
                return a.nivelExperiencia.localeCompare(b.nivelExperiencia);
            case "career":
                return a.industria.localeCompare(b.industria);
            default:
                return 0;
        }
    });

    renderJobs();
}

function updateFilterUI() {
    // Update filter counts and visual feedback for checkboxes
    filterCheckboxes.forEach((checkbox) => {
        const parent = checkbox.closest(".filter-option");
        if (!parent) return;

        if (checkbox.checked) {
            parent.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
            parent.style.borderRadius = "6px";
            parent.style.padding = "0.5rem";
        } else {
            parent.style.backgroundColor = "transparent";
            parent.style.padding = "0.5rem 0";
        }
    });

    // 🆕 Visual feedback for location dropdown
    if (ubicacionSelect && ubicacionSelect.value) {
        ubicacionSelect.style.borderColor = "var(--primary-color)";
        ubicacionSelect.style.backgroundColor = "rgba(99, 102, 241, 0.05)";
    } else if (ubicacionSelect) {
        ubicacionSelect.style.borderColor = "";
        ubicacionSelect.style.backgroundColor = "";
    }

    // Visual feedback for career dropdown
    if (carreraSelect && carreraSelect.value) {
        carreraSelect.style.borderColor = "var(--primary-color)";
        carreraSelect.style.backgroundColor = "rgba(99, 102, 241, 0.05)";
    } else if (carreraSelect) {
        carreraSelect.style.borderColor = "";
        carreraSelect.style.backgroundColor = "";
    }
}

function applyFilters() {
    const searchTerm = heroSearchInput?.value?.toLowerCase().trim() || "";
    const selectedCarrera = carreraSelect?.value || "";
    const selectedUbicacion = ubicacionSelect?.value || ""; // 🆕 Nueva ubicación seleccionada

    const activeFilters = {
        location: selectedUbicacion, // 🔧 Cambiado de array a string simple
        types: [], // Tipo de oportunidad (prácticas pre-prof, prof, voluntariado)
        modalities: [], // Modalidad (presencial, híbrido, remoto)
        salary: [],
        carrera: selectedCarrera,
        customSalaryRange: getCustomSalaryRange(),
    };

    // Collect active filters from checkboxes (excluding location checkboxes)
    filterCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const section = checkbox.closest(".filter-section");
            if (!section) return;

            const sectionTitle = section.querySelector(".filter-section-title");
            if (!sectionTitle) return;

            const titleText = sectionTitle.textContent.trim();

            switch (titleText) {
                case "Tipo de Oportunidad":
                    activeFilters.types.push(checkbox.id);
                    break;
                case "Modalidad de Trabajo":
                    activeFilters.modalities.push(checkbox.id);
                    break;
                case "Subvención/Remuneración":
                    activeFilters.salary.push(checkbox.id);
                    break;
                // 🗑️ Removed "Ubicaciones" case since we're using dropdown now
            }
        }
    });

    console.log("Active filters:", activeFilters);
    console.log("Search term:", searchTerm);
    console.log("Selected carrera:", selectedCarrera);
    console.log("Selected ubicacion:", selectedUbicacion); // 🆕 Log ubicación

    // Filter jobs
    filteredJobs = allJobs.filter((job) => {
        // Search filter
        let matchesSearch = true;
        if (searchTerm) {
            const searchableText = `
                ${job.titulo} 
                ${job.empresa} 
                ${job.descripcion} 
                ${job.tags.join(" ")}
                ${job.industria}
            `.toLowerCase();
            matchesSearch = searchableText.includes(searchTerm);
        }

        // 🆕 Location filter (simplified - direct comparison)
        let matchesLocation =
            !activeFilters.location || job.ubicacion === activeFilters.location;

        // Opportunity type filter (prácticas pre-prof, prof, voluntariado)
        let matchesType = activeFilters.types.length === 0;
        if (activeFilters.types.length > 0) {
            matchesType = activeFilters.types.some((type) => {
                return job.nivelExperiencia === type;
            });
        }

        // Modality filter
        let matchesModality = activeFilters.modalities.length === 0;
        if (activeFilters.modalities.length > 0) {
            matchesModality = activeFilters.modalities.some((modality) => {
                return job.modalidad === modality;
            });
        }

        // Career filter
        let matchesCarrera =
            !activeFilters.carrera || job.industria === activeFilters.carrera;

        // Salary filter (radio buttons + custom range)
        let matchesSalary = true;

        // Check custom salary range first (has priority)
        if (activeFilters.customSalaryRange) {
            const jobSalary = job.salario.max || job.salario.min;
            const { min, max } = activeFilters.customSalaryRange;
            matchesSalary = jobSalary >= min && jobSalary <= max;
        }
        // If no custom range, check radio buttons
        else if (activeFilters.salary.length > 0) {
            // Check if "Todos" is selected
            if (activeFilters.salary.includes("todos-salarios")) {
                matchesSalary = true;
            } else {
                const jobSalary = job.salario.max || job.salario.min;
                matchesSalary = activeFilters.salary.some((salaryRange) => {
                    switch (salaryRange) {
                        case "voluntario":
                            return jobSalary === 0;
                        case "salary1":
                            return jobSalary >= 500 && jobSalary <= 800;
                        case "salary2":
                            return jobSalary > 800 && jobSalary <= 1000;
                        case "salary3":
                            return jobSalary > 1000 && jobSalary <= 1200;
                        default:
                            return true;
                    }
                });
            }
        }

        return (
            matchesSearch &&
            matchesLocation &&
            matchesType &&
            matchesModality &&
            matchesCarrera &&
            matchesSalary
        );
    });

    currentPage = 1;
    renderJobs();
    updateResultsInfo();
}

function renderJobs() {
    if (!jobListings) {
        console.error("Job listings container not found");
        return;
    }

    if (filteredJobs.length === 0) {
        showNoResults();
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const jobsToShow = filteredJobs.slice(startIndex, endIndex);

    // Render job cards
    const jobsHTML = jobsToShow.map((job) => createJobCard(job)).join("");
    jobListings.innerHTML = jobsHTML;

    // Setup event listeners for new cards
    setupJobCardListeners();

    // Render pagination if needed
    if (totalPages > 1) {
        renderPagination(totalPages);
    } else {
        // Remove pagination if not needed
        const existingPagination = document.querySelector(
            ".pagination-container"
        );
        if (existingPagination) {
            existingPagination.remove();
        }
    }
}

function createJobCard(job) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Hoy";
        if (diffDays === 1) return "Ayer";
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30)
            return `Hace ${Math.floor(diffDays / 7)} semana${
                Math.floor(diffDays / 7) !== 1 ? "s" : ""
            }`;
        return date.toLocaleDateString("es-PE");
    };

    const formatSalary = (salario) => {
        if (salario.min === 0 && salario.max === 0) {
            return "Voluntariado";
        }
        if (salario.min === salario.max) {
            return `S/. ${salario.min.toLocaleString()}`;
        }
        return `S/. ${salario.min.toLocaleString()} - S/. ${salario.max.toLocaleString()}`;
    };

    const getOpportunityTypeLabel = (nivelExperiencia) => {
        const typeMap = {
            "practicas-preprofesionales": "Prácticas Pre-profesionales",
            "practicas-profesionales": "Prácticas Profesionales",
            voluntariado: "Voluntariado",
        };
        return typeMap[nivelExperiencia] || nivelExperiencia;
    };

    const getModalityLabel = (modalidad) => {
        const modalityMap = {
            remoto: "Remoto",
            presencial: "Presencial",
            hibrido: "Híbrido",
        };
        return modalityMap[modalidad] || modalidad;
    };

    const getCareerLabel = (industria) => {
        const careerMap = {
            comunicaciones: "Comunicaciones",
            contabilidad: "Contabilidad",
            medicina: "Medicina",
            psicologia: "Psicología",
            "ingenieria-sistemas": "Ingeniería de Sistemas",
            derecho: "Derecho",
            enfermeria: "Enfermería",
            "ingenieria-industrial": "Ingeniería Industrial",
            administracion: "Administración",
            educacion: "Educación",
            marketing: "Marketing",
            arquitectura: "Arquitectura",
        };
        return careerMap[industria] || industria;
    };

    // 🆕 Nueva función para obtener el label de ubicación
    const getLocationLabel = (ubicacion) => {
        const locationMap = {
            amazonas: "Amazonas",
            ancash: "Áncash",
            apurimac: "Apurímac",
            arequipa: "Arequipa",
            ayacucho: "Ayacucho",
            cajamarca: "Cajamarca",
            cusco: "Cusco",
            huancavelica: "Huancavelica",
            huanuco: "Huánuco",
            ica: "Ica",
            junin: "Junín",
            "la-libertad": "La Libertad",
            lambayeque: "Lambayeque",
            "lima-callao": "Lima y Callao",
            loreto: "Loreto",
            "madre-de-dios": "Madre de Dios",
            moquegua: "Moquegua",
            pasco: "Pasco",
            piura: "Piura",
            puno: "Puno",
            "san-martin": "San Martín",
            tacna: "Tacna",
            tumbes: "Tumbes",
            ucayali: "Ucayali",
        };
        return locationMap[ubicacion] || job.empresa_info?.ubicacion || "Perú";
    };

    const generateApplicants = () => {
        // Generate realistic number based on opportunity type
        const base =
            job.nivelExperiencia === "voluntariado"
                ? 8
                : job.nivelExperiencia === "practicas-preprofesionales"
                ? 15
                : 12;
        return Math.floor(Math.random() * 20) + base;
    };

    const getOpportunityBadge = () => {
        if (job.destacado && job.urgente) {
            return `
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-warning text-dark me-1"><i class="bi bi-star-fill"></i> Destacado</span>
                    <span class="badge bg-danger"><i class="bi bi-clock-fill"></i> Urgente</span>
                </div>
            `;
        } else if (job.destacado) {
            return `<div class="position-absolute top-0 end-0 m-2"><span class="badge bg-warning text-dark"><i class="bi bi-star-fill me-1"></i>Destacado</span></div>`;
        } else if (job.urgente) {
            return `<div class="position-absolute top-0 end-0 m-2"><span class="badge bg-danger"><i class="bi bi-clock-fill me-1"></i>Urgente</span></div>`;
        }
        return "";
    };

    return `
        <div class="job-card fade-in" data-job-id="${job.id}">
            ${getOpportunityBadge()}
            
            <div class="job-header">
                <div class="company-logo">${
                    job.empresa_info?.logo || job.empresa.charAt(0)
                }</div>
                <div class="job-info">
                    <h3 class="job-title">${job.titulo}</h3>
                    <div class="job-meta">
                        <span class="job-meta-item">
                            <i class="bi bi-building"></i>
                            ${job.empresa}
                        </span>
                        <span class="job-meta-item">
                            <i class="bi bi-mortarboard"></i>
                            ${getCareerLabel(job.industria)}
                        </span>
                        <span class="job-meta-item">
                            <i class="bi bi-geo-alt"></i>
                            ${getLocationLabel(
                                job.ubicacion
                            )} • ${getModalityLabel(job.modalidad)}
                        </span>
                        <span class="job-meta-item job-salary">
                            <i class="bi bi-cash-coin"></i>
                            ${formatSalary(job.salario)}
                        </span>
                    </div>
                    <small class="text-muted">
                        <i class="bi bi-bookmark-check"></i>
                        ${getOpportunityTypeLabel(
                            job.nivelExperiencia
                        )} • ${generateApplicants()} postulaciones
                    </small>
                </div>
                <button class="bookmark-btn" data-job-id="${
                    job.id
                }" title="Guardar oportunidad">
                    <i class="bi bi-bookmark"></i>
                </button>
            </div>

            <div class="job-description">
                ${job.descripcion}
            </div>

            <div class="job-tags">
                ${job.tags
                    .map((tag) => {
                        const isSpecial = [
                            "Prácticas",
                            "Voluntariado",
                            "Destacado",
                            "Urgente",
                        ].some((special) =>
                            tag.toLowerCase().includes(special.toLowerCase())
                        );
                        return `<span class="job-tag ${
                            isSpecial ? "featured" : ""
                        }">${tag}</span>`;
                    })
                    .join("")}
            </div>

            <div class="job-actions">
                <a href="${
                    job.enlace
                }" class="btn-apply" target="_blank" rel="noopener noreferrer" data-job-id="${
        job.id
    }">
                    <i class="bi bi-box-arrow-up-right"></i>
                    ${
                        job.nivelExperiencia === "voluntariado"
                            ? "Postular como Voluntario"
                            : "Aplicar Ahora"
                    }
                </a>
                <div class="job-stats">
                    <span><i class="bi bi-clock"></i> ${formatDate(
                        job.fechaPublicacion
                    )}</span>
                </div>
            </div>
        </div>
    `;
}

function setupJobCardListeners() {
    // Apply button tracking
    document.querySelectorAll(".btn-apply").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            const jobId = this.getAttribute("data-job-id");
            const jobTitle =
                this.closest(".job-card").querySelector(
                    ".job-title"
                ).textContent;

            console.log(
                `Application click tracked: Job ${jobId} - ${jobTitle}`
            );

            // Add visual feedback
            const originalHTML = this.innerHTML;
            this.innerHTML =
                '<i class="bi bi-check-circle"></i> Redirigiendo...';
            this.style.background = "var(--success-color)";

            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.background = "var(--primary-color)";
            }, 2000);
        });
    });

    // Bookmark functionality
    document.querySelectorAll(".bookmark-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();

            const jobId = this.getAttribute("data-job-id");
            const icon = this.querySelector("i");
            const isBookmarked = icon.classList.contains("bi-bookmark-fill");

            if (isBookmarked) {
                icon.className = "bi bi-bookmark";
                this.style.color = "var(--text-muted)";
                this.style.borderColor = "var(--border-color)";
                showNotification("Oportunidad removida de favoritos", "info");
            } else {
                icon.className = "bi bi-bookmark-fill";
                this.style.color = "var(--primary-color)";
                this.style.borderColor = "var(--primary-color)";
                showNotification(
                    "Oportunidad guardada en favoritos",
                    "success"
                );
            }

            // Add animation
            this.style.transform = "scale(0.9)";
            setTimeout(() => {
                this.style.transform = "scale(1)";
            }, 150);

            console.log(`Bookmark toggled for job ${jobId}`);
        });
    });
}

function updateResultsInfo() {
    const resultsCount = document.querySelector(".results-count");
    const resultsMetaElement = document.querySelector(".results-meta");

    if (resultsCount) {
        const searchTerm = heroSearchInput?.value?.trim();
        const selectedCarrera = carreraSelect?.value;
        const selectedUbicacion = ubicacionSelect?.value; // 🆕

        if (searchTerm) {
            resultsCount.textContent = `Resultados para "${searchTerm}"`;
        } else if (selectedCarrera) {
            const careerLabel = getCareerLabel(selectedCarrera);
            resultsCount.textContent = `Oportunidades en ${careerLabel}`;
        } else if (selectedUbicacion) {
            // 🆕 Mostrar ubicación en el título
            const locationLabel = getLocationLabel(selectedUbicacion);
            resultsCount.textContent = `Oportunidades en ${locationLabel}`;
        } else {
            resultsCount.textContent = "Oportunidades Disponibles";
        }
    }

    if (resultsMetaElement) {
        const totalJobs = filteredJobs.length;
        const startIndex = (currentPage - 1) * jobsPerPage + 1;
        const endIndex = Math.min(currentPage * jobsPerPage, totalJobs);

        if (totalJobs > 0) {
            resultsMetaElement.textContent = `Mostrando ${startIndex}-${endIndex} de ${totalJobs} oportunidades`;
        } else {
            resultsMetaElement.textContent = "No se encontraron oportunidades";
        }
    }
}

// Custom salary range functions
function getCustomSalaryRange() {
    const min = parseInt(salaryMinInput?.value) || null;
    const max = parseInt(salaryMaxInput?.value) || null;

    if (min !== null && max !== null && min <= max) {
        return { min, max };
    } else if (min !== null && max === null) {
        return { min, max: 10000 }; // Set high max if only min is provided
    } else if (min === null && max !== null) {
        return { min: 0, max }; // Set min to 0 if only max is provided
    }

    return null;
}

function applySalaryRange() {
    const min = parseInt(salaryMinInput?.value) || null;
    const max = parseInt(salaryMaxInput?.value) || null;

    // Validation
    if (min !== null && max !== null && min > max) {
        showNotification(
            "El salario mínimo no puede ser mayor al máximo",
            "error"
        );
        return;
    }

    if (min !== null && min < 0) {
        showNotification("El salario mínimo no puede ser negativo", "error");
        return;
    }

    if (max !== null && max > 10000) {
        showNotification(
            "El salario máximo no puede ser mayor a S/. 10,000",
            "error"
        );
        return;
    }

    // If custom range is set, uncheck all radio buttons
    if (min !== null || max !== null) {
        filterCheckboxes.forEach((checkbox) => {
            if (checkbox.name === "salary") {
                checkbox.checked = false;
                const parent = checkbox.closest(".filter-option");
                if (parent) {
                    parent.style.backgroundColor = "transparent";
                    parent.style.padding = "0.5rem 0";
                }
            }
        });

        // Visual feedback for custom range
        if (salaryMinInput)
            salaryMinInput.style.borderColor = "var(--primary-color)";
        if (salaryMaxInput)
            salaryMaxInput.style.borderColor = "var(--primary-color)";

        showNotification(
            `Filtro aplicado: S/. ${min || 0} - S/. ${max || "∞"}`,
            "success"
        );
    }

    applyFilters();
}

function clearSalaryRange() {
    if (salaryMinInput) {
        salaryMinInput.value = "";
        salaryMinInput.style.borderColor = "";
    }
    if (salaryMaxInput) {
        salaryMaxInput.value = "";
        salaryMaxInput.style.borderColor = "";
    }

    // Reset to "Todos" radio button
    const todosRadio = document.getElementById("todos-salarios");
    if (todosRadio) {
        todosRadio.checked = true;
        const parent = todosRadio.closest(".filter-option");
        if (parent) {
            parent.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
            parent.style.borderRadius = "6px";
            parent.style.padding = "0.5rem";
        }
    }

    showNotification("Rango personalizado limpiado", "info");
    applyFilters();
}

function getCareerLabel(industria) {
    const careerMap = {
        comunicaciones: "Comunicaciones",
        contabilidad: "Contabilidad",
        medicina: "Medicina",
        psicologia: "Psicología",
        "ingenieria-sistemas": "Ingeniería de Sistemas",
        derecho: "Derecho",
        enfermeria: "Enfermería",
        "ingenieria-industrial": "Ingeniería Industrial",
        administracion: "Administración",
        educacion: "Educación",
        marketing: "Marketing",
        arquitectura: "Arquitectura",
    };
    return careerMap[industria] || industria;
}

// 🆕 Nueva función para obtener el label de ubicación (también usada en updateResultsInfo)
function getLocationLabel(ubicacion) {
    const locationMap = {
        amazonas: "Amazonas",
        ancash: "Áncash",
        apurimac: "Apurímac",
        arequipa: "Arequipa",
        ayacucho: "Ayacucho",
        cajamarca: "Cajamarca",
        cusco: "Cusco",
        huancavelica: "Huancavelica",
        huanuco: "Huánuco",
        ica: "Ica",
        junin: "Junín",
        "la-libertad": "La Libertad",
        lambayeque: "Lambayeque",
        "lima-callao": "Lima y Callao",
        loreto: "Loreto",
        "madre-de-dios": "Madre de Dios",
        moquegua: "Moquegua",
        pasco: "Pasco",
        piura: "Piura",
        puno: "Puno",
        "san-martin": "San Martín",
        tacna: "Tacna",
        tumbes: "Tumbes",
        ucayali: "Ucayali",
    };
    return locationMap[ubicacion] || ubicacion;
}

function showNoResults() {
    if (!jobListings) return;

    jobListings.innerHTML = `
        <div class="empty-state">
            <i class="bi bi-search display-1 text-muted"></i>
            <h5 class="mt-3">No se encontraron oportunidades</h5>
            <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
            <button class="btn btn-primary mt-2" onclick="clearAllFilters()">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Limpiar Filtros
            </button>
        </div>
    `;
}

function renderPagination(totalPages) {
    // Find the jobs-content container
    const jobsContent = document.querySelector(".jobs-content");
    if (!jobsContent) return;

    // Remove existing pagination
    const existingPagination = jobsContent.querySelector(
        ".pagination-container"
    );
    if (existingPagination) {
        existingPagination.remove();
    }

    // Create new pagination
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "p-3 border-top pagination-container";

    let paginationHTML =
        '<nav aria-label="Opportunity listings pagination"><ul class="pagination justify-content-center mb-0">';

    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <button class="page-link" onclick="changePage(${
                currentPage - 1
            })" ${currentPage === 1 ? "disabled" : ""}>
                Anterior
            </button>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? "active" : ""}">
                    <button class="page-link" onclick="changePage(${i})">${i}</button>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <button class="page-link" onclick="changePage(${
                currentPage + 1
            })" ${currentPage === totalPages ? "disabled" : ""}>
                Siguiente
            </button>
        </li>
    `;

    paginationHTML += "</ul></nav>";
    paginationContainer.innerHTML = paginationHTML;
    jobsContent.appendChild(paginationContainer);
}

function changePage(page) {
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderJobs();
        updateResultsInfo();

        // Scroll to top of results
        const jobsContent = document.querySelector(".jobs-content");
        if (jobsContent) {
            jobsContent.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }
}

function updateFilterCounts() {
    // Update filter counts based on taxonomies
    if (taxonomies.modalidades) {
        taxonomies.modalidades.forEach((modality) => {
            const checkbox = document.getElementById(modality.id);
            if (checkbox) {
                const countElement = checkbox
                    .closest(".filter-option")
                    ?.querySelector(".filter-count");
                if (countElement) {
                    countElement.textContent = `(${modality.count})`;
                }
            }
        });
    }

    if (taxonomies.niveles_experiencia) {
        taxonomies.niveles_experiencia.forEach((level) => {
            const checkbox = document.getElementById(level.id);
            if (checkbox) {
                const countElement = checkbox
                    .closest(".filter-option")
                    ?.querySelector(".filter-count");
                if (countElement) {
                    countElement.textContent = `(${level.count})`;
                }
            }
        });
    }

    // 🆕 Update location dropdown options with counts
    if (taxonomies.ubicaciones && ubicacionSelect) {
        taxonomies.ubicaciones.forEach((location) => {
            const option = ubicacionSelect.querySelector(
                `option[value="${location.id}"]`
            );
            if (option && location.count > 0) {
                option.textContent = `${location.label} (${location.count})`;
            }
        });
    }
}

function updateStats() {
    // Update sidebar statistics
    const totalOpportunities = document.getElementById("totalOpportunities");
    const totalCompanies = document.getElementById("totalCompanies");
    const totalCareers = document.getElementById("totalCareers");

    if (totalOpportunities) {
        totalOpportunities.textContent = allJobs.length;
    }

    if (totalCompanies) {
        const uniqueCompanies = new Set(allJobs.map((job) => job.empresa));
        totalCompanies.textContent = uniqueCompanies.size;
    }

    if (totalCareers) {
        const uniqueCareers = new Set(allJobs.map((job) => job.industria));
        totalCareers.textContent = uniqueCareers.size;
    }
}

function clearAllFilters() {
    // Clear checkboxes
    filterCheckboxes.forEach((checkbox) => {
        // Uncheck all checkboxes except "todos-salarios" which should be checked
        if (checkbox.id === "todos-salarios") {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }

        const parent = checkbox.closest(".filter-option");
        if (parent) {
            if (checkbox.id === "todos-salarios" && checkbox.checked) {
                parent.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
                parent.style.borderRadius = "6px";
                parent.style.padding = "0.5rem";
            } else {
                parent.style.backgroundColor = "transparent";
                parent.style.padding = "0.5rem 0";
            }
        }
    });

    // Clear salary inputs
    if (salaryMinInput) {
        salaryMinInput.value = "";
        salaryMinInput.style.borderColor = "";
    }
    if (salaryMaxInput) {
        salaryMaxInput.value = "";
        salaryMaxInput.style.borderColor = "";
    }

    // Reset search
    if (heroSearchInput) {
        heroSearchInput.value = "";
    }

    // Reset career select
    if (carreraSelect) {
        carreraSelect.value = "";
        carreraSelect.style.borderColor = "";
        carreraSelect.style.backgroundColor = "";
    }

    // 🆕 Reset location select
    if (ubicacionSelect) {
        ubicacionSelect.value = "";
        ubicacionSelect.style.borderColor = "";
        ubicacionSelect.style.backgroundColor = "";
    }

    // Reset sort
    if (sortSelect) {
        sortSelect.value = "recent";
    }

    // Reset to all jobs
    filteredJobs = [...allJobs];
    currentPage = 1;
    renderJobs();
    updateResultsInfo();

    showNotification("Todos los filtros han sido limpiados", "info");
    console.log("All filters cleared");
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

function showError(message) {
    if (!jobListings) return;

    jobListings.innerHTML = `
        <div class="empty-state">
            <i class="bi bi-exclamation-triangle display-1 text-danger"></i>
            <h5 class="mt-3 text-danger">Error</h5>
            <p>${message}</p>
            <button class="btn btn-primary mt-2" onclick="loadJobsData()">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Reintentar
            </button>
        </div>
    `;
}

function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `alert alert-${
        type === "error" ? "danger" : type
    } alert-dismissible position-fixed`;
    notification.style.cssText =
        "top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;";
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

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

// Initialize resize handler
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

// Global functions for pagination (called from HTML)
window.changePage = changePage;
window.clearAllFilters = clearAllFilters;
window.loadJobsData = loadJobsData;

// Debug function for development
window.debugFilters = function () {
    console.log("All jobs:", allJobs.length);
    console.log("Filtered jobs:", filteredJobs.length);
    console.log("Current page:", currentPage);
    console.log("Taxonomies:", taxonomies);
    console.log("Selected location:", ubicacionSelect?.value); // 🆕
};
