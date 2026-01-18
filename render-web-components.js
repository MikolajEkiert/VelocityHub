function renderDriverCards(
    drivers,
    containerId = 'driver-cards-container',
    limit = null,
) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const driversToRender = limit ? drivers.slice(0, limit) : drivers;

    container.replaceChildren(
        ...driversToRender.map((driver) => {
            const card = document.createElement('driver-card');
            card.setAttribute('data-number', driver.number || '');
            card.setAttribute('data-first-name', driver.name || '');
            card.setAttribute('data-last-name', driver.surname || '');
            card.setAttribute('data-team', driver.team || 'UNKNOWN');
            card.setAttribute(
                'data-team-color',
                driver.teamColor || getTeamColor(driver.team),
            );

            if (driver.position) {
                card.setAttribute('data-rank', driver.position);
            }
            if (driver.country) {
                card.setAttribute('data-country', driver.country);
            }

            // Dodaj event listener do nawigacji
            card.addEventListener('click', () => {
                const currentSeason =
                    document.getElementById('season-selector')?.value || '2025';
                const params = new URLSearchParams({
                    number: driver.number,
                    season: currentSeason,
                });
                window.location.href = `driver-profile.html?${params.toString()}`;
            });

            return card;
        }),
    );
}

function renderStatCards(stats, containerId = 'stats-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const statItems = [
        {
            label: 'UKOŃCZONE WYŚCIGI',
            value: stats.racesCompleted || 0,
            id: 'stat-races-completed',
        },
        { label: 'ZWYCIĘSTWA', value: stats.wins || 0, id: 'stat-wins' },
        { label: 'PODIUMY', value: stats.podiums || 0, id: 'stat-podiums' },
        { label: 'POLE POSITION', value: stats.poles || 0, id: 'stat-poles' },
    ];

    container.replaceChildren(
        ...statItems.map((stat) => {
            const card = document.createElement('stat-card');
            card.id = stat.id;
            card.setAttribute('data-label', stat.label);
            card.setAttribute('data-value', stat.value);
            return card;
        }),
    );
}

function renderRankingTable(drivers) {
    const container = document.getElementById('ranking-table-container');
    if (!container) return;

    if (!drivers || drivers.length === 0) {
        container.innerHTML = '<p class="no-data">Brak danych rankingowych</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'ranking-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="pos-col">POZ</th>
            <th class="driver-col">KIEROWCA</th>
            <th class="team-col">ZESPÓŁ</th>
            <th class="points-col">PUNKTY</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    drivers.forEach((driver, index) => {
        const row = document.createElement('tr');
        row.className = 'ranking-row';
        row.style.cursor = 'pointer';

        const teamColor = driver.teamColor || getTeamColor(driver.team);

        const driverCol = document.createElement('td');
        driverCol.className = 'driver-col';
        const driverInfo = document.createElement('div');
        driverInfo.className = 'driver-info';
        driverInfo.style.cursor = 'pointer';

        const driverNum = document.createElement('span');
        driverNum.className = 'driver-number';
        driverNum.textContent = `#${driver.number}`;

        const driverName = document.createElement('span');
        driverName.className = 'driver-name';
        driverName.textContent = driver.fullName;
        driverName.style.cursor = 'pointer';

        driverInfo.appendChild(driverNum);
        driverInfo.appendChild(driverName);
        driverCol.appendChild(driverInfo);

        driverCol.addEventListener('click', () => {
            const currentSeason =
                document.getElementById('season-selector')?.value || '2025';
            const params = new URLSearchParams({
                number: driver.number,
                season: currentSeason,
            });
            window.location.href = `driver-profile.html?${params.toString()}`;
        });

        row.innerHTML = `
            <td class="pos-col">
                <div class="position-badge" style="background: ${teamColor}">
                    ${driver.position || index + 1}
                </div>
            </td>
        `;
        row.appendChild(driverCol);
        row.innerHTML += `
            <td class="team-col">
                <div class="team-badge" style="border-left-color: ${teamColor}">
                    ${driver.team}
                </div>
            </td>
            <td class="points-col">
                <span class="points-value">${driver.points}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.replaceChildren(table);
}

function renderTeamsGrid(teams) {
    const container = document.getElementById('teams-container');
    if (!container) return;

    if (!teams || teams.length === 0) {
        container.innerHTML = '<p class="no-data">Brak danych o zespołach</p>';
        return;
    }

    container.replaceChildren(
        ...teams.map((team) => {
            const card = document.createElement('team-card');
            card.setAttribute('data-rank', team.position || 0);
            card.setAttribute('data-team-name', team.team || '');
            card.setAttribute(
                'data-team-color',
                team.teamColor || getTeamColor(team.team),
            );
            card.setAttribute('data-points', team.points || 0);
            return card;
        }),
    );
}

function renderRaceCalendar(races) {
    const container = document.getElementById('race-calendar-container');
    if (!container) return;

    const MONTH_NAMES = [
        'STYCZEŃ',
        'LUTY',
        'MARZEC',
        'KWIECIEŃ',
        'MAJ',
        'CZERWIEC',
        'LIPIEC',
        'SIERPIEŃ',
        'WRZESIEŃ',
        'PAŹDZIERNIK',
        'LISTOPAD',
        'GRUDZIEŃ',
    ];

    container.replaceChildren(
        ...races.map((race) => {
            const dateObj = new Date(race.date);
            const day = dateObj.getDate();
            const month = MONTH_NAMES[dateObj.getMonth()];
            const formattedDate = `${day}-${day + 2} ${month}`;

            const calendarItem = document.createElement('race-calendar-item');
            calendarItem.setAttribute('data-date', formattedDate);
            calendarItem.setAttribute(
                'data-race-name',
                race.name.toUpperCase(),
            );
            calendarItem.setAttribute(
                'data-location',
                race.location || race.circuit || '',
            );
            calendarItem.setAttribute('data-round', race.round || 0);
            calendarItem.setAttribute('data-meeting-key', race.meetingKey);

            // Dodaj event listener do wyświetlania wyników
            calendarItem.addEventListener('click', () => {
                openRaceModal(
                    race.meetingKey,
                    race.name,
                    `${race.date} | ${race.location}`,
                );
            });

            return calendarItem;
        }),
    );
}

function renderSessionResults(results, drivers, sessionType) {
    const container = document.getElementById('results-table-container');
    if (!container) return;

    if (!results || results.length === 0) {
        container.innerHTML =
            '<p class="no-data">Brak dostępnych wyników dla tej sesji.</p>';
        return;
    }

    const resultsWrapper = document.createElement('div');
    resultsWrapper.className = 'results-wrapper';

    const leader = results[0];

    results.forEach((res) => {
        const driverInfo = drivers.find((d) => d.number === res.driver_number);

        const fullName =
            driverInfo?.fullName ||
            driverInfo?.name ||
            `Kierowca ${res.driver_number}`;
        const teamName = driverInfo?.team || 'Unknown';
        const driverNumber = res.driver_number || driverInfo?.number || '';

        let pointsDisplay = '-';

        if (sessionType === 'race') {
            // W wyścigu wyświetlamy pozycję i okrążenia
            pointsDisplay = res.total_laps || '-';
        } else if (sessionType === 'qualifying') {
            // W kwalifikacjach wyświetlamy czas
            pointsDisplay = res.best_lap
                ? formatTime(res.best_lap * 1000)
                : '-';
        } else if (sessionType === 'sprint') {
            pointsDisplay = res.total_laps || '-';
        }

        const row = document.createElement('results-table-row');
        row.setAttribute('data-position', res.position || '');
        row.setAttribute('data-number', driverNumber);
        row.setAttribute('data-driver-name', fullName);
        row.setAttribute('data-team', teamName);
        row.setAttribute('data-points', pointsDisplay);

        resultsWrapper.appendChild(row);
    });

    container.replaceChildren(resultsWrapper);
}

function getTeamColor(teamName) {
    const teamColors = {
        FERRARI: '#FF0000',
        MERCEDES: '#00D2BE',
        'RED BULL': '#0600EF',
        MCLAREN: '#FF8700',
        ALPINE: '#0082FA',
        'ALFA ROMEO': '#900000',
        HAAS: '#FFFFFF',
        'ASTUR MARTIN': '#006B3B',
        WILLIAMS: '#005AFF',
        'KICK SAUBER': '#52002B',
        'TORO ROSSO': '#0033CC',
        'ASTON MARTIN': '#006B3B',
    };
    return teamColors[teamName?.toUpperCase()] || '#CCCCCC';
}

function formatTime(milliseconds) {
    if (!milliseconds || milliseconds <= 0) return '-';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = Math.floor(milliseconds % 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function initCountdownTimer(raceDate, raceTime) {
    const timerElement = document.getElementById('countdown-timer');
    if (!timerElement) return;

    const timeStr = raceTime ? raceTime.replace('Z', '') : '12:00:00';
    const targetDate = new Date(`${raceDate}T${timeStr}Z`);

    function updateTimer() {
        const now = Date.now();
        const diff = targetDate.getTime() - now;

        if (diff <= 0) {
            timerElement.textContent = 'WYŚCIG W TOKU';
            return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        timerElement.textContent = `${days} DNI : ${String(hours).padStart(
            2,
            '0',
        )} GODZ : ${String(minutes).padStart(2, '0')} MIN`;
    }

    updateTimer();
    setInterval(updateTimer, 60000);
}
