"use client";
import { User } from "../utils/types";
import { useEffect, useState } from "react";
import { ChatDialog } from "@baseline-ui/recipes";
import { AIMessage } from "../utils/types";
import askAI from "./api/askAI";
import dynamic from "next/dynamic";
import { chatBotSVG } from "@/utils/helpers";

// Dynamic imports for components that are not needed during SSR
const DynamicSignComp = dynamic(() => import("./signingDemo"), { ssr: false });
const I18nProvider = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.I18nProvider),
  { ssr: false }
);
const ThemeProvider = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.ThemeProvider),
  { ssr: false }
);
const Drawer = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.Drawer),
  { ssr: false }
);

const App: React.FC = () => {
  const allUsers: User[] = [
    {
      id: 1,
      name: "Admin",
      email: "admin@email.com",
      role: "Editor",
    },
    {
      id: 2,
      name: "Signer 1",
      email: "signer1@email.com",
      role: "Signer",
    },
  ];
  const [currUser, setCurrUser] = useState(allUsers[0]);

  const aiName = "AI";
  const initMessages = [
    {
      type: "PLAIN",
      text: "Welcome to the PSPDFKit Sign App! Ask me anything about the code, like “How do I set the signees?",
      sender: aiName,
      canCopy: true,
      isComplete: true,
      id: "1",
    },
  ];
  const [messages, setMessages] = useState([...initMessages]);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  useEffect(() => {
    var PSPDFKit: any;
    (async function () {
      PSPDFKit = await import("pspdfkit");
      allUsers.forEach((user: any) => {
        user.color = PSPDFKit.Color.LIGHT_BLUE;
      });
    })();
    setTimeout(() => {
      //console.log("Setting current user to Signer");
      //setCurrUser(allUsers[1]);
    }, 0);
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ThemeProvider theme={"system"}>
      <I18nProvider locale="en-US">
        <DynamicSignComp allUsers={allUsers} user={currUser} />
        {/* <Drawer
          title="Ask AI (Beta)"
          style={{
            position: "absolute",
            bottom: 5,
            right: 5,
            border: "0.5px solid grey",
            borderRadius: "10px",
            width: "35vh",
            padding: "10px",
            boxShadow: "1px 1px 12px -8px black inset",
          }}
          onCloseRequest={() => {
            //alert("Closing Chat");
            setIsChatOpen(!isChatOpen);
          }}
        > */}
        <div
          style={{
            //overflow: "auto",
            position: "absolute",
            bottom: 10,
            right: 10,
            border: "0.5px solid grey",
            borderRadius: isChatOpen ? "10px" : "50%",
            width: isChatOpen ? "35vh" : "8vh",
            height: isChatOpen ? "70vh" : "8vh",
            padding: isChatOpen ? "10px" : "0px",
            boxShadow: "1px",
          }}
        >
          {isChatOpen ? (
            <div
              style={{
                position: "sticky",
                cursor: "pointer",
              }}
              onClick={() => {
                setIsChatOpen(!isChatOpen);
              }}
              className="heading-custom-style"
            >
              Ask AI (Beta) <span style={{ float: "right" }}>&times;</span>
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: isChatOpen ? "10px" : "50%",
                width: isChatOpen ? "35vh" : "8vh",
                height: isChatOpen ? "60vh" : "8vh",
                backgroundColor: "#4537de ",
              }}
              onClick={() => {
                setIsChatOpen(!isChatOpen);
              }}
            >
              {chatBotSVG}
            </div>
          )}
          {isChatOpen && (
            <ChatDialog
              style={{ height: "62vh", width: "100%", overflow: "auto" }}
              //@ts-ignore
              messages={messages}
              onInputChanged={async function Da(inp) {
                //console.log("Input Changed : ",inp);
              }}
              onMessageSubmit={async function Da(inp) {
                console.log("Message Submitted : ", inp);

                const newMessage = {
                  type: "PLAIN",
                  text: inp,
                  sender: "You",
                  isComplete: true,
                  canCopy: true,
                  id: Math.random().toString(),
                };

                setMessages([...messages, newMessage]);
                const newAIMessage: AIMessage = {
                  role: "user",
                  content: inp,
                };
                await askAI([...aiMessages, newAIMessage]).then((res) => {
                  if (res) {
                    setAiMessages([
                      ...aiMessages,
                      { role: "user", content: inp },
                      res["choices"][0]["message"],
                    ]);
                    setMessages([
                      ...messages,
                      newMessage,
                      {
                        type: "PLAIN",
                        text: res["choices"][0]["message"]["content"],
                        sender: aiName,
                        isComplete: true,
                        canCopy: true,
                        id: Math.random().toString(),
                      },
                    ]);
                  }
                });
                // const inputBox = document.querySelector(`[aria-label="Editing Area"]`) as HTMLInputElement;
                // if (inputBox) inputBox.value = '';
              }}
            />
          )}
        </div>

        {/* </Drawer> */}
      </I18nProvider>
    </ThemeProvider>
  );
};
export default dynamic(() => Promise.resolve(App), { ssr: false });
