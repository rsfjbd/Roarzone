// Initialize Clappr player
var player = new Clappr.Player({
    source: "https://edge2.roarzone.info:8444/roarzone/edge2/tsports/index.m3u8?token=6ac54123536d415569c72f1246b787713afc6918-6c52a76759bb2d47368ee73403a83462-1769599276-1769595676", // Default source
    parentId: "#player",
    autoPlay: true,
    mute: false,
    height: '100%',
    width: '100%',
    disableVideoTagContextMenu: true,
});

// Function to change channel
function changeChannel(url) {
    const overlayMessage = document.getElementById('overlay-message');
    overlayMessage.style.display = 'flex';
    
    player.load(url);
    player.play();

    player.once(Clappr.Events.PLAYER_PLAY, function () {
        overlayMessage.style.display = 'none';
    });
}

// Function to show channels in UI
function showChannels(category, channels) {
    const container = document.getElementById('channels-container');
    container.innerHTML = '';

    channels.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        
        // এখানে name এবং logo ব্যবহার করা হয়েছে নতুন JSON অনুযায়ী
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

// Fetch channels from server.json
fetch('server.json')
    .then(response => response.json())
    .then(data => {
        const categoryTabs = document.getElementById('category-tabs');
        const channelData = data.channels; // JSON এর channels অবজেক্টটি নেওয়া হলো
        let firstCategory = true;

        for (const category in channelData) {
            const tab = document.createElement('div');
            tab.className = 'category-tab';
            if (firstCategory) {
                tab.classList.add('active');
                showChannels(category, channelData[category]);
                firstCategory = false;
            }
            tab.textContent = category.replace('_', ' ');

            tab.addEventListener('click', function () {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                showChannels(category, channelData[category]);
            });

            categoryTabs.appendChild(tab);
        }
    })
    .catch(error => console.error('Error loading channels:', error));
