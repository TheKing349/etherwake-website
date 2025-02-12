const path = require("path");
const express = require("express");
const session = require("express-session");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

let devices = [];
try {
    devices = JSON.parse(fs.readFileSync('devices.json'));
} catch (err) {
    console.log('No devices file found, starting fresh');
}

const publicPath = path.join(process.cwd().replace(/\\src/, ""), "/views");

app.use(
    session({
        secret: "SSDFasf9w0er3qjweafads",
        resave: true,
        saveUninitialized: false,
        cookie: {
            path: "/",
            secure: false,
        },
    })
);

app.use(express.json());
app.use("/static", express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));

http.createServer(app).listen(process.env.PORT);
console.log("Listening on port " + process.env.PORT);

app.get('/', (req, res) => {
   res.sendFile(path.join(publicPath, "/html/index.html"));
});

app.get('/api/devices', (req, res) => res.json(devices));
app.delete('/api/devices', (req, res) => {
    const name = req.query.name;
    devices = devices.filter(d => d.name !== name);
    fs.writeFileSync('devices.json', JSON.stringify(devices));
    res.json(devices);
});
app.post('/api/devices', (req, res) => {
    const originalName = req.query.originalName;
    const newDevice = req.body;

    if (originalName) {
        // Update existing device
        const index = devices.findIndex(d => d.name === originalName);
        if (index > -1) {
            devices[index] = newDevice;
        }
    } else {
        // Add new device
        const exists = devices.some(d => d.name === newDevice.name);
        if (exists) {
            return res.status(400).json({ error: 'Device name already exists' });
        }
        devices.push(newDevice);
    }

    fs.writeFileSync('devices.json', JSON.stringify(devices));
    res.json(devices);
});

app.post('/api/wake', async (req, res) => {
    try {
        await ssh.connect({
            host: process.env.EXECUTOR_IP,
            port: 22,
            username: process.env.SSH_USER,
            password: process.env.SSH_PASSWORD,
        });

        const command = `sudo etherwake ${req.body.mac}`;

        const result = await ssh.execCommand(command);

        ssh.dispose();

        if (result.stderr) {
            console.error('Error executing command:', result.stderr);
            return res.status(500).json({ error: result.stderr });
        }

        console.log('Command output:', result.stdout);
        return res.json({ success: true, output: result.stdout });
    } catch (err) {
        console.error('SSH connection error:', err);
        return res.status(500).json({ error: err.message });
    }
});