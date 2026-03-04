import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: any;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private onMessageCallback: (msg: any) => void;
  private onStatusCallback: (status: string) => void;

  constructor(onMessage: (msg: any) => void, onStatus: (status: string) => void, apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is missing");
    this.ai = new GoogleGenAI({ apiKey: key });
    this.onMessageCallback = onMessage;
    this.onStatusCallback = onStatus;
  }

  async connect() {
    this.onStatusCallback("Connecting...");
    
    this.session = await this.ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: `You are EcommerceCo AI, a world-class senior software engineer and product designer. 
        You help users build and deploy applications. 
        You communicate primarily via voice. 
        When you write code, use the 'write_code' tool. 
        The user wants you to be like Cursor but with voice. 
        Be professional, concise, and helpful.`,
        tools: [
          {
            functionDeclarations: [
              {
                name: "write_code",
                description: "Updates or creates a code file in the workspace.",
                parameters: {
                  type: "OBJECT" as any,
                  properties: {
                    filename: { type: "STRING" as any, description: "The name of the file." },
                    content: { type: "STRING" as any, description: "The full content of the file." },
                    language: { type: "STRING" as any, description: "The programming language." },
                  },
                  required: ["filename", "content", "language"],
                },
              },
            ],
          },
        ],
      },
      callbacks: {
        onopen: () => {
          this.onStatusCallback("Connected");
          this.startAudioCapture();
        },
        onmessage: (message: LiveServerMessage) => {
          this.handleMessage(message);
        },
        onclose: () => {
          this.onStatusCallback("Disconnected");
          this.stopAudioCapture();
        },
        onerror: (error) => {
          console.error("Live API Error:", error);
          this.onStatusCallback("Error: " + error.message);
        },
      },
    });
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle audio output
    if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
      const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
      this.playAudio(base64Audio);
    }

    // Handle tool calls
    if (message.toolCall) {
      for (const call of message.toolCall.functionCalls) {
        if (call.name === "write_code") {
          this.onMessageCallback({ type: "code", data: call.args });
          // Send response back to model
          this.session.sendToolResponse({
            functionResponses: [{
              name: "write_code",
              id: call.id,
              response: { success: true, message: `File ${call.args.filename} updated.` }
            }]
          });
        }
      }
    }

    // Handle transcription
    if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
      this.onMessageCallback({ type: "text", data: message.serverContent.modelTurn.parts[0].text });
    }
  }

  private async startAudioCapture() {
    try {
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(stream);

      // We need a simple processor to convert to PCM
      // For simplicity in this demo, we'll use a ScriptProcessorNode (deprecated but easier for quick setup)
      // or better, a custom AudioWorklet if we had more time.
      // Let's use a simple ScriptProcessor for now as it's more straightforward for a quick build.
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(this.audioContext.destination);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Base64 encode
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        
        if (this.session) {
          this.session.sendRealtimeInput({
            media: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
          });
        }
      };
    } catch (err) {
      console.error("Audio capture error:", err);
    }
  }

  private stopAudioCapture() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private async playAudio(base64Data: string) {
    if (!this.audioContext) return;
    
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // PCM 16-bit to Float32
    const pcmData = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = this.audioContext.createBuffer(1, float32Data.length, 16000);
    buffer.getChannelData(0).set(float32Data);
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  disconnect() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    this.stopAudioCapture();
  }
}
