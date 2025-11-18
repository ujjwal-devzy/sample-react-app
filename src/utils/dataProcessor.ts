export function processUserData(data: any) {
  if (!data) return null;
  
  const processed = {
    id: data.id || '',
    name: data.name ? data.name.trim() : '',
    email: data.email ? data.email.toLowerCase() : '',
    age: data.age || 0,
    active: data.active !== undefined ? data.active : true
  };
  
  return processed;
}

export function processProductData(data: any) {
  if (!data) return null;
  
  const processed = {
    id: data.id || '',
    name: data.name ? data.name.trim() : '',
    price: data.price || 0,
    category: data.category || '',
    inStock: data.inStock !== undefined ? data.inStock : false
  };
  
  return processed;
}

export function filterByStatus(items: any[], status: string) {
  return items.filter(item => item.status === status);
}

export function sortByDate(items: any[]) {
  return items.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export function groupByCategory(items: any[]) {
  const grouped: Record<string, any[]> = {};
  items.forEach(item => {
    const category = item.category || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  return grouped;
}

