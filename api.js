async function fetchOpenF1Data(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
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
        return drivers.filter(d => d.driver_number);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return [];
    }
}

async function fetchDriverStandings(year = 2025) {
    try {
        const sessions = await fetchSessions(year);
        const raceSessions = sessions.filter(s => s.session_name === 'Race' && s.session_key);
        if (raceSessions.length === 0) {
            return [];
        }
        
        const latestRace = raceSessions.sort((a, b) => new Date(b.date_start) - new Date(a.date_start))[0];
        if (!latestRace.session_key) {
            return [];
        }
        
        const standings = await fetchOpenF1Data(`/driver_standings?session_key=${latestRace.session_key}`);
        return standings || [];
    } catch (error) {
        console.error('Error fetching driver standings:', error);
        return [];
    }
}

function transformMeetingsToRaces(meetings, sessions) {
    if (!meetings?.length) return [];
    
    const now = Date.now();
    const raceSessions = new Map(
        (sessions || [])
            .filter(s => s.session_name === 'Race' && s.meeting_key)
            .map(s => [s.meeting_key, s])
    );
    
    const races = meetings
        .filter(m => m.date_start)
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
                name: meeting.meeting_name || meeting.country_name || 'Grand Prix',
                location: meeting.location || meeting.circuit_short_name || meeting.country_name || '',
                circuit: meeting.circuit_short_name || meeting.location || meeting.country_name || '',
                status: isCompleted ? 'completed' : 'upcoming',
                time: timeStr,
                isCompleted,
                isNext: false,
                raceDate: raceDateTime,
                meetingKey: meeting.meeting_key
            };
        })
        .sort((a, b) => a.raceDate.getTime() - b.raceDate.getTime())
        .map((race, index) => ({ ...race, round: index + 1 }));
    
    const nextRace = races.find(r => !r.isCompleted);
    if (nextRace) {
        nextRace.isNext = true;
        nextRace.status = 'next';
    }
    
    return races;
}

function transformDriversData(drivers, standings = []) {
    const standingsMap = new Map(
        standings
            .filter(s => s.driver_number != null)
            .map(s => [s.driver_number, {
                position: s.position || 0,
                points: Number(s.points) || 0
            }])
    );
    
    const seenNumbers = new Set();
    const uniqueDrivers = drivers
        .filter(driver => {
            if (!driver.driver_number || seenNumbers.has(driver.driver_number)) {
                return false;
            }
            seenNumbers.add(driver.driver_number);
            return true;
        })
        .map(driver => {
            const standing = standingsMap.get(driver.driver_number) ?? { position: 0, points: 0 };
            const fullName = driver.full_name || driver.broadcast_name || driver.name_acronym || '';
            const nameParts = fullName.split(' ').filter(Boolean);
            
            return {
                position: standing.position,
                name: nameParts[0] || '',
                surname: nameParts.slice(1).join(' ') || fullName,
                team: driver.team_name || driver.name || 'Unknown',
                points: standing.points,
                number: driver.driver_number || 0,
                fullName,
                countryCode: driver.country_code || '',
                headshotUrl: driver.headshot_url || ''
            };
        });
    
    return uniqueDrivers.sort((a, b) => {
        if (a.position > 0 && b.position > 0) return a.position - b.position;
        if (a.position > 0) return -1;
        if (b.position > 0) return 1;
        if (a.points > 0 && b.points > 0) return b.points - a.points;
        return String(a.name).localeCompare(String(b.name));
    });
}
