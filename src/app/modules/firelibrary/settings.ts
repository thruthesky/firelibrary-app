/**
 * @file settings.ts
 * @description This script file holds the settings of firelibrary.
 *
 */


let OSName = 'Unknown-OS';
if (navigator.userAgent.indexOf('Win') !== -1) {
    OSName = 'Windows';
} else if (navigator.userAgent.indexOf('Mac') !== -1) {
    OSName = 'Macintosh';
} else if (navigator.userAgent.indexOf('Linux') !== -1) {
    OSName = 'Linux';
} else if (navigator.userAgent.indexOf('Android') !== -1) {
    OSName = 'Android';
} else if (navigator.userAgent.indexOf('like Mac') !== -1) {
    OSName = 'iOS';
}

export const COLLECTION_ROOT = 'fire-library';

/**
 * Prefix for collection
 * @todo If you change the prefix, you need to update `Firestore Rules` accordingly.
 *
 */
// export const COLLECTION_DOMAIN = 'localhost';

export const COLLECTION_DOMAIN = OSName;
