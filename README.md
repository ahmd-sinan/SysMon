# SysMon

#### **[Demo Video](https://youtu.be/59HtrCSEk_A?si=bcj8wCrmeUG4UOp_)**

## Description
**SysMon** is a real-time system monitoring cross-platform web app built as a **CS50x 2026 Final Project**. The backend is powered by Python and Flask, which constantly pulls live hardware data and serves it to the frontend as raw JSON data. The application is designed to work seamlessly right out of the box on both Windows and Linux environments.

The project features an elegant, responsive dark-mode dashboard that displays core performance analytics through live telemetry streams and rolling data charts, eliminating the need for complex desktop native utility tools. 

---

## Features / What the App Does 
### 1. Main Live Dashboard (` / `)
* **Real-Time Performance Stats:** Right when you open the app, the home page displays live text indicators tracking your current CPU usage, RAM allocation, disk read/write rates, and network download/upload speeds.
* **Live Chart.js Graphs:** To help visualize hardware trends over time, I integrated Chart.js into the main dashboard. The frontend requests new telemetry data in the background every second and updates interactive line charts smoothly.

### 2. Deep Hardware Diagnostics (` /diagnostics `)
* **Comprehensive System Specs:** Navigating to the diagnostics page pulls an exhaustive breakdown of your hardware setup. 
* **Processor & Memory Details:** It displays your exact CPU model name, active core and thread counts, current and maximum clock speeds (GHz), and total task process counts. For RAM, it differentiates between total capacity, available free space, active memory, and virtual swap files with color-coded warning progress bars.
* **Dynamic GPU Detection:** The app checks whether a dedicated GPU (dGPU) exists on the host machine. If it does, it pulls usage, temperature, and VRAM statistics. If it doesn't (like on integrated-only systems or cloud servers), it safely displays "Not Available" with a dimmed UI layout instead of crashing.
* **Power & Storage States:** Tracks local battery percentage, charging states, system uptime, and primary disk partition capacities.

### 3. Application Information (` /about `)
* **Tech Stack & Documentation:** A dedicated page documenting the project manifest, dependencies, and author links. It features an open-source MIT License breakdown and clean developer contact links.

---

## Tech Stack & Dependencies
* **Python (v3.14.5)**: Core asynchronous backend runtime.
* **Flask**: Lightweight routing framework serving web nodes and API data points.
* **psutil**: Native hardware monitoring system engine.
* **WMI / Py-cpuinfo**: Low-level hardware diagnostic query modules.
* **GPUtil**: Dedicated Graphics Processing Unit (dGPU) data interface.
* **JavaScript**: Frontend polling controller handling client asynchronous streams.
* **Chart.js**: Client-side hardware metrics visualizer rendering real-time tracking graphs.
* **Bootstrap 5**: Modular layout framework for mobile-responsive interface alignment.
* **CSS3**: Standard styling layer delivering a smooth dark UI and rich transition components.

---

## Built With
* **Backend:** Python, Flask
* **Hardware Sensors:** psutil, WMI (for Windows), GPUtil (for GPUs)
* **Frontend:** HTML5, CSS3, JavaScript
* **Libraries:** Chart.js (for the live graphs), Bootstrap 5 (for the grid layout)

---

## File Structure
```
sysmon/
├── app.py               # It runs the Flask server, figures out what operating system you are using, and gathers all the hardware data to send to the frontend.
├── requirements.txt     # A simple list of the Python packages needed to run this application
├── .gitignore
├── LICENSE              # Provisioned under standard MIT licensing agreements to allow open distribution structures.
├── static/              
│   ├── script.js        # The JavaScript, It asks the Python backend for new data every single second and updates the HTML text and Chart.js graphs instantly
│   ├── styles.css       # Styling
│   └── images/          # icons and visual assets.
└── templates/           
    ├── layout.html      # This is base container file so the sidebar navigation structure is shared across pages
    ├── index.html       # The main dashboard page displaying live stats and graphs
    ├── diagnostics.html # Exposes deep system specs like core counts, processes, and storage space
    └── about.html       # Documents the application manifest and tech stack details.
```

---

## Design Decisions 
Background Data Fetching: Instead of reloading the web page every time the CPU usage changes, I created background data routes in Flask. The frontend uses JavaScript fetch() to grab this data in the background. This makes the dashboard feel completely real-time.
* **Stopping Memory Leaks:** If a live chart runs for an hour, it collects thousands of data points and can crash the browser. To fix this, I wrote logic in JavaScript using `.shift()` to always delete the oldest data point once the chart hits 20 items. This keeps the browser fast forever.
* **Handling Different Operating Systems:** Getting hardware data on a Windows PC is completely different than on a Linux server. I used `platform.system()` in Python to detect the OS. If a certain command (like checking a specific GPU) fails, I used `try/except` blocks to safely show "Not Available" instead of letting the whole app crash.

---

## AI Use Documented

Per CS50's policy, here is where and how AI was used in this project:

| where | what i asked for | what it did |
| :--- | :--- | :--- |
| `app.py`, Linux GPU detection (`lspci` block) | Asked how to parse Linux `lspci` terminal output using `subprocess` and string splits to extract GPU names for integrated and dedicated graphics. | Wrote the cross-platform command string parsing and list extraction logic. |
| `app.py`, CPU brand retrieval (`cpuinfo`) | Asked how to get the clean CPU model name string using the `cpuinfo` library. | Provided the `cpuinfo.get_cpu_info()['brand_raw']` syntax with a fallback string. |
| `app.py`, Memory tracking (Active, Inactive, Swap) | Asked how to pull detailed RAM statistics like active, inactive, and swap memory across platforms using `psutil`. | Explained how to access `psutil.swap_memory()` and virtual memory metrics. |
| `app.py`, Cross-platform iGPU info loading | Asked how to safely load integrated GPU hardware names across different operating systems. | Provided structured logic using `platform` checks and fallback parameters. |
| `app.py`, NVIDIA GPU metrics (`nvidia-smi`) | Asked how to execute terminal commands with `subprocess` to fetch dedicated NVIDIA GPU utilization, temperature, and VRAM in CSV format. | Wrote the `nvidia-smi` query string, CSV comma splitting, and string formatting formulas for gigabytes. |
| `app.py`, Disk partitions and drive names | Asked how to retrieve all local disk partitions and clean up their display names using `psutil`. | Provided the disk usage iteration block and drive name parsing logic|
| `app.py`, System uptime calculation | Asked how to calculate system uptime and format boot times into readable timestamps. | Provided the time formatting logic using Python's standard libraries. |
| `script.js`, Dynamic progress bar color logic | Asked how to dynamically switch Bootstrap progress bar color classes (`bg-danger`, `bg-warning`, `bg-success`) based on live RAM and battery percentage thresholds. | Wrote the conditional class-switching statement logic for the client-side script. |

---

# How to Run
* **Clone the Repo:**
```bash
git clone https://github.com/ahmd-sinan/SysMon.git
cd SysMon
```
* **Install required packages:**
```bash
pip install -r requirements.txt
```

* **Start the server:**
```bash
python app.py
```
* **Open web browser and go `http://127.0.0.1:5000`**

--- 

## License
This project is licensed under the standard **MIT License**

---

## Author
Built by ***Ahamed Sinan***

*⭐ If you found this project helpful or interesting, feel free to drop a star on the repository!*
