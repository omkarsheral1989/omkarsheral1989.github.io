"use strict";

//TODO remove
var canvas = document.getElementById('canvas');
// canvas.width = document.getElementById('canvasContainer').clientWidth/2;
canvas.width = 439;


$(document).ready(function () {
  run();
  
  displaySamples();
});

var n, rows, columns;

jQuery('#run').click(function (event) {
  console.log('click');
  run();
});

function run() {
  try {
    n = getN();
    if (!n) {
      //noinspection ExceptionCaughtLocallyJS
      throw new Error("n is undefined");
    }
  } catch (e) {
    $("#inputNContainer").addClass("is-invalid");
    console.log(e);
    return;
  }
  //noinspection JSJQueryEfficiency
  $("#inputNContainer").removeClass("is-invalid");
  
  try {
    rows = getRows();
    if (!rows) {
      //noinspection ExceptionCaughtLocallyJS
      throw new Error("rows is undefined");
    }
  } catch (e) {
    $("#inputRowsContainer").addClass("is-invalid");
    console.log(e);
    return;
  }
  //noinspection JSJQueryEfficiency
  $("#inputRowsContainer").removeClass("is-invalid");
  
  try {
    columns = getColumns();
    if (!columns) {
      //noinspection ExceptionCaughtLocallyJS
      throw new Error("columns is undefined");
    }
  } catch (e) {
    $("#inputColumnsContainer").addClass("is-invalid");
    console.log(e);
    return;
  }
  //noinspection JSJQueryEfficiency
  $("#inputColumnsContainer").removeClass("is-invalid");
  
  var condition = getCondition().trim();
  
  var patternArray = new Array(rows);
  
  try {
    if (!condition) {
      //noinspection ExceptionCaughtLocallyJS
      throw new Error("Condition is empty");
    }
    for (var y = 0; y < rows; y++) {
      patternArray[y] = new Array(columns);
      for (var x = 0; x < columns; x++) {
        patternArray[y][x] = eval(condition);
      }
    }
    
    console.log(patternArray);
    drawDots(patternArray);
    
  } catch (e) {
    $("#conditionContainer").addClass("is-invalid");
    console.log(e);
  }
}

function getN() {
  var n = eval($('#n').val());
  console.log("n =", n);
  return n;
}

function getRows() {
  var r = eval($('#r').val());
  console.log("rows =", r);
  return r;
}

function getColumns() {
  var c = eval($('#c').val());
  console.log("columns =", c);
  return c;
}

function getCondition() {
  var condition = $('#condition').val();
  console.log("condition = ", condition);
  return condition;
}

function drawDots(patternArray) {
  var canvas = $('#canvas').get(0);
  var canvasCtx = canvas.getContext("2d");
  
  var patternColumns = patternArray[0].length;
  var patternRows = patternArray.length;
  
  //resize canvas
  var patternAspectRatio = patternRows / patternColumns;
  
  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height = canvas.width * patternAspectRatio;
  
  
  // var paddingHorizontal = canvasWidth * .10;
  // var drawWidth = canvasWidth - 2 * padding;
  // var drawHeight = canvasHeight - 2 * padding;
  
  //draw white
  canvasCtx.beginPath();
  canvasCtx.rect(0, 0, canvasWidth, canvasHeight);
  canvasCtx.fillStyle = '#fff';
  canvasCtx.fill();
  
  var unitLength = canvasWidth / (patternColumns);
  var radius = unitLength / 2;
  
  for (var y = 0; y < patternRows; y++) {
    for (var x = 0; x < patternColumns; x++) {
      if (patternArray[y][x]) {
        var centreX = x * unitLength + radius;
        var centreY = y * unitLength + radius;
        drawCircle(canvasCtx, centreX, centreY, radius * 1.1, "rgba(255,0,0,1.0)");
      }
    }
  }
  
  function resizeCanvas() {
    
  };
  
  function drawCircle(canvasCtx, centreX, centreY, radius, color) {
    canvasCtx.beginPath();
    canvasCtx.arc(centreX, centreY, radius, 0, 2 * Math.PI);
    canvasCtx.fillStyle = color;
    canvasCtx.fill();
  }
  
  
}

function displaySamples() {
  $.getJSON("./src/others/samples.json", function (samples) {
    samples.forEach(function (sample) {
      createSampleCard(sample);
    });
  });
  
  function createSampleCard(sample) {
    var samplesContainer = $('.samples-container');
    
    var clone = $(".sample-card:first").clone();
    $(".sample-card-name", clone).text(sample.name);
    clone.css("background-image", "url('" + sample.image + "')");
    clone.removeClass('display-none');
    
    clone.click(function () {
      console.log("sample click", sample.name);
      displayPattern(sample.pattern);
      showToast("displaying " + sample.name);
    });
    
    clone.appendTo(samplesContainer);
  }
}

function displayPattern(pattern) {
  $('#n').val(pattern.n);
  $('#r').val(pattern.rows);
  $('#c').val(pattern.columns);
  $('#condition').val(pattern.condition);
  run();
}

function showToast(message) {
  var data = {message: message};
  $("#snackbar").get(0).MaterialSnackbar.showSnackbar(data);
};


$("#printPatternJson").click(function (event) {
  var n = $('#n').val();
  var rows = $('#r').val();
  var columns = $('#c').val();
  var condition = getCondition();
  
  var pattern = {
    n: n,
    rows: rows,
    columns: columns,
    condition: condition
  };
  
  console.log(JSON.stringify(pattern));
});

function printOutput(text) {
  $('#output').html(text);
}