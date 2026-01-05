// ============================================
// PURPLE LOVE WEBSITE - MAIN JAVASCRIPT
// All functionality in one file
// ============================================

// === GLOBAL VARIABLES ===
let currentSong = 0;
let currentPhoto = 0;
let currentCoupon = 0;
let currentQuizQuestion = 0;
let quizScore = 0;
let audioPlayer;
let filteredPhotos = [];
let filteredMessages = [];
let filteredCoupons = [];

// === INITIALIZE WHEN DOM IS LOADED ===
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// === MAIN INITIALIZATION FUNCTION ===
function initializeWebsite() {
    // Initialize audio player
    audioPlayer = document.getElementById('audioPlayer');
    
    // Load content from config
    loadHeroSection();
    loadLetter();
    loadGallery();
    loadTimeline();
    loadReasons();
    loadMusicPlayer();
    loadQuiz();
    loadCountdowns();
    loadMessages();
    loadGifts();
    loadCoupons();
    loadFooter();
    
    // Initialize features
    initFloatingHearts();
    initSparkleTrail();
    initScrollEffects();
    initNavigationDots();
    
    // Load saved data from localStorage
    loadSavedData();
    
    // Start countdown updates
    setInterval(updateCountdowns, 1000);
}

// === HERO SECTION ===
function loadHeroSection() {
    document.getElementById('heroTitle').textContent = CONFIG.hero.title;
    document.getElementById('heroSubtitle').textContent = CONFIG.hero.subtitle;
    document.getElementById('heroButtonText').textContent = CONFIG.hero.buttonText;
    
    document.getElementById('heroButton').addEventListener('click', function() {
        document.getElementById('letter').scrollIntoView({ behavior: 'smooth' });
    });
}

// === LOVE LETTER ===
function loadLetter() {
    document.getElementById('letterDate').textContent = CONFIG.letter.date;
    document.getElementById('letterGreeting').textContent = CONFIG.letter.greeting;
    
    const letterBody = document.getElementById('letterBody');
    letterBody.innerHTML = '';
    CONFIG.letter.paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        letterBody.appendChild(p);
    });
    
    document.getElementById('letterClosing').textContent = CONFIG.letter.closing;
    document.getElementById('letterSignature').textContent = CONFIG.letter.signature;
    
    // Read aloud button (plays background music)
    document.getElementById('readAloudBtn').addEventListener('click', function() {
        if (CONFIG.playlist.length > 0) {
            playSong(0);
        }
    });
}

// === PHOTO GALLERY ===
function loadGallery() {
    filteredPhotos = [...CONFIG.photos];
    renderGallery();
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('#galleryFilters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            if (filter === 'all') {
                filteredPhotos = [...CONFIG.photos];
            } else {
                filteredPhotos = CONFIG.photos.filter(photo => photo.category === filter);
            }
            renderGallery();
        });
    });
    
    // Lightbox controls
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));
    
    // Close lightbox on background click
    document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) closeLightbox();
    });
}

function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';
    
    filteredPhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animationDelay = `${index * 0.1}s`;
        item.innerHTML = `
            <img src="images/${photo.filename}" alt="${photo.caption}">
            <p class="gallery-caption">${photo.caption}</p>
        `;
        item.addEventListener('click', () => openLightbox(index));
        grid.appendChild(item);
    });
}

function openLightbox(index) {
    currentPhoto = index;
    const photo = filteredPhotos[index];
    document.getElementById('lightboxImage').src = `images/${photo.filename}`;
    document.getElementById('lightboxCaption').textContent = photo.caption;
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

function navigateLightbox(direction) {
    currentPhoto += direction;
    if (currentPhoto < 0) currentPhoto = filteredPhotos.length - 1;
    if (currentPhoto >= filteredPhotos.length) currentPhoto = 0;
    
    const photo = filteredPhotos[currentPhoto];
    document.getElementById('lightboxImage').src = `images/${photo.filename}`;
    document.getElementById('lightboxCaption').textContent = photo.caption;
}

// === MEMORY TIMELINE ===
function loadTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    CONFIG.timeline.forEach((event, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.style.animationDelay = `${index * 0.2}s`;
        
        let imageHTML = '';
        if (event.image) {
            imageHTML = `<img src="images/${event.image}" alt="${event.title}" class="timeline-image">`;
        }
        
        item.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <p class="timeline-date">${event.date}</p>
                <h3 class="timeline-title">${event.title}</h3>
                <p class="timeline-description">${event.description}</p>
                ${imageHTML}
            </div>
        `;
        timeline.appendChild(item);
    });
}

// === REASONS I LOVE YOU ===
function loadReasons() {
    const grid = document.getElementById('reasonsGrid');
    grid.innerHTML = '';
    
    CONFIG.reasons.forEach((reason, index) => {
        const card = document.createElement('div');
        card.className = 'reason-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="reason-front">
                <span class="reason-number">${index + 1}</span>
                <div class="reason-icon">💜</div>
                <p class="reason-short">${reason.short}</p>
            </div>
            <div class="reason-back">
                <p class="reason-long">${reason.long}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// === MUSIC PLAYER ===
function loadMusicPlayer() {
    renderPlaylist();
    
    // Player controls
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('prevBtn').addEventListener('click', () => changeSong(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changeSong(1));
    
    // Volume control
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', function() {
        if (audioPlayer) {
            audioPlayer.volume = this.value / 100;
            localStorage.setItem('volume', this.value);
        }
    });
    
    // Load saved volume
    const savedVolume = localStorage.getItem('volume') || 70;
    volumeSlider.value = savedVolume;
    if (audioPlayer) audioPlayer.volume = savedVolume / 100;
    
    // Progress bar
    const progressBar = document.getElementById('progressBar');
    progressBar.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audioPlayer && audioPlayer.duration) {
            audioPlayer.currentTime = audioPlayer.duration * percent;
        }
    });
    
    // Audio player events
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', () => changeSong(1));
    }
}

function renderPlaylist() {
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = '';
    
    CONFIG.playlist.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentSong) item.classList.add('active');
        item.innerHTML = `
            <div class="playlist-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <span class="playlist-icon">🎵</span>
        `;
        item.addEventListener('click', () => playSong(index));
        playlist.appendChild(item);
    });
}

function playSong(index) {
    currentSong = index;
    const song = CONFIG.playlist[index];
    
    // Update UI
    document.getElementById('songTitle').textContent = song.title;
    document.getElementById('songArtist').textContent = song.artist;
    document.getElementById('songMessage').textContent = song.message;
    
    // Update playlist active state
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Play audio
    audioPlayer.src = `sounds/${song.filename}`;
    audioPlayer.play();
    
    // Update vinyl animation
    document.getElementById('vinylRecord').classList.add('spinning');
    document.getElementById('vinylArm').classList.add('playing');
    document.getElementById('playBtn').textContent = '⏸';
}

function togglePlay() {
    if (!audioPlayer.src) {
        playSong(0);
        return;
    }
    
    if (audioPlayer.paused) {
        audioPlayer.play();
        document.getElementById('vinylRecord').classList.add('spinning');
        document.getElementById('vinylArm').classList.add('playing');
        document.getElementById('playBtn').textContent = '⏸';
    } else {
        audioPlayer.pause();
        document.getElementById('vinylRecord').classList.remove('spinning');
        document.getElementById('vinylArm').classList.remove('playing');
        document.getElementById('playBtn').textContent = '▶';
    }
}

function changeSong(direction) {
    currentSong += direction;
    if (currentSong < 0) currentSong = CONFIG.playlist.length - 1;
    if (currentSong >= CONFIG.playlist.length) currentSong = 0;
    playSong(currentSong);
}

function updateProgress() {
    if (!audioPlayer.duration) return;
    
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.getElementById('progressFill').style.width = percent + '%';
    
    document.getElementById('timeCurrent').textContent = formatTime(audioPlayer.currentTime);
    document.getElementById('timeTotal').textContent = formatTime(audioPlayer.duration);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// === QUIZ ===
function loadQuiz() {
    renderQuizQuestion();
    
    document.getElementById('playAgainBtn').addEventListener('click', resetQuiz);
}

function renderQuizQuestion() {
    if (currentQuizQuestion >= CONFIG.quiz.questions.length) {
        showQuizResults();
        return;
    }
    
    const question = CONFIG.quiz.questions[currentQuizQuestion];
    
    // Update progress
    const progress = ((currentQuizQuestion + 1) / CONFIG.quiz.questions.length) * 100;
    document.getElementById('quizProgress').style.width = progress + '%';
    document.getElementById('quizProgressText').textContent = 
        `Question ${currentQuizQuestion + 1} of ${CONFIG.quiz.questions.length}`;
    
    // Display question
    document.getElementById('quizQuestion').textContent = question.question;
    
    // Display options
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.addEventListener('click', () => checkAnswer(index));
        optionsContainer.appendChild(btn);
    });
    
    // Clear feedback
    document.getElementById('quizFeedback').textContent = '';
}

function checkAnswer(selectedIndex) {
    const question = CONFIG.quiz.questions[currentQuizQuestion];
    const buttons = document.querySelectorAll('.option-btn');
    
    if (selectedIndex === question.correct) {
        // Correct answer
        buttons[selectedIndex].classList.add('correct');
        document.getElementById('quizFeedback').textContent = '✓ Correct! ' + question.funFact;
        quizScore++;
        triggerConfetti();
        
        setTimeout(() => {
            currentQuizQuestion++;
            renderQuizQuestion();
        }, 2000);
    } else {
        // Wrong answer
        buttons[selectedIndex].classList.add('wrong');
        document.getElementById('quizFeedback').textContent = '✗ Try again!';
        
        setTimeout(() => {
            buttons[selectedIndex].classList.remove('wrong');
            document.getElementById('quizFeedback').textContent = '';
        }, 1000);
    }
}

function showQuizResults() {
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    
    const percentage = (quizScore / CONFIG.quiz.questions.length) * 100;
    
    document.getElementById('finalScore').textContent = quizScore;
    document.getElementById('totalQuestions').textContent = CONFIG.quiz.questions.length;
    
    // Show hearts based on score
    const heartsContainer = document.getElementById('scoreHearts');
    heartsContainer.innerHTML = '💜'.repeat(Math.ceil(percentage / 20));
    
    // Show message based on score
    let message;
    if (percentage === 100) message = CONFIG.quiz.scoreMessages.perfect;
    else if (percentage >= 70) message = CONFIG.quiz.scoreMessages.high;
    else if (percentage >= 50) message = CONFIG.quiz.scoreMessages.medium;
    else message = CONFIG.quiz.scoreMessages.low;
    
    document.getElementById('resultsMessage').textContent = message;
    document.getElementById('resultsTitle').textContent = 
        percentage === 100 ? 'Perfect Score!' : 'Great Job!';
    
    triggerConfetti();
    
    // Save high score
    const highScore = localStorage.getItem('quizHighScore') || 0;
    if (quizScore > highScore) {
        localStorage.setItem('quizHighScore', quizScore);
    }
}

function resetQuiz() {
    currentQuizQuestion = 0;
    quizScore = 0;
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    renderQuizQuestion();
}

// === COUNTDOWN TIMERS ===
function loadCountdowns() {
    const grid = document.getElementById('countdownsGrid');
    grid.innerHTML = '';
    
    CONFIG.countdowns.forEach((countdown, index) => {
        const card = document.createElement('div');
        card.className = 'countdown-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.dataset.date = countdown.date;
        card.dataset.message = countdown.message;
        card.innerHTML = `
            <h3 class="countdown-event">${countdown.event}</h3>
            <div class="countdown-timer">
                <div class="countdown-unit">
                    <span class="countdown-number" data-type="days">0</span>
                    <span class="countdown-label">Days</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-number" data-type="hours">0</span>
                    <span class="countdown-label">Hours</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-number" data-type="minutes">0</span>
                    <span class="countdown-label">Mins</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-number" data-type="seconds">0</span>
                    <span class="countdown-label">Secs</span>
                </div>
            </div>
            <p class="countdown-message">${countdown.message}</p>
        `;
        grid.appendChild(card);
    });
    
    updateCountdowns();
}

function updateCountdowns() {
    const cards = document.querySelectorAll('.countdown-card');
    
    cards.forEach(card => {
        const targetDate = new Date(card.dataset.date).getTime();
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            // Countdown finished - celebrate!
            card.classList.add('celebrating');
            card.querySelector('.countdown-message').textContent = '🎉 ' + card.dataset.message;
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        card.querySelector('[data-type="days"]').textContent = days;
        card.querySelector('[data-type="hours"]').textContent = hours.toString().padStart(2, '0');
        card.querySelector('[data-type="minutes"]').textContent = minutes.toString().padStart(2, '0');
        card.querySelector('[data-type="seconds"]').textContent = seconds.toString().padStart(2, '0');
    });
}

// === MESSAGE BOARD ===
function loadMessages() {
    filteredMessages = [...CONFIG.messages];
    renderMessages();
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('#messageFilters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            if (filter === 'all') {
                filteredMessages = [...CONFIG.messages];
            } else {
                filteredMessages = CONFIG.messages.filter(msg => msg.category === filter);
            }
            renderMessages();
        });
    });
}

function renderMessages() {
    const grid = document.getElementById('messagesGrid');
    grid.innerHTML = '';
    
    filteredMessages.forEach((message, index) => {
        const note = document.createElement('div');
        note.className = `sticky-note ${message.color} ${message.size}`;
        note.style.animationDelay = `${index * 0.1}s`;
        note.textContent = message.text;
        grid.appendChild(note);
    });
}

// === GIFT BOX ===
function loadGifts() {
    renderGifts();
    
    document.getElementById('resetGiftsBtn').addEventListener('click', function() {
        localStorage.removeItem('openedGifts');
        renderGifts();
    });
    
    // Gift modal close
    document.getElementById('giftModalClose').addEventListener('click', closeGiftModal);
    document.getElementById('giftModal').addEventListener('click', function(e) {
        if (e.target === this) closeGiftModal();
    });
}

function renderGifts() {
    const grid = document.getElementById('giftsGrid');
    grid.innerHTML = '';
    
    const openedGifts = JSON.parse(localStorage.getItem('openedGifts') || '[]');
    
    CONFIG.gifts.forEach((gift, index) => {
        const box = document.createElement('div');
        box.className = 'gift-box';
        box.style.animationDelay = `${index * 0.1}s`;
        box.textContent = openedGifts.includes(index) ? '✨' : '🎁';
        
        if (openedGifts.includes(index)) {
            box.classList.add('opened');
        }
        
        box.addEventListener('click', () => openGift(index));
        grid.appendChild(box);
    });
}

function openGift(index) {
    const gift = CONFIG.gifts[index];
    const openedGifts = JSON.parse(localStorage.getItem('openedGifts') || '[]');
    
    if (!openedGifts.includes(index)) {
        openedGifts.push(index);
        localStorage.setItem('openedGifts', JSON.stringify(openedGifts));
    }
    
    // Show gift content in modal
    const reveal = document.getElementById('giftReveal');
    
    if (gift.type === 'photo') {
        reveal.innerHTML = `
            <h2>🎉 Surprise!</h2>
            <p>${gift.message}</p>
            <img src="images/${gift.filename}" alt="Gift photo">
        `;
    } else {
        let emoji = '💜';
        if (gift.type === 'promise') emoji = '🤝';
        else if (gift.type === 'date') emoji = '📅';
        
        reveal.innerHTML = `
            <h2>${emoji} ${gift.type.charAt(0).toUpperCase() + gift.type.slice(1)}!</h2>
            <p>${gift.content}</p>
        `;
    }
    
    document.getElementById('giftModal').classList.remove('hidden');
    triggerConfetti();
    renderGifts(); // Update gift display
}

function closeGiftModal() {
    document.getElementById('giftModal').classList.add('hidden');
}

// === LOVE COUPONS ===
function loadCoupons() {
    filteredCoupons = [...CONFIG.coupons];
    renderCoupons();
    updateCouponCounter();
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('#couponFilters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            const savedCoupons = JSON.parse(localStorage.getItem('coupons') || JSON.stringify(CONFIG.coupons));
            
            if (filter === 'all') {
                filteredCoupons = savedCoupons;
            } else if (filter === 'available') {
                filteredCoupons = savedCoupons.filter(c => !c.redeemed);
            } else {
                filteredCoupons = savedCoupons.filter(c => c.redeemed);
            }
            
            currentCoupon = 0;
            renderCoupons();
        });
    });
    
    // Slider navigation
    document.getElementById('couponPrev').addEventListener('click', () => navigateCoupon(-1));
    document.getElementById('couponNext').addEventListener('click', () => navigateCoupon(1));
    
    // Redeem modal
    document.getElementById('redeemConfirm').addEventListener('click', confirmRedeem);
    document.getElementById('redeemCancel').addEventListener('click', closeRedeemModal);
    document.getElementById('redeemModal').addEventListener('click', function(e) {
        if (e.target === this) closeRedeemModal();
    });
}

function renderCoupons() {
    const container = document.getElementById('couponsContainer');
    container.innerHTML = '';
    
    if (filteredCoupons.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">No coupons in this category</p>';
        return;
    }
    
    const coupon = filteredCoupons[currentCoupon];
    const card = document.createElement('div');
    card.className = 'coupon-card';
    if (coupon.redeemed) card.classList.add('redeemed');
    
    let expiryHTML = '';
    if (coupon.expiry) {
        expiryHTML = `<p class="coupon-expiry">Valid until: ${formatDate(coupon.expiry)}</p>`;
    }
    
    card.innerHTML = `
        <h3 class="coupon-title">${coupon.title}</h3>
        <p class="coupon-description">${coupon.description}</p>
        ${expiryHTML}
        <button class="coupon-redeem" ${coupon.redeemed ? 'disabled' : ''}>
            ${coupon.redeemed ? 'Already Redeemed' : 'Redeem Now'}
        </button>
    `;
    
    if (!coupon.redeemed) {
        card.querySelector('.coupon-redeem').addEventListener('click', () => initRedeem(currentCoupon));
    }
    
    container.appendChild(card);
}

function navigateCoupon(direction) {
    currentCoupon += direction;
    if (currentCoupon < 0) currentCoupon = filteredCoupons.length - 1;
    if (currentCoupon >= filteredCoupons.length) currentCoupon = 0;
    renderCoupons();
}

function initRedeem(index) {
    document.getElementById('redeemCouponTitle').textContent = filteredCoupons[index].title;
    document.getElementById('redeemModal').classList.remove('hidden');
    document.getElementById('redeemModal').dataset.couponIndex = index;
}

function confirmRedeem() {
    const index = parseInt(document.getElementById('redeemModal').dataset.couponIndex);
    const savedCoupons = JSON.parse(localStorage.getItem('coupons') || JSON.stringify(CONFIG.coupons));
    
    // Find the actual coupon in saved coupons
    const couponTitle = filteredCoupons[index].title;
    const actualIndex = savedCoupons.findIndex(c => c.title === couponTitle);
    
    if (actualIndex !== -1) {
        savedCoupons[actualIndex].redeemed = true;
        localStorage.setItem('coupons', JSON.stringify(savedCoupons));
        filteredCoupons[index].redeemed = true;
    }
    
    closeRedeemModal();
    renderCoupons();
    updateCouponCounter();
    triggerConfetti();
}

function closeRedeemModal() {
    document.getElementById('redeemModal').classList.add('hidden');
}

function updateCouponCounter() {
    const savedCoupons = JSON.parse(localStorage.getItem('coupons') || JSON.stringify(CONFIG.coupons));
    const available = savedCoupons.filter(c => !c.redeemed).length;
    const total = savedCoupons.length;
    
    document.getElementById('couponsCounter').textContent = 
        `${available} of ${total} coupons available`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// === FOOTER ===
function loadFooter() {
    document.getElementById('footerMessage').textContent = CONFIG.footer.message;
    document.getElementById('footerName').textContent = CONFIG.site.girlfriendName;
    document.getElementById('footerDate').textContent = CONFIG.footer.dateCreated;
    
    // Easter egg - click heart for confetti
    document.getElementById('footerHeart').addEventListener('click', triggerConfetti);
}

// === FLOATING HEARTS ===
function initFloatingHearts() {
    const container = document.getElementById('heartsContainer');
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = '💜';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 3 + 5) + 's';
        heart.style.fontSize = (Math.random() * 10 + 15) + 'px';
        container.appendChild(heart);
        
        setTimeout(() => heart.remove(), 8000);
    }, 1000);
}

// === SPARKLE TRAIL ===
function initSparkleTrail() {
    const canvas = document.getElementById('sparkleCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const sparkles = [];
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    document.addEventListener('mousemove', (e) => {
        sparkles.push({
            x: e.clientX,
            y: e.clientY,
            size: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            life: 1
        });
    });
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = sparkles.length - 1; i >= 0; i--) {
            const s = sparkles[i];
            
            ctx.fillStyle = `rgba(139, 92, 246, ${s.life})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            
            s.x += s.speedX;
            s.y += s.speedY;
            s.life -= 0.02;
            s.size *= 0.97;
            
            if (s.life <= 0) {
                sparkles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// === SCROLL EFFECTS ===
function initScrollEffects() {
    // Scroll to top button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Fade in sections on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// === NAVIGATION DOTS ===
function initNavigationDots() {
    const sections = document.querySelectorAll('section[id]');
    const dots = document.querySelectorAll('.nav-dots .dot');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        dots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.dataset.section === current) {
                dot.classList.add('active');
            }
        });
    });
}

// === CONFETTI EFFECT ===
function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#8B5CF6', '#C4B5FD', '#A78BFA', '#F0ABFC'];
    
    for (let i = 0; i < 100; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let stillFalling = false;
        
        confetti.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation * Math.PI / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
            ctx.restore();
            
            c.y += c.speedY;
            c.x += c.speedX;
            c.rotation += c.rotationSpeed;
            
            if (c.y < canvas.height) {
                stillFalling = true;
            }
        });
        
        if (stillFalling) {
            requestAnimationFrame(animateConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animateConfetti();
}

// === LOCAL STORAGE ===
function loadSavedData() {
    // Load saved coupons
    const savedCoupons = localStorage.getItem('coupons');
    if (!savedCoupons) {
        localStorage.setItem('coupons', JSON.stringify(CONFIG.coupons));
    }
}

// === EASTER EGG ===
let keySequence = '';
document.addEventListener('keypress', (e) => {
    keySequence += e.key.toLowerCase();
    if (keySequence.includes('iloveyou')) {
        triggerConfetti();
        keySequence = '';
    }
    if (keySequence.length > 20) {
        keySequence = keySequence.slice(-20);
    }
});
