const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

const TOP_10_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'TRX', 'DOT', 'LINK'];

const COIN_METADATA = {
    'BTC': { name: 'BITCOIN', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    'ETH': { name: 'ETHEREUM', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    'SOL': { name: 'SOLANA', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
    'BNB': { name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
    'XRP': { name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
    'DOGE': { name: 'DOGECOIN', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
    'ADA': { name: 'CARDANO', image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
    'TRX': { name: 'TRON', image: 'https://assets.coingecko.com/coins/images/1094/small/tron.png' },
    'DOT': { name: 'POLKADOT', image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
    'LINK': { name: 'CHAINLINK', image: 'https://assets.coingecko.com/coins/images/877/small/chainlink.png' }
};

export async function fetchTop10MarketCap() {
    try {
        const symbolsParam = JSON.stringify(TOP_10_SYMBOLS.map(s => `${s}USDT`));
        const response = await fetch(`${BINANCE_BASE_URL}/ticker/24hr?symbols=${symbolsParam}`);
        if (!response.ok) throw new Error('Binance ticker request failed');
        const data = await response.json();

        const klinePromises = TOP_10_SYMBOLS.map(symbol => fetchKlines(symbol));
        const allKlines = await Promise.all(klinePromises);
        const klineMap = Object.fromEntries(TOP_10_SYMBOLS.map((s, i) => [s, allKlines[i]]));

        return data.map((item, index) => {
            const baseSymbol = item.symbol.replace('USDT', '');
            const meta = COIN_METADATA[baseSymbol] || { name: baseSymbol, image: '' };
            return {
                id: index + 1,
                symbol: baseSymbol,
                name: meta.name,
                price: parseFloat(item.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                change: parseFloat(item.priceChangePercent || 0).toFixed(2),
                marketCap: (parseFloat(item.quoteVolume) * 50).toLocaleString(undefined, { maximumFractionDigits: 0 }),
                image: meta.image,
                history: klineMap[baseSymbol] || []
            };
        });
    } catch (error) {
        console.error('Error fetching Top 10 from Binance:', error);
        return [];
    }
}

async function fetchKlines(symbol) {
    try {
        const response = await fetch(`${BINANCE_BASE_URL}/klines?symbol=${symbol}USDT&interval=1h&limit=24`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.map(k => parseFloat(k[4]));
    } catch (e) {
        return [];
    }
}

export async function fetchGainersLosers() {
    try {
        const response = await fetch(`${BINANCE_BASE_URL}/ticker/24hr`);
        if (!response.ok) throw new Error('Binance ticker request failed');
        const data = await response.json();

        const usdtPairs = data.filter(item => item.symbol.endsWith('USDT') && parseFloat(item.quoteVolume) > 1000000);
        const sorted = usdtPairs.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

        const gainers = sorted.slice(0, 10).map(item => ({
            pair: item.symbol.replace('USDT', '/USDT'),
            change: parseFloat(item.priceChangePercent || 0).toFixed(1),
            volume: (parseFloat(item.quoteVolume) / 1000000).toFixed(1) + 'M'
        }));

        const losers = sorted.slice(-10).reverse().map(item => ({
            pair: item.symbol.replace('USDT', '/USDT'),
            change: parseFloat(item.priceChangePercent || 0).toFixed(1),
            volume: (parseFloat(item.quoteVolume) / 1000000).toFixed(1) + 'M'
        }));

        return { gainers, losers };
    } catch (error) {
        console.error('Error fetching Gainers/Losers:', error);
        return { gainers: [], losers: [] };
    }
}
