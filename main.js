$(function () {

  var currentLevel = -1, currentNum, currentCandles = 0;

  function displayNum(num, effect) {
    currentNum = num;
    if (effect == 'power2' || effect == 'power3' || effect == 'powerR2') {
      $('#cover').show();
      displayNum(currentNum);
      $('#digit-box').prepend(
        $('<div>').addClass(effect + '-box').fadeOut(function () {
          $('#cover').hide();
        }));
      return; 
    } if (effect == 'rotate') {
      $('#cover').show();
      $({deg: 0}).animate({deg: 180}, {
        duration: 500,
        step: function (now) {
          $('#digit-box').css({'transform' : 'rotate(' + now + 'deg)'});
        },
        complete: function () {
          $('#digit-box').css({'transform' : ''});
          displayNum(currentNum);
          $('#cover').hide();
        }
      });
      return;
    }
    var stringForm = '' + num, i, x;
    $('#digit-box').empty();
    for (i = 0; i < stringForm.length && i <= 3; i++) {
      var x = (stringForm.charCodeAt(i) - 45) * 70;
      $('#digit-box').append(
          $('<div class=digit>')
            .css('background-position', '-' + x + 'px 0'));
    }
  }

  // ################################################

  var SQUARE = 'Square', CUBE = 'Cube', SQRT = 'Sqrt', ROTATE = 'Rotate';
  var ROTATE_MAP = {0: 0, 1: 1, 2: 2, 3: '/', 4: ':', 5: 5,
    6: 9, 7: ';', 8: 8, 9: 6}

  var LEVELS = [
    {start: 6, buttons: ['×4']},
    {start: 9, buttons: ['×2', '+3']},
    {start: 8, buttons: ['-4', '×6']},
    {start: 7, buttons: ['×5', '+4', '-3']},
    {start: 8, buttons: ['÷2', '-8', '×7']},
    {start: 8, buttons: ['+4', '×4', '÷4']},
    {start: 6, buttons: ['+6', '÷2', '×7']},
    {start: 8, buttons: ['+7', '-1', '×3', '÷7']},
    {start: 7, buttons: ['+6', '-8', '×8', '×3']},
    {start: 8, buttons: ['3-', '×6', '-9']},
    {start: 8, buttons: ['+1', '+5', '÷3', '×8']},
    {start: 1, buttons: ['×3', '-7', '+8', '×0']},
    {start: 6, buttons: ['9÷', '÷8', '×2']},
    {start: 3, buttons: ['×7', '÷7', '+3']},
    {start: 0, buttons: ['×9', '+3', '-1', '÷3']},
    {start: 2, buttons: [SQUARE, '×6', '÷6']},
    {start: 2, buttons: [SQUARE, '-1', '-3', '-4']},
    {start: 7, buttons: ['÷6', '-3', '×9', '+2']},
    {start: 2, buttons: [CUBE, '×3', '÷9']},
    {start: 9, buttons: [SQRT, '×6', '+1']},
    {start: 8, buttons: [SQRT, SQUARE, '×9']},
    {start: 2, buttons: [ROTATE, '×4', '+7']},
    {start: 9, buttons: [ROTATE, SQUARE, '+6']},
    {start: 9, buttons: [ROTATE, ROTATE, '+3', '+6']},
  ];
  console.log(LEVELS.length);

  function checkVictory() {
    if ($('.choice.enabled').length == 0 && currentNum == 24) {
      $('#action').prop('disabled', true).removeClass().addClass('gray');
      // Begin candle showing
      var color = Math.floor(Math.random() * 6) * 10;
      $('<div class=candle>').appendTo('#candle-box')
        .css({
          'background-position': '-' + color + 'px -1px',
          'top': '100px',
          'left': '' + (currentCandles * 11) + 'px'
        })
        .animate({top: 0}, function () {
          $('#action').prop('disabled', false)
            .removeClass().addClass('green').text('NEXT');
        });
      currentCandles++;
    }
  }

  function loadLevel() {
    var level = LEVELS[currentLevel];
    $('#level').text('Level ' + (currentLevel + 1));
    displayNum(level.start);
    $('#button-box').empty();
    level.buttons.forEach(function (spec) {
      var button = $('<button class="choice enabled">');
      if (spec.length == 2) {
        button.text(spec.replace(/-/g, '−'));
      } else {
        button.append($('<img src=special' + spec + '.png>'));
      }
      button.click(function () {
        if ($('#cover').is(":visible")) return;
        button.removeClass('enabled').prop('disabled', true);
        var newNum, effect = undefined;
        if (spec.charAt(0) == '+') {
          newNum = (currentNum + (+spec.charAt(1)));
        } else if (spec.charAt(0) == '-') {
          newNum = (currentNum - (+spec.charAt(1)));
        } else if (spec.charAt(0) == '×') {
          newNum = (currentNum * (+spec.charAt(1)));
        } else if (spec.charAt(0) == '÷') {
          newNum = (currentNum / (+spec.charAt(1)));
        } else if (spec.charAt(1) == '-') {
          newNum = ((+spec.charAt(0)) - currentNum);
        } else if (spec.charAt(1) == '÷') {
          newNum = ((+spec.charAt(0)) / currentNum);
        } else if (spec == SQUARE) {
          effect = 'power2';
          newNum = (currentNum * currentNum);
        } else if (spec == CUBE) {
          effect = 'power3';
          newNum = (currentNum * currentNum * currentNum);
        } else if (spec == SQRT) {
          effect = 'powerR2';
          newNum = Math.sqrt(currentNum);
        } else if (spec == ROTATE) {
          effect = 'rotate';
          if (currentNum < 0 || Math.abs(currentNum - Math.floor(currentNum)) > 1e-6) {
            alert('ERROR: Unhandled!');
          } else {
            var stringForm = '' + Math.floor(currentNum), allDigits = true;
            newNum = '';
            for (var i = 0; i < stringForm.length; i++) {
              newNum = '' + ROTATE_MAP[+stringForm[i]] + newNum;
              if (typeof ROTATE_MAP[+stringForm[i]] === 'string')
                allDigits = false;
            }
            if (allDigits && (newNum == '0' || newNum.charAt(0) != '0')) {
              newNum = +newNum;
            }
          }
        } else {
          alert('ERROR: Unhandled!');
        }
        displayNum(newNum, effect);
        checkVictory();
      });
      $('#button-box').append(button);
    });
  };

  $('#action').click(function () {
    if ($('#cover').is(":visible")) return;
    var text = $('#action').text();
    if (text == 'START') {
      // Start at level 0
      currentLevel = 0;
      loadLevel();
      $('#action').removeClass().addClass('red').text('RESET');
    } else if (text == 'RESET') {
      loadLevel();
    } else if (text == 'NEXT') {
      currentLevel++;
      if (currentLevel >= LEVELS.length) {
        // End game
        $('#cover').show();
        var count = 4;
        $('#background, #button-box, #action, #level').fadeOut(1000, function () {
          count--;
          if (count != 0) return;
          $('#message').append($('<p id=message-1>Happy Birthday!</p>'));
          $('#message').append($('<p id=message-3>Make a wish and blow out the candles.</p>'));
          $('#message').append($('<p id=message-2>Wish you a wonderful year of happiness, '
              + 'success, and good health.</p>'));
          $('#message').fadeIn();
          var candlesLeft = $('.candle').length;
          $('.candle').addClass('clickable').click(function() {
            if ($(this).hasClass('out')) return;
            $(this).addClass('out');
            candlesLeft--;
            if (candlesLeft == 0) {
              $('#message-2').fadeIn();
            }
          });
          $('#cover').hide();
        });
      } else {
        loadLevel();
        $('#action').removeClass().addClass('red').text('RESET');
      }
    }
  });

  var images = [];
  // Preload images
  ['cake.png', 'candles.gif', 'candles-out.png', 'digits.png',
    'specialSquare.png', 'specialCube.png', 'specialSqrt.png', 'specialRotate.png',
    ].forEach(function (x) {
    var img = new Image();
    img.src = x;
    images.push(img);
  });
  displayNum(24);
  $('#action').addClass('green').text('START');

});
