class WebTV {
    #container;
    #audio;
    #intervals = [];
    #timeouts = [];

    static #frames = {};
    static #locations = [
        "www.ebay.com",
        "www.microsoft.com",
        "www.apple.com",
        "ask.com",
        "pokemon.com",
        "www.google.com",
        "www.x.com",
        "www.yahoo.com",
        "disney.go.com/park/homepage/today/html/index.html",
        "www.amazon.com/exec/obidos/subst/home/home.html/",
        "www.bonzi.com/BonziBUDDY/BonziBUDDYFREEhom.asp",
        "www.nasa.gov",
        "www.earthlink.net",
        "www.nytimes.com"
    ]

    constructor() {
        this.#container = document.createElement("div");
        this.#container.id = "webtv-container";
        document.body.appendChild(this.#container);

        let localLocations = JSON.parse(JSON.stringify(WebTV.#locations));

        this.#intervals.push(setInterval(() => {
            if( localLocations.length === 0 ) return;

            let location = localLocations[Math.floor(Math.random() * localLocations.length)];

            if( ! WebTV.#frames[location] ){
                let el = document.createElement("iframe");
                el.src = `http://web.archive.org/web/2000if_/http://${location}`;
                el.classList.add("webtv-frame");
                el.sandbox = "allow-scripts allow-same-origin";
                el.frameBorder = 0;
                WebTV.#frames[location] = el;

                document.body.appendChild(el);
            }

            localLocations = localLocations.filter(l => l !== location);
        }, 20000));

        this.start();
    }

    start(){
        let audio = new Audio("webtv/connecting.mp3");
        audio.loop = true;
        audio.play();
        this.#audio = audio;

        this.#intervals.push(setInterval(() => {
            console.log(WebTV.#frames);

            let frames = Object.entries(WebTV.#frames).filter(([k, v]) => !v.classList.contains("webtv-frame-active"));

            if( frames.length > 0 ){
                let frame = frames[Math.floor(Math.random() * frames.length)][1];

                this.#timeouts.push(setTimeout(() => {
                    frame.classList.remove("webtv-frame-active");
                    frame.style.left = `-100vw`;
                }, 21000));

                frame.style.left = `${Math.random() * 80}vw`;
                frame.classList.add("webtv-frame-active");
            } else console.log("no frames!!!");
        }, 10000));
    }

    stop(){
        document.body.removeChild(this.#container);
        this.#audio.stop();

        this.#intervals.forEach(i => clearInterval(i));
        this.#timeouts.forEach(t => clearTimeout(t));
    }
}

window.WebTV = WebTV;