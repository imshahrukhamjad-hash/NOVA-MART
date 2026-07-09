import { useEffect, useState } from "react";
import axios from "axios";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/users").then(res => {
      const sortedUsers = res.data.sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return 0;
      });
      setUsers(sortedUsers);
    });
  }, []);

  const remove = async (id) => {
    await axios.delete(`/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-white">
        Users Management
      </h2>

      <div className="space-y-3">
        {users.map(u => (
          <div
            key={u._id}
            className={`flex items-center justify-between p-4 rounded-xl
              bg-neutral-900 border border-neutral-800`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-white">
                {u.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-medium text-white">{u.name}</p>
                <p className="text-sm text-neutral-400">{u.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium
                  ${u.role === "admin"
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "bg-neutral-700 text-neutral-300"
                  }`}
              >
                {u.role === "admin" ? "ADMIN" : "USER"}
              </span>

              {u.role !== "admin" && (
                <button
                  onClick={() => remove(u._id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
