const TEAM_COLORS = {
    'Red Bull': 'var(--team-redbull)',
    'Red Bull Racing': 'var(--team-redbull)',
    'Oracle Red Bull Racing': 'var(--team-redbull)',
    McLaren: 'var(--team-mclaren)',
    'McLaren Racing': 'var(--team-mclaren)',
    Ferrari: 'var(--team-ferrari)',
    'Scuderia Ferrari': 'var(--team-ferrari)',
    Mercedes: 'var(--team-mercedes)',
    'Mercedes-AMG': 'var(--team-mercedes)',
    Alpine: 'var(--team-alpine)',
    'BWT Alpine': 'var(--team-alpine)',
    'Aston Martin': 'var(--team-aston)',
    Williams: 'var(--team-williams)',
    'Williams Racing': 'var(--team-williams)',
    RB: 'var(--team-rb)',
    'RB F1 Team': 'var(--team-rb)',
    'Visa Cash App RB': 'var(--team-rb)',
    Sauber: 'var(--team-sauber)',
    'Kick Sauber': 'var(--team-sauber)',
    Haas: 'var(--team-haas)',
    'MoneyGram Haas': 'var(--team-haas)',
};

const COUNTRY_CODES = {
    Bahrain: 'BH',
    'Saudi Arabian': 'SA',
    'Saudi Arabia': 'SA',
    Australian: 'AU',
    Australia: 'AU',
    Japanese: 'JP',
    Japan: 'JP',
    Chinese: 'CN',
    China: 'CN',
    Miami: 'US',
    'Emilia Romagna': 'IT',
    'Emilia-Romagna': 'IT',
    Monaco: 'MC',
    Spanish: 'ES',
    Spain: 'ES',
    Canadian: 'CA',
    Canada: 'CA',
    Austrian: 'AT',
    Austria: 'AT',
    British: 'GB',
    'Great Britain': 'GB',
    Hungarian: 'HU',
    Hungary: 'HU',
    Belgian: 'BE',
    Belgium: 'BE',
    Dutch: 'NL',
    Netherlands: 'NL',
    Italian: 'IT',
    Italy: 'IT',
    Azerbaijan: 'AZ',
    Singapore: 'SG',
    'United States': 'US',
    USA: 'US',
    'Mexico City': 'MX',
    Mexico: 'MX',
    'São Paulo': 'BR',
    Brazil: 'BR',
    'Las Vegas': 'US',
    Qatar: 'QA',
    'Abu Dhabi': 'AE',
};

const MONTH_NAMES = [
    'STY',
    'LUT',
    'MAR',
    'KWI',
    'MAJ',
    'CZE',
    'LIP',
    'SIE',
    'WRZ',
    'PAŹ',
    'LIS',
    'GRU',
];

const API_BASE = 'https://api.openf1.org/v1';

const TEAM_DRIVER_MAPPING_2025 = {
    'Red Bull Racing': [1, 11],
    'Oracle Red Bull Racing': [1, 11],
    Ferrari: [16, 55],
    'Scuderia Ferrari': [16, 55],
    McLaren: [4, 81],
    'McLaren Racing': [4, 81],
    Mercedes: [63, 44],
    'Mercedes-AMG': [63, 44],
    'Aston Martin': [14, 18],
    Alpine: [10, 31],
    'BWT Alpine': [10, 31],
    Williams: [2, 23],
    'Williams Racing': [2, 23],
    RB: [22, 27],
    'Visa Cash App RB': [22, 27],
    'RB F1 Team': [22, 27],
    Sauber: [77, 24],
    'Kick Sauber': [77, 24],
    Haas: [20, 50],
    'MoneyGram Haas': [20, 50],
};

const MAIN_DRIVERS_2025 = [
    1, 11, 16, 55, 4, 81, 63, 44, 14, 18, 10, 31, 2, 23, 22, 27, 77, 24, 20, 50,
];

function isMainDriver2025(driverNumber) {
    return MAIN_DRIVERS_2025.includes(driverNumber);
}

function getTeamDrivers2025(teamName) {
    for (const [team, drivers] of Object.entries(TEAM_DRIVER_MAPPING_2025)) {
        if (teamName && (teamName.includes(team) || team.includes(teamName))) {
            return drivers;
        }
    }
    return [];
}

function normalizeTeamName(teamName) {
    if (!teamName) return 'Unknown';

    const normalizations = {
        'Oracle Red Bull Racing': 'Red Bull Racing',
        'Scuderia Ferrari': 'Ferrari',
        'McLaren Racing': 'McLaren',
        'Mercedes-AMG': 'Mercedes',
        'BWT Alpine': 'Alpine',
        'Williams Racing': 'Williams',
        'Visa Cash App RB': 'RB',
        'RB F1 Team': 'RB',
        'Kick Sauber': 'Sauber',
        'MoneyGram Haas': 'Haas',
    };

    for (const [variant, normalized] of Object.entries(normalizations)) {
        if (teamName.includes(variant) || variant.includes(teamName)) {
            return normalized;
        }
    }

    return teamName;
}

function getTeamColor(teamName) {
    if (!teamName) return 'var(--text-secondary)';

    for (const [team, color] of Object.entries(TEAM_COLORS)) {
        if (
            teamName.toLowerCase().includes(team.toLowerCase()) ||
            team.toLowerCase().includes(teamName.toLowerCase())
        ) {
            return color;
        }
    }
    return 'var(--text-secondary)';
}

function getCountryCode(raceName) {
    if (!raceName) return '';

    for (const [country, code] of Object.entries(COUNTRY_CODES)) {
        if (raceName.toLowerCase().includes(country.toLowerCase())) {
            return code;
        }
    }
    return '';
}

function formatTime(milliseconds) {
    if (!milliseconds || milliseconds === 0) return '-';

    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(3);

    if (minutes > 0) {
        return `${minutes}:${seconds.padStart(6, '0')}`;
    }
    return `${seconds}s`;
}

function formatGap(gap) {
    if (!gap || gap === 0) return '-';
    if (gap < 0) return '-';
    return `+${gap.toFixed(3)}s`;
}
