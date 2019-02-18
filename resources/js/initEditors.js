let jsEditors = document.querySelectorAll(".codeEditor[data-language='js']"),
        htmlEditors = document.querySelectorAll(".codeEditor[data-language='html']");

    for (let selector of jsEditors) {
        let editor = new JsCodeEditor(selector);
    }
    for (let selector of htmlEditors) {
        let editor = new HtmlCodeEditor(selector);
    }