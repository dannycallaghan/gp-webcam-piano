class Grid {
  // https://freesound.org/people/TEDAgame/packs/25405/
  constructor (_w, _h, _s, sounds) {
    this.gridWidth = _w;
    this.gridHeight = _h;
    this.noteDiam = _s;
    this.notes = [];
    this.sounds = sounds;
    

    this.configureSound();

    for (let x = 0; x < _w; x += this.noteDiam) {
      let positions = [];
      let states = [];
      for (let y = 0; y < _h; y += this.noteDiam) {
        positions = positions.concat([createVector(x + this.noteDiam / 2, y + this.noteDiam / 2)]);
        states = states.concat([0]);
      }
      const note = new Note(this.noteDiam, this.notes.length, states, positions, sounds);
      this.notes = this.notes.concat([note]);
    }
  }

  configureSound () {
    this.env = new p5.Envelope();
    this.env.setADSR(0.05, 0.1, 0.25, 0.5);
    this.env.setRange(1, 0);

    this.wave = new p5.Oscillator();
    this.wave.setType('sine');
    this.wave.start();
    this.wave.amp(this.env);
  }

  run (image) {
    image.loadPixels();

    this.drawNotes();

    window.setTimeout(() => {
      this.findNotes(image);
  
    }, 1000);

  }

  drawNotes () {
    for (let i = 0, x = this.notes.length; i < x; i++) {
      this.notes[i].draw(this.notes.length);
    }
  }

  findNotes (img) {
    // Find which is greater, width of image or height of image
    const largestDimension = max(img.width, img.height);
    // Work with image being largest dimension by largest dimension (ensure we can't miss a pixel)
    const allPixels = pow(largestDimension, 2);
    for (let i = 0, j = allPixels; i < j; i++) {
      const x = floor(i / largestDimension); // X pixels
      const y = i % largestDimension; // Y pixels
      const pixel = ((img.width * y) + x) * 4; // Get pixel array

      const state = img.pixels[pixel + 2];
      if (state === 0) {
        const screenX = map(x, 0, img.width, 0, this.gridWidth);
        const screenY = map(y, 0, img.height, 0, this.gridHeight);
        const i = int(screenX / this.noteDiam);
        const j = int(screenY / this.noteDiam);
        this.notes[i].activate(j, x, y);
      }
    }
  }
}

class Note {
  constructor (size, index, states, positions, sounds) {
    this.size = size;
    this.index = index;
    this.states = states;
    this.positions = positions;

    this.sounds = sounds;
  }

  draw (totalNotes) {

    
    for (let i = 0; i < this.positions.length; i++) {
      const x = this.positions[i].x;
      const y = this.positions[i].y;
      // Get index of note
      // const row = ((y - (this.size / 2)) / this.size) + 1;
      // const index = row * (this.index + 1);

      
      const octave = constrain(ceil((i + 3) / 2), 2, 7);
        const note = this.getIndexToNoteMapping(octave, this.index);



      if (this.states[i] === 1) {
        // Get index of the activated note
//        const row = ((y - (this.size / 2)) / this.size) + 1;
  //      const index = row * (i + 1);

        //const note = this.getIndexToNoteMapping(octave, i);


        
        
        this.play(note);
      }

      if (this.states[i] > 0) {
        // Colors for the filled circles
        const alpha = this.states[i] * 200;
        const c1 = color(255, 0, 0, alpha);
        const c2 = color(0, 255, 0, alpha);
        const mix = lerpColor(c1, c2, map(this.index, 0, totalNotes, 0, 1));

        

        // Filled circles
        push();
        translate(width / 2, 0)
        scale(-1.0, 1.0); 

        fill(mix);
        stroke(255, 255, 0);
        strokeWeight(4 * this.states[i]);
        ellipse(x, y, this.size * this.states[i], this.size * this.states[i]);
        pop();

        push();
        //Transparent circles
        //push();
        translate(width / 2, 0)
        scale(-1.0, 1.0); 

        stroke(255);
        strokeWeight(4 * (1 - this.states[i]));
        noFill();
        ellipse(x, y, this.size * (1 - this.states[i]), this.size * (1 - this.states[i]));
        //pop();

        pop();
        
        
        push();
        translate(width / 2, 0)
        //scale(-1.0, 1.0); 

        textSize(16);
        textAlign(CENTER, CENTER);
        fill(255);
        text(note, x, y);
        pop();
        

        
        
      }

      this.states[i] -= 0.05;
      this.states[i] = constrain(this.states[i], 0 , 1);

      
    }
  }

  getIndexToNoteMapping (row, column) {

    const keys = ['c', 'c', 'c', 'd', 'd', 'e', 'e', 'f', 'f', 'g', 'g', 'a', 'a', 'a', 'b', 'b'];

    let result = `${keys[column]}${row}`;



    return result;
  }

  play (note) {
    //this.wave.freq(300);
    //this.env.play()

    //const index = floor(map(note, 1, 64, 0, 63));

    //console.warn(note, index);

    //console.warn(note);

    //console.log(this.sounds);

    // if (!this.sounds[note]) {
    //   console.log(`Don't have a ${note}`);
    // }

    //this.sounds[note].duration(0.2);
    //this.sounds[note].play();

    //console.log(note);


  }

  activate (index, x, y) {

    
    

    this.states[index] = 1;


    
  }
}