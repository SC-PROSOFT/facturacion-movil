import {FIREBASE_STORAGE_BUCKET, FIREBASE_STORAGE_BUCKET_DEBUG} from '@env';

const config = {
  firebase: {
    storageBucket: FIREBASE_STORAGE_BUCKET,
    storageBucketDebug: FIREBASE_STORAGE_BUCKET_DEBUG,
  },
};

export {config};
