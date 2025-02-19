const path = require("path");
const express = require("express");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const redis = require("redis");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const publicPath = path.join(process.cwd().replace(/\\src/, ""), "/views");
const devicesPath = path.join(publicPath, "data/devices.json");

if (process.env.USE_REDIS === "true") {
    const redisClient = redis.createClient({
        url: process.env.REDIS_HOST
    });
    redisClient.connect().catch(console.error);

    const redisStore = new RedisStore({
        client: redisClient,
        prefix: "etherwake-website"
    });

    app.use(
        session({
            store: redisStore,
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 86400000 },
        })
    );
}
else {
    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 86400000 },
        })
    );
}

app.use(express.json());
app.use("/views", express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));

http.createServer(app).listen(80);

if (process.env.USE_HTTPS === "true") {
    const httpsOptions = {
        key: fs.readFileSync('src/keys/server.key'),
        cert: fs.readFileSync('src/keys/server.crt')
    }
    https.createServer(httpsOptions, app).listen(443);
}

let devices = [];
try {
    devices = JSON.parse(fs.readFileSync(devicesPath));
} catch (err) {
    console.log('No devices file found, starting fresh');
}

app.get('/', (req, res) => {
   res.sendFile(path.join(publicPath, "/html/index.html"));
});

app.get('/api/devices', (req, res) => res.json(devices));
app.delete('/api/devices', (req, res) => {
    const name = req.query.name;
    devices = devices.filter(d => d.name !== name);
    fs.writeFileSync(devicesPath, JSON.stringify(devices));
    res.json(devices);
});
app.post('/api/devices', (req, res) => {
    const originalName = req.query.originalName;
    const newDevice = req.body;

    if (originalName) {
        const index = devices.findIndex(d => d.name === originalName);
        if (index > -1) {
            devices[index] = newDevice;
        }
    } else {
        const exists = devices.some(d => d.name === newDevice.name);
        if (exists) {
            return res.status(400).json({ error: 'Device name already exists' });
        }
        devices.push(newDevice);
    }

    fs.writeFileSync(devicesPath, JSON.stringify(devices));
    res.json(devices);
});

app.post('/api/wake', async (req, res) => {
    if (!req.body.mac || !isValidMAC(req.body.mac)) {
        return res.status(400).json({ error: 'Invalid MAC address format' });
    }

    try {
        await ssh.connect({
            host: process.env.SSH_HOST,
            port: 22,
            username: process.env.SSH_USER,
            password: process.env.SSH_PASSWORD
        });

        const command = `sudo etherwake ${req.body.mac}`;

        const result = await ssh.execCommand(command);

        ssh.dispose();

        if (result.stderr) {
            console.error('Error executing command:', result.stderr);
            return res.status(500).json({ error: `Failed to send magic packet: ${result.stderr}` });
        }

        return res.json({ success: true, output: result.stdout });

    } catch (err) {
        return res.status(500).json({ error: `SSH connection failed: ${err.message}` });
    }
});

function isValidMAC(mac) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
}