import { useState, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";

interface DataItem {
  name: string;
  id: number;
}

export function DataFetcher() {
  const [data, setData] = useState<DataItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = (query: string) => {
    fetch(`https://api.example.com/search?q=${query}`)
      .then((response) => response.json())
      .then((result) => {
        setData(result);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const debouncedFetchData = useMemo(() => debounce(fetchData, 300), []);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetchData(searchTerm);
    }
  }, [searchTerm, debouncedFetchData]);

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul>
        {filteredData.map((item) => (
          <li key={item.id} onClick={() => console.log(item)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
