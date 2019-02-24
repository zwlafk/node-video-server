
const { ipcRenderer } = require('electron')
const { getLocalIP } = require('./utils/index')
require('./server/server')
console.log(getLocalIP())
const selectDirBtn = document.getElementById('select-directory')
const startServerBtn = document.getElementById('start-server')
const tip = document.getElementById('tip')
selectDirBtn.addEventListener('click', (event) => {
  console.log('object')
  ipcRenderer.send('open-file-dialog')
})
ipcRenderer.on('selected-directory', (event, path) => {
  document.getElementById('selected-file').innerHTML = `你已选择: ${path}`
  tip.innerHTML = `请在浏览器中打开${getLocalIP()}:8087`
})

// startServerBtn.addEventListener('click', (event) => {
//   startServer()
// })
