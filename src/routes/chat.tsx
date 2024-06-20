import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { API } from "aws-amplify";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Conversation } from "../common/types";
import ChatMessages from "../components/ChatMessages";

const Document: React.FC = () => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const params = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageStatus, setMessageStatus] = useState<string>("idle");
  const conversationListStatus = useRef<"idle" | "loading">("idle"); // Use useRef instead of useState
  const [prompt, setPrompt] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(false); // State for chat visibility

  const fetchData = async (conversationid = params.conversationid) => {
    const conversation = await API.get(
      "serverless-pdf-chat",
      `/doc/${params.documentid}/${conversationid}`,
      {}
    );

    setConversation(conversation);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const addConversation = async () => {
    conversationListStatus.current = "loading";
    const newConversation = await API.post(
      "serverless-pdf-chat",
      `/doc/${params.documentid}`,
      {}
    );
    fetchData(newConversation.conversationid);
    navigate(`/doc/${params.documentid}/${newConversation.conversationid}`);
    conversationListStatus.current = "idle";
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == "Enter") {
      submitMessage();
    }
  };

  const submitMessage = async () => {
    setMessageStatus("loading");

    if (conversation !== null) {
      const previewMessage = {
        type: "text",
        data: {
          content: prompt,
          additional_kwargs: {},
          example: false,
        },
      };

      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, previewMessage],
      };

      setConversation(updatedConversation);
    }

    await API.post(
      "serverless-pdf-chat",
      `/${conversation?.document.documentid}/${conversation?.conversationid}`,
      {
        body: {
          fileName: conversation?.document.filename,
          prompt: prompt,
        },
      }
    );
    setPrompt("");
    fetchData(conversation?.conversationid);
    setMessageStatus("idle");
  };

  const toggleChatVisibility = () => {
    if (!isChatVisible) addConversation();
    setIsChatVisible((prev) => !prev);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <h1 className="font-bold text-3xl mb-10 mt-8">
          Manual Pengguna SISPAA
        </h1>
        <h2 className="font-bold text-xl mb-2">Pengenalan</h2>
        <p>
          Manual pengguna ini adalah sumber utama anda untuk semua yang anda
          perlu tahu tentang SISPAA. Sama ada anda pengguna baru atau ingin
          meneroka ciri-ciri lanjutan, manual ini menyediakan segala panduan
          untuk anda.
        </p>
        <h2 className="font-bold text-xl mb-2 mt-4">
          Gambaran Keseluruhan Manual
        </h2>
        <ul className="list-disc ml-4">
          <li>Pengenalan: Pelajari cara mengisi borang SISPAA.</li>
          <li>
            Antara Muka Pengguna: Panduan terperinci tentang ciri-ciri dan
            navigasi SISPAA.
          </li>
          <li>
            Penyelesaian Masalah: Penyelesaian kepada masalah biasa dan Soalan
            Lazim.
          </li>
        </ul>
        <h2 className="font-bold text-xl mt-4 mb-2">
          Kelebihan Menggunakan Manual
        </h2>
        <p>
          Manual pengguna ini direka untuk menjadi komprehensif dan mudah
          dinavigasi, memastikan anda mempunyai semua maklumat yang diperlukan
          berkaitan SISPAA di hujung jari anda.
        </p>
      </div>
      <div className="flex-1 mt-8">
        <div className="h-[75vh]">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
          >
            <Viewer
              fileUrl="/Manual-SISPAA.pdf"
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
        </div>
      </div>
      <div>
        <button
          onClick={toggleChatVisibility}
          className="rounded-full p-3 fixed bottom-10 right-10 text-white bg-orange-600 shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 z-20"
        >
          <svg
            width={28}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.337 21.718a6.707 6.707 0 0 1-.533-.074.75.75 0 0 1-.44-1.223 3.73 3.73 0 0 0 .814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 0 1-4.246.997Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {isChatVisible && conversation && (
        <div className="fixed bottom-10 right-28 height-[200px] overflow-auto sm:w-3/4 md:w-1/2 lg:w-1/3 border border-gray-200 rounded-lg z-10 bg-white p-4 shadow-lg">
          {/* <ChatSidebar
            conversation={conversation}
            params={params}
            addConversation={addConversation}
            switchConversation={switchConversation}
            conversationListStatus={conversationListStatus}
          /> */}
          <ChatMessages
            prompt={prompt}
            conversation={conversation}
            messageStatus={messageStatus}
            submitMessage={submitMessage}
            handleKeyPress={handleKeyPress}
            handlePromptChange={handlePromptChange}
          />
        </div>
      )}
    </div>
  );
};

export default Document;
