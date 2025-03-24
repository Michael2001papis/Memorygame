document.addEventListener('DOMContentLoaded', () => {
    // משתנים גלובליים
    const board = document.querySelector('.game-board');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const timerDisplay = document.getElementById('timer');
    const bestTimeDisplay = document.getElementById('best-time');
    const scoreboardBody = document.querySelector('#scoreboard tbody');
    const resetScoreboardBtn = document.getElementById('reset-scoreboard-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const ctx = confettiCanvas.getContext('2d');
    const winModal = document.getElementById('winModal');
    const winMessage = document.getElementById('winMessage');
  
    let symbols = ['🍎', '🍊', '🍌', '🍇', '🍉', '🍒', '🍍', '🥝'];
    let cards = [];
    let flippedCards = [];
    let matchedCards = 0;
    let timerInterval = null;
    let elapsedTime = 0;
    let gameStarted = false;
    let gamePaused = false;
  
    // שינוי גודל קנבס הקונפטי בהתאם לחלון
    function resizeCanvas() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  
    // אפקט קונפטי פשוט
    let confettiParticles = [];
    function createConfetti() {
      confettiParticles = [];
      for (let i = 0; i < 100; i++) {
        confettiParticles.push({
          x: Math.random() * confettiCanvas.width,
          y: Math.random() * confettiCanvas.height - confettiCanvas.height,
          r: Math.random() * 6 + 2,
          d: Math.random() * 10 + 1,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          tilt: Math.random() * 10 - 10,
          tiltAngleIncrement: Math.random() * 0.07 + 0.05,
          tiltAngle: 0
        });
      }
      requestAnimationFrame(updateConfetti);
    }
    function updateConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiParticles.forEach(p => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.d);
        if (p.y > confettiCanvas.height) p.y = -10;
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });
      requestAnimationFrame(updateConfetti);
    }
  
    // טיימר
    function startTimer() {
      timerInterval = setInterval(() => {
        if (!gamePaused) {
          elapsedTime++;
          timerDisplay.textContent = `זמן: ${elapsedTime} שניות`;
        }
      }, 1000);
    }
    function stopTimer() {
      clearInterval(timerInterval);
    }
  
    // יצירת קלפים וערבובם
    function createCards() {
      cards = [];
      symbols.forEach(symbol => {
        cards.push(symbol);
        cards.push(symbol);
      });
      cards.sort(() => 0.5 - Math.random());
    }
    
    function renderBoard() {
      board.innerHTML = '';
      cards.forEach(symbol => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.symbol = symbol;
        card.textContent = ''; // מתחילים עם קלף סגור
        board.appendChild(card);
      });
    }
    
    // טיפול בלחיצות על קלפים
    function cardClickHandler(e) {
      if (!e.target.classList.contains('card') || e.target.classList.contains('flipped') || gamePaused) return;
      e.target.classList.add('flipped');
      e.target.textContent = e.target.dataset.symbol;
      flippedCards.push(e.target);
      if (flippedCards.length === 2) {
        setTimeout(checkMatch, 500);
      }
    }
    
    function checkMatch() {
      const [card1, card2] = flippedCards;
      if (card1.dataset.symbol === card2.dataset.symbol) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCards += 2;
        if (matchedCards === cards.length) {
          gameWon();
        }
      } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '';
        card2.textContent = '';
      }
      flippedCards = [];
    }
    
    // בעת ניצחון המשחק - מציגים מודאל נעימה במקום alert
    function gameWon() {
      stopTimer();
      winMessage.textContent = `ניצחתם! הזמן שלך: ${elapsedTime} שניות`;
      winModal.style.display = 'block';
      updateScoreboard(elapsedTime);
      // הפעלת אפקט קונפטי
      createConfetti();
      setTimeout(() => {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }, 5000);
      pauseBtn.disabled = true;
      resetBtn.disabled = false;
    }
    
    // סגירת מודאל ניצחון
    window.closeWinModal = function() {
      winModal.style.display = 'none';
    }
    
    // עדכון טבלת השיאים ושמירתה ב-localStorage
    function updateScoreboard(time) {
      let scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
      let playerName = prompt("הכנס את שמך לשיא:") || "שחקן";
      scoreboard.push({ name: playerName, time });
      scoreboard.sort((a, b) => a.time - b.time);
      scoreboard = scoreboard.slice(0, 5); // שמירה על 5 מקומות
      localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
      renderScoreboard();
      bestTimeDisplay.textContent = `הזמן הטוב ביותר: ${scoreboard[0] ? scoreboard[0].time + ' שניות' : '--'}`;
    }
    
    function renderScoreboard() {
      let scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
      scoreboardBody.innerHTML = '';
      scoreboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        const posCell = document.createElement('td');
        posCell.textContent = index + 1;
        const nameCell = document.createElement('td');
        nameCell.textContent = entry.name;
        const timeCell = document.createElement('td');
        timeCell.textContent = entry.time;
        row.appendChild(posCell);
        row.appendChild(nameCell);
        row.appendChild(timeCell);
        scoreboardBody.appendChild(row);
      });
    }
    
    // איפוס המשחק: ניתוק הטיימר, ניקוי הלוח והכנות חדשות
    function resetGame() {
      stopTimer();
      elapsedTime = 0;
      timerDisplay.textContent = `זמן: 0 שניות`;
      matchedCards = 0;
      flippedCards = [];
      createCards();
      renderBoard();
      board.addEventListener('click', cardClickHandler);
      gameStarted = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = true;
    }
    
    // הפסקה/המשך משחק
    function pauseGame() {
      gamePaused = !gamePaused;
      pauseBtn.textContent = gamePaused ? "המשך משחק" : "עצור משחק";
    }
    
    startBtn.addEventListener('click', () => {
      if (!gameStarted) {
        resetGame();
        gameStarted = true;
        startTimer();
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
      }
    });
    
    pauseBtn.addEventListener('click', pauseGame);
    
    resetBtn.addEventListener('click', () => {
      if (confirm("האם אתה בטוח שברצונך לאפס את המשחק?")) {
        resetGame();
      }
    });
    
    resetScoreboardBtn.addEventListener('click', () => {
      if (confirm("האם אתה בטוח שברצונך לאפס את טבלת השיאים?")) {
        localStorage.removeItem('scoreboard');
        renderScoreboard();
        bestTimeDisplay.textContent = `הזמן הטוב ביותר: --`;
      }
    });
    
    // אתחול טבלת השיאים בעת טעינת העמוד
    renderScoreboard();
  });
  