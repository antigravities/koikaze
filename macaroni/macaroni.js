class HeyMacaroni {
    #container;
    #timeouts = [];
    #intervals = [];
    #macaronis = [];
    #audios = [];
    #stop = false;

    constructor(){
        this.#container = document.createElement("div");
        this.#container.id = "hey-macaroni-container";

        let _cache = new Image();
        _cache.src = "macaroni/fall.gif";
        _cache.src = "macaroni/dance.gif";

        document.body.appendChild(this.#container);

        this.start();
    }

    async timeout(delay){
        return new Promise(resolve => {
            this.#timeouts.push(setTimeout(resolve, delay));
        });
    }

    async start(){
        let splash = document.createElement("div");
        splash.classList.add("hey-macaroni-splash");
        this.#container.appendChild(splash);

        await this.timeout(3000);
        this.#container.removeChild(splash);

        await this.timeout(1000);

        while( ! this.#stop ){
            for( let i=0; i<5; i++ ){
                let x = Math.random() * window.innerWidth;
                let y = Math.random() * window.innerHeight * 0.2;

                let img = document.createElement("img");
                img.src = "macaroni/fall.gif?t=" + Date.now();
                img.classList.add("hey-macaroni-macaroni");
                img.style.left = `${x}px`;
                img.style.top = `${y}px`;

                this.#container.appendChild(img);
                this.#macaronis.push(img);

                await this.timeout(1100);
                let audio = new Audio("macaroni/clink.wav");
                audio.play();
                this.#audios.push(audio);
                
                await this.timeout(Math.random() * 2000 + 1000);
            }

            await this.timeout(500);

            let audio = new Audio("macaroni/macaroni.wav");
            audio.play();
            this.#audios.push(audio);

            await this.timeout(110);

            this.#macaronis.forEach(macaroni => {
                macaroni.src = "macaroni/dance.gif";
            });

            await this.timeout(26600);

            this.#macaronis.forEach(macaroni => {
                if( macaroni.parentElement ) macaroni.parentElement.removeChild(macaroni);
            });
            this.#macaronis = [];

            let endsplash = document.createElement("div");
            endsplash.classList.add("hey-macaroni-endsplash");
            this.#container.appendChild(endsplash);

            await this.timeout(3000);

            this.#container.removeChild(endsplash);
        }
    }

    stop(){
        this.#timeouts.forEach(timeout => clearTimeout(timeout));
        this.#intervals.forEach(interval => clearInterval(interval));
        this.#audios.forEach(audio => audio.pause());
        if( this.#container.parentElement ) this.#container.parentElement.removeChild(this.#container);
        this.#stop = true;
    }

    static attachScreensaver(timeoutSec = 180000){
        const events = [ "mousemove", "keydown", "mousedown", "touchstart", "scroll" ];

        let mac;
        let timeout;

        const resetTimer = () => {
            if( mac ) mac.stop();
            if( timeout ) clearTimeout(timeout);

            timeout = setTimeout(() => {
                mac = new HeyMacaroni();
            }, timeoutSec);
        }

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });
    }
}

window.HeyMacaroni = HeyMacaroni;