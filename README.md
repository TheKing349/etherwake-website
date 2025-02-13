## Etherwake-Website
Welcome to **Etherwake-Website** This is a Node.js and Express.js-based web application designed to help you wake up devices on your local network using the ```etherwake``` command.
The project was created to address a specific need: waking up a computer that doesn't support Wake-on-Wireless-LAN (WoWLAN) and isn't connected via Ethernet. Rather than relying on the device's wireless capabilities, this solution utilizes a Raspberry Pi on the same network to send the magic packet and trigger the device to wake up.

If you're looking for a simpler Wake-on-LAN web solution, check out [this repo](https://github.com/sameerdhoot/wolweb) instead.

---
## Why Does This Exist?
This project is designed for situations where a computer lacks Wake-on-Wireless-LAN (WoWLAN) support. Instead of relying on the computer’s wireless card, a Raspberry Pi connected via Ethernet is used to send the Wake-on-LAN (WoL) magic packet.

---
## Features
- **Device Management** – Add, edit, and remove devices from a list stored on the server.
- **Wake Devices** – Send a Wake-on-LAN (WoL) magic packet to any device in your list with a single click.
- **Docker Support** – Easily deploy with a pre-built Docker image.

---
## How It Works
1. **Add Devices** – Use the web interface to add a device by entering its name and MAC address.
2. **Wake Devices** – Select a device from the list and click "Wake." The website will SSH into the Raspberry Pi and execute the `etherwake` command.
3. **Device Wakes Up** – The Raspberry Pi sends the magic packet, and the target device turns on.

---
## Prerequisites
Before you get started, make sure you have the following:
- A Raspberry Pi running Raspbian connected to your PC via Ethernet
- ```etherwake``` installed on the Raspberry Pi (```sudo apt install etherwake```).
- SSH access to the Raspberry Pi from your server.

---
## Installation

### **Option 1: With Docker (Recommended)**
1. **Pull the Docker Image**
   ```sh
   docker pull ghcr.io/theking349/etherwake-website:latest
   ```
2. **Create a `docker-compose.yaml` File**
   ```sh
   sudo nano docker-compose.yaml
   ```
3. **Choose the Correct Configuration**
    - If you **already have a Redis server**, use [docker-compose-external-redis.yaml](./docker-compose-external-redis.yaml).
        - Modify the Redis network to `redis_network` in `docker-compose.yaml`.
    - If you **do not have a Redis server**, use [docker-compose-internal-redis.yaml](./docker-compose-internal-redis.yaml)
  
4. **Create the Necessary Files**
   ```sh
   sudo touch devices.json
   sudo touch .env
   ```
5. **Edit Environment Variables**
    - Use the [env template](./.env.template) to update your env file: `sudo nano .env`
    - Make sure all fields are filled out from the [env template](./.env.template) to ensure no errors
6. **Run the Container**
   ```sh
   docker compose up -d
   ```
7. **Access the Website**  
   Open a browser and go to:
   ```
   http://your-server-ip:8089
   ```

---

### **Option 2: Without Docker (Not Recommended)**

1. **Clone the Repository**
   ```sh
   git clone https://github.com/TheKing349/etherwake-website.git
   cd etherwake-website
   ```
2. **Install Dependencies**
   ```sh
   npm i
   ```
3. **Set Up the Environment**
    - Create a `.env` file in the root directory.
    - Copy the contents of the [.env.template](./.env.template) file and modify as needed.

4. **Add SSL Certificates (Optional)**
    - If you **have SSL certificates**, place `server.key` and `server.crt` in:
      ```
      [PROJECT_ROOT]/src/keys/
      ```
    - If you **do not have SSL certificates**, remove these lines in [server.js](./src/server.js):
      ```js
      const httpsOptions = {...}
      https.createServer(httpsOptions, app).listen(443);
      ```
5. **Remove Redis Server (Optional)**
    - If you do not want to worry about a Redis Server, remove the following line in the `app.use(...` section in [server.js](./src/server.js):
      ```
        store: redisStore,
      ```

6. **Start the Server**
   ```sh
   npm start
   ```
7. **Access the Website**  
   Open a browser and go to:  `http://your-server-ip:8089`

---
## Environment Variables:
| Environment Variable | Description                                                                                                                                                                                                     | Example Value                                                                                                                    |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| SESSION_SECRET       | The persistent secret for cookies. Can be any string, but treat it as a sensitive password. Generate a secure session secret using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. | d6c5b740aaa13b6baee86699eb20e247e86151ab37afceadaa8898a9891645972be1fbe5c181afab096618d86d997a6849aa127c5728873c9347812f033e1399 |
| REDIS_HOST           | Your Redis server host url, for storing cookie data in a secure database.                                                                                                                                       | redis://default:password@ip-address:6379                                                                                         |
| SSH_HOST             | The ip address of your raspberry pi to access ssh                                                                                                                                                               | 192.168.1.123                                                                                                                    |
| SSH_USER             | The user of your raspberry pi you want to use                                                                                                                                                                   | username                                                                                                                         |
| SSH_PASSWORD         | The password of your user on the raspberry pi                                                                                                                                                                   | superS3cretPassw0rd                                                                                                              |

---
## Usage
1. **Add a Device**:
    - Click 'Add Device' and enter the device's name and MAC address
    - Save the device
2. **Wake a Device**:
    - Select a device from the list and click "Wake."
    - The website will SSH into the Raspberry Pi and send the ```etherwake``` command to wake the device

---
## Troubleshooting:
- **SSH connection failed**:
    - Ensure the Raspberry Pi is powered on, connected to the network
    - Verify the ```SSH_HOST```, ```SSH_USER```,  and ```SSH_PASSWORD``` values in the [.env.template](./.env.template) file or environment variables in the `docker-compose.yaml` file are correct
    - Test SSH access manually from your server using the command: `ssh [YOUR_SSH_USERNAME]@[YOUR_RASPBERRY_PI_IP]`
    - If SSH access is blocked, enable SSH on the Raspberry Pi:
      ```sh
      sudo systemctl enable ssh
      sudo systemctl start ssh
      ```
- **`etherwake` Command Not Found**:
    - Install the `etherwake` command on the Raspberry Pi: `sudo apt update && sudo apt install etherwake -y`
    - Verify the installation by running: `etherwake --version`
- **Device Not Waking Up**:
    - Ensure the target device supports Wake-on-LAN (WoL) and that it is enabled in the BIOS/UEFI settings.
    - Verify the MAC address of the target device is correct in the device list.
    - Check that the Raspberry Pi is plugged into the target device via Ethernet
- **Website Not Accessible**:
    - Ensure the server is running on the correct port( default: `8089`).
    - Check the logs for errors `npm start`
    - If using Docker, check the container logs: `docker logs etherwake-website`
- **Docker Container Fails to Start**:
    - Check the container logs for errors: `docker logs etherwake-website`
    - Ensure all required environment variables are passed to the container
- **Device List Not Persisting**:
    - If using Docker, ensure the volume mount is correct

---
## Contributing
Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

---
## License:
The project is licensed under the [MIT LICENSE](./LICENSE)
