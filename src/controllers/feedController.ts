import express, { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { FeedService, UserService } from "../services/index";
import { number } from "zod";
import { numeric } from "drizzle-orm/pg-core";

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  media?: { id: string; type: string; url: string }[];
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  type: string;
  pollOptions?: {
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }[];
  pollDuration?: number;
  expiresAt?: string;
  totalVotes?: number;
  userVoted?: boolean;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
  emergencyType?: string;
  petName?: string;
  lastSeen?: string;
  contactPhone?: string;
  emergencyImage?: string;
  isCritical?: boolean;
  campaignTitle?: string;
  campaignGoal?: number;
  currentAmount?: number;
  deadline?: string;
  campaignImage?: string;
  sponsorName?: string;
  sponsorLogo?: string;
  adLink?: string;
  adDescription?: string;
  volunteerRole?: string;
  eventDate?: string;
  location?: string;
  eventImage?: string;
}

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
  nextCursor?: string;
}

const mockPosts = [
  {
    id: "p1",
    authorId: "u1",
    authorName: "Alice Johnson",
    authorAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
    content: "Just had a great walk with my dog! 🐕",
    mediaUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
    media: [
      {
        id: "m1",
        type: "image",
        url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    likesCount: 10,
    commentsCount: 2,
    isLiked: false,
    type: "standard",
  },
  {
    id: "p2",
    authorId: "u2",
    authorName: "Bob Smith",
    authorAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    content: "Check out this poll about pet food preferences!",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    type: "poll",
    pollOptions: [
      { id: "opt1", text: "Dry food", votes: 15, percentage: 50 },
      { id: "opt2", text: "Wet food", votes: 10, percentage: 33 },
      { id: "opt3", text: "Raw diet", votes: 5, percentage: 17 },
    ],
    pollDuration: 24, // 24 hours
    expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    totalVotes: 30,
    userVoted: false,
  },
  {
    id: "p3",
    authorId: "u3",
    authorName: "Charlie Davis",
    authorAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    content: "Found this great article about pet training!",
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    type: "link",
    linkUrl: "https://www.akc.org/expert-advice/training/",
    linkTitle: "Dog Training - Expert Tips & Advice",
    linkDescription:
      "Expert dog training tips from basic to advanced techniques.",
    linkImage:
      "https://www.akc.org/wp-content/uploads/2017/11/German-Shepherd-on-White-00.jpg",
  },
  {
    id: "p4",
    authorId: "u4",
    authorName: "Emma Roberts",
    authorAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
    content:
      "URGENT! My dog Luna has gone missing near Central Park. She's a golden retriever with a blue collar. Please contact me if you see her!",
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    type: "emergency",
    emergencyType: "pawwlice",
    petName: "Luna",
    lastSeen: "Central Park, near the fountain, around 3 PM",
    contactPhone: "555-123-4567",
    emergencyImage: "https://images.unsplash.com/photo-1551730459-92db2a308d6a",
    isCritical: true,
  },
  {
    id: "p5",
    authorId: "u5",
    authorName: "David Wilson",
    authorAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
    content:
      "My cat Max is showing signs of an allergic reaction. Need vet recommendations ASAP!",
    createdAt: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
    updatedAt: new Date(Date.now() - 2700000).toISOString(),
    type: "emergency",
    emergencyType: "medical",
    petName: "Max",
    lastSeen:
      "Swollen face, difficulty breathing, and lethargy after eating new food",
    contactPhone: "555-987-6543",
    emergencyImage:
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97",
    isCritical: true,
  },
  {
    id: "p6",
    authorId: "u6",
    authorName: "Sarah Thompson",
    authorAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
    content:
      "Help us fund the new shelter expansion! Every dollar helps provide a home for animals in need.",
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    type: "campaign",
    campaignTitle: "Shelter Expansion Project",
    campaignGoal: 15000,
    currentAmount: 7500,
    deadline: new Date(Date.now() + 2592000000).toISOString(), // 30 days from now
    campaignImage:
      "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01",
  },
  // New Link Post with richer preview
  {
    id: "p7",
    authorId: "u7",
    authorName: "Michael Johnson",
    authorAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
    content:
      "This article on pet nutrition changed how I feed my dog. Must read for all pet owners!",
    createdAt: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
    type: "link",
    linkUrl:
      "https://www.petmd.com/dog/nutrition/evr_dg_nutrition_differences_between_dog_food_and_human_food",
    linkTitle: "Pet Nutrition: What You Need to Know",
    linkDescription:
      "Understanding the nutritional needs of your pet can help them live a longer, healthier life. This comprehensive guide breaks down everything from proteins to micronutrients.",
    linkImage: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35",
  },
  // Petition Post
  {
    id: "p8",
    authorId: "u8",
    authorName: "Jessica Miller",
    authorAvatar: "https://randomuser.me/api/portraits/women/5.jpg",
    content:
      "Please sign our petition to increase funding for animal welfare programs in our city. We need 5,000 signatures to present to the city council.",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    type: "campaign",
    campaignTitle: "Increase Animal Welfare Funding",
    campaignGoal: 5000,
    currentAmount: 3750,
    deadline: new Date(Date.now() + 1209600000).toISOString(), // 14 days from now
    campaignImage:
      "https://images.unsplash.com/photo-1592375601764-5dd6be536778",
  },
  // Collectible Launch Post
  {
    id: "p9",
    authorId: "u9",
    authorName: "PawwPurr Official",
    authorAvatar: "https://randomuser.me/api/portraits/lego/1.jpg",
    content:
      'Introducing our new limited edition "Pet Heroes" collectible series! Each digital collectible celebrates an extraordinary animal that made a difference. Only 100 available of each design. Available now in the marketplace.',
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    type: "standard",
    mediaUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d",
    media: [
      {
        id: "m9",
        type: "image",
        url: "https://images.unsplash.com/photo-1552053831-71594a27632d",
      },
    ],
    likesCount: 245,
    commentsCount: 56,
    isLiked: true,
  },
  // Marketplace Items Post with multiple items
  {
    id: "p10",
    authorId: "u10",
    authorName: "Pet Supplies Inc.",
    authorAvatar: "https://randomuser.me/api/portraits/men/7.jpg",
    content:
      "Check out our new spring collection for your furry friends! Use code SPRING15 for 15% off your purchase.",
    createdAt: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
    type: "standard",
    media: [
      {
        id: "m10a",
        type: "image",
        url: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd",
      },
      {
        id: "m10b",
        type: "image",
        url: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e",
      },
      {
        id: "m10c",
        type: "image",
        url: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119",
      },
    ],
    likesCount: 78,
    commentsCount: 12,
    isLiked: false,
  },
  // Sponsored Post
  {
    id: "p11",
    authorId: "u11",
    authorName: "Premium Pet Foods",
    authorAvatar: "https://randomuser.me/api/portraits/women/8.jpg",
    content:
      "Introducing our new organic grain-free formula for dogs with sensitive stomachs. Try it risk-free with our money-back guarantee!",
    createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 21600000).toISOString(),
    type: "sponsored",
    sponsorName: "Premium Pet Foods",
    sponsorLogo: "https://randomuser.me/api/portraits/women/8.jpg",
    adLink: "https://example.com/premium-pet-foods",
    adDescription: "Healthy food for healthier pets",
    media: [
      {
        id: "m11",
        type: "image",
        url: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35",
      },
    ],
    likesCount: 32,
    commentsCount: 8,
    isLiked: false,
  },
  // Volunteer Post
  {
    id: "p12",
    authorId: "u12",
    authorName: "City Animal Shelter",
    authorAvatar: "https://randomuser.me/api/portraits/men/9.jpg",
    content:
      "We need volunteers for our adoption event this weekend! Help us find forever homes for these wonderful animals.",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    type: "volunteer",
    volunteerRole: "Event Helper",
    eventDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    location: "City Park, Downtown",
    eventImage: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01",
  },
  {
    id: "p13",
    authorId: "u13",
    authorName: "Lily Carter",
    authorAvatar: "https://randomuser.me/api/portraits/women/6.jpg",
    content: "Caught my kitten napping in the sun today—so cute! 😻",
    mediaUrl: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e",
    media: [
      {
        id: "m13",
        type: "image",
        url: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e",
      },
    ],
    createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    likesCount: 25,
    commentsCount: 4,
    isLiked: false,
    type: "standard",
  },

  // Poll Post
  {
    id: "p14",
    authorId: "u14",
    authorName: "James Lee",
    authorAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
    content: "What’s your go-to pet toy? Let’s see what’s most popular!",
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    type: "poll",
    pollOptions: [
      { id: "opt4", text: "Tennis ball", votes: 12, percentage: 40 },
      { id: "opt5", text: "Chew toy", votes: 10, percentage: 33 },
      { id: "opt6", text: "Laser pointer", votes: 8, percentage: 27 },
    ],
    pollDuration: 48, // 48 hours
    expiresAt: new Date(Date.now() + 172800000).toISOString(), // 48 hours from now
    totalVotes: 30,
    userVoted: false,
  },

  // Link Post
  {
    id: "p15",
    authorId: "u15",
    authorName: "Sophie Brown",
    authorAvatar: "https://randomuser.me/api/portraits/women/7.jpg",
    content: "This guide on cat behavior is a game-changer for new owners!",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    type: "link",
    linkUrl:
      "https://www.aspca.org/pet-care/cat-care/common-cat-behavior-issues",
    linkTitle: "Common Cat Behavior Issues",
    linkDescription:
      "Learn how to address scratching, aggression, and more with these expert tips.",
    linkImage: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
  },

  // Emergency Post (Lost Pet)
  {
    id: "p16",
    authorId: "u16",
    authorName: "Oliver Green",
    authorAvatar: "https://randomuser.me/api/portraits/men/6.jpg",
    content:
      "Lost my parrot, Kiwi, near Riverside Drive! He’s green with red feathers on his head. Please call if you spot him!",
    createdAt: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
    type: "emergency",
    emergencyType: "pawwlice",
    petName: "Kiwi",
    lastSeen: "Riverside Drive, near the playground, around 10 AM",
    contactPhone: "555-456-7890",
    emergencyImage:
      "https://images.unsplash.com/photo-1453227588063-bb302b8842f5",
    isCritical: true,
  },

  // Emergency Post (Medical)
  {
    id: "p17",
    authorId: "u17",
    authorName: "Mia Patel",
    authorAvatar: "https://randomuser.me/api/portraits/women/9.jpg",
    content:
      "My rabbit Thumper isn’t eating—urgent vet suggestions needed near Oak Street!",
    createdAt: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
    type: "emergency",
    emergencyType: "medical",
    petName: "Thumper",
    lastSeen: "Lethargic, not eating or drinking since this morning",
    contactPhone: "555-321-9876",
    emergencyImage:
      "https://images.unsplash.com/photo-1592772873656-67b7ed76d5d2",
    isCritical: true,
  },

  // Campaign Post (Fundraiser)
  {
    id: "p18",
    authorId: "u18",
    authorName: "Noah Evans",
    authorAvatar: "https://randomuser.me/api/portraits/men/8.jpg",
    content:
      "Support our campaign to provide free vaccinations for shelter pets! Every little bit counts.",
    createdAt: new Date(Date.now() - 64800000).toISOString(), // 18 hours ago
    updatedAt: new Date(Date.now() - 64800000).toISOString(),
    type: "campaign",
    campaignTitle: "Shelter Vaccination Drive",
    campaignGoal: 10000,
    currentAmount: 4200,
    deadline: new Date(Date.now() + 3888000000).toISOString(), // 45 days from now
    campaignImage:
      "https://images.unsplash.com/photo-1578944032637-f09895a8e815",
  },

  // Sponsored Post
  {
    id: "p19",
    authorId: "u19",
    authorName: "Healthy Paws Co.",
    authorAvatar: "https://randomuser.me/api/portraits/lego/2.jpg",
    content:
      "Our new hypoallergenic pet beds are perfect for sensitive pups—shop now and get free shipping!",
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    type: "sponsored",
    sponsorName: "Healthy Paws Co.",
    sponsorLogo: "https://randomuser.me/api/portraits/lego/2.jpg",
    adLink: "https://example.com/healthy-paws-beds",
    adDescription: "Comfort your pet deserves",
    media: [
      {
        id: "m19",
        type: "image",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      },
    ],
    likesCount: 19,
    commentsCount: 5,
    isLiked: false,
  },

  // Volunteer Post
  {
    id: "p20",
    authorId: "u20",
    authorName: "Paws & Claws Rescue",
    authorAvatar: "https://randomuser.me/api/portraits/women/10.jpg",
    content:
      "Join us to walk dogs at our rescue center this Saturday! No experience needed—just a love for animals.",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    type: "volunteer",
    volunteerRole: "Dog Walker",
    eventDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    location: "Paws & Claws Rescue Center, 123 Elm Street",
    eventImage: "https://images.unsplash.com/photo-1561037404-61cd46aa615b",
  },

  // Standard Post with Multiple Media
  {
    id: "p21",
    authorId: "u21",
    authorName: "Ethan Brooks",
    authorAvatar: "https://randomuser.me/api/portraits/men/10.jpg",
    content: "My pups had a blast at the beach today! Check out these pics.",
    createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 21600000).toISOString(),
    type: "standard",
    media: [
      {
        id: "m21a",
        type: "image",
        url: "https://images.unsplash.com/photo-1560807707-8cc77767d783",
      },
      {
        id: "m21b",
        type: "image",
        url: "https://images.unsplash.com/photo-1586671267731-da2cf3ce0218",
      },
    ],
    likesCount: 92,
    commentsCount: 18,
    isLiked: true,
  },

  // Campaign Post (Petition)
  {
    id: "p22",
    authorId: "u22",
    authorName: "Ava Kim",
    authorAvatar: "https://randomuser.me/api/portraits/women/11.jpg",
    content:
      "Sign our petition to ban puppy mills in our state—we’re so close to our goal!",
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    type: "campaign",
    campaignTitle: "Ban Puppy Mills",
    campaignGoal: 10000,
    currentAmount: 9200,
    deadline: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    campaignImage:
      "https://images.unsplash.com/photo-1601758065893-25c2bfa0d3cf",
  },
  {
    id: "p23",
    authorId: "u23",
    authorName: "Hannah Ortiz",
    authorAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
    content: "My hamster just mastered the wheel—proud pet mom moment! 🐹",
    mediaUrl: "https://images.unsplash.com/photo-1581969442088-238a9e4e8d03",
    media: [
      {
        id: "m23",
        type: "image",
        url: "https://images.unsplash.com/photo-1581969442088-238a9e4e8d03",
      },
    ],
    createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    likesCount: 15,
    commentsCount: 3,
    isLiked: false,
    type: "standard",
  },
  {
    id: "p24",
    authorId: "u24",
    authorName: "Lucas Nguyen",
    authorAvatar: "https://randomuser.me/api/portraits/men/11.jpg",
    content: "What’s the best way to keep pets cool in summer? Vote below!",
    createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 18000000).toISOString(),
    type: "poll",
    pollOptions: [
      { id: "opt7", text: "Frozen treats", votes: 20, percentage: 45 },
      { id: "opt8", text: "Cooling mats", votes: 15, percentage: 34 },
      { id: "opt9", text: "Kiddie pool", votes: 9, percentage: 21 },
    ],
    pollDuration: 72, // 72 hours
    expiresAt: new Date(Date.now() + 259200000).toISOString(), // 72 hours from now
    totalVotes: 44,
    userVoted: false,
  },

  // Link Post
  {
    id: "p25",
    authorId: "u25",
    authorName: "Zoe Phillips",
    authorAvatar: "https://randomuser.me/api/portraits/women/13.jpg",
    content:
      "This article on pet dental care is a must-read—keep those teeth sparkling!",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    type: "link",
    linkUrl:
      "https://www.avma.org/resources-tools/pet-owners/petcare/dental-care-pets",
    linkTitle: "Dental Care for Pets",
    linkDescription: "Tips and tricks for maintaining your pet’s oral health.",
    linkImage: "https://images.unsplash.com/photo-1596854407944-bf87f6dd7980",
  },

  // Emergency Post (Lost Pet)
  {
    id: "p26",
    authorId: "u26",
    authorName: "Mason Reed",
    authorAvatar: "https://randomuser.me/api/portraits/men/12.jpg",
    content:
      "My cat Shadow escaped near Maple Street! Black with green eyes—please help me find him!",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    type: "emergency",
    emergencyType: "pawwlice",
    petName: "Shadow",
    lastSeen: "Maple Street, near the library, around 1 PM",
    contactPhone: "555-654-3210",
    emergencyImage:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    isCritical: true,
  },

  // Emergency Post (Medical)
  {
    id: "p27",
    authorId: "u27",
    authorName: "Isabella Gomez",
    authorAvatar: "https://randomuser.me/api/portraits/women/14.jpg",
    content:
      "My dog Buddy ate chocolate! Need a vet recommendation near Hill Avenue NOW!",
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    type: "emergency",
    emergencyType: "medical",
    petName: "Buddy",
    lastSeen:
      "Vomiting and restless after eating a chocolate bar 20 minutes ago",
    contactPhone: "555-789-1234",
    emergencyImage:
      "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb",
    isCritical: true,
  },

  // Campaign Post (Fundraiser)
  {
    id: "p28",
    authorId: "u28",
    authorName: "Elijah Foster",
    authorAvatar: "https://randomuser.me/api/portraits/men/13.jpg",
    content: "Help us build a new play area for rescue dogs—donate today!",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    type: "campaign",
    campaignTitle: "Rescue Dog Play Area",
    campaignGoal: 20000,
    currentAmount: 8500,
    deadline: new Date(Date.now() + 5184000000).toISOString(), // 60 days from now
    campaignImage: "https://images.unsplash.com/photo-1561037404-61cd46aa615b",
  },

  // Sponsored Post
  {
    id: "p29",
    authorId: "u29",
    authorName: "FurryFriends Inc.",
    authorAvatar: "https://randomuser.me/api/portraits/lego/3.jpg",
    content:
      "Try our new eco-friendly pet toys—durable and sustainable! 20% off this week only.",
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    type: "sponsored",
    sponsorName: "FurryFriends Inc.",
    sponsorLogo: "https://randomuser.me/api/portraits/lego/3.jpg",
    adLink: "https://example.com/furryfriends-toys",
    adDescription: "Green toys for happy pets",
    media: [
      {
        id: "m29",
        type: "image",
        url: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd",
      },
    ],
    likesCount: 28,
    commentsCount: 6,
    isLiked: false,
  },

  // Volunteer Post
  {
    id: "p30",
    authorId: "u30",
    authorName: "Hope Animal Haven",
    authorAvatar: "https://randomuser.me/api/portraits/women/15.jpg",
    content:
      "We need foster homes for kittens this month! Sign up to make a difference.",
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
    type: "volunteer",
    volunteerRole: "Kitten Foster",
    eventDate: new Date(Date.now() + 2592000000).toISOString(), // 30 days from now
    location: "Remote—pickup at Hope Animal Haven, 456 Pine Road",
    eventImage: "https://images.unsplash.com/photo-1574158622682-e40e69881006",
  },

  // Standard Post with Multiple Media
  {
    id: "p31",
    authorId: "u31",
    authorName: "Liam Hayes",
    authorAvatar: "https://randomuser.me/api/portraits/men/14.jpg",
    content: "Took my birds out for some fresh air today—look at these colors!",
    createdAt: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
    type: "standard",
    media: [
      {
        id: "m31a",
        type: "image",
        url: "https://images.unsplash.com/photo-1518894781321-630e638d0742",
      },
      {
        id: "m31b",
        type: "image",
        url: "https://images.unsplash.com/photo-1596854307943-279e29c90c49",
      },
    ],
    likesCount: 67,
    commentsCount: 14,
    isLiked: true,
  },

  // Campaign Post (Petition)
  {
    id: "p32",
    authorId: "u32",
    authorName: "Chloe Bennett",
    authorAvatar: "https://randomuser.me/api/portraits/women/16.jpg",
    content:
      "Sign to stop pet stores from selling animals from unethical breeders—we’re almost there!",
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
    type: "campaign",
    campaignTitle: "End Unethical Breeding Sales",
    campaignGoal: 7500,
    currentAmount: 6800,
    deadline: new Date(Date.now() + 1814400000).toISOString(), // 21 days from now
    campaignImage:
      "https://images.unsplash.com/photo-1601758065893-25c2bfa0d3cf",
  },

  // Standard Post (Collectible Announcement)
  {
    id: "p33",
    authorId: "u33",
    authorName: "PawwPurr Official",
    authorAvatar: "https://randomuser.me/api/portraits/lego/4.jpg",
    content:
      'New "Rescue Legends" collectible drop tomorrow! Only 50 of each design—don’t miss out!',
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    type: "standard",
    mediaUrl: "https://images.unsplash.com/photo-1601758125946-6d027fe587dc",
    media: [
      {
        id: "m33",
        type: "image",
        url: "https://images.unsplash.com/photo-1601758125946-6d027fe587dc",
      },
    ],
    likesCount: 310,
    commentsCount: 72,
    isLiked: true,
  },
];

const mockStories = [
  {
    id: "s1",
    userId: "u1",
    username: "Alice",
    userAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
    hasUnseenStory: true,
    isLive: false,
  },
  {
    id: "s2",
    userId: "u2",
    username: "Bob",
    userAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    hasUnseenStory: true,
    isLive: true,
  },
  {
    id: "s3",
    userId: "u3",
    username: "Charlie",
    userAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    hasUnseenStory: false,
    isLive: false,
  },
  {
    id: "s4",
    userId: "u4",
    username: "David",
    userAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
    hasUnseenStory: true,
    isLive: false,
  },
  {
    id: "s5",
    userId: "u5",
    username: "Emma",
    userAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
    hasUnseenStory: false,
    isLive: false,
  },
];

const mockComments: Comment[] = [
  {
    id: "c1",
    postId: "p1",
    authorId: "u2",
    authorName: "Bob",
    authorAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    content: "Such a cute dog! What breed is it?",
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    likesCount: 2,
    isLiked: false,
  },
  {
    id: "c2",
    postId: "p1",
    authorId: "u3",
    authorName: "Charlie",
    authorAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    content: "Looks like you had a great time!",
    createdAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    likesCount: 1,
    isLiked: true,
  },
  {
    id: "c3",
    postId: "p2",
    authorId: "u1",
    authorName: "Alice",
    authorAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
    content: "My dog loves the Kong toys, they last forever!",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    likesCount: 3,
    isLiked: false,
  },
  {
    id: "c4",
    postId: "p2",
    authorId: "u3",
    authorName: "Charlie",
    authorAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    content: "Try the ChuckIt balls, they are great for fetch!",
    createdAt: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
    likesCount: 2,
    isLiked: true,
  },
  {
    id: "c5",
    postId: "p2",
    authorId: "u4",
    authorName: "David",
    authorAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
    content: "Rope toys are always a hit with my pup.",
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    likesCount: 1,
    isLiked: false,
  },
];

export default class FeedController {
  static getCommentsByPostId = async (req: Request, res: any) => {
    try {
      const { postId } = req.params;
      const authorId = req["user"]["userId"] as any;
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 10;
    console.log("postId", postId, "authorId", authorId, "cursor", cursor, "limit", limit);

      const allCommentsOfPost = await FeedService.getAllCommentsByPostId(parseInt(postId), authorId );
      console.log("allCommentsOfPost", allCommentsOfPost);

      const postComments = allCommentsOfPost.filter((c) => c.postId === postId);

      if (postComments.length === 0) {
        return res.status(200).json({
          comments: [],
          hasMore: false,
          nextCursor: undefined,
        });
      }

      postComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const startIndex = cursor ? parseInt(cursor) : 0;
      const endIndex = startIndex + limit;
      const paginatedComments = postComments.slice(startIndex, endIndex);
      const hasMore = endIndex < postComments.length;
      const nextCursor = hasMore ? endIndex.toString() : undefined;

      // Send the response
      const response: CommentsResponse = {
        comments: paginatedComments,
        hasMore,
        nextCursor,
      };
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static getPosts = async (req: Request, res: any) => {
    try {
      const email = req["user"]["userId"] as any;
      const userId = req["user"]["userId"] as any;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized user" });
      }

      const cursor = parseInt(req.query.cursor as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;

      const { posts, totalPosts } = await FeedService.getAllPosts(
        userId,
        cursor,
        limit,
      );

      const hasMore = cursor + limit < totalPosts;
      const nextCursor = hasMore ? cursor + limit : undefined;

      // Response
      res.status(200).json({
        success: true,
        posts,
        hasMore,
        nextCursor,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static getStories = async (req: Request, res: Response) => {
    res.status(200).json(mockStories);
  };

  static createPost = async (req: Request, res: any) => {
    try {
      const email = req["user"]["email"] as any;
      const authorId = req["user"]["userId"] as any;

      if (!email || !authorId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized user" });
      }

      const user = await UserService.getUser(email);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const { content, type } = req.body;

      if (!content || !type) {
        return res
          .status(400)
          .json({ success: false, message: "Content and type are required" });
      }
      let imageUrl = null;
      const postImage = (req.files as any).postImage?.[0];

      console.log("\n\n\n\n", "postImage", postImage, "\n\n\n");

      if (postImage) {
        const mainImageDataUri = `data:${
          postImage.mimetype
        };base64,${postImage.buffer.toString("base64")}`;
        const mainImageUpload = await cloudinary.uploader.upload(
          mainImageDataUri,
          {
            folder: "feed",
          },
        );
        imageUrl = mainImageUpload.secure_url;
      }
      const newPost = await FeedService.createPost({
        authorId,
        content,
        type,
        imageUrl, // pass as array
      });

      if (!newPost) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to create post" });
      }

      return res.status(201).json({
        success: true,
        message: "Post created successfully",
        post: {
          ...newPost,
          authorName: user.name,
          authorAvatar: user.profileImageUrl,
          isLiked: false,
          commentsCount: 0,
          likesCount: 0,
        }, // Assuming you have the user's name and avatar URL
      });
    } catch (error: any) {
      console.error("Create Post Error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  static togglePostLike = async (req: Request, res: any) => {
    try {
      const userId = req["user"]?.userId;
      const { postId } = req.params;


      if (!userId || !postId) {
        return res.status(400).json({
          success: false,
          error: "User ID and Post ID are required",
        });
      }

      const post = await FeedService.getPostById(Number(postId), userId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      }

      const isLiked = await FeedService.togglePostLike(
        Number(userId),
        Number(postId),
      );

      res.status(200).json({
        success: true,
        message: isLiked
          ? "Post liked successfully"
          : "Post unliked successfully",
        isLiked,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

  static toggleCommentLike = async (req: Request, res: any) => {
    try {
      const userId = req["user"]?.userId;
      const { commentId } = req.params;
      console.log("userId", userId, "commentId", commentId);

      if (!userId || !commentId) {
        return res.status(400).json({
          success: false,
          error: "User ID and Post ID are required",
        });
      }

      const post = await FeedService.getCommentById(Number(commentId),userId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      }

      const isLiked = await FeedService.toggleCommentLike(
        Number(userId),
        Number(commentId),
      );

      res.status(200).json({
        success: true,
        message: isLiked
          ? "comment liked successfully"
          : "comment unliked successfully",
        isLiked,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

  static getPostById = async (req: Request, res: any) => {
    try {
      const authorId = req["user"]?.userId;
      const { postId } = req.params;
      const post = await FeedService.getPostById(Number(postId), Number(authorId));
      if (!post) {
        return res.status(404).json({ success: false, error: "Post not found" });
      }
      res.status(200).json({ success: true, post });
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

  static addCommentByPostId = async (req: Request, res: any) => {
      try {
         const authorId = req["user"]["userId"] as any;
         const { postId } = req.params;
          const { content } = req.body;
          console.log("req.body", req.body, "req.params", req.params, authorId);
  
          if(!authorId || !postId || !content) {
            return res.status(400).json({
              success: false,
              error: "Author ID, Post ID, and content are required",
            });
          }
          const newComment = await FeedService.addCommentByPostId(authorId, parseInt(postId), content);
          if(!newComment) {
            return res.status(500).json({
              success: false,
              error: "Failed to add comment",
            });
          }
          res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: newComment,
          });
      } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
  } 
}
