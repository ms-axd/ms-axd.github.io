(function () {
  const profilePhoto = document.querySelector('[data-profile-tilt]');

  if (!profilePhoto) {
    return;
  }

  const resetTilt = () => {
    profilePhoto.classList.remove('is-tilting');
    profilePhoto.style.transform = 'perspective(450px) rotateX(0deg) rotateY(0deg)';
  };

  profilePhoto.addEventListener('mousemove', (event) => {
    const rect = profilePhoto.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 22;
    const rotateX = ((centerY - y) / centerY) * 22;

    profilePhoto.classList.add('is-tilting');
    profilePhoto.style.transform = `perspective(450px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    profilePhoto.style.setProperty('--shine-x', `${(x / rect.width) * 100}%`);
    profilePhoto.style.setProperty('--shine-y', `${(y / rect.height) * 100}%`);
  });

  profilePhoto.addEventListener('mouseleave', resetTilt);
  profilePhoto.addEventListener('blur', resetTilt, true);
})();
