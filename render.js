function renderDriverCards(drivers, containerId = 'driver-cards-container', limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const driversToRender = limit ? drivers.slice(0, limit) : drivers;

    container.replaceChildren(...driversToRender.map(driver => {
        const card = document.createElement('div');
        card.className = 'driver-card';
        
        const teamColor = getTeamColor(driver.team);
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
    }));
}

function renderRaceCalendar(races) {
    const container = document.getElementById('race-calendar-container');
    if (!container) return;

    container.replaceChildren(...races.map(race => {
        const entry = document.createElement('div');
        entry.className = `race-entry ${race.status === 'next' ? 'next-race' : ''}`;
        
        const dateObj = new Date(race.date);
        const day = dateObj.getDate();
        const month = MONTH_NAMES[dateObj.getMonth()];
        const formattedDate = `${day} ${month}`;
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'race-status';
        
        const now = Date.now();
        const raceTime = race.raceDate ? race.raceDate.getTime() : new Date(`${race.date}T${race.time || '12:00:00Z'}`).getTime();
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
            
            if (race.time) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'status-upcoming';
                timeDiv.textContent = `🕐 ${race.time.substring(0, 5)} GMT`;
                statusDiv.appendChild(timeDiv);
            }
        } else if (race.time) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'status-upcoming';
            timeDiv.textContent = `🕐 ${race.time.substring(0, 5)} GMT`;
            statusDiv.appendChild(timeDiv);
        }

        const countryCode = getCountryCode(race.name);
        const raceNameDisplay = race.name.toUpperCase();

        const roundDiv = document.createElement('div');
        roundDiv.className = 'race-round';
        roundDiv.textContent = `RUNDA ${String(race.round).padStart(2, '0')}`;

        const dateDiv = document.createElement('div');
        dateDiv.className = 'race-date';
        dateDiv.textContent = formattedDate;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'race-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'race-name';
        nameDiv.textContent = `${countryCode ? countryCode + ' ' : ''}${raceNameDisplay}`;
        
        const locationDiv = document.createElement('div');
        locationDiv.className = 'race-location';
        locationDiv.textContent = `📍 ${race.location || race.circuit || ''}`;
        
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(locationDiv);

        entry.appendChild(roundDiv);
        entry.appendChild(dateDiv);
        entry.appendChild(infoDiv);
        entry.appendChild(statusDiv);

        return entry;
    }));
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

        timerElement.textContent = `${days} DNI : ${String(hours).padStart(2, '0')} GODZ : ${String(minutes).padStart(2, '0')} MIN`;
    }

    updateTimer();
    setInterval(updateTimer, 60000);
}
