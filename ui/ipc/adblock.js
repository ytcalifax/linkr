const { session } = require("electron");
const { ElectronBlocker } = require("@ghostery/adblocker-electron");
const fetch = require("cross-fetch");

let adblockerEnabled = true;
let blocker;

async function fetchAdblockLists() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/ytcalifax/linkr/refs/heads/main/.data/adblock.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch adblock lists: ${response.statusText}`);
    }
    const data = await response.json();
    return data.lists;
  } catch (error) {
    console.error("Error fetching adblock lists:", error);
    return [];
  }
}

async function initializeAdblocker() {
  try {
    const adblockLists = await fetchAdblockLists();
    blocker = await ElectronBlocker.fromLists(fetch, adblockLists);
    blocker.enableBlockingInSession(session.defaultSession);
  } catch (error) {
    console.error("Failed to enable ad blocker:", error);
  }
}

function toggleAdblocker(event) {
  adblockerEnabled = !adblockerEnabled;
  if (adblockerEnabled) {
    blocker.enableBlockingInSession(session.defaultSession);
  } else {
    blocker.disableBlockingInSession(session.defaultSession);
  }
  event.sender.send("update-adblock-icon", adblockerEnabled);
}

module.exports = {
  initializeAdblocker,
  toggleAdblocker,
};
