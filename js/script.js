const audios = {
    'starboy': new Audio('/images-assets/audio/starboy.mp3'),
    'west-coast': new Audio('/images-assets/audio/west-coast.mp3'),
    'take-my-breath': new Audio('/images-assets/audio/take-my-breath.mp3'),
    'i-see-red': new Audio('/images-assets/audio/i-see-red.mp3'),
    'ocean-eyes': new Audio('/images-assets/audio/ocean-eyes.mp3'),
    'shameless': new Audio('/images-assets/audio/shameless.mp3'),
    'circles': new Audio('/images-assets/audio/circles.mp3')
};

document.addEventListener('DOMContentLoaded', () => {
    let lastPage = null;

    const formatTime = (time) => `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;

    const updateTimes = (song) => {
        const audio = audios[song];
        const elapsedTimeElement = document.getElementById(`elapsed-time-${song}`);
        const remainingTimeElement = document.getElementById(`remaining-time-${song}`);
        const elapsed = Math.floor(audio.currentTime);
        const remaining = Math.floor(audio.duration - elapsed);
        elapsedTimeElement.textContent = formatTime(elapsed);
        remainingTimeElement.textContent = `-${formatTime(remaining)}`;
    };

    const setProgressBar = (song, playState, elapsedPercentage = 0, remainingDuration = 230) => {
        const progressBar = document.querySelector(`.${song}-pb`);
        progressBar.style.setProperty('--elapsed-percentage', `${elapsedPercentage}%`);
        progressBar.style.setProperty('--remaining-duration', `${remainingDuration}s`);
        progressBar.style.animationPlayState = playState;
    };

    const startAnimation = (song) => {
        const audio = audios[song];
        setProgressBar(song, 'running', (audio.currentTime / audio.duration) * 100, audio.duration - audio.currentTime);
        audio.intervalId = setInterval(() => updateTimes(song), 1000);
    };

    const stopAnimation = (song) => {
        setProgressBar(song, 'paused');
        clearInterval(audios[song].intervalId);
    };

    const resetTimes = (song) => {
        const elapsedTimeElement = document.getElementById(`elapsed-time-${song}`);
        const remainingTimeElement = document.getElementById(`remaining-time-${song}`);
        elapsedTimeElement.textContent = '0:00';
        remainingTimeElement.textContent = `-${formatTime(Math.floor(audios[song].duration))}`;
    };

    const resetAudio = (song) => {
        const audio = audios[song];
        audio.pause();
        audio.currentTime = 0;
        resetTimes(song);
        setProgressBar(song, 'paused');
    };

    const pauseAllAudio = () => {
        Object.keys(audios).forEach(song => {
            const audio = audios[song];
            if (!audio.paused) {
                audio.pause();
                stopAnimation(song);
                const playIcon = document.querySelector(`#${song} .fa-pause`);
                if (playIcon) {
                    playIcon.classList.remove('fa-pause');
                    playIcon.classList.add('fa-play');
                }
            }
        });
    };

    const resetAllAudio = () => {
        Object.keys(audios).forEach(song => {
            resetAudio(song);
        });
    };

    const togglePage = (targetPage) => {
        pauseAllAudio();
        resetAllAudio();
        document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
        document.getElementById(targetPage).style.display = 'block';
        document.body.className = targetPage === 'home' ? '' : `${targetPage}-background page-centered`;
        document.querySelector('header').classList.toggle('hidden-header', targetPage !== 'home');
        document.querySelector('.home-link').classList.toggle('hidden', targetPage === 'home');
        const albumCover = document.querySelector(`#${targetPage} .album-cover`);
        if (albumCover) {
            albumCover.style.backgroundImage = getComputedStyle(document.body).backgroundImage;
        }

        // Reset times for the target page
        if (targetPage !== 'home') {
            resetTimes(targetPage);
        }
    };

    const resetIconsAndAudio = () => {
        document.querySelectorAll('.fa-pause').forEach(icon => {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        });
        Object.keys(audios).forEach(song => {
            resetAudio(song);
        });
    };

    const restartAnimation = (song) => {
        const progressBar = document.querySelector(`.${song}-pb`);
        progressBar.style.animation = 'none';
        progressBar.offsetHeight; // Trigger reflow to restart the animation
        progressBar.style.animation = '';
        startAnimation(song);
    };

    const getRandomPage = () => {
        const pages = ['starboy', 'west-coast', 'take-my-breath', 'i-see-red', 'ocean-eyes', 'shameless', 'circles'];
        let randomPage;
        do {
            randomPage = pages[Math.floor(Math.random() * pages.length)];
        } while (randomPage === lastPage);
        return randomPage;
    };

    const toggleClassOnAllElements = (selector, className) => {
        document.querySelectorAll(selector).forEach(element => {
            element.classList.toggle(className);
        });
    };

    window.changeIcon = (element, song) => {
        element.classList.toggle('fa-play');
        element.classList.toggle('fa-pause');
        const audio = audios[song];
        element.classList.contains('fa-pause') ? (audio.play(), startAnimation(song)) : (audio.pause(), stopAnimation(song));
    };

    window.switchColor = (element) => {
        const isShuffle = element.classList.contains('fa-shuffle');
        const isRepeat = element.classList.contains('fa-repeat');
        if (isShuffle) {
            toggleClassOnAllElements('.fa-shuffle', 'icon-switch-green');
        } else if (isRepeat) {
            toggleClassOnAllElements('.fa-repeat', 'icon-switch-green');
        }
    };

    document.querySelectorAll('.song, .forward-link, .backward-link').forEach(link => 
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const shuffleButton = document.querySelector('.fa-shuffle.icon-switch-green');
            let targetPage = e.currentTarget.getAttribute('data-target');
            if (shuffleButton) {
                targetPage = getRandomPage();
            }
            lastPage = targetPage;
            sessionStorage.setItem('currentPage', targetPage);
            togglePage(targetPage);
        })
    );

    document.querySelector('.home-link').addEventListener('click', (e) => {
        e.preventDefault();
        resetIconsAndAudio();
        const currentPage = 'home';
        sessionStorage.setItem('currentPage', currentPage);
        togglePage(currentPage);
    });

    Object.keys(audios).forEach(song => {
        audios[song].addEventListener('loadedmetadata', () => {
            document.getElementById(`remaining-time-${song}`).textContent = `-${formatTime(Math.floor(audios[song].duration))}`;
        });

        // Add event listener for when the audio ends
        audios[song].addEventListener('ended', () => {
            const repeatButton = document.querySelector(`#${song} .fa-repeat`);
            if (repeatButton && repeatButton.classList.contains('icon-switch-green')) {
                resetAudio(song);
                audios[song].play();
                restartAnimation(song);
            }
        });
    });

    const deviceElement = document.querySelector('.device');

    const updateDeviceText = () => {
        if (window.matchMedia('(max-width: 600px)').matches) {
            deviceElement.textContent = 'This Phone';
        } else if (window.matchMedia('(max-width: 1024px)').matches) {
            deviceElement.textContent = 'This Tablet';
        } else {
            deviceElement.textContent = 'This Computer';
        }
    };

    // Initial check
    updateDeviceText();

    // Add event listener for screen size changes
    window.addEventListener('resize', updateDeviceText);

    // Initial check
    updateDeviceText();

    // Add event listener for screen size changes
    window.addEventListener('resize', updateDeviceText);

    const currentPage = sessionStorage.getItem('currentPage') || 'home';
    togglePage(currentPage);

    // Volume control
    document.querySelectorAll('.volume input[type="range"]').forEach(volumeControl => {
        volumeControl.addEventListener('input', (e) => {
            const volume = e.target.value / 10;
            const player = e.target.closest('.player');
            const song = player.querySelector('.song-title').textContent.trim().toLowerCase().replace(/\s+/g, '-');
            if (audios[song]) {
                audios[song].volume = volume;
            }
        });
    });
});