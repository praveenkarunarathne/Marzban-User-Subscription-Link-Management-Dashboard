let host = "Marzban Panel Host";
let password = "123456";

function doGet(e) {
  if (e.parameter.password == password) {
    return HtmlService.createHtmlOutputFromFile('dashboard');
  } else {
    return HtmlService.createHtmlOutputFromFile('login');
  }
}

function getURL() {
  return ScriptApp.getService().getUrl();
}

function createUser(user) {
    var files = DriveApp.getFilesByName("marzban_users.txt");
    if (files.hasNext()) {
        file = files.next();
        var data = file.getBlob().getDataAsString();
        var users = JSON.parse(data);
        if (users.find(u => u.username === user.username)) {
            return true;
        } else {
            user = createFiles(user);
            users.push(user);
            file.setContent(JSON.stringify(users));
            return false;
        }
    } else {
        user = createFiles(user);
        file = DriveApp.createFile("marzban_users.txt",JSON.stringify([user]));
        return false;
    }    
}

function createFiles(user) {
    const data = UrlFetchApp.fetch(user.link).getContentText();
    if ("drive" in user.services) {
            var file = DriveApp.createFile(user.username + "_" + "drive", data);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            user.services.drive = file.getId();
        } 
    if ("docs" in user.services) {
            var file = DocumentApp.create(user.username + "_" + "docs");
            file.getBody().setText(data);
            DriveApp.getFileById(file.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            user.services.docs = file.getId();
        }
    return user;
}

function getUser(username) {
    var files = DriveApp.getFilesByName("marzban_users.txt");
    if (files.hasNext()) {
        file = files.next();
        var data = file.getBlob().getDataAsString();
        var users = JSON.parse(data);
        return users.find(u => u.username === username);
    } else {
        return null;
    }    
}

function deleteUser(user) {
    Object.keys(user.services).forEach(key => {
        DriveApp.getFileById(user.services[key]).setTrashed(true);
    });
    var files = DriveApp.getFilesByName("marzban_users.txt");
    if (files.hasNext()) {
        file = files.next();
        var data = file.getBlob().getDataAsString();
        var users = JSON.parse(data);
        users = users.filter(u => u.username !== user.username);
        file.setContent(JSON.stringify(users));
    }    
}

function updateUser(currentEditingUser) {
    var files = DriveApp.getFilesByName("marzban_users.txt");
    if (files.hasNext()) {
        file = files.next();
        var data = file.getBlob().getDataAsString();
        var users = JSON.parse(data);
        var user = users.find(u => u.username === currentEditingUser.username);
        Object.keys(user.services).forEach(key => {
            DriveApp.getFileById(user.services[key]).setTrashed(true);
        });
        currentEditingUser = createFiles(currentEditingUser);
        users.find(u => u.username === currentEditingUser.username).services = currentEditingUser.services;
        file.setContent(JSON.stringify(users));}
}

function doPost(e) {
    var data = JSON.parse(e.postData.contents);
    data.forEach(item => {
    switch (item.action) {
        case "user_updated":
            userUpdated(item);
            break;

        case "user_deleted":
            userDeleted(item);
            break;

        case "user_created":
            userCreated(item);
            break;
    }
});
return ContentService.createTextOutput(JSON.stringify({status: "success"}));
}

function userUpdated(item) {
    const user = getUser(item.username);
    if (user) {
        const data = UrlFetchApp.fetch(user.link).getContentText();
        Object.entries(user.services).map(([service, fileId]) => {
                if(service == "drive") {
                    DriveApp.getFileById(fileId).setContent(data);
                }
                if(service == "docs") {
                    DocumentApp.openById(fileId).getBody().setText(data);
                }
        });
    }
}

function userDeleted(item) {
    var files = DriveApp.getFilesByName("marzban_users.txt");
    if (files.hasNext()) {
        file = files.next();
        var data = file.getBlob().getDataAsString();
        var users = JSON.parse(data);
        var user = users.find(u => u.username === item.username);
        if (user){
            Object.keys(user.services).forEach(key => {
            DriveApp.getFileById(user.services[key]).setTrashed(true);
        });
        users = users.filter(u => u.username !== item.username);
        file.setContent(JSON.stringify(users));
        }
    }
}

function userCreated(item) {
    var files = DriveApp.getFilesByName("marzban_users.txt");
    if (files.hasNext()) {
        file = files.next();
        var data = file.getBlob().getDataAsString();
        var users = JSON.parse(data);
        users.push({
            username: item.username,
            link: host + item.user.subscription_url,
            services: {}
        });
        file.setContent(JSON.stringify(users));
    } else {
        file = DriveApp.createFile("marzban_users.txt",JSON.stringify([{
            username: item.username,
            link: host + item.user.subscription_url,
            services: {}
        }]));
    }
}

