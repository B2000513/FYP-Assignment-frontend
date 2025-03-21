import React, { useState } from "react";
import { Button, Dialog, DialogContent, TextField, IconButton, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import useAxios from "../utils/useAxios"; // ✅ Import updated Axios hook

const WidgetChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const { sendMessageToChatbot } = useAxios(); // ✅ Call chatbot API

  // Toggle chatbot modal
  const toggleChat = () => setOpen(!open);

  // Handle sending a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
    setLoading(true); // ✅ Show loading state

    try {
      console.log("Sending message to chatbot...");
      const botReply = await sendMessageToChatbot(input); // ✅ Get chatbot response

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error fetching chatbot response." },
      ]);
    }

    setLoading(false); // ✅ Hide loading state
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        variant="contained"
        onClick={toggleChat}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          borderRadius: "50%",
          width: 50,
          height: 50,
        }}
      >
        <ChatBubbleOutlineIcon />
      </Button>

      {/* Chatbot Modal */}
      <Dialog open={open} onClose={toggleChat} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: "flex", flexDirection: "column", height: 400 }}>
          {/* Close Button */}
          <IconButton
            onClick={toggleChat}
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: "15px",
                    background: msg.sender === "user" ? "#1976d2" : "#eeeeee",
                    color: msg.sender === "user" ? "#fff" : "#000",
                    display: "inline-block",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}

            {/* ✅ Loading speech bubble */}
            {loading && (
              <div style={{ textAlign: "left", marginBottom: "10px" }}>
                <span
                  style={{
                    padding: "8px 12px",
                    borderRadius: "15px",
                    background: "#eeeeee",
                    color: "#000",
                    display: "inline-block",
                  }}
                >
                  <CircularProgress size={20} style={{ marginRight: "10px" }} />
                  Thinking...
                </span>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd" }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me something..."
            />
            <Button onClick={sendMessage} disabled={loading}>
              <SendIcon />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WidgetChatbot;
