"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChatStart() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const apiEndpoint =
        "https://1eop66zpf7.execute-api.ap-south-1.amazonaws.com/prod/send-message";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        // },
        body: JSON.stringify({
          question: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      console.log({ data });

      if (data?.statusCode === 200) {
        router.push(`/conversation-history/${data?.conversationId}`);
      }

    //   setInputValue("");
      // Handle successful response here if needed
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] w-full p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to the Chat!</CardTitle>
          <CardDescription>
            Ask me anything and I'll do my best to help you.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Message */}
          {error && (
            <div
              className="p-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="flex-1"
                aria-label="Chat input"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={cn("transition-all", isLoading && "animate-pulse")}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Example Questions */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Try asking:
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                "How to do great work?",
                "What are the best practices for coding?",
                "How can I improve my skills?",
              ].map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => setInputValue(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
