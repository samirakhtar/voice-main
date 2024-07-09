import { useEffect, useRef, useState } from "react";
import "./App.css";
import axios from "axios";
import Markdown from "react-markdown";
import gfm from "remark-gfm";

function App() {
  const [chats, setChats] = useState<
    Array<{ id: number; message: string; isBot: boolean }>
  >([]);
  const pollRef = useRef<number>();
  const mediaRecorderRef = useRef<MediaRecorder>();
  const [voiceActive, setVoiceActive] = useState(false);
  const [inProcess, setInProcess] = useState(false);

  const fetchChats = async () => {
    const res = await axios.get("https://test-assistant.onrender.com/chats");
    setChats(res.data);
  };

  const startAudioRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();

    mediaRecorderRef.current.ondataavailable = (e) => {
      const audioBlob = e.data;
      setInProcess(true);
      axios
        .post("https://test-assistant.onrender.com/chat", audioBlob, {
          headers: {
            "Content-Type": "audio/opus",
          },
        })
        .then(() => {
          setInProcess(false);
          fetchChats();
        });
    };
  };

  const stopAudioRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  useEffect(() => {
    if (!pollRef.current) {
      pollRef.current = window.setInterval(() => {
        fetchChats();
      }, 10000);
    }

    fetchChats();
  }, []);

  return (
    <>
      <div className="w-screen h-screen bg-zinc-900 text-white">
        <div className="flex justify-center items-center py-4 relative">
          <h1 className="text-xl px-4 py-1">Disco Umbrella 😎</h1>
        </div>
        <div className="w-[70vw] h-[70vh] max-h-[70vh] overflow-auto mx-auto my-6 pt-4 px-4">
          {inProcess ? (
            <div className="flex justify-center items-center h-full">
              <div className="bg-blue-600 p-2 rounded-2xl">
                <p>Working on it...</p>
              </div>
            </div>
          ) : (
            chats.map((chat) =>
              !chat.isBot ? (
                <div
                  key={chat.id}
                  className="flex justify-end items-center pt-2"
                >
                  <div className="bg-blue-600 p-2 rounded-2xl">
                    <p>{chat.message}</p>
                  </div>
                </div>
              ) : (
                <div
                  key={chat.id}
                  className="flex justify-start max-w-[50vw] items-center pt-2"
                >
                  <div className=" p-2 rounded-2xl">
                    <Markdown remarkPlugins={[gfm]}>{chat.message}</Markdown>
                  </div>
                </div>
              ),
            )
          )}
        </div>
        <div className="justify-center items-center gap-12 flex">
          <div
            className="rounded-full bg-neutral-700 p-6 cursor-pointer"
            onClick={() => {
              setVoiceActive((active) => !active);
              if (voiceActive) {
                stopAudioRecording();
              } else {
                startAudioRecording();
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke={voiceActive ? "red" : "white"}
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
          </div>
          <div>
            <button
              className="rounded-full bg-neutral-700 p-6 cursor-pointer"
              onClick={() => {
                axios
                  .delete("https://test-assistant.onrender.com/chats")
                  .then(() => {
                    fetchChats();
                  });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
