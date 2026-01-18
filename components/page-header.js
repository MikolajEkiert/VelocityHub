export class PageHeader extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
        margin-bottom: 2rem;
      }
      .page-header {
        border-bottom: 2px solid #ff0000;
        padding-bottom: 1.5rem;
      }
      .back-link {
        color: #999;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 600;
        transition: color 0.3s ease;
        margin-bottom: 1rem;
        display: inline-block;
      }
      .back-link:hover {
        color: #ff0000;
      }
      .page-title {
        color: white;
        font-size: 2rem;
        font-weight: 900;
        margin: 0.5rem 0 0 0;
      }
      .page-subtitle {
        color: #999;
        font-size: 1rem;
        margin: 0.5rem 0 0 0;
      }
    `;

        const content = document.createElement('div');
        content.className = 'page-header';

        const backLink = this.getAttribute('data-back-link');
        if (backLink) {
            const link = document.createElement('a');
            link.href = backLink;
            link.className = 'back-link';
            link.textContent = `← ${this.getAttribute('data-back-text') || 'WRÓĆ'}`;
            content.appendChild(link);
        }

        const title = document.createElement('h1');
        title.className = 'page-title';
        title.textContent = this.getAttribute('data-title') || '';
        content.appendChild(title);

        const subtitle = this.getAttribute('data-subtitle');
        if (subtitle) {
            const subtitleEl = document.createElement('p');
            subtitleEl.className = 'page-subtitle';
            subtitleEl.textContent = subtitle;
            content.appendChild(subtitleEl);
        }

        shadow.appendChild(style);
        shadow.appendChild(content);
    }
}
customElements.define('page-header', PageHeader);
