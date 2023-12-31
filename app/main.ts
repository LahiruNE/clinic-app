import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DataSource } from 'typeorm';
import { Patient } from '../src/data/models/patient-schema.model';
import { User } from '../src/data/models/user-schema.model';

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

async function createWindow(): Promise<BrowserWindow> {
  const AppDataSource = new DataSource({
    type: 'sqlite',
    synchronize: true,
    logging: true,
    logger: 'simple-console',
    database: './src/data/database/clinic-app-db.db',
    entities: [Patient, User],
  });

  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!")
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err)
    })

  const patientRepo = AppDataSource.getRepository(Patient);
  const userRepo = AppDataSource.getRepository(User);

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.webContents.openDevTools();

  ipcMain.on('authenticate', async (event: any, ...args: any[]) => {
    try {
      const result = await userRepo.findOne({ where: { username: args[0], password: args[1] }});
      event.returnValue = result;
    } catch (err) {
      throw err;
    }
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
