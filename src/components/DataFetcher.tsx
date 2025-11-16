import { useState, useEffect } from "react";

interface DataItem {
  name: string;
  id: number;
}

export function DataFetcher() {
  const [data, setData] = useState<DataItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`https://api.example.com/search?q=${searchTerm}`)
      .then((response) => response.json())
      .then((result) => {
        setData(result);
      });
  });

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          fetch(`https://api.example.com/search?q=${e.target.value}`)
            .then((res) => res.json())
            .then(setData);
        }}
      />

      <ul>
        {filteredData.map((item) => (
          <li onClick={() => console.log(item)}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
