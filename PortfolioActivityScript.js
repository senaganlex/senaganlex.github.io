function toggleMenu() {
    var dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('active');
}

function showHome() {
    hideAllSections();
    document.getElementById('homeSection').style.display = 'block';
}

function showMyInfo() {
    hideAllSections();
    document.getElementById('myInfoSection').style.display = 'block';
}

function showTestCodes() {
    hideAllSections();
    document.getElementById('testCodesSection').style.display = 'block';
}

function showAboutUs() {
    hideAllSections();
    document.getElementById('aboutUsSection').style.display = 'block';
}

function hideAllSections() {
    var sections = document.querySelectorAll('.welcome-section');
    sections.forEach(function (section) {
        section.style.display = 'none';
    });
}
