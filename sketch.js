// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let stage = 0;
let stageResult = [0, 0]
let poseOffset = 10
let confidenceOffset = 0.5
let stopCounting = false

let currentFrame = 0
let delayFrame = 40

let page = 0;

let imgLogo;
let imgO;
let imgStar;
let radio = 640 / 480

let waitTime = 5;
let waitTimeFuncVar;

let nextStageTime = 1000;
let nextStageTimeVar;


// function preload() {
//   imgLogo = loadImage('assets/logo.png');
//   imgO = loadImage('assets/o.png');
//   imgStar = loadImage('assets/star.png');
// }

function setUpStepDetail() {
    let stepDetail = document.getElementById('actionDetails');
    switch (String(stage)) {
        case '0':
            stepDetail.innerHTML = "先提起右腿，然後放下；再提起左腿，然後放下，共提腿8次"
            break;
        case '1':
            stepDetail.innerHTML = "重複第1組動作，先提起右腿，然後放下；再提起左腿，然後放下；每次提腿時，雙手同時推向前面上方，共8次。"
            break;
        case '2':
            stepDetail.innerHTML = "重複第1組動作，先提起右腿，然後放下；再提起左腿，然後放下；每次提腿時，提腿稍高，雙手同時在腿下拍掌，共8次。"
            break;
        default:
            break;
    }
}

function setup() {
    stage = sessionStorage.getItem('step');
    // console.log(step)
    if (stage == null) {
        //return home
        window.location.href = "./home.html";
        return
    }

    setUpStepDetail()
    sessionStorage.setItem('resultStep' + String(stage), stageResult);

    parWidth = document.getElementById('mainContainer').clientWidth
    cnv = createCanvas(parWidth, parWidth / radio);
    cnv.parent('canvas');
    video = createCapture(VIDEO);
    video.size(width, height);

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function(results) {
        poses = results;
    });
    // Hide the video element, and just show the canvas
    video.hide();

    waitTimeFuncVar = setInterval(waitTimeFunc, 1000)
}

function waitTimeFunc() {
    // console.log(waitTime)
    waitTime = waitTime - 1
    if (waitTime <= -1) {
        clearInterval(waitTimeFuncVar)
        nextStageTimeVar = setInterval(nextStageTimeFunc, 1000)
    }
}

function nextStageTimeFunc() {
    if (nextStageTime <= 0) {
        clearInterval(nextStageTimeVar)
        window.location.href = "./evaluation.html";
    }
    nextStageTime = nextStageTime - 1
}

function windowResized() {
    parWidth = document.getElementById('mainContainer').clientWidth
    resizeCanvas(parWidth, parWidth / radio);
}

function modelReady() {
    select('#status').html('Model Loaded');
}

function draw() {
    background(51);
    image(video, 0, 0, width, height);
    // textAlign(CENTER, CENTER);
    // text('CENTER', 0, 37, width);
    fill(0, 102, 255);
    if (waitTime > -1) {
        textSize(128);
        textAlign(CENTER, CENTER);
        // fill(0, 102, 255);
        text(waitTime, 0, height / 2, width);
    } else {
        // We can call both functions to draw all keypoints and the skeletons
        drawKeypoints();
        drawSkeleton();
        if (!stopCounting) {
            countMovement();
            if (Math.max(stageResult[0], stageResult[1]) >= 8) {
                window.location.href = "./evaluation.html";
            }

        } else {
            if (frameCount - currentFrame > delayFrame) {
                stopCounting = false;
            }
        }
        textSize(60);
        textAlign(LEFT, TOP);
        // fill(255, 0, 0);
        text("Stage: " + String(parseInt(stage) + 1), 40, 10);
        text("Count: " + stageResult[0] + ", " + stageResult[1], 40, 70);
        text("Mark: " + Math.max(stageResult[0], stageResult[1]) + '/8', 40, 130);
        text("Time Left: " + nextStageTime, 40, 190)
        
        
        /*text("Count: " + stageResult[0] + ", " + stageResult[1], 25, 30);
        text("Mark: " + Math.max(stageResult[0], stageResult[1]) + '/8', 25, 80);*/
        
        /*text("Left confidence: " + test1, 25, 230);   // Debuging reading
        text("Right confidence: " + test2, 25, 280);   // Debuging reading*/
        /*test("leftKnee: " + test2, 25, 80);
        text("rightKnee: " + test3, 25, 130);
        */
    }
}

function countMovement() {
    // console.log(poses);
    let record0 = stageResult[0];
    let record1 = stageResult[1];

    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i].pose;
        let leftKnee = pose.leftKnee;
        let rightKnee = pose.rightKnee;
        let leftWrist = pose.leftWrist;
        let leftElbow = pose.leftElbow;
        let rightWrist = pose.rightWrist;
        let rightElbow = pose.rightElbow;

        switch (String(stage)) {
            case '0':
                if (leftKnee.confidence < confidenceOffset || rightKnee.confidence < confidenceOffset) {
                    break;
                }
              
                if (rightKnee.y > leftKnee.y + poseOffset) {
                    stageResult[0] += 1
                } else if (leftKnee.y > rightKnee.y + poseOffset) {
                    stageResult[1] += 1
                }
            case '1':
                if (leftKnee.confidence < confidenceOffset || rightKnee.confidence < confidenceOffset) {
                    break;
                }
                
                if (rightKnee.y > leftKnee.y + poseOffset) {
                    stageResult[0] += 1
                } else if (leftKnee.y > rightKnee.y + poseOffset) {
                    stageResult[1] += 1
                }
                                
                break;
            case '2':
                   if (leftKnee.y > leftElbow.y + poseOffset + 5 && leftKnee.y > rightKnee.y + poseOffset && leftKnee.confidence > confidenceOffset && leftElbow.confidence > confidenceOffset) {
                    stageResult[0] += 1
                } else if (rightKnee.y > rightElbow.y + poseOffset + 5 && rightKnee.y > leftKnee.y + poseOffset && rightKnee.confidence > confidenceOffset && rightElbow.confidence > confidenceOffset) {
                    stageResult[1] += 1
                }
                break;
            default:
                break;
        }

        //Count only one person;
        break;
    }
    // console.log(stageResult[0], stageResult[1])
    if (record0 != stageResult[0] || record1 != stageResult[1]) {
        stopCounting = true;
        currentFrame = frameCount;
        sessionStorage.setItem('resultStep' + String(stage), stageResult);
    }

    //testing 
    // if (stageResult[0] >= 8 && stageResult[1] >= 8) {
    //     stageResult = [0, 0]
    //     stage += 1
    // }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                fill(255, 0, 0);
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
            }
        }
    }
}

// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            stroke(255, 0, 0);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}
