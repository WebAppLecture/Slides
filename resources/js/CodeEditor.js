    class JsCodeEditor {

        constructor(editor, trigger, input, output) {

            let editableFunction = (new Function("return " + editor.value)()).bind(editor, input, output);

            trigger.addEventListener('click', editableFunction);
            editor.addEventListener('keydown', function (e) {
                if(e.key === "Tab") {
                    e.preventDefault();
                    let s = this.selectionStart;
                    this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
                    this.selectionEnd = s+1;
                }
            });
            editor.addEventListener('input', function () {
                console.log("input");
                trigger.removeEventListener('click', editableFunction);
                try {
                    trigger.removeEventListener('click', editableFunction);
                    editableFunction = (new Function("return " + editor.value)()).bind(editor, input, output);
                    trigger.addEventListener('click', editableFunction);
                    trigger.classList.remove('error');
                    trigger.innerText = "Run Code";
                    editor.classList.remove('error');
                    console.log('try');
                } catch (err) {
                    trigger.removeEventListener('click', editableFunction);
                    trigger.classList.add('error');
                    trigger.innerText = "Error in Code!";
                    editor.classList.add('error');
                    console.log('catch');
                }
            });
        }
    }

    JsCodeEditor.trimCode = function(source) {
        let lines = source.split("\n");
        for(let line in lines) {
            lines[line] = lines[line].trim();
        }
        let trimmedLines = lines.filter(function(line) {
            return line !== "";
        });
        for(let i = 1; i < trimmedLines.length - 1; i++) {
            trimmedLines[i] = "    " + trimmedLines[i]; 
        }
        return trimmedLines.join("\n");
    }