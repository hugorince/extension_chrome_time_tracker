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
