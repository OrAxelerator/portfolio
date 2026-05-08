const nameEl = document.getElementById("name");
const separatorsEl = document.querySelectorAll(".separator");
const separatorCh = "=";
const carouselIndex = document.querySelector(".carrouselIndex"); // juste pour l'instant
const projectContainer = document.getElementById("projectContainer");
const terminalInput = document.getElementById("terminalInput");
const descriptionNeofetch = document.getElementById("description");
let activeProjectIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

terminalInput.focus()
const neofetchDescription = {
    "Projets": ": /projets",
    "LinkTree": ": /linkTree",
    "Host": ": Portfolio v1.0",
    "OS": ": Nerd",
    "Config": ": /config",
    "Langages": ": [python, html, css, js]",
    "Location": ": France",
    "Uptime": ": 3 ans de code"
}


for (const property in neofetchDescription) {
    const info = document.createElement("p");
    const key = document.createElement("span");
    const value = document.createElement("span");

    key.classList.add("key");

    key.textContent = property
    value.textContent = neofetchDescription[property]

    info.appendChild(key)
    info.appendChild(value)


    descriptionNeofetch.appendChild(info)
};


document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    const dir = Number(btn.dataset.dir);

    activeProjectIndex = (activeProjectIndex + dir + projects.length ) % projects.length;

    console.log(activeProjectIndex);
    renderDots();
    updateCarousel();
  });
});

terminalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    console.log('ENTER');
    console.log(terminalInput.textContent);
    console.log(terminalInput.textContent == "sudo rm -rf");
    if(terminalInput.textContent == "sudo rm -rf"){
        alert("French Language uninstall 👌🐧");
        terminalInput.textContent = "";
    }
  }
});


// Touch swipe handling
projectContainer.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

projectContainer.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, false);

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    const dir = diff > 0 ? 1 : -1;
    activeProjectIndex = (activeProjectIndex + dir + projects.length) % projects.length;
    renderDots();
    updateCarousel();
  }
}


separatorsEl.forEach(element => {
    console.log(nameEl.textContent.length);
    element.textContent = separatorCh.repeat(nameEl.textContent.length)

});

const projects = [
    {
        "name":"Pixel_Code",
        "description":"TUI / gestionnaire de projet en Python",
        "img":"https://github.com/OrAxelerator/Pixel_Code/raw/main/docs/assets/preview.png",
        "color":"rgb(109, 150, 234)",
        "link":"https://github.com/OrAxelerator/Pixel_Code"

    },
    {
        "name":"Trophée NSI",
        "description":"Simulation de fourmis en Python/Flask en groupe",
        "img":"https://github.com/OrAxelerator/trophee_nsi_ant/raw/main/favicon.png",
        "color":"rgb(74, 149, 53)",
        "link":"https://github.com/OrAxelerator/trophee_nsi_ant"
    },
    {
        "name":"OrA.studio",
        "description":"Ma chaîne YouTube, ça parle de code/Linux et d'autres trucs cool",
        "img":"../assets/yt-channel.png",
        "color":"red",
        "link":"https://www.youtube.com/@OrA-creation"
    },
    {
        "name":"Guess the flag",
        "description":"PWA (application web) de quiz sur les drapeaux",
        "img":"https://github.com/OrAxelerator/web/blob/main/pwa/guess_the_flag/assets/logo_gtf.png?raw=true",
        "color":"rgb(40, 40, 40)",
        "link":"https://oraxelerator.github.io/web/pwa/guess_the_flag/"
    },
    {
        "name":"Pixel-Info",
        "description":"Autre PWA, sorte de mini-site d'actu",
        "img":"https://github.com/OrAxelerator/web/raw/main/websites/pixel-info/Pixel-info_logo.png?raw=true",
        "color":"rgb(67, 122, 247)",
        "link":"https://oraxelerator.github.io/web/websites/pixel-info/index.html"
    }
]

function renderDots() {
    carouselIndex.innerHTML = ""; // reset ... peut faire mieux
    for (let i = 0 ; i < projects.length; i++) {
        const dot = document.createElement("div");
        if (i === activeProjectIndex) {
            dot.classList.add("activeDot");
        } else {
            dot.classList.add("dot");
        }
        console.log("hop");
        carouselIndex.appendChild(dot);
    }
}

function createCarousel() {
    for (let i =0; i < projects.length; i++){
        const card = document.createElement("div");
        card.classList.add("card", "no-transition");
        const offset = (i - activeProjectIndex) * 100;
        card.style.transform = `translateX(${offset}%)`;
        card.style.backgroundColor = projects[i].color;
        const title = document.createElement("h2");
        title.textContent = projects[i].name;
        const description = document.createElement("p");
        description.textContent = projects[i].description;
        const link = document.createElement("a");
        link.href = projects[i].link;
        link.target = "_blank";
        link.classList.add("projectLink");

        const img = document.createElement("img");
        img.alt = projects[i].name;
        img.classList.add("projectImg");
        img.src = projects[i].img;

        link.appendChild(img);

        const imgWrap = document.createElement("div");
        imgWrap.classList.add("projectImgWrap");
        imgWrap.appendChild(link);

        card.appendChild(title);
        card.appendChild(imgWrap);
        card.appendChild(description);

        projectContainer.appendChild(card);
    }
    // Enable transition after initial positioning
    requestAnimationFrame(() => {
        document.querySelectorAll('.card').forEach(card => card.classList.remove('no-transition'));
    });
}

function updateCarousel() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
        const offset = (index - activeProjectIndex) * 100; // 100%
        card.style.transform = `translateX(${offset}%)`;
    });
    playBoinkAnimation();
}

function playBoinkAnimation() {
    carouselIndex.classList.remove("animate-boink");
    void carouselIndex.offsetWidth; // Force reflow
    carouselIndex.classList.add("animate-boink");

    setTimeout(() => {
        carouselIndex.classList.remove("animate-boink");
    }, 500);
}

renderDots();
createCarousel();
