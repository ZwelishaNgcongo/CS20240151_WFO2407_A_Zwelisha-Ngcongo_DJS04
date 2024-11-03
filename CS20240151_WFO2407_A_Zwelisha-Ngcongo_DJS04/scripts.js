import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

// Data Models
class Book {
  constructor(id, title, author, image, published, description, genres) {
    /* representing every singular book within the library */
    this.id = id;
    this.title = title;
    this.author = author;
    this.image = image;
    this.published = published;
    this.description = description;
    this.genres = genres;
  }

  getAuthorName(authors) {
    /* Retrieving the author's name using their respective author ID */
    return authors[this.author];
  }

  getPublishedYear() {
    /* Targeting the publication year from the full date */
    return new Date(this.published).getFullYear();
  }
}

/* The UI Components. */
class BookPreview {
  static createPreviewElement(book, authors) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", book.id);

    element.innerHTML = `
      <img
        class="preview__image"
        src="${book.image}"
      />
      <div class="preview__info">
        <h3 class="preview__title">${book.title}</h3>
        <div class="preview__author">${book.getAuthorName(authors)}</div>
      </div>
    `;

    return element;
  }
}

/* State Management */
class BookList {
  /* Managing the collection of books and handles filtering */
  constructor(books, authors, genres, booksPerPage) {
    this.books = books.map(
      (book) =>
        new Book(
          book.id,
          book.title,
          book.author,
          book.image,
          book.published,
          book.description,
          book.genres
        )
    );
    this.authors = authors;
    this.genres = genres;
    this.booksPerPage = booksPerPage;
    this.currentPage = 1;
    this.matches = this.books; /* provides the current filtered set of books */
  }

  getPage(page) {
    /* Retrieving a specific page of the books */
    const start = (page - 1) * this.booksPerPage;
    const end = start + this.booksPerPage;
    return this.matches.slice(start, end);
  }

  getRemainingBooks() {
    /* Calculates the number of books remaining after current page */
    return this.matches.length - this.currentPage * this.booksPerPage;
  }

  search(filters) {
    /* Filtering of the books based on search criteria */
    this.matches = this.books.filter((book) => {
      const titleMatch =
        filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase());
      const authorMatch =
        filters.author === "any" || book.author === filters.author;
      const genreMatch =
        filters.genre === "any" || book.genres.includes(filters.genre);

      return titleMatch && authorMatch && genreMatch;
    });

    this.currentPage = 1;
    return this.matches;
  }
}

/* UI Manager */
class LibraryUI {
  /* Managing all the UI interactions and display logic */
  constructor(bookList) {
    this.bookList = bookList;
    this.initializeEventListeners();
    this.setupInitialDisplay();
  }

  setupInitialDisplay() {
    /* Seting up the initial UI state */
    this.renderBookList();
    this.setupFilterDropdowns();
    this.setupTheme();
    this.updateShowMoreButton();
  }

  renderBookList(books = this.bookList.getPage(this.bookList.currentPage)) {
    /* books are to be rendered to current page */
    const fragment = document.createDocumentFragment();

    for (const book of books) {
      fragment.appendChild(
        BookPreview.createPreviewElement(book, this.bookList.authors)
      );
    }

    const listItems = document.querySelector("[data-list-items]");
    if (this.bookList.currentPage === 1) {
      listItems.innerHTML = "";
    }
    listItems.appendChild(fragment);
  }

  setupFilterDropdowns() {
    /* Creates the filter dropdowns for the genres and the authors */
    this.createFilterDropdown(
      "[data-search-genres]",
      this.bookList.genres,
      "All Genres"
    );
    this.createFilterDropdown(
      "[data-search-authors]",
      this.bookList.authors,
      "All Authors"
    );
  }

  createFilterDropdown(selector, options, defaultText) {
    /* Creates a single dropdown filter */
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement("option");
    defaultOption.value = "any";
    defaultOption.innerText = defaultText;
    fragment.appendChild(defaultOption);

    for (const [id, name] of Object.entries(options)) {
      const element = document.createElement("option");
      element.value = id;
      element.innerText = name;
      fragment.appendChild(element);
    }

    document.querySelector(selector).appendChild(fragment);
  }

  setupTheme() {
    /* Seting up initial theme based on user's system preferences */
    const isDarkMode = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    this.setTheme(isDarkMode ? "night" : "day");
    document.querySelector("[data-settings-theme]").value = isDarkMode
      ? "night"
      : "day";
  }

  setTheme(theme) {
    /* Applying the selected theme to the application */
    const root = document.documentElement;
    if (theme === "night") {
      root.style.setProperty("--color-dark", "255, 255, 255");
      root.style.setProperty("--color-light", "10, 10, 20");
    } else {
      root.style.setProperty("--color-dark", "10, 10, 20");
      root.style.setProperty("--color-light", "255, 255, 255");
    }
  }

  updateShowMoreButton() {
    /* Updating the Show more button state and count */
    const remaining = this.bookList.getRemainingBooks();
    const button = document.querySelector("[data-list-button]");
    button.disabled = remaining <= 0;
    button.innerHTML = `
      <span>Show more</span>
      <span class="list__remaining"> (${Math.max(remaining, 0)})</span>
    `;
  }

  initializeEventListeners() {
    /* Setting up all event listeners for the application */
    /* Search form submission */
    document
      .querySelector("[data-search-form]")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);

        this.bookList.search(filters);
        this.renderBookList();
        this.updateShowMoreButton();

        const message = document.querySelector("[data-list-message]");
        message.classList.toggle(
          "list__message_show",
          this.bookList.matches.length < 1
        );

        document.querySelector("[data-search-overlay]").open = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

    /* Show more button click handler*/
    document
      .querySelector("[data-list-button]")
      .addEventListener("click", () => {
        this.bookList.currentPage++;
        this.renderBookList();
        this.updateShowMoreButton();
      });

    /*  Settings form submission */
    document
      .querySelector("[data-settings-form]")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);

        this.setTheme(theme);
        document.querySelector("[data-settings-overlay]").open = false;
      });

    /*  Book preview click handling */
    document
      .querySelector("[data-list-items]")
      .addEventListener("click", (event) => {
        const pathArray = Array.from(event.path || event.composedPath());
        const previewButton = pathArray.find((node) => node?.dataset?.preview);

        if (previewButton) {
          const bookId = previewButton.dataset.preview;
          const book = this.bookList.books.find((book) => book.id === bookId);

          if (book) {
            this.showBookDetails(book);
          }
        }
      });

    /*  Dialog controls */
    this.setupDialogControls();
  }

  showBookDetails(book) {
    /* Displaying detailed information for a selected book */
    const dialog = document.querySelector("[data-list-active]");
    dialog.open = true;

    document.querySelector("[data-list-blur]").src = book.image;
    document.querySelector("[data-list-image]").src = book.image;
    document.querySelector("[data-list-title]").innerText = book.title;
    document.querySelector(
      "[data-list-subtitle]"
    ).innerText = `${book.getAuthorName(
      this.bookList.authors
    )} (${book.getPublishedYear()})`;
    document.querySelector("[data-list-description]").innerText =
      book.description;
  }

  setupDialogControls() {
    /* Setting up event handlers */
    const dialogs = {
      search: {
        trigger: "[data-header-search]",
        overlay: "[data-search-overlay]",
        cancel: "[data-search-cancel]",
        focus: "[data-search-title]",
      },
      settings: {
        trigger: "[data-header-settings]",
        overlay: "[data-settings-overlay]",
        cancel: "[data-settings-cancel]",
      },
      preview: {
        close: "[data-list-close]",
        overlay: "[data-list-active]",
      },
    };

    for (const dialog of Object.values(dialogs)) {
      if (dialog.trigger) {
        document.querySelector(dialog.trigger).addEventListener("click", () => {
          document.querySelector(dialog.overlay).open = true;
          dialog.focus && document.querySelector(dialog.focus).focus();
        });
      }

      if (dialog.cancel || dialog.close) {
        document
          .querySelector(dialog.cancel || dialog.close)
          .addEventListener("click", () => {
            document.querySelector(dialog.overlay).open = false;
          });
      }
    }
  }
}

/* Initializing the application */
const bookLibrary = new BookList(books, authors, genres, BOOKS_PER_PAGE);
const ui = new LibraryUI(bookLibrary);
