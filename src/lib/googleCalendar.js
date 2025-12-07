// Google Calendar API Configuration
export const GOOGLE_CONFIG = {
  clientId: '501215429458-7earm5sbfqlgk0ru15ou07rll23jrkmn.apps.googleusercontent.com',
  apiKey: 'AIzaSyCoN69ay8wqd4ApoMsZmeVx9qKDj8JPcdY',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  scopes: 'https://www.googleapis.com/auth/calendar.events'
}

let gapiLoaded = false
let gisLoaded = false
let tokenClient = null

// Load Google API script
export function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    if (gapiLoaded) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_CONFIG.apiKey,
            discoveryDocs: GOOGLE_CONFIG.discoveryDocs
          })
          gapiLoaded = true
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    }
    script.onerror = () => reject(new Error('Failed to load Google API'))
    document.body.appendChild(script)
  })
}

// Load Google Identity Services
export function loadGoogleIdentity() {
  return new Promise((resolve, reject) => {
    if (gisLoaded) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scopes,
        callback: '' // defined at request time
      })
      gisLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.body.appendChild(script)
  })
}

// Initialize both Google APIs
export async function initGoogleCalendar() {
  await Promise.all([loadGoogleAPI(), loadGoogleIdentity()])
}

// Request access token and execute callback
export function getAccessToken() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized'))
      return
    }

    tokenClient.callback = async (response) => {
      if (response.error) {
        reject(response)
        return
      }
      resolve(response.access_token)
    }

    // Check if we already have a valid token
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      tokenClient.requestAccessToken({ prompt: '' })
    }
  })
}

// Create a calendar event
export async function createCalendarEvent({ summary, description, startDateTime, endDateTime, location = '' }) {
  try {
    // Ensure APIs are loaded
    if (!gapiLoaded || !gisLoaded) {
      await initGoogleCalendar()
    }

    // Get access token
    await getAccessToken()

    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    }

    const request = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    })

    return request.result
  } catch (err) {
    console.error('Error creating calendar event:', err)
    throw err
  }
}

// Revoke access token (sign out)
export function revokeGoogleAccess() {
  const token = window.gapi.client.getToken()
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      window.gapi.client.setToken(null)
    })
  }
}
