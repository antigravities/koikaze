class SteamDiscover {
    #container;
    #apps = [];
    interval;

    constructor(){
        this.#container = document.createElement("div");
        this.#container.id = "steam-discover-container";

        document.body.appendChild(this.#container);
        this.start();
    }

    async fetchApps(){
        if( window.localStorage["steam-discover__apps"] ){
            let apps = JSON.parse(window.localStorage["steam-discover__apps"]);

            if( apps.cache && Date.now() - apps.cache < 1000 * 60 * 60 * 24 ){
                this.#apps = apps.data;
                return this.#apps;
            }
        }

        let apikey = await fetch("/config.json").then(res => res.json()).then(json => json.steamwebapi);

        let start = 10;

        while( start > -1 ){
            console.log("fetch");

            let res = await (await fetch(`https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${apikey}&max_results=50000&last_appid=${start}`)).json();
            this.#apps = this.#apps.concat(res.response.apps.map(i => i.appid));

            if( res.response.have_more_results ){
                start = res.response.last_appid;
            } else {
                start = -1;
            }
        }

        window.localStorage["steam-discover__apps"] = JSON.stringify({
            cache: Date.now(),
            data: this.#apps
        });

        return this.#apps;
    }

    async start(){
        let fn = (async () => {
            let apps = await this.fetchApps();
            let info = null;

            while( ! info ){
                let res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${apps[Math.floor(Math.random() * apps.length)]}`);

                if( ! res.ok ) continue;

                let json = await res.json();

                if( ! json[Object.keys(json)[0]].success ) continue;
                if(
                    (json[Object.keys(json)[0]].data.content_descriptors?.ids || []).includes(1) ||
                    (json[Object.keys(json)[0]].data.content_descriptors?.ids || []).includes(3) ||
                    (json[Object.keys(json)[0]].data.content_descriptors?.ids || []).includes(4)
                ){
                    console.log("adult content");
                    continue;
                }

                info = json[Object.keys(json)[0]].data;
            }

            document.querySelector("#steam-discover-container").innerHTML = "";

            let innerCtn = document.createElement("div");
            innerCtn.classList.add("steam-discover-inner");
            this.#container.appendChild(innerCtn);

            let metaCtn = document.createElement("div");
            metaCtn.classList.add("steam-discover-meta");
            innerCtn.appendChild(metaCtn);

            let title = document.createElement("h1");
            title.textContent = info.name;
            metaCtn.appendChild(title);

            let img = document.createElement("img");
            img.src = info.header_image;
            img.classList.add("steam-discover-image");
            metaCtn.appendChild(img);

            let desc = document.createElement("p");
            desc.classList.add("steam-discover-desc");
            desc.textContent = info.short_description;
            innerCtn.appendChild(desc);

            this.#container.style.backgroundColor = "#00719e";
            this.#container.style.backgroundImage = `url(${info.screenshots[Math.floor(Math.random() * info.screenshots.length)].path_full})`;
            this.#container.style.backgroundSize = "cover";
            this.#container.style.backgroundPosition = "center";
            this.#container.style.backgroundRepeat = "no-repeat";

            return this;
        })
        
        fn();
        setInterval(fn, 120000);
    }

    stop(){
        clearInterval(this.interval);
        if( this.#container.parentElement ) this.#container.parentElement.removeChild(this.#container);
    }
}

window.SteamDiscover = SteamDiscover;