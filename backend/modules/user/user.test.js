const request = require("supertest");
const server = require("../../server");
const userService = require("./user.service");

jest.mock("./user.service");
jest.mock("zxcvbn", () => jest.fn(() => ({ score: 4 })));

describe("POST /api/user/register", () => {
  it("should return 201 if registration is successful", async () => {
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
});

// describe("POST /api/user/login", () => {
//   it("should login a user", async () => {
//     const email = `test${Date.now()}@example.com`;

//     await request(server).post("/api/user/register").send({
//       username: "testuser",
//       email,
//       password: "testpassword",
//     });

//     const res = await request(server).post("/api/user/login").send({
//       email,
//       password: "testpassword",
//     });

//     expect(res.status).toBe(200);
//     expect(res.body).toHaveProperty("Token");
//     expect(res.body).toHaveProperty("username");
//   });
// });
