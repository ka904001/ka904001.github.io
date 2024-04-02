let start_form = document.getElementById("start_form");
let start_form_submit = document.getElementById("start_form_submit");
let main_form = document.getElementById("main_form");
let main_form_submit = document.getElementById("main_form_submit");
let main_form_cancel = document.getElementById("main_form_cancel");
let grade_form = document.getElementById("grade_form");
let grade_form_submit = document.getElementById("grade_form_submit");
let grade_form_cancel = document.getElementById("grade_form_cancel");
let passing = document.getElementById("passing");
let passed = document.getElementById("passed");
let add_button = document.getElementById("add_button");
let passing_body = document.getElementById("passing_body");
let passed_body = document.getElementById("passed_body");
let footer = document.getElementById("footer");

let identifier = 0;

let participants = {};

let main_date = new Date();
let timers = {};


let components = [
    start_form,
    main_form,
    grade_form,
    passing,
    passed,
    add_button,
    footer
];

start_form_submit.addEventListener("click", (e) => {
    // separate elemets in the field
    let subjects = document.getElementById("subjects");
    subjects = subjects.value.split(",");
    let subject = document.getElementById("subject");

    for(let subject_option of subjects){
        let option = document.createElement("option");
        option.value = subject_option;
        option.innerText = subject_option;
        subject.appendChild(option);
    }
    // hide this component and show others except form
    for(let el of components){
        if([start_form, main_form, grade_form].includes(el)){
            el.style.display='none';
            continue;
        }
        el.style.display='block';
    }
});

add_button.addEventListener("click", (e)=>{
    // hide everything, except main_form
    for(let el of components){
        if([main_form].includes(el)){
            el.style.display='block';
            continue;
        }
        el.style.display='none';
    }
    document.getElementById("test_num").value = 0;
    document.getElementById("name").value = "";
    document.getElementById("group").value = "";
});

main_form_submit.addEventListener("click", (e)=>{
    // add entered data to the table passing
    let subject = document.getElementById("subject").value;
    let test_num = document.getElementById("test_num").value;
    let name = document.getElementById("name").value;
    let group = document.getElementById("group").value;
    let start_time = new Date();
    identifier += 1;

    participants[identifier] = {
        "identifier": identifier,
        "subject": subject,
        "test_num": test_num,
        "name": name,
        "group": group,
        "start_time": start_time,
    };
    // add to passing
    let tr = document.createElement("tr");
    tr.id = `identifier_${identifier}`;
    for(let key in participants[identifier]){
        let th = document.createElement("th");
        // console.log(`${key}`);
        if(key == "start_time"){
            th.id = `identifier_${identifier}_timer`;
            // add timer logic
            timers[identifier] = setInterval(()=>{
                let now = new Date();
                let diff = now - start_time; // Difference in milliseconds
                // Convert milliseconds to hours, minutes, and seconds
                let msec = diff;
                let hh = Math.floor(msec / 1000 / 60 / 60);
                msec -= hh * 1000 * 60 * 60;
                let mm = Math.floor(msec / 1000 / 60);
                msec -= mm * 1000 * 60;
                let ss = Math.floor(msec / 1000);
                msec -= ss * 1000;
                th.innerText = `${hh}:${mm}:${ss}`;
            }, 1000);
            tr.appendChild(th);
            continue;
        }
        th.innerText = participants[identifier][key];
        if(["identifier", "test_num"].includes(key)){
            th.style.display='none';
        }
        tr.appendChild(th);
    }
    // create button to check them out
    let th = document.createElement("th");
    let btn = document.createElement("button");
    btn.classList.add('btn');
    btn.classList.add('btn-primary');
    btn.innerHTML = "оценить";
    th.appendChild(btn);
    tr.appendChild(th);
    {
        const unique = identifier;
        const unique_name = name;
        const unique_group = group;
        btn.addEventListener("click", (e)=>{
            // show menu
            for(let el of components){
                if([grade_form].includes(el)){
                    el.style.display='block';
                    continue;
                }
                el.style.display='none';
            }
            document.getElementById("grading_identifier").value = unique;
            document.getElementById("grading_name").value = unique_name;
            document.getElementById("grading_group").value = unique_group;
            
            // // take node
            // clearInterval(timers[identifier]);
            // let removed = passing_body.removeChild(tr);
        });
    }


    passing_body.appendChild(tr);
    // hide this component and show others except form
    for(let el of components){
        if([start_form, main_form, grade_form].includes(el)){
            el.style.display='none';
            continue;
        }
        el.style.display='block';
    }
});

main_form_cancel.addEventListener("click", (e)=>{
    // add entered data to the table passing
    // let subject = document.getElementById("subject").value;
    document.getElementById("test_num").value = 0;
    document.getElementById("name").value = "";
    document.getElementById("group").value = "";
    // hide this component and show others except form
    for(let el of components){
        if([start_form, main_form, grade_form].includes(el)){
            el.style.display='none';
            continue;
        }
        el.style.display='block';
    }
});

grade_form_submit.addEventListener("click", (e) => {
    // get identifier
    let id = document.getElementById("grading_identifier").value;
    // freeze timer
    clearInterval(timers[id]);
    // take node
    let passed = document.getElementById(`identifier_${id}`);
    let removed = passing_body.removeChild(passed);
    // replace btn with grade
    removed.lastElementChild.removeChild(
        removed.lastElementChild.lastElementChild
    );
    removed.lastElementChild.innerHTML = document.getElementById("grade").value;
    passed_body.appendChild(removed);
    
    // hide forms
    for(let el of components){
        if([start_form, main_form, grade_form].includes(el)){
            el.style.display='none';
            continue;
        }
        el.style.display='block';
    }
});

grade_form_cancel.addEventListener("click", (e) => {
    document.getElementById("grading_identifier").value = 0;
    document.getElementById("grading_name").value = "";
    document.getElementById("grading_group").value = "";
    // hide forms
    for(let el of components){
        if([start_form, main_form, grade_form].includes(el)){
            el.style.display='none';
            continue;
        }
        el.style.display='block';
    }
});

// app working

// hide all, except start_form
for(let el of components){
    if([start_form].includes(el)){
        el.style.display='block';
        continue;
    }
    el.style.display='none';
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

let download_btn = document.getElementById("download_csv");
download_btn.addEventListener("click", (e) => {
    let result = "Номер,Предмет,Билет,ФИО,Группа,Время,Оценка\n";
    // for each tr of passed body
    let children = passed_body.children;
    for (let i = 0; i < children.length; i++) {
        let elem = children[i];
        let fields = elem.children;
        // for each field
        let line = "";
        for(let j = 0; j < fields.length; j++){
            line += `${fields[j].innerText}`;
            if(j != fields.length - 1){
                line += ',';
            } else {
                line += '\n';
            }
        }
        result += line;
    }
    console.log(result);
    download("results.csv", result);
});
