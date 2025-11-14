// PortfolioActivityScript.js

document.addEventListener("DOMContentLoaded", () => {
    loadContent("welcome");

    const navButtons = document.querySelectorAll('button[data-section]');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            loadContent(section);

            // Active button highlighting
            navButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            // Smooth scroll to main content
            document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth' });
        });
    });
});

function loadContent(section) {
    const sectionContentMap = {
        welcome: `
            <section class="welcome-section fadeIn scaleUp">
                <div class="big-text-section">
                    <h1>Hi, I'm Lex Mariun Señagan</h1>
                </div>
                <div class="welcome-text">
                    <h1>Welcome to my portfolio!</h1>
                    <p class="text-box">
                        I like to code for fun and enjoy working on diverse projects. My goal is to create
                        impactful and inventive solutions through programming. Explore my projects to learn more
                        about my skills and experiences.
                    </p>
                </div>
            </section>
        `,

        "about-me": `
            <section class="about-me fadeIn scaleUp">
                <h2>About Me</h2>
                <p class="text-box">
                    Welcome to my portfolio! I like to code for fun and enjoy working on diverse projects. My
                    goal is to create impactful and inventive solutions through programming.
                </p>
                <h2>Additional Context</h2>
                <p class="text-box">
                    As a developer, I value ongoing learning and staying updated with technological advancements.
                    I enjoy collaborating with others and am always open to new opportunities.
                </p>
                <div class="social-icons fadeIn scaleUp">
                    <a href="https://www.facebook.com/lexmariun.senagan.5" target="_blank">
                        <img src="assets/image/facebook-logo-png-transparent-background.png" class="social-icon" />
                    </a>
                    <a href="https://github.com/senaganlex" target="_blank">
                        <img src="assets/image/png-transparent-github-square-brands-icon.png" class="social-icon" />
                    </a>
                    <a href="https://mail.google.com/mail/u/0/#inbox" target="_blank">
                        <img src="assets/image/5968534.png" class="social-icon" />
                    </a>
                </div>
            </section>
        `,

        "my-info": `
            <section class="my-info-section fadeIn scaleUp">
                <header>
                    <div class="profile-info">
                        <h1>Lex Mariun Señagan</h1>
                    </div>
                    <div class="profile-image floatUpDown">
                        <img src="assets/image/428247203_1061771555126453_8630503332247291442_n.jpg" id="profileImg" />
                    </div>
                </header>

                <section class="info-details fadeIn scaleUp">
                    <h2>Objective</h2>
                    <p class="text-box">
                        To seek a challenging, growth-oriented position where I can leverage my skills and experience.
                    </p>

                    <h2>Education</h2>
                    <ul class="text-box">
                        <li>Lapu-Lapu City Central Elementary School</li>
                        <li>University of the Visayas - Pardo Campus</li>
                        <li>Asian College of Technology - Bulacao Campus</li>
                        <li>CITE Technical Institute, Inc.</li>
                        <li>Purok 2, San Jose, Cebu City — Diploma in Computer Engineering Technology (Undergraduate)</li>
                    </ul>

                    <h2>Skills</h2>
                    <ul class="text-box">
                        <li>Programming Languages: C, C#, C++, Java</li>
                        <li>Web Development: HTML, CSS, JavaScript</li>
                    </ul>
                </section>
            </section>
        `,

        "my-test-code": `
            <section class="my-test-code-section fadeIn scaleUp">
                <div class="overlay-content">
                    <h2>My Test Codes</h2>
                    <p class="text-box">
                        These are the websites I've worked on. If you have suggestions or want to collaborate,
                        feel free to reach out!
                    </p>

                    <div id="projectLinks" class="fadeIn scaleUp">
                        <a href="https://senaganlex.github.io/Birthday%20Invitation%20Card/index.html" target="_blank" class="button">Birthday Invitation Card</a>
                        <a href="https://senaganlex.github.io/Projects/CalendarSenagan.html" target="_blank" class="button">Calendar Project</a>

                        <p class="textBox"><strong>Some images from my OJT</strong></p>
                    </div>

                    <div class="project-images fadeIn scaleUp">
                        <img src="assets/image/IMG_20240229_164118.jpg" class="project-image" />
                        <img src="assets/image/IMG_20240301_174625.jpg" class="project-image" />
                        <img src="assets/image/IMG_20240301_175036.jpg" class="project-image" />
                    </div>
                </div>
            </section>
        `,
    };

    const content = sectionContentMap[section];
    const main = document.getElementById("mainContent");

    if (content) {
        main.innerHTML = content;
    } else {
        console.error("Section not found:", section);
    }
}
