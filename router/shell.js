var url = require('url');
var sys = require('sys');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');

function tune(res, req) {
    var channelId = req.req.query.ch;
    var programId = req.req.query.p; 

    var cmd = 'tv.tune';
    var args = [];
    var response = {};
    if(channelId && channelId.length > 0) {
        args.push('-c');
        args.push(channelId);
    }
    if(programId && programId.length > 0) {
        args.push('-p');
        args.push(programId);
    }
    if(args.length > 0) {
        console.log('Running: ' + cmd);
        run(cmd, args, function(data, exitCode) {
            response.response = (exitCode == 0) ? "OK" : "FAILED";
            response.data = data;
            res.res.send(JSON.stringify(response));
        });
    } else {
        response.response = "No arguments";
        res.res.send(JSON.stringify(response));
    }
}

function status(res, req) {
    var response = {};
    response.status = "OFF";
    run("tv.stream", ["-s"], function(data, exitCode) {
        response.response = (exitCode == 0) ? "OK" : "FAILED";
        response.status = data;
        res.res.send(JSON.stringify(response));
    });
}

function stream(res, req) {
    var response = {};
    var enable = req.req.query.enable;
    var args = [];
    var enabling = false;

    if(enable && enable.length > 0) {
        if(enable == "yes") {
            args.push("--start");
            enabling = true;
        } else {
            args.push("-k");
        }
    }
    if(args.length > 0) {
        var options = {};
        if(enabling) {
            options.detached = true;
            options.stdio = [ 'ignore', 'ignore', 'ignore' ]
        }
        var child = run("tv.stream", args, function(data, exitCode) {
            response.response = (exitCode == 0) ? "OK" : "FAILED";
            response.data = data;
            res.res.send(JSON.stringify(response));
        }, options);
        if(enabling) {
            child.unref();
        }
    } else {
        response.response = "No arguments";
        res.res.send(JSON.stringify(response));
    }
}

function run_nocallback(cmd) {
    var child = exec(cmd, function(err, stdout, stderr) {
        sys.print('stdout: ' + stdout);
        sys.print('stderr: ' + stderr);
        if(err !== null) {
            console.log('exec error: ' + error);
        }
    });
}

function run(cmd, args, cb, options) {
    var child = spawn(cmd, args, options);
    var data = '';
    if(child.stdout) {
        child.stdout.on('data', function(chunk) {
            //sys.print(chunk);
            data += chunk;
        });
    }
    if(child.stderr) {
        child.stderr.on('data', function(chunk) {
            //sys.print(chunk);
            data + chunk;
        });
    }
    child.on('close', function(exitCode) {
        cb(data.trim(), exitCode);
    });
    return child;
}

function paths(app) {
    app.get('/tune', tune);
    app.get('/status', status);
    app.get('/stream', stream);
}

module.exports = paths

