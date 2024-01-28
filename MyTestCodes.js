document.getElementById('uploadButton').addEventListener('click', function () {
    uploadFileToServer(document.getElementById('fileInput').files);
});

function uploadFileToServer(files) {
    var fileList = document.getElementById('fileList');

    for (var i = 0; i < files.length; i++) {
        var fileName = files[i].name;

        var listItem = document.createElement('li');

        var fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = fileName;

        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('deleteButton');
        deleteButton.onclick = function () {
            deleteFile(fileName);
            listItem.remove();
        };

        listItem.appendChild(fileNameSpan);
        listItem.appendChild(deleteButton);

        fileList.appendChild(listItem);
    }
}

function deleteFile(fileName) {
    alert('Deleting file: ' + fileName);
}
