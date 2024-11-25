const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
let mainWindow;

// Configurar la base de datos SQLite
const dbPath = path.join(app.getPath('userData'), 'furion.db');
// const dbPath = path.join(__dirname, 'furion.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('Conexión a SQLite establecida.');
    }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    fullscreen: false, // Abre la ventana en pantalla completa
    autoHideMenuBar: true, // Oculta automáticamente la barra de herramientas    
    width: 1000,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,      
    },
    icon: path.join(__dirname, 'assets/icons/icon.png') // Ruta al archivo de ícono
  });

  mainWindow.loadFile('index.html');

    // Crear una tabla si no existe
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          age INTEGER
      )`,
      (err) => {
          if (err) {
              console.error('Error al crear tabla:', err.message);
          } else {
              console.log('Tabla creada o ya existente.');
          }
      }
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// Manejar eventos para insertar y consultar datos
ipcMain.handle('insert-user', (event, user) => {
  return new Promise((resolve, reject) => {
      const query = `INSERT INTO users (name, age) VALUES (?, ?)`;
      db.run(query, [user.name, user.age], function (err) {
          if (err) {
              console.error('Error al insertar usuario:', err.message);
              reject(err);
          } else {
              resolve({ id: this.lastID });
          }
      });
  });
});

ipcMain.handle('get-users', () => {
  return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users`;
      db.all(query, [], (err, rows) => {
          if (err) {
              console.error('Error al obtener usuarios:', err.message);
              reject(err);
          } else {
              resolve(rows);
          }
      });
  });
});

app.on('window-all-closed', () => {
  db.close((err) => {
      if (err) {
          console.error('Error al cerrar la base de datos:', err.message);
      } else {
          console.log('Base de datos cerrada.');
      }
  });  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});