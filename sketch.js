// Video capture
let video;

// Images used for analysis
let prevImg;
let diffImg;
let currImg;

// Slider and initial slider value
let thresholdSlider;
let threshold = 80;

// Flag to test if video is ready
let videoReady = false;

// Image and video dimensions
let subjectWidth = 640;
let subjectHeight = 480;
let topMargin = 40;

// Grid settings
const noteSize = 40; // Size of the 'note' (grid cells)
const delayGrid = 40; // Amount of frames until we consider grid ready
let noteSounds = {}; // Store the preloaded sounds
const keys = ['c', 'd', 'e', 'f', 'g', 'a', 'b']; // Musical notes (for the labels)
const octaves = 7; // Octaves used
const startAtOctave = 2; // Lowest octave to use

/**
 * P5 preload functionality
 * 
 * @return void.
 */
function preload () {
  soundFormats('ogg');
  // Preload all the piano sounds
  for (let i = 0; i < keys.length; i++) {
    for (let j = startAtOctave; j <= octaves; j++) {
      const file = `${keys[i]}${j}`;
      noteSounds[file] = loadSound(`./assets/${file}.ogg`);
    }
  }
}

/**
 * P5 setup functionality
 * 
 * @return void.
 */
function setup() {
  createCanvas(subjectWidth * 2, subjectHeight + topMargin);
  pixelDensity(1);

  // Create video capture
  video = createCapture(VIDEO, videoCallback);
  video.hide();

  // Create and render slider
  thresholdSlider = createSlider(0, 255, threshold);
  thresholdSlider.position(70, 11);

  // Initialise grid
  grid = new Grid(subjectWidth, subjectHeight, 0, topMargin, noteSize, noteSounds);
}

/**
 * Set a flag to know when the video has loaded. We
 * want to delay the grid start, or it fills the screen
 * with the grid (causing all notes tp play before
 * fading them all out, ready to begin
 * 
 * @return void.
 */
function videoCallback () {
  videoReady = true;
}

/**
 * P5 draw functionality
 * 
 * @return void.
 */
function draw() {
  background(100);

  // Flip the video and render it
  push();
  translate(width / 2, 0);
  scale(-1.0, 1.0);
  image(video, 0, topMargin, subjectWidth, subjectHeight);
  pop();

  // Get the sensitivity
  threshold = thresholdSlider.value();

  // Take picture
  currImg = createImage(video.width, video.height);
  currImg.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
  currImg.resize(video.width / 4, video.height / 4);
  currImg.filter(BLUR, 3);

  // Create a diff picture
  diffImg = createImage(video.width, video.height);
  diffImg.resize(video.width / 4, video.height / 4);
  diffImg.loadPixels();

  // Load previous image to the current image and load the different pixels into the diffImg
  if (typeof prevImg !== 'undefined') {
    prevImg.loadPixels();
    currImg.loadPixels();
    for (let x = 0; x < currImg.width; x++) {
      for (let y = 0; y < currImg.height; y++) {
        let index = (x + (y * currImg.width)) * 4;

        // Current image channels
        let redSource = currImg.pixels[index];
        let greenSource = currImg.pixels[index + 1];
        let blueSource = currImg.pixels[index + 2];

        // Previous image channels
        let redBack = prevImg.pixels[index];
        let greenBack = prevImg.pixels[index + 1];
        let blueBack = prevImg.pixels[index + 2];

        // Calculate the distance (get black pixels)
        let d = dist(redSource, greenSource, blueSource, redBack, greenBack, blueBack);

        let color = d > threshold ? 0 : 255;

        // Draw the diff pixels to the diff image
        diffImg.pixels[index] = color;
        diffImg.pixels[index + 1] = color;
        diffImg.pixels[index + 2] = color;
        diffImg.pixels[index + 3] = 255;
      }
    }
  }

  // Update the diff image
  diffImg.updatePixels();

  // Flip the diff image and render it
  push();
  translate(width, 0)
  scale(-1.0, 1.0); 
  image(diffImg, 0, topMargin, subjectWidth, subjectHeight);
  pop();

  // Draw the text labels
  drawLabels();

  // Create a 'previous' image and store a snapshot of the current image
  prevImg = createImage(currImg.width, currImg.height);
  prevImg.copy(currImg, 0, 0, currImg.width, currImg.height, 0, 0, currImg.width, currImg.height);

  // Run the grid if ready
  if (videoReady && frameCount > delayGrid) {
    push();
    grid.run(diffImg);
    pop();
  } else {
    // Draw loading indicator if not ready
    drawLoading();
  }
}

/**
 * Draw the loading message. Again, like the videoCallback
 * above, we want to delay the use of the grid until it has
 * 'settled down' and everything is ready, so give
 * feedback to the user
 * 
 * @return void.
 */
function drawLoading () {
  push();
  // Message background
  fill(255, 0, 0);
  noStroke();
  rect(width / 2 - 100, 8, 100, 26);
  // Message text
  fill(255, 255, 0);
  textSize(12);
  textAlign(RIGHT);
  text('LOADING...', width / 2 - 14, 25);
  pop();
}

/**
 * Label the slider
 * 
 * @return void.
 */
function drawLabels () {
  push();
  noStroke();
  fill(255);
  textAlign(LEFT);
  text('Sensitivity:', 10, 25);
  textAlign(LEFT);
  text(threshold, 206, 25);
  pop();
}