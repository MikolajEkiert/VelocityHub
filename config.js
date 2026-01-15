const TEAM_COLORS = {
    'Red Bull': 'var(--team-redbull)',
    'Red Bull Racing': 'var(--team-redbull)',
    'McLaren': 'var(--team-mclaren)',
    'Ferrari': 'var(--team-ferrari)',
    'Mercedes': 'var(--team-mercedes)',
    'Alpine': 'var(--team-alpine)',
    'Aston Martin': 'var(--team-aston)',
    'Williams': 'var(--team-williams)',
    'RB': 'var(--team-rb)',
    'Sauber': 'var(--team-sauber)',
    'Haas': 'var(--team-haas)',
    'Kick Sauber': 'var(--team-sauber)',
    'Visa Cash App RB': 'var(--team-rb)'
};

const COUNTRY_CODES = {
    'Bahrain': 'BH',
    'Saudi Arabian': 'SA',
    'Australian': 'AU',
    'Japanese': 'JP',
    'Chinese': 'CN',
    'Miami': 'US',
    'Emilia Romagna': 'IT',
    'Monaco': 'MC',
    'Spanish': 'ES',
    'Canadian': 'CA',
    'Austrian': 'AT',
    'British': 'GB',
    'Hungarian': 'HU',
    'Belgian': 'BE',
    'Dutch': 'NL',
    'Italian': 'IT',
    'Azerbaijan': 'AZ',
    'Singapore': 'SG',
    'United States': 'US',
    'Mexico City': 'MX',
    'São Paulo': 'BR',
    'Las Vegas': 'US',
    'Qatar': 'QA',
    'Abu Dhabi': 'AE'
};

const MONTH_NAMES = ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'];

const API_BASE = 'https://api.openf1.org/v1';

function getTeamColor(teamName) {
    for (const [team, color] of Object.entries(TEAM_COLORS)) {
        if (teamName && (teamName.includes(team) || team.includes(teamName))) {
            return color;
        }
    }
    return 'var(--text-secondary)';
}

function getCountryCode(raceName) {
    for (const [country, code] of Object.entries(COUNTRY_CODES)) {
        if (raceName && raceName.includes(country)) {
            return code;
        }
    }
    return '';
}
