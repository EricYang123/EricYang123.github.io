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
    { id: 1, name: "Lougheed",   x: 66.15, y: 39,   value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
    { id: 2, name: "Burquitlam", x: 69.9,  y: 34.2, value: 0, value2: 0, unit: "Red Team", unit2: "Blue Team" },
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
    if (wp.value > wp.value2) {
        pin.style.background  = '#cc2222';
        pin.style.borderColor = '#ffaaaa';
    } else if (wp.value2 > wp.value) {
        pin.style.background  = '#1a5fcc';
        pin.style.borderColor = '#aac4ff';
    } else {
        pin.style.background  = '#888';
        pin.style.borderColor = '#ccc';
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
                wp[btn.dataset.field] += parseInt(btn.dataset.dir);
                render();
                updatePinColor(wp);
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
    el.innerHTML = `<div class="waypoint-pin"><div class="waypoint-pin-inner"></div></div>`;

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
