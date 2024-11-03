Refactoring Analysis.

1.Data Model separation
-created a Book class in order to encapsulate book related logic.
Rationale: I am in a position to seperate the data concerns from presentation logic.
Benefits: Each of the books manages its own data, it provides a single source of truth for the book operations.

2. UI:
-created a BookPreview class in order to render book previews.

3.State Mangement:
-created Booklist class for managing application state.
Rationale: it helps in centralizing data operations and state changes.

4. Event Handlers
-In the LibraryUI event handling is centralized here.
Rationale: provides an organized event managent.

Abstraction Analysis.
1. Modular Design
- Within class BookPreview{} each of the class has a single properly defined responsibility. Allow one to make changes to one component without having to affect others.

2. Encapsulated Logic
-created class Book{ getAuthorName(authors){
    return authors[this.authur];.......
}} this allows one to to hide the implementation details from the other components, in turn we have reduced code duplication.