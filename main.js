
var patch, textNumber, tests, testIndex;

var pitches = [220, 1000];
var diffs = [0, 0.5, 1, 2, 3];
var harms = [0, 1, 2, 3, 4];

$.get('patch.pd', function(patchStr) {
  patch = Pd.loadPatch(patchStr);
  Pd.start();

  $('#btn-test').click(function() {
    pdPlay(1000, 0, 0);
  });


  var btnStart = $('#btn-start');
  btnStart.click(function() {
    testIndex = 0;
    tests = generateTests();
    transition();
  });

  var btnContinue = $('#btn-continue');
  btnContinue.click(function() {
    testIndex = parseInt(localStorage.getItem('index'));
    tests = JSON.parse(localStorage.getItem('tests'));
    transition();
  });

  $('#btn-repeat').click(function() {
    testPlay();    
  });

  $('#btn-yes').click(function() {
    updateAndAdvance(1);
  });

  $('#btn-no').click(function() {
    updateAndAdvance(0);
  });

  if(localStorage.getItem('index')) {
    btnContinue.show();
    btnStart.html('Start over');
    btnStart.removeClass('btn-primary');
    btnStart.addClass('btn-warning');
    $('#alert-restart').show();
  }

  textNumber = $('#text-number');

  $('#btn-submit').click(function() {
    dataSerial = $('#meta').serializeArray();
    data = {};
    dataSerial.forEach(function(item) {
        data[item.name] = item.value;
    });
    data.data = tests;

    console.log(data);
  });
});

function transition() {
    updateUI();
    $('#div-intro').hide();
    $('#div-tests').show();
    testPlay();
}

function updateAndAdvance(value) {
    tests[testIndex][3] = value;
    testIndex += 1;

    localStorage.setItem('tests', JSON.stringify(tests));
    localStorage.setItem('index', testIndex);

    if (testIndex >= tests.length) {
        $('#div-tests').hide();
        $('#div-submit').show();
    } else {
        updateUI();
        testPlay();
    }
}

function updateUI() {
    $('#text-number').html(testIndex+1);
    setProgress(testIndex / tests.length * 100);
}

function testPlay() {
    pdPlay(tests[testIndex][0], tests[testIndex][1], tests[testIndex][2]);
}

function pdPlay(pitch, diff, harm) {
  Pd.send('harm', [harm]);
  Pd.send('diff', [diff]);
  Pd.send('input', [pitch]);
}

function setProgress(progress) {
    $('.progress-bar').css('width', progress+'%').attr('aria-valuenow', progress).html(Math.round(progress)+'%');
}

function generateTests() {
    var tests = new Array(pitches.length * diffs.length * harms.length);
    for (var i = 0; i < pitches.length; i++) {
        for (var j = 0; j < diffs.length; j++) {
            for (k = 0; k < harms.length; k++) {
                var diffDirection = Math.random() > 0.5 ? 1 : -1;
                tests[(i * diffs.length + j) * harms.length + k] = [pitches[i], diffs[j] * diffDirection, harms[k], '?'];
            }
        }
    }
    shuffle(tests);
    return tests;
}

function shuffle(array) {
    var counter = array.length;
    while (counter > 0) {
        var index = Math.floor(Math.random() * counter);
        counter--;
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}