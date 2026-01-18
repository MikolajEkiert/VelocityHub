export default class DriverCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
      }
      .driver-card {
        position: relative;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 12px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        overflow: hidden;
      }
      .driver-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(255, 0, 0, 0.3);
      }
      .driver-card-rank {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: #ff0000;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        font-weight: 700;
        font-size: 0.875rem;
      }
      .driver-card-number {
        font-size: 2.5rem;
        font-weight: 900;
        color: #ff0000;
        line-height: 1;
        margin-bottom: 0.5rem;
      }
      .driver-card-team {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .team-accent-bar {
        width: 4px;
        height: 2rem;
        border-radius: 2px;
      }
      .driver-card-team-name {
        color: #cccccc;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.05em;
      }
      .driver-info {
        border-top: 1px solid #444;
        padding-top: 1rem;
      }
      .driver-name {
        font-size: 1.125rem;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
      }
      .driver-country {
        color: #999;
        font-size: 0.875rem;
      }
    `;

        const content = document.createElement('div');
        content.className = 'driver-card';

        const rank = this.getAttribute('data-rank');
        if (rank) {
            const rankDiv = document.createElement('div');
            rankDiv.className = 'driver-card-rank';
            rankDiv.textContent = `#${rank}`;
            content.appendChild(rankDiv);
        }

        const number = document.createElement('div');
        number.className = 'driver-card-number';
        number.textContent = this.getAttribute('data-number') || '';
        content.appendChild(number);

        const teamColor = this.getAttribute('data-team-color') || '#ff0000';
        const teamName = this.getAttribute('data-team') || 'TEAM';

        const teamDiv = document.createElement('div');
        teamDiv.className = 'driver-card-team';
        const accentBar = document.createElement('div');
        accentBar.className = 'team-accent-bar';
        accentBar.style.background = teamColor;
        teamDiv.appendChild(accentBar);
        const teamSpan = document.createElement('span');
        teamSpan.className = 'driver-card-team-name';
        teamSpan.textContent = teamName.toUpperCase();
        teamDiv.appendChild(teamSpan);
        content.appendChild(teamDiv);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'driver-info';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'driver-name';
        const firstName = this.getAttribute('data-first-name') || '';
        const lastName = this.getAttribute('data-last-name') || '';
        nameDiv.textContent = `${firstName} ${lastName}`.toUpperCase();
        infoDiv.appendChild(nameDiv);

        const countryDiv = document.createElement('div');
        countryDiv.className = 'driver-country';
        countryDiv.textContent = this.getAttribute('data-country') || '';
        infoDiv.appendChild(countryDiv);

        content.appendChild(infoDiv);
        shadow.appendChild(style);
        shadow.appendChild(content);
    }
}
customElements.define('driver-card', DriverCard);
