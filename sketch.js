// ********************************
// BACKGROUND SUBTRACTION EXAMPLE *
// ********************************
let video;
let prevImg;
let diffImg;
let currImg;
let thresholdSlider;
let threshold;
let grid;

const camWidth = 640;
const camHeight = 480;


let noteSounds = {};

const keys = ['c', 'c-', 'd', 'd-', 'e', 'f', 'f-', 'g', 'g-', 'a', 'a-', 'b'];
const octaves = 7;

function preload () {
  soundFormats('ogg');
  for (let i = 0; i < keys.length; i++) {
    for (let j = 2; j <= octaves; j++) {
      const file = `${keys[i]}${j}`;
      noteSounds[file] = loadSound(`./assets/${file}.ogg`);
      //noteSounds[file].playMode('restart');
      noteSounds[file].duration(0.1);
    }
  }
}

function setup() {
    pixelDensity(1);
    createCanvas(camWidth * 2, camHeight);
    video = createCapture(VIDEO, camWidth, camHeight);
    video.hide();

    thresholdSlider = createSlider(0, 255, 40);
    thresholdSlider.position(20, 20);

    //console.log(noteSounds);

  grid = new Grid(camWidth, camWidth, 40, noteSounds);
}

function draw() {
  pixelDensity(1);
  background(0);

  //push();
  
  

  
  push();
  translate(width / 2, 0)
  scale(-1.0, 1.0); 
  image(video, 0, 0, camWidth, camHeight);
  pop();
  
  //pop();

  currImg = createImage(video.width, video.height);
  currImg.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);

  currImg.resize(video.width / 4, video.height / 4);
  currImg.filter(BLUR, 3);

  diffImg = createImage(video.width, video.height);
  
  diffImg.resize(video.width / 4, video.height / 4);

  diffImg.loadPixels();

  threshold = thresholdSlider.value();

  if (typeof prevImg !== 'undefined') {
      prevImg.loadPixels();
      currImg.loadPixels();
      for (var x = 0; x < currImg.width; x += 1) {
          for (var y = 0; y < currImg.height; y += 1) {
              var index = (x + (y * currImg.width)) * 4;
              var redSource = currImg.pixels[index + 0];
              var greenSource = currImg.pixels[index + 1];
              var blueSource = currImg.pixels[index + 2];

              var redBack = prevImg.pixels[index + 0];
              var greenBack = prevImg.pixels[index + 1];
              var blueBack = prevImg.pixels[index + 2];

              var d = dist(redSource, greenSource, blueSource, redBack, greenBack, blueBack);

              if (d > threshold) {
                  diffImg.pixels[index + 0] = 0;
                  diffImg.pixels[index + 1] = 0;
                  diffImg.pixels[index + 2] = 0;
                  diffImg.pixels[index + 3] = 255;
              } else {
                  diffImg.pixels[index + 0] = 255;
                  diffImg.pixels[index + 1] = 255;
                  diffImg.pixels[index + 2] = 255;
                  diffImg.pixels[index + 3] = 255;
              }
          }
      }
  }
  diffImg.updatePixels();

  push();
  translate(width, 0)
  scale(-1.0, 1.0); 
  image(diffImg, 0, 0, camWidth, camHeight);
  pop();
  

  noFill();
  stroke(255);
  text(threshold, 160, 35);

  prevImg = createImage(currImg.width, currImg.height);
  prevImg.copy(currImg, 0, 0, currImg.width, currImg.height, 0, 0, currImg.width, currImg.height);

  //push();
  //translate(width / 2, 0)
  //scale(-1.0, 1.0); 
  grid.run(diffImg);
  //pop();
}

// faster method for calculating color similarity which does not calculate root.
// Only needed if dist() runs slow
function distSquared(x1, y1, z1, x2, y2, z2){
  var d = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) + (z2-z1)*(z2-z1);
  return d;
}
