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
    this.octaves = 7;
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
      const octave = constrain(ceil((i + 3) / 2), 2, this.octaves);
      const note = this.getIndexToNoteMapping(octave, this.index);

      // If the state is completely 'on' (1) play note
      if (this.states[i] === 1) {
        this.doPlay(`${octave}${this.index}`);
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
   * Maps a row and a column of the grid to a musical note (C2 - B7) for display
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
  doPlay (note) {
    if (!this.sounds[note].isPlaying()) {
      this.sounds[note].playMode('restart');
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