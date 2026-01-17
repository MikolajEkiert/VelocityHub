let allDrivers = [];
let allRaces = [];
let allTeams = [];
let currentSeason = 2025;

async function loadData(season = currentSeason) {
    const loadingMsg =
        '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Ładowanie danych...</p>';

    const containers = [
        'ranking-table-container',
        'race-calendar-container',
        'teams-container',
    ];

    containers.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = loadingMsg;
    });

    try {
        const [meetings, sessions, driversRaw, driversStandings, teams] =
            await Promise.all([
                fetchMeetings(season),
                fetchSessions(season),
                fetchDrivers(),
                fetchDriverStandings(season),
                fetchTeamStandings(season),
            ]);

        allRaces = transformMeetingsToRaces(meetings, sessions);
        allDrivers = transformDriversData(driversStandings, driversRaw);
        allTeams = teams;

        updateSeasonText(season);
        renderContent();
    } catch (error) {
        console.error('Error loading data:', error);
        const errorMsg =
            '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Błąd ładowania danych. Spróbuj odświeżyć stronę.</p>';
        containers.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = errorMsg;
        });
    }
}

function updateSeasonText(season) {
    const updates = {
        'hero-description': `Śledź każdy zakręt, każdą wygraną i każdy moment w sezonie ${season}. Najszybsze źródło informacji o królowej motorsportu.`,
        'ranking-subtitle': `Kompletna tabela punktowa kierowców sezonu ${season}`,
        'all-drivers-subtitle': `Pełna lista kierowców Formuły 1 w sezonie ${season}.`,
        'teams-subtitle': `Ranking zespołów konstruktorskich sezonu ${season}`,
        'season-year': season,
    };

    Object.entries(updates).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
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
    renderRankingTable(allDrivers);
    renderRaceCalendar(allRaces);
    renderTeamsGrid(allTeams);

    const now = Date.now();
    const nextRace = allRaces.find((r) => {
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
    document.addEventListener('click', async (e) => {
        const target = e.target.closest('a[href^="#"]');
        if (target) {
            e.preventDefault();
            const sectionId =
                target.getAttribute('data-section') ||
                target.getAttribute('href')?.substring(1);
            const section = document.getElementById(sectionId);

            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        const raceEntry = e.target.closest('.race-entry');
        if (raceEntry) {
            const meetingKey = raceEntry.getAttribute('data-meeting-key');
            const raceName = raceEntry.getAttribute('data-race-name');
            const raceDetails = raceEntry.getAttribute('data-race-details');
            // Navigate to race results page instead of showing modal
            const params = new URLSearchParams({
                meeting: meetingKey,
                name: raceName,
                details: raceDetails,
                season: currentSeason,
            });
            window.location.href = `race-results.html?${params.toString()}`;
            return;
        }

        const driverCard = e.target.closest('.driver-card');
        if (driverCard) {
            const driverNumber = driverCard.getAttribute('data-driver-number');
            if (driverNumber) {
                const params = new URLSearchParams({
                    number: driverNumber,
                    season: currentSeason,
                });
                window.location.href = `driver-profile.html?${params.toString()}`;
            }
            return;
        }

        if (
            e.target.classList.contains('close-modal') ||
            e.target.id === 'results-modal'
        ) {
            closeModal();
            return;
        }

        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn) {
            const tabType = tabBtn.getAttribute('data-tab');
            switchTab(tabType);
            return;
        }
    });

    const seasonToggle = document.getElementById('season-toggle');
    if (seasonToggle) {
        seasonToggle.addEventListener('click', switchSeason);
    }
}

let activeMeetingSessions = [];
let currentTab = 'race';

async function showResultsModal(meetingKey, name, details) {
    const modal = document.getElementById('results-modal');
    const modalName = document.getElementById('modal-race-name');
    const modalDetails = document.getElementById('modal-race-details');
    const loading = document.getElementById('loading-results');
    const container = document.getElementById('results-table-container');

    modalName.textContent = name;
    modalDetails.textContent = details;
    container.innerHTML = '';
    loading.style.display = 'block';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    try {
        activeMeetingSessions = await fetchRaceSessions(meetingKey);

        const hasRace = activeMeetingSessions.some(
            (s) => s.session_name === 'Race'
        );
        const hasQualifying = activeMeetingSessions.some(
            (s) => s.session_name === 'Qualifying'
        );
        const hasSprint = activeMeetingSessions.some(
            (s) => s.session_name === 'Sprint'
        );

        document.querySelectorAll('.tab-btn').forEach((btn) => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'race') btn.style.display = hasRace ? 'block' : 'none';
            if (tab === 'qualifying')
                btn.style.display = hasQualifying ? 'block' : 'none';
            if (tab === 'sprint')
                btn.style.display = hasSprint ? 'block' : 'none';
        });

        if (hasRace) {
            switchTab('race');
        } else if (hasQualifying) {
            switchTab('qualifying');
        } else if (hasSprint) {
            switchTab('sprint');
        } else {
            loading.style.display = 'none';
            container.innerHTML =
                '<p class="no-data">Brak dostępnych sesji dla tego wyścigu</p>';
        }
    } catch (error) {
        console.error('Error showing modal:', error);
        loading.textContent = 'Błąd podczas ładowania wyników.';
    }
}

function closeModal() {
    document.getElementById('results-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function switchTab(tabType) {
    currentTab = tabType;
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.classList.toggle(
            'active',
            btn.getAttribute('data-tab') === tabType
        );
    });

    const loading = document.getElementById('loading-results');
    const container = document.getElementById('results-table-container');

    container.innerHTML = '';
    loading.style.display = 'block';

    const sessionNameMap = {
        race: 'Race',
        qualifying: 'Qualifying',
        sprint: 'Sprint',
    };

    const sessionName = sessionNameMap[tabType];
    const session = activeMeetingSessions.find(
        (s) => s.session_name === sessionName
    );

    if (!session) {
        loading.style.display = 'none';
        container.innerHTML = `<p class="no-data">Brak danych dla sesji: ${sessionName}</p>`;
        return;
    }

    try {
        const results = await fetchSessionResults(session.session_key);
        loading.style.display = 'none';
        renderSessionResults(results, allDrivers, tabType);
    } catch (error) {
        console.error('Error loading tab results:', error);
        loading.style.display = 'none';
        loading.textContent = 'Błąd ładowania danych sesji.';
    }
}

function init() {
    initNavigation();
    loadData();
}

function initLazyLoad() {
    const kierowcySection = document.getElementById('kierowcy');
    if (!kierowcySection) return;

    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && allDrivers.length > 0) {
                renderAllDrivers();
                observer.disconnect();
            }
        },
        { threshold: 0.1 }
    );

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
