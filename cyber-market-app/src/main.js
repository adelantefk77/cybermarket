import './style.css'
import { fetchTop10MarketCap, fetchGainersLosers } from './cryptoService.js'

console.log('Cyber Market App Initialized');

const marketCoreContainer = document.getElementById('market-core-container');
const gainersContainer = document.getElementById('gainers-container');
const losersContainer = document.getElementById('losers-container');
const osintContainer = document.getElementById('osint-terminal-container');

let cachedGainers = [];
let cachedLosers = [];
let gainersExpanded = false;
let losersExpanded = false;

document.getElementById('toggle-gainers').addEventListener('click', () => {
    gainersExpanded = !gainersExpanded;
    document.getElementById('gainers-chevron').style.transform = gainersExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    renderGainersLosers();
});

document.getElementById('toggle-losers').addEventListener('click', () => {
    losersExpanded = !losersExpanded;
    document.getElementById('losers-chevron').style.transform = losersExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    renderGainersLosers();
});

const osintEvents = [
    "INITIALIZING_NEURAL_LINK...",
    "SCANNING_DEFI_PROTOCOLS...",
    "OSINT_READY."
];

function addOsintEvent(message) {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    osintEvents.push(`<span class="text-primary/60">[${time}]</span> ${message.toUpperCase()}`);
    if (osintEvents.length > 5) osintEvents.shift();
    renderOsint();
}

function renderOsint() {
    if (!osintContainer) return;
    osintContainer.innerHTML = osintEvents.map(event => `<p class="leading-none">${event}</p>`).join('');
}

function generateRandomEvent(coins, gainers, losers) {
    const templates = [
        () => `INCOMING_TX: ${Math.floor(Math.random() * 1000)} ${coins[Math.floor(Math.random() * coins.length)]?.symbol || 'BTC'} -> COLD_STORAGE_${Math.floor(Math.random() * 10)}`,
        () => `WHALE_VIGIL: Large buy order detected for ${gainers[0]?.pair || 'ETH/USDT'}`,
        () => `LIQUIDITY_ALERT: ${losers[0]?.pair || 'SOL/USDT'} volatility spike detected`,
        () => `UNLOCK_PROTOCOL: ${coins[Math.floor(Math.random() * coins.length)]?.symbol || 'LINK'} tokens released to treasury`,
        () => `OSINT_REPORT: Sentiment shift on ${gainers[Math.floor(Math.random() * gainers.length)]?.pair || 'TRX'} -> BULLISH`,
        () => `NETWORK_STATUS: ${['SOLANA', 'ETHEREUM', 'BITCOIN'][Math.floor(Math.random() * 3)]} congestion level: LOW`,
        () => `MT_GOX_TRACKER: No wallet movement detected in last 24h`,
        () => `FEDERAL_COMPLIANCE: New DeFi regulation drafts detected in Washington`
    ];
    addOsintEvent(templates[Math.floor(Math.random() * templates.length)]());
}

function generateSparklinePath(data, width, height) {
    if (!data || data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${points.join(' L ')}`;
}

async function updateMarketCore() {
    try {
        const coins = await fetchTop10MarketCap();
        if (!coins || coins.length === 0) return coins;
        addOsintEvent("SYSTEM_CORE: RENDERING_HISTORICAL_CHARTS");
        marketCoreContainer.innerHTML = coins.map(coin => {
            const isPositive = parseFloat(coin.change) >= 0;
            const borderClass = isPositive ? 'border-l-primary/60' : 'border-l-cyber-red/60';
            const cornerClass = isPositive ? '' : 'border-cyber-red/60';
            const bgClass = isPositive ? 'bg-primary/10 border-primary/40' : 'bg-cyber-red/10 border-cyber-red/40';
            const textClass = isPositive ? 'text-primary' : 'text-cyber-red';
            const subTextClass = isPositive ? 'text-primary/50' : 'text-cyber-red/50';
            const techTextClass = isPositive ? 'text-primary/40' : 'text-cyber-red/40';
            const changeClass = isPositive ? 'text-cyber-green' : 'text-cyber-red';
            const fiberClass = isPositive ? 'fiber-optic' : 'fiber-optic-red';
            const fiberColor = isPositive ? '#1fb1f9' : '#ff2d55';
            const sparklinePath = generateSparklinePath(coin.history, 120, 40);
            return `
                <div class="hologram-panel p-4 rounded-sm border-l-4 ${borderClass}">
                    <div class="corner-mark top-0 left-0 border-r-0 border-b-0 ${cornerClass}"></div>
                    <div class="corner-mark bottom-0 right-0 border-l-0 border-t-0 ${cornerClass}"></div>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-3 shrink-0">
                            <div class="w-10 h-10 rounded-sm ${bgClass} flex items-center justify-center border relative overflow-hidden">
                                ${coin.image ? `<img src="${coin.image}" class="w-6 h-6" alt="${coin.symbol}">` : `<span class="material-symbols-outlined text-xs ${textClass}">currency_bitcoin</span>`}
                                <div class="absolute -top-1 -left-1 text-[8px] font-mono ${techTextClass}">${coin.id.toString().padStart(2, '0')}</div>
                            </div>
                            <div>
                                <div class="font-black font-digital text-base tracking-tighter">${coin.symbol}</div>
                                <div class="text-[8px] ${subTextClass} font-mono tracking-widest">${coin.name}</div>
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col items-end gap-1">
                            <div class="flex items-center gap-4 w-full justify-end">
                                <div class="relative h-10 w-24 hidden sm:block border-b border-white/5">
                                    <svg class="w-full h-full ${fiberClass}" preserveAspectRatio="none" viewBox="0 0 120 40">
                                        <path d="${sparklinePath}" fill="none" stroke="${fiberColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </div>
                                <div class="text-right min-w-[90px]">
                                    <div class="font-black font-digital text-sm ${textClass}">$${coin.price}</div>
                                    <div class="${changeClass} text-[10px] font-mono font-bold">
                                        ${isPositive ? '+' : ''}${coin.change}% ${isPositive ? '▲' : '▼'}
                                    </div>
                                </div>
                            </div>
                            <div class="scrolling-tech-text ${techTextClass} text-right uppercase">VOL: ${coin.marketCap} // NODE: LIVE</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        return coins;
    } catch (error) {
        console.error('Core Render Error:', error);
        return [];
    }
}

function renderGainersLosers() {
    if (cachedGainers && cachedGainers.length > 0) {
        const displayGainers = gainersExpanded ? cachedGainers : cachedGainers.slice(0, 1);
        gainersContainer.innerHTML = displayGainers.map(item => `
            <div class="p-3 border-l-2 border-cyber-green relative">
                <div class="text-[9px] text-primary/60 font-mono">${item.pair}</div>
                <div class="text-xl font-black font-digital text-cyber-green">+${item.change}%</div>
                <div class="text-[7px] text-cyber-green/40 font-mono uppercase mt-1">VOL: ${item.volume}</div>
            </div>
        `).join('');
        gainersContainer.className = gainersExpanded ? "space-y-3" : "grid grid-cols-2 gap-3";
    }
    if (cachedLosers && cachedLosers.length > 0) {
        const displayLosers = losersExpanded ? cachedLosers : cachedLosers.slice(0, 1);
        losersContainer.innerHTML = displayLosers.map(item => `
            <div class="p-3 border-l-2 border-cyber-red relative">
                <div class="text-[9px] text-cyber-red/60 font-mono">${item.pair}</div>
                <div class="text-xl font-black font-digital text-cyber-red">${item.change}%</div>
                <div class="text-[7px] text-cyber-red/40 font-mono uppercase mt-1">VOL: ${item.volume}</div>
            </div>
        `).join('');
        losersContainer.className = losersExpanded ? "space-y-3" : "grid grid-cols-2 gap-3";
    }
}

async function updateGainersLosersData() {
    try {
        const { gainers, losers } = await fetchGainersLosers();
        cachedGainers = gainers;
        cachedLosers = losers;
        renderGainersLosers();
        return { gainers, losers };
    } catch (error) {
        console.error('G/L Data Fetch Error:', error);
        return { gainers: [], losers: [] };
    }
}

function setConnectionStatus(success) {
    const textEl = document.getElementById('connection-status-text');
    const ledEl = document.getElementById('connection-status-led');
    if (!textEl || !ledEl) return;
    if (success) {
        textEl.textContent = 'NEURAL_LINK: ESTABLISHED';
        ledEl.classList.remove('text-cyber-red', 'bg-cyber-red');
        ledEl.classList.add('text-cyber-green', 'bg-cyber-green');
    } else {
        textEl.textContent = 'NEURAL_LINK: COMPROMISED';
        ledEl.classList.remove('text-cyber-green', 'bg-cyber-green');
        ledEl.classList.add('text-cyber-red', 'bg-cyber-red');
    }
}

async function syncAll() {
    try {
        const [coins, gl] = await Promise.all([updateMarketCore(), updateGainersLosersData()]);
        setConnectionStatus(true);
        generateRandomEvent(coins, gl.gainers, gl.losers);
    } catch (e) {
        setConnectionStatus(false);
    }
}

syncAll();
renderOsint();

setInterval(syncAll, 30000);
setInterval(() => { renderOsint(); }, 2000);
