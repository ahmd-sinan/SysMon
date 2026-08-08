# SysMon

### **[Demo Video](Link)**

## Project Description
**SysMon** is a real-time system monitoring cross-platform web app built as a **CS50x 2026 Final Project**. The backend is powered by Python and Flask, which constantly pulls live hardware data and serves it to the frontend via a RESTful API. The application is designed to work seamlessly right out of the box on both Windows and Linux environments.

The project features an elegant, responsive dark-mode dashboard that displays core performance analytics through live telemetry streams and rolling data charts, eliminating the need for complex desktop native utility tools. 

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
---text
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
* **Using a REST API:** Instead of reloading the web page every time the CPU usage changes, I created an API route (`/api/data`) in Flask. The frontend uses JavaScript `fetch()` to grab this data in the background. This makes the dashboard feel completely real-time.
* **Stopping Memory Leaks:** If a live chart runs for an hour, it collects thousands of data points and can crash the browser. To fix this, I wrote logic in JavaScript using `.shift()` to always delete the oldest data point once the chart hits 20 items. This keeps the browser fast forever.
* **Handling Different Operating Systems:** Getting hardware data on a Windows PC is completely different than on a Linux server. I used `platform.system()` in Python to detect the OS. If a certain command (like checking a specific GPU) fails, I used `try/except` blocks to safely show "Not Available" instead of letting the whole app crash.

---

# How to Run
* **Clone the Repo:**
```bash
git clone [https://github.com/ahmd-sinan/SysMon.git](https://github.com/ahmd-sinan/SysMon.git)
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

## About the Developer
Built by ***Ahamed Sinan***
* **GitHub:**[https://github.com/ahmd-sinan](https://github.com/ahmd-sinan)
* **LinkedIn:** [https://www.linkedin.com/in/ahamed-sinan-k-840236343/](https://www.linkedin.com/in/ahamed-sinan-k-840236343/)
* **X:** [https://x.com/Ahamed_Sinan_](https://x.com/Ahamed_Sinan_)

---

*⭐ If you found this project helpful or interesting, feel free to drop a star on the repository!*
