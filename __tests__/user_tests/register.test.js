import request from "supertest";
import app from "../../src/app.js"; // Importing Express app instance
import User from "../../src/models/index.js"; // Importing User model

describe("Register Controller", () => {
  // Mocking the User.exists method
  jest.mock("../../../../models/index.js", () => ({
    User: {
      exists: jest.fn(),
      startSession: jest.fn(),
    },
  }));

  it("should return 400 if input validation fails", async () => {
    const invalidUserData = {
      email: "example@example.com",
      password: "password123",
      name: "John Doe",
      role: "Student",
    };

    const response = await request(app).post("/register").send(invalidUserData);

    expect(response.statusCode).toBe(400);
    // Add more assertions for error details if needed
  });

  it("should return 409 if user already exists", async () => {
    User.exists.mockResolvedValue(true);

    const existingUserData = {
      email: "example@example.com",
      password: "password123",
      name: "John Doe",
      role: "Student",
    };

    const response = await request(app)
      .post("/register")
      .send(existingUserData);

    expect(response.statusCode).toBe(409);
    expect(response.body).toEqual({
      resultMessage: {
        en: "An account with this email address already exists.",
      },
      resultCode: "00032",
    });
  });

  it("should successfully register a new user", async () => {
    User.exists.mockResolvedValue(false);

    const newUser = {
      email: "abc@example.com",
      password: "ab11cd22",
      name: "User ABC",
      role: "Student",
    };

    // Mocking the save method of the User model
    const savedUser = {
      ...newUser,
      password: null, 
      _id: expect.any(String),  
      __v: 0,
    };

    User.prototype.save = jest.fn().mockResolvedValue(savedUser);

    const response = await request(app).post("/register").send(newUser);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      resultMessage: {
        en: "You registered successfully.",
      },
      resultCode: "00035",
      saveduser: savedUser,
    });
  });

  it("should handle database errors", async () => {
    User.exists.mockRejectedValue(new Error("Database error"));

    const newUser = {
      // New user data here
    };

    const response = await request(app).post("/register").send(newUser);

    expect(response.statusCode).toBe(500);
    // Add more assertions for error handling details if needed
  });

  // Add more test cases for other scenarios as needed
});
