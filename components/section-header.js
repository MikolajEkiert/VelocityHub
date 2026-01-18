export class SectionHeader extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
      :host {
        display: block;
        margin-bottom: 2rem;
      }
      .section-header {
        text-align: center;
      }
      .section-title {
        font-size: 2.5rem;
        font-weight: 900;
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
      }
      .title-top {
        color: #cccccc;
      }
      .title-accent {
        color: #ff0000;
      }
      .section-subtitle {
        color: #999;
        font-size: 1rem;
        margin-top: 0.75rem;
        margin-bottom: 0;
      }
    `;

        const content = document.createElement('div');
        content.className = 'section-header';

        const title = document.createElement('h2');
        title.className = 'section-title';

        const titleTop = document.createElement('span');
        titleTop.className = 'title-top';
        titleTop.textContent = this.getAttribute('data-title-top') || '';
        title.appendChild(titleTop);

        const titleAccent = document.createElement('span');
        titleAccent.className = 'title-accent';
        titleAccent.textContent = this.getAttribute('data-title-accent') || '';
        title.appendChild(titleAccent);

        content.appendChild(title);

        const subtitle = this.getAttribute('data-subtitle');
        if (subtitle) {
            const subtitleEl = document.createElement('p');
            subtitleEl.className = 'section-subtitle';
            subtitleEl.textContent = subtitle;
            content.appendChild(subtitleEl);
        }

        shadow.appendChild(style);
        shadow.appendChild(content);
    }
}
customElements.define('section-header', SectionHeader);
