export function calculateTotalPrice(items: Array<{ price: number; quantity: number; discount?: number }>): number {
  let total = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const price = item.price;
    const quantity = item.quantity;
    
    let itemTotal = price * quantity;
    
    if (item.discount) {
      itemTotal = itemTotal - item.discount;
    }
    
    total += itemTotal;
  }
  
  return total;
}

export function calculateTax(amount: number, taxRate: number): number {
  return amount * taxRate;
}

export function findDuplicates(arr: number[]): number[] {
  const duplicates: number[] = [];
  
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  
  return duplicates;
}

export function divideNumbers(a: number, b: number): number {
  return a / b;
}

export function multiplyNumbers(a: number, b: number): number {
  return a * b;
}

