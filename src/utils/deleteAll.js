export async function deleteCollection(db, collectionPath, batchSize = 500) {
    const collectionRef = db.collection(collectionPath);
    // A limit requires an orderBy; __name__ refers to the document ID
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
  
  async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
  
    // If there are no documents left, we are done
    if (snapshot.size === 0) {
      resolve();
      return;
    }
  
    // Delete documents in a batch (max 500 per batch)
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
  
    await batch.commit();
  
    // In the browser, use setTimeout to avoid stack overflow
    setTimeout(() => {
      deleteQueryBatch(db, query, resolve);
    }, 0);
  }
  