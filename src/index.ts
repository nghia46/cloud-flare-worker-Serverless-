import Env from "./models/Env.model";
import UserService from "./services/user.service";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);
    const userService = new UserService(env);

    if (pathname === "/user") {
      switch (request.method) {
        case "GET":
          const users = await userService.getAllUsers();
          return new Response(JSON.stringify(users), {
            headers: { "Content-Type": "application/json" },
            status: users.statusCode || 200,
          });
        case "POST":
          const user = await userService.createUser(request);
          return new Response(JSON.stringify(user), {
            headers: { "Content-Type": "application/json" },
            status: user.statusCode || 200,
          });
        case "PUT":
          const updatedUser = await userService.updateUser(request);
          return new Response(JSON.stringify(updatedUser), {
            headers: { "Content-Type": "application/json" },
            status: updatedUser.statusCode || 200,
          });
        case "DELETE":
          const deletedUser = await userService.deleteUser(searchParams);
          return new Response(JSON.stringify(deletedUser), {
            headers: { "Content-Type": "application/json" },
            status: deletedUser.statusCode || 200,
          });
      }
    }
    return new Response("Not Found", { status: 404 });
  },
};
