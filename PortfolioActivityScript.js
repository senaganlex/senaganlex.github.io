function toggleMenu() {
    var dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('active');
}

window.onclick = function (event) {
    if (!event.target.matches('.menu-icon')) {
        var dropdownMenu = document.getElementById('dropdownMenu');
        if (dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
        }
    }
};

function toggleAboutUs() {
    var aboutUsSection = document.getElementById('aboutUsSection');
    aboutUsSection.classList.toggle('active');
}

function goBackToPortfolio() {
    window.location.href = 'file:///D:/0-VISUAL%20STUDIO%20CODE/PortfolioActivitySe%C3%B1agan.html#';
}
