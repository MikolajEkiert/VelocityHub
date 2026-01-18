export class StatCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
      }
      .stat-card {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        border-left: 4px solid #ff0000;
        transition: all 0.3s ease;
      }
      .stat-card:hover {
        box-shadow: 0 8px 16px rgba(255, 0, 0, 0.2);
        transform: translateY(-4px);
      }
      .stat-label {
        color: #999;
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
      }
      .stat-value {
        font-size: 2.5rem;
        font-weight: 900;
        color: #ff0000;
      }
    `;

        const content = document.createElement('div');
        content.className = 'stat-card';

        const label = document.createElement('div');
        label.className = 'stat-label';
        label.textContent = this.getAttribute('data-label') || '';
        content.appendChild(label);

        const value = document.createElement('div');
        value.className = 'stat-value';
        value.textContent = this.getAttribute('data-value') || '0';
        content.appendChild(value);

        shadow.appendChild(style);
        shadow.appendChild(content);
    }
}
customElements.define('stat-card', StatCard);
