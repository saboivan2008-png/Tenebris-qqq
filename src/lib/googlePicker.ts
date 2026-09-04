import firebaseConfig from '../../firebase-applet-config.json';

export interface SelectedDriveFile {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
  mimeType: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  description?: string;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// Scopes required for Drive File & Picker access
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');

// Wait until gapi is loaded and initialize picker API
export async function loadGooglePickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window is not available.'));
    }

    const checkAndLoad = () => {
      if (window.gapi) {
        window.gapi.load('picker', {
          callback: () => resolve(),
          onerror: () => reject(new Error('Chyba pri načítavaní Google Picker API.'))
        });
      } else {
        setTimeout(checkAndLoad, 100);
      }
    };

    checkAndLoad();
  });
}

// Request OAuth 2.0 Access token with Google Drive scopes
export async function getDriveAccessToken(interactive: boolean = true): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      return reject(new Error('Google Identity Services (GSI) knižnica nie je načítaná.'));
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: DRIVE_SCOPES,
        callback: (response: any) => {
          if (response && response.access_token) {
            sessionStorage.setItem('usc_drive_token', response.access_token);
            resolve(response.access_token);
          } else if (response && response.error) {
            reject(new Error(response.error_description || response.error));
          } else {
            reject(new Error('Nepodarilo sa získať Google Drive token.'));
          }
        },
        error_callback: (err: any) => reject(err),
      });

      if (interactive) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch (err) {
      reject(err);
    }
  });
}

export interface LaunchPickerOptions {
  onSelect: (files: SelectedDriveFile[]) => void;
  onCancel?: () => void;
  allowedMimeTypes?: string;
  multiSelect?: boolean;
}

// Open Google Picker modal
export async function openGoogleDrivePicker(options: LaunchPickerOptions): Promise<void> {
  await loadGooglePickerApi();

  let accessToken = sessionStorage.getItem('usc_drive_token');
  if (!accessToken) {
    accessToken = await getDriveAccessToken(true);
  }

  const { google } = window;
  if (!google || !google.picker) {
    throw new Error('Google Picker API nie je pripravené.');
  }

  // Extract numeric project number / sender ID from appId or messagingSenderId
  const appId = firebaseConfig.messagingSenderId || firebaseConfig.projectId;
  const apiKey = firebaseConfig.apiKey;

  // Configure views
  const docsView = new google.picker.DocsView(google.picker.ViewId.DOCS)
    .setIncludeFolders(true)
    .setSelectFolderEnabled(false);

  if (options.allowedMimeTypes) {
    docsView.setMimeTypes(options.allowedMimeTypes);
  }

  const uploadView = new google.picker.DocsUploadView();

  const pickerBuilder = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .setAppId(appId)
    .setOAuthToken(accessToken)
    .addView(docsView)
    .addView(uploadView)
    .setDeveloperKey(apiKey)
    .setTitle('Vyberte dokumenty a zmluvy z Google Drive (U.S.C.)')
    .setCallback((data: any) => {
      if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
        const docs = data[google.picker.Response.DOCUMENTS] || [];
        const files: SelectedDriveFile[] = docs.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          url: doc.url,
          iconUrl: doc.iconUrl,
          mimeType: doc.mimeType,
          sizeBytes: doc.sizeBytes,
          lastEditedUtc: doc.lastEditedUtc,
          description: doc.description
        }));
        options.onSelect(files);
      } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
        if (options.onCancel) options.onCancel();
      }
    });

  if (options.multiSelect !== false) {
    pickerBuilder.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
  }

  const picker = pickerBuilder.build();
  picker.setVisible(true);
}
