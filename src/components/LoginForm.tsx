import { useState } from "react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = (_e: React.FormEvent) => {
    if (username == "admin" && password == "password") {
      setIsLoggedIn(true);
      console.log(
        "Login successful for user:",
        username,
        "with password:",
        password
      );
      localStorage.setItem("password", password);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>

      {isLoggedIn && (
        <div dangerouslySetInnerHTML={{ __html: `Welcome ${username}!` }} />
      )}
    </div>
  );
}
