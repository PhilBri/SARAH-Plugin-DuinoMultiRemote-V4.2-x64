// Globals
var settings    = require ('./settings.json'),
    tab         = settings.tab,
    duinoSerial = false,
    dmrSocket   = false;

// Writing values.ejs
var writeJSON = function (tab) {
    var fs   = require ('fs'),
        file = __dirname + '\\values.ejs';

    fs.writeFileSync (file, JSON.stringify (tab), 'utf8');
}

// Decoding Arduino's datas
var decodeDuinoData = function (serialData, clbk) {
    var s = serialData.match (/\d+/g);
    
    for (var key in tab) tab[key] = s.shift();
    writeJSON (tab);
    clbk (tab);
}

// Encoding Arduino's datas
var encodeDuinoData = function (cmdData, clbk) {
    var dataSender = cmdData.cmd.split ('_' )[0],
        duinoCmd = cmdData.cmd.split ('_')[1];        // datas

        if (duinoCmd == 'state') tab[cmdData.cmd] = 0x01 - tab[cmdData.cmd];
        // Making arduino's requests
        if (dataSender == 'swt')
            clbk ('S\n')
        else if (dataSender == 'led')
            clbk ('L' + tab[dataSender + '_val'] + ',' + tab.led_state + '\n')
        else if (dataSender == 'pot')
            clbk ('T' + tab.pot_state + '\n')
        else 
            clbk ('R' + tab.red_val + ',' + tab.green_val + ',' + tab.blue_val  + ',' + tab.rgb_state + '\n');
}

// Action Commands
var duinoAction = function (data, next, clbk) {
    var dataSender = data.cmd.split ('_' )[0],
        duinoCmd = data.cmd.split ('_')[1],         // datas
        duinoState = tab[dataSender + '_state'],
        duinoVal = tab[dataSender + '_val'];        // tab

    if (tab.swt_state == 0 && dataSender !='swt' && data.val != '?') return next ({tts : 'Allumez d\'abord le dispositif'});

    // setting up/dwn offset
    if (!data.offset) data.offset = 10;

    // up/down new values
    if (duinoCmd == 'up' || duinoCmd == 'dwn')
        tab[dataSender + '_val'] = Math.max (0, Math.min (parseInt (duinoVal) + (duinoCmd == 'dwn' ? data.offset =- data.offset : data.offset), 255));

    if (data.val) {
        if ((data.val == 'up' || data.val == "dwn") && tab[data.obj] == 0 )                       // Available ?
            next ({tts : settings[dataSender].cant})
        else if (data.val == duinoCmd && ( duinoVal == '0' || duinoVal == '255'))                 // Min or max ?
            next ({tts : settings.minmax[tab[dataSender + '_val']]})
        else if (data.val == tab[data.cmd])                                                       // Already done ?
            next ({tts : settings[dataSender].already[duinoState]})
        else if (data.val == '?')                                                                 // Current state ?
            next ({tts : settings[dataSender].infos[tab[data.cmd]]})
        else if (data.val == '#')                                                                 // Current value ?
            next ({tts : settings[dataSender][data.cmd][data.val].replace ('#', duinoVal)})
    }

    if (!data.tts) {
        encodeDuinoData (data, function (encData) {clbk (encData);});

        // Randomize response
        if (data.val) {
            var tts = Math.floor ( Math.random() * settings[dataSender][data.cmd][data.val].length);
            next ({tts:settings[dataSender][data.cmd][data.val][tts]});
        }
    }
}

// Set SerialPort
var setLibs = function () {
    var port       = Config.modules.DuinoMultiRemote.Port,
        SerialPort = require ('serialport');

    if (!port) error (settings.errs.port + port);
    
    duinoSerial = new SerialPort (port, {baudrate: 9600, parser: SerialPort.parsers.readline ('\n')})
    .on ('open', function () {
        info (settings.errs.serialOpen + port);
    })
    .on ('data', function (serialData) {
        decodeDuinoData (serialData, function (decodedData) {
            dmrSocket.emit ('portlet', decodedData);
        });
    })
    .on ('error', function (err) {
        return error ('[DuinoMultiRemote] ', err);
    });
}

// S.A.R.A.H.
exports.action = function (data, next) {
    if (!duinoSerial) { return error (settings.errs.serialClose); next ({}) };

    duinoAction (data, next, function (clbk) {
        info ('\x1b[96mDuinoMultiRemote: ', (data.text ? data.text : 'Request from Portlet or HTTP ...') + '\x1b[0m');
        next (duinoSerial.write (clbk));
    });
}

exports.init = function () {
    info ('[ DuinoMultiRemote ] is initializing ...');
    setLibs();
}

exports.socket = function (io, socket) {
    socket.on ('DMR-Connect', function (plugName) {
        dmrSocket = socket;
        info (settings.errs.connect);
        socket.on ('disconnect', function () {
            info (settings.errs.disconnect);
        })
        .on ('sendDuino', function (sendDuino) {
            info ('sendDuino = ', sendDuino);
            duinoSerial.write (sendDuino);
        });
    });
}

