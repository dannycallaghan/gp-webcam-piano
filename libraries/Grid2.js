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

/**
 * Note class
 * 
 * Controls the display and 'playing' of a note
 */
class Note {

  /**
   * Constructor
   * 
   * @param {number} size - The size of the 'note' (grid cells)
   * @param {number} index - The index of the instance of this class
   * @param {number} states - The number of states
   * @param {number} positions - The positions
   * @param {object} sounds - The preloaded sounds 
   *  
   */
  constructor (size, index, states, positions, sounds) {
    this.size = size;
    this.index = index;
    this.states = states;
    this.positions = positions;
    this.sounds = sounds;
  }

  /**
   * Calculates note position and which items should be visible depending on state
   * 
   * @param {number} totalNotes - The total number of notes that will be displayed (used for the colours)
   *  
   * @return void.
   */
  draw (totalNotes) {
    for (let i = 0; i < this.positions.length; i++) {
      const x = this.positions[i].x;
      const y = this.positions[i].y;
      const octave = constrain(ceil((i + 3) / 2), 2, 7);
      const note = this.getIndexToNoteMapping(octave, this.index);
      
      // If the state is completely 'on' (1) play note
      if (this.states[i] === 1) {
        this.play(note);
      }

      if (this.states[i] > 0) {
        // Colors for the filled circles
        const alpha = this.states[i] * 200;
        const c1 = color(100, 0, 0, alpha);
        const c2 = color(0, 0, 100, alpha);
        const mix = lerpColor(c1, c2, map(this.index, 0, totalNotes, 0, 1));

        // Filled circles
        this.drawCircle(this.states[i], x, y, this.size * this.states[i], 3 * this.states[i], [255, 255, 0], mix);

        // Transparent circles
        this.drawCircle(this.states[i], x, y, this.size * (1 - this.states[i]), 2 * (1 - this.states[i]), [255, 255, 255], null);
        
        // Draw the notes
        this.drawNoteText(note, x, y, this.states[i], null);
      }
      this.states[i] -= 0.05;
      this.states[i] = constrain(this.states[i], 0 , 1);
    }
  }

  /**
   * Draws a circle where a grid cell has been activated
   * 
   * @param {number} state - The current state of the circle
   * @param {number} x - The x position of the circle
   * @param {number} y - The x position of the circle
   * @param {number} size - The current size of the circle
   * @param {number} borderWidth - The current width of the border
   * @param {array} borderColour - RGB array of the border colour
   * @param {p5 colour | null} colour - The colour of the circle
   *  
   * @return void.
   */
  drawCircle (state, x, y, size, borderWidth, borderColour, colour) {
    if (colour) {
      fill(colour);
    } else {
      noFill();
    }
    stroke(...borderColour);
    strokeWeight(borderWidth);
    ellipse(x, y, size);
  }

  /**
   * Draws the text of the note being plates (C2 - B7)
   * 
   * @param {string} note - The note being playes
   * @param {number} x - The x position of the note
   * @param {number} y - The x position of the note
   * @param {number} state - The current state of the note
   *  
   * @return void.
   */
  drawNoteText (note, x, y, state) {
    const textY = y + (state * 60);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    fill(0, 255, 0);
    text(note.charAt(0).toUpperCase(), x, textY);
    textSize(12);
    fill(200);
    text(note.charAt(1), x + 10, textY - 3);
  }

  /**
   * Maps a row and a column of the grid to a musical note (C2 - B7)
   * 
   * @param {number} row - The row of the note being playes
   * @param {number} column - The column of the note being played
   *  
   * @return {string} - The name of the note being playes
   */
  getIndexToNoteMapping (row, column) {
    // Spread these out for 'best sound'. We have 7 notes and 16 positions.
    const keys = ['c', 'c', 'c', 'd', 'd', 'e', 'e', 'f', 'f', 'g', 'g', 'a', 'a', 'a', 'b', 'b'];
    let result = `${keys[column]}${row}`;
    return result;
  }

  /**
   * Plays a soundFile
   * 
   * @param {string} note - The object key of the sounds object holding the correct soundFile
   *  
   * @return void.
   */
  play (note) {
    if (!this.sounds[note].isPlaying()) {
      this.sounds[note].play();
    }
  }

  /**
   * Called from the Grid class. Sets the state of a grid cell to 1.
   *  
   * @return void.
   */
  activate (index, x, y) {
    this.states[index] = 1;
  }
}