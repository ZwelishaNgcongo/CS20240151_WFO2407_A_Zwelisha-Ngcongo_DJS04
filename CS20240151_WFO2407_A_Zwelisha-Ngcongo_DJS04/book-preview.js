class BookPreview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["book-id", "title", "author", "image"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  get styles() {
    return `
        <style>
          :host {
            display: block;
          }
  
          .preview {
            border-width: 0;
            width: 100%;
            font-family: Roboto, sans-serif;
            padding: 0;
            display: flex;
            align-items: start;
            cursor: pointer;
            text-align: left;
            border-radius: 8px;
            border: 1px solid rgba(var(--color-dark), 0.15);
            background: rgba(var(--color-light), 1);
          }
  
          .preview__image {
            width: 100%;
            max-width: 100px;
            height: 140px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 1rem;
          }
  
          .preview__info {
            padding: 1rem;
          }
  
          .preview__title {
            margin: 0;
            font-size: 1rem;
            font-weight: bold;
            color: rgba(var(--color-dark), 0.8);
          }
  
          .preview__author {
            color: rgba(var(--color-dark), 0.6);
            font-size: 0.875rem;
            margin-top: 0.5rem;
          }
        </style>
      `;
  }

  render() {
    const bookId = this.getAttribute("book-id");
    const title = this.getAttribute("title");
    const author = this.getAttribute("author");
    const image = this.getAttribute("image");

    this.shadowRoot.innerHTML = `
        ${this.styles}
        <button class="preview" data-preview="${bookId}">
          <img 
            class="preview__image"
            src="${image}"
            alt="Book cover for ${title}"
          />
          <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${author}</div>
          </div>
        </button>
      `;

    this.shadowRoot
      .querySelector("button")
      .addEventListener("click", (event) => {
        this.dispatchEvent(
          new CustomEvent("preview-click", {
            bubbles: true,
            composed: true,
            detail: { bookId },
          })
        );
      });
  }
}
/*  Register components */
customElements.define("book-preview", BookPreview);

/* Show More Button Component */
class ShowMoreButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["remaining"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  get styles() {
    return `
        <style>
          :host {
            display: block;
            text-align: center;
            padding: 1rem;
          }
  
          .list__button {
            font-family: Roboto, sans-serif;
            transition: background-color 0.1s;
            border-width: 0;
            border-radius: 6px;
            height: 2.75rem;
            cursor: pointer;
            width: 50%;
            background-color: rgba(var(--color-blue), 1);
            color: rgba(var(--color-force-light), 1);
            font-size: 1rem;
            border: 1px solid rgba(var(--color-blue), 1);
            max-width: 10rem;
            margin: 0 auto;
            display: block;
          }
  
          .list__remaining {
            opacity: 0.5;
          }
  
          .list__button:not(:disabled):hover {
            background-color: rgba(var(--color-blue), 0.8);
            color: rgba(var(--color-force-light), 1);
          }
  
          .list__button:disabled {
            cursor: not-allowed;
            opacity: 0.2;
          }
        </style>
      `;
  }

  render() {
    const remaining = parseInt(this.getAttribute("remaining")) || 0;
    const buttonText = `Show more `;
    const remainingText = remaining === 1 ? "(1 book)" : `(${remaining} books)`;

    this.shadowRoot.innerHTML = `
        ${this.styles}
        <button 
          class="list__button" 
          ${remaining <= 0 ? "disabled" : ""}
        >
          ${buttonText}
          <span class="list__remaining">${remainingText}</span>
        </button>
      `;

    if (remaining > 0) {
      this.shadowRoot.querySelector("button").addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("show-more", {
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }
}

/*  Register components */
customElements.define("show-more-button", ShowMoreButton);

/* Theme Manager Component */
class ThemeManager extends HTMLElement {
  constructor() {
    super();
    /*  this.attachShadow({ mode: "open" }); */
  }

  connectedCallback() {
    this.setupInitialTheme();
    /* this.render(); */
    this.setupEventListeners();
  }

  setupInitialTheme() {
    const isDarkMode = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    this.setTheme(isDarkMode ? "night" : "day");
  }

  setTheme(theme) {
    const root = document.documentElement;
    if (theme === "night") {
      root.style.setProperty("--color-dark", "255, 255, 255");
      root.style.setProperty("--color-light", "10, 10, 20");
    } else {
      root.style.setProperty("--color-dark", "10, 10, 20");
      root.style.setProperty("--color-light", "255, 255, 255");
    }
  }

  setupEventListeners() {
    const form = this.shadowRoot.querySelector("[data-settings-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const { theme } = Object.fromEntries(formData);
      this.setTheme(theme);
      this.dispatchEvent(
        new CustomEvent("theme-changed", { detail: { theme } })
      );
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
          .overlay__form {
            padding: 2rem;
          }
          .overlay__field {
            display: block;
            margin-bottom: 1rem;
          }
          .overlay__label {
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          .overlay__input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid rgba(var(--color-dark), 0.1);
            border-radius: 4px;
            background-color: transparent;
          }
        </style>
        <form class="overlay__form" data-settings-form id="settings">
          <label class="overlay__field">
            <div class="overlay__label">Theme</div>
            <select class="overlay__input" name="theme">
              <option value="day">Day</option>
              <option value="night">Night</option>
            </select>
          </label>
          <button type="submit">Save</button>
        </form>
      `;
  }
}
/*  Register components */
customElements.define("theme-manager", ThemeManager);
