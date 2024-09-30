// script.js

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchHistoryList = document.getElementById('search-history');
    const clearHistoryButton = document.getElementById('clear-history');

    const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let balls = [];
const numBalls = 30; // Number of balls
let isDragging = false; // Flag for drag status
let draggedBall = null; // Currently dragged ball
let offsetX, offsetY; // Mouse offset from ball center

// Ball constructor
function Ball(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speed = Math.random() * 3 + 1; // Random speed
    this.isFalling = true; // Flag to indicate if the ball is still falling

    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };

    this.update = function() {
        if (this.isFalling) {
            this.y += this.speed;
            // Stop ball if it reaches the bottom of the canvas
            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius; // Position it at the bottom
                this.isFalling = false; // Stop it from falling
            }
        }
        this.draw();
    };
}

// Create balls
for (let i = 0; i < numBalls; i++) {
    let radius = Math.random() * 20 + 5; // Random radius between 5 and 25
    let x = Math.random() * (canvas.width - radius * 2) + radius; // Random x position
    let y = Math.random() * canvas.height; // Random y position
    let color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color
    balls.push(new Ball(x, y, radius, color));
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    balls.forEach(ball => {
        ball.update();
    });
    requestAnimationFrame(animate); // Keep the animation going
}

// Mouse Events
canvas.addEventListener('mousedown', (e) => {
    const mousePos = getMousePos(canvas, e);
    balls.forEach(ball => {
        if (isMouseInsideBall(mousePos, ball)) {
            isDragging = true;
            draggedBall = ball;
            offsetX = mousePos.x - ball.x;
            offsetY = mousePos.y - ball.y;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedBall) {
        const mousePos = getMousePos(canvas, e);
        draggedBall.x = mousePos.x - offsetX;
        draggedBall.y = mousePos.y - offsetY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedBall = null;
});

// Function to get mouse position relative to the canvas
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// Function to check if mouse is inside the ball
function isMouseInsideBall(mousePos, ball) {
    const dist = Math.sqrt((mousePos.x - ball.x) ** 2 + (mousePos.y - ball.y) ** 2);
    return dist < ball.radius;
}

// Start the animation
animate();


    // Load search history on page load
    loadSearchHistory();

    // Event listener for search button
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            addSearchQuery(query);
            performSearch(query);
            searchInput.value = '';
        }
    });

    // Event listener for Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    // Event listener for clear history button
    clearHistoryButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your entire search history?')) {
            localStorage.removeItem('searchHistory');
            loadSearchHistory();
        }
    });

    // Function to perform the search (you can customize this)
    function performSearch(query) {
        // For demonstration, we'll just log the search query.
        // You can integrate an actual search functionality here.
        console.log(`Searching for: ${query}`);
        // Simulate search delay
        showLoading();
        setTimeout(() => {
            hideLoading();
            alert(`You searched for: "${query}"`);
        }, 1000);
    }

    // Function to add a search query to history
    function addSearchQuery(query) {
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        const timestamp = new Date().toLocaleString();
        // Create a new search item object
        const newItem = { query, timestamp };

        // Remove duplicate if exists
        history = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());

        // Add to the beginning
        history.unshift(newItem);

        // Limit history to last 20 searches
        if (history.length > 20) {
            history.pop();
        }

        localStorage.setItem('searchHistory', JSON.stringify(history));
        loadSearchHistory();
    }

    // Function to load and display search history
    function loadSearchHistory() {
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistoryList.innerHTML = '';

        if (history.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No search history.';
            li.style.textAlign = 'center';
            li.style.color = '#888888';
            searchHistoryList.appendChild(li);
            return;
        }

        history.forEach((item, index) => {
            const li = document.createElement('li');

            // Query Container
            const queryDiv = document.createElement('div');
            queryDiv.classList.add('history-query');
            queryDiv.textContent = item.query;
            queryDiv.title = 'Click to search again';
            queryDiv.addEventListener('click', () => {
                performSearch(item.query);
            });

            // Timestamp
            const timestampSpan = document.createElement('span');
            timestampSpan.classList.add('timestamp');
            timestampSpan.textContent = item.timestamp;

            // Delete Icon
            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash-alt', 'delete-icon');
            deleteIcon.title = 'Delete this entry';
            deleteIcon.addEventListener('click', () => {
                deleteHistoryItem(index);
            });

            // Left Container (Query and Timestamp)
            const leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.flexDirection = 'column';
            leftContainer.style.flex = '1';
            leftContainer.appendChild(queryDiv);
            leftContainer.appendChild(timestampSpan);

            // Right Container (Delete Icon)
            const rightContainer = document.createElement('div');
            rightContainer.appendChild(deleteIcon);

            li.appendChild(leftContainer);
            li.appendChild(rightContainer);
            searchHistoryList.appendChild(li);
        });
    }

    // Function to delete a specific history item
    function deleteHistoryItem(index) {
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (index >= 0 && index < history.length) {
            history.splice(index, 1);
            localStorage.setItem('searchHistory', JSON.stringify(history));
            loadSearchHistory();
        }
    }

    // Optional: Function to show loading indicator
    function showLoading() {
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchButton.disabled = true;
    }
    

    // Optional: Function to hide loading indicator
    function hideLoading() {
        searchButton.innerHTML = '<i class="fas fa-arrow-right"></i> Search';
        searchButton.disabled = false;
    }
});
