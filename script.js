const API_URL = 'https://api.freeapi.app/api/v1/public/books';
const BOOKS_PER_PAGE = 10;

let currentPage = 1;
let booksData = [];
let filteredBooks = [];
let displayMode = 'grid';
let sortBy = '';
let totalPages = Infinity;

const booksContainer = document.getElementById('books-container');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const gridBtn = document.getElementById('grid-view');
const listBtn = document.getElementById('list-view');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageNum = document.getElementById('page-num');
const themeToggle = document.createElement('button');

async function fetchBooks(page = 1) {
    document.body.classList.add('loading');
    try {
        const response = await fetch(`${API_URL}?page=${page}&limit=${BOOKS_PER_PAGE}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        booksData = data.data.data || [];
        filteredBooks = [...booksData];
        totalPages = data.data.totalPages || Infinity;
        applySortAndDisplay();
        updatePaginationButtons();
    } catch (error) {
        console.error('Error fetching books:', error);
        displayError('Failed to load books. Please try again later.');
    } finally {
        document.body.classList.remove('loading');
    }
}

function displayBooks(books) {
    booksContainer.className = `${displayMode}-view`;
    booksContainer.innerHTML = '';

    if (!books || books.length === 0) {
        booksContainer.innerHTML = '<div class="book-card no-results">No matching books found.</div>';
        return;
    }

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        if (new Date(book.volumeInfo.publishedDate) < new Date('2000-01-01')) {
            card.classList.add('featured');
        }
        card.innerHTML = `
            <img src="${book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/100'}" 
                 alt="${book.volumeInfo.title}" 
                 onerror="this.src='https://via.placeholder.com/100'">
            <div>
                <h3>${book.volumeInfo.title || 'Untitled'}</h3>
                <p>${book.volumeInfo.authors?.join(', ') || 'Unknown'}</p>
            </div>
        `;
        card.addEventListener('click', () => window.open(book.volumeInfo.infoLink || '#', '_blank'));
        booksContainer.appendChild(card);
    });

    pageNum.textContent = currentPage;
}

function displayError(message) {
    booksContainer.className = `${displayMode}-view`;
    booksContainer.innerHTML = `<div class="book-card no-results">${message}</div>`;
}

function updatePaginationButtons() {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages || booksData.length < BOOKS_PER_PAGE;
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    filteredBooks = booksData.filter(book => 
        (book.volumeInfo.title?.toLowerCase().includes(searchTerm)) ||
        (book.volumeInfo.authors?.some(author => author.toLowerCase().includes(searchTerm)))
    );
    applySortAndDisplay();
}

function handleSort() {
    sortBy = sortSelect.value;
    applySortAndDisplay();
}

function applySortAndDisplay() {
    let sortedBooks = [...filteredBooks];
    if (sortBy === 'title') {
        sortedBooks.sort((a, b) => (a.volumeInfo.title || '').localeCompare(b.volumeInfo.title || ''));
    } else if (sortBy === 'date') {
        sortedBooks.sort((a, b) => {
            const dateA = new Date(a.volumeInfo.publishedDate || '0');
            const dateB = new Date(b.volumeInfo.publishedDate || '0');
            return dateA - dateB;
        });
    }
    displayBooks(sortedBooks);
}

function setViewMode(mode) {
    displayMode = mode;
    gridBtn.classList.toggle('active', mode === 'grid');
    listBtn.classList.toggle('active', mode === 'list');
    applySortAndDisplay();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
}

// Event Listeners
searchInput.addEventListener('input', handleSearch);
sortSelect.addEventListener('change', handleSort);
gridBtn.addEventListener('click', () => setViewMode('grid'));
listBtn.addEventListener('click', () => setViewMode('list'));
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchBooks(currentPage);
    }
});
nextBtn.addEventListener('click', () => {
    currentPage++;
    fetchBooks(currentPage);
});


themeToggle.id = 'theme-toggle';
themeToggle.textContent = 'Dark Mode';

themeToggle.classList.add('#theme-toggle');

document.querySelector('.controls').appendChild(themeToggle);
themeToggle.addEventListener('click', toggleTheme);

// Initial Setup
function init() {
    fetchBooks(currentPage);
    setViewMode('grid');
}

init();