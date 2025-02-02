import BaseResponse from "../models/BaseResponse.model";
import Env from "../models/Env.model";
import User from "../models/user.model";

export default class UserService {
  private db: any;

  constructor(env: Env) {
    this.db = env.DB;
  }

  async getAllUsers(): Promise<BaseResponse<User[]>> {
    try {
      const { results } = await this.db.prepare("SELECT * FROM users").all();
      return BaseResponse.success(results);
    } catch (error) {
      return BaseResponse.error<User[]>("Error fetching users", error as any);
    }
  }

  async createUser(request: Request): Promise<BaseResponse<User>> {
    try {
      const { name, age }: User = await request.json();
      const result = await this.db
        .prepare("INSERT INTO users (name, age) VALUES (?, ?)")
        .bind(name, age)
        .run();
      return BaseResponse.success(
        { id: result.lastInsertRowid, name, age },
        "User created successfully"
      );
    } catch (error) {
      return BaseResponse.error<User>("Error creating user", error as any);
    }
  }

  async updateUser(request: Request): Promise<BaseResponse<User>> {
    try {
      const { id, name, age }: User = await request.json();
      if (!id) return BaseResponse.error<User>("User ID is required");
      // Check if user exist
      if (!(await this.IsUserExit(id))) {
        return BaseResponse.notFound<User>("User not found");
      }
      await this.db
        .prepare("UPDATE users SET name = ?, age = ? WHERE id = ?")
        .bind(name, age, id)
        .run();
      return BaseResponse.success(
        { id, name, age },
        "User updated successfully"
      );
    } catch (error) {
      return BaseResponse.error<User>("Error updating user", error as any);
    }
  }

  async deleteUser(
    searchParams: URLSearchParams
  ): Promise<BaseResponse<string>> {
    const id = searchParams.get("id");
    if (!id) return BaseResponse.error<string>("User ID is required");
    try {
      // Check if user exist
      if (!(await this.IsUserExit(id))) {
        return BaseResponse.notFound<string>("User not found");
      }
      // Delete user
      await this.db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
      return BaseResponse.success(
        "",
        "User deleted successfully user with ID: " + id
      );
    } catch (error) {
      return BaseResponse.error<string>("Error deleting user", error as any);
    }
  }
  async IsUserExit(id: any): Promise<boolean> {
    try {
      const { results } = await this.db
        .prepare("SELECT * FROM users WHERE id = ?")
        .bind(id)
        .all();
      if (results.length === 0) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
