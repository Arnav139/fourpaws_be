export const formatPost = async (post: any) => {
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

    media: post.media,
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
          Date.now() + pollData.pollDuration * 3600000
        ).toISOString(),
        totalVotes: 0,
        userVoted: false,
      };
      break;
    }
    case "link": {
      // Assuming post.metadata = { linkUrl: string }
      const linkData = post.metadata as { linkUrl: string };
      let previewData = await fetchLinkPreview(linkData.linkUrl);
      formattedPost = {
        ...formattedPost,
        linkUrl: linkData.linkUrl,
        linkTitle: previewData.title,
        linkDescription: previewData.description,
        linkImage: previewData.image,
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
        media: post.media,
      };
    }
  }
  return formattedPost;
};

export interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
}

export const fetchLinkPreview = async (
  linkUrl: string
): Promise<LinkPreviewData> => {
  // Use AbortController to implement a timeout.
  const controller = new AbortController();
  const timeout = 50; // 5 seconds
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    throw new Error("Not implemented");
    const response = await fetch(linkUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    const html = await response.text();

    // Parse the HTML string with DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Helper function to get meta tag content using vanilla DOM APIs.
    const getMetaTag = (name: string): string => {
      const metaTagOg = doc.querySelector(`meta[property="og:${name}"]`);
      if (metaTagOg && metaTagOg.getAttribute("content")) {
        return metaTagOg.getAttribute("content")!; // non-null assertion
      }
      const metaTagName = doc.querySelector(`meta[name="${name}"]`);
      if (metaTagName && metaTagName.getAttribute("content")) {
        return metaTagName.getAttribute("content")!;
      }
      return "";
    };

    const title = getMetaTag("title") || doc.title || "No title available";
    const description =
      getMetaTag("description") ||
      (doc.querySelector(`meta[name="description"]`)?.getAttribute("content") ??
        "") ||
      "No description available";
    const image = getMetaTag("image") || "";

    return { title, description, image };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("Fetch request timed out:", error);
    } else {
      console.error("Error fetching link preview:", error);
    }
    return {
      title: "Unavailable",
      description: "Unable to fetch link preview",
      image: "https://via.placeholder.com/300",
    };
  }
};
