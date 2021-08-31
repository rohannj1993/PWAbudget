let db;

const request = indexedDB.open('budget_tracker', 1);


request.onupgradeneeded = function (event) {
    
    const db = event.target.result;
    
    db.createObjectStore('new_action', { autoIncrement: true });
};


request.onsuccess = function (event) {
  
    db = event.target.result;

   
    if (navigator.onLine) {
       
        uploadAction();
    }
};

request.onerror = function (event) {
    
    console.log(event.target.errorCode);
};


function saveRecord(record) {
    
    const transaction = db.transaction(['new_action'], 'readwrite');

    
    const actionObjectStore = transaction.objectStore('new_action');

    
    actionObjectStore.add(record);
}

function uploadAction() {
    
    const transaction = db.transaction(['new_action'], 'readwrite');

  
    const actionObjectStore = transaction.objectStore('new_action');

    
    const getAll = actionObjectStore.getAll();

    
    getAll.onsuccess = function () {
        
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                   
                    const transaction = db.transaction(['new_action'], 'readwrite');
                   
                    const actionObjectStore = transaction.objectStore('new_action');
                   
                    actionObjectStore.clear();

                    alert('All saved actions have been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

}

window.addEventListener('online', uploadAction);