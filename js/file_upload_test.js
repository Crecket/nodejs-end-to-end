//     <input type="file" id="fileinput"/>
//     <input type='button' id='btnLoad' value='Load' onclick='handleFileSelect();'>
//     <br><br>
//     <a download id="dataurltest">link</a>
//     <br><br>
//     <div id="editor" style="word-break: break-all"></div>

function handleFileSelect()
{
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = function(){
            $('#dataurltest').attr('href',fr.result);
        };
        fr.readAsDataURL(file);
    }
}
