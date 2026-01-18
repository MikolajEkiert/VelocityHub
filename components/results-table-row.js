export class ResultsTableRow extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
      }
      .results-row {
        display: grid;
        grid-template-columns: 50px 1fr 100px;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #333;
        align-items: center;
        background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.05), transparent);
      }
      .results-row:hover {
        background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.15), transparent);
      }
      .results-position {
        font-weight: 900;
        font-size: 1.25rem;
        color: #ff0000;
        text-align: center;
      }
      .results-driver {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .driver-number {
        background: #ff0000;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.875rem;
      }
      .driver-details {
        display: flex;
        flex-direction: column;
      }
      .driver-name {
        color: white;
        font-weight: 600;
      }
      .driver-team {
        color: #999;
        font-size: 0.875rem;
      }
      .results-points {
        text-align: right;
        font-weight: 700;
        color: white;
        font-size: 1.125rem;
      }
    `;

        const content = document.createElement('div');
        content.className = 'results-row';

        const posDiv = document.createElement('div');
        posDiv.className = 'results-position';
        posDiv.textContent = this.getAttribute('data-position') || '';
        content.appendChild(posDiv);

        const driverDiv = document.createElement('div');
        driverDiv.className = 'results-driver';

        const numberDiv = document.createElement('div');
        numberDiv.className = 'driver-number';
        numberDiv.textContent = this.getAttribute('data-number') || '';
        driverDiv.appendChild(numberDiv);

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'driver-details';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'driver-name';
        nameDiv.textContent = this.getAttribute('data-driver-name') || '';
        detailsDiv.appendChild(nameDiv);

        const teamDiv = document.createElement('div');
        teamDiv.className = 'driver-team';
        teamDiv.textContent = this.getAttribute('data-team') || '';
        detailsDiv.appendChild(teamDiv);

        driverDiv.appendChild(detailsDiv);
        content.appendChild(driverDiv);

        const pointsDiv = document.createElement('div');
        pointsDiv.className = 'results-points';
        pointsDiv.textContent = this.getAttribute('data-points') || '0';
        content.appendChild(pointsDiv);

        shadow.appendChild(style);
        shadow.appendChild(content);
    }
}
customElements.define('results-table-row', ResultsTableRow);
