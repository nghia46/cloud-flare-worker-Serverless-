export interface Env {
  DB: any; // Database binding (you may want to specify the type of DB connection you are using)
}

interface User {
  id?: number;
  name: string;
  age: number;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);

    if (pathname === "/user") {
      // READ operation: Get all users
      if (request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM users").all();
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    if (pathname === "/user") {
      // CREATE operation: Add a new user
      if (request.method === "POST") {
        try {
          const body: User = await request.json();
          const { name, age } = body;

          // Insert the new user, auto-incrementing the ID
          const result = await env.DB.prepare(
            "INSERT INTO users (name, age) VALUES (?, ?)"
          )
            .bind(name, age)
            .run();

          // Return the newly created user with the auto-generated ID
          return new Response(
            JSON.stringify({
              message: "User created successfully",
              user: { id: result.lastInsertRowid, name, age }, // lastInsertRowid gives us the auto-generated ID
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              message: "Error creating user",
              error: (error as Error).message,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // UPDATE operation: Update an existing user by ID
      if (request.method === "PUT") {
        try {
          const body: User = await request.json();
          const { id, name, age } = body;

          if (!id) {
            return new Response("User ID is required", { status: 400 });
          }

          // Prepare and execute the query to update the user
          await env.DB.prepare(
            "UPDATE users SET name = ?, age = ? WHERE id = ?"
          )
            .bind(name, age, id)
            .run();

          return new Response(
            JSON.stringify({ message: "User updated successfully" }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              message: "Error updating user",
              error: (error as Error).message,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // DELETE operation: Delete a user by ID
      if (request.method === "DELETE") {
        const id = searchParams.get("id");

        if (!id) {
          return new Response("User ID is required", { status: 400 });
        }

        try {
          // Prepare and execute the query to delete the user
          await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();

          return new Response(
            JSON.stringify({ message: "User deleted successfully" }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              message: "Error deleting user",
              error: (error as Error).message,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response("Hello World!");
  },
};
