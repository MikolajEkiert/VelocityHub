let allDrivers = [];
let allRaces = [];
let currentSeason = 2025;

async function loadData(season = currentSeason) {
    const driverContainer = document.getElementById('driver-cards-container');
    const raceContainer = document.getElementById('race-calendar-container');
    
    if (driverContainer) {
        driverContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Ładowanie danych...</p>';
    }
    if (raceContainer) {
        raceContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Ładowanie danych...</p>';
    }
    
    try {
        const [meetings, sessions, drivers, standings] = await Promise.all([
            fetchMeetings(season),
            fetchSessions(season),
            fetchDrivers(),
            fetchDriverStandings(season)
        ]);

        allRaces = transformMeetingsToRaces(meetings, sessions);
        allDrivers = transformDriversData(drivers, standings);

        updateSeasonText(season);
        renderContent();
    } catch (error) {
        console.error('Error loading data:', error);
        if (driverContainer) {
            driverContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Błąd ładowania danych. Spróbuj odświeżyć stronę.</p>';
        }
        if (raceContainer) {
            raceContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Błąd ładowania danych. Spróbuj odświeżyć stronę.</p>';
        }
    }
}

function updateSeasonText(season) {
    const heroDescription = document.getElementById('hero-description');
    const topDriversSubtitle = document.getElementById('top-drivers-subtitle');
    const allDriversSubtitle = document.getElementById('all-drivers-subtitle');
    const seasonYear = document.getElementById('season-year');
    
    if (heroDescription) {
        heroDescription.textContent = `Śledź każdy zakręt, każdą wygraną i każdy moment w sezonie ${season}. Najszybsze źródło informacji o królowej motorsportu.`;
    }
    if (topDriversSubtitle) {
        topDriversSubtitle.textContent = `Aktualni liderzy klasyfikacji generalnej sezonu ${season}. Walka o mistrzostwo nabiera tempa.`;
    }
    if (allDriversSubtitle) {
        allDriversSubtitle.textContent = `Pełna lista kierowców Formuły 1 w sezonie ${season}.`;
    }
    if (seasonYear) {
        seasonYear.textContent = season;
    }
}

function switchSeason() {
    currentSeason = currentSeason === 2025 ? 2024 : 2025;
    
    const driverContainer = document.getElementById('all-drivers-container');
    if (driverContainer) {
        driverContainer.innerHTML = '';
    }
    
    loadData(currentSeason).then(() => {
        initLazyLoad();
    });
}

function renderContent() {
    const topDrivers = allDrivers.filter(d => d.position > 0).slice(0, 5);
    renderDriverCards(topDrivers, 'driver-cards-container', 5);
    renderRaceCalendar(allRaces);
    
    const now = Date.now();
    const nextRace = allRaces.find(r => {
        if (r.isCompleted) return false;
        return r.raceDate && r.raceDate.getTime() > now;
    });
    
    if (nextRace) {
        const dateStr = nextRace.date;
        const timeStr = nextRace.time || '12:00:00Z';
        initCountdownTimer(dateStr, timeStr);
    } else {
        const timerElement = document.getElementById('countdown-timer');
        if (timerElement) {
            timerElement.textContent = 'BRAK NADCHODZĄCYCH WYŚCIGÓW';
        }
    }
}

function renderAllDrivers() {
    renderDriverCards(allDrivers, 'all-drivers-container', null);
}

function initNavigation() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href^="#"]');
        if (!target) return;
        
        e.preventDefault();
        const sectionId = target.getAttribute('data-section') || target.getAttribute('href')?.substring(1);
        const section = document.getElementById(sectionId);
        
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    
    const seasonToggle = document.getElementById('season-toggle');
    if (seasonToggle) {
        seasonToggle.addEventListener('click', switchSeason);
    }
}

function init() {
    initNavigation();
    loadData();
}

function initLazyLoad() {
    const kierowcySection = document.getElementById('kierowcy');
    if (!kierowcySection) return;
    
    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && allDrivers.length > 0) {
            renderAllDrivers();
            observer.disconnect();
        }
    }, { threshold: 0.1 });
    
    observer.observe(kierowcySection);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        initLazyLoad();
    });
} else {
    init();
    initLazyLoad();
}
