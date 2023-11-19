var express = require("express");
var dataParser = require("./dataParser.js");
var idGenerator = require("./random_strings.js");
var app = express();

const cors = require('cors');
app.use(cors())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const { DOMParser } = require('xmldom');
var xmlData = "";
var parsedXMLdoc;
dataParser.readXmlFile().then(data => {
    xmlData = data;
    app.listen(3000, () => {
        console.log("Server running on port 3000");
    });
    parsedXMLdoc = new DOMParser().parseFromString(xmlData, 'text/xml');
    //console.log(parsedXMLdoc);
});






app.get("/lists", (req, res, next) => {
    res.json(getLists());
    
});
app.get("/lists/:listID", (req, res, next) => {
    res.set('Content-Type', 'text/xml');
    res.send(getListTasks(req.params.listID));
});


app.post("/lists", (req, res, next) => {
    let randiomID = idGenerator.randomID(8);
    addNewList(req.body.name, randiomID).then(data => { res.json({ "succes": true, "listID": randiomID }) });
});
app.post("/tasks/:parentID", (req, res, next) => {
    let randiomID = idGenerator.randomID(8);;
    addNewTask(req.params.parentID, req.body.text, randiomID).then(data => { res.json({ "succes": true, "taskID": randiomID }) });
});


app.put("/lists/:listID", (req, res, next) => {
    changeListName(req.params.listID, req.body.newName).then(data => { res.json({ "succes": true }) });
});

app.put("/tasks/:taskID", (req, res, next) => {
    if ("done" in req.body) {
        changeTaskState(req.params.taskID, req.body.done).then(data => { res.json({ "succes": true }) });
    }
    if ("text" in req.body) {
        changeTaskText(req.params.taskID, req.body.text).then(data => { res.json({ "succes": true }) });
    }
});


app.delete("/lists/:listID", (req, res, next) => {
    deleteList(req.params.listID).then(data => { res.json({ "succes": true }) });
});
app.delete("/tasks/:taskID", (req, res, next) => {
    deleteTask(req.params.taskID).then(data => { res.json({ "succes": true }) });
});




function getLists() {
    lists = [];
    let l = parsedXMLdoc.getElementsByTagName("List");
    for (let i = 0; i < l.length; i++) {
        lists.push({ "id": l[i].getAttribute("id"), "name": l[i].getAttribute("name") });
    }
    return lists;
}

function changeListName(listID, newName) {
    parsedXMLdoc.getElementById(listID).setAttribute("name", newName);
    return dataParser.saveXmlFile(parsedXMLdoc.toString());
}

function addNewList(name, id) {
    let l = parsedXMLdoc.createElement("List");
    l.setAttribute("name", name);
    l.setAttribute("id", id);
    parsedXMLdoc.getElementsByTagName("Lists")[0].appendChild(l);
    return dataParser.saveXmlFile(parsedXMLdoc.toString());
}

function deleteList(listID) {
    parsedXMLdoc.getElementsByTagName("Lists")[0].removeChild(parsedXMLdoc.getElementById(listID));
    //parsedXMLdoc.removeChild();
    return dataParser.saveXmlFile(parsedXMLdoc.toString());
}


function getListTasks(listID) {
    
    return parsedXMLdoc.getElementById(listID).toString();
}


function changeTaskState(taskID, done) {
    var task = parsedXMLdoc.getElementById(taskID);
    task.setAttribute("done", done);
    updateChildren(task, done);
    updateParents(task, done);
    return dataParser.saveXmlFile(parsedXMLdoc.toString());
}

function updateChildren(node, done) {
    if (node.hasChildNodes()) {
        for (var i = 0; i < node.childNodes.length; i++) {
            updateChildren(node.childNodes[i], done);
        }
    }
    if (node.nodeName === "Task") {
        node.setAttribute("done", done);
    }
}

function updateParents(node, done) {
    if (done === "false") {
        if (node != null) {
            if (node.parentNode.nodeName === "Task") {
                updateParents(node.parentNode, done);
			}
            if (node.nodeName === "Task") {
                node.setAttribute("done", done);
            }
        }
    } else {
        if (areNodeBrothersDone(node)) {
            if (node.parentNode.nodeName === "Task") {
                updateParents(node.parentNode, done);
            }
        }
        if (node.nodeName === "Task") {
            node.setAttribute("done", done);
        }
    }
}

function areNodeBrothersDone(node) {
    if (node!=null){
        if (node.parentNode != null){
            var childs = node.parentNode.childNodes;
            for (var i = 0; i < childs.length; i++) {
                if (childs[i] !== node) {
                    if (childs[i].nodeName === "Task") {
                        if (childs[i].getAttribute("done") === "false") {
                            return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}

function changeTaskText(taskID, text) {
    parsedXMLdoc.getElementById(taskID).setAttribute("text", text);
    return dataParser.saveXmlFile(parsedXMLdoc.toString());
}


function addNewTask(parentID, text, id) {
    let l = parsedXMLdoc.createElement("Task");
    l.setAttribute("id", id);
    l.setAttribute("done", "false");
    l.setAttribute("text", text);
    parsedXMLdoc.getElementById(parentID).appendChild(l);
    updateParents(l,"false");
    return dataParser.saveXmlFile(parsedXMLdoc.toString());
}

function deleteTask(taskID) {
    if (areNodeBrothersDone(parsedXMLdoc.getElementById(taskID))) {
        updateParents(parsedXMLdoc.getElementById(taskID), true);
	}
    let elementXml = parsedXMLdoc.getElementById(taskID).toString();
    let fullXmlDocument = parsedXMLdoc.toString();
    fullXmlDocument = fullXmlDocument.replace(elementXml, "");
    parsedXMLdoc = new DOMParser().parseFromString(fullXmlDocument, 'text/xml');
    return dataParser.saveXmlFile(parsedXMLdoc.toString());
}