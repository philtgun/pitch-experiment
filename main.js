
var patch, textNumber, tests, testIndex;

var pitches = [220, 1000];
var diffs = [0, 0.5, 1, 2, 3];
var harms = [0, 1, 2, 3, 4];
var volume = {
  1000: 80,
  220: 90
};

$.get('patch.pd', function(patchStr) {
  patch = Pd.loadPatch(patchStr);
  Pd.start();

  $('#btn-test').click(function() {
    pdPlay(pitches[1], diffs[0], harms[0], volume[pitches[1]]);
  });


  var btnStart = $('#btn-start');
  btnStart.click(function() {
    testIndex = 0;
    tests = generateTests();
    updateUI(true);
  });

  var btnContinue = $('#btn-continue');
  btnContinue.click(function() {
    updateUI(true);
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

  $(document).keypress(function(e) {
    switch (e.key) {
        case '1':
        case 'y':
            updateAndAdvance(1);
            break;
        case '2':
        case 'n':
            updateAndAdvance(0);
            break;
        case '3':
        case 'r':
            testPlay();
    }
  });

  testIndex = localStorage.getItem('index');
  
  if(testIndex) {
    btnContinue.show();
    btnStart.html('Start over');
    btnStart.removeClass('btn-primary');
    btnStart.addClass('btn-warning');

    tests = JSON.parse(localStorage.getItem('tests'));
    if(testIndex < tests.length)
      $('#alert-restart').show();
    else
      $('#alert-finished').show();
  }

  textNumber = $('#text-number');

  $('#btn-download').click(function() {
    dataSerial = $('#meta').serializeArray();
    data = {};
    dataSerial.forEach(function(item) {
        data[item.name] = item.value;
    });
    data.data = tests;

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    fakeClickA({
      href: dataStr,
      download: 'data.json'
    });
  });

  $("#btn-submit").click(function() {
    fakeClickA({
      href: 'mailto:philip.tovstogan01@estudiant.upf.edu?subject=Pitch%20Experiment&body=The%20data%20is%20attached.',
      target: '_blank'
    });
  });
});

function fakeClickA(attrs) {
    var tempDom = document.createElement('a');
    document.body.appendChild(tempDom);
    for (var key in attrs) {
      tempDom.setAttribute(key, attrs[key]);
    }
    tempDom.click();
    tempDom.remove();  
}

function updateAndAdvance(value) {
    tests[testIndex][3] = value;
    testIndex += 1;

    localStorage.setItem('tests', JSON.stringify(tests));
    localStorage.setItem('index', testIndex);

    updateUI();
}

function updateUI(first) {
    if (first) {
      $('#div-intro').hide();
      $('#div-tests').show();      
    }

    if (testIndex >= tests.length) {
      $('#div-tests').hide();
      $('#div-submit').show();
    } else {
      $('#text-number').html(testIndex+1);
      setProgress(testIndex / tests.length * 100);
      testPlay();
    }  
}

function testPlay() {
    pdPlay(tests[testIndex][0], tests[testIndex][1], tests[testIndex][2], volume[tests[testIndex][0]]);
}

function pdPlay(pitch, diff, harm, volume) {
  Pd.send('volume', [volume]);
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