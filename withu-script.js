// Ocean Quiz - Simplified JavaScript
// Clean and simple implementation

let userName = '';
let currentStep = 0;
let currentQuestion = 0;
let answers = {};
let musicPlaying = false;

// Variabel DOM untuk elemen yang sering diakses (Perlu didefinisikan di HTML)
const DOMElements = {};

// Simple quiz questions
const questions = [
    {
        question: "Apa kesan pertama kamu tentang Zaid?",
        options: [
            "Orangnya ramah dan baik hati",
            "Keliatan cool dan tenang",
            "Lucu dan menghibur",
            "Pendiam tapi menarik"
        ]
    },
    {
        question: "Kalau Zaid jadi teman, aktivitas apa yang cocok?",
        options: [
            "Ngobrol santai di kafe",
            "Main game atau nonton film",
            "Jalan-jalan ke tempat baru",
            "Belajar hal menarik bareng"
        ]
    },
    {
        question: "Menurut kamu, Zaid tipe orang yang...",
        options: [
            "Bisa dipercaya dan loyal",
            "Kreatif dan imajinatif",
            "Ceria dan positif",
            "Bijak dan dewasa"
        ]
    },
    {
        question: "Kalau Zaid lagi down, apa yang akan kamu lakukan?",
        options: [
            "Dengarkan ceritanya dengan sabar",
            "Coba hibur dengan candaan",
            "Kasih dukungan moral",
            "Ajak dia refreshing"
        ]
    },
    {
        question: "Yang paling kamu apresiasi dari Zaid?",
        options: [
            "Cara dia peduli sama orang lain",
            "Sense of humor yang unik",
            "Kepribadian yang asli",
            "Sikap yang humble"
        ]
    }
];

// Discord webhook - GANTI dengan URL webhook Anda
const webhookUrl = 'https://discord.com/api/webhooks/1424436525076316233/oSV_aBMSWSxnt87HTp-nSMB2wfVkcHEEnmPGaSxk64R1dK0l9rP8N6AToJvmrKDfJqh0';

// ====================================================================
// Inisialisasi & Setup
// ====================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Ocean Quiz starting...');

    // Ambil semua elemen DOM yang dibutuhkan
    DOMElements.loadingScreen = document.getElementById('loading-screen');
    DOMElements.progress = document.getElementById('progress');
    DOMElements.nameModal = document.getElementById('name-modal');
    DOMElements.confirmModal = document.getElementById('confirm-modal');
    DOMElements.mainContent = document.getElementById('main-content');
    DOMElements.storySection = document.getElementById('story-section');
    DOMElements.quizSection = document.getElementById('quiz-section');
    DOMElements.finalSection = document.getElementById('final-section');
    DOMElements.errorModal = document.getElementById('error-modal'); // Asumsi ada elemen ini
    DOMElements.successModal = document.getElementById('success-modal'); // Asumsi ada elemen ini

    // Buat bubbles (efek visual)
    createBubbles();

    // Tampilkan loading screen
    showLoading();

    // Setup event listeners
    setupEvents();
});

function setupEvents() {
    // Name form
    document.getElementById('name-form').addEventListener('submit', handleNameSubmit);

    // Confirmation buttons
    document.getElementById('confirm-yes').addEventListener('click', () => handleConfirm(true));
    document.getElementById('confirm-no').addEventListener('click', () => handleConfirm(false));

    // Story buttons
    document.getElementById('story-yes').addEventListener('click', () => handleStoryChoice('yes'));
    document.getElementById('story-no').addEventListener('click', () => handleStoryChoice('no'));

    // Final submit
    document.getElementById('submit-final').addEventListener('click', handleFinalSubmit);

    // Error close
    document.getElementById('close-error')?.addEventListener('click', hideError);

    // Word count
    document.getElementById('final-opinion')?.addEventListener('input', updateWordCount);

    // Music toggle
    document.getElementById('music-btn')?.addEventListener('click', toggleMusic);
}

// ====================================================================
// Alur Quiz
// ====================================================================

function handleNameSubmit(e) {
    e.preventDefault();

    const input = document.getElementById('user-name');
    userName = input.value.trim();

    if (!userName) {
        showError('Please enter your name!');
        return;
    }

    DOMElements.nameModal.style.display = 'none';
    showConfirmModal();
}

function showConfirmModal() {
    document.getElementById('name-display').textContent = userName;
    DOMElements.confirmModal.style.display = 'flex';
}

function handleConfirm(confirmed) {
    if (!confirmed) {
        showError('Come on, it\'ll be fun! Please try it? 😊');
        return;
    }

    DOMElements.confirmModal.style.display = 'none';
    startMainContent();
}

function startMainContent() {
    DOMElements.mainContent.style.display = 'block';
    startMusic();
    currentStep = 1; // Pindah dari modal ke konten utama
    updateProgress();
    showStory();
}

function handleStoryChoice(choice) {
    if (choice === 'no') {
        updateCharacter('marah');
        showError('nda bisa wleeee😊');
        return;
    }

    currentStep++;
    updateProgress();
    updateCharacter('baik');

    DOMElements.storySection.style.display = 'none';
    showQuiz();
}

function showQuiz() {
    document.getElementById('user-name-quiz').textContent = userName;
    DOMElements.quizSection.style.display = 'block';
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        finishQuiz();
        return;
    }

    const question = questions[currentQuestion];
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const counter = document.getElementById('question-counter');

    questionText.textContent = question.question;
    counter.textContent = `${currentQuestion + 1}/${questions.length}`;

    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.textContent = option;
        button.onclick = () => selectOption(index, option, button);
        optionsContainer.appendChild(button);
    });
}

function selectOption(index, text, button) {
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    button.classList.add('selected');

    answers[`question_${currentQuestion + 1}`] = {
        question: questions[currentQuestion].question,
        answer: text,
        index: index
    };

    setTimeout(() => {
        currentQuestion++;
        currentStep++;
        updateProgress();
        showQuestion();
    }, 1000);
}

function finishQuiz() {
    DOMElements.quizSection.style.display = 'none';
    DOMElements.finalSection.style.display = 'block';
    currentStep++;
    updateProgress();
    updateWordCount(); // Inisialisasi hitungan kata saat tampilan akhir muncul
}

function handleFinalSubmit() {
    const opinion = document.getElementById('final-opinion').value.trim();

    if (opinion === '') {
        showError('Please share your thoughts!');
        return;
    }

    const wordCountValue = countWords(opinion);
    if (wordCountValue < 50) {
        showError('Please write at least 50 words.');
        return;
    }

    // Compile data
    const data = {
        userName: userName,
        answers: answers,
        finalOpinion: opinion,
        wordCount: wordCountValue,
        timestamp: new Date().toISOString()
    };

    submitData(data);
}

// ====================================================================
// Tampilan & Utilities
// ====================================================================

function updateProgress() {
    const steps = questions.length + 3; // Name + Confirm + Story + Questions + Final = 1 + 1 + 1 + 5 + 1 = 9
    // Karena currentStep dimulai dari 0 (sebelum content), kita gunakan currentStep
    const totalProgress = questions.length + 2; // Total langkah yang dihitung di progress bar: Story (1) + Quiz (5) + Final (1) = 7
    const currentProgress = currentStep;

    document.getElementById('step-counter').textContent = `Step ${currentProgress} of ${totalProgress}`;
    document.getElementById('progress-track').style.width = ((currentProgress / totalProgress) * 100) + '%';
}

function showStory() {
    const storyText = document.getElementById('story-text');
    const storyTexts = [
        `Hai ${userName}! ehhh kamoh tau ga? 🤔, Griya cataniaaaa perum cantik cakeppp, hai, selamat malam iranaa yang (ntik)
            Eh Iyah maap ya Allah🙏,
        'Yahhh yennn kita beneran cuti dinas selama 1 bulan niee yennn?? hohoho ahmassaaa asekkkk berani nie yennn?',
        'Yesssssssss🤩🤩🤩🤩, akhirnyah waktu yang Zaid tunggu tunggu, asekkk terwujud jugaa euyyy hohoho 🤪, anuu yenn Zaid hehehe Nda enak euy sama kamoh😅 dari kemaren kemaren gimana yahh jujurr Zaid juga ngerasa "aduh gw kalau ngobrol yapping yapping terus kaya gini tiap hari mah aduhh Iran ke ganggu ga yah?,ohhh iyahh orang mahhh harusnya kita liat sikonn sikon iddd, misal kita disekolah nihh kita  lagi santai nihh nda ada pr, Iran juga lagi mood asik lucu seru🤩 nahh baruuu dehh kita yapping yapping idd beuhh kita bercandain Iran deh nanti🤩" awokawok eh Iyah maap nahh iyahh mungkin Zaid kurang dewasa ajah kali lah yah shap shapp kami akan evaluasi lagi bossskuhh 🤗, maaf yah ran😅',
        Namanya Zaid. Dia tuh orangnya menarik, kadang serius kadang santai.🤩✨
        kami penasaran sama pendapat kamu tentang dia.🤩✨v
        Tolong kami untuk  mengisi survey singkat tentang dia yah🤩✨
        dan ketidaksengajaan bersama mu lah, hidupku mendapat lebih banyak pelajaran, arti dari kehilangan, dan kasih yang harus tetap dicurahkan untuk orang2 disekitar kita, Terima Kasih ya Ketidasengajaan, kamu sudah mendapat tempat terbaik dalam hatiku, namun harus terpisah kan keyakinan, maaf ya ketidaksengajaan, karena aku masih megharapkan ketidakserngajaanmu itu kembali kedalam hari2 berat ku..
    ];
    let textIndex = 0;

    function showNextText() {
        if (textIndex >= storyTexts.length) {
            document.getElementById('story-actions').style.display = 'flex';
            return;
        }

        const text = storyTexts[textIndex]; // ${userName} sudah terisi
        typeText(storyText, text, () => {
            textIndex++;
            setTimeout(() => {
                storyText.textContent = '';
                showNextText();
            }, 1500);
        });
    }

    showNextText();
}

function typeText(element, text, callback) {
    element.textContent = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, 50);
        } else if (callback) {
            callback();
        }
    }

    type();
}

function updateWordCount() {
    const textarea = document.getElementById('final-opinion');
    const counter = document.getElementById('word-count');
    const submitBtn = document.getElementById('submit-final');

    const text = textarea.value.trim();
    const wordCount = countWords(text);

    counter.textContent = wordCount;

    if (wordCount >= 50) {
        submitBtn.disabled = false;
        counter.style.color = 'green';
    } else {
        submitBtn.disabled = true;
        counter.style.color = 'red';
    }
}

function countWords(text) {
    // Regex untuk memecah string berdasarkan spasi dan menghilangkan elemen kosong
    return text === '' ? 0 : text.split(/\s+/).length;
}

// ====================================================================
// Discord Submission
// ====================================================================

function submitData(data) {
    console.log('Submitting data:', data);

    if (webhookUrl.includes('YOUR_WEBHOOK_URL')) {
        console.warn('Discord Webhook URL belum dikonfigurasi. Data tidak akan dikirim.');
        showSuccessMessage();
        return;
    }

    // Buat embed untuk Discord
    const embed = {
        title: '📊 Hasil Survey Zaid',
        description: `Survey diselesaikan oleh **${data.userName}**`,
        color: 0x667eea, // Biru keunguan
        fields: [],
        timestamp: data.timestamp
    };

    // Tambahkan jawaban quiz
    Object.values(data.answers).forEach((qa, index) => {
        embed.fields.push({
            name: `Q${index + 1}: ${qa.question}`,
            value: `📝 ${qa.answer}`,
            inline: false
        });
    });

    // Tambahkan pendapat akhir
    embed.fields.push({
        name: '💭 Pendapat Akhir',
        value: data.finalOpinion.substring(0, 1024), // Discord field value max 1024 chars
        inline: false
    });

    const payload = {
        content: `🎉 **Data Baru dari Survey Zaid!** 🎉`,
        embeds: [embed]
    };

    // Kirim ke Discord
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    }).then(response => {
        if (response.ok) {
            console.log('Data sent to Discord successfully');
        } else {
            console.error('Discord webhook error:', response.status);
        }
        showSuccessMessage(); // Tampilkan sukses terlepas dari hasil webhook
    }).catch(error => {
        console.error('Discord webhook error:', error);
        showSuccessMessage(); // Tampilkan sukses terlepas dari error
    });
}

// ====================================================================
// Fungsi Placeholder (Perlu implementasi di HTML/CSS)
// ====================================================================

function showLoading() {
    DOMElements.loadingScreen.style.display = 'flex';
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 15;
        if (width >= 100) {
            width = 100;
            clearInterval(interval);
            setTimeout(() => {
                DOMElements.loadingScreen.style.display = 'none';
                showNameModal();
            }, 500);
        }
        DOMElements.progress.style.width = width + '%';
    }, 150);
}

function showNameModal() {
    DOMElements.nameModal.style.display = 'flex';
}

function createBubbles() {
    const container = document.getElementById('bubbles');
    if (!container) return; // Pastikan elemen ada

    setInterval(() => {
        if (Math.random() < 0.1) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble'; // Membutuhkan CSS untuk '.bubble'
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.width = bubble.style.height = (Math.random() * 30 + 10) + 'px';
            bubble.style.animationDuration = (Math.random() * 3 + 5) + 's';
            container.appendChild(bubble);

            setTimeout(() => {
                bubble.remove();
            }, 8000);
        }
    }, 1000);
}

function startMusic() {
    // TODO: Implementasi logika musik (misalnya: menggunakan elemen <audio>)
    // musicPlaying = true;
    console.log('Music started (Placeholder)');
}

function toggleMusic() {
    // TODO: Implementasi logika toggle musik
    musicPlaying = !musicPlaying;
    console.log(`Music is now ${musicPlaying ? 'playing' : 'stopped'} (Placeholder)`);
}

function updateCharacter(emotion) {
    // TODO: Implementasi logika untuk mengganti tampilan karakter Zaid
    console.log(`Character updated to: ${emotion} (Placeholder)`);
}

function showError(message) {
    // TODO: Tampilkan modal atau popup error dengan pesan
    if (DOMElements.errorModal) {
        document.getElementById('error-text').textContent = message;
        DOMElements.errorModal.style.display = 'flex';
    } else {
        alert('Error: ' + message);
    }
}

function hideError() {
    if (DOMElements.errorModal) {
        DOMElements.errorModal.style.display = 'none';
    }
}

function showSuccessMessage() {
    DOMElements.finalSection.style.display = 'none';
    if (DOMElements.successModal) {
        DOMElements.successModal.style.display = 'block';
        createConfetti();
    } else {
        alert('Terima kasih! Survey berhasil disubmit.');
    }
}

function createConfetti() {
    // Kode confetti sama dengan kode awal Anda, pastikan berjalan lancar
    const colors = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            // ... (Kode styling dan animasi confetti)
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            
            document.body.appendChild(confetti);
            
            confetti.animate([
                { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 100}px) rotate(720deg)`, opacity: 0 }
            ], {
                duration: 3000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                confetti.remove();
            };
        }, i * 100);
    }
}

// Fungsi Utility lainnya (debounce, parallax, contextmenu, keydown)
// (Dibiarkan sama, asumsikan elemen seperti '.bird' sudah ada di HTML)

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('mousemove', debounce((e) => {
    const birds = document.querySelectorAll('.bird');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    birds.forEach((bird, index) => {
        const speed = (index + 1) * 0.02;
        bird.style.transform = `translate(${mouseX * speed * 50}px, ${mouseY * speed * 50}px)`;
    });
}, 16));

document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Asumsi errorPopup sama dengan DOMElements.errorModal
        if (DOMElements.errorModal && DOMElements.errorModal.style.display === 'flex') {
            hideError();
        }
    }
});

