"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider";
import Visualizer from "./Visualizer";
import classNames from "classnames";

interface FormFields {
  notes: string;
  comments: string;
  summary: string;
}

const App: () => JSX.Element = () => {
  const [fields, setFields] = useState<FormFields>({
    notes: "",
    comments: "",
    summary: "",
  });
  const [activeField, setActiveField] = useState<keyof FormFields | null>(null);
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, microphoneState } =
    useMicrophone();
  const keepAliveInterval = useRef<any>();

  useEffect(() => {
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-3-medical",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e: BlobEvent) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close. 
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal } = data;
      const transcript = data.channel.alternatives[0].transcript;
      
      if (activeField && transcript && isFinal) {
        setFields(prev => ({
          ...prev,
          [activeField]: prev[activeField] + (prev[activeField] ? ' ' : '') + transcript
        }));
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();
    }

    return () => {
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, activeField]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
  }, [connection, connectionState, microphoneState]);

  const handleFieldFocus = (field: keyof FormFields) => {
    if (microphone && microphoneState === MicrophoneState.Open) {
      microphone.stop();
    }
    setActiveField(field);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold mb-6">Voice-to-Text Form</h1>
        
        <div className="space-y-4">
          {Object.keys(fields).map((field) => (
            <div key={field} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {field}
              </label>
              <textarea
                value={fields[field as keyof FormFields]}
                onChange={(e) =>
                  setFields((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                onFocus={() => handleFieldFocus(field as keyof FormFields)}
                className={classNames(
                  "w-full p-3 border rounded-lg min-h-[100px] transition-all duration-200",
                  {
                    "border-blue-500 ring-2 ring-blue-200": activeField === field,
                    "border-gray-300": activeField !== field,
                  }
                )}
                placeholder={`Click here and start speaking to add ${field}...`}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          {activeField ? (
            <p>Currently transcribing to: <span className="font-medium capitalize">{activeField}</span></p>
          ) : (
            <p>Click on a field to start transcribing</p>
          )}
        </div>

        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          {microphone && <Visualizer microphone={microphone} />}
        </div>
      </div>
    </div>
  );
};

export default App;
