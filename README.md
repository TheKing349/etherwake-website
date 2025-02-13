## Etherwake-Website
Welcome to **Etherwake-Website** - a Node.js/Express web application that wakes devices on your local network using the `etherwake` command via a Raspberry Pi. Designed for devices that don't support Wake-on-Wireless-LAN (WoWLAN), this solution uses an Ethernet-connected Raspberry Pi to send magic packets instead of relying on wireless capabilities.

For a simpler Wake-on-LAN web solution, see [this alternative repo](https://github.com/sameerdhoot/wolweb).

---  
## Why This Exists
Provides a workaround for waking computers that:
1. Lack WoWLAN support
2. Aren't Ethernet-connected
3. Have a Raspberry Pi on the same network to send Wake-on-LAN (WoL) packets

---  
## Features
- **Device Management** - Add, edit, and remove devices
- **One-Click Wake** - Send WoL packets via web interface
- **Secure Storage** - Optional Redis integration for production
- **Docker Support** - Pre-built image with compose examples

---  
## How It Works
1. **Add Device** - Enter name/MAC via web interface
2. **Initiate Wake** - Click button to SSH into Pi
3. **Send Packet** - Pi executes `etherwake` command
4. **Device Wakes** - Target system powers on

---  
## Prerequisites
- Raspberry Pi running Raspberry Pi OS (connected to target via Ethernet)
- `etherwake` installed on Pi:
  ```bash
  sudo apt update && sudo apt install etherwake -y
  ```
- SSH access from your server to Pi(SSH enabled and tested)

---  
## Installation

### **Option 1: With Docker (Recommended)**
1. **Pull the Docker Image**
   ```sh  
   docker pull ghcr.io/theking349/etherwake-website:latest
   ```
2. **Create the Necessary Files**
    ```sh
    sudo touch devices.json && sudo touch .env && sudo nano docker-compose.yaml
   ```
3. **Choose the Correct Configuration**
    - **Choose appropriate compose file**:
        - [External Redis](./docker-compose-external-redis.yaml)(existing Redis Server)
        - [Internal Redis](./docker-compose-internal-redis.yaml)(new Redis Server)
        - [No Redis](./docker-compose-no-redis.yaml)(development only)
    - **Create `.env` file using the [template](./.env.template)**
        - Edit environment variables as needed
        - Description of environment variables [here](#Environment-Variables)
    - **For HTTPS (Optional)**
        - Create `keys` directory(` sudo mkdir keys`)
        - Add `server.crt` and `server.key` files
        - Set `USE_HTTPS` to `true` in the `.env`
4. **Start the Container**
   ```sh  
   docker compose up -d
   ```
5. **Access the Website**    
   Open a browser and go to `http://your-server-ip:8089`
---  

### **Option 2: Without Docker (Not Recommended)**

1. **Clone the Repository**
   ```sh  
   git clone https://github.com/TheKing349/etherwake-website.git
   cd etherwake-website
   ```
2. **Install Dependencies**
   ```sh  
   npm install
   ```
3. **Set Up the Environment**
    - Copy `.env.template` to `.env`
        - Description of environment variables [here](#Environment-Variables)
    - For HTTPS (Optional):
        - Create `src/keys/` directory
        - Set `USE_HTTPS` to `true` in the `.env`
4. **Start the Server**
   ```sh
    npm start
   ```
5. **Access the Website**    
   Open a browser and go to `http://your-server-ip:8089`

---  
## Environment Variables:
| Environment Variable | Description                                                                                                    | Example Value           |
|----------------------|----------------------------------------------------------------------------------------------------------------|-------------------------|
| SESSION_SECRET       | Secure cookie secret (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | 64-char hex             |
| USE_HTTPS            | Enable HTTPS (requires certs)                                                                                  | true/false              |
| USE_REDIS            | **Required for production** - Use Redis instead of memory store                                                | true/false              |
| REDIS_HOST           | Redis connection URL                                                                                           | redis://ip-address:6379 |
| SSH_HOST             | Raspberry Pi IP address                                                                                        | 192.168.1.123           |
| SSH_USER             | Raspberry Pi username                                                                                          | pi                      |
| SSH_PASSWORD         | Raspberry Pi password                                                                                          | raspberry               |

---  
## Usage
1. **Add a Device**:
   -Click ➕ and enter name and MAC address
2. **Wake a Device**:
    - Select device ➔ Click "Wake"

---  
## Troubleshooting:
- **SSH Issues**
    - **Verify Pi connectivity:**
    ```bash
    ssh $SSH_USER@$SSH_HOST
    ```
    - ** Enable SSH on Pi:**
    ```bash
    sudo raspi-config # → Interface Options → SSH
    ```
- **Device Not Waking**
    - Confirm:
        - WoL enabled in BIOS
        - Correct MAC address
        - Pi connected via Ethernet to target device
        - `etherwake` installed on Raspberry Pi
- **Container Issues**
    - Check logs:
  ```bash
  docker logs etherwake-website -f 
  ```
    - Validate volume mounts and permissions
---
## Contributing
Issues and PRs welcome! Please follow existing code style and include tests where applicable.

---
## License:
The project is licensed under the [MIT LICENSE](./LICENSE)