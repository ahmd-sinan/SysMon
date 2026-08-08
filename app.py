from flask import Flask, render_template, jsonify
import time
import datetime
import psutil
import cpuinfo
import platform
import socket
import subprocess
import os


app = Flask(__name__)

last_disk_io = psutil.disk_io_counters()

last_net_io = psutil.net_io_counters()
last_time = time.time()

current_os = platform.system()
GLOBAL_IGPU_NAME = "Unknown Display"
GLOBAL_DGPU_NAME = "Not Detected"
GLOBAL_HAS_DGPU = False

if current_os == "Windows":
    try:
        import wmi
        w = wmi.WMI()
        gpus = w.Win32_VideoController()
        if len(gpus) >= 1:
            GLOBAL_IGPU_NAME = gpus[0].name.strip()
        if len(gpus) >= 2:
            GLOBAL_HAS_DGPU = True
            GLOBAL_DGPU_NAME = gpus[1].name.strip()
    except Exception:
        # Pass if WMI is restricted or unavailable on this Windows host
        pass

elif current_os == "Linux":
    try:
        cmd = "lspci | grep -iE 'VGA|3D'"
        output = subprocess.check_output(cmd, shell=True).decode().strip().split('\n')
        gpu_list = []
        for line in output:
            parts = line.split(": ")
            if len(parts) > 1:
                gpu_list.append(parts[-1].strip())
        
        if len(gpu_list) >= 1:
            GLOBAL_IGPU_NAME = gpu_list[0] 
        if len(gpu_list) >= 2:
            GLOBAL_HAS_DGPU = True
            GLOBAL_DGPU_NAME = gpu_list[1]
    except Exception:
        pass
    
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/diagnostics")
def diagnostics():
    return render_template("diagnostics.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/api/data")
def data():
    global last_disk_io, last_net_io, last_time

    current_time = time.time()
    time_diff = current_time - last_time

    # Get CPU information
    cpu_percent = psutil.cpu_percent(interval=1)

    # Get RAM information
    memory_percent = psutil.virtual_memory().percent
    total = psutil.virtual_memory().total
    used = psutil.virtual_memory().used 

    # Get disk information
    current_disk_io = psutil.disk_io_counters()

    read_bytes = current_disk_io.read_bytes - last_disk_io.read_bytes
    write_bytes = current_disk_io.write_bytes - last_disk_io.write_bytes

    read = (read_bytes / 1024 / 1024) / time_diff
    write = (write_bytes / 1024 /1024) / time_diff

    last_disk_io = current_disk_io

    # Get network information
    current_net_io = psutil.net_io_counters()

    bytes_sent = current_net_io.bytes_sent - last_net_io.bytes_sent
    bytes_recv = current_net_io.bytes_recv - last_net_io.bytes_recv

    upload = (bytes_sent / 1024 / 1024) / time_diff
    download = (bytes_recv / 1024 / 1024) / time_diff

    last_net_io = current_net_io
    last_time = current_time

    return jsonify({
        "cpu": cpu_percent,
        "memory": memory_percent,
        "used_ram": used,
        "total_ram": total,
        "read": round(read, 2),
        "write": round(write, 2),
        "net_down": round(download, 2),
        "net_up": round(upload, 2)
    })

@app.route("/api/diagnostics")
def diag_data():
    # CPU Info
    cpu_name = cpuinfo.get_cpu_info()['brand_raw'] or "Unknown CPU"
    cpu_util = psutil.cpu_percent(interval=1)
    freq = psutil.cpu_freq()
    current_freq = f"{(freq.current / 1000):.2f}"
    max_freq = f"{(freq.max / 1000):.2f}"
    process = len(psutil.pids())
    cpu_cores = psutil.cpu_count(logical=False)
    cpu_threads = psutil.cpu_count(logical=True)

    # Memory Info
    memory = psutil.virtual_memory()
    total = memory.total
    available = memory.available
    used = memory.used
    active = f"{(getattr(memory, 'active', 0) / (1024**3)):.2f}"
    inactive = f"{(getattr(memory, 'inactive', 0) / (1024**3)):.2f}"
    swap = f"{(psutil.swap_memory().used / (1024**3)):.2f}"
    percent = memory.percent


    # GPU Info
    igpu_name = GLOBAL_IGPU_NAME
    has_dgpu = GLOBAL_HAS_DGPU
    dgpu_name = GLOBAL_DGPU_NAME
    
    igpu_usage = 0
    dgpu_usage = 0
    dgpu_temp = "--°C"
    dgpu_vram = "0.00 GB / 0.00 GB"

    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        if gpus:
            has_dgpu = True
            gpu = gpus[0]
            dgpu_name = gpu.name
            dgpu_usage = round(gpu.load * 100)
            dgpu_temp = f"{round(gpu.temperature)}°C"
            dgpu_vram = f"{(gpu.memoryUsed/1024):.2f} GB / {(gpu.memoryTotal/1024):.2f} GB"
    except Exception:
        # Fallback if GPUtil fails but nvidia-smi command works on Linux
        try:
            out = subprocess.check_output(["nvidia-smi", "--query-gpu=name,utilization.gpu,temperature.gpu,memory.used,memory.total", "--format=csv,noheader,nounits"]).decode().strip().split(",")
            has_dgpu = True
            dgpu_name = out[0].strip()
            dgpu_usage = int(out[1].strip())
            dgpu_temp = f"{out[2].strip()}°C"
            dgpu_vram = f"{(int(out[3].strip())/1024):.2f} GB / {(int(out[4].strip())/1024):.2f} GB"
        except Exception:
            pass

    if current_os == "Linux" and os.path.exists("/sys/class/drm/card0/device/gpu_busy_percent"):
        try:
            with open("/sys/class/drm/card0/device/gpu_busy_percent", "r") as f:
                igpu_usage = int(f.read().strip())
        except Exception:
            igpu_usage = round(psutil.cpu_percent() * 0.2)
    else:
        # Windows iGPU approximation helper
        igpu_usage = round(psutil.cpu_percent() * 0.15)



    # Disk Info
    # Skip virtualized loop/tmpfs filesystems to ensure accurate physical drive reporting
    partitions = psutil.disk_partitions(all=False)
    drive_names = []
    total_space = 0
    used_space = 0
    free_space = 0

    for p in partitions:
        if 'loop' in p.device or 'tmpfs' in p.fstype:
            continue
            
        drive_names.append(f"{p.mountpoint} ({p.fstype})")
        
        try:
            usage = psutil.disk_usage(p.mountpoint)
            total_space += usage.total
            used_space += usage.used
            free_space += usage.free
        except PermissionError:
            continue

    disk_name_str = " | ".join(drive_names)  # Joining all the drive names together
    disk_total = f"{(total_space / (1024**3)):.2f}"
    disk_used = f"{(used_space / (1024**3)):.2f}"
    disk_free = f"{(free_space / (1024**3)):.2f}"


    # Battery
    battery = psutil.sensors_battery()
    # Check for physical battery presence (Laptops)
    if battery:
        bat_status = "Plugged In" if battery.power_plugged else "On Battery"
        bat_percent = battery.percent

        if battery.power_plugged and bat_percent < 100:
            bat_charge = "Charging"
        elif bat_percent == 100:
            bat_charge = "Fully Charged"
        else: 
            bat_charge = "Discharging"
    # Fallback for desktops without physical batteries
    else: 
        bat_status = "AC Power"
        bat_percent = 100
        bat_charge = "Desktop (No Battery)"


    # System Info
    os_name = f"{platform.system()} {platform.release()}"
    hostname = socket.gethostname()
    timestamp = psutil.boot_time()
    boot_time_dt = datetime.datetime.fromtimestamp(timestamp)
    boot_time_str = boot_time_dt.strftime("%Y-%m-%d %I:%M %p")

    uptime_seconds = time.time() - timestamp
    uptime_hours, remainder = divmod(uptime_seconds, 3600)
    uptime_minutes, _ = divmod(remainder, 60)
    sys_uptime = f"{int(uptime_hours)}h {int(uptime_minutes)}m"

    try:
        active_user = psutil.users()[0].name
    except IndexError:
        active_user = "Unknown User"


    return jsonify({
        "cpu_name": cpu_name,
        "cpu_utilization": cpu_util,
        "cpu_current_fz": current_freq,
        "cpu_max_fz": max_freq,
        "cpu_proc": process,
        "cpu_cores": cpu_cores,
        "cpu_threads":cpu_threads,
        "ram_total": total,
        "ram_available": available,
        "ram_used": used,
        "ram_active": active,
        "ram_inactive": inactive,
        "ram_swap": swap,
        "ram_percent": percent,
        "igpu_name": igpu_name,
        "igpu_usage": igpu_usage,
        "has_dgpu": has_dgpu,
        "dgpu_name": dgpu_name,
        "dgpu_usage": dgpu_usage,
        "dgpu_temp": dgpu_temp,
        "dgpu_vram": dgpu_vram,
        "disk_name": disk_name_str,
        "disk_total": disk_total,
        "disk_used": disk_used,
        "disk_free": disk_free,
        "bat_status": bat_status,
        "bat_percent": bat_percent,
        "bat_charge": bat_charge,
        "sys_name": os_name, 
        "sys_hostname": hostname,
        "sys_uptime": sys_uptime,
        "sys_boot": boot_time_str,
        "sys_user": active_user
    })

if __name__ == "__main__":
    # host='0.0.0.0' allows the app to be accessed over the network/cloud
    app.run(host='0.0.0.0', port=5000, debug=True)