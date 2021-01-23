let video;
let threshold;
let thresholdSlider;
let prevImg;
let currentImg;
let diffImg;
let grid;

/**
 * P5 setup functionality
 *
 * @return void.
 */
function setup() {
  createCanvas(640 * 2, 480);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.hide();
  noStroke();
  
  thresholdSlider = createSlider(0, 255, 255);
  thresholdSlider.position(20, 20);

  grid = new Grid(640,480);
}

/**
 * P5 draw functionality
 *
 * @return void.
 */
function draw () {
  background(0);
  image(video, 0, 0);

  //push();
  //translate(width / 2, 0); // move to far corner
  //scale(-1.0, 1.0);    // flip x-axis backwards
  //image(video, 0, 0); //video on canvas, position, dimensions
  //pop();

  console.warn(video.width, video.height);

  currImg = createImage(video.width, video.height);
  currImg.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);

  currImg.resize(video.width / 4, video.height / 4);
  currImg.filter(BLUR, 3);

  diffImg = createImage(video.width, video.height);
  diffImg.resize(video.width / 4, video.height / 4);
  
  diffImg.loadPixels();

  threshold = thresholdSlider.value();

  if (prevImg) {
    currImg.loadPixels();
    prevImg.loadPixels();
    for (let x = 0, i = currImg.width; x < i; x++) {
      for (let y = 0, j = currImg.height; y < j; y++) {
        const pixel = ((currImg.width * y) + x) * 4;
        
        const redSource = currImg.pixels[pixel];
        const greenSource = currImg.pixels[pixel + 1];
        const blueSource = currImg.pixels[pixel + 2];

        const redBack = prevImg.pixels[pixel];
        const greenBack = prevImg.pixels[pixel + 1];
        const blueBack = prevImg.pixels[pixel + 2];

        let d = dist(redSource, greenSource, blueSource, redBack, greenBack, blueBack);
        if (d > threshold) {
          diffImg.pixels[pixel] = 0;
          diffImg.pixels[pixel + 1] = 0;
          diffImg.pixels[pixel + 2] = 0;
          diffImg.pixels[pixel + 3] = 255;
        } else {
          diffImg.pixels[pixel] = 255;
          diffImg.pixels[pixel + 1] = 255;
          diffImg.pixels[pixel + 2] = 255;
          diffImg.pixels[pixel + 3] = 255;
        }
      }
    }
  }
  diffImg.updatePixels();
  image(diffImg, 640, 0);

  prevImg = createImage(video.width, video.height);
  prevImg.copy(currImg, 0, 0, currImg.width, currImg.height, 0, 0, currImg.width, currImg.height);

  grid.run(diffImg);
}
