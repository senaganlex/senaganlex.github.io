function loadContent(section) {
    const sectionContentMap = {
        'welcome': `
            <section class="welcome-section" id="welcomeSection">
                <div class="big-text-section">
                    <h1>Hi, I'm Lex Mariun Señagan</h1>
                </div>
                <div class="welcome-text">
                    <h1>Welcome to my portfolio!</h1>
                    <p class="text-box">I like to code for fun and enjoy working on diverse projects. My goal is to create impactful and inventive solutions through programming. Explore my projects to learn more about my skills and experiences.</p>
                </div>
            </section>
        `,
        'about-us': `
            <section class="about-us" id="aboutUsSection">
                <h2>About Us</h2>
                <p class="text-box">Welcome to my portfolio! I like to code for fun and enjoy working on diverse projects. My goal is to create impactful and inventive solutions through programming. Explore my projects to learn more about my skills and experiences.</p>
                <h2>Additional Context</h2>
                <p class="text-box">As a developer, I value ongoing learning and keeping abreast of the most recent technological advancements. I find satisfaction in working collaboratively with others and am receptive to new possibilities. Please don't hesitate to contact me for inquiries or to initiate discussions about potential projects or collaborative ventures.</p>
            </section>
        `,
        'my-info': `
            <section class="my-info-section">
                <header>
                    <div class="profile-info">
                        <h1>Lex Mariun Señagan</h1>
                    </div>
                    <div class="profile-image">
                        <img src="https://scontent.fceb1-3.fna.fbcdn.net/v/t1.15752-9/354375884_794071165757492_6125090157431484842_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=8cd0a2&_nc_eui2=AeG7X_aCkNSAnaFzw1w7w0Zf9RLlPmx4Olz1EuU-bHg6XPBmZAJ8RmL41iY1cDNzhHheURymOpMytWfLuSUfKW6t&_nc_ohc=PWue9rHGDqsAX9SZZC2&_nc_oc=AQmk3ktrsFnDvItNjFdb3t831LlgiZ-vieQnsqBjaMWEQIyuO2zy_NXE29MjZUM4-hY&_nc_ht=scontent.fceb1-3.fna&oh=03_AdTSkw-KJ2IdWM20GIA4Bx3zopAaEGMGFhhiAhWMbQwfeg&oe=65D82622" alt="Profile Image" width="100" height="100">
                    </div>
                </header>
                <section class="info-details">
                    <h2>Objective</h2>
                    <p class="text-box">To seek a challenging, growth-oriented position where I can leverage my skills and experience to contribute meaningfully to an organization's achievements.</p>
                    <h2>Education</h2>
                    <ul class="text-box">
                        <li><strong>Lapu-Lapu City Central Elementary School</strong></li>
                        <li><strong>University of the Visayas - Pardo Campus</strong></li>
                        <li><strong>Asian College of Technology - Bulacao Campus</strong></li>
                        <li><strong>CITE Technical Institute, Inc.</strong></li>
                        <li class="text-box"> Purok 2, San Jose, Cebu City <br> Diploma in Computer Engineering Technology (Undergraduate)</li>
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
                <div class="overlay-content">
                    <h2>My Test Codes Section Content</h2>
                    <p class="text-box">
                        In this section, you can explore some of the test codes I've worked on. Feel free to take a look and see the variety of projects I've experimented with. 
                        If you have any suggestions or ideas for collaboration, don't hesitate to reach out. I'm always open to new coding challenges!
                    </p>
                    <div id="fileUploadContainer">
                        <label for="fileInput" id="uploadLabel">
                            <span>Choose File</span>
                            <input type="file" id="fileInput" accept=".txt, .pdf, .docx" multiple>
                        </label>
                        <button id="uploadButton" onclick="uploadFiles()">Upload Files</button>
                    </div>
                    <ul id="fileList">
                        <!-- File list content goes here -->
                    </ul>
                </div>
            </section>
        `,
    };

    const content = sectionContentMap[section];

    if (content) {
        document.getElementById('mainContent').innerHTML = content;
    } else {
        console.error('Section not found:', section);
    }
}

function uploadFiles() {
    const fileList = document.getElementById('fileList');
    const fileInput = document.getElementById('fileInput');

    fileList.innerHTML = '';

    for (const file of fileInput.files) {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        fileList.appendChild(listItem);
    }
}
