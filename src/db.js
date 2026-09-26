import {openDB} from 'idb'


export const dbPromise = openDB('local-vault', 1, {
    upgrade(db) {
        db.createObjectStore('files', {
            keyPath: 'id'
        })
    }
})

export const addFile = async (entry) => {
  console.log("saving", entry);
  const db = await dbPromise;
  await db.put('files', entry);
  console.log('file stored successfully');
}


const getAllFiles = async ()=>{
    const db = await dbPromise;
    const files = await db.getAll('files');
    return files;
}

export { getAllFiles };

dbPromise.then(()=>{
    console.log("Db created sucessfully");
    
})