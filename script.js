var SpeechType = (function () {
    function SpeechType(name, greenTime, yellowTime, redTime, id) {
        this.name = name;
        this.greenTime = greenTime;
        this.yellowTime = yellowTime;
        this.redTime = redTime;
        this.id = id;
    }
    return SpeechType;
})();

var TSTimer = (function () {
    function TSTimer(speeches) {
        var _this = this;
        this.started = false;
        this.speeches = speeches;
        //  Le agregue flags para que controle las veces que muestra la notificacion por cada color
        this.flagGreen = false;
        this.flagYellow = false;
        this.flagRed = false;

        $.each(this.speeches, function (indexInArray, valueOfElement) {
            var newButton = $('<span>').attr('id', valueOfElement.id).addClass('speech-type').html(valueOfElement.name);
            newButton.click(function (event) {
                _this.activateSpeech($(event.target).attr('id'));
            });
            newButton.appendTo('#buttons');
        });

        $(window).resize(function () {
            _this.resizeTime();
        });

        this.resizeTime();

        $('#btnReset').click(function () {
            _this.resetButton();
        });

        $('#btnStart').click(function () {
            _this.startButton();
        });
    }
    TSTimer.prototype.resetButton = function () {
        this.stop();
        if ($('#showDigits').is(':checked')) {
            $('#trafficlight').text('0:00');
        } else {
            $('#trafficlight').text('');
        }
        $('#body').css('background-color', '#EFEEEF');
        this.startTime = null;
        //resetea flags para que cuando se vuelvan a mostrar las notificaciones
        this.flagGreen = false;
        this.flagYellow = false;
        this.flagRed = false;
    };

    TSTimer.prototype.startButton = function () {
        if (this.started) {
            this.stop();
        } else {
            this.start();
        }
    };

    TSTimer.prototype.resizeTime = function () {
        var width = $(window).width();
        var x = Math.floor((width < 900) ? (width / 900) * 28 : 28);
        $('#trafficlight').css('font-size', x + 'em');
    };

    TSTimer.prototype.setElementText = function (elapsedSeconds) {
        if ($('#showDigits').is(':checked')) {
            $('#trafficlight').text(this.formatTime(elapsedSeconds));
        } else {
            $('#trafficlight').text(''); // probably redundant
        }
        console.log(elapsedSeconds);
        if (elapsedSeconds >= this.red) {
            $('#body').css('background-color', '#FF4040');

            console.log("ES COLOR ROJO")
            if(!this.flagRed) {
                this.mostrarNotificacion("Tiempo transcurrido", "Ya pasaron " + this.red + " segundos.");
            }
            this.flagRed = true;

        } else if (elapsedSeconds >= this.yellow) {
            $('#body').css('background-color', '#FCDC3B');
            console.log("ES COLOR AMARILLO")
            if(!this.flagYellow) {
                this.mostrarNotificacion("Tiempo transcurrido", "Ya pasaron " + this.yellow + " segundos");
            }
            this.flagYellow = true;

        } else if (elapsedSeconds >= this.green) {
            $('#body').css('background-color', '#A7DA7E');
            console.log("ES COLOR VERDE")
            if(!this.flagGreen) {
                this.mostrarNotificacion("Tiempo transcurrido", "Ya pasaron " + this.green + " segundos");
            }
            this.flagGreen = true;

        }
    }

    TSTimer.prototype.mostrarNotificacion = (titulo, mensaje) => {
        console.log(Notification.permission);
        console.log(titulo, mensaje);
        showNotification = (titulo, mensaje) => {
            const notification = new Notification(titulo, {
                body: mensaje,
                icon: 'http://www.pngall.com/wp-content/uploads/2017/05/Alert-Download-PNG.png'
            });
        }
        if (Notification.permission === "granted") {
            this.showNotification(titulo, mensaje);

        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    showNotification(titulo, mensaje);
                }
            });
        }
    }

    TSTimer.prototype.timerEvent = function () {
        if (!this.startTime) {
            this.startTime = new Date();
        }
        var timeNow = new Date();
        var elapsedSeconds = this.timeDiffInSeconds(this.startTime, timeNow);
        this.setElementText(elapsedSeconds);
    };

    TSTimer.prototype.timeDiffInSeconds = function (earlyTime, lateTime) {
        var diff = lateTime.getTime() - earlyTime.getTime();
        return Math.floor(diff / 1000);
    };

    TSTimer.prototype.formatTime = function (elapsedSeconds) {
        var minutes = Math.floor(elapsedSeconds / 60);
        var seconds = elapsedSeconds % 60;
        return minutes + ":" + ((seconds < 10) ? "0" + seconds.toString() : seconds.toString());
    };

    TSTimer.prototype.start = function () {
        var _this = this;
        $('#btnStart').html('Stop');
        this.started = true;
        if (this.startTime) {
            var newStartTime = new Date().getTime() - (this.stopTime.getTime() - this.startTime.getTime());
            this.startTime.setTime(newStartTime);
        }
        this.green = this.getSecondsFromTextBox('#green-light');
        this.yellow = this.getSecondsFromTextBox('#yellow-light');
        this.red = this.getSecondsFromTextBox('#red-light');
        this.timerToken = setInterval(function () {
            return _this.timerEvent();
        }, 100);
    };

    TSTimer.prototype.stop = function () {
        $('#btnStart').html('Start');
        this.started = false;
        this.stopTime = new Date();
        clearTimeout(this.timerToken);
    };

    TSTimer.prototype.getSecondsFromTextBox = function (id) {
        var greenLight = $(id).val();
        return parseInt(greenLight.split(':')[0]) * 60 + parseInt(greenLight.split(':')[1]);
    };

    TSTimer.prototype.setDefault = function () {
        this.activateSpeech('st-icebreaker');
    };

    TSTimer.prototype.activateSpeech = function (speechId) {
        $.each(this.speeches, function (indexInArray, valueOfElement) {
            if (valueOfElement.id === speechId) {
                $('#green-light').val(valueOfElement.greenTime);
                $('#yellow-light').val(valueOfElement.yellowTime);
                $('#red-light').val(valueOfElement.redTime);
            }
        });
        $('.active-speech').removeClass('active-speech');
        $('#' + speechId).addClass('active-speech');
    };
    return TSTimer;
})();

$(document).ready(function () {
    var speeches = [];
    // speeches.push(new SpeechType("Table&nbsp;Topics", "1:00", "1:30", "2:00", "st-table-topics"));//
    // speeches.push(new SpeechType("Evaluation", "2:00", "2:30", "3:00", "st-evaluation"));
    speeches.push(new SpeechType("Temas generales", "3:00", "5:00", "6:00", "st-standard"));
    speeches.push(new SpeechType("Revisión individual", "0:03", "0:08", "0:10", "st-icebreaker"));
    speeches.push(new SpeechType("Comentarios", "0", "0", "2:00", "st-advanced"));
    speeches.push(new SpeechType("Test", "0:03", "0:06", "0:09", "st-test"));
    var timer = new TSTimer(speeches);

    timer.setDefault();
});