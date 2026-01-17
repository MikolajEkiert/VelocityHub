function getDriverDataFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        driverNumber: params.get('number'),
        season: params.get('season') || '2025',
    };
}

async function initDriverProfilePage() {
    const driverData = getDriverDataFromURL();

    if (!driverData.driverNumber) {
        document.querySelector('.driver-profile-container').innerHTML =
            '<p class="no-data">Kierowca nie został znaleziony. Wróć do sekcji kierowców.</p>';
        return;
    }

    try {
        const driversRaw = await fetchDrivers();

        const currentDriver = driversRaw.find(
            (d) => String(d.driver_number) === String(driverData.driverNumber)
        );

        if (!currentDriver) {
            document.querySelector('.driver-profile-container').innerHTML =
                '<p class="no-data">Kierowca nie został znaleziony w bazie danych.</p>';
            return;
        }

        displayDriverProfile(currentDriver);
        await loadDriverStats(currentDriver, driverData.season);
    } catch (error) {
        console.error('Error loading driver data:', error);
        document.querySelector('.driver-profile-container').innerHTML =
            '<p class="no-data">Błąd ładowania danych kierowcy. Spróbuj odświeżyć stronę.</p>';
    }
}

function displayDriverProfile(driverRaw) {
    const teamColor = getTeamColor(driverRaw.team_name || 'Unknown');

    document.getElementById(
        'driver-profile-number'
    ).textContent = `#${driverRaw.driver_number}`;
    document.getElementById('driver-profile-first-name').textContent = (
        driverRaw.first_name || ''
    ).toUpperCase();
    document.getElementById('driver-profile-last-name').textContent = (
        driverRaw.last_name || ''
    ).toUpperCase();
    document.getElementById('driver-profile-team').textContent = (
        driverRaw.team_name || '-'
    ).toUpperCase();
    document.getElementById('driver-profile-country').textContent =
        getCountryNameFromCode(driverRaw.country_code) || '-';

    const profileImage = document.getElementById('driver-profile-image');
    if (driverRaw.headshot_url) {
        profileImage.src = driverRaw.headshot_url;
        profileImage.onerror = function () {
            this.src = 'images/placeholder.png';
        };
    } else {
        profileImage.src = 'images/placeholder.png';
    }

    const profileHeader = document.querySelector('.driver-profile-header');
    if (profileHeader) {
        profileHeader.style.borderLeftColor = teamColor;
    }

    document.getElementById('driver-full-name').textContent =
        driverRaw.full_name ||
        `${driverRaw.first_name} ${driverRaw.last_name}` ||
        '-';

    if (driverRaw.date_of_birth) {
        document.getElementById('driver-dob').textContent = formatDate(
            driverRaw.date_of_birth
        );
    }

    document.getElementById('driver-constructor').textContent =
        driverRaw.team_name || '-';
}

async function loadDriverStats(driver, season) {
    try {
        const sessions = await fetchSessions(season);
        const raceSessions = sessions.filter((s) => s.session_name === 'Race');
        const qualifyingSessions = sessions.filter(
            (s) => s.session_name === 'Qualifying'
        );

        let wins = 0;
        let podiums = 0;
        let poles = 0;
        let racesCompleted = 0;

        for (const session of raceSessions) {
            try {
                const results = await fetchSessionResults(session.session_key);
                const driverResult = results.find(
                    (r) => r.driver_number === driver.driver_number
                );

                if (driverResult) {
                    racesCompleted++;
                    if (driverResult.position === 1) wins++;
                    if (driverResult.position <= 3) podiums++;
                }
            } catch (err) {
                console.log(
                    `Could not fetch results for session ${session.session_key}`
                );
            }
        }

        for (const session of qualifyingSessions) {
            try {
                const results = await fetchSessionResults(session.session_key);
                const driverResult = results.find(
                    (r) => r.driver_number === driver.driver_number
                );

                if (driverResult && driverResult.position === 1) {
                    poles++;
                }
            } catch (err) {
                console.log(
                    `Could not fetch qualifying results for session ${session.session_key}`
                );
            }
        }

        document.getElementById('stat-races-completed').textContent =
            racesCompleted;
        document.getElementById('stat-wins').textContent = wins;
        document.getElementById('stat-podiums').textContent = podiums;
        document.getElementById('stat-poles').textContent = poles;

        const statsSection = document.querySelector('.driver-profile-stats');
        if (statsSection) {
            statsSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading driver stats:', error);
        document.getElementById('stat-races-completed').textContent = '0';
        document.getElementById('stat-wins').textContent = '0';
        document.getElementById('stat-podiums').textContent = '0';
        document.getElementById('stat-poles').textContent = '0';
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pl-PL', options);
}

function getCountryNameFromCode(countryCode) {
    const countryNames = {
        NED: 'Holandia',
        MON: 'Monako',
        GBR: 'Wielka Brytania',
        GER: 'Niemcy',
        FRA: 'Francja',
        ITA: 'Włochy',
        ESP: 'Hiszpania',
        BRA: 'Brazylia',
        MEX: 'Meksyk',
        CAN: 'Kanada',
        AUS: 'Australia',
        JPN: 'Japonia',
        CHN: 'Chiny',
        IND: 'Indie',
        ARG: 'Argentyna',
        USA: 'USA',
        SWE: 'Szwecja',
        FIN: 'Finlandia',
        DEN: 'Dania',
        BEL: 'Belgia',
        POL: 'Polska',
        RUS: 'Rosja',
        THA: 'Tajlandia',
        ZAF: 'RPA',
        BHR: 'Bahrajn',
        ARE: 'ZEA',
        SGP: 'Singapur',
        MYS: 'Malezja',
        VNM: 'Wietnam',
    };

    return countryNames[countryCode] || countryCode || '-';
}

document.addEventListener('DOMContentLoaded', initDriverProfilePage);
