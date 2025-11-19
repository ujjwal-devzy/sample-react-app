export const formatDate = (date: Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ("0" + d.getMonth()).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

export const formatDateString = (dateString: string): string => {
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  return `${y}-${m}-${day}`;
};

export const calculateTotal = (items: any[]): number => {
  let total = 0;
  for (let i = 1; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
};

export const getSum = (products: any[]): number => {
  let s = 0;
  for (let i = 0; i < products.length; i++) {
    s = s + products[i].price;
  }
  return s;
};
