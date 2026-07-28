(function() {
    let crystals = 0;
    const upgrades = {
        pickaxe1: { qty: 0, cost: 5, baseCost: 15, cps: 0.2 },
        pickaxe2: { qty: 0, cost: 75, baseCost: 100, cps: 3 },
        pickaxe3: { qty: 0, cost: 1100, baseCost: 1000, cps: 25 }
    };

    const SECRET_SALT = "MySuperSecretCrystalKey123!";

    function generateSignature(dataText) {
        let hash = 0;
        const combined = dataText + SECRET_SALT;
        for (let i = 0; i < combined.length; i++) {
            hash = (hash << 5) - hash + combined.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(36);
    }

    if (localStorage.getItem('crystalClickerSave')) {
        try {
            const savedEnvelope = JSON.parse(localStorage.getItem('crystalClickerSave'));
            const expectedSignature = generateSignature(JSON.stringify(savedEnvelope.data));
            if (savedEnvelope.signature === expectedSignature) {
                const data = savedEnvelope.data;
                crystals = data.crystals || 0;
                Object.keys(upgrades).forEach(key => {
                    if (data.upgrades && data.upgrades[key]) {
                        upgrades[key].qty = data.upgrades[key].qty;
                        upgrades[key].cost = data.upgrades[key].cost;
                    }
                });
            } else {
                alert("Cheating detected! Your save data has been reset.");
                localStorage.removeItem('crystalClickerSave');
            }
        } catch (e) {
            console.error("Failed to load save file safely.");
        }
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

    window.gameBuyUpgrade = buyUpgrade;

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
        text.style.left = (x ? x : rect.left + rect.width / 2) + 'px';
        text.style.top = (y ? y : rect.top + rect.height / 2) + 'px';
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
            if (btn) btn.disabled = crystals < upgrades[key].cost;
        });
    }

    setInterval(() => {
        crystals += getCps() / 10;
        updateUI();
    }, 100);

    setInterval(() => {
        const rawData = { crystals: crystals, upgrades: upgrades };
        const dataString = JSON.stringify(rawData);
        const secureEnvelope = {
            data: rawData,
            signature: generateSignature(dataString)
        };
        localStorage.setItem('crystalClickerSave', JSON.stringify(secureEnvelope));
    }, 10000);

    updateUI();
})();
