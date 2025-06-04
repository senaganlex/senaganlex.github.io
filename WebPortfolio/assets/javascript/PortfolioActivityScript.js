const mainContent = document.getElementById('mainContent');
const sectionContentMap = {
    'welcome': `
        <section class="section-content fadeIn">
            <h1 class="big-text">Hi, I'm Lex Mariun Señagan</h1>
            <h1 class="welcome-text">Welcome to my portfolio!</h1>
            <p class="text-box">I like to code for fun and enjoy working on diverse projects. My goal is to create impactful and inventive solutions through programming. Explore my projects to learn more about my skills and experiences.</p>
        </section>
    `,
    'about-me': `
        <section class="section-content fadeIn">
            <h2>About Me</h2>
            <p class="text-box">I find joy in coding recreationally and relish the opportunity to engage with diverse projects. My objective is to craft impactful and original solutions through programming. Dive into my projects to gain insights into my skills and journey.</p>
            <h2>Additional Context</h2>
            <p class="text-box">As a developer, I value ongoing learning and keeping abreast of the most recent technological advancements. I find satisfaction in working collaboratively with others and am receptive to new possibilities. Please don't hesitate to contact me for inquiries or to initiate discussions about potential projects or collaborative ventures.</p>
            <section class="social-icons">
                <a href="https://www.facebook.com/lexmariun.senagan.5" target="_blank">
                    <img src="assets/image/facebook-logo-png-transparent-background.png" alt="Facebook Icon">
                </a>
                <a href="https://github.com/senaganlex" target="_blank">
                    <img src="assets/image/png-transparent-github-square-brands-icon.png" alt="GitHub Icon">
                </a>
                <a href="https://mail.google.com/mail/u/0/#inbox" target="_blank">
                    <img src="assets/image/5968534.png" alt="Gmail Icon">
                </a>
            </section>
        </section>
    `,
    'my-info': `
        <section class="section-content fadeIn">
            <header>
                <h1>Lex Mariun Señagan</h1>
                <img src="assets/image/428247203_1061771555126453_8630503332247291442_n.jpg" alt="Profile Image">
            </header>
            <h2>Objective</h2>
            <p class="text-box">To seek a challenging, growth-oriented position where I can leverage my skills and experience to contribute meaningfully to an organization's achievements.</p>
            <h2>Education</h2>
            <ul class="text-box">
                <li><strong>Lapu-Lapu City Central Elementary School</strong></li>
                <li><strong>University of the Visayas - Pardo Campus</strong></li>
                <li><strong>Asian College of Technology - Bulacao Campus</strong></li>
                <li><strong>CITE Technical Institute, Inc.</strong></li>
                <li>Purok 2, San Jose, Cebu City<br>Diploma in Computer Engineering Technology (Undergraduate)</li>
            </ul>
            <h2>Skills</h2>
            <ul class="text-box">
                <li>Programming Languages: C, C#, C++, Java</li>
                <li>Web Development: HTML, CSS, JavaScript</li>
            </ul>
        </section>
    `,
    'my-test-code': `
        <section class="section-content fadeIn">
            <h2>My Test Code</h2>
            <p class="text-box">These are the websites I've worked on. If you have any suggestions or ideas for collaboration, don't hesitate to reach out. I'm always open to new coding challenges!</p>
            <section id="projectLinks" class="fadeIn">
                <a href="https://senaganlex.github.io/Birthday%20Invitation%20Card/index.html" target="_blank" class="button">Birthday Invitation Card</a>
                <a href="https://senaganlex.github.io/Projects/CalendarSenagan.html" target="_blank" class="button">Calendar Project</a>
                <p class="textBox"><strong>These are some images of my OJT</strong></p>
                <section class="project-images fadeIn">
                    <img src="assets/image/IMG_20240229_164118.jpg" alt="Project Image 1" class="project-image">
                    <img src="assets/image/IMG_20240301_174625.jpg" alt="Project Image 2" class="project-image">
                    <img src="assets/image/IMG_20240301_175036.jpg" alt="Project Image 3" class="project-image">
                </section>
            </section>
        </section>
    `,
};

document.querySelector('.buttons-container').addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const section = event.target.dataset.section;
        loadContent(section);
    }
});

function loadContent(section) {
    const content = sectionContentMap[section];
    if (content) {
        mainContent.innerHTML = content;
    } else {
        console.error(`Section "${section}" not found.`);
    }
}
