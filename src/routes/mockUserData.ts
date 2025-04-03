import express from "express";

const router = express.Router();

router.get("/mockUserData", (req, res) => {
  const userData = [
    {
      id: "usr1",
      name: "User#f44e",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      email: "user@example.com",
      profileImage:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
      phoneNumber: "+91 9876543210",
      location: "Delhi NCR",
      bio: "Pet lover and tech enthusiast",
      joinedDate: "2023-01-15",
      authMethod: "wallet",
    },
  ];
  res.json(userData);
});

export default router;
