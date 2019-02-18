let sections = document.querySelectorAll("main > section"),
    navigation = document.querySelector("body > div.wrapper > nav"),
    sectionsList = document.createElement("ul"),
    backToTop = document.querySelector("#toTop a");

backToTop.href = "#" + sections[0].id;

for(let section of sections) {
    let sectionEntry = document.createElement("li"),
        articleList = document.createElement("ul"),
        articles = section.children,
        sectionTitle = section.id.replaceAll("-"," "),
        sectionLink = document.createElement("a");

    sectionLink.href = "#" + section.id;
    sectionLink.innerHTML = sectionTitle;
    sectionEntry.appendChild(sectionLink);

    for(let article of articles) {
        let articleEntry = document.createElement("li"),
            title = article.children[0].textContent,
            link = document.createElement("a");

        article.id = title.replaceAll(" ", "-");
        link.href = "#" + article.id;
        link.innerHTML = title;
        articleEntry.appendChild(link);
        articleList.appendChild(articleEntry);
    }

    sectionEntry.appendChild(articleList);
    sectionsList.appendChild(sectionEntry);
}
navigation.appendChild(sectionsList);

