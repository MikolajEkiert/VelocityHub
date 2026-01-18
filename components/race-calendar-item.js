export class RaceCalendarItem extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
      }
      .calendar-item {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 8px;
        padding: 1.5rem;
        border-left: 4px solid #ff0000;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .calendar-item:hover {
        box-shadow: 0 8px 16px rgba(255, 0, 0, 0.2);
        transform: translateX(8px);
      }
      .calendar-date {
        color: #ff0000;
        font-weight: 700;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }
      .calendar-race-name {
        color: white;
        font-weight: 700;
        font-size: 1.125rem;
      }
      .calendar-location {
        color: #999;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
      .calendar-round {
        background: rgba(255, 0, 0, 0.1);
        color: #ff0000;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        font-weight: 700;
        font-size: 0.875rem;
      }
    `;

        const content = document.createElement('div');
        content.className = 'calendar-item';

        const infoDiv = document.createElement('div');
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = this.getAttribute('data-date') || '';
        infoDiv.appendChild(dateDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'calendar-race-name';
        nameDiv.textContent = this.getAttribute('data-race-name') || '';
        infoDiv.appendChild(nameDiv);

        const locationDiv = document.createElement('div');
        locationDiv.className = 'calendar-location';
        locationDiv.textContent = this.getAttribute('data-location') || '';
        infoDiv.appendChild(locationDiv);

        content.appendChild(infoDiv);

        const roundDiv = document.createElement('div');
        roundDiv.className = 'calendar-round';
        roundDiv.textContent = `R${this.getAttribute('data-round') || '0'}`;
        content.appendChild(roundDiv);

        shadow.appendChild(style);
        shadow.appendChild(content);
    }
}
customElements.define('race-calendar-item', RaceCalendarItem);
