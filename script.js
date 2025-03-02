console.log("Welcome to TICTACTOE");
let music = new Audio("music.mp3");
let audioTurn = new Audio("ting.mp3");
let gameover = new Audio("gameover.mp3");

// Game Variables
let turn = "X";
let isgameover = false;
let isBotMode = false;
let botLevel = "easy"; // Default bot level

const turnchange = document.querySelector('.turnchange');
const info = document.querySelector('.info');
const resetButton = document.getElementById("reset");
const botButton = document.getElementById("bot");

// Change "0" to "O" in the turn change function
const changeturn = () => (turn === "X" ? "O" : "X");

// Function to Check for a Win
const checkwin = () => {
    let boxtext = document.getElementsByClassName('boxtext');
    let wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    let winnerFound = false;
    let winningSymbol = '';
    
    wins.forEach(e => {
        if (
            boxtext[e[0]].innerText !== "" &&
            boxtext[e[0]].innerText === boxtext[e[1]].innerText &&
            boxtext[e[1]].innerText === boxtext[e[2]].innerText
        ) {
            winningSymbol = boxtext[e[0]].innerText;
            isgameover = true;
            gameover.play();
            document.querySelector('.imgbox img').style.width = "200px";
            disableBoxes();
            winnerFound = true;

            // Set the win message based on who actually won
            if (isBotMode) {
                info.innerText = winningSymbol === "X" ? "You Won!" : "Computer Won!";
            } else {
                info.innerText = winningSymbol + " Won!";
            }
        }
    });

    // Check for Draw if No Winner is Found
    if (!winnerFound) {
        let allFilled = [...boxtext].every(box => box.innerText !== "");
        if (allFilled) {
            info.innerText = "It's a Draw!";
            isgameover = true;
            gameover.play();
        }
    }
};


// Disable All Boxes
const disableBoxes = () => {
    document.querySelectorAll('.box').forEach(box => box.style.pointerEvents = "none");
};

// Enable All Boxes
const enableBoxes = () => {
    document.querySelectorAll('.box').forEach(box => box.style.pointerEvents = "auto");
};

// Player Move (Click Event)
let boxes = document.getElementsByClassName("box");
Array.from(boxes).forEach(element => {
    let boxtext = element.querySelector('.boxtext');
    element.addEventListener('click', () => {
        if (boxtext.innerText === '' && !isgameover) {
            boxtext.innerText = turn;
            boxtext.classList.add(turn); // Add class based on turn
            turn = changeturn();
            audioTurn.play();
            checkwin();

            if (!isgameover) {
                info.innerText = "Turn For " + turn;

                // If Bot Mode is ON and it's Bot's turn
                if (isBotMode && turn === "O") {
                    setTimeout(botMove, 500); // Small delay for realism
                }
            }
        }
    });
});

// Reset Game
resetButton.addEventListener('click', resetGame);

function resetGame() {
    document.querySelectorAll('.boxtext').forEach(element => {
        element.innerText = "";
        element.classList.remove('X', 'O', 'pop-in'); // Remove both classes and animation class
    });
    turn = "X";
    isgameover = false;
    enableBoxes();
    document.querySelector('.imgbox img').style.width = "0px";
    
    if (isBotMode) {
        info.innerText = `Playing against ${botLevel.charAt(0).toUpperCase() + botLevel.slice(1)} Computer (Your turn)`;
    } else {
        info.innerText = "Turn for X";
    }
}

// ----------------------- BOT SYSTEM -----------------------

// Play with Bot Button
botButton.addEventListener('click', () => {
    // Show difficulty controls
    const difficultyControls = document.querySelector('.difficulty-controls');
    difficultyControls.classList.add('show');
    
    // Update bot button text
    botButton.textContent = 'Playing vs Computer';
    botButton.classList.add('active');

    // Add active class to current difficulty
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === botLevel) {
            btn.classList.add('active');
        }
        // Add click handlers for difficulty buttons
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            startBotGame(btn.id);
        });
    });

    // Start game if not already in bot mode
    if (!isBotMode) {
        startBotGame(botLevel);
    }
});

// Start Bot Mode
const startBotGame = (level) => {
    botLevel = level;
    isBotMode = true;
    resetGame();
    
    // Update UI to show current mode
    info.innerText = `Playing against ${level.charAt(0).toUpperCase() + level.slice(1)} Computer (You: X, Computer: O)`;
    
    // Disable boxes during computer's turn
    if (turn === "O") {
        disableBoxes();
        setTimeout(() => {
            botMove();
            enableBoxes();
        }, 500);
    }
};

// Improved Bot Move function
const botMove = () => {
    if (isgameover) return;
    
    let board = Array.from(document.getElementsByClassName('boxtext')).map(b => b.innerText);
    let botSymbol = "O", playerSymbol = "X";

    let move;
    if (botLevel === "easy") {
        move = botMoveEasy(board);
    } else if (botLevel === "medium") {
        move = botMoveMedium(board, botSymbol, playerSymbol);
    } else if (botLevel === "hard") {
        move = botMoveHard(board, botSymbol, playerSymbol);
    }

    if (move !== undefined) {
        let boxtext = document.getElementsByClassName("boxtext")[move];
        boxtext.innerText = botSymbol;
        boxtext.classList.add(botSymbol);
        audioTurn.play();
        
        // Add animation class
        boxtext.classList.add('pop-in');
        setTimeout(() => boxtext.classList.remove('pop-in'), 300);

        checkwin();
        if (!isgameover) {
            turn = changeturn();
            info.innerText = "Your turn (X)";
        }
    }
};

// Easy Mode: Random Move
const botMoveEasy = (board) => {
    let emptyCells = board.map((val, idx) => val === '' ? idx : null).filter(idx => idx !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// Medium Mode: Block or Win Strategy
const botMoveMedium = (board, botSymbol, playerSymbol) => {
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = botSymbol;
            if (checkWin(board, botSymbol)) return i;
            board[i] = '';
        }
    }
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = playerSymbol;
            if (checkWin(board, playerSymbol)) return i;
            board[i] = '';
        }
    }
    return botMoveEasy(board);
};

// Hard Mode: Minimax Algorithm
const minimax = (board, isMaximizing, botSymbol, playerSymbol) => {
    if (checkWin(board, botSymbol)) return { score: 1 };
    if (checkWin(board, playerSymbol)) return { score: -1 };
    if (board.every(cell => cell !== '')) return { score: 0 };

    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = isMaximizing ? botSymbol : playerSymbol;
            let score = minimax(board, !isMaximizing, botSymbol, playerSymbol).score;
            board[i] = '';

            if (isMaximizing ? score > bestScore : score < bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return { score: bestScore, move: bestMove };
};

const botMoveHard = (board, botSymbol, playerSymbol) => {
    return minimax(board, true, botSymbol, playerSymbol).move;
};

// Helper Function: Check Win for AI
const checkWin = (board, symbol) => {
    return [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6]
    ].some(e => board[e[0]] === symbol && board[e[1]] === symbol && board[e[2]] === symbol);
};


document.addEventListener("DOMContentLoaded", function () {
    const toggleTheme = document.getElementById("toggleTheme");
  
    
  
    // Theme Toggle
    if (toggleTheme) {
      toggleTheme.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
  
        // Save theme preference
        const isDarkMode = document.body.classList.contains("dark-mode");
        toggleTheme.textContent = isDarkMode ? "☀️" : "🌙";
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      });
  
      // Load theme preference on page load
      if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        toggleTheme.textContent = "☀️";
      }
    }
  });