import ConversationHistory from "@/components/ConversationHistory";
import { notFound } from "next/navigation";

async function getConversationHistory(id) {
  try {
    const response = await fetch(
      `https://1eop66zpf7.execute-api.ap-south-1.amazonaws.com/prod/get-conversation?conversationId=${id}`,
      {
        cache: "no-store", // Disable Next.js cache
        headers: {
          "Cache-Control": "no-cache", // Disable browser cache
          Pragma: "no-cache",
        },
        next: {
          revalidate: 0, // Disable revalidation
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch conversation");
    }

    const data = await response.json();

    console.log({ data });

    if (data?.statusCode !== 200) {
      throw new Error("Failed to fetch conversation");
    }

    return data;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
}

export default async function ConversationHistoryPage({ params }) {
  const id = (await params).id;

  const conversationData = await getConversationHistory(id);

  if (!conversationData || !conversationData.conversationHistory) {
    notFound();
  }

  return <ConversationHistory conversation={conversationData} />;
}
