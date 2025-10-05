function speak(text, voice = "BV075_streaming") {
  if (!text) return;
  if (!voice) voice = "BV075_streaming";
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
      console.log(`[Bot Speaking] [${voice}] ${text}`);
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
            let message = node.querySelector("#message")?.innerText;
            let author = node.querySelector("#author-name")?.innerText;
            console.log(`[${author}] ${message}`);


            // Call your speak function
            let voice = null;
            let parsed = parseMessage(message);
            message=parsed.message;
            voice = parsed.voice;
            console.log(parsed)
            speak(message, voice);
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


const defaultvoices = ["BV075_streaming", "BV074_streaming"]; 

function parseMessage(message) {
    if (!message) return { message: '', voice: defaultvoices[Math.floor(Math.random() * defaultvoices.length)] };

    // Remove zero-width/invisible characters
    const cleaned = message.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

    let voice = null;
    let ttsMessage = cleaned;

    if (cleaned.toLowerCase().startsWith("!!tts")) {
        const content = cleaned.replace(/^!!tts\s*/i, '');
        const firstSpace = content.indexOf(' ');

        if (firstSpace !== -1) {
            const possibleVoice = content.substring(0, firstSpace).trim();
            const restMessage = content.substring(firstSpace + 1).trim();

            // If user-specified voice, return it
            voice = possibleVoice;
            ttsMessage = restMessage;
        } else {
            // Only !!tts without message → treat entire content as message
            ttsMessage = content;
        }
    } 

    // If no voice specified, pick random default
    if (!voice) {
        voice = defaultvoices[Math.floor(Math.random() * defaultvoices.length)];
    }

    return { message: ttsMessage, voice };
}
