#!/usr/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var minimist = require('minimist');
var xrparse = require('xrandr-parse');

var argv = minimist(process.argv.slice(2), {
    alias: { t: 'target', p: 'primary' }
});
if (argv.h || argv.help) return usage(0);

if (argv._[0] === 'mirror') {
    query(function (err, displays) {
        if (err) return exit(err);
        var keys = Object.keys(displays);
        if (keys.length === 0) return exit('no displays detected');
        
        var primary = argv.primary || keys.filter(function (key) {
            return displays[key].index === 0;
        })[0];
        if (!primary) return exit('no primary display detected');
        
        var target = argv.target || keys.filter(function (key) {
            return key !== primary && displays[key].connected;
        })[0];
        if (!target) return exit('no target display detected');
        
        var dp = displays[primary];
        if (!dp) return exit('requested primary display not found');
        var dt = displays[target];
        if (!dt) return exit('requested target display not found');
        
        var pratio = dp.modes[0].width / dp.modes[0].height;
        var tratio = dt.modes[0].width / dt.modes[0].height;
        var lmatches = dt.modes.filter(function (mode) {
            return mode.width <= dp.width && mode.height <= dp.height
        });
        var amatches = lmatches.filter(function (mode) {
            return mode.width / mode.height === tratio;
        });
        var tmode = amatches[0] || lmatches[0] || dt.modes[0];
        
        var args = [
            '--output', primary,
            '--mode', dp.width + 'x' + dp.height,
            '--output', target,
            '--mode', tmode.width + 'x' + tmode.height,
            '--scale', (pratio / tratio) + 'x1'
        ];
        spawn('xrandr', args, { stdio: 'inherit' });
    });
}
else if (/^(right|left|top|bottom|above|below)$/.test(argv._[0])) {
    query(function (err, displays) {
        var keys = Object.keys(displays);
        if (keys.length === 0) return exit('no displays detected');
        
        var primary = argv.primary || keys.filter(function (key) {
            return displays[key].index === 0;
        })[0];
        if (!primary) return exit('no primary display detected');
        
        var target = argv.target || keys.filter(function (key) {
            return key !== primary && displays[key].connected;
        })[0];
        if (!target) return exit('no target display detected');
        
        var xof = {
            left: 'left-of',
            right: 'right-of',
            'top': 'above',
            bottom: 'below'
        }[argv._[0]] || xof;
        
        var args = [
            '--output', target, '--auto',
            '--' + xof, primary
        ];
        spawn('xrandr', args, { stdio: 'inherit' });
    });
}
else if (argv._[0] === 'reset') {
    spawn('xrandr', [ '--auto' ], { stdio: 'inherit' });
}
else if (argv._[0] === 'off') {
    query(function (err, displays) {
        var keys = Object.keys(displays);
        if (keys.length === 0) return exit('no displays detected');
        
        var primary = argv.primary || keys.filter(function (key) {
            return displays[key].index === 0;
        })[0];
        if (!primary) return exit('no primary display detected');
        
        var target = argv.target || keys.filter(function (key) {
            return key !== primary && displays[key].connected;
        })[0];
        if (!target) return exit('no target display detected');
        
        var args = [
            '--output', target, '--off',
            '--output', primary, '--auto'
        ];
        spawn('xrandr', args, { stdio: 'inherit' });
    });
}
else usage(1);

function usage (code) {
    var rs = fs.createReadStream(__dirname + '/usage.txt');
    rs.pipe(process.stdout);
    rs.on('end', function () {
        if (code !== 0) process.exit(code);
    });
}

function query (cb) {
    exec('xrandr', function (err, stdout) {
        if (err) cb(err)
        else cb(null, xrparse(stdout))
    });
}

function exit (msg) {
    console.error(msg);
    process.exit(1);
}
