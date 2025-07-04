function loadContent(section) {
    const sectionContentMap = {
        'welcome': `
            <section class="welcome-section" id="welcomeSection">
                <div class="big-text-section fadeIn">
                    <h1>Hi, I'm Lex Mariun Señagan</h1>
                </div>
                <div class="welcome-text fadeIn">
                    <h1>Welcome to my portfolio!</h1>
                    <p class="text-box">I like to code for fun and enjoy working on diverse projects. My goal is to create impactful and inventive solutions through programming. Explore my projects to learn more about my skills and experiences.</p>
                </div>
            </section>
        `,
        'about-me': `
            <section class="about-me fadeIn" id="aboutMeSection">
                <h2>About Me</h2>
                <p class="text-box">Welcome to my portfolio! I like to code for fun and enjoy working on diverse projects. My goal is to create impactful and inventive solutions through programming. Explore my projects to learn more about my skills and experiences.</p>
                <h2>Additional Context</h2>
                <p class="text-box">As a developer, I value ongoing learning and keeping abreast of the most recent technological advancements. I find satisfaction in working collaboratively with others and am receptive to new possibilities. Please don't hesitate to contact me for inquiries or to initiate discussions about potential projects or collaborative ventures.</p>
                <div class="social-icons">
                    <a href="https://www.facebook.com/lexmariun.senagan.5" target="_blank">
                        <img src="assets/image/facebook-logo-png-transparent-background.png" alt="Facebook Icon" class="social-icon">
                    </a>
                    <a href="https://github.com/senaganlex" target="_blank">
                        <img src="assets/image/png-transparent-github-square-brands-icon.png" alt="GitHub Icon" class="social-icon">
                    </a>
                    <a href="https://mail.google.com/mail/u/0/#inbox" target="_blank">
                        <img src="assets/image/5968534.png" alt="Gmail Icon" class="social-icon">
                    </a>
                </div>
            </section>
        `,
        'my-info': `
            <section class="my-info-section fadeIn">
                <header>
                    <div class="profile-info">
                        <h1>Lex Mariun Señagan</h1>
                    </div>
                    <div class="profile-image">
                        <img src="assets/image/428247203_1061771555126453_8630503332247291442_n.jpg" alt="Profile Image" id="profileImg">
                    </div>
                </header>
                <section class="info-details">
                    <h2>Objective</h2>
                    <p class="text-box">To seek a challenging, growth-oriented position where I can leverage my skills and experience to contribute meaningfully to an organization's achievements.</p>
                    <h2>Education</h2>
                    <ul class="text-box">
                        <li>Lapu-Lapu City Central Elementary School</li>
                        <li>University of the Visayas - Pardo Campus</li>
                        <li>Asian College of Technology - Bulacao Campus</li>
                        <li>CITE Technical Institute, Inc.</li>
                        <li>Purok 2, San Jose, Cebu City <br> Diploma in Computer Engineering Technology (Undergraduate)</li>
                    </ul>
                    <h2>Skills</h2>
                    <ul class="text-box">
                        <li>Programming Languages: C, C#, C++, Java</li>
                        <li>Web Development: HTML, CSS, JavaScript</li>
                    </ul>
                                    </section>
            </section>
        `,
        'my-test-code': `
            <section class="my-test-code-section">
                <div class="overlay-content fadeIn">
                    <h2>My Test Codes Section Content</h2>
                    <div class="text-box">
                        <p>
                            This are the websites I've worked on.
                            If you have any suggestions or ideas for collaboration, don't hesitate to reach out. I'm always open to new coding challenges!
                        </p>
                        <div id="projectLinks" class="fadeIn">
                            <a href="https://senaganlex.github.io/Birthday%20Invitation%20Card/index.html" target="_blank" class="button">Birthday Invitation Card</a>
                            <a href="https://senaganlex.github.io/Projects/CalendarSenagan.html" target="_blank" class="button">Calendar Project</a>
                            <br>
                            <p class="textBox">
                                <strong>These are some images of my OJT</strong>
                            </p>
                        </div>
                        <div class="project-images fadeIn">
                            <img src="assets/image/IMG_20240229_164118.jpg" alt="Project Image 1" class="project-image">
                            <img src="assets/image/IMG_20240301_174625.jpg" alt="Project Image 2" class="project-image">
                            <img src="assets/image/IMG_20240301_175036.jpg" alt="Project Image 3" class="project-image">
                        </div>
                    </div>
                </div>
            </section>
        `,
    };

    const content = sectionContentMap[section];

    if (content) {
        document.getElementById('mainContent').innerHTML = content;
        // Add this line to apply the CSS after the image is added to the DOM
        const profileImg = document.getElementById('profileImg');
        if (profileImg) {
            profileImg.classList.add('profile-image');
        }

    } else {
        console.error('Section not found:', section);
    }
}

function uploadFiles() {
    //This function is not used in your current HTML, but is included for completeness.
    const fileList = document.getElementById('fileList');
    const fileInput = document.getElementById('fileInput');

    fileList.innerHTML = '';

    for (const file of fileInput.files) {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        fileList.appendChild(listItem);
    }
}
