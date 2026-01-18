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
            const card = document.createElement('div');
            card.className = 'driver-card';
            card.setAttribute('data-driver-number', driver.number);

            const teamColor = driver.teamColor || getTeamColor(driver.team);
            const firstName = (driver.name || '').toUpperCase();
            const lastName = (driver.surname || '').toUpperCase();

            if (driver.position) {
                const rankDiv = document.createElement('div');
                rankDiv.className = 'driver-card-rank';
                rankDiv.textContent = `#${driver.position}`;
                card.appendChild(rankDiv);
            }

            const numberDiv = document.createElement('div');
            numberDiv.className = 'driver-card-number';
            numberDiv.textContent = driver.number || driver.position || '';
            card.appendChild(numberDiv);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'driver-card-content';

            const teamDiv = document.createElement('div');
            teamDiv.className = 'driver-card-team';

            const accentBar = document.createElement('div');
            accentBar.className = 'team-accent-bar';
            accentBar.style.background = teamColor;
            teamDiv.appendChild(accentBar);

            const teamName = document.createElement('span');
            teamName.className = 'driver-card-team-name';
            teamName.textContent = (driver.team || 'UNKNOWN').toUpperCase();
            teamDiv.appendChild(teamName);

            contentDiv.appendChild(teamDiv);

            const nameDiv = document.createElement('div');
            nameDiv.className = 'driver-card-name';

            const firstNameSpan = document.createElement('span');
            firstNameSpan.className = 'driver-card-name-first';
            firstNameSpan.textContent = firstName;

            const lastNameSpan = document.createElement('span');
            lastNameSpan.className = 'driver-card-name-last';
            lastNameSpan.textContent = lastName;

            nameDiv.appendChild(firstNameSpan);
            nameDiv.appendChild(lastNameSpan);
            contentDiv.appendChild(nameDiv);

            if (driver.points !== undefined) {
                const pointsDiv = document.createElement('div');
                pointsDiv.className = 'driver-card-points';

                const pointsValue = document.createElement('span');
                pointsValue.className = 'driver-card-points-value';
                pointsValue.textContent = Math.round(driver.points);

                pointsDiv.appendChild(pointsValue);
                pointsDiv.appendChild(document.createTextNode(' PKT'));
                contentDiv.appendChild(pointsDiv);
            }

            card.appendChild(contentDiv);
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
            const card = document.createElement('div');
            card.className = 'team-card';

            const teamColor = team.teamColor || getTeamColor(team.team);

            const positionDiv = document.createElement('div');
            positionDiv.className = 'team-card-position';
            positionDiv.textContent = `#${team.position}`;
            card.appendChild(positionDiv);

            const headerDiv = document.createElement('div');
            headerDiv.className = 'team-card-header';
            headerDiv.style.borderBottomColor = teamColor;

            const nameH3 = document.createElement('h3');
            nameH3.className = 'team-card-name';
            nameH3.textContent = team.team;
            headerDiv.appendChild(nameH3);

            const pointsDiv = document.createElement('div');
            pointsDiv.className = 'team-card-points';

            const pointsValue = document.createElement('span');
            pointsValue.className = 'points-value';
            pointsValue.textContent = team.points;

            const pointsLabel = document.createElement('span');
            pointsLabel.className = 'points-label';
            pointsLabel.textContent = 'PKT';

            pointsDiv.appendChild(pointsValue);
            pointsDiv.appendChild(pointsLabel);
            headerDiv.appendChild(pointsDiv);

            card.appendChild(headerDiv);

            const driversDiv = document.createElement('div');
            driversDiv.className = 'team-card-drivers';

            team.drivers.forEach((driverName) => {
                const badge = document.createElement('span');
                badge.className = 'driver-badge';
                badge.textContent = driverName;
                driversDiv.appendChild(badge);
            });

            card.appendChild(driversDiv);

            return card;
        }),
    );
}

function renderRaceCalendar(races) {
    const container = document.getElementById('race-calendar-container');
    if (!container) return;

    container.replaceChildren(
        ...races.map((race) => {
            const entry = document.createElement('div');
            entry.className = `race-entry ${
                race.status === 'next' ? 'next-race' : ''
            }`;
            entry.setAttribute('data-meeting-key', race.meetingKey);
            entry.setAttribute('data-race-name', race.name);
            entry.setAttribute(
                'data-race-details',
                `${race.date} | ${race.location}`,
            );

            const dateObj = new Date(race.date);
            const day = dateObj.getDate();
            const month = MONTH_NAMES[dateObj.getMonth()];
            const formattedDate = `${day} ${month}`;

            const statusDiv = document.createElement('div');
            statusDiv.className = 'race-status';

            const now = Date.now();
            const raceTime = race.raceDate
                ? race.raceDate.getTime()
                : new Date(
                      `${race.date}T${race.time || '12:00:00Z'}`,
                  ).getTime();
            const isActuallyCompleted = raceTime < now;

            if (isActuallyCompleted) {
                const badge = document.createElement('div');
                badge.className = 'status-badge status-completed';
                badge.textContent = 'ZAKOŃCZONY';
                statusDiv.appendChild(badge);
            } else if (race.status === 'next') {
                const badge = document.createElement('div');
                badge.className = 'status-badge status-next';
                badge.textContent = 'NASTĘPNY';
                statusDiv.appendChild(badge);

                if (race.time && race.raceDate) {
                    const timeDiv = document.createElement('div');
                    timeDiv.className = 'status-upcoming';
                    const cetTime = race.raceDate.toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Europe/Warsaw',
                    });
                    timeDiv.textContent = `${cetTime} CET`;
                    statusDiv.appendChild(timeDiv);
                }
            } else if (race.time && race.raceDate) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'status-upcoming';
                const cetTime = race.raceDate.toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Warsaw',
                });
                timeDiv.textContent = `${cetTime} CET`;
                statusDiv.appendChild(timeDiv);
            }

            const countryCode = getCountryCode(race.name);
            const raceNameDisplay = race.name.toUpperCase();

            const roundDiv = document.createElement('div');
            roundDiv.className = 'race-round';
            roundDiv.textContent = `RUNDA ${String(race.round).padStart(
                2,
                '0',
            )}`;

            const dateDiv = document.createElement('div');
            dateDiv.className = 'race-date';
            dateDiv.textContent = formattedDate;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'race-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'race-name';
            nameDiv.textContent = `${
                countryCode ? countryCode + ' ' : ''
            }${raceNameDisplay}`;

            const locationDiv = document.createElement('div');
            locationDiv.className = 'race-location';
            locationDiv.textContent = `📍 ${
                race.location || race.circuit || ''
            }`;

            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(locationDiv);

            entry.appendChild(roundDiv);
            entry.appendChild(dateDiv);
            entry.appendChild(infoDiv);
            entry.appendChild(statusDiv);

            return entry;
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

    const table = document.createElement('table');
    table.className = 'results-table';

    const isRace = sessionType === 'race';
    const isQualifying = sessionType === 'qualifying';

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

        const fullName =
            driverInfo?.fullName ||
            driverInfo?.name ||
            `Kierowca ${res.driver_number}`;
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
