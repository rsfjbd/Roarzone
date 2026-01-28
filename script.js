const urls = [
    "https://raw.githubusercontent.com/munim-sah75/Cofs_TV/refs/heads/main/fancode.m3u",
    "https://raw.githubusercontent.com/biostartvworld/playlist/refs/heads/main/playlist.m3u",
    "https://raw.githubusercontent.com/sm-monirulislam/RoarZone-Auto-Update-playlist/refs/heads/main/RoarZone.m3u"
];

let channels = [];
let activeCat = "All";
let hls = null;

const list = document.getElementById("list");
const category = document.getElementById("category");
const left = document.getElementById("left");
const backBtn = document.getElementById("backBtn");
const video = document.getElementById("video");
const currentLogo = document.getElementById("currentLogo");
const currentName = document.getElementById("currentName");
const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const searchInput = document.getElementById("searchInput");

function makeSlug(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

// Load Playlist
async function init() {
    const results = await Promise.all(urls.map(u => fetch(u).then(r => r.text()).catch(() => "")));
    results.forEach(parseM3U);
    renderCategory();
    renderList(channels);
}

function parseM3U(t) {
    const lines = t.split(/\r?\n/);
    lines.forEach((l, i) => {
        if (l.startsWith("#EXTINF")) {
            const name = l.split(",").pop().trim();
            const logo = (l.match(/tvg-logo="(.*?)"/) || [])[1] || "";
            const cat = (l.match(/group-title="(.*?)"/) || [])[1] || "Others";
            const stream = (lines[i + 1] || "").trim();
            if (stream.startsWith("http")) {
                channels.push({ name, logo, cat, stream, id: makeSlug(name) });
            }
        }
    });
}

function renderCategory() {
    const cats = ["All", ...new Set(channels.map(c => c.cat))];
    category.innerHTML = "";
    cats.forEach(c => {
        const d = document.createElement("div");
        d.className = `catBtn ${c === activeCat ? 'active' : ''}`;
        d.innerText = c;
        d.onclick = () => {
            activeCat = c;
            renderCategory();
            renderList(c === "All" ? channels : channels.filter(x => x.cat === c));
        };
        category.appendChild(d);
    });
}

function renderList(arr) {
    list.innerHTML = "";
    arr.forEach(c => {
        const d = document.createElement("div");
        d.className = "channelItem";
        d.innerHTML = `<img src="${c.logo}" onerror="this.src='https://via.placeholder.com/55'"><span>${c.name}</span>`;
        d.onclick = () => playChannel(c);
        list.appendChild(d);
    });
}

function playChannel(c) {
    if (hls) hls.destroy();
    backBtn.style.display = "block";
    currentLogo.src = c.logo;
    currentName.innerText = c.name;

    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(c.stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = c.stream;
        video.play();
    }
}

// Search
searchBtn.onclick = () => {
    searchBox.style.display = searchBox.style.display === "block" ? "none" : "block";
    if (searchBox.style.display === "block") searchInput.focus();
};

searchInput.onkeyup = () => {
    const q = searchInput.value.toLowerCase();
    renderList(channels.filter(c => c.name.toLowerCase().includes(q)));
};

backBtn.onclick = () => {
    video.pause();
    backBtn.style.display = "none";
    if (window.innerWidth < 968) {
        // মোবাইলে ভিডিও প্লেয়ার হাইড করার লজিক চাইলে এখানে দিতে পারেন
    }
};

// Security
document.addEventListener("contextmenu", e => e.preventDefault());

init();
