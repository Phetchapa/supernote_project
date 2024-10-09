'use client'
import { useEffect, useState } from 'react';

const CLIENT_ID = '78626695946-f861c51cvg609njs2r5vso6h1ngrdbc1.apps.googleusercontent.com'; // Replace with your actual client ID
const API_KEY = 'AIzaSyA-dzfCoji7HRgnTpVCc1NRvycA8yLyUQ4'; // Replace with your actual API key
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

export default function Home() {
    const [tokenClient, setTokenClient] = useState(null);
    const [gapiInited, setGapiInited] = useState(false);
    const [gisInited, setGisInited] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const gapiLoaded = () => {
            window.gapi.load('client', initializeGapiClient);
        };

        const gisLoaded = () => {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: () => {
                    if (client.error) {
                        console.error(client.error);
                    }
                    setIsAuthorized(true);
                    document.getElementById('event-form').style.visibility = 'visible';
                },
            });
            setTokenClient(client);
            setGisInited(true);
            maybeEnableButtons();
        };

        const initializeGapiClient = async () => {
            await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
            setGapiInited(true);
            maybeEnableButtons();
        };

        const maybeEnableButtons = () => {
            if (gapiInited && gisInited) {
                document.getElementById('authorize_button').style.visibility = 'visible';
            }
        };

        // Load scripts
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = gapiLoaded;
        document.body.appendChild(gapiScript);

        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;
        gisScript.onload = gisLoaded;
        document.body.appendChild(gisScript);
    }, [gapiInited, gisInited]);

    const handleAuthClick = () => {
        if (!tokenClient) return;
        tokenClient.requestAccessToken({ prompt: 'consent' });
    };

    const handleSignoutClick = () => {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token, () => {
                console.log('Token revoked.');
            });
            gapi.client.setToken('');
            document.getElementById('content').innerText = '';
            setIsAuthorized(false);
            document.getElementById('event-form').style.visibility = 'hidden';
        }
    };

    const submitEvent = async (event) => {
        event.preventDefault(); // Prevent form submission

        const summary = document.getElementById('summary').value;
        const description = document.getElementById('description').value;

        const startDateTime = new Date(document.getElementById('start').value);
        const endDateTime = new Date(document.getElementById('end').value);

        const formattedStart = startDateTime.toISOString();
        const formattedEnd = endDateTime.toISOString();

        const eventData = {
            summary: summary,
            location: '',
            description: description,
            start: {
                dateTime: formattedStart,
                timeZone: 'Asia/Bangkok',
            },
            end: {
                dateTime: formattedEnd,
                timeZone: 'Asia/Bangkok',
            },
            attendees: [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        try {
            const request = await window.gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: eventData,
            });
            const response = await request;
            document.getElementById('content').innerText = 'Event created: ' + response.result.htmlLink;
        } catch (error) {
            document.getElementById('content').innerText = 'Error: ' + error.message;
            console.error('API Error:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-xl font-bold">Google Calendar API Quickstart</h1>
            <button
                id="authorize_button"
                onClick={handleAuthClick}
                className="mt-4 p-2 bg-blue-500 text-white rounded"
            >
                Authorize
            </button>
            <button
                id="signout_button"
                onClick={handleSignoutClick}
                className="mt-4 p-2 bg-red-500 text-white rounded"
                style={{ visibility: isAuthorized ? 'visible' : 'hidden' }}
            >
                Sign Out
            </button>
            <h2 className="mt-6 text-lg">Add Event</h2>
            <form id="event-form" onSubmit={submitEvent} className="mt-4" style={{ visibility: isAuthorized ? 'visible' : 'hidden' }}>
                <label htmlFor="summary" className="block">Summary:</label>
                <input type="text" id="summary" required className="border p-2 w-full" /><br /><br />

                <label htmlFor="description" className="block">Description:</label>
                <input type="text" id="description" className="border p-2 w-full" /><br /><br />

                <label htmlFor="start" className="block">Start:</label>
                <input type="datetime-local" id="start" required className="border p-2 w-full" /><br /><br />

                <label htmlFor="end" className="block">End:</label>
                <input type="datetime-local" id="end" required className="border p-2 w-full" /><br /><br />

                <input type="submit" value="Add Event" className="mt-2 p-2 bg-green-500 text-white rounded" />
            </form>

            <pre id="content" className="mt-4" style={{ whiteSpace: 'pre-wrap' }}></pre>
        </div>
    );
}
