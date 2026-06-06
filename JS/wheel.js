
//  INITIALIZATION — runs when the page first loads
//  1. Read options from localStorage (saved by input-page.js)
//  2. If no options found, send user back to input page
//  3. Draw the wheel and populate the options list
function init() {
    const saved = localStorage.getItem('wheelOptions');

    if (!saved) {
        window.location.href = 'index.html';
        return;
    }
    // JSON.parse turns '["Pizza","Sushi"]' back into ["Pizza","Sushi"]
    options = JSON.parse(saved);

    drawWheel();
    renderOptionsList(); //Populate
}


// CANVAS SETUP 
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

// The center point  (origin ) of the wheel
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const RADIUS = 210;

// Each segment gets one of these colors --- segment color array
const SEGMENT_COLORS = [
    '#f0c040',
    '#e05c5c',
    '#5b9cf6',
    '#6ddc8b',
    '#f09a40',
    '#c47ef0',
    '#f06090',
    '#40d4d4',
];

// ----- STATE -----
let options = [];
let currentAngle = 0;       // how much the wheel has rotated (in radians)
let isSpinning = false;     // prevents double-clicking spin


/* DRAWING THE WHEEL
 We draw each segment as a pie slice:
   1. Move to center
   2. Draw arc from startAngle to endAngle
   3. Close path back to center (makes the triangular slice shape)
   4. Fill with color
   5. Draw the option label text inside the slice
 The wheel is drawn at whatever `currentAngle` is.
 During spinning, currentAngle changes and we redraw constantly.*/

function drawWheel() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sliceAngle = (2 * Math.PI) / options.length;  // angle for each slice of pie(option)
    let startAngle = currentAngle - Math.PI / 2;

    options.forEach((option, index) => { //Loop runs as many times as teh options
        const endAngle = startAngle + sliceAngle;

        // Draw slice 
        ctx.beginPath();
        ctx.moveTo(cx, cy);                          // centre of circle
        ctx.arc(cx, cy, RADIUS, startAngle, endAngle); // draw the curved edge
        ctx.closePath();                             // line back to center

        ctx.fillStyle = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
        ctx.fill();

        //Draw border between slices
        ctx.strokeStyle = '#0f0f0f';
        ctx.lineWidth = 2;
        ctx.stroke();

        //Draw the label text
        drawLabel(option, startAngle, sliceAngle);

        // Move startAngle forward for the next segment
        startAngle = endAngle;
    });

    // Draw outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = '#7288ae';
    ctx.lineWidth = 4;
    ctx.stroke();
}


/* DRAW LABEL — writes the option text inside a slice
 To place text inside a pie slice we:
 1. Find the middle angle of the slice (halfway between start and end)
 2. Move out from center by ~65% (roughly 2/3) of the radius towards the edge
 3. Rotate the canvas context to match that angle
 4. Draw the text horizontally (it appears rotated because the canvas is rotated)*/

function drawLabel(text, startAngle, sliceAngle) {

    const midAngle = startAngle + sliceAngle / 2; //middle angle    
    const textRadius = RADIUS * 0.62;

    // Calculate the x,y cordinates from the angle for the text
    const x = cx + Math.cos(midAngle) * textRadius;
    const y = cy + Math.sin(midAngle) * textRadius;

    // Save current canvas state before rotating
    ctx.save();

    // Move origin to the text position, rotate, then draw
    ctx.translate(x, y);
    ctx.rotate(midAngle + Math.PI / 2);  // rotate text to follow the slice direction

    ctx.fillStyle = '#0f0f0f';
    ctx.font = 'bold 16px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Truncate long text so it fits inside the slice
    const maxLength = 10;
    const displayText = text.length > maxLength ? text.slice(0, maxLength) + '…' : text;

    ctx.fillText(displayText, 0, 0);

    // Restore canvas to its state before our rotation
    ctx.restore();
}


/*SPINNING
 1. Pick a random total rotation (many full spins + random extra)
 2. Every animation frame, add a little to currentAngle
 3. Gradually reduce how much we add (deceleration)
 4. When speed drops to near zero, the spin is done
 We use requestAnimationFrame for smooth 60fps animation */

function spinWheel() {

    if (isSpinning)
        return;

    isSpinning = true;
    // Disable the spin button while spinning
    document.getElementById('spin-btn').disabled = true;

    // Pick a random spin amount i.e. how maany full spins or extra angles
    const minSpins = 5;
    const maxSpins = 10;
    const extraAngle = Math.random() * 2 * Math.PI;  // random 0 to 360°
    const totalRotation = (minSpins + Math.random() * (maxSpins - minSpins)) * 2 * Math.PI + extraAngle;

    // ----- Animation variables -----
    let rotated = 0;        // how much we've rotated so far
    let speed = 0.3;        // starting speed (radians per frame)
    const deceleration = 0.985;  // multiply speed by this each frame (slows it down) --- 
    // 0.985 means each frame speed = speed * 0.985, so it gradually approaches 0

    function animate() {
        if (rotated >= totalRotation || speed < 0.001) {
            // ----- Spin is done -----
            isSpinning = false;
            document.getElementById('spin-btn').disabled = false;
            showResult();
            return;
        }

        // Add speed to the current angle and track total rotation, to slowdown multiply to deceleration
        currentAngle += speed;
        rotated += speed;
        speed *= deceleration;

        // Redraw the wheel at the new angle
        drawWheel();

        // Ask the browser to call animate() again on the next frame
        requestAnimationFrame(animate);
        //You're passing animate into it — not calling animate() yourself, but handing it over and saying "you call it when ready." 
        //This pattern is called a callback — a function you pass to something else to be called later. It cooperates with the browser 
        // rather than fighting it, which is why the animation stays smooth at 60fps without locking anything up.
    }

    // Kick off the animation loop
    requestAnimationFrame(animate);
}


/* FIGURING OUT THE WINNER
 The pointer is fixed at the top of the wheel (12 o'clock).
 That position in angle terms is -π/2 (or 270°).

 After spinning, we need to check: which segment is currently
 sitting under the pointer?
 Steps:
 1. Normalize currentAngle to 0–2π range
 2. The pointer sits at angle 0 relative to the wheel's start
    (because we offset by -π/2 when drawing)
 3. Walk through segments adding up their angles
 4. Whichever segment's range contains angle 0 is the winner*/

function getWinningSegment() {

    const sliceAngle = (2 * Math.PI) / options.length;
    const normalizedAngle = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // The pointer is at the 12 o'clock position.
    // We drew segments starting from -π/2 (top).
    // So the segment under the pointer is the one whose range contains
    // (2π - normalizedAngle), because as the wheel rotates forward,
    // the pointer effectively moves backward relative to the segments.
    const pointerAngle = (2 * Math.PI - normalizedAngle) % (2 * Math.PI);

    const winngIndex = Math.floor(pointerAngle / sliceAngle) % options.length;

    return options[winngIndex];
}

// SHOWING THE RESULT
function showResult() {
    const winner = getWinningSegment();

    let resultDisplay = document.getElementById('js-result-card');
    resultDisplay.innerHTML = `<p class="result-label">The wheel chose</p>
            <p class="result-text" id="result-text">${winner}</p>`;

    resultDisplay.style.display = 'flex';

}

function goBack(keepOptions) {
    if (!keepOptions) {
        localStorage.removeItem('wheelOptions');
    }
    window.location.href = 'index.html';
}

// ============================================================
//  ADDING OPTIONS AFTER SPINNING
//
//  User types in the input and clicks +
//  We add to the options array and redraw the wheel
// ============================================================

// function addOptionFromWheel() {
//     const input = document.getElementById('new-option-input');
//     const value = input.value.trim();

//     if (value === '') return;

//     if (options.length >= 8) {
//         alert('Maximum 8 options reached.');
//         return;
//     }

//     // Add to our options array
//     options.push(value);

//     // Save the updated options back to localStorage
//     localStorage.setItem('wheelOptions', JSON.stringify(options));

//     // Clear the input field
//     input.value = '';

//     // Rebuild the options list in the panel
//     renderOptionsList();

//     // Redraw the wheel with the new segment
//     drawWheel();
// }


// ============================================================
//  RENDERING THE OPTIONS LIST IN THE SIDE PANEL
//
//  This clears the <ul> and rebuilds it from the options array.
//  Each <li> shows a colored dot (matching the wheel) and the text.
// ============================================================

function renderOptionsList() {
    const list = document.getElementById('options-list');
    list.innerHTML = '';  // clear existing items

    options.forEach((option, index) => {
        const li = document.createElement('li');

        // Color dot
        const dot = document.createElement('span');
        dot.className = 'color-dot';
        dot.style.background = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

        // Label
        const label = document.createElement('span');
        label.className = 'option-label';
        label.textContent = option;

        li.appendChild(dot);
        li.appendChild(label);
        list.appendChild(li);
    });
}

// Run init() as soon as the page loads
init();