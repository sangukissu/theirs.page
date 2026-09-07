/* eslint-disable no-restricted-globals */
/// <reference lib="webworker" />

// Official @uppy/golden-retriever Service Worker implementation
// Retains Blob references across page navigations and accidental refreshes.
const fileCache = Object.create(null)

function getCache(name) {
  fileCache[name] ??= Object.create(null)
  return fileCache[name]
}

self.addEventListener("install", (event) => {
  event.waitUntil(Promise.resolve().then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

function sendMessageToAllClients(msg) {
  self.clients.matchAll().then((clientList) => {
    clientList.forEach((client) => {
      client.postMessage(msg)
    })
  })
}

function addFile(store, file) {
  getCache(store)[file.id] = file.data
}

function removeFile(store, fileID) {
  delete getCache(store)[fileID]
}

function getFiles(store) {
  sendMessageToAllClients({
    type: "uppy/ALL_FILES",
    store,
    files: getCache(store),
  })
}

self.addEventListener("message", (event) => {
  const data = event.data
  switch (data?.type) {
    case "uppy/ADD_FILE":
      addFile(data.store, data.file)
      break
    case "uppy/REMOVE_FILE":
      removeFile(data.store, data.fileID)
      break
    case "uppy/GET_FILES":
      getFiles(data.store)
      break
    default:
      break
  }
})
