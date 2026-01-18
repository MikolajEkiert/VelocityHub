const apiCache = new Map();
let requestQueue = Promise.resolve();

async function scheduledFetch(url) {
    const task = requestQueue.then(async () => {
        await new Promise((r) => setTimeout(r, 350));
        return fetch(url);
    });

    requestQueue = task.catch(() => {});
    return task;
}

async function fetchOpenF1Data(endpoint) {
    const cacheKey = `f1_data_${endpoint}`;

    const sessionData = sessionStorage.getItem(cacheKey);
    if (sessionData) {
        return JSON.parse(sessionData);
    }

    if (apiCache.has(cacheKey)) {
        return apiCache.get(cacheKey);
    }

    const fetchPromise = (async () => {
        try {
            let response = await scheduledFetch(`${API_BASE}${endpoint}`);

            if (response.status === 429) {
                console.warn('Rate limit hit (429), retrying after delay...');
                await new Promise((resolve) => setTimeout(resolve, 2000));
                response = await scheduledFetch(`${API_BASE}${endpoint}`);
            }

            if (!response.ok) {
                throw new Error(`${response.status}`);
            }

            const data = await response.json();
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (e) {}
            return data;
        } catch (error) {
            console.error(`${endpoint}:`, error);
            throw error;
        } finally {
            apiCache.delete(cacheKey);
        }
    })();

    apiCache.set(cacheKey, fetchPromise);
    return fetchPromise;
}

async function fetchMeetings(year = 2025) {
    return await fetchOpenF1Data(`/meetings?year=${year}`);
}

async function fetchSessions(year = 2025) {
    return await fetchOpenF1Data(`/sessions?year=${year}`);
}

async function fetchDrivers() {
    try {
        const drivers = await fetchOpenF1Data('/drivers');
        const validDrivers = drivers.filter(
            (d) => d.driver_number && isMainDriver2025(d.driver_number),
        );

        const seenNumbers = new Set();
        const uniqueDrivers = [];

        for (const driver of validDrivers) {
            if (!seenNumbers.has(driver.driver_number)) {
                seenNumbers.add(driver.driver_number);
                driver.team_name = normalizeTeamName(driver.team_name);
                uniqueDrivers.push(driver);
            }
        }

        return uniqueDrivers;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchDriverStandings(year = 2025) {
    try {
        const sessions = await fetchSessions(year);
        const raceSessions = sessions.filter(
            (s) => s.session_name === 'Race' && s.session_key,
        );

        if (raceSessions.length === 0) {
            return { standings: [], positions: [] };
        }

        const latestRace = raceSessions
            .filter((s) => new Date(s.date_start) <= new Date())
            .sort((a, b) => new Date(b.date_start) - new Date(a.date_start))[0];

        if (!latestRace || !latestRace.session_key) {
            return { standings: [], positions: [] };
        }

        const [drivers, positions, championshipDrivers] = await Promise.all([
            fetchOpenF1Data(`/drivers?session_key=${latestRace.session_key}`),
            fetchOpenF1Data(`/position?session_key=${latestRace.session_key}`),
            fetchOpenF1Data(
                `/championship_drivers?session_key=${latestRace.session_key}`,
            ),
        ]);

        return {
            standings: drivers || [],
            positions: positions || [],
            championship: championshipDrivers || [],
        };
    } catch (error) {
        console.error(error);
        return { standings: [], positions: [] };
    }
}

async function fetchSessionResults(sessionKey) {
    if (!sessionKey) return [];
    try {
        const [positions, laps] = await Promise.all([
            fetchOpenF1Data(`/position?session_key=${sessionKey}`),
            fetchOpenF1Data(`/laps?session_key=${sessionKey}`),
        ]);

        const finalPositions = new Map();

        positions.forEach((pos) => {
            const existing = finalPositions.get(pos.driver_number);
            if (!existing || new Date(pos.date) > new Date(existing.date)) {
                finalPositions.set(pos.driver_number, pos);
            }
        });

        const driverLaps = new Map();
        laps.forEach((lap) => {
            if (!driverLaps.has(lap.driver_number)) {
                driverLaps.set(lap.driver_number, []);
            }
            driverLaps.get(lap.driver_number).push(lap);
        });

        return Array.from(finalPositions.values())
            .map((pos) => {
                const driverLapData = driverLaps.get(pos.driver_number) || [];
                const bestLap = driverLapData
                    .filter((l) => l.lap_duration && l.lap_duration > 0)
                    .sort((a, b) => a.lap_duration - b.lap_duration)[0];

                return {
                    ...pos,
                    best_lap: bestLap?.lap_duration || null,
                    total_laps: driverLapData.length,
                };
            })
            .sort((a, b) => a.position - b.position);
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchDriverSeasonResults(driverNumber) {
    if (!driverNumber) return [];
    try {
        const results = await fetchOpenF1Data(
            `/session_result?driver_number=${driverNumber}`,
        );
        return results || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchRaceSessions(meetingKey) {
    if (!meetingKey) return [];
    try {
        const sessions = await fetchOpenF1Data(
            `/sessions?meeting_key=${meetingKey}`,
        );
        return sessions || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchTeamStandings(year = 2025) {
    try {
        const sessions = await fetchSessions(year);
        const raceSessions = sessions.filter(
            (s) => s.session_name === 'Race' && s.session_key,
        );

        if (raceSessions.length === 0) {
            return [];
        }

        const latestRace = raceSessions
            .filter((s) => new Date(s.date_start) <= new Date())
            .sort((a, b) => new Date(b.date_start) - new Date(a.date_start))[0];

        if (!latestRace || !latestRace.session_key) {
            return [];
        }

        const [teamStandings, driversData] = await Promise.all([
            fetchOpenF1Data(
                `/championship_teams?session_key=${latestRace.session_key}`,
            ),
            fetchDriverStandings(year),
        ]);
        console.log(teamStandings);

        const drivers = driversData.standings || [];
        const teamColors = new Map();

        drivers.forEach((driver) => {
            if (driver.team_name && driver.team_colour) {
                teamColors.set(driver.team_name, driver.team_colour);
            }
        });

        if (!teamStandings || teamStandings.length === 0) return [];

        return teamStandings
            .sort((a, b) => b.points_current - a.points_current)
            .map((team, index) => ({
                team: team.team_name,
                points: team.points_current,
                drivers: [],
                teamColor: teamColors.get(team.team_name) || '#FFFFFF',
                position: index + 1,
            }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

function transformMeetingsToRaces(meetings, sessions) {
    if (!meetings?.length) return [];

    const now = Date.now();
    const raceSessions = new Map(
        (sessions || [])
            .filter((s) => s.session_name === 'Race' && s.meeting_key)
            .map((s) => [s.meeting_key, s]),
    );

    const races = meetings
        .filter((m) => m.date_start)
        .map((meeting, index) => {
            const raceSession = raceSessions.get(meeting.meeting_key);
            const dateSource = raceSession?.date_start || meeting.date_start;
            const [dateStr, timePart] = dateSource.split('T');
            const timeStr = timePart ? `${timePart.substring(0, 8)}Z` : null;

            let raceDateTime;
            if (timeStr) {
                raceDateTime = new Date(`${dateStr}T${timeStr}`);
            } else {
                raceDateTime = new Date(`${dateStr}T12:00:00Z`);
            }

            const isCompleted = raceDateTime.getTime() < now;

            return {
                round: index + 1,
                date: dateStr,
                name:
                    meeting.meeting_name ||
                    meeting.country_name ||
                    'Grand Prix',
                location:
                    meeting.location ||
                    meeting.circuit_short_name ||
                    meeting.country_name ||
                    '',
                circuit:
                    meeting.circuit_short_name ||
                    meeting.location ||
                    meeting.country_name ||
                    '',
                status: isCompleted ? 'completed' : 'upcoming',
                time: timeStr,
                isCompleted,
                isNext: false,
                raceDate: raceDateTime,
                meetingKey: meeting.meeting_key,
            };
        })
        .sort((a, b) => a.raceDate.getTime() - b.raceDate.getTime())
        .map((race, index) => ({ ...race, round: index + 1 }));

    const nextRace = races.find((r) => !r.isCompleted);
    if (nextRace) {
        nextRace.isNext = true;
        nextRace.status = 'next';
    }

    return races;
}

function transformDriversData(driversData, driversRaw = []) {
    const { standings = [], positions = [], championship = [] } = driversData;

    const positionMap = new Map();

    if (championship.length > 0) {
        championship.forEach((c) => {
            positionMap.set(c.driver_number, {
                pos: c.position_current,
                points: c.points_current,
            });
        });
    } else {
        positions.forEach((pos) => {
            const existing = positionMap.get(pos.driver_number);
            if (!existing || new Date(pos.date) > new Date(existing.date)) {
                positionMap.set(pos.driver_number, {
                    pos: pos.position,
                    points: 0,
                });
            }
        });
    }

    const seenNumbers = new Set();
    const allDriversMap = new Map();

    driversRaw.forEach((d) => {
        if (d.driver_number && !allDriversMap.has(d.driver_number)) {
            allDriversMap.set(d.driver_number, d);
        }
    });

    standings.forEach((d) => {
        if (d.driver_number && !allDriversMap.has(d.driver_number)) {
            allDriversMap.set(d.driver_number, d);
        }
    });

    const uniqueDrivers = Array.from(allDriversMap.values())
        .filter((driver) => {
            if (
                !driver.driver_number ||
                seenNumbers.has(driver.driver_number)
            ) {
                return false;
            }
            seenNumbers.add(driver.driver_number);
            return true;
        })
        .map((driver) => {
            const stats = positionMap.get(driver.driver_number) || {
                pos: 0,
                points: 0,
            };
            const fullName =
                driver.full_name ||
                driver.broadcast_name ||
                driver.name_acronym ||
                '';
            const nameParts = fullName.split(' ').filter(Boolean);

            return {
                position: stats.pos,
                name: nameParts[0] || '',
                surname: nameParts.slice(1).join(' ') || fullName,
                team: driver.team_name || 'Unknown',
                points: stats.points,
                number: driver.driver_number || 0,
                fullName,
                countryCode: driver.country_code || '',
                headshotUrl: driver.headshot_url || '',
            };
        });

    return uniqueDrivers.sort((a, b) => {
        if (a.position > 0 && b.position > 0) return a.position - b.position;
        if (a.position > 0) return -1;
        if (b.position > 0) return 1;

        if (b.points !== a.points) return b.points - a.points;
        return String(a.name).localeCompare(String(b.name));
    });
}
