const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;

    const generatedID = generateId();
    const year = changeStringToNumber();
    const isComplete = isCompleted();
    const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function isCompleted() {
    const checkbox = document.getElementById('inputBookIsComplete');
    if (checkbox.checked) {
        return true;
    } else {
        return false;
    }
}

function changeStringToNumber() {
    const yearString = document.getElementById('inputBookYear').value; 
    const yearNumber = parseInt(yearString, 10); 
    return yearNumber;
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const checkbox = document.getElementById('inputBookIsComplete');
    const bookSubmitButton = document.getElementById('bookSubmit');
    const span = bookSubmitButton.querySelector('span');

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
        span.textContent = 'Selesai dibaca';
        } else {
        span.textContent = 'Belum selesai dibaca';
        }
    });

    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete)
            uncompletedBookList.append(bookElement);
        else
            completedBookList.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('article');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    container.style.border = '2px solid black';
    container.style.borderRadius = '10px';
    container.style.margin = '10px';
    container.style.padding = '10px';

    if (bookObject.isComplete) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action';

        const undoButton = document.createElement('button');
        undoButton.textContent = 'Belum selesai dibaca';

        undoButton.addEventListener('click', function () {
        undoTaskFromCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus buku';

        deleteButton.addEventListener('click', function () {
        removeTaskFromCompleted(bookObject.id);
        });

        actionDiv.append(undoButton, deleteButton);
        undoButton.style.marginRight = '5px';
        undoButton.style.background = 'green';
        deleteButton.style.background = 'red';
        undoButton.style.color = 'white';
        deleteButton.style.color = 'white';
        container.append(actionDiv);
    } else {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action';

        const checkButton = document.createElement('button');
        checkButton.textContent = 'Selesai dibaca';
        checkButton.addEventListener('click', function () {
        addTaskToCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus buku';
        deleteButton.addEventListener('click', function () {
        removeTaskFromCompleted(bookObject.id);
        });

        actionDiv.append(checkButton, deleteButton);
        checkButton.style.marginRight = '5px';
        checkButton.style.background = 'green';
        deleteButton.style.background = 'red';
        checkButton.style.color = 'white';
        deleteButton.style.color = 'white';
        container.append(actionDiv);
    }
    return container;
}

function filterBooksBySearch(searchTerm) {
    const uncompletedContainer = document.getElementById('incompleteBookshelfList');
    const completedContainer = document.getElementById('completeBookshelfList');

    while (uncompletedContainer.firstChild) {
        uncompletedContainer.removeChild(uncompletedContainer.firstChild);
    }

    while (completedContainer.firstChild) {
        completedContainer.removeChild(completedContainer.firstChild);
    }

    for (const bookObject of books) {
        if (bookObject.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        const bookElement = makeBook(bookObject);
            if (bookObject.isComplete) {
                completedContainer.append(bookElement);
            } else {
                uncompletedContainer.append(bookElement);
            }
        }
    }
}

const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTerm = document.getElementById('searchBookTitle').value.trim();
    filterBooksBySearch(searchTerm);
});

function addTaskToCompleted (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKS_APPS';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}