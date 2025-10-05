function speak(text, voice = "BV075_streaming") {
  if (!text) return;
  fetch("https://ottsy.weilbyte.dev/api/generation", {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      text: text,
      voice: voice
    })
  })
    .then((res) => res.json())
    .then((json) => {
      var audio = new Audio();
      audio.src = "data:audio/mpeg;base64," + json.data;
      audio.play();
      console.log(`Speaking ${text}`);
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to generate TTS.");
    })
    .finally(() => {});
}

const chatApp = document.querySelector("yt-live-chat-app");

if (chatApp) {
  // Create a MutationObserver to watch for new messages
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          // Element node
          const tagName = node.tagName.toLowerCase();

          if (tagName === "yt-live-chat-text-message-renderer") {
            const message = node.querySelector("#message")?.innerText;
            const author = node.querySelector("#author-name")?.innerText;
            console.log(`[${author}] ${message}`);

            //////////////////////
            if (!message) return;

            const voices = ["BV075_streaming", "BV074_streaming"];
            let voice;
            let ttsMessage;

            if (message.trim().toLowerCase().startsWith("!tts")) {
              // !tts message → random voice
              ttsMessage = message.replace(/^!tts\s*/i, "");
              voice = voices[Math.floor(Math.random() * voices.length)];
            } else if (message.trim().toLowerCase().startsWith("!!tts")) {
              // !!tts voice message → specific voice
              const parts = message.replace(/^!!tts\s*/i, "").split(/\s+/);
              const specifiedVoice = parts[0];
              ttsMessage = parts.slice(1).join(" ");
              voice = voices.includes(specifiedVoice)
                ? specifiedVoice
                : voices[Math.floor(Math.random() * voices.length)];
            } else {
              // any other message → speak normally with random voice
              ttsMessage = message;
              voice = voices[Math.floor(Math.random() * voices.length)];
            }

            speak(ttsMessage, voice);
            //////////////////////
          }
        }
      }
    }
  });

  observer.observe(chatApp, { childList: true, subtree: true });
  console.log("Observing live chat messages...");
} else {
  console.warn("yt-live-chat-app container not found!");
}
