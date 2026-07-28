let crystals = 0;
const upgrades = {
    pickaxe1: { qty: 0, cost: 5, baseCost: 15, cps: 0.2 },
    pickaxe2: { qty: 0, cost: 75, baseCost: 100, cps: 3 },
    pickaxe3: { qty: 0, cost: 1100, baseCost: 1000, cps: 25 }
};
if (localStorage.getItem('crystalClickerSave')) {
    const data = JSON.parse(localStorage.getItem('crystalClickerSave'));
    crystals = data.crystals || 0;
    Object.keys(upgrades).forEach(key => {
        if (data.upgrades && data.upgrades[key]) {
            upgrades[key].qty = data.upgrades[key].qty;
            upgrades[key].cost = data.upgrades[key].cost;
        }
    });
}
const crystalBtn = document.getElementById('crystalBtn');
const crystalContainer = document.getElementById('crystalContainer');
crystalBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    crystals += 1;
    createFloatingText(e.clientX, e.clientY);
    updateUI();
});
function buyUpgrade(type) {
    const item = upgrades[type];
    if (crystals >= item.cost) {
        crystals -= item.cost;
        item.qty++;
        item.cost = Math.floor(item.baseCost * Math.pow(1.15, item.qty));
        updateUI();
    }
}
function getCps() {
    let totalCps = 0;
    Object.keys(upgrades).forEach(key => {
        totalCps += upgrades[key].qty * upgrades[key].cps;
    });
    return totalCps;
}
function createFloatingText(x, y) {
    const text = document.createElement('div');
    text.className = 'floating-text';
    text.innerText = '+1';
    const rect = crystalContainer.getBoundingClientRect();
    text.style.left = (x ? x : rect.left + rect.width/2) + 'px';
    text.style.top = (y ? y : rect.top + rect.height/2) + 'px';
    document.body.appendChild(text);
    setTimeout(() => text.remove(), 800);
}
function updateUI() {
    document.getElementById('crystalCount').innerText = Math.floor(crystals) + " Crystals";
    document.getElementById('cpsCount').innerText = "per second: " + getCps().toFixed(1);
    Object.keys(upgrades).forEach(key => {
        document.getElementById(key + 'Cost').innerText = "Cost: " + upgrades[key].cost;
        document.getElementById(key + 'Qty').innerText = upgrades[key].qty;
        const btn = document.getElementById('buy' + key.charAt(0).toUpperCase() + key.slice(1));
        btn.disabled = crystals < upgrades[key].cost;
    });
}
setInterval(() => {
    crystals += getCps() / 10;
    updateUI();
}, 100);
setInterval(() => {
    const saveData = { crystals: crystals, upgrades: upgrades };
    localStorage.setItem('crystalClickerSave', JSON.stringify(saveData));
}, 10000);
updateUI();
