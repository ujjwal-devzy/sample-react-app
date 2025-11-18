interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export function transformUsers(users: User[]): UserSummary[] {
  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email
  }));
}

export function processUserData(users: User[]) {
  const results = {
    total: users.length,
    byAge: {} as Record<number, number>,
    emails: [] as string[],
    names: [] as string[]
  };

  users.forEach(user => {
    results.byAge[user.age] = (results.byAge[user.age] || 0) + 1;
  });

  users.forEach(user => {
    results.emails.push(user.email);
  });

  users.forEach(user => {
    results.names.push(user.name);
  });

  return results;
}

export function extractUserIds(users: User[]): number[] {
  const ids: number[] = [];
  users.forEach(user => {
    ids.push(user.id);
  });
  return ids;
}

