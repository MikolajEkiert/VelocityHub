export class TeamCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
      }
      .team-card {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        border-top: 4px solid;
      }
      .team-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(255, 0, 0, 0.3);
      }
      .team-content {
        padding: 1.5rem;
      }
      .team-rank {
        color: #ff0000;
        font-weight: 700;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }
      .team-name {
        color: white;
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
      }
      .team-points {
        color: #999;
        font-size: 0.875rem;
        display: flex;
        justify-content: space-between;
      }
      .team-points-value {
        color: #ff0000;
        font-weight: 700;
      }
    `;

        const content = document.createElement('div');
        content.className = 'team-card';
        const teamColor = this.getAttribute('data-team-color') || '#ff0000';
        content.style.borderTopColor = teamColor;

        const innerDiv = document.createElement('div');
        innerDiv.className = 'team-content';

        const rankDiv = document.createElement('div');
        rankDiv.className = 'team-rank';
        rankDiv.textContent = `#${this.getAttribute('data-rank') || '0'}`;
        innerDiv.appendChild(rankDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'team-name';
        nameDiv.textContent = this.getAttribute('data-team-name') || '';
        innerDiv.appendChild(nameDiv);

        const pointsDiv = document.createElement('div');
        pointsDiv.className = 'team-points';
        const pointsLabel = document.createElement('span');
        pointsLabel.textContent = 'Punkty:';
        const pointsValue = document.createElement('span');
        pointsValue.className = 'team-points-value';
        pointsValue.textContent = this.getAttribute('data-points') || '0';
        pointsDiv.appendChild(pointsLabel);
        pointsDiv.appendChild(pointsValue);
        innerDiv.appendChild(pointsDiv);

        content.appendChild(innerDiv);
        shadow.appendChild(style);
        shadow.appendChild(content);
    }
}
customElements.define('team-card', TeamCard);
