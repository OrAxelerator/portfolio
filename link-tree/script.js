const me = document.getElementById('me');
let clickCount = 0;

const citation = [
    "Se dire que tout a commencez sur Scratch...",
    "Linux, Macos ou Windows ?",
    "Life didn't change if you don't commit",
    "404 - no citation found",
    "nothing to say.",
    "Hmm (minecraft villager)",


]
const citationElement = document.getElementById("citation");

function displayCitation(lastCitation) {

    let randomNumber = Math.floor(Math.random() * citation.length);

    if (lastCitation === citation[randomNumber]) {
        randomNumber += 1;
        randomNumber = randomNumber % citation.length ;
    }
    citationElement.textContent = citation[randomNumber];
}
displayCitation()
const MAX_STEP = 0.6;

const base1 = [34, 34, 142];
const base2 = [48, 98, 225];

const mix = (base, factor) => {
  const target = base.map(v => v * 1.25);
  return base.map((v, i) =>
    Math.round(v + (target[i] - v) * factor)
  );
};

me.addEventListener('click', () => {
  displayCitation(citationElement.textContent);

  const currentRotation = me.dataset.rotation ? parseInt(me.dataset.rotation) : 0;
  const newRotation = currentRotation + 360;

  me.style.transform = `rotateY(${newRotation}deg)`;
  me.dataset.rotation = newRotation;

  clickCount++;

  const factor = Math.min(clickCount * 0.08, MAX_STEP);

  const [r1, g1, b1] = mix(base1, factor);
  const [r2, g2, b2] = mix(base2, factor);

  document.body.style.background =
    `linear-gradient(360deg, rgb(${r1},${g1},${b1}), rgb(${r2},${g2},${b2}))`;
});


const copyBtn = document.getElementById("copyMail");

copyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  navigator.clipboard.writeText("axel.piat@icloud.com")
    .then(() => {
      copyBtn.textContent = "Mail copié !";
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-envelope"></i> Copier Mail';
      }, 1500);
    });
});
