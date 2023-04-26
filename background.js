let date = new Date();
let day = date.getDate();
let year = date.getFullYear();

let trackedDomains = [];
let dayStr = day.toString().padStart(2, '0');
let monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
let dateStr = dayStr + "/" + monthStr + "/" + year;

function checkAndAdd(url) {
  for (let i in trackedDomains) {
    if (trackedDomains[i].url == url) {
      return;
    }
  }
  trackedDomains.push({
    url: url,
    time: 0,
    activated: false,
    interval: null,
  });
}

function updateTime(i) {
  trackedDomains[i].time += 1;
}

function storeLocal(i) {
  let key = trackedDomains[i].url + ":" + dateStr;
  let value = trackedDomains[i].time;
  chrome.storage.local.set({ [key]: value });
}

function retrieveData() {
  chrome.storage.local.get(null, (result) => {
    for (let key in result) {
      let dateParts = key.split(":");
      let date = dateParts[dateParts.length - 1];
      if (date == dateStr) {
        let url = key.slice(0, -(date.length + 1));
        checkAndAdd(url);
      }
    }
  });
}

retrieveData();

function timeTracker() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    let domain = new URL(url).hostname;
    let domainExists = false;

    for (let i in trackedDomains) {
      if (domain == trackedDomains[i].url) {
        domainExists = true;
        if (trackedDomains[i].activated == false) {
          updateTimeAndStore(i);
          trackedDomains[i].interval = setInterval(() => {
            updateTimeAndStore(i);
          }, 1000);
          trackedDomains[i].activated = true;
          console.log("started tracking for", trackedDomains[i].url);
        }
      } else {
        clearInterval(trackedDomains[i].interval);
        trackedDomains[i].activated = false;
      }
    }

    if (!domainExists) {
      checkAndAdd(domain);
      let newIndex = trackedDomains.length - 1;
      updateTimeAndStore(newIndex);
      trackedDomains[newIndex].interval = setInterval(() => {
        updateTimeAndStore(newIndex);
      }, 1000);
      trackedDomains[newIndex].activated = true;
      console.log("New domain added and stored:", trackedDomains[newIndex].url);
    }
  });
}


function updateTimeAndStore(i) {
  updateTime(i);
  storeLocal(i);
}



chrome.tabs.onActivated.addListener(timeTracker);
chrome.tabs.onUpdated.addListener(timeTracker);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let link = request.link;
  chrome.tabs.create({ url: link });
  return true;
});



// let date = new Date();
// let date2 = new Date("01/19/2022");
// console.log(date2);
// let day = date.getDate();
// let year = date.getFullYear();
// console.log(date, day, year);

// let URList = [];
// let dayStr = day.toString();
// if (dayStr.length == 1) {
//   dayStr = "0" + dayStr;
// }

// let dateStr = dayStr + "/" + (date.getMonth() + 1) + "/" + year;

// function checkAndAdd(url) {
//   for (let i in URList) {
//     if (URList[i].url == url) {
//       return;
//     }
//   }
//   URList.push({
//     url: url,
//     time: 0,
//     activated: false,
//     interval: null,
//   });
// }

// function updateTime(i) {
//   URList[i].time += 1;
// }

// function storeLocal(i) {
//   let key = URList[i].url + ":" + dateStr;
//   let value = URList[i].time;
//   chrome.storage.local.set({ [key]: value });
// }

// function retrieveData() {
//   chrome.storage.local.get(null, (result) => {
//     for (let key in result) {
//       let dateParts = key.split(":");
//       let date = dateParts[dateParts.length - 1];
//       if (date == dateStr) {
//         let url = key.slice(0, -(date.length + 1));
//         checkAndAdd(url);
//       }
//     }
//   });
// }

// retrieveData();

// function timeTracker() {
//   chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
//     let url = tabs[0].url;
//     let domain = new URL(url).hostname;
//     let domainExists = false;

//     for (let i in URList) {
//       if (domain == URList[i].url) {
//         domainExists = true;
//         if (URList[i].activated == false) {
//           updateTime(i);
//           URList[i].interval = setInterval(() => {
//             updateTime(i);
//             storeLocal(i);
//           }, 1000);
//           URList[i].activated = true;
//           console.log("started tracking for", URList[i].url);
//         }
//       }
//     }

//     if (!domainExists) {
//       checkAndAdd(domain);
//       let newIndex = URList.length - 1;
//       storeLocal(newIndex);
//       console.log("New domain added and stored:", URList[newIndex].url);
//     }
//   });
// }

// chrome.tabs.onActivated.addListener(timeTracker);
// chrome.tabs.onUpdated.addListener(timeTracker);

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   let link = request.link;
//   chrome.tabs.create({ url: link });
//   return true;
// });


// ------
// let date = new Date();
// let date2 = Date("19/01/2022")
// console.log(date2)
// let day = date.getDate()
// let year = date.getFullYear();
// console.log(date, day, year)

// const URList = [
//   {
//     url: null,
//     activated: false,
//     time: 0,
//     interval: null,
//     lastUpdate: 0, // Ajout du champ lastUpdate
//   }
// ];

// function updateTime(n) {
//   const currentTime = performance.now();
//   const timeDifference = currentTime - URList[n].lastUpdate;
//   URList[n].time += timeDifference / 1000;
//   URList[n].lastUpdate = currentTime;

//   let seconds = Math.floor(URList[n].time);
//   let minutes = Math.floor(seconds / 60);
//   let hours = Math.floor(minutes / 60);

//   seconds %= 60;
//   minutes %= 60;

//   console.log('time increased for', URList[n].url, 'to', hours + " hours " + minutes + " minutes " + seconds + " seconds");
// }

// function storeLocal(n) {
//   let urlName = URList[n].url
//   urlName = JSON.stringify(urlName)
//   urlName = urlName.replace(/^"(.*)"$/, '$1')
//   urlName = urlName.split('.')
//   let urlGood = ''

//   let passedTime = 0
//   let dateObj = new Date();
//   let month = dateObj.getUTCMonth() + 1;
//   let day = dateObj.getUTCDate();
//   let year = dateObj.getUTCFullYear();
//   let date = ':' + year + "/" + month + "/" + day

//   if (urlName[0] == 'www'){
//     urlGood = urlName[1] + date
//   }
//   else if (urlName[0] != 'www'){
//     urlGood = urlName[0] + date
//   }

//   chrome.storage.local.get(urlGood).then((result) => {
//     if (result[urlGood] > 0){
//       passedTime = result[urlGood]
//     }
//     let totalTime = URList[n].time + passedTime

//     chrome.storage.local.set({ [urlGood]: totalTime }).then(() => {
//         URList[n].time = 0
//         console.log('temps passé sauvegardé :', urlGood, totalTime)
//     });
//   });
// }

// async function timeTracker() {

//   detectURL();
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions);
//   let url = tab.url;
//   let urlObject = new URL(url);
//   let domain = urlObject.hostname;

//   console.log(tab)

//   for (let i in URList) {
//     if (domain == URList[i].url && URList[i].activated == false) {
//       updateTime(i); // Ajouté pour mettre à jour le temps avant de commencer l'intervalle
//       URList[i].interval = setInterval(function () {
//         updateTime(i); // Remplacez counter(i) par updateTime(i)
//       }, 500);
//       URList[i].activated = true;
//       console.log('interval activated for', URList[i].url);
//     } else if (domain != URList[i].url) {
//       URList[i].activated = false;
//       clearInterval(URList[i].interval);
//       updateTime(i); // Ajouté pour mettre à jour le temps avant de sauvegarder
//       storeLocal(i);
//       console.log('interval deactivated for', URList[i].url);
//     }
//   }

//   chrome.storage.local.get().then((result) => {
//     console.log('result', result)
//   });
// };


// async function detectURL() {
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions);

//   let url = tab.url;
//   let urlObject = new URL(url);
//   let domain = urlObject.hostname;
//   let checkCorrespondance = false

//   for (i in URList) {
//     if (domain == URList[i].url) {
//       checkCorrespondance = true;
//     }
//   }

//   if (checkCorrespondance == false && domain != "newtab" && domain != 'extensions'){
//     URList.push({
//       url: domain,
//       activated: false,
//       time: 0,
//       interval: null,
//       lastUpdate: performance.now() // Ajout du champ lastUpdate lors de la création de l'élément
//     });
//     checkCorrespondance = false;
//   };

//   console.log('URList', URList);
// };

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log('bien reçu');
//     let link = request.link;
//     chrome.tabs.create({ url: link })
//     return true;
//   }
// );

// chrome.tabs.onActivated.addListener(timeTracker);
// chrome.tabs.onUpdated.addListener(timeTracker);


// let date = new Date();
// let date2 = Date("19/01/2022")
// console.log(date2)
// let day = date.getDate()
// let year = date.getFullYear();
// console.log(date, day, year)

// const URList = [
//   {
//     url: null,
//     activated: false,
//     time: 0,
//     interval: null,
//   }
// ];

// function counter(n) {
//   URList[n].time+=0.5;  
//   console.log('time increased for', URList[n].url, 'to', URList[n].time);
// }

// function storeLocal(n) {
//   let urlName = URList[n].url
//   urlName = JSON.stringify(urlName)
//   urlName = urlName.replace(/^"(.*)"$/, '$1')
//   urlName = urlName.split('.')
//   let urlGood = ''

//   let passedTime = 0
//   let dateObj = new Date();
//   let month = dateObj.getUTCMonth() + 1;
//   let day = dateObj.getUTCDate();
//   let year = dateObj.getUTCFullYear();
//   let date = ':' + year + "/" + month + "/" + day
  

//   if (urlName[0] == 'www'){
//     urlGood = urlName[1] + date
//   }
//   else if (urlName[0] != 'www'){
//     urlGood = urlName[0] + date
//   }
  
//   chrome.storage.local.get(urlGood).then((result) => {
//     if (result[urlGood] > 0){
//       passedTime = result[urlGood]
//     }    
//     let totalTime = URList[n].time + passedTime

//     chrome.storage.local.set({ [urlGood]: totalTime }).then(() => {
//         URList[n].time = 0
//         console.log('temps passé sauvegardé :', urlGood, totalTime)
//     });
//   });
// }

// async function timeTracker() {

//   detectURL();
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions);
//   let url = tab.url;
//   let urlObject = new URL(url);
//   let domain = urlObject.hostname;

//   console.log(tab)
  
//   for (let i in URList) {
//     if (domain == URList[i].url && URList[i].activated == false) {
//       URList[i].interval = setInterval(function () {
//         counter(i);
//       }, 500);
//       URList[i].activated = true;
//       console.log('interval activated for', URList[i].url);
//     } else if (domain != URList[i].url) {
//       URList[i].activated = false;
//       clearInterval(URList[i].interval);
//       storeLocal(i);
//       console.log('interval deactivated for', URList[i].url);
//     }
//   }
  
//   chrome.storage.local.get().then((result) => {
//     console.log('result', result)
//   });
// };

// async function detectURL() {
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions);

//   let url = tab.url;
//   let urlObject = new URL(url);
//   let domain = urlObject.hostname;
//   let checkCorrespondance = false
//   for (i in URList) {
//     if (domain == URList[i].url) {
//       checkCorrespondance = true;
//     }
//   }

//   if (checkCorrespondance == false && domain != "newtab" && domain != 'extensions'){
//     URList.push({
//       url: domain,
//       activated: false,
//       time: 0,
//       interval: null }
//     );
//     checkCorrespondance = false;
//   };

//   console.log('URList', URList);
// };

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log('bien reçu');
//     let link = request.link;
//     chrome.tabs.create({ url: link })
//     return true;
//   }
// );

// chrome.tabs.onActivated.addListener(timeTracker);
// chrome.tabs.onUpdated.addListener(timeTracker);