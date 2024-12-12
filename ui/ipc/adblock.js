const { session } = require("electron");
const { ElectronBlocker } = require("@ghostery/adblocker-electron");
const fetch = require("cross-fetch");

let adblockerEnabled = true;
let blocker;

async function initializeAdblocker() {
  try {
    blocker = await ElectronBlocker.fromLists(fetch, [
      "https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_18_Annoyances_Cookies/filter.txt",
      "https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_19_Annoyances_Popups/filter.txt",
      "https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_17_TrackParam/filter.txt",
      "https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_3_Spyware/filter.txt",
      "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=1&mimetype=plaintext",
      "https://raw.githubusercontent.com/xd4rker/MinerBlock/master/assets/filters.txt",
      "https://secure.fanboy.co.nz/fanboy-cookiemonster.txt",
      "https://easylist.to/easylist/easyprivacy.txt",
      "https://easylist.to/easylist/easylist.txt",
      "https://stanev.org/abp/adblock_bg.txt",
      "https://pastebin.com/raw/Yi8kSPta",
      "https://pastebin.com/raw/RM33Eegi",
    ]);
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