'use strict'

import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron'

import config from '@utils/config'

let mainWindow
let tray
let windowCreatedCallback
let windowClosedCallback

const runID = Math.random().toString(36).substring(7)

export function initializeMainProcess(onWindowCreated, onWindowClosed) {
  windowCreatedCallback = onWindowCreated
  windowClosedCallback = onWindowClosed

  app.on('ready', () => {
    initializeTray()
    createWindow()
  })

  app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
    //   app.quit()
    // }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })  
}

function initializeTray() {
  var image = nativeImage.createFromDataURL(require(`@assets/icons/${config.role}/tray.png`))
  tray = new Tray(image)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Open ${config.appName}`,
      click() {
        if (mainWindow === null) {
          createWindow()
        } else {
          mainWindow.focus()
        }
      }
    },
    {
      label: 'Exit',
      click() {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  Menu.setApplicationMenu(Menu.buildFromTemplate( [{
    label: config.appName,
    submenu: [
        // { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
        // { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
  ]));
}

function createWindow () {
  const winURL = config.isDevelopment
  ? `http://localhost:${process.env.DEV_PORT}`
  : `file://${__dirname}/index.html`

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    title: config.appName,
    height: 350,
    width: 500,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    titleBarStyle: 'hidden'
  })
  mainWindow.runID = runID
  
  mainWindow.setTitle(config.appName);
  mainWindow.loadURL(winURL)

  if (config.isDevelopment) {
    mainWindow.webContents.openDevTools()  
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    if (windowClosedCallback) {
      windowClosedCallback()
    }
  })

  if (windowCreatedCallback) {
    windowCreatedCallback(mainWindow)
  }

  // eslint-disable-next-line no-console
  return mainWindow
}
