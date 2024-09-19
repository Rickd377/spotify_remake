const audios = {
    'starboy': new Audio('/images-assets/audio/starboy.mp3'),
    'west-coast': new Audio('/images-assets/audio/west-coast.mp3'),
    'take-my-breath': new Audio('/images-assets/audio/take-my-breath.mp3'),
    'i-see-red': new Audio('/images-assets/audio/i-see-red.mp3'),
    'ocean-eyes': new Audio('/images-assets/audio/ocean-eyes.mp3'),
    'shameless': new Audio('/images-assets/audio/shameless.mp3')
};

document.addEventListener('DOMContentLoaded', () => {
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

    const togglePage = (targetPage) => {
        document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
        document.getElementById(targetPage).style.display = 'block';
        document.body.className = targetPage === 'home' ? '' : `${targetPage}-background`;
        document.querySelector('header').classList.toggle('hidden-header', targetPage !== 'home');
        document.querySelector('.home-link').classList.toggle('hidden', targetPage === 'home');
        const albumCover = document.querySelector(`#${targetPage} .album-cover`);
        if (albumCover) albumCover.style.backgroundImage = getComputedStyle(document.body).backgroundImage;

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

    window.changeIcon = (element, song) => {
        element.classList.toggle('fa-play');
        element.classList.toggle('fa-pause');
        const audio = audios[song];
        element.classList.contains('fa-pause') ? (audio.play(), startAnimation(song)) : (audio.pause(), stopAnimation(song));
    };

    window.switchColor = (element) => element.classList.toggle('icon-switch-green');

    document.querySelectorAll('.song, .forward-link').forEach(link => 
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.currentTarget.getAttribute('data-target');
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
    });

    const currentPage = sessionStorage.getItem('currentPage') || 'home';
    togglePage(currentPage);
});