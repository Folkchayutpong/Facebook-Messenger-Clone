const request = require("supertest");
const server = require("../../server");
const userService = require("./user.service");
const jwt = require("jsonwebtoken");
const { redisClient } = require("../../config/redis");
const zxcvbn = require("zxcvbn");

jest.mock("./user.service");
jest.mock("zxcvbn");

const tokenPayload = {
  id: "507f191e810c19729de860ea",
  email: "test@example.com",
};

beforeAll(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
  await redisClient.set(`token:${tokenPayload.id}`, token);
}, 10000);

afterAll(async () => {
  await redisClient.del(`token:${tokenPayload.id}`);
  await redisClient.quit();
}, 10000);

describe("POST /api/user/register", () => {
  it("should return 201 if registration is successful", async () => {
    zxcvbn.mockImplementation(() => ({
      score: 4,
      feedback: { suggestions: [] },
    }));

    userService.registerService.mockResolvedValue({
      email: "test@example.com",
      username: "testuser",
    });

    const res = await request(server).post("/api/user/register").send({
      email: "test@example.com",
      username: "testuser",
      password: "strongpassword123!",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("email", "test@example.com");
    expect(res.body).toHaveProperty("username", "testuser");
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(server).post("/api/user/register").send({
      email: "invalidemail",
      username: "testuser",
      password: "strongpassword123!",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid or missing email");
  });

  it("should return 400 if username is missing", async () => {
    const res = await request(server).post("/api/user/register").send({
      email: "test@example.com",
      username: "",
      password: "strongpassword123!",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing username or password");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(server).post("/api/user/register").send({
      email: "test@example.com",
      username: "testuser",
      password: "",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing username or password");
  });

  it("should return 400 if password is weak", async () => {
    zxcvbn.mockImplementation(() => ({
      score: 1,
      feedback: { suggestions: ["Add more characters", "Use symbols"] },
    }));
    const res = await request(server).post("/api/user/register").send({
      email: "test@example.com",
      username: "testuser",
      password: "weakpassword",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Weak password");
  });

  it("should return 500 if registerService throws an error", async () => {
    zxcvbn.mockImplementation(() => ({
      score: 4,
      feedback: { suggestions: [] },
    }));

    userService.registerService.mockImplementation(() => {
      throw new Error("Database connection failed");
    });

    const res = await request(server).post("/api/user/register").send({
      email: "fail@example.com",
      username: "failuser",
      password: "StrongPassword123!",
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Database connection failed");
  });
});

describe("POST /api/user/login", () => {
  userService.registerService.mockResolvedValue({
    email: "testlogin@example.com",
    username: "testuser",
  });

  it("should login a user", async () => {
    userService.loginService.mockResolvedValue({
      email: "testlogin@example.com",
      username: "testuser",
      Token: "mockedToken",
    });

    const res = await request(server).post("/api/user/login").send({
      email: "testlogin@example.com",
      password: "testpassword",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("Token");
    expect(res.body).toHaveProperty("username", "testuser");
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(server).post("/api/user/login").send({
      email: "invalidemail",
      password: "testpassword",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid or missing email");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(server).post("/api/user/login").send({
      email: "testlogin@example.com",
      password: "",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Missing password");
  });

  it("should return 500 if login fails", async () => {
    userService.loginService.mockRejectedValue(new Error("Login failed"));

    const res = await request(server).post("/api/user/login").send({
      email: "testlogin@example.com",
      password: "testpassword",
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Login failed");
  });
});
