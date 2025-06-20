// Synthesizer Interactive Functionality
let audioContext;
let currentOscillator = null;
let currentGain = null;

// Recording functionality
let isRecording = false;
let isPlaying = false;
let isPaused = false;
let recordedNotes = [];
let recordingStartTime = null;
let pauseStartTime = null;
let totalPauseDuration = 0;
let playbackStartTime = null;
let recordingTimer = null;
let playbackTimer = null;
let mediaRecorder = null;
let recordedBlob = null;

// Recording states
const RECORDING_STATES = {
    IDLE: 'idle',
    RECORDING: 'recording',
    PAUSED: 'paused',
    STOPPED_WITH_DATA: 'stopped_with_data'
};

let currentRecordingState = RECORDING_STATES.IDLE;

// Initialize audio context on user interaction
function initializeAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Welcome overlay functionality
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-exploration-button');
    const overlay = document.getElementById('main-page-overlay');
    const header = document.querySelector('header');
    
    startButton.addEventListener('click', function() {
        overlay.classList.add('hidden');
        header.style.transform = 'translateY(0)';
        // Initialize audio context
        initializeAudio();
        // Show first section with animation
        showSection('sound');
    });
});

// Mobile navigation functionality
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

mobileMenuToggle.addEventListener('click', function() {
    mobileNavOverlay.classList.add('open');
});

function closeMobileNav() {
    mobileNavOverlay.classList.remove('open');
}

// Tab navigation system
function showSection(sectionName) {
    // Hide welcome overlay
    const overlay = document.getElementById('main-page-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('fade-in');
    }
    
    // Update active tab
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Find and activate the correct tab
    const activeTab = document.querySelector(`[onclick*="${sectionName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update page title with section name
    updatePageTitle(sectionName);
    
    // Initialize section-specific functionality
    initializeSectionFeatures(sectionName);
}

// Update page title based on current section
function updatePageTitle(sectionName) {
    const sectionTitles = {
        'sound': '1. 소리의 세계',
        'heart': '2. 신디사이저의 기본 구조',
        'components': '3. 핵심 부품들',
        'hands-on': '4. 직접 체험해보기',
        'diy': '5. DIY 프로젝트'
    };
    
    const title = sectionTitles[sectionName];
    if (title) {
        document.title = `${title} - DIY 아날로그 신디사이저 탐험`;
    }
}

// Show intro overlay
function showIntro() {
    const overlay = document.getElementById('main-page-overlay');
    const sections = document.querySelectorAll('.content-section');
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show overlay
    if (overlay) {
        overlay.classList.remove('hidden');
    }
    
    // Reset page title
    document.title = 'DIY 아날로그 신디사이저 탐험';
    
    // Reset tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Navigation helper functions
function getPreviousSection() {
    const sections = ['sound', 'heart', 'components', 'hands-on', 'diy'];
    const currentSection = getCurrentSection();
    const currentIndex = sections.indexOf(currentSection);
    
    if (currentIndex > 0) {
        showSection(sections[currentIndex - 1]);
    } else {
        showIntro(); // Go to intro if at first section
    }
}

function getNextSection() {
    const sections = ['sound', 'heart', 'components', 'hands-on', 'diy'];
    const currentSection = getCurrentSection();
    const currentIndex = sections.indexOf(currentSection);
    
    if (currentIndex < sections.length - 1) {
        showSection(sections[currentIndex + 1]);
    }
}

function getCurrentSection() {
    const sections = ['sound', 'heart', 'components', 'hands-on', 'diy'];
    for (const section of sections) {
        const element = document.getElementById(`${section}-section`);
        if (element && !element.classList.contains('hidden')) {
            return section;
        }
    }
    return null;
}

// Initialize features for specific sections
function initializeSectionFeatures(sectionName) {
    switch(sectionName) {
        case 'sound':
            initializeWaveformChart();
            break;
        case 'heart':
            initializeADSRChart();
            break;
        case 'hands-on':
            initializeHandsOnDemo();
            initializeKeyboardRecording();
            break;
        case 'circuit-analysis':
            initializeCircuitSimulation();
            break;
    }
}

// Waveform chart initialization
function initializeWaveformChart() {
    const canvas = document.getElementById('waveformChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.waveformChartInstance) {
        window.waveformChartInstance.destroy();
    }
    
    const waveformData = generateWaveformData();
    
    window.waveformChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: waveformData.labels,
            datasets: [
                {
                    label: '사인파',
                    data: waveformData.sine,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: '사각파',
                    data: waveformData.square,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    stepped: true
                },
                {
                    label: '톱니파',
                    data: waveformData.sawtooth,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '삼각파',
                    data: waveformData.triangle,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '시간'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '진폭'
                    },
                    min: -1.2,
                    max: 1.2,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        }
    });
}

// Generate waveform data for chart
function generateWaveformData() {
    const points = 200;
    const labels = [];
    const sine = [];
    const square = [];
    const sawtooth = [];
    const triangle = [];
    
    for (let i = 0; i < points; i++) {
        const x = (i / points) * 4 * Math.PI;
        labels.push((i / points * 4).toFixed(2));
        
        sine.push(Math.sin(x));
        square.push(Math.sin(x) > 0 ? 1 : -1);
        sawtooth.push(((x % (2 * Math.PI)) / Math.PI) - 1);
        
        const triangleValue = (2 / Math.PI) * Math.asin(Math.sin(x));
        triangle.push(triangleValue);
    }
    
    return { labels, sine, square, sawtooth, triangle };
}

// ADSR chart initialization
function initializeADSRChart() {
    const canvas = document.getElementById('adsrChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.adsrChartInstance) {
        window.adsrChartInstance.destroy();
    }
    
    const adsrData = generateADSRData();
    
    window.adsrChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: adsrData.labels,
            datasets: [{
                label: 'ADSR 엔벨로프',
                data: [0, 0, 0, 0, 0], // Start with empty data for animation
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0,
                pointBackgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#6b7280'],
                pointBorderColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#6b7280'],
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '시간'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '볼륨'
                    },
                    min: 0,
                    max: 1.1,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            elements: {
                point: {
                    borderWidth: 2
                }
            },
            animation: {
                duration: 0 // Disable default animation
            }
        }
    });
    
    // Start animation
    animateADSRChart();
}

// Animate ADSR chart
function animateADSRChart() {
    if (!window.adsrChartInstance) return;
    
    const targetData = [0, 1, 0.7, 0.7, 0];
    const currentData = window.adsrChartInstance.data.datasets[0].data;
    let step = 0;
    
    const animate = () => {
        if (step < targetData.length) {
            currentData[step] = targetData[step];
            window.adsrChartInstance.update('none');
            step++;
            setTimeout(animate, 600); // 600ms delay between each point
        } else {
            // Reset and repeat animation after 2 seconds
            setTimeout(() => {
                currentData.fill(0);
                window.adsrChartInstance.update('none');
                step = 0;
                setTimeout(animate, 500);
            }, 2000);
        }
    };
    
    animate();
}

// Generate ADSR envelope data
function generateADSRData() {
    return {
        labels: ['Start', 'Attack Peak', 'Decay End', 'Sustain', 'Release End'],
        values: [0, 1, 0.7, 0.7, 0]
    };
}

// Hands-on demo initialization
function initializeHandsOnDemo() {
    initializeOscillatorDemo();
    initializeKeyboard();
    initializeFilterDemo();
}

// Virtual oscillator demo
function initializeOscillatorDemo() {
    const frequencySlider = document.getElementById('frequencySlider');
    const frequencyValue = document.getElementById('frequencyValue');
    const waveformSelect = document.getElementById('waveformSelect');
    
    if (!frequencySlider) return;
    
    frequencySlider.addEventListener('input', function() {
        frequencyValue.textContent = this.value + 'Hz';
    });
}

// Virtual keyboard functionality
function initializeKeyboard() {
    const keyboardKeys = document.querySelectorAll('.piano-key');
    
    keyboardKeys.forEach(key => {
        key.addEventListener('mousedown', function() {
            playNote(this.dataset.frequency);
            this.classList.add('active');
        });
        
        key.addEventListener('mouseup', function() {
            stopNote();
            this.classList.remove('active');
        });
        
        key.addEventListener('mouseleave', function() {
            stopNote();
            this.classList.remove('active');
        });
        
        // Touch events for mobile
        key.addEventListener('touchstart', function(e) {
            e.preventDefault();
            playNote(this.dataset.frequency);
            this.classList.add('active');
        });
        
        key.addEventListener('touchend', function(e) {
            e.preventDefault();
            stopNote();
            this.classList.remove('active');
        });
    });
}

// Filter demo initialization
function initializeFilterDemo() {
    const filterCutoff = document.getElementById('filterCutoff');
    const cutoffValue = document.getElementById('cutoffValue');
    const filterToggle = document.getElementById('filterToggle');
    
    if (!filterCutoff) return;
    
    filterCutoff.addEventListener('input', function() {
        cutoffValue.textContent = this.value + 'Hz';
    });
    
    // Visual feedback for filter toggle
    if (filterToggle) {
        filterToggle.addEventListener('change', function() {
            const filterDemo = document.querySelector('.filter-demo');
            if (this.checked) {
                filterDemo.classList.add('bg-gradient-to-br', 'from-blue-50', 'to-blue-100');
                filterDemo.classList.remove('bg-gradient-to-br', 'from-slate-50', 'to-primary-50');
            } else {
                filterDemo.classList.add('bg-gradient-to-br', 'from-slate-50', 'to-primary-50');
                filterDemo.classList.remove('bg-gradient-to-br', 'from-blue-50', 'to-blue-100');
            }
        });
    }
}

// Circuit simulation variables
let circuitOscillator = null;
let circuitGainNode = null;
let isCircuitRunning = false;
let simulationInterval = null;

// Initialize circuit simulation
function initializeCircuitSimulation() {
    const powerSwitch = document.getElementById('circuitPower');
    const vr1 = document.getElementById('vr1');
    const vr2 = document.getElementById('vr2');
    const vr1Value = document.getElementById('vr1Value');
    const vr2Value = document.getElementById('vr2Value');
    
    if (!powerSwitch || !vr1 || !vr2) return;
    
    // Power switch event
    powerSwitch.addEventListener('change', function() {
        if (this.checked) {
            startCircuitSimulation();
        } else {
            stopCircuitSimulation();
        }
    });
    
    // Variable resistor events
    vr1.addEventListener('input', function() {
        vr1Value.textContent = this.value + 'kΩ';
        if (isCircuitRunning) {
            updateCircuitParameters();
        }
    });
    
    vr2.addEventListener('input', function() {
        vr2Value.textContent = this.value + '%';
        if (isCircuitRunning) {
            updateCircuitParameters();
        }
    });
    
    // Initialize displays
    updateCircuitDisplay();
}

function startCircuitSimulation() {
    try {
        initializeAudio();
        isCircuitRunning = true;
        
        // Create oscillator for buzzer sound
        circuitOscillator = audioContext.createOscillator();
        circuitGainNode = audioContext.createGain();
        
        // Set initial parameters first
        const vr1 = document.getElementById('vr1');
        const vr2 = document.getElementById('vr2');
        
        if (vr1 && vr2) {
            // Calculate frequency based on VR1 (1kΩ to 100kΩ)
            const resistance = parseFloat(vr1.value) * 1000;
            const capacitance = 100e-9;
            const frequency = 1 / (2.2 * resistance * capacitance);
            
            // Set oscillator properties
            circuitOscillator.type = 'square';
            circuitOscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            // Set volume based on duty cycle
            const dutyCycle = parseFloat(vr2.value);
            const volume = 0.05 * (dutyCycle / 100); // Reduced volume
            circuitGainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        }
        
        // Connect audio nodes
        circuitOscillator.connect(circuitGainNode);
        circuitGainNode.connect(audioContext.destination);
        
        // Start oscillator
        circuitOscillator.start();
        
        // Start simulation update loop
        simulationInterval = setInterval(updateCircuitDisplay, 100);
        
        // Visual feedback
        const statusLED = document.getElementById('statusLED');
        if (statusLED) {
            statusLED.style.backgroundColor = '#10b981';
            statusLED.classList.add('animate-pulse');
        }
        
        console.log('Circuit simulation started successfully');
    } catch (error) {
        console.error('Error starting circuit simulation:', error);
        isCircuitRunning = false;
    }
}

function stopCircuitSimulation() {
    isCircuitRunning = false;
    
    if (circuitOscillator) {
        circuitOscillator.stop();
        circuitOscillator = null;
        circuitGainNode = null;
    }
    
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    
    // Visual feedback
    const statusLED = document.getElementById('statusLED');
    if (statusLED) {
        statusLED.style.backgroundColor = '#6b7280';
        statusLED.classList.remove('animate-pulse');
    }
    
    updateCircuitDisplay();
}

function updateCircuitParameters() {
    if (!circuitOscillator || !circuitGainNode || !isCircuitRunning) return;
    
    const vr1 = document.getElementById('vr1');
    const vr2 = document.getElementById('vr2');
    
    if (!vr1 || !vr2) return;
    
    try {
        // Calculate frequency based on VR1 (1kΩ to 100kΩ)
        const resistance = parseFloat(vr1.value) * 1000; // Convert to Ω
        const capacitance = 100e-9; // 100nF
        const frequency = Math.max(10, Math.min(2000, 1 / (2.2 * resistance * capacitance))); // Clamp frequency
        
        // Calculate duty cycle based on VR2 (10% to 90%)
        const dutyCycle = parseFloat(vr2.value);
        
        // Update oscillator frequency smoothly
        circuitOscillator.frequency.setTargetAtTime(frequency, audioContext.currentTime, 0.1);
        
        // Simulate duty cycle effect on volume
        const volume = 0.03 * (dutyCycle / 100); // Further reduced volume
        circuitGainNode.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
        
        console.log(`Updated circuit: freq=${frequency.toFixed(1)}Hz, duty=${dutyCycle}%`);
    } catch (error) {
        console.error('Error updating circuit parameters:', error);
    }
}

function updateCircuitDisplay() {
    const frequencyDisplay = document.getElementById('frequencyDisplay');
    const voltageDisplay = document.getElementById('voltageDisplay');
    const currentDisplay = document.getElementById('currentDisplay');
    const statusLED = document.getElementById('statusLED');
    
    if (isCircuitRunning) {
        const vr1 = document.getElementById('vr1');
        const vr2 = document.getElementById('vr2');
        
        if (vr1 && vr2) {
            // Calculate frequency
            const resistance = parseFloat(vr1.value) * 1000;
            const capacitance = 100e-9;
            const frequency = 1 / (2.2 * resistance * capacitance);
            
            // Calculate voltage and current
            const dutyCycle = parseFloat(vr2.value);
            const outputVoltage = 4.5 * (dutyCycle / 100);
            const current = outputVoltage / 1000; // Simplified current calculation
            
            if (frequencyDisplay) frequencyDisplay.textContent = Math.round(frequency) + ' Hz';
            if (voltageDisplay) voltageDisplay.textContent = outputVoltage.toFixed(1) + 'V';
            if (currentDisplay) currentDisplay.textContent = (current * 1000).toFixed(1) + 'mA';
        }
    } else {
        if (frequencyDisplay) frequencyDisplay.textContent = '0 Hz';
        if (voltageDisplay) voltageDisplay.textContent = '0.0V';
        if (currentDisplay) currentDisplay.textContent = '0.0mA';
    }
}

// Audio helper functions
let currentFilter = null;

function playNote(frequency) {
    initializeAudio();
    stopNote();
    
    currentOscillator = audioContext.createOscillator();
    currentGain = audioContext.createGain();
    
    // Get oscillator settings from UI if available
    const waveformSelect = document.getElementById('waveformSelect');
    const waveformType = waveformSelect ? waveformSelect.value : 'sawtooth';
    
    currentOscillator.type = waveformType;
    currentOscillator.frequency.setValueAtTime(parseFloat(frequency), audioContext.currentTime);
    
    // ADSR envelope
    currentGain.gain.setValueAtTime(0, audioContext.currentTime);
    currentGain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05); // Attack
    currentGain.gain.exponentialRampToValueAtTime(0.07, audioContext.currentTime + 0.15); // Decay
    
    // Check if filter is enabled
    const filterToggle = document.getElementById('filterToggle');
    const filterCutoff = document.getElementById('filterCutoff');
    
    if (filterToggle && filterToggle.checked && filterCutoff) {
        // Create and configure filter
        currentFilter = audioContext.createBiquadFilter();
        currentFilter.type = 'lowpass';
        currentFilter.frequency.setValueAtTime(parseFloat(filterCutoff.value), audioContext.currentTime);
        currentFilter.Q.setValueAtTime(5, audioContext.currentTime);
        
        // Connect: oscillator -> filter -> gain -> destination
        currentOscillator.connect(currentFilter);
        currentFilter.connect(currentGain);
    } else {
        // Connect: oscillator -> gain -> destination (no filter)
        currentOscillator.connect(currentGain);
    }
    
    currentGain.connect(audioContext.destination);
    currentOscillator.start();
}

function stopNote() {
    if (currentOscillator && currentGain) {
        // Release
        currentGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        currentOscillator.stop(audioContext.currentTime + 0.3);
        currentOscillator = null;
        currentGain = null;
        currentFilter = null;
    }
}

function stopOscillator() {
    if (currentOscillator) {
        currentOscillator.stop();
        currentOscillator = null;
        currentGain = null;
    }
}

function startWaveform(waveType) {
    initializeAudio();
    stopWaveform();
    
    currentOscillator = audioContext.createOscillator();
    currentGain = audioContext.createGain();
    
    currentOscillator.type = waveType;
    currentOscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    currentGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    currentOscillator.connect(currentGain);
    currentGain.connect(audioContext.destination);
    
    currentOscillator.start();
    
    // Visual feedback
    const button = document.querySelector(`[data-waveform="${waveType}"]`);
    if (button) {
        button.classList.add('playing');
    }
}

function stopWaveform() {
    if (currentOscillator && currentGain) {
        currentGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        currentOscillator.stop(audioContext.currentTime + 0.1);
        currentOscillator = null;
        currentGain = null;
    }
    
    // Remove visual feedback from all buttons
    const buttons = document.querySelectorAll('.waveform-button');
    buttons.forEach(button => {
        button.classList.remove('playing');
    });
}

function playWaveform(waveType) {
    initializeAudio();
    stopOscillator();
    
    currentOscillator = audioContext.createOscillator();
    currentGain = audioContext.createGain();
    
    currentOscillator.type = waveType;
    currentOscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    currentGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    currentOscillator.connect(currentGain);
    currentGain.connect(audioContext.destination);
    
    currentOscillator.start();
    currentOscillator.stop(audioContext.currentTime + 1);
    
    setTimeout(() => {
        currentOscillator = null;
        currentGain = null;
    }, 1000);
}

function playFilterDemo(cutoffFreq) {
    stopOscillator();
    
    currentOscillator = audioContext.createOscillator();
    currentGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    currentOscillator.type = 'sawtooth';
    currentOscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffFreq, audioContext.currentTime);
    filter.Q.setValueAtTime(5, audioContext.currentTime);
    
    currentGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    currentOscillator.connect(filter);
    filter.connect(currentGain);
    currentGain.connect(audioContext.destination);
    
    currentOscillator.start();
    currentOscillator.stop(audioContext.currentTime + 2);
    
    // Sweep the filter
    filter.frequency.exponentialRampToValueAtTime(cutoffFreq * 4, audioContext.currentTime + 1);
    filter.frequency.exponentialRampToValueAtTime(cutoffFreq, audioContext.currentTime + 2);
    
    setTimeout(() => {
        currentOscillator = null;
        currentGain = null;
    }, 2000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Show the welcome overlay by default
    const overlay = document.getElementById('main-page-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close mobile nav
    if (e.key === 'Escape') {
        closeMobileNav();
    }
    
    // Number keys for quick navigation
    const sectionMap = {
        '1': 'sound',
        '2': 'heart', 
        '3': 'components',
        '4': 'hands-on',
        '5': 'diy'
    };
    
    if (sectionMap[e.key]) {
        showSection(sectionMap[e.key]);
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance optimization: Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe content cards for animations
document.querySelectorAll('.content-card').forEach(card => {
    observer.observe(card);
});

// Recording functionality
function initializeKeyboardRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    const recordingTime = document.getElementById('recordingTime');
    
    if (!recordBtn) return;
    
    // Initialize button states - 2-1. 기본 상태는 녹음 활성화, 나머지 비활성화
    resetToInitialState();
    
    // Record button
    recordBtn.addEventListener('click', function() {
        if (currentRecordingState === RECORDING_STATES.IDLE || currentRecordingState === RECORDING_STATES.STOPPED_WITH_DATA) {
            startRecording();
        }
    });
    
    // Play button
    playBtn.addEventListener('click', function() {
        if (!isPlaying && recordedNotes.length > 0) {
            playRecording();
        }
    });
    
    // Stop button - 2-4, 2-6 정지 버튼 로직
    stopBtn.addEventListener('click', function() {
        if (isPlaying) {
            stopPlayback();
        } else if (currentRecordingState === RECORDING_STATES.RECORDING || currentRecordingState === RECORDING_STATES.PAUSED) {
            stopRecording();
        }
    });
    
    // Pause button - 2-5 일시정지 로직
    pauseBtn.addEventListener('click', function() {
        if (currentRecordingState === RECORDING_STATES.RECORDING) {
            pauseRecording();
        } else if (currentRecordingState === RECORDING_STATES.PAUSED) {
            resumeRecording();
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', function() {
        if (recordedBlob) {
            downloadRecording();
        }
    });
    
    // Share button
    shareBtn.addEventListener('click', function() {
        if (recordedNotes.length > 0) {
            shareRecording();
        }
    });
    
    // Enhanced piano key event listeners for recording
    const pianoKeys = document.querySelectorAll('.piano-key');
    pianoKeys.forEach(key => {
        key.addEventListener('mousedown', function(e) {
            e.preventDefault();
            const frequency = parseFloat(this.dataset.frequency);
            const note = this.dataset.note;
            
            // Record note if recording
            if (isRecording && !isPaused) {
                const timestamp = Date.now() - recordingStartTime - totalPauseDuration;
                recordedNotes.push({
                    note: note,
                    frequency: frequency,
                    timestamp: timestamp,
                    type: 'start'
                });
            }
            
            playNote(frequency);
            this.classList.add('active');
        });
        
        key.addEventListener('mouseup', function(e) {
            e.preventDefault();
            const note = this.dataset.note;
            
            // Record note end if recording
            if (isRecording && !isPaused) {
                const timestamp = Date.now() - recordingStartTime - totalPauseDuration;
                recordedNotes.push({
                    note: note,
                    timestamp: timestamp,
                    type: 'end'
                });
            }
            
            stopNote();
            this.classList.remove('active');
        });
        
        key.addEventListener('mouseleave', function() {
            this.classList.remove('active');
            if (!isRecording) {
                stopNote();
            }
        });
    });
}

// Reset to initial state - 2-1. 기본 상태는 녹음 활성화, 나머지 비활성화
function resetToInitialState() {
    currentRecordingState = RECORDING_STATES.IDLE;
    isRecording = false;
    isPlaying = false;
    isPaused = false;
    
    const recordBtn = document.getElementById('recordBtn');
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    // Enable only record button
    if (recordBtn) {
        recordBtn.disabled = false;
        recordBtn.classList.remove('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
        recordBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'text-white');
        recordBtn.querySelector('#recordText').textContent = '녹음';
    }
    
    // Disable all other buttons
    [playBtn, stopBtn, pauseBtn, downloadBtn, shareBtn].forEach(btn => {
        if (btn) {
            btn.disabled = true;
            btn.classList.remove('bg-green-600', 'bg-red-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-600');
            btn.classList.remove('hover:bg-green-700', 'hover:bg-red-700', 'hover:bg-blue-700', 'hover:bg-purple-700', 'hover:bg-orange-700');
            btn.classList.remove('text-white', 'playback-ready', 'btn-enabled');
            btn.classList.add('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
        }
    });
}

function startRecording() {
    if (!audioContext) {
        initializeAudio();
    }
    
    // 2-4. 새로운 녹음 시작시 기존 데이터 삭제
    if (currentRecordingState === RECORDING_STATES.STOPPED_WITH_DATA) {
        recordedNotes = [];
        recordedBlob = null;
    }
    
    isRecording = true;
    isPaused = false;
    currentRecordingState = RECORDING_STATES.RECORDING;
    recordingStartTime = Date.now();
    totalPauseDuration = 0;
    
    // Setup media recorder for audio capture
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream, { 
                mimeType: 'audio/webm;codecs=opus'
            });
            const audioChunks = [];
            
            mediaRecorder.ondataavailable = function(event) {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = function() {
                if (audioChunks.length > 0) {
                    recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
                }
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start(100); // Record in 100ms chunks
        })
        .catch(err => {
            console.warn('Could not capture audio:', err);
            // Continue with MIDI-style recording even without audio capture
        });
    
    // 2-2, 2-3. UI 업데이트 - 녹음 버튼 깜빡임, 나머지 비활성화
    updateRecordingUI();
    
    // Start timer
    let seconds = 0;
    recordingTimer = setInterval(() => {
        if (!isPaused) {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const timeDisplay = document.getElementById('recordingTime');
            if (timeDisplay) {
                timeDisplay.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
        }
        
        // Auto-stop at 60 seconds
        if (seconds >= 60) {
            stopRecording();
        }
    }, 1000);
}

// Update UI during recording - 2-2, 2-3
function updateRecordingUI() {
    const recordBtn = document.getElementById('recordBtn');
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    
    // 녹음 버튼 비활성화 및 깜빡임 효과
    if (recordBtn) {
        recordBtn.disabled = true;
        recordBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        recordBtn.classList.add('bg-red-800', 'recording-indicator', 'bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
        const recordText = recordBtn.querySelector('#recordText');
        if (recordText) {
            recordText.textContent = 'REC';
            recordText.classList.add('recording-text');
        }
    }
    
    // 정지, 일시정지 버튼만 활성화
    if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.classList.remove('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
        stopBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'text-white', 'btn-enabled');
    }
    
    if (pauseBtn) {
        pauseBtn.disabled = false;
        pauseBtn.classList.remove('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
        pauseBtn.classList.add('bg-orange-600', 'hover:bg-orange-700', 'text-white', 'btn-enabled');
    }
    
    // 나머지 버튼들 비활성화
    [playBtn, downloadBtn, shareBtn].forEach(btn => {
        if (btn) {
            btn.disabled = true;
            btn.classList.remove('bg-green-600', 'bg-blue-600', 'bg-purple-600');
            btn.classList.remove('hover:bg-green-700', 'hover:bg-blue-700', 'hover:bg-purple-700');
            btn.classList.remove('text-white', 'playback-ready', 'btn-enabled');
            btn.classList.add('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
        }
    });
    
    // 녹음 상태 표시
    if (recordingStatus) {
        recordingStatus.classList.remove('hidden');
    }
}

// Pause recording - 2-5
function pauseRecording() {
    isPaused = true;
    pauseStartTime = Date.now();
    currentRecordingState = RECORDING_STATES.PAUSED;
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
    }
    
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.classList.add('recording-indicator'); // 일시정지 버튼 깜빡임
    }
}

// Resume recording - 2-5
function resumeRecording() {
    if (isPaused && pauseStartTime) {
        totalPauseDuration += Date.now() - pauseStartTime;
        isPaused = false;
        pauseStartTime = null;
        currentRecordingState = RECORDING_STATES.RECORDING;
        
        if (mediaRecorder && mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
        }
        
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.classList.remove('recording-indicator'); // 깜빡임 중지
        }
    }
}

// Enhanced audio context setup for better recording
function createAudioRecorder() {
    if (!audioContext) {
        initializeAudio();
    }
    
    // Create a destination for recording system audio
    const dest = audioContext.createMediaStreamDestination();
    
    // Connect current audio output to the destination
    if (currentGain) {
        currentGain.connect(dest);
    }
    
    return dest.stream;
}

// Stop recording - 2-4, 2-6, 2-7
function stopRecording() {
    isRecording = false;
    isPaused = false;
    currentRecordingState = RECORDING_STATES.STOPPED_WITH_DATA;
    
    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
        mediaRecorder.stop();
    }
    
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    
    // Reset pause-related variables
    pauseStartTime = null;
    
    // Update UI - 2-7. 정지버튼을 눌러 녹음이 정지되는 경우, 녹음, 재생, 다운로드, 공유 버튼이 활성화
    const recordBtn = document.getElementById('recordBtn');
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    
    // 녹음 버튼 복원
    if (recordBtn) {
        recordBtn.disabled = false;
        recordBtn.classList.remove('bg-red-800', 'bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50', 'recording-indicator');
        recordBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'text-white');
        const recordText = recordBtn.querySelector('#recordText');
        if (recordText) {
            recordText.textContent = '녹음';
            recordText.classList.remove('recording-text');
        }
    }
    
    // 정지, 일시정지 버튼 비활성화
    [stopBtn, pauseBtn].forEach(btn => {
        if (btn) {
            btn.disabled = true;
            btn.classList.remove('bg-red-600', 'bg-orange-600', 'hover:bg-red-700', 'hover:bg-orange-700', 'text-white', 'btn-enabled', 'recording-indicator');
            btn.classList.add('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
        }
    });
    
    // 녹음 상태 숨김
    if (recordingStatus) {
        recordingStatus.classList.add('hidden');
    }
    
    // Enable playback controls if we have recorded notes
    if (recordedNotes.length > 0) {
        // Enable and style play button
        if (playBtn) {
            playBtn.disabled = false;
            playBtn.classList.remove('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
            playBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white', 'playback-ready', 'btn-enabled');
        }
        
        // Enable and style share button
        if (shareBtn) {
            shareBtn.disabled = false;
            shareBtn.classList.remove('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
            shareBtn.classList.add('bg-purple-600', 'hover:bg-purple-700', 'text-white', 'btn-enabled');
        }
        
        // Enable download button (even without audio blob for MIDI-style download)
        if (downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
            downloadBtn.classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'btn-enabled');
        }
    }
}

function playRecording() {
    if (recordedNotes.length === 0) return;
    
    isPlaying = true;
    playbackStartTime = Date.now();
    
    // Update UI
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    playBtn.disabled = true;
    playBtn.classList.remove('playback-ready');
    playBtn.classList.add('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
    playBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'text-white', 'btn-enabled');
    
    stopBtn.disabled = false;
    stopBtn.classList.remove('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
    stopBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'text-white', 'btn-enabled');
    
    // Schedule all note events
    recordedNotes.forEach(noteEvent => {
        setTimeout(() => {
            if (!isPlaying) return; // Check if playback was stopped
            
            const key = document.querySelector(`[data-note="${noteEvent.note}"]`);
            if (key) {
                if (noteEvent.type === 'start') {
                    playNote(noteEvent.frequency);
                    key.classList.add('active');
                } else if (noteEvent.type === 'end') {
                    stopNote();
                    key.classList.remove('active');
                }
            }
        }, noteEvent.timestamp);
    });
    
    // Auto-stop after recording duration
    const maxTimestamp = Math.max(...recordedNotes.map(n => n.timestamp));
    setTimeout(() => {
        if (isPlaying) {
            stopPlayback();
        }
    }, maxTimestamp + 1000);
}

function stopPlayback() {
    isPlaying = false;
    
    // Stop any playing notes
    stopNote();
    
    // Remove active states from all keys
    document.querySelectorAll('.piano-key').forEach(key => {
        key.classList.remove('active');
    });
    
    // Update UI
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    playBtn.disabled = false;
    playBtn.classList.remove('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
    playBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white', 'playback-ready', 'btn-enabled');
    
    stopBtn.disabled = true;
    stopBtn.classList.remove('bg-red-600', 'hover:bg-red-700', 'text-white', 'btn-enabled');
    stopBtn.classList.add('bg-gray-400', 'text-gray-600', 'cursor-not-allowed', 'opacity-50');
}

function downloadRecording() {
    if (recordedNotes.length === 0) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    if (recordedBlob) {
        // Download audio file if available
        const url = URL.createObjectURL(recordedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `synthesizer-recording-${timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        // Create simplified note sequence for download
        const noteSequence = recordedNotes.map(note => ({
            note: note.note,
            frequency: note.frequency,
            time: note.timestamp / 1000, // Convert to seconds
            type: note.type,
            duration: note.type === 'start' ? 0.5 : 0 // Default duration for start events
        }));
        
        const recordingData = {
            title: 'DIY 신디사이저 녹음',
            created: new Date().toISOString(),
            totalDuration: Math.max(...recordedNotes.map(n => n.timestamp)) / 1000,
            noteCount: recordedNotes.filter(n => n.type === 'start').length,
            sequence: noteSequence
        };
        
        const jsonString = JSON.stringify(recordingData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `synthesizer-sequence-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

function shareRecording() {
    const noteSequence = recordedNotes
        .filter(n => n.type === 'start')
        .map(n => `${n.note}@${Math.round(n.timestamp/100)}`)
        .join(',');
    
    const shareText = `DIY 아날로그 신디사이저로 연주해봤어요! 🎹\n\n연주 시퀀스: ${noteSequence.slice(0, 100)}${noteSequence.length > 100 ? '...' : ''}\n\n#신디사이저 #전자음악 #DIY`;
    
    if (navigator.share) {
        navigator.share({
            title: 'DIY 신디사이저 연주',
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('연주 정보가 클립보드에 복사되었습니다! SNS에 붙여넣기 하세요.');
        }).catch(() => {
            // Final fallback: show in alert
            prompt('아래 텍스트를 복사해서 SNS에 공유하세요:', shareText);
        });
    }
}
