$(function () {

  var currentLevel = -1, currentNum, currentCandles = 0;

  function displayNum(num, effect) {
    currentNum = num;
    if (effect == 'power') {
      $('#cover').show();
      displayNum(currentNum);
      $('#digit-box').prepend(
          $('<div class=power-box>').fadeOut(function () {
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
    } else if (effect == 'spill') {
      $('#cover').show();
      displayNum(('' + num).replace(/6/g, ';'));
      window.setTimeout(function () {
        displayNum(num);
        $('#cover').hide();
      }, 400);
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

  var LEVELS = [
    {name: '1 (A)', start: 6, buttons: ['×4']},
    {name: '1 (B)', start: 9, buttons: ['×2', '+3']},
    {name: '2 (A)', start: 7, buttons: ['×5', '+4', '-3']},
    {name: '2 (B)', start: 8, buttons: ['÷2', '-8', '×7']},
    {name: '3 (A)', start: 6, buttons: ['×8', '-5', '-3', '-2']},
    {name: '3 (B)', start: 3, buttons: ['×7', '÷7', '+3']},
    {name: '4 (A)', start: 2, buttons: ['-1', '-3', '-4', 'A']},
    {name: '4 (B)', start: 2, buttons: ['×4', '+7', 'B']},
    {name: '4 (C)', start: ':', buttons: ['×2', '×2', 'C']},
  ];

  function checkVictory(candles) {
    if ($('.choice.enabled').length == 0 && currentNum == 24) {
      $('#action').prop('disabled', true);
      // Begin candle showing
      var candlesAnimating = candles;
      for (var i = 0; i < candles; i++) {
        var color = Math.floor(Math.random() * 6) * 10;
        $('<div class=candle>').appendTo('#candle-box')
          .css({
            'background-position': '-' + color + 'px -1px',
            'top': '100px',
            'left': '' + (currentCandles * 11) + 'px'
          })
          .animate({top: 0}, function () {
            candlesAnimating--;
            if (candlesAnimating == 0) {
              $('#action').prop('disabled', false)
                .removeClass().addClass('green').text('NEXT');
            }
          });
        currentCandles++;
      }
    }
  }

  function loadLevel(level) {
    $('#level').text('Level ' + level.name);
    displayNum(level.start);
    $('#button-box').empty();
    level.buttons.forEach(function (spec) {
      var button = $('<button class="choice enabled">');
      if (spec.length == 2) {
        button.text(spec);
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
          if (currentNum == ':') {
            newNum = '::';
          } else if (currentNum == '::') {
            newNum = '::::';
          } else {
            newNum = (currentNum * (+spec.charAt(1)));
          }
        } else if (spec.charAt(0) == '÷') {
          newNum = (currentNum / (+spec.charAt(1)));
        } else if (spec == 'A') {
          effect = 'power';
          newNum = (currentNum * currentNum);
        } else if (spec == 'B') {
          effect = 'rotate';
          switch (currentNum) {
            case 2: newNum = 2; break;
            case 9: newNum = 6; break;
            case 8: newNum = 8; break;
            case 36: newNum = '9/'; break;
            case 15: newNum = 51; break;
            default: alert('ERROR: Unhandled!');
          }
        } else if (spec == 'C') {
          effect = 'spill';
          switch (currentNum) {
            case ':': newNum = 6; break;
            case '::': newNum = 66; break;
            case '::::': newNum = 6666; break;
            default: alert('ERROR: Unhandled!');
          }
        } else {
          alert('ERROR: Unhandled!');
        }
        displayNum(newNum, effect);
        checkVictory(+level.name.charAt(0));
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
      loadLevel(LEVELS[currentLevel]);
      $('#action').removeClass().addClass('red').text('RESET');
    } else if (text == 'RESET') {
      loadLevel(LEVELS[currentLevel]);
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
          $('#message').append($('<p id=message-3>ขอพรแล้วเป่าเทียนนะครับ</p>'));
          $('#message').append($('<p id=message-2>ขอให้ออยมีความสุขมากๆ '
               + 'ทำอะไรก็ให้ได้สมใจปรารถนาทุกประการนะครับ</p>'));
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
        loadLevel(LEVELS[currentLevel]);
        $('#action').removeClass().addClass('red').text('RESET');
      }
    } else if (text == 'SEND') {


    }
  });

  var images = [];
  // Preload images
  ['cake.png', 'candles-out.png', 'digits.png', 'specialA.png', 'specialB.png', 'specialC.png'].forEach(function (x) {
    var img = new Image();
    img.src = x;
    images.push(img);
  });
  displayNum(24);
  $('#action').addClass('green').text('START');

});
