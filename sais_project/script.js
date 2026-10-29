/* =========================================
   SAIS/FOLIO — JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 1. LOADING SCREEN
    // =====================================
    const loader = document.getElementById("loader");
    let loaderHidden = false;

    function hideLoader() {
        if (!loader || loaderHidden) return;

        loaderHidden = true;
        loader.classList.add("loader-hidden");

        setTimeout(() => {
            loader.style.display = "none";
        }, 550);
    }

    window.addEventListener("load", hideLoader);
    setTimeout(hideLoader, 2500);


    // =====================================
    // 2. BACKGROUND STARS
    // =====================================
    const starsContainer = document.getElementById("stars");

    if (starsContainer) {
        for (let i = 0; i < 35; i++) {
            const star = document.createElement("span");

            star.className = "star";
            star.textContent = Math.random() > 0.5 ? "✦" : "·";

            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.fontSize = `${8 + Math.random() * 12}px`;
            star.style.animationDelay = `${Math.random() * 4}s`;
            star.style.animationDuration = `${2 + Math.random() * 4}s`;

            starsContainer.appendChild(star);
        }
    }


    // =====================================
    // 3. DARK / LIGHT MODE
    // =====================================
    const themeToggle = document.getElementById("themeToggle");

    function updateThemeIcon() {
        if (!themeToggle) return;

        const isLight = document.body.classList.contains("light-mode");

        themeToggle.innerHTML = isLight
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Switch to dark mode" : "Switch to light mode"
        );
    }

    try {
        const savedTheme = localStorage.getItem("sais-folio-theme");

        if (savedTheme === "light") {
            document.body.classList.add("light-mode");
        }
    } catch (error) {
        // The website still works if browser storage is unavailable.
    }

    updateThemeIcon();

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");

            try {
                const theme = document.body.classList.contains("light-mode")
                    ? "light"
                    : "dark";

                localStorage.setItem("sais-folio-theme", theme);
            } catch (error) {
                // Theme switching still works for the current page.
            }

            updateThemeIcon();
        });
    }


    // =====================================
    // 4. MOBILE NAVIGATION
    // =====================================
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("active");

            menuToggle.setAttribute("aria-expanded", String(isOpen));

            menuToggle.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");

                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }


    // =====================================
    // 5. ACTIVE NAVIGATION LINK
    // =====================================
    const sections = document.querySelectorAll("main section[id]");
    const navigationLinks = document.querySelectorAll(".nav-link");

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    navigationLinks.forEach((link) => {
                        const matches =
                            link.getAttribute("href") === `#${entry.target.id}`;

                        link.classList.toggle("active", matches);
                    });
                });
            },
            {
                rootMargin: "-25% 0px -60% 0px"
            }
        );

        sections.forEach((section) => sectionObserver.observe(section));
    }


    // =====================================
    // 6. SCROLL REVEAL ANIMATIONS
    // =====================================
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }


    // =====================================
    // 7. AUTOMATIC FOOTER YEAR
    // =====================================
    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // =====================================
    // GAME 1: MEMORY MATCH
    // =====================================
    const memoryBoard = document.getElementById("memoryBoard");
    const memoryMoves = document.getElementById("memoryMoves");
    const memoryMessage = document.getElementById("memoryMessage");
    const memoryReset = document.getElementById("memoryReset");

    if (memoryBoard) {
        const symbols = ["🌙", "⭐", "🎧", "🎮", "💎", "🌸"];
        let firstCard = null;
        let secondCard = null;
        let moves = 0;
        let matches = 0;
        let locked = false;
        let flipTimer = null;

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));

                [array[i], array[j]] = [array[j], array[i]];
            }

            return array;
        }

        function updateMemoryMoves() {
            if (memoryMoves) {
                memoryMoves.textContent = String(moves);
            }
        }

        function resetMemoryGame() {
            if (flipTimer !== null) {
                clearTimeout(flipTimer);
                flipTimer = null;
            }

            firstCard = null;
            secondCard = null;
            moves = 0;
            matches = 0;
            locked = false;

            updateMemoryMoves();

            if (memoryMessage) {
                memoryMessage.textContent = "Find all six matching pairs!";
            }

            memoryBoard.innerHTML = "";

            const shuffledSymbols = shuffleArray([...symbols, ...symbols]);

            shuffledSymbols.forEach((symbol, index) => {
                const card = document.createElement("button");

                card.type = "button";
                card.className = "memory-card";
                card.textContent = "?";
                card.dataset.symbol = symbol;

                card.setAttribute(
                    "aria-label",
                    `Hidden card ${index + 1}`
                );

                card.addEventListener("click", () => {
                    // Ignore clicks when the game is locked.
                    if (locked) return;

                    // Ignore cards already flipped or matched.
                    if (
                        card.classList.contains("flipped") ||
                        card.classList.contains("matched")
                    ) {
                        return;
                    }

                    card.classList.add("flipped");
                    card.textContent = symbol;
                    card.setAttribute("aria-label", symbol);

                    if (firstCard === null) {
                        firstCard = card;
                        return;
                    }

                    secondCard = card;
                    moves++;

                    updateMemoryMoves();

                    if (
                        firstCard.dataset.symbol ===
                        secondCard.dataset.symbol
                    ) {
                        firstCard.classList.add("matched");
                        secondCard.classList.add("matched");

                        firstCard.disabled = true;
                        secondCard.disabled = true;

                        firstCard = null;
                        secondCard = null;

                        matches++;

                        if (matches === symbols.length) {
                            if (memoryMessage) {
                                memoryMessage.textContent =
                                    `🎉 You won in ${moves} moves!`;
                            }
                        } else if (memoryMessage) {
                            memoryMessage.textContent = "Great match! Keep going!";
                        }

                        return;
                    }

                    locked = true;

                    if (memoryMessage) {
                        memoryMessage.textContent = "Not a match. Try again!";
                    }

                    flipTimer = setTimeout(() => {
                        if (firstCard) {
                            firstCard.classList.remove("flipped");
                            firstCard.textContent = "?";
                            firstCard.setAttribute(
                                "aria-label",
                                "Hidden memory card"
                            );
                        }

                        if (secondCard) {
                            secondCard.classList.remove("flipped");
                            secondCard.textContent = "?";
                            secondCard.setAttribute(
                                "aria-label",
                                "Hidden memory card"
                            );
                        }

                        firstCard = null;
                        secondCard = null;
                        locked = false;
                        flipTimer = null;

                        if (memoryMessage) {
                            memoryMessage.textContent =
                                "Find all six matching pairs!";
                        }
                    }, 850);
                });

                memoryBoard.appendChild(card);
            });
        }

        if (memoryReset) {
            memoryReset.addEventListener("click", resetMemoryGame);
        }

        resetMemoryGame();
    }


   // =====================================
// GAME 2: TYPING SPEED TEST
// =====================================
const typingDuration = document.getElementById("typingDuration");
const typingTime = document.getElementById("typingTime");
const typingWpm = document.getElementById("typingWpm");
const typingAccuracy = document.getElementById("typingAccuracy");
const typingText = document.getElementById("typingText");
const typingInput = document.getElementById("typingInput");
const typingStart = document.getElementById("typingStart");
const typingReset = document.getElementById("typingReset");
const typingMessage = document.getElementById("typingMessage");
const typingCorrect = document.getElementById("typingCorrect");
const typingErrors = document.getElementById("typingErrors");

if (
    typingDuration &&
    typingTime &&
    typingWpm &&
    typingAccuracy &&
    typingText &&
    typingInput &&
    typingStart &&
    typingReset &&
    typingMessage &&
    typingCorrect &&
    typingErrors
) {
    const typingPassages = [
        "Creativity begins when we are willing to explore new ideas and learn from our mistakes. Every small step helps us improve our skills and reach our goals.",

        "Teamwork makes a dream work because people can share their knowledge, support each other, and solve problems together. Cooperation helps everyone grow.",

        "Technology connects people and gives us new ways to express our ideas. With patience, practice, and curiosity, we can create meaningful projects.",

        "Success does not happen overnight. It takes effort, consistency, and a positive attitude to develop new skills and become better every day.",

        "Learning how to code teaches us to think carefully, solve problems, and turn creative ideas into something useful. Practice makes progress possible."
    ];

    let selectedPassage = "";
    let remainingSeconds = 60;
    let timerInterval = null;
    let testStarted = false;
    let testFinished = false;
    let startTime = null;

    function choosePassage() {
        const randomIndex = Math.floor(
            Math.random() * typingPassages.length
        );

        selectedPassage = typingPassages[randomIndex];
        typingText.textContent = selectedPassage;
    }

    function getTypingStats() {
        const typedText = typingInput.value;
        let correctCharacters = 0;
        let errors = 0;

        for (let i = 0; i < typedText.length; i++) {
            if (
                i < selectedPassage.length &&
                typedText[i] === selectedPassage[i]
            ) {
                correctCharacters++;
            } else {
                errors++;
            }
        }

        const elapsedSeconds = startTime
            ? Math.max((Date.now() - startTime) / 1000, 1)
            : 1;

        const elapsedMinutes = elapsedSeconds / 60;

        const wpm = Math.round(
            (typedText.length / 5) / elapsedMinutes
        );

        const accuracy = typedText.length > 0
            ? Math.round(
                (correctCharacters / typedText.length) * 100
            )
            : 100;

        return {
            correctCharacters,
            errors,
            wpm,
            accuracy
        };
    }

    function updateTypingStats() {
        const stats = getTypingStats();

        typingWpm.textContent = stats.wpm;
        typingAccuracy.textContent = `${stats.accuracy}%`;
        typingCorrect.textContent = stats.correctCharacters;
        typingErrors.textContent = stats.errors;

        // Highlight correct and incorrect typed characters.
        typingText.innerHTML = "";

        for (let i = 0; i < selectedPassage.length; i++) {
            const character = document.createElement("span");
            const expectedCharacter = selectedPassage[i];
            const typedCharacter = typingInput.value[i];

            character.textContent =
                expectedCharacter === " " ? "\u00A0" : expectedCharacter;

            if (typedCharacter !== undefined) {
                if (typedCharacter === expectedCharacter) {
                    character.classList.add("correct-character");
                } else {
                    character.classList.add("incorrect-character");
                }
            } else if (i === typingInput.value.length) {
                character.classList.add("current-character");
            }

            typingText.appendChild(character);
        }
    }

    function stopTypingTest() {
        clearInterval(timerInterval);
        timerInterval = null;

        testStarted = false;
        testFinished = true;

        typingInput.disabled = true;
        typingDuration.disabled = false;
        typingStart.disabled = false;

        typingStart.innerHTML =
            '<i class="fa-solid fa-rotate-right"></i> Try Again';

        updateTypingStats();

        const stats = getTypingStats();

        typingMessage.textContent =
            `Time's up! Your speed is ${stats.wpm} WPM with ${stats.accuracy}% accuracy.`;

        typingMessage.classList.add("typing-finished");
    }

    function startTypingTest() {
        clearInterval(timerInterval);

        remainingSeconds = Number(typingDuration.value) || 60;

        if (![60, 120].includes(remainingSeconds)) {
            remainingSeconds = 60;
        }

        choosePassage();

        typingInput.value = "";
        typingInput.disabled = false;
        typingDuration.disabled = true;

        typingTime.textContent = remainingSeconds;
        typingWpm.textContent = "0";
        typingAccuracy.textContent = "100%";
        typingCorrect.textContent = "0";
        typingErrors.textContent = "0";

        typingMessage.textContent = "Start typing the passage!";
        typingMessage.classList.remove("typing-finished");

        testStarted = true;
        testFinished = false;
        startTime = Date.now();

        typingStart.disabled = true;
        typingStart.innerHTML =
            '<i class="fa-solid fa-keyboard"></i> Test Running...';

        updateTypingStats();
        typingInput.focus();

        timerInterval = setInterval(() => {
            remainingSeconds--;

            typingTime.textContent = remainingSeconds;

            if (remainingSeconds <= 0) {
                remainingSeconds = 0;
                typingTime.textContent = "0";
                stopTypingTest();
            }
        }, 1000);
    }

    function resetTypingTest() {
        clearInterval(timerInterval);
        timerInterval = null;

        testStarted = false;
        testFinished = false;
        startTime = null;

        remainingSeconds = Number(typingDuration.value) || 60;

        typingTime.textContent = remainingSeconds;
        typingWpm.textContent = "0";
        typingAccuracy.textContent = "100%";
        typingCorrect.textContent = "0";
        typingErrors.textContent = "0";

        typingInput.value = "";
        typingInput.disabled = true;
        typingDuration.disabled = false;

        typingStart.disabled = false;
        typingStart.innerHTML =
            '<i class="fa-solid fa-play"></i> Start Test';

        typingMessage.textContent =
            "Choose a duration and press Start Test!";

        typingMessage.classList.remove("typing-finished");

        choosePassage();
        updateTypingStats();
    }

    typingStart.addEventListener("click", () => {
        if (testFinished) {
            resetTypingTest();
            startTypingTest();
        } else if (!testStarted) {
            startTypingTest();
        }
    });

    typingReset.addEventListener("click", resetTypingTest);

    typingDuration.addEventListener("change", () => {
        if (!testStarted) {
            remainingSeconds = Number(typingDuration.value) || 60;
            typingTime.textContent = remainingSeconds;
        }
    });

    typingInput.addEventListener("input", () => {
        if (!testStarted || testFinished) return;

        updateTypingStats();

        if (typingInput.value.length >= selectedPassage.length) {
            stopTypingTest();
        }
    });

    // Initialize the game.
    resetTypingTest();
}

    // =====================================
    // GAME 3: QUICK QUIZ
    // =====================================
    const quizProgress = document.getElementById("quizProgress");
    const quizQuestion = document.getElementById("quizQuestion");
    const quizOptions = document.getElementById("quizOptions");
    const quizMessage = document.getElementById("quizMessage");
    const quizScoreElement = document.getElementById("quizScore");
    const quizNext = document.getElementById("quizNext");

    if (
        quizProgress &&
        quizQuestion &&
        quizOptions &&
        quizMessage &&
        quizScoreElement &&
        quizNext
    ) {
        const questions = [
            {
                question: "Which language structures a webpage?",
                options: ["HTML", "Python", "SQL", "C++"],
                answer: 0
            },
            {
                question: "Which language is commonly used to style webpages?",
                options: ["Java", "CSS", "C#", "PHP"],
                answer: 1
            },
            {
                question: "Which language adds interactivity to webpages?",
                options: ["HTML only", "CSS only", "JavaScript", "XML"],
                answer: 2
            },
            {
                question: "How many members are in SAIS/FOLIO?",
                options: ["Four", "Five", "Six", "Eight"],
                answer: 2
            },
            {
                question: "What makes teamwork successful?",
                options: [
                    "Never sharing ideas",
                    "Cooperation and communication",
                    "Working against each other",
                    "Ignoring everyone's ideas"
                ],
                answer: 1
            }
        ];

        let currentQuestion = 0;
        let quizScore = 0;
        let answered = false;
        let quizFinished = false;

        function showQuizQuestion() {
            if (currentQuestion >= questions.length) {
                quizFinished = true;

                quizProgress.textContent = "Quiz completed!";
                quizQuestion.textContent =
                    `You scored ${quizScore} out of ${questions.length}!`;

                quizOptions.innerHTML = "";

                quizMessage.textContent =
                    quizScore === questions.length
                        ? "🏆 Perfect score! Amazing work!"
                        : "Thanks for playing! Try again to improve your score.";

                quizScoreElement.textContent =
                    `Final score: ${quizScore}/${questions.length}`;

                quizNext.disabled = false;
                quizNext.innerHTML =
                    '<i class="fa-solid fa-rotate-right"></i> Play Again';

                return;
            }

            const item = questions[currentQuestion];

            answered = false;

            quizProgress.textContent =
                `Question ${currentQuestion + 1} of ${questions.length}`;

            quizQuestion.textContent = item.question;
            quizOptions.innerHTML = "";
            quizMessage.textContent = "";

            quizScoreElement.textContent = `Score: ${quizScore}`;

            quizNext.disabled = true;
            quizNext.textContent = "Choose an answer first";

            item.options.forEach((option, index) => {
                const button = document.createElement("button");

                button.type = "button";
                button.className = "quiz-option";
                button.textContent = option;

                button.addEventListener("click", () => {
                    if (answered) return;

                    answered = true;

                    const optionButtons =
                        quizOptions.querySelectorAll(".quiz-option");

                    optionButtons.forEach((optionButton, optionIndex) => {
                        optionButton.disabled = true;

                        if (optionIndex === item.answer) {
                            optionButton.classList.add("correct");
                        }
                    });

                    if (index === item.answer) {
                        quizScore++;

                        button.classList.add("correct");
                        quizMessage.textContent = "✅ Correct answer!";
                    } else {
                        button.classList.add("incorrect");

                        quizMessage.textContent =
                            `❌ Not quite! The correct answer is ${item.options[item.answer]}.`;
                    }

                    quizScoreElement.textContent = `Score: ${quizScore}`;

                    quizNext.disabled = false;
                    quizNext.innerHTML =
                        currentQuestion === questions.length - 1
                            ? "See Results"
                            : 'Next Question <i class="fa-solid fa-arrow-right"></i>';
                });

                quizOptions.appendChild(button);
            });
        }

        quizNext.addEventListener("click", () => {
            if (quizFinished) {
                currentQuestion = 0;
                quizScore = 0;
                quizFinished = false;

                showQuizQuestion();
                return;
            }

            if (!answered) return;

            currentQuestion++;
            showQuizQuestion();
        });

        showQuizQuestion();
    }


    // =====================================
    // 8. MEMORIES ALBUM LIGHTBOX
    // =====================================
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxClose = document.getElementById("lightboxClose");

    function closeLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    document.querySelectorAll(".album-item img").forEach((image) => {
        image.addEventListener("click", () => {
            if (!lightbox || !lightboxImage || !lightboxCaption) return;

            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;

            const caption = image
                .closest(".album-item")
                ?.querySelector("figcaption h3");

            lightboxCaption.textContent = caption
                ? caption.textContent
                : image.alt;

            lightbox.classList.add("open");
            lightbox.setAttribute("aria-hidden", "false");

            document.body.style.overflow = "hidden";

            if (lightboxClose) {
                lightboxClose.focus();
            }
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeLightbox();
        }
    });


    // =====================================
    // 9. CONTACT FORM BASIC VALIDATION
    // =====================================
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            const nameField = document.getElementById("contactName");
            const emailField = document.getElementById("contactEmail");
            const messageField = document.getElementById("contactMessage");

            if (!nameField || !emailField || !messageField) return;

            if (
                !nameField.value.trim() ||
                !emailField.value.trim() ||
                !messageField.value.trim()
            ) {
                event.preventDefault();

                alert("Please complete your name, email, and message.");
                return;
            }

            /*
              The browser will submit the form normally to FormSubmit.
              Do not prevent the default submission when the fields are valid.
            */
        });
    }

});