/*
============================================================
  WAYPOINTS CONFIGURATION
============================================================
  Each waypoint object has:
    id     – unique identifier
    name   – location name shown in the popup
    x      – horizontal position as % of image width  (0 = left, 100 = right)
    y      – vertical position   as % of image height (0 = top,  100 = bottom)
    value  – Red Team score
    value2 – Blue Team score
    unit   – label for value  (e.g. "Red Team")
    unit2  – label for value2 (e.g. "Blue Team")

  Add, remove, or edit entries freely.
============================================================
*/
const waypoints = [
    { id: 1, name: "Lougheed Town Centre",   x: 66.15, y: 39.77,   value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
    { id: 2, name: "Burquitlam", x: 69.9,  y: 35, value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
    { id: 3, name: "Moody Centre", x: 72.65,  y: 30.6, value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
    { id: 4, name: "Inlet Centre", x: 76,  y: 30.6, value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
    { id: 5, name: "Coquitlam Central", x: 79.3,  y: 30, value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
    { id: 6, name: "Lincoln", x: 79.6,  y: 26.2, value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
    { id: 7, name: "Lafarge Lake-Douglas", x: 79.6,  y: 21.7, value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
];

const container = document.getElementById('map-container');
let activeId = null;
let popupEl  = null;

function formatNumber(n) {
    return n.toLocaleString();
}

/* Updates the pin's color based on which value is larger */
function updatePinColor(wp) {
    const pin = document.querySelector(`.waypoint[data-id="${wp.id}"] .waypoint-pin`);
    if (!pin) return;
    const diff = Math.abs(wp.value - wp.value2);
    pin.textContent = (diff > 0) ? diff : "";
    if (wp.value > wp.value2) {
        pin.style.background = '#cc2222';
    } else if (wp.value2 > wp.value) {
        pin.style.background = '#1a5fcc';
    } else {
        pin.style.background = '#888';
    }
}

function removePopup() {
    if (popupEl) { popupEl.remove(); popupEl = null; }
    document.querySelectorAll('.waypoint').forEach(w => w.classList.remove('active'));
    activeId = null;
}

function showPopup(wp, pinEl) {
    removePopup();
    activeId = wp.id;
    pinEl.classList.add('active');

    const popup = document.createElement('div');
    popup.className  = 'popup';
    popup.style.left = wp.x + '%';
    popup.style.top  = wp.y + '%';

    popup.addEventListener('click', e => {
	e.stopPropagation();
    });

    function render() {
        /* Pick number colors based on who's winning */
        const redClass  = wp.value  > wp.value2 ? 'num-red'  : 'num-gray';
        const blueClass = wp.value2 > wp.value  ? 'num-blue' : 'num-gray';

        popup.innerHTML = `
            <div class="popup-name">${wp.name}</div>

            <div class="popup-row">
                <div class="popup-col">
                    <button class="adj-btn" data-field="value" data-dir="1">▲</button>
                    <div class="popup-number ${redClass}">${formatNumber(wp.value)}</div>
                    <button class="adj-btn" data-field="value" data-dir="-1">▼</button>
                    <div class="popup-unit">${wp.unit}</div>
                </div>
                <div class="popup-divider"></div>
                <div class="popup-col">
                    <button class="adj-btn" data-field="value2" data-dir="1">▲</button>
                    <div class="popup-number ${blueClass}">${formatNumber(wp.value2)}</div>
                    <button class="adj-btn" data-field="value2" data-dir="-1">▼</button>
                    <div class="popup-unit">${wp.unit2}</div>
                </div>
            </div>

            <div class="popup-arrow"></div>
        `;

	popup.querySelectorAll('.adj-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                
                // Get the direction (+1 or -1)
                const dir = parseInt(btn.dataset.dir);
                
                // Update the waypoint's score
                wp[btn.dataset.field] += dir;
                
                // --- NEW: Update the Text Box Pools ---
                if (btn.dataset.field === 'value') {
                    // Red Team pool logic
                    const redPool = document.getElementById('red-pool');
                    // We subtract `dir`. If dir is 1 (Up), it subtracts 1. If dir is -1 (Down), it adds 1.
                    if (redPool) redPool.value = parseInt(redPool.value || 0) - dir;
                } else if (btn.dataset.field === 'value2') {
                    // Blue Team pool logic
                    const bluePool = document.getElementById('blue-pool');
                    if (bluePool) bluePool.value = parseInt(bluePool.value || 0) - dir;
                }

                // Re-render popup, pin, and dashboard
                render();
                updatePinColor(wp);  // Or updatePinDisplay(wp) if you used the previous code
                updateDashboard();
            });
        });
    }

    render();
    container.appendChild(popup);
    popupEl = popup;
}

/* Build pins */
waypoints.forEach(wp => {
    const el = document.createElement('div');
    el.className = 'waypoint';
    el.style.left = wp.x + '%';
    el.style.top  = wp.y + '%';
    el.setAttribute('data-id', wp.id);
    el.setAttribute('title', wp.name);
    el.innerHTML = `<div class="waypoint-pin"></div>`;

    /* Set initial pin color */
    updatePinColor(wp);

    el.addEventListener('click', e => {
        e.stopPropagation();
        if (activeId === wp.id) { removePopup(); return; }
        showPopup(wp, el);
    });

    container.appendChild(el);
});

/* Close popup when clicking outside */
document.addEventListener('click', removePopup);

function updateDashboard() {
    let redCount = 0;
    let blueCount = 0;
    
    // Count up who controls what
    waypoints.forEach(wp => {
        if (wp.value > wp.value2) redCount++;
        else if (wp.value2 > wp.value) blueCount++;
    });
    
    // Update the text on the UI
    const redCtrl = document.getElementById('red-controlled');
    const blueCtrl = document.getElementById('blue-controlled');
    
    if (redCtrl) redCtrl.textContent = redCount;
    if (blueCtrl) blueCtrl.textContent = blueCount;
}

/* Initialize the dashboard counts on load */
updateDashboard();
