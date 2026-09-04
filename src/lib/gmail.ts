export interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  body?: string;
  isUnread?: boolean;
  labels?: string[];
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

// Client helper for Google OAuth Access Token with Gmail Scopes
export async function getGoogleAccessToken(interactive: boolean = true): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if google accounts library is available
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      // If script is not yet loaded, wait or reject
      return reject(new Error('Google Identity Services nie je načítané.'));
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: '632964749142-fuqvd930c744fhir9pscc0k0kpkjaomn.apps.googleusercontent.com',
        scope: [
          'https://mail.google.com/',
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/gmail.compose'
        ].join(' '),
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            sessionStorage.setItem('usc_gmail_access_token', tokenResponse.access_token);
            resolve(tokenResponse.access_token);
          } else if (tokenResponse && tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
          } else {
            reject(new Error('Nepodarilo sa získať prístupový token pre Gmail.'));
          }
        },
        error_callback: (error: any) => {
          reject(error);
        }
      });

      if (interactive) {
        client.requestAccessToken({ prompt: 'consent' });
      } else {
        client.requestAccessToken({ prompt: '' });
      }
    } catch (e) {
      reject(e);
    }
  });
}

// Fetch list of messages
export async function fetchGmailMessages(accessToken: string, query: string = '', maxResults: number = 20): Promise<GmailMessage[]> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  if (query) url.searchParams.append('q', query);
  url.searchParams.append('maxResults', maxResults.toString());

  const listRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    if (listRes.status === 401) {
      sessionStorage.removeItem('usc_gmail_access_token');
    }
    const err = await listRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail API Error (${listRes.status})`);
  }

  const listData = await listRes.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch detail for first 15 messages in parallel
  const details = await Promise.all(
    listData.messages.slice(0, 15).map(async (item: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!detailRes.ok) return null;
        const msg = await detailRes.json();

        const headers: Record<string, string> = {};
        msg.payload?.headers?.forEach((h: { name: string; value: string }) => {
          headers[h.name.toLowerCase()] = h.value;
        });

        // Extract body text
        let body = '';
        if (msg.snippet) {
          body = msg.snippet;
        }

        const isUnread = msg.labelIds?.includes('UNREAD');

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet,
          subject: headers['subject'] || '(Bez predmetu)',
          from: headers['from'] || 'Neznámy odosielateľ',
          to: headers['to'] || '',
          date: headers['date'] || '',
          body,
          isUnread,
          labels: msg.labelIds || []
        } as GmailMessage;
      } catch (err) {
        return null;
      }
    })
  );

  return details.filter((m): m is GmailMessage => m !== null);
}

// Send Email via Gmail API
export async function sendGmailMessage(accessToken: string, payload: SendEmailPayload): Promise<{ id: string }> {
  // Construct RFC 2822 formatted raw message
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`;
  const messageParts = [
    `To: ${payload.to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    payload.body
  ];
  const message = messageParts.join('\r\n');

  // Base64url encode
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email (${res.status})`);
  }

  return await res.json();
}
