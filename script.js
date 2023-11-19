let apiBaseUrl = "http://localhost:3000/";
var lastTaskClick = { taskID: "", lastClick: Date.now() };
window.addEventListener("keypress", e => {
    if (lists.getSelectedList() != null) {
        if (lists.getSelectedList().getSelectedTask() != null) {
            /*if (e.target.dataset.id != lists.getSelectedList().getSelectedTask().getId()) {
                lists.getSelectedList().getSelectedTask().hideSelection();
                lists.getSelectedList().setSelectedTask(null);
            } else {
                if (e.target.getAttribute("class") === "icon") {
                    lists.getSelectedList().getSelectedTask().hideSelection();
                    lists.getSelectedList().setSelectedTask(null);
                }
            }*/
        }
    }
});
//Lists-----------------------------------
class List {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.selected = false;
        this.tasks = [];
        this.selectedTask = null;
        this.htmlElement = document.createElement("h2");
        this.htmlElement.setAttribute("class", "listItem");
        this.htmlElement.setAttribute("data-id", id);
        this.htmlElement.addEventListener("click", (e) => {
            if (lists.getSelectedList() != null) {
                if (lists.getSelectedList().getId() !== e.target.dataset.id) {
                    lists.selectListById(e.target.dataset.id);
                    getListTasks(e.target.dataset.id);
                }
            } else {
                lists.selectListById(e.target.dataset.id);
                getListTasks(e.target.dataset.id);
            }
        });
        this.htmlElement.addEventListener("mouseenter", (e) => {
            //console.log(e.target);
            if (lists.getSelectedList() != null) {
                if (lists.getSelectedList().getId() !== e.target.dataset.id) {
                    e.target.style = "background-color: #333333";
                }
            } else {
                e.target.style = "background-color: #333333";
            }

        });
        this.htmlElement.addEventListener("mouseout", (e) => {
            //console.log(e.target);
            if (lists.getSelectedList() != null) {
                if (lists.getSelectedList().getId() !== e.target.dataset.id) {
                    e.target.style = "background-color: transparent";
                }
            } else {
                e.target.style = "background-color: transparent";
            }
        });

        //getTasks(event.target.dataset.id, name);
        this.htmlElement.innerHTML = name;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getHtmlElement() {
        return this.htmlElement;
    }
    isSelected() {
        return this.selected;
    }
    setSelected() {
        this.selected = true;
    }
    setUnselected() {
        this.selected = false;
    }
    setId(id) {
        this.id = id;
    }
    setName(name) {
        this.name = name;
    }
    addTask(task) {
        this.tasks.push(task);
    }
    getTasks() {
        return this.tasks;
    }
    clearTasks() {
        this.tasks = [];
    }
    getSelectedTask() {
        return this.selectedTask;
    }
    setSelectedTask(task) {
        this.selectedTask = task;
    }
    getTaskById(taskID) {
        let found;
        for (let i = 0; i < this.tasks.length; i++) {
            found = this.tasks[i].getTaskByID(taskID);
            if (found != null) {
                return found;
            }
        }
        return found;
    }
}

class Lists {
    constructor() {
        this.lists = [];
        this.selectedListIndex = -1;
    }
    length() {
        return this.lists.length;
    }
    addList(list) {
        this.lists.push(list);
    }
    getListById(id) {
        for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].getId() === id) {
                return this.lists[i];
            }
        }
        return null;
    }
    getListByIndex(index) {
        if (index < this.lists.length) {
            return this.lists[index];
        } else {
            return null;
        }
    }
    getListIndexById(id) {
        for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].getId() === id) {
                return i;
            }
        }
        return null;
    }
    getLastList() {
        return this.lists[this.lists.length - 1];
    }
    //AJAX
    getLists() {
        this.lists = [];
        $.get(apiBaseUrl + "lists", function (data) {
            document.getElementById("listsContainer").innerHTML = "";
            data.forEach(list => {
                lists.addList(new List(list.id, list.name));
                //lists.getLastList().setIndex(lists.length() - 1);
                document.getElementById("listsContainer").appendChild(lists.getLastList().getHtmlElement());
            });
        });
    }
    selectListById(listID) {
        this.getListById(listID).setSelected();
        if (this.selectedListIndex !== -1) {
            this.getListByIndex(this.selectedListIndex).setUnselected();
            $(".listItem").eq(this.selectedListIndex).css({ "background-color": "transparent" });
        }
        this.selectedListIndex = this.getListIndexById(listID);
    }
    selectListByIndex(index) {
        this.getListByIndex(index).setSelected();
        if (this.selectedListIndex !== -1) {
            this.getListByIndex(this.selectedListIndex).setUnselected();
            $(".listItem").eq(this.selectedListIndex).css({ "background-color": "transparent" });
        }
        this.selectedListIndex = index;
        this.displaySelectedlist();
    }
    selectAfterDelete() {
        if (this.selectedListIndex != 0) {
            this.getListByIndex(this.selectedListIndex - 1).setSelected();
            this.selectedListIndex--;
        } else {
            if (this.lists.length > 0) {
                this.getListByIndex(this.selectedListIndex).setSelected();
            } else {
                this.selectedListIndex = -1;
            }
        }
        getListTasks(this.getSelectedList().getId());
        //this.displaySelectedlist();
    }
    displaySelectedlist() {
        if (this.lists.length > 0) {
            document.getElementsByClassName("allTasksContainer")[0].innerHTML = "";
            this.getSelectedList().getTasks().forEach(task => {
                document.getElementsByClassName("allTasksContainer")[0].appendChild(task.getHtmlElement());
            });
            document.getElementById("mainTaskNameInputText").style = "display:inline-block;";
            this.getSelectedList().getHtmlElement().style = "background-color: #191919;cursor:default";
            document.getElementById("listTitle").dataset.id = this.getSelectedList().getId();
            document.getElementById("deleteListBtn").dataset.id = this.getSelectedList().getId();
            document.getElementById("listTitle").innerText = this.getSelectedList().getName();
            document.getElementById("listTitle").style = "display:inline-block";
            document.getElementById("deleteListBtn").style = "display:inline-block";
        } else {
            document.getElementById("listTitle").style = "display:none";
            document.getElementById("deleteListBtn").style = "display:none";
        }
    }
    getSelectedList() {
        return this.getListByIndex(this.selectedListIndex);
    }
    getSelectedListIndex() {
        return this.selectedListIndex;
    }
    deleteListById(id) {
        this.lists.splice(this.getListIndexById(id), 1);
    }
}

class TaskTree {
    constructor(newTask, rootTaskXml, listID) {
        this.tasksArray = [];
        if (newTask != null) {
            this.treeRoot = newTask;
            this.tasksArray.push(this.treeRoot);
        } else {
            this.treeRoot = new Task(null, listID, rootTaskXml.attributes.id.value, rootTaskXml.attributes.text.value, rootTaskXml.attributes.done.value, true);
            this.tasksArray.push(this.treeRoot);
            this.parseXmlTree(rootTaskXml, this.treeRoot);
            //console.log(this.treeRoot.getDescendantsCount());
        }
        this.treeHeight = this.treeRoot.getDepth();
        this.htmlElement = document.createElement("table");
        this.htmlElement.setAttribute("class", "taskContainer");
        this.generateChildHtml(this.treeRoot, false);

    }

    parseXmlTree(rootTaskXml, rootTask) {
        if (rootTaskXml.childNodes.length != 0) {
            for (let i = 0; i < rootTaskXml.childNodes.length; i++) {
                var t = new Task(rootTask, rootTask.getId(), rootTaskXml.childNodes[i].attributes.id.value,
                    rootTaskXml.childNodes[i].attributes.text.value, rootTaskXml.childNodes[i].attributes.done.value, false);
                rootTask.addChildTask(t);
                this.tasksArray.push(t);
                this.parseXmlTree(rootTaskXml.childNodes[i], t);
            }
        }
    }
    generateChildHtml(task, firstChild) {
        let tableRow = document.createElement("tr");
        if (firstChild) {
            let verticalLineTD = document.createElement("td");
            verticalLineTD.setAttribute("rowspan", task.getParentTask().getDescendantsCount());
            verticalLineTD.setAttribute("class", "vertical_line_container");
            verticalLineTD.style = "width: 2px;padding: 0px 14px;transform: scaleX(0.05);";
            
            tableRow.appendChild(verticalLineTD)
        }
        task.getHtmlElement().setAttribute("colspan", this.treeHeight);
        tableRow.appendChild(task.getHtmlElement());

        this.htmlElement.appendChild(tableRow);
        if (task.getChildrenTasks().length > 0) {
            for (let i = 0; i < task.getChildrenTasks().length; i++) {
                if (i == 0) {
                    this.generateChildHtml(task.getChildrenTasks()[i], true);
                } else {
                    this.generateChildHtml(task.getChildrenTasks()[i], false);
                }
            }
        }
    }
    getRootTask() {
        return this.treeRoot;
    }
    getHtmlElement() {
        return this.htmlElement;
    }
    getTaskByID(taskID) {
        let found = null;
        this.tasksArray.forEach(task => {
            if (task.getId() === taskID) {
                found = task;
            }
        });
        return found;
    }
}

class Task {
    constructor(parentTask, parentID, id, text, done, isRoot) {
        this.parentID = parentID;
        this.id = id;
        this.text = text;
        done === "true" ? this.done = true : this.done = false;
        this.isRoot = isRoot;
        this.childrenTasks = [];
        this.parentTask = parentTask;
        this.numberOfleaf = 0;


        this.htmlElement = document.createElement("td");
        this.htmlElement.setAttribute("colspan", "1");
        this.htmlElement.setAttribute("class", "singleTaskContainer");

        let icon = document.createElement("img");
        icon.setAttribute("src", this.done ? "done.png" : "notDone.png");
        icon.setAttribute("class", "icon");
        icon.setAttribute("data-id", id);

        icon.addEventListener('click', e => {
            if (lists.getSelectedList().getSelectedTask() !== null){
                lists.getSelectedList().getSelectedTask().hideSelection();
            }
            $.ajax({
                url: apiBaseUrl + "tasks/" + e.target.dataset.id,
                method: 'PUT',
                data: { done: !lists.getSelectedList().getTaskById(e.target.dataset.id).isDone() },
                success: function (data) {
                    if (data.succes) {
                        if (lists.getSelectedList().getTaskById(e.target.dataset.id).isDone()) {
                            lists.getSelectedList().getTaskById(e.target.dataset.id).setNotDone();
                        } else {
                            lists.getSelectedList().getTaskById(e.target.dataset.id).setDone();
                        }
                    }
                },
                error: function (request, msg, error) {

                }
            });
        });

        let textElemnt = document.createElement("h2");
        textElemnt.innerText = text;
        textElemnt.setAttribute("data-id", id);
        textElemnt.setAttribute("tabindex", "1");
        if (this.done) {
            textElemnt.style = "text-decoration: line-through;color:gray;"
        } else {
            textElemnt.style = "text-decoration: none;color:white;"
        }
        textElemnt.addEventListener("click", e => {
            if ((Date.now() - lastTaskClick.lastClick) < 300) {
                lastTaskClick.lastClick = Date.now();
                if (lastTaskClick.taskID == e.target.dataset.id) {//double Click
                    lastTaskClick.lastClick = Date.now();
                    if (lists.getSelectedList().getSelectedTask() == null) {//First Selection
                        let t = lists.getSelectedList().getTaskById(e.target.dataset.id);
                        lists.getSelectedList().setSelectedTask(t);
                        t.showSelection();
                    }
                    this.showEditTaskName();
                }
            } else {//single click
                lastTaskClick.lastClick = Date.now();
                lastTaskClick.taskID = e.target.dataset.id;
                if (lists.getSelectedList().getSelectedTask() == null) {//First Selection
                    let t = lists.getSelectedList().getTaskById(e.target.dataset.id);
                    lists.getSelectedList().setSelectedTask(t);
                    t.showSelection();
                } else {
                    if (lists.getSelectedList().getSelectedTask().getId() === e.target.dataset.id) {//unselect
                        lists.getSelectedList().getSelectedTask().hideSelection();
                        lists.getSelectedList().setSelectedTask(null);
                    } else {//change selection
                        let t = lists.getSelectedList().getTaskById(e.target.dataset.id);
                        lists.getSelectedList().getSelectedTask().hideSelection();
                        lists.getSelectedList().setSelectedTask(t);
                        t.showSelection();
                    }
                }
            }
        });
        let taskTextInput = document.createElement("input");
        taskTextInput.setAttribute("type", "text");
        taskTextInput.setAttribute("class", "textInput taskNameTextInput");
        taskTextInput.setAttribute("data-id", this.id);
        taskTextInput.style.display = "none";
        taskTextInput.addEventListener("keypress", e => {
            if (e.keyCode == 13) {
                if (e.target.value !== lists.getSelectedList().getSelectedTask().getText()) {
                    updateTaskName(e.target.dataset.id, e.target.value);
                }
                console.log("input keypress: " + lists.getSelectedList().getSelectedTask());
            }
        });
        taskTextInput.addEventListener("blur", e => {
            if (lists.getSelectedList().getSelectedTask() != null) {
                lists.getSelectedList().getSelectedTask().hideEditTaskName();
            }
            console.log("input blur: " + lists.getSelectedList().getSelectedTask());
        });

        //textElemnt.addEventListener("dblclick", e => {
        //this.showEditTaskName();
        //});
        isRoot ? textElemnt.setAttribute("class", "rootTask") : textElemnt.setAttribute("class", "subTask");


        this.htmlElement.appendChild(icon);
        this.htmlElement.appendChild(textElemnt);
        this.htmlElement.appendChild(taskTextInput);
    }
    isDone() {
        return this.done;
    }
    isRootTask() {
        return this.isRoot;
    }
    getId() {
        return this.id;
    }
    getText() {
        return this.text;
    }
    getParentID() {
        return this.parentID;
    }
    getParentTask() {
        return this.parentTask;
    }
    setDone() {
        this.done = true;
        this.htmlElement.childNodes[0].setAttribute("src", "done.png");
        this.htmlElement.childNodes[1].style = "text-decoration: line-through;color:gray;";
        this.doneChildren(this, true);
        this.doneAncestors(this, true);
    }
    setNotDone() {
        this.done = false;
        this.htmlElement.childNodes[0].setAttribute("src", "notDone.png");
        this.htmlElement.childNodes[1].style = "text-decoration: none;color:white;";
        this.doneChildren(this, false);
        this.doneAncestors(this, false);
    }
    doneChildren(task, done) {
        if (task.getChildrenTasks().length == 0) {
            if (done) {
                task.done = true;
                task.htmlElement.childNodes[0].setAttribute("src", "done.png");
                task.htmlElement.childNodes[1].style = "text-decoration: line-through;color:gray;";
            } else {
                task.done = false;
                task.htmlElement.childNodes[0].setAttribute("src", "notDone.png");
                task.htmlElement.childNodes[1].style = "text-decoration: none;color:white;";
            }
        } else {
            if (done) {
                task.done = true;
                task.htmlElement.childNodes[0].setAttribute("src", "done.png");
                task.htmlElement.childNodes[1].style = "text-decoration: line-through;color:gray;";
            } else {
                task.done = false;
                task.htmlElement.childNodes[0].setAttribute("src", "notDone.png");
                task.htmlElement.childNodes[1].style = "text-decoration: none;color:white;";
            }
        }
        for (let i = 0; i < task.getChildrenTasks().length; i++) {
            this.doneChildren(task.getChildrenTasks()[i], done);
        }
    }
    doneAncestors(task, done) {
        if (task.getParentTask() != null) {
            if (done) {
                if (task.getParentTask().areChildrenDone()) {
                    task.getParentTask().done = true;
                    task.getParentTask().htmlElement.childNodes[0].setAttribute("src", "done.png");
                    task.getParentTask().htmlElement.childNodes[1].style = "text-decoration: line-through;color:gray;";
                }
            } else {
                task.getParentTask().done = false;
                task.getParentTask().htmlElement.childNodes[0].setAttribute("src", "notDone.png");
                task.getParentTask().htmlElement.childNodes[1].style = "text-decoration: none;color:white;";
            }
            this.doneAncestors(task.getParentTask(), done);
        }
    }
    areChildrenDone() {
        for (let i = 0; i < this.childrenTasks.length; i++) {
            if (!this.childrenTasks[i].isDone()) {
                return false;
            }
        }
        return true;
    }
    setText(Txt) {
        this.text = Txt;
    }
    getHtmlElement() {
        return this.htmlElement;
    }
    addChildTask(task) {
        this.childrenTasks.push(task);
    }
    getChildrenTasks() {
        return this.childrenTasks;
    }
    getDepth() {
        let row = this.calculeDepth(this, 1, []);
        let max = row[0];
        for (let i = 0; i < row.length; i++) {
            if (max < row[i]) {
                max = row[i];
            }
        }
        return max;
        //this.browse(this);
    }
    calculeDepth(task, d, arr) {
        if (task.getChildrenTasks().length == 0) {
            arr.push(d);
            return arr;
        }
        for (let i = 0; i < task.getChildrenTasks().length; i++) {
            this.calculeDepth(task.getChildrenTasks()[i], d + 1, arr);
        }
        return arr;
    }
    getDescendantsCount() {
        this.numberOfleaf = 0;
        this.countLeafs(this);
        return this.numberOfleaf - 1;
    }
    countLeafs(task) {
        this.numberOfleaf = this.numberOfleaf + 1;
        if (task.getChildrenTasks().length > 0) {
            for (let i = 0; i < task.getChildrenTasks().length; i++) {
                this.countLeafs(task.getChildrenTasks()[i]);
            }
        }
    }

    showSelection() {
        //this.htmlElement.childNodes[1].style = "color:#2680EB;"
        if (this.done) {
            this.htmlElement.childNodes[1].style = "background-color:#2680EB;color:gray;text-decoration:line-through;";
        } else {
            this.htmlElement.childNodes[1].style = "background-color:#2680EB;color:white;text-decoration:none;";
        }

        let addIcon = document.createElement("img");
        addIcon.setAttribute("src", "add.png");
        addIcon.setAttribute("data-id", this.id);
        addIcon.setAttribute("class", "icon addRemoveTask_icon");
        addIcon.addEventListener("click", e => {
            let newTaskTextInput = document.createElement("input");
            newTaskTextInput.setAttribute("type", "text");
            newTaskTextInput.setAttribute("class", "textInput taskNameTextInput");
            newTaskTextInput.setAttribute("data-id", e.target.dataset.id);
            newTaskTextInput.addEventListener("blur", e => {
                e.target.parentNode.removeChild(e.target);
            });
            newTaskTextInput.addEventListener("keypress", e => {
                if (e.keyCode == 13) {
                    if (e.target.value.length > 0) {
                        addNewChildTask(e.target.dataset.id, e.target.value);
                    }
                }
            });
            lists.getSelectedList().getSelectedTask().getHtmlElement().appendChild(newTaskTextInput);
            newTaskTextInput.focus();
        });
        let removeIcon = document.createElement("img");
        removeIcon.setAttribute("src", "remove.png");
        removeIcon.setAttribute("class", "icon addRemoveTask_icon");
        removeIcon.setAttribute("data-id", this.id);
        removeIcon.addEventListener("click",e=>{
            deleteTask(e.target.dataset.id);
        });
        this.htmlElement.appendChild(removeIcon);
        this.htmlElement.appendChild(addIcon);
    }
    hideSelection() {
        if (this.done) {
            this.htmlElement.childNodes[1].style = "color:gray;text-decoration:line-through;";
        } else {
            this.htmlElement.childNodes[1].style = "color:white;text-decoration:none;";
        }
        //this.htmlElement.childNodes[1].style = "color:white;"
        let childs = this.htmlElement.getElementsByClassName("addRemoveTask_icon");
        if (childs.length > 0) {
            this.htmlElement.removeChild(childs[0]);
            this.htmlElement.removeChild(childs[0]);
        }
    }
    showEditTaskName() {
        this.hideSelection();
        this.htmlElement.childNodes[2].style.display = "inline";
        this.htmlElement.childNodes[1].style.display = "none";
        this.htmlElement.childNodes[2].value = this.htmlElement.childNodes[1].innerText;
        this.htmlElement.childNodes[2].focus();
    }
    hideEditTaskName() {
        this.htmlElement.childNodes[1].style.display = "inline";
        this.htmlElement.childNodes[2].style.display = "none";
        this.htmlElement.childNodes[2].value = "";
        lists.getSelectedList().setSelectedTask(null);
        this.hideSelection();
    }


}


let lists = new Lists();
lists.getLists();




function addNewList(event) {
    if (event.keyCode == 13) {
        if (userTypedListName()) {
            let nameValue = document.getElementById('listNameInputText').value;
            nameValue = nameValue.charAt(0).toUpperCase() + nameValue.substring(1).toLowerCase();
            $.post(apiBaseUrl + "lists", { name: nameValue },
                function (data) {
                    if (data.succes) {
                        lists.addList(new List(data.listID, nameValue));
                        //lists.getLastList().setIndex(lists.length() - 1);
                        document.getElementById("listsContainer").appendChild(lists.getLastList().getHtmlElement());
                        //lists.getLists();
                        hidelistNameInputText();
                    }
                });
        } else {
            alert("type list name please !!!");
        }
    }
}
function userTypedListName() {
    if (document.getElementById('listNameInputText').value.length == 0) {
        return false;
    } else {
        return true;
    }
}
function showListNameInputText() {
    document.getElementById("addListBtn").style = "display:none;";
    document.getElementById("listNameInputText").style = "display: block";
    document.getElementById("listNameInputText").focus();
}
function hidelistNameInputText() {
    document.getElementById("addListBtn").style = "display:block;";
    document.getElementById("listNameInputText").style = "display: none";
    document.getElementById("listNameInputText").value = "";
}
function showEditNameInputText() {
    document.getElementById("listTitle").style = "display:none;";
    document.getElementById("editListNameInputText").style = "display: inline-block";
    document.getElementById("editListNameInputText").value = document.getElementById("listTitle").innerText;
    document.getElementById("editListNameInputText").focus();
}
function hideEditNameInputText() {
    document.getElementById("listTitle").style = "display:inline-block;";
    document.getElementById("editListNameInputText").style = "display: none;";
    document.getElementById("editListNameInputText").value = "";
}
function updateListName(event) {
    var editText = document.getElementById("editListNameInputText");
    var listTitle = document.getElementById("listTitle");
    if (event.keyCode == 13) {
        if (editText.value !== listTitle.innerText) {
            if (editText.value.length == 0) {
                listTitle.style = "display:inline-block;";
                editText.style = "display: none";
            } else {
                nameValue = editText.value.charAt(0).toUpperCase() + editText.value.substring(1).toLowerCase();
                $.ajax({
                    url: apiBaseUrl + "lists/" + listTitle.dataset.id,
                    method: 'PUT',
                    data: { newName: nameValue },
                    success: function (data) {
                        if (data.succes) {
                            listTitle.innerText = nameValue;
                            listTitle.style = "display:inline-block;";
                            editText.style = "display: none";
                            lists.getSelectedList().getHtmlElement().innerText = nameValue;
                            lists.getListById(listTitle.dataset.id).setName(nameValue);
                        }
                    },
                    error: function (request, msg, error) {

                    }
                });
            }
        } else {
            listTitle.style = "display:inline-block;";
            editText.style = "display: none";
        }
    }
}
function deleteList(id) {
    $.ajax({
        url: apiBaseUrl + "lists/" + id,
        method: 'DELETE',
        data: {},
        success: function (data) {
            if (data.succes) {
                document.getElementById("listsContainer").removeChild(lists.getListById(id).getHtmlElement());
                lists.deleteListById(id);
                lists.selectAfterDelete();
            }
        },
        error: function (request, msg, error) {

        }
    });
}

function deleteTask(taskId){
    $.ajax({
        url: apiBaseUrl + "tasks/" + taskId,
        method: 'DELETE',
        data: {},
        success: function (data) {
            if (data.succes) {
                getListTasks(lists.getSelectedList().getId());
                lists.getSelectedList().setSelectedTask(null);
            }
        },
        error: function (request, msg, error) {

        }
    });
}

function getListTasks(listID) {
    $.get(apiBaseUrl + "lists/" + listID, function (data) {
        lists.getSelectedList().clearTasks();
        let tasks = data.childNodes[0].childNodes;
        for (let i = 0; i < tasks.length; i++) {
            lists.getSelectedList().addTask(new TaskTree(null, tasks[i], lists.getSelectedList().getId()));
        }
        lists.displaySelectedlist();
    });
}
function addNewMainTask(event) {
    if (event.keyCode == 13) {
        if (document.getElementById("mainTaskNameInputText").value.length > 0) {
            let textValue = document.getElementById('mainTaskNameInputText').value;
            textValue = textValue.charAt(0).toUpperCase() + textValue.substring(1).toLowerCase();
            $.post(apiBaseUrl + "tasks/" + lists.getSelectedList().getId(), { text: textValue },
                function (data) {
                    if (data.succes) {
                        let selectedList = lists.getSelectedList();
                        document.getElementById("mainTaskNameInputText").value = "";
                        let t = new Task(null, selectedList.getId(), data.taskID, textValue, "false", true);
                        selectedList.addTask(new TaskTree(t, null, selectedList.getId()));
                        lists.displaySelectedlist();
                    }
                });
        }
    }
}

function addNewChildTask(parentTaskID, text) {
    textValue = text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
    $.post(apiBaseUrl + "tasks/" + parentTaskID, { text: textValue },
        function (data) {
            if (data.succes) {
                getListTasks(lists.getSelectedList().getId());
                lists.getSelectedList().setSelectedTask(null);
            }
        }
    );
}


function updateTaskName(taskId, text) {
    textValue = text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
    $.ajax({
        url: apiBaseUrl + "tasks/" + taskId,
        method: 'PUT',
        data: { text: textValue },
        success: function (data) {
            if (data.succes) {
                lists.getSelectedList().getTaskById(taskId).setText(text);
                lists.getSelectedList().getSelectedTask().getHtmlElement().childNodes[1].innerText = textValue;
                lists.getSelectedList().getSelectedTask().hideEditTaskName();
            }
        },
        error: function (request, msg, error) {

        }
    });
}