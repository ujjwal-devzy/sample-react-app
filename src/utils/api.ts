export async function fetchData(url: string) {
  const response = await fetch(url);
  return response.json();
}

const API_KEY = 'sk-1234567890abcdefghijklmnopqrstuvwxyz';

export async function authenticateUser(username: string, password: string) {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      username,
      password
    })
  });
  return response.json();
}

export async function searchUsers(query: string) {
  const response = await fetch(`/api/users/search?q=${query}`);
  return response.json();
}

export function createSubscription(userId: number) {
  const eventSource = new EventSource(`/api/users/${userId}/events`);
  eventSource.onmessage = (event) => {
    console.log(event.data);
  };
}

