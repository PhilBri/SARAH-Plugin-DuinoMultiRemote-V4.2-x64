!function ($) {
    // Globals
    var duinobleu = '#33A3EC',
        sendDuino,
        socket = false,
        tab = {};

    // Add logo img to portlet
    $('DIV#DuinoMultiRemote > .portlet-footer').append('<div class="pdp col-xs-8 col-xs-offset-2"><img id="logo" src="/duinomultiremote/www/images/duinologowhite.png"/></div>');

    // Register
    var register = function() {
        socket = io ()
        .emit ('sendDuino', '?\n')
        .on ('portlet', function (data) {
            // Buttons & sliders
            for (var key in tab = data) $('#'+key).text (key.match (/state/) ?  tab[key]=='0' ? 'OFF' : 'ON' : tab[key]);

            $('DIV#DuinoMultiRemote .btn').each ( function() {
                if ($(this).text() == 'ON') $(this).css ({'background':duinobleu, 'color':'white'})
                else if ($(this).text() == 'OFF') $(this).css ({'background':'white', 'color':duinobleu});
            });
            
            // Switch
            if ($('#swt_state').text()=='OFF')
                $('#led_state, #rgb_state').attr ('disabled','disabled').css ({'background':'white', 'color':'grey', 'border-color':'grey'});
            else
                $('#led_state, #rgb_state').removeAttr ('disabled').css ({'border-color':duinobleu});

            // Colorpicker
            $('#rgb-color').spectrum ("set", 'rgb(' + $('#red_val').text() + ',' + $('#green_val').text() + ',' + $('#blue_val').text() + ')' );
        });

        // Spectrum colorpicker
        $('#rgb-color').spectrum ({
            preferredFormat: 'rgb',
            showPalette: true,
            palette: [],
            showInput: true,
            maxSelectionSize: 5,
            hideAfterPaletteSelect: true,
            change: function (color) {
                var rgbColor = color.toString().match (/\d+/g);
                socket.emit ('sendDuino', 'R' + rgbColor[0] + ',' + rgbColor[1] + ',' + rgbColor[2] + ',' + tab.rgb_state + '\n');
            }
        });
    }
    
    // PUBLIC
    $(document).ready (function() {
        register();
        
        // HTTP Requests
        $('DIV#DuinoMultiRemote').click (function (event) {
            if ($(event.target).attr ('id')) {
                event.preventDefault();
                $.post ('http://127.0.0.1:8080/sarah/DuinoMultiRemote/?cmd=' + event.target.id);
            }
        });
    });
} (jQuery);
