document.addEventListener('DOMContentLoaded', () => {
    const togglePage = (targetPage) => {
        document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
        document.getElementById(targetPage).style.display = 'block';
        document.body.className = targetPage === 'home' ? '' : `${targetPage}-background`;
        document.querySelector('header').classList.toggle('hidden-header', targetPage !== 'home');
        document.querySelector('.home-link').classList.toggle('hidden', targetPage === 'home');

        const albumCover = document.querySelector(`#${targetPage} .album-cover`);
        if (albumCover) {
            albumCover.style.backgroundImage = getComputedStyle(document.body).backgroundImage;
        }
    };

    window.changeIcon = (element) => {
        element.classList.toggle('fa-play');
        element.classList.toggle('fa-pause');
    };

    window.switchColor = (element) => {
        element.classList.toggle('icon-switch-green');
    };

    document.querySelectorAll('.song, .forward-link').forEach(link => 
        link.addEventListener('click', (e) => {
            e.preventDefault();
            togglePage(e.currentTarget.getAttribute('data-target'));
        })
    );

    document.querySelector('.home-link').addEventListener('click', (e) => {
        e.preventDefault();
        togglePage('home');
    });

    togglePage('home');
});