/**
 * Grid class
 *
 * Divides screen into grid
 */
class Grid {

  // https://freesound.org/people/TEDAgame/packs/25405/

  /**
   * Constructor
   *
   * @param {number} w - The width of the grid
   * @param {number} h - The height of the grid
   * @param {number} x - The x position of the grid
   * @param {number} y - The y position of the grid
   * @param {number} size - The size of the 'note' (grid cells)
   * @param {object} sounds - The preloaded sounds
   *
   */
  constructor (w, h, x, y, size, sounds) {
    this.gridWidth = w;
    this.gridHeight = h;
    this.xPos = x;
    this.yPos = y;
    this.noteDiam = size;
    this.sounds = sounds;
    this.notes = [];
    this.image = null;

    for (let x = this.xPos; x < this.gridWidth + this.xPos; x += this.noteDiam) {
      let positions = [];
      let states = [];
      for (let y = this.yPos; y < this.gridHeight + this.yPos; y += this.noteDiam) {
        positions = positions.concat([createVector(x + this.noteDiam / 2, y + this.noteDiam / 2)]);
        states = states.concat([0]);
      }
      const note = new Note(this.noteDiam, this.notes.length, states, positions, sounds);
      this.notes = this.notes.concat([note]);
    }
  }

  /**
   * Starts the grid functionality
   *
   * @param {image} image - The image to analyse for motion (black pixels)
   *
   * @return void.
   */
  run (image) {
    this.image = image;
    this.image.loadPixels();
    this.drawNotes();
    this.findNotes();
  }

  /**
   * Draws all the grid element
   *
   * @return void.
   */
  drawNotes () {
    for (let i = 0, x = this.notes.length; i < x; i++) {
      this.notes[i].draw(this.notes.length);
    }
  }

  /**
   * Analyses the image for motion and works
   * out which grid elements to show
   *
   * @return void.
   */
  findNotes () {
    const img = this.image;
    // Find which is greater, width of image or height of image
    const largestDimension = max(img.width, img.height);
    // Work with image being largest dimension by largest dimension (ensure we can't miss a pixel)
    const allPixels = pow(largestDimension, 2);
    for (let i = 0, j = allPixels; i < j; i++) {
      const x = floor(i / largestDimension); // X pixels
      const y = i % largestDimension; // Y pixels
      const pixel = ((img.width * y) + x) * 4; // Get pixel array

      const state = img.pixels[pixel + 0];
      if (state === 0) {
        const screenX = map(x, 0, img.width, this.gridWidth, 0);
        const screenY = map(y, 0, img.height, 0, this.gridHeight);
        const i = constrain(int(screenX / this.noteDiam), 0, 15);
        const j = constrain(int(screenY / this.noteDiam), 0, 11);
        // Activate the note in this grid cell
        this.notes[i].activate(j, x, y);
      }
    }
  }
}