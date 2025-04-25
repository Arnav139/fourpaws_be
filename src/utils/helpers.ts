export const formatPost = (post: any): any => {
  // console.log(post);

  let formattedPost: any = {
    id: post.id.toString(),
    authorName: post.authorName,
    authorAvatar: post.authorAvatar,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    type: post.type,
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    isLiked: post.isLiked || false,
  };

  switch (post.type) {
    case "poll": {
      // Assuming post.metadata = { pollOptions: [{ text: string }], pollDuration: number }
      const pollData = post.metadata as {
        pollOptions: { text: string }[];
        pollDuration: number;
      };
      formattedPost = {
        ...formattedPost,
        pollOptions: pollData?.pollOptions?.map((opt, index) => ({
          id: `opt${index + 1}`,
          text: opt.text,
          votes: 0,
          percentage: 0,
        })),
        pollDuration: pollData.pollDuration,
        expiresAt: new Date(
          Date.now() + pollData.pollDuration * 3600000,
        ).toISOString(),
        totalVotes: 0,
        userVoted: false,
      };
      break;
    }
    case "link": {
      // Assuming post.metadata = { linkUrl: string }
      const linkData = post.metadata as { linkUrl: string };
      formattedPost = {
        ...formattedPost,
        linkUrl: linkData.linkUrl,
        linkTitle: "Example Link Title", // In production, fetch via a link preview service.
        linkDescription: "This is a placeholder for link description",
        linkImage: "https://via.placeholder.com/300",
      };
      break;
    }
    case "campaign": {
      // Assuming post.metadata = { campaignTitle: string; campaignGoal: number; deadline: string; campaignImage?: string }
      const campaignData = post.metadata as {
        campaignTitle: string;
        campaignGoal: number;
        deadline: string;
        campaignImage?: string;
      };
      formattedPost = {
        ...formattedPost,
        campaignTitle: campaignData.campaignTitle,
        campaignGoal: campaignData.campaignGoal,
        currentAmount: 0,
        deadline: campaignData.deadline,
        campaignImage: campaignData.campaignImage,
      };
      break;
    }
    case "volunteer": {
      // Assuming post.metadata = { volunteerRole: string; eventDate: string; location: string; eventImage?: string }
      const volunteerData = post.metadata as {
        volunteerRole: string;
        eventDate: string;
        location: string;
        eventImage?: string;
      };
      formattedPost = {
        ...formattedPost,
        volunteerRole: volunteerData.volunteerRole,
        eventDate: volunteerData.eventDate,
        location: volunteerData.location,
        eventImage: volunteerData.eventImage,
      };
      break;
    }
    case "new_profile": {
      // Assuming post.metadata = { petProfileId: string; petName: string; petBreed: string; petAvatar: string; petAge?: string }
      const profileData = post.metadata as {
        petProfileId: string;
        petName: string;
        petBreed: string;
        petAvatar: string;
        petAge?: string;
      };
      formattedPost = {
        ...formattedPost,
        petProfileId: profileData.petProfileId,
        petName: profileData.petName,
        petBreed: profileData.petBreed,
        petAvatar: profileData.petAvatar,
        petAge: profileData.petAge,
      };
      break;
    }
    case "sponsored": {
      // Assuming post.metadata = { sponsorName: string; sponsorLogo: string; adLink: string; adDescription?: string }
      const sponsoredData = post.metadata as {
        sponsorName: string;
        sponsorLogo: string;
        adLink: string;
        adDescription?: string;
      };
      formattedPost = {
        ...formattedPost,
        sponsorName: sponsoredData.sponsorName,
        sponsorLogo: sponsoredData.sponsorLogo,
        adLink: sponsoredData.adLink,
        adDescription: sponsoredData.adDescription,
      };
      break;
    }
    case "emergency": {
      // Assuming post.metadata = { emergencyType: "pawwlice" | "medical"; petName: string; lastSeen?: string; contactPhone: string; emergencyImage?: string; isCritical: boolean }
      const emergencyData = post.metadata as {
        emergencyType: "pawwlice" | "medical";
        petName: string;
        lastSeen?: string;
        contactPhone: string;
        emergencyImage?: string;
        isCritical: boolean;
      };
      formattedPost = {
        ...formattedPost,
        emergencyType: emergencyData.emergencyType,
        petName: emergencyData.petName,
        lastSeen: emergencyData.lastSeen,
        contactPhone: emergencyData.contactPhone,
        emergencyImage: emergencyData.emergencyImage,
        isCritical: emergencyData.isCritical,
      };
      break;
    }
    default: {
      // Standard post – you might also consider grabbing the first media (if available)
      formattedPost = {
        ...formattedPost,
        mediaUrl: post.image ? post.image : undefined,
        media: post.image
          ? [
              {
                id: `m${post.id}`,
                type: "image",
                url: post.image,
              },
            ]
          : undefined,
      };
    }
  }
  return formattedPost;
};
