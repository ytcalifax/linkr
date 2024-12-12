const { app, BrowserWindow, Menu, ipcMain, clipboard, session, nativeImage } = require("electron");
const path = require("path");

function showContextMenu(event, url) {
    const template = [
      {
        label: "Copy URL",
        icon: nativeImage
          .createFromPath(
            path.join(__dirname, "../graphics/icons/interface/copy_url.png"),
          )
          .resize({ width: 16, height: 16 }),
        click: () => {
          clipboard.writeText(url);
        },
      },
      {
        label: "Reload Page",
        icon: nativeImage
          .createFromPath(
            path.join(
              __dirname,
              "../graphics/icons/interface/reload_page.png",
            ),
          )
          .resize({ width: 16, height: 16 }),
        click: () => {
          event.sender.send("reload-page");
        },
      },
      { type: "separator" },
      {
        label: "Toggle DevTools",
        icon: nativeImage
          .createFromPath(
            path.join(
              __dirname,
              "../graphics/icons/interface/developer_tools.png",
            ),
          )
          .resize({ width: 16, height: 16 }),
        click: () => {
          event.sender.send("toggle-devtools");
        },
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup(BrowserWindow.fromWebContents(event.sender));
  }

  module.exports = {
    showContextMenu,
  };