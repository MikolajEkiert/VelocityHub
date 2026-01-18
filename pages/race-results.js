function getRaceDataFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        meetingKey: params.get('meeting'),
        raceName: params.get('name'),
        raceDetails: params.get('details'),
        season: params.get('season') || '2025',
    };
}

let allDrivers = [];
let activeMeetingSessions = [];
let currentTab = 'race';

async function initRaceResultsPage() {
    const raceData = getRaceDataFromURL();

    if (!raceData.meetingKey) {
        document.getElementById('results-main-container').innerHTML =
            '<p class="no-data">Brak danych wyścigu. Wróć do głównej strony.</p>';
        document.getElementById('results-loading').style.display = 'none';
        return;
    }

    document.getElementById('results-race-title').textContent =
        raceData.raceName || 'Grand Prix';
    document.getElementById('results-race-details').textContent =
        raceData.raceDetails || '';

    try {
        const driversRaw = await fetchDrivers();
        allDrivers = driversRaw.map((d) => ({
            number: d.driver_number,
            fullName:
                d.full_name ||
                `${d.first_name || ''} ${d.last_name || ''}`.trim(),
            name: d.first_name || '',
            surname: d.last_name || '',
            team: d.team_name || 'Unknown',
        }));

        activeMeetingSessions = await fetchRaceSessions(raceData.meetingKey);

        if (!activeMeetingSessions || activeMeetingSessions.length === 0) {
            document.getElementById('results-loading').style.display = 'none';
            document.getElementById('results-main-container').innerHTML =
                '<p class="no-data">Brak danych o sesjach dla tego wyścigu.</p>';
            return;
        }

        updateAvailableTabs();

        const hasRace = activeMeetingSessions.some(
            (s) => s.session_name === 'Race',
        );
        if (hasRace) {
            switchRaceResultsTab('race');
        } else {
            const hasQualifying = activeMeetingSessions.some(
                (s) => s.session_name === 'Qualifying',
            );
            if (hasQualifying) {
                switchRaceResultsTab('qualifying');
            } else {
                switchRaceResultsTab('sprint');
            }
        }
    } catch (error) {
        console.error('Error loading race data:', error);
        document.getElementById('results-loading').style.display = 'none';
        document.getElementById('results-main-container').innerHTML =
            '<p class="no-data">Błąd ładowania wyników. Spróbuj odświeżyć stronę.</p>';
    }
}

function updateAvailableTabs() {
    const hasRace = activeMeetingSessions.some(
        (s) => s.session_name === 'Race',
    );
    const hasQualifying = activeMeetingSessions.some(
        (s) => s.session_name === 'Qualifying',
    );
    const hasSprint = activeMeetingSessions.some(
        (s) => s.session_name === 'Sprint',
    );

    document.querySelectorAll('.results-tab-btn').forEach((btn) => {
        const tab = btn.getAttribute('data-tab');
        switch (tab) {
            case 'race':
                btn.style.display = hasRace ? 'block' : 'none';
                break;
            case 'qualifying':
                btn.style.display = hasQualifying ? 'block' : 'none';
                break;
            case 'sprint':
                btn.style.display = hasSprint ? 'block' : 'none';
                break;
        }
    });
}

async function switchRaceResultsTab(tabType) {
    currentTab = tabType;

    document.querySelectorAll('.results-tab-btn').forEach((btn) => {
        btn.classList.toggle(
            'active',
            btn.getAttribute('data-tab') === tabType,
        );
    });

    const loading = document.getElementById('results-loading');
    const container = document.getElementById('results-main-container');

    container.innerHTML = '';
    loading.style.display = 'block';

    const sessionNameMap = {
        race: 'Race',
        qualifying: 'Qualifying',
        sprint: 'Sprint',
    };

    const sessionName = sessionNameMap[tabType];
    const session = activeMeetingSessions.find(
        (s) => s.session_name === sessionName,
    );

    if (!session) {
        loading.style.display = 'none';
        container.innerHTML = `<p class="no-data">Brak danych dla sesji: ${sessionName}</p>`;
        return;
    }

    try {
        const results = await fetchSessionResults(session.session_key);
        loading.style.display = 'none';
        renderRaceResults(results, allDrivers, tabType, container);
    } catch (error) {
        console.error('Error loading tab results:', error);
        loading.style.display = 'none';
        container.innerHTML =
            '<p class="no-data">Błąd ładowania danych sesji.</p>';
    }
}

function renderRaceResults(results, drivers, sessionType, container) {
    if (!results || results.length === 0) {
        container.innerHTML =
            '<p class="no-data">Brak dostępnych wyników dla tej sesji.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'results-table';

    const isRace = sessionType === 'race';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="pos-col">POZ</th>
            <th class="driver-col">KIEROWCA</th>
            <th class="team-col">ZESPÓŁ</th>
            <th class="time-col">${isRace ? 'OKRĄŻENIA' : 'CZAS'}</th>
            ${isRace ? '<th class="gap-col">RÓŻNICA</th>' : ''}
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const leader = results[0];

    results.forEach((res) => {
        const driverInfo = drivers.find((d) => d.number === res.driver_number);
        if (!driverInfo) return;
        const fullName =
            driverInfo?.fullName || `Kierowca ${res.driver_number}`;
        const teamName = driverInfo?.team || 'Unknown';
        const driverNumber = res.driver_number || driverInfo?.number || '';
        const teamColor = getTeamColor(teamName);

        const row = document.createElement('tr');
        row.className = 'results-row';

        let timeDisplay = '-';
        let gapDisplay = '';

        if (isRace) {
            timeDisplay = res.total_laps || '-';
            if (res.position > 1 && leader) {
                const lapDiff =
                    (leader.total_laps || 0) - (res.total_laps || 0);
                if (lapDiff > 0) {
                    gapDisplay = `+${lapDiff} okr.`;
                } else {
                    gapDisplay = '-';
                }
            }
        } else {
            timeDisplay = res.best_lap ? formatTime(res.best_lap * 1000) : '-';
        }

        row.innerHTML = `
            <td class="pos-col">
                <div class="position-badge-small" style="background: ${teamColor}">
                    ${res.position}
                </div>
            </td>
            <td class="driver-col">
                <div class="driver-info-compact">
                    <span class="driver-num">#${driverNumber}</span>
                    <span class="driver-full-name">${fullName}</span>
                </div>
            </td>
            <td class="team-col">${teamName}</td>
            <td class="time-col">${timeDisplay}</td>
            ${isRace ? `<td class="gap-col">${gapDisplay}</td>` : ''}
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.replaceChildren(table);
}

document.addEventListener('DOMContentLoaded', () => {
    initRaceResultsPage();

    document.querySelectorAll('.results-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const tabType = btn.getAttribute('data-tab');
            switchRaceResultsTab(tabType);
        });
    });
});
