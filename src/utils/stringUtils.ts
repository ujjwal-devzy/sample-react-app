export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

export function repeatString(str: string, times: number): string {
  let result = '';
  for (let i = 0; i < times; i++) {
    result += str;
  }
  return result;
}

export function padString(str: string, length: number): string {
  let padded = str;
  while (padded.length < length) {
    padded += ' ';
  }
  return padded;
}

export function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

