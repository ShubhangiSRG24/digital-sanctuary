let myVoice, myBrush, hiddenImage;
let started = false;
let dust = [];
let scratchLayer; 
let imgX, imgY, imgW, imgH;

// Randomized & Timer variables
let startTime;
let fadeAlpha = 0; // We will fade a black overlay instead of tinting the graphic
let imageOptions = ['assets/secret_art1.jpg', 'assets/secret_art2.jpg', 'assets/secret_art3.jpg'];

function preload() {
    soundFormats('mp3', 'm4a');
    myVoice = loadSound('assets/voice.m4a');
    myBrush = loadImage('assets/brush.png');
    
    let randomPath = random(imageOptions);
    hiddenImage = loadImage(randomPath); 
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    calculateFit();

    scratchLayer = createGraphics(windowWidth, windowHeight);
    scratchLayer.background(10, 10, 15); 
    scratchLayer.noStroke();
    
    noCursor(); 
}

function calculateFit() {
    let screenAspect = width / height;
    let imgAspect = hiddenImage.width / hiddenImage.height;
    if (screenAspect > imgAspect) {
        imgW = width; imgH = width / imgAspect;
    } else {
        imgH = height; imgW = height * imgAspect;
    }
    imgX = width / 2; imgY = height / 2;
}

function draw() {
    background(0);
    
    if (started) {
        let speed = dist(mouseX, mouseY, pmouseX, pmouseY);
        let pitch = map(mouseY, height, 0, 0.85, 1.15, true); 

        // 1. DRAW IMAGE
        push();
        imageMode(CENTER);
        image(hiddenImage, imgX, imgY, imgW, imgH);
        pop();

        // 2. SCRATCHING LOGIC (Using your original circle method)
        if (speed > 0.1) {
            scratchLayer.erase(); 
            let scratchSize = map(speed, 0, 50, 80, 160, true);
            scratchLayer.circle(mouseX, mouseY, scratchSize);
            scratchLayer.noErase(); 
        }

        // 3. DISPLAY SCRATCH LAYER (No tint here = No lag!)
        image(scratchLayer, 0, 0);

        // 4. THE 35-SECOND AUTO-REVEAL (Efficient Fade)
        // Instead of fading the scratchLayer, we "cover" it with black that disappears
        if (millis() - startTime > 5000) {
            fadeAlpha += 5; // We increase "erasing" opacity
        }
        
        if (fadeAlpha > 0) {
            // This effectively "eats away" at the remaining black paint
            scratchLayer.erase(fadeAlpha);
            scratchLayer.rect(0, 0, width, height);
            scratchLayer.noErase();
        }

        // 5. STARDUST
        myVoice.rate(pitch);
        myVoice.setVolume(map(speed, 0, 40, 0.3, 1.0, true), 0.2); 

        if (speed > 1) {
            for (let i = 0; i < 2; i++) {
                dust.push(new Star(mouseX, mouseY, pitch));
            }
        }

        blendMode(ADD);
        for (let i = dust.length - 1; i >= 0; i--) {
            dust[i].update();
            dust[i].show();
            if (dust[i].alpha <= 0) dust.splice(i, 1);
        }
        blendMode(BLEND);

        // 6. THE BRUSH POINTER
        push();
        imageMode(CENTER);
        image(myBrush, mouseX, mouseY, 60, 60);
        pop();
    } else {
        background(10, 10, 15);
    }
}

class Star {
    constructor(x, y, pitch) {
        this.x = x + random(-5, 5);
        this.y = y + random(-5, 5);
        this.vx = random(-0.2, 0.2);
        this.vy = random(0.2, 0.8);
        this.alpha = 255;
        this.size = random(2, 5) * pitch;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.alpha -= 5;
    }
    show() {
        noStroke();
        fill(255, 250, 200, this.alpha);
        circle(this.x, this.y, this.size);
    }
}

function mousePressed() {
    if (!started) {
        userStartAudio().then(() => {
            myVoice.loop();
            startTime = millis(); 
            started = true;
        });
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

//------------------------------Sample------------------------------------
// let myVoice, myBrush, hiddenImage;
// let started = false;
// let dust = [];
// let scratchLayer; // This is the "lottery paint" layer
// let imgX, imgY, imgW, imgH;

// function preload() {
//     soundFormats('mp3', 'm4a');
//     myVoice = loadSound('assets/voice.m4a');
//     myBrush = loadImage('assets/brush.png');
//     hiddenImage = loadImage('assets/secret_art.jpg'); 
// }

// function setup() {
//     createCanvas(windowWidth, windowHeight);
//     calculateFit();

//     // 1. CREATE THE "LOTTERY COATING"
//     // This creates a separate canvas layer that sits on top of the image
//     scratchLayer = createGraphics(windowWidth, windowHeight);
//     scratchLayer.background(10, 10, 15); // The dark "paint" covering the image
    
//     noCursor(); 
// }

// function calculateFit() {
//     let screenAspect = width / height;
//     let imgAspect = hiddenImage.width / hiddenImage.height;
//     if (screenAspect > imgAspect) {
//         imgW = width; imgH = width / imgAspect;
//     } else {
//         imgH = height; imgW = height * imgAspect;
//     }
//     imgX = width / 2; imgY = height / 2;
// }

// function draw() {
//     // The "Bottom" is the hidden art
//     background(0);
    
//     if (started) {
//         let speed = dist(mouseX, mouseY, pmouseX, pmouseY);
//         let pitch = map(mouseY, height, 0, 0.85, 1.15, true); 

//         // 2. DRAW THE HIDDEN IMAGE FIRST (At the bottom)
//         push();
//         imageMode(CENTER);
//         image(hiddenImage, imgX, imgY, imgW, imgH);
//         pop();

//         // 3. THE "SCRATCHING" LOGIC
//         // We go inside the scratchLayer and "erase" parts of it
//         if (speed > 0.1) {
//             scratchLayer.erase(); // This tells p5 to REMOVE pixels instead of painting them
//             scratchLayer.fill(255);
//             // The size of the "coin" or "brush" doing the scratching
//             let scratchSize = map(speed, 0, 50, 80, 160, true);
//             scratchLayer.circle(mouseX, mouseY, scratchSize);
//             scratchLayer.noErase(); 
//         }

//         // 4. DISPLAY THE SCRATCH LAYER (On top)
//         image(scratchLayer, 0, 0);

//         // 5. ADD THE STARDUST (On the very top for magic)
//         myVoice.rate(pitch);
//         myVoice.setVolume(map(speed, 0, 40, 0.3, 1.0, true), 0.2); 

//         if (speed > 1) {
//             for (let i = 0; i < 2; i++) {
//                 dust.push(new Star(mouseX, mouseY, pitch));
//             }
//         }

//         blendMode(ADD);
//         for (let i = dust.length - 1; i >= 0; i--) {
//             dust[i].update();
//             dust[i].show();
//             if (dust[i].alpha <= 0) dust.splice(i, 1);
//         }
//         blendMode(BLEND);

//         // 6. THE BRUSH POINTER
//         push();
//         imageMode(CENTER);
//         image(myBrush, mouseX, mouseY, 60, 60);
//         pop();
//     } else {
//         // Show a black screen before starting
//         background(10, 10, 15);
//     }
// }

// class Star {
//     constructor(x, y, pitch) {
//         this.x = x + random(-5, 5);
//         this.y = y + random(-5, 5);
//         this.vx = random(-0.2, 0.2);
//         this.vy = random(0.2, 0.8);
//         this.alpha = 255;
//         this.size = random(2, 5) * pitch;
//     }
//     update() {
//         this.x += this.vx; this.y += this.vy;
//         this.alpha -= 5;
//     }
//     show() {
//         noStroke();
//         fill(255, 250, 200, this.alpha);
//         circle(this.x, this.y, this.size);
//     }
// }

// function mousePressed() {
//     if (!started) {
//         userStartAudio().then(() => {
//             myVoice.loop();
//             started = true;
//         });
//     }
// }

// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);
//     // Note: Resizing the scratchLayer during play will reset the "scratch"
//     // Better to keep it as is or handle logic to redone background
// }
