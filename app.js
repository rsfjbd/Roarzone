// ১. প্লেয়ার ইনিশিয়ালাইজ করা
var player = new Clappr.Player({
    source: "https://edge2.roarzone.info:8444/roarzone/edge2/tsports/index.m3u8?token=6ac54123536d415569c72f1246b787713afc6918-6c52a76759bb2d47368ee73403a83462-1769599276-1769595676",
    parentId: "#player",
    autoPlay: true,
    width: '100%',
    height: '100%',
    disableVideoTagContextMenu: true,
});

// ২. চ্যানেল পরিবর্তন করার ফাংশন
function changeChannel(url) {
    const overlay = document.getElementById('overlay-message');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.innerText = "চ্যানেল লোড হচ্ছে, অপেক্ষা করুন...";
    }
    
    player.load(url);
    player.play();

    player.once(Clappr.Events.PLAYER_PLAY, function () {
        if (overlay) overlay.style.display = 'none';
    });
}

// ৩. চ্যানেলের তালিকা UI-তে দেখানো
function showChannels(channels) {
    const container = document.getElementById('channels-container');
    container.innerHTML = '';

    channels.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        
        // আপনার নতুন JSON-এ 'name' এবং 'logo' ব্যবহার করা হয়েছে
        card.innerHTML = `
            <img src="${channel.logo}" alt="${channel.name}" onerror="this.src='https://via.placeholder.com/60?text=TV'">
            <div class="channel-name">${channel.name}</div>
        `;

        card.addEventListener('click', function () {
            document.querySelectorAll('.channel-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            changeChannel(channel.url);
        });

        container.appendChild(card);
    });
}

// ৪. server.json থেকে ডাটা নিয়ে আসা
fetch('server.json')
    .then(response => response.json())
    .then(data => {
        const categoryTabs = document.getElementById('category-tabs');
        // আপনার নতুন JSON এ সব ডাটা 'channels' অবজেক্টের ভেতর আছে
        const allCategoryData = data.channels; 
        let isFirst = true;

        for (const category in allCategoryData) {
            const tab = document.createElement('div');
            tab.className = 'category-tab';
            tab.textContent = category.replace('_', ' ');

            if (isFirst) {
                tab.classList.add('active');
                showChannels(allCategoryData[category]); // প্রথম ক্যাটাগরি লোড করা
                isFirst = false;
            }

            tab.addEventListener('click', function () {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                showChannels(allCategoryData[category]);
            });

            categoryTabs.appendChild(tab);
        }
    })
    .catch(err => {
        console.error("Error loading JSON:", err);
        document.getElementById('channels-container').innerHTML = "চ্যানেল লিস্ট লোড করতে সমস্যা হচ্ছে!";
    });
