    class JsCodeEditor {

        constructor(selector) {
            let source = selector.querySelector(".source"),
                editor = selector.querySelector(".editor"),
                trigger = selector.querySelector(".trigger"),
                input = selector.querySelector(".input"),
                output = selector.querySelector(".output"),
                editableFunction;

            editor.value = this.trimCode(source.textContent);
            editableFunction = (new Function("return " + editor.value)()).bind(editor, input, output);

            trigger.addEventListener('click', function() {
                let returnValue = editableFunction()
                if(returnValue !== undefined) {
                    output.value = returnValue;
                } 
            });
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

        trimCode(source) {
            let lines = source.split("\n"),
                indentOffset,
                offsetSet;
            for(let line in lines) {
                if(lines[line] !== "" && !offsetSet) {
                    indentOffset = lines[line].length - lines[line].trimLeft().length;
                    offsetSet = true;
                }
                lines[line] = lines[line].substring(indentOffset, lines[line].length);
            }
            let trimmedLines = lines.filter(function(line) {
                return line !== "";
            });
            return trimmedLines.join("\n");
        }
    }