"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import StaticRenderer from "../Common/MarkdownRenderer/StaticRenderer";

export default function ConversationHistory({ conversation }) {
  // Initialize state with existing history
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to state
    const userMessage = { role: "user", message: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://1eop66zpf7.execute-api.ap-south-1.amazonaws.com/prod/send-message",
        {
          method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          body: JSON.stringify({
            question: inputMessage,
            conversationId: conversation.conversationId,
          }),
        }
      );

      const data = await response.json();

      const chunks = data?.chunks?.map((chunk) => ({
        serial: chunk?.index,
        data: chunk?.data,
      }));

      console.log({
        userMessage: inputMessage,
        modelResponse: data?.response,
        chunks,
      });

      // Add assistant response to state with chunks
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          message: data.response,
          chunks: chunks || [],
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowChunks = (chunks) => {
    setSelectedChunks(chunks);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (conversation?.conversationHistory) {
      const processedHistory = conversation?.conversationHistory?.flatMap(
        (item) => [
          {
            role: "user",
            message: item.userQuestion,
          },
          {
            role: "model",
            message: item.assistantResponse,
          },
        ]
      );

      console.log({ processedHistory });

      setMessages(processedHistory);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-50px)] bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } gap-2`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.role === "user" ? (
                  msg.message
                ) : (
                  <StaticRenderer content={msg.message} />
                )}
              </div>
              {msg.role === "model" && msg.chunks && msg.chunks.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleShowChunks(msg.chunks)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl h-[70vh]">
          <DialogHeader>
            <DialogTitle>Source Chunks</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-4">
            {selectedChunks.map((chunk, index) => (
              <div
                key={index}
                className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-auto"
              >
                <div className="font-semibold mb-2">Chunk {chunk.serial}</div>
                <div className="text-sm text-gray-700">{chunk.data}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 p-4 bg-white border-t border-gray-200"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
