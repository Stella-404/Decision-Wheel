Decision Wheel 🎡
Can't make up your mind? Let the wheel decide.
Decision Wheel is a lightweight, no-framework web app where you enter your options, spin a wheel, and let fate pick for you.

How It Works

Enter between 2 and 8 options on the input page
Hit Spin — the wheel page loads with your options drawn on a canvas wheel
Watch it spin and slow down naturally
The result is displayed once the wheel stops
Go back and edit your options anytime — they stay pre-filled


Features

Add up to 8 options, minimum 2
Add and remove option inputs dynamically
Smooth slide animation when adding or removing rows
Wheel drawn entirely with HTML5 Canvas — no libraries
Natural deceleration spin animation at 60fps
Options persist between pages via localStorage
Fully responsive — works on mobile and desktop

File Structure
decision-wheel/
├── index.html        — Input page where user enters options
├── index.css         — Styles for the input page
├── input-page.js     — Logic for adding, removing, validating options
├── wheel.html        — Wheel page with canvas and result display
├── wheel.css         — Styles for the wheel page
├── wheel.js          — Wheel drawing, spin animation, winner logic
└── global.cs         — a Global style page for both input page and the wheel page

Key Concepts Used

Canvas API — arc(), fillStyle, translate(), rotate() for drawing wheel segments and labels
requestAnimationFrame — smooth 60fps spin animation with natural deceleration
localStorage — simple key-value browser storage to pass data between pages without a backend
DOM manipulation — dynamic row creation, deletion, and renumbering
CSS animations — slide in/out transitions on input rows and result display


Constraints

Minimum 2 options required to spin
Maximum 8 options allowed
Option text truncated to 10 characters on the wheel for readability


Possible Future Improvements

Sound effect when the wheel stops
Confetti animation on result
Option to weight certain choices (make one more likely than others)
Save and load option presets
Dark / light mode toggle


Made with HTML, CSS, and Vanilla JS — no frameworks, no dependencies.
