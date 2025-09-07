     // Variables globales
        let timerInterval;
        let pomodoroInterval;
        let isTimerRunning = false;
        let isPomodoroRunning = false;
        let currentTimerTime = 0;
        let currentPomodoroTime = 25 * 60;
        let completedPomodoros = 0;
        let isWorkSession = true;
        let totalStudyTime = 0;
        let currentPage = 'dashboard';

        // Navegación
        function showPage(pageId) {
            // Ocultar todas las páginas
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Mostrar la página seleccionada
            document.getElementById(pageId).classList.add('active');
            
            // Actualizar botones de navegación
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            currentPage = pageId;
            updateDashboard();
        }

        // Actualizar dashboard
        function updateDashboard() {
            if (currentPage === 'dashboard') {
                const now = new Date();
                const timeString = now.toLocaleTimeString('es-ES', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                document.getElementById('dashboardClock').textContent = timeString;
                document.getElementById('dashboardPomodoros').textContent = completedPomodoros;
                
                const hours = Math.floor(totalStudyTime / 3600);
                const minutes = Math.floor((totalStudyTime % 3600) / 60);
                document.getElementById('dashboardTime').textContent = `${hours}h ${minutes}m`;
                
                document.getElementById('dashboardMusic').textContent = 
                    document.getElementById('musicPlayer').style.display === 'block' ? 'Playing' : 'Stopped';
            }
        }

        // Actualizar reloj digital
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('es-ES', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            document.getElementById('digitalClock').textContent = timeString;
            document.getElementById('currentDate').textContent = dateString;
            
            updateDashboard();
        }

        // Formatear tiempo
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // Timer personalizado
        function startTimer() {
            if (!isTimerRunning) {
                const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
                const seconds = parseInt(document.getElementById('secondsInput').value) || 0;
                
                if (currentTimerTime === 0) {
                    currentTimerTime = minutes * 60 + seconds;
                }
                
                if (currentTimerTime > 0) {
                    isTimerRunning = true;
                    timerInterval = setInterval(() => {
                        currentTimerTime--;
                        totalStudyTime++;
                        document.getElementById('timerDisplay').textContent = formatTime(currentTimerTime);
                        
                        if (currentTimerTime <= 0) {
                            clearInterval(timerInterval);
                            isTimerRunning = false;
                            showNotification('⏰ ¡Timer finalizado! Gran trabajo.');
                            playNotificationSound();
                        }
                    }, 1000);
                }
            }
        }

        function pauseTimer() {
            if (isTimerRunning) {
                clearInterval(timerInterval);
                isTimerRunning = false;
            }
        }

        function resetTimer() {
            clearInterval(timerInterval);
            isTimerRunning = false;
            currentTimerTime = 0;
            document.getElementById('timerDisplay').textContent = '00:00';
        }

        // Pomodoro
        function startPomodoro() {
            if (!isPomodoroRunning) {
                isPomodoroRunning = true;
                pomodoroInterval = setInterval(() => {
                    currentPomodoroTime--;
                    if (isWorkSession) {
                        totalStudyTime++;
                    }
                    document.getElementById('pomodoroDisplay').textContent = formatTime(currentPomodoroTime);
                    
                    if (currentPomodoroTime <= 0) {
                        clearInterval(pomodoroInterval);
                        isPomodoroRunning = false;
                        
                        if (isWorkSession) {
                            completedPomodoros++;
                            document.getElementById('completedPomodoros').textContent = completedPomodoros;
                            
                            isWorkSession = false;
                            currentPomodoroTime = completedPomodoros % 4 === 0 ? 15 * 60 : 5 * 60;
                            document.getElementById('currentSession').textContent = 'Descanso';
                            showNotification('🎉 ¡Pomodoro completado! Hora del descanso.');
                        } else {
                            isWorkSession = true;
                            currentPomodoroTime = 25 * 60;
                            document.getElementById('currentSession').textContent = 'Trabajo';
                            showNotification('💼 ¡Descanso terminado! De vuelta al trabajo.');
                        }
                        
                        playNotificationSound();
                        document.getElementById('pomodoroDisplay').textContent = formatTime(currentPomodoroTime);
                    }
                }, 1000);
            }
        }

        function pausePomodoro() {
            if (isPomodoroRunning) {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
            }
        }

        function resetPomodoro() {
            clearInterval(pomodoroInterval);
            isPomodoroRunning = false;
            isWorkSession = true;
            currentPomodoroTime = 25 * 60;
            document.getElementById('pomodoroDisplay').textContent = '25:00';
            document.getElementById('currentSession').textContent = 'Trabajo';
        }

        // Música
        function loadMusic() {
            const url = document.getElementById('musicUrl').value;
            if (url) {
                let videoId = extractVideoId(url);
                if (videoId) {
                    createMusicPlayer(videoId);
                    showNotification('🎵 Música cargada correctamente');
                } else {
                    showNotification('❌ URL no válida. Intenta con otro enlace.');
                }
            }
        }

        function extractVideoId(url) {
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|music\.youtube\.com\/watch\?v=)([^&\n?#]+)/
            ];
            
            for (let pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        }

        function createMusicPlayer(videoId) {
            const musicPlayer = document.getElementById('musicPlayer');
            musicPlayer.innerHTML = `
                <div class="music-title">🎵 Reproduciendo música para concentración</div>
                <iframe width="100%" height="200" 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}" 
                        frameborder="0" allowfullscreen style="border-radius: 10px; margin: 20px 0;">
                </iframe>
                <div class="volume-control">
                    <span style="font-size: 1.2rem;">🔊</span>
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="70">
                    <span id="volumeValue">70%</span>
                </div>
            `;
            musicPlayer.style.display = 'block';
            
            const volumeSlider = document.getElementById('volumeSlider');
            const volumeValue = document.getElementById('volumeValue');
            
            volumeSlider.addEventListener('input', function() {
                volumeValue.textContent = this.value + '%';
            });
        }

        function toggleMusic() {
            showNotification('🎵 Usa los controles del reproductor para pausar/reproducir');
        }

        function playRecommended(type) {
            const recommendations = {
                'lofi': 'jfKfPfyJRdk',
                'nature': '36YnV9STBqc', 
                'classical': 'jgpJVI3tDbY',
                'ambient': 'DWcJFNfaw9c'
            };
            
            const names = {
                'lofi': 'Lo-Fi Hip Hop',
                'nature': 'Sonidos de Naturaleza',
                'classical': 'Música Clásica',
                'ambient': 'Música Ambient'
            };
            
            const videoId = recommendations[type];
            if (videoId) {
                createMusicPlayer(videoId);
                showNotification(`🎵 Reproduciendo ${names[type]}`);
            }
        }

        // Notificaciones
        function showNotification(message) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 4000);
        }

        function playNotificationSound() {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }

        // Inicialización
        function init() {
            updateClock();
            setInterval(updateClock, 1000);
            updateDashboard();
        }

        document.addEventListener('DOMContentLoaded', init);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
            }
        });