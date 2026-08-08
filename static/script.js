if (window.location.pathname == "/") {
    // CPU Chart
    const cpu = document.getElementById("cpuChart").getContext("2d");

    let cpuChart = new Chart(cpu, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "CPU Usage",
                data: [],
                borderColor: '#00ff00',
                borderWidth: 2,
                tension: 0.2
            }]
        },    
        options: {
        animation: false,
        scales: {
            y: {
                min: 0,
                max: 100
            }
        }
        }
    });


    // Memory Chart
    const memory = document.getElementById("memoryChart").getContext("2d");

    let memoryChart = new Chart(memory, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "RAM Usage",
                data: [],
                borderColor: '#00bfff',
                borderWidth: 2,
                tension: 0.2
            }]
        },    
        options: {
        animation: false,
        scales: {
            y: {
                min: 0,
                max: 100
            }
        }
        }
    });

    // Disk Chart
    const disk = document.getElementById("diskChart").getContext("2d");

    let diskChart = new Chart(disk, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Read ",
                data: [],
                borderColor: '#ffffff',
                borderWidth: 2,
                tension: 0.2
            },
            {
                label: "Write ",
                data: [],
                borderColor: '#a200ff',
                borderWidth: 2,
                tension: 0.2
            }]
        
        },   
        options: {
            animation: false,
            scales: {
                y: {
                    min: 0
                }
            }
        }
    });


    // Network Chart
    const network = document.getElementById("networkChart").getContext("2d");

    let networkChart = new Chart(network, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Download",
                data: [],
                borderColor: '#ffff00',
                borderWidth: 2,
                tension: 0.2
            },
            {
                label: "Upload",
                data: [],
                borderColor: '#ff8c00',
                borderWidth: 2,
                tension: 0.2
            }]
        },    
        options: {
            animation: false,
            scales: {
                y: {
                    min: 0
                }
            }
        }
    });


    setInterval( function() {
        fetch('/api/data')

        .then(response => response.json())
        .then(data => {
            document.getElementById("cpuUsage").innerHTML = "<span style='color: #d1d5db;'>Live CPU: </span>" + 
            "<strong class='live-data' style='font-size: 24px; color: #00ff00;'>" + data.cpu + "% </strong>";

            document.getElementById("memoryUsage").innerHTML = "<span style='color: #d1d5db;'>Live RAM: </span>" + "<strong class='live-data' style='font-size: 24px; color: #00bfff;'>" + 
            data.memory + "%</strong>  <strong style='color: #00bfff;'>(" + (data.used_ram / (1024**3)).toFixed(2) + "GB / " + Math.ceil(data.total_ram / (1024**3)) + "GB )</strong>";

            document.getElementById("diskUsage").innerHTML = 
            "<span style='color: #ffffff;'><span style='color: #d1d5db;'>Read: </span>" + "<strong class='live-data' style='font-size: 20px;'>" + 
            data.read + "MB/s</strong></span>" + "<span style='color: white'>  |  </span>" + "<span style='color: #a200ff;'><span style='color: #d1d5db'>Write: </span>" + 
            "<strong class='live-data' style='font-size: 20px;'>" + data.write + "MB/s</strong></span>";

            document.getElementById("networkUsage").innerHTML = 
            "<span style='color: #ffff00;'><span style='color: #d1d5db'>Download: </span>" + "<strong class='live-data' style='font-size: 20px;'>" + data.net_down + "MB/s</strong></span>" + 
            "<span style='color: white'>  |  </span>" + "<span style='color: #ff8c00;'><span style='color: #d1d5db'>Upload: </span>" + "<strong class='live-data' style='font-size: 20px;'>" + 
            data.net_up + "MB/s</strong></span>";

            let currentTime = new Date().toLocaleTimeString();

            // Update CPU Chart
            cpuChart.data.labels.push(currentTime);
            cpuChart.data.datasets[0].data.push(data.cpu);
            if (cpuChart.data.labels.length > 20) {
                cpuChart.data.labels.shift();
                cpuChart.data.datasets[0].data.shift();
            }
            cpuChart.update();

            // Update Memory Chart
            memoryChart.data.labels.push(currentTime);
            memoryChart.data.datasets[0].data.push(data.memory);
            if (memoryChart.data.labels.length > 20) {
                memoryChart.data.labels.shift();
                memoryChart.data.datasets[0].data.shift();
            }
            memoryChart.update();

            // Update Disk Chart
            diskChart.data.labels.push(currentTime);
            diskChart.data.datasets[0].data.push(data.read);
            diskChart.data.datasets[1].data.push(data.write);
            if (diskChart.data.labels.length > 20) {
                diskChart.data.labels.shift();
                diskChart.data.datasets[0].data.shift();
                diskChart.data.datasets[1].data.shift();
            }
            diskChart.update();

            // Update Network Chart
            networkChart.data.labels.push(currentTime);
            networkChart.data.datasets[0].data.push(data.net_down);
            networkChart.data.datasets[1].data.push(data.net_up);
            if (networkChart.data.labels.length > 20) {
                networkChart.data.labels.shift();
                networkChart.data.datasets[0].data.shift();
                networkChart.data.datasets[1].data.shift();
            }
            networkChart.update();

            
        })
    }, 1000)
}

if (window.location.pathname == "/diagnostics") {
    function updateDiagnostics() {
        fetch("/api/diagnostics")

        .then(response => response.json())
        .then(data => {
            // CPU  
            document.getElementById("cpu-name").innerHTML = data.cpu_name;
            document.getElementById("cpu-util").innerHTML = data.cpu_utilization + "%";
            document.getElementById("cpu-fz").innerHTML = data.cpu_current_fz + " GHz";
            document.getElementById("cpu-max-fz").innerHTML = data.cpu_max_fz + " GHz";
            document.getElementById("cpu-processes").innerHTML = data.cpu_proc + " Tasks";
            document.getElementById("cpu-cores").innerHTML = data.cpu_cores;
            document.getElementById("cpu-threads").innerHTML = data.cpu_threads;
            

            //  RAM
            document.getElementById("ram-total").innerHTML = Math.ceil(data.ram_total / (1024**3)) + " GB  (" + data.ram_total + " Bytes)";
            document.getElementById("ram-available").innerHTML = (data.ram_available / (1024**3)).toFixed(2) + " GB  (" + data.ram_available + " Bytes)";
            document.getElementById("ram-used").innerHTML = (data.ram_used / (1024**3)).toFixed(2) + " GB  (" + data.ram_used + " Bytes)";
            document.getElementById("ram-active").innerHTML = data.ram_active  + " GB";
            document.getElementById("ram-inact").innerHTML = data.ram_inactive  + " GB";
            document.getElementById("ram-swap").innerHTML = data.ram_swap + " GB";

            let ramProgress = document.getElementById("ram-progress");
            ramProgress.style.width = data.ram_percent + "%"; // Stretches the bar

            if (data.ram_percent >= 80) {
                ramProgress.className = "progress-bar bg-danger";
            } else if (data.ram_percent >= 60) {
                ramProgress.className = "progress-bar bg-warning";
            } else {
                ramProgress.className = "progress-bar bg-secondary"; 
            }


            // GPU Chart
            document.getElementById("igpu-name").innerHTML = data.igpu_name;
            document.getElementById("igpu-usage").innerHTML = data.igpu_usage + "%";

            if (data.has_dgpu) {
                // If YES: Show all data completely
                document.getElementById("dgpu-name").innerHTML = data.dgpu_name;
                document.getElementById("dgpu-usage").innerHTML = data.dgpu_usage + "%";
                document.getElementById("dgpu-temp").innerHTML = data.dgpu_temp;
                document.getElementById("dgpu-vram").innerHTML = data.dgpu_vram;
                
                // Reset formatting styles just in case
                document.getElementById("dgpu-name").style.opacity = "1";
                document.getElementById("dgpu-usage").style.opacity = "1";
                document.getElementById("dgpu-temp").style.opacity = "1";
                document.getElementById("dgpu-vram").style.opacity = "1";
            } else {
                // If NO dGPU: Custom display polish so layout doesn't look broken
                document.getElementById("dgpu-name").innerHTML = "Not Available";
                document.getElementById("dgpu-usage").innerHTML = "--%";
                document.getElementById("dgpu-temp").innerHTML = "--°C";
                document.getElementById("dgpu-vram").innerHTML = "0 GB / 0 GB";
                
                // Dim the text so the user instantly realizes it is disabled hardware
                document.getElementById("dgpu-name").style.opacity = "0.4";
                document.getElementById("dgpu-usage").style.opacity = "0.4";
                document.getElementById("dgpu-temp").style.opacity = "0.4";
                document.getElementById("dgpu-vram").style.opacity = "0.4";
            }


            // Disk / Storage
            document.getElementById("disk-name").innerHTML = data.disk_name;
            document.getElementById("disk-total").innerHTML = data.disk_total + " GB";
            document.getElementById("disk-used").innerHTML = data.disk_used + " GB";
            document.getElementById("disk-free").innerHTML = data.disk_free + " GB";


            // Power / Battery
            document.getElementById("bat-status").innerHTML = data.bat_status;
            document.getElementById("bat-percent").innerHTML = data.bat_percent + "%";
            document.getElementById("bat-charge").innerHTML = data.bat_charge;

            let batProgress = document.getElementById("bat-progress");
            batProgress.style.width = data.bat_percent + "%"; // Stretches the bar

            if (data.bat_percent <= 20 && data.bat_status === "On Battery") {
                batProgress.className = "progress-bar bg-danger"; // Red when dying
            } else if (data.bat_status === "Plugged In" || data.bat_charge === "Charging") {
                batProgress.className = "progress-bar bg-success"; // Green when charging
            } else {
                batProgress.className = "progress-bar bg-secondary"; // Blue for normal
            }


            // System / Users
            document.getElementById("sys-os").innerHTML = data.sys_name;
            document.getElementById("sys-hostname").innerHTML = data.sys_hostname;
            document.getElementById("sys-uptime").innerHTML = data.sys_uptime;
            document.getElementById("sys-boot").innerHTML = data.sys_boot;
            document.getElementById("sys-user").innerHTML = data.sys_user;
        })
        .catch(error => {
            console.error("Error fetching diagnostics data:", error)
        })
    }

    updateDiagnostics();
    setInterval(updateDiagnostics, 2000);
}
