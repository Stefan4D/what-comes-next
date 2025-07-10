document.addEventListener("DOMContentLoaded", () => {
  let currentSequenceIndex = 0;
  let choicesLocked = false;

  // Screen elements
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const endScreen = document.getElementById("end-screen");

  // Button elements
  const startButton = document.getElementById("start-button");
  const nextButton = document.getElementById("next-button");
  const playAgainButton = document.getElementById("play-again-button");

  // Game elements
  const sequenceDisplay = document.getElementById("sequence-display");
  const answerOptions = document.getElementById("answer-options");
  const feedbackMessage = document.getElementById("feedback-message");

  const handleAdvanceClick = () => showNextSequence();

  // --- EVENT LISTENERS ---
  startButton.addEventListener("click", startGame);
  playAgainButton.addEventListener("click", startGame);
  // The nextButton and tap-anywhere listeners are added dynamically

  // --- GAME LOGIC ---
  function startGame() {
    currentSequenceIndex = 0;
    startScreen.classList.add("hidden");
    endScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    loadSequence(currentSequenceIndex);
  }

  function loadSequence(index) {
    choicesLocked = false;
    gameScreen.removeEventListener("click", handleAdvanceClick);
    nextButton.removeEventListener("click", handleAdvanceClick);

    const sequence = sequences[index];

    sequenceDisplay.innerHTML = "";
    answerOptions.innerHTML = "";
    feedbackMessage.textContent = "";
    nextButton.classList.add("hidden");

    // Display sequence cards
    sequence.steps.forEach(step => {
      const card = createCard(step);
      sequenceDisplay.appendChild(card);
    });

    // Display option cards
    sequence.options.forEach(option => {
      const card = createCard(option, true);
      card.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent the game-screen click listener from firing immediately
        handleChoice(card, option.text, sequence.correct);
      });
      answerOptions.appendChild(card);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function createCard(item, isOption = false) {
    const card = document.createElement("div");
    card.className = isOption ? "card option-card" : "card";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.text;
    img.onerror = () => { 
      img.src = `https://placehold.co/400x400/ccc/333?text=Image+Error`;
    }; // Fallback image

    const text = document.createElement("p");
    text.textContent = item.text;

    card.appendChild(img);
    card.appendChild(text);
    return card;
  }

  function handleChoice(card, chosenText, correctText) {
    if (choicesLocked) return;
    choicesLocked = true;

    const allOptions = Array.from(answerOptions.children);
    allOptions.forEach(c => c.style.pointerEvents = 'none');

    if (chosenText === correctText) {
      handleCorrectChoice(card, allOptions);
    } else {
      handleIncorrectChoice(card);
    }
  }

  function handleCorrectChoice(card, allOptions) {
    card.classList.add("correct");
    feedbackMessage.textContent = "Great job!";
    feedbackMessage.style.color = "var(--correct-color)";

    // Fade out the non-chosen card(s)
    allOptions.forEach(otherCard => {
      if (otherCard !== card) {
        otherCard.classList.add('fading-out');
      }
    });

    setTimeout(() => {
      animateCardToSequence(card);
    }, 500); // Wait for feedback and fade-out to start
  }

  function animateCardToSequence(card) {
    const cardRect = card.getBoundingClientRect();
    const placeholder = document.createElement('div');
    const cardStyles = getComputedStyle(card);
    placeholder.style.width = cardStyles.width;
    placeholder.style.height = cardStyles.height;
    placeholder.style.margin = cardStyles.margin;
    placeholder.style.flexShrink = '0';
    sequenceDisplay.appendChild(placeholder);
    const placeholderRect = placeholder.getBoundingClientRect();
    placeholder.style.visibility = 'hidden';

    document.body.appendChild(card);
    card.classList.add('moving');
    card.style.top = `${cardRect.top}px`;
    card.style.left = `${cardRect.left}px`;
    card.style.margin = '0';

    requestAnimationFrame(() => {
      card.style.top = `${placeholderRect.top}px`;
      card.style.left = `${placeholderRect.left}px`;
      card.style.transform = 'scale(1.0)';
    });

    setTimeout(() => {
      card.classList.remove('moving', 'correct', 'option-card');
      card.removeAttribute('style');
      sequenceDisplay.replaceChild(card, placeholder);
      answerOptions.innerHTML = '';
      enableNextStep();
    }, 500); // Match CSS transition duration
  }

  function handleIncorrectChoice(card) {
    card.classList.add("incorrect");
    feedbackMessage.textContent = "Good try!";
    feedbackMessage.style.color = "var(--incorrect-color)";

    setTimeout(() => {
      enableNextStep();
    }, 1000);
  }

  function enableNextStep() {
    nextButton.classList.remove("hidden");
    gameScreen.addEventListener("click", handleAdvanceClick);
    nextButton.addEventListener("click", handleAdvanceClick);
  }

  function showNextSequence() {
    currentSequenceIndex++;
    if (currentSequenceIndex >= sequences.length) {
      showEndScreen();
    } else {
      loadSequence(currentSequenceIndex);
    }
  }

  function showEndScreen() {
    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
  }
});
